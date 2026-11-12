import {BadRequestException,ConflictException,ForbiddenException,Inject,Injectable} from '@nestjs/common';
import {
  FIR_AWAITING_POLICE,FIR_CLIENT_CHANGES,FIR_CHANGE_ATTACHMENT_KIND,FIR_POLICE_RECEIPT_KIND,FIR_REMIND_HOURS,
  FirAdvocateRejectSchema,FirClientApproveSchema,FirClientChangesSchema,FirPoliceSubmissionSchema,FirSettingsSchema,
  firIntakeDetails,firSectionLabel,firStage,
  type FirFlowDocument,type FirFlowEvent,type FirFlowReview,type FirFlowView,type FirSettings,
} from '@legalitt/shared';
import type {Prisma,Case,Document} from '../generated/prisma/client';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import {appendCaseEvent,lockedCase,writeFirFlowTransition} from './case-state-machine';
import {ensureFirLifecycle,firCorrectionState} from './fir-lifecycle';
import type {CaseActor} from './case-access';
import {FIR_EVENT_LABELS,firTeamEventLabel} from './fir-event-labels';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';

type Tx=Prisma.TransactionClient;
const doc=(d:Document):FirFlowDocument=>({id:d.id,filename:d.filename,mime_type:d.mime_type,size_bytes:d.size_bytes.toString(),page_count:d.page_count});
const hours=(h:number)=>h*3600_000;

// The client never sees the admin step or internal review events (C10).
const LABELS=FIR_EVENT_LABELS;
const CLIENT_EVENTS=new Set(['payment_captured','fir_sent_to_client','fir_released_to_client','fir_client_approved','fir_client_changes_requested','fir_police_submitted','case_cancelled','refund_recorded']);
const CLIENT_STATUS_LABELS:Record<string,string>={submitted:'Request submitted',assigned:'Drafting team assigned',completed:'Completed'};

@Injectable()
export class FirFlowService {
  constructor(private readonly prisma:PrismaService,@Inject(NOTIFICATIONS) private readonly notifications:NotificationsPort){}

  async settings(tx?:Tx):Promise<FirSettings>{
    const db=tx??await this.prisma.getClient();
    const row=await db.firSettings.findUnique({where:{id:1}});
    const policy=await db.firPolicy.findFirst({where:{effective_from:{lte:new Date()}},orderBy:{version:'desc'}});
    const config=(policy?.config??{}) as {turnaround_warning_hours?:number;turnaround_overdue_hours?:number};
    return {police_submission_by_advocate:row?.police_submission_by_advocate??true,
      turnaround:{min_hours:config.turnaround_warning_hours??24,max_hours:config.turnaround_overdue_hours??48}};
  }
  async updateSettings(actor:CaseActor,body:unknown){
    if(actor.role!=='admin')throw new ForbiddenException('Admin required');
    const input=parse(FirSettingsSchema,body),db=await this.prisma.getClient();
    await db.$transaction(async tx=>{
      await tx.firSettings.upsert({where:{id:1},create:{id:1,...input,updated_by:actor.id},update:{...input,updated_by:actor.id,updated_at:new Date()}});
      await tx.adminAction.create({data:{admin_id:actor.id,action:'fir_settings_updated',subject_type:'fir_settings',subject_id:actor.id,payload:input}});
    });
    return this.settings();
  }

  async view(actor:CaseActor,id:string){const db=await this.prisma.getClient();return db.$transaction(async tx=>this.build(tx,actor,await lockedCase(tx,actor,id,'fir_draft')));}

  private async build(tx:Tx,actor:CaseActor,c:Case):Promise<FirFlowView>{
    const isClient=actor.role==='client',settings=await this.settings(tx);
    const intake=firIntakeDetails(c.details,await tx.caseParty.findMany({where:{case_id:c.id}})) as {contact?:{fullName?:string;mobile?:string;email?:string};jurisdiction?:{policeStation?:string;district?:string;state?:string};place?:{city?:string};incident?:{type?:string}};
    const events=await tx.caseEvent.findMany({where:{case_id:c.id},orderBy:{id:'asc'}});
    const life=await tx.firLifecycle.findUnique({where:{case_id:c.id}});
    const submittedAt=events.find(e=>e.to_status==='submitted')?.created_at??null;
    const paid=await tx.payment.findFirst({where:{case_id:c.id,purpose:'service_fee',status:'captured'},include:{quote:true},orderBy:{captured_at:'asc'}});
    // Client draft: only what the admin approved and sent. Team: the latest generated version.
    const subs=await tx.firSubmission.findMany({where:{case_id:c.id},orderBy:{submitted_at:'desc'}});
    const sub=isClient?subs.find(s=>s.state==='approved'):subs[0];
    let draft:FirFlowView['draft']=null;
    if(sub){
      const [d,file]=await Promise.all([tx.draft.findUnique({where:{id:sub.draft_id}}),tx.document.findUnique({where:{id:sub.document_id}})]);
      if(d&&file&&file.status==='uploaded'){
        const author=await tx.user.findUnique({where:{id:d.created_by},select:{full_name:true}});
        const content=d.content as {legal_sections?:unknown[];attachments?:unknown[]};
        draft={draft_id:d.id,version:d.version,document:doc(file),created_by:author?.full_name??'Advocate',created_at:d.created_at.toISOString(),sections:content.legal_sections?.length??0,files:content.attachments?.length??0};
      }
    }
    const reviewRows=await tx.draftReview.findMany({where:{draft_id_relation:{is:{case_id:c.id}}},include:{draft_id_relation:{select:{version:true}},reviewer_id_relation:{select:{role:true}}},orderBy:{created_at:'asc'}});
    const attachments=await tx.document.findMany({where:{id:{in:reviewRows.flatMap(r=>r.attachment_document_id?[r.attachment_document_id]:[])}}});
    const reviews:FirFlowReview[]=reviewRows.map(r=>{
      const role=(r.reviewer_role??r.reviewer_id_relation.role)==='client'?'client':'admin';
      const a=attachments.find(x=>x.id===r.attachment_document_id);
      return {role,decision:r.decision==='approved'?'approved':role==='client'?'changes_requested':'returned',comment:r.comment,sections:r.sections,attachment:a&&a.status==='uploaded'?doc(a):null,version:r.draft_id_relation.version,created_at:r.created_at.toISOString()} as FirFlowReview;
    }).filter(r=>!isClient||r.role==='client');
    const police=await tx.firPoliceSubmission.findUnique({where:{case_id:c.id}});
    const receipt=police?await tx.document.findUnique({where:{id:police.receipt_document_id}}):null;
    let advocate:FirFlowView['advocate']=null;
    if(c.advocate_id&&!isClient||c.advocate_id&&!['assigned'].includes(c.status)){
      const u=await tx.user.findUnique({where:{id:c.advocate_id!},select:{id:true,full_name:true,advocate_profiles_user_id_relations:{select:{verification:true,photo_key:true}}}});
      if(u)advocate={id:u.id,name:u.full_name,verified:u.advocate_profiles_user_id_relations?.verification==='approved',photo_key:u.advocate_profiles_user_id_relations?.photo_key??null};
    }
    const reminded=[...events].reverse().find(e=>e.type==='fir_client_reminded')?.created_at??null;
    const next=reminded?new Date(reminded.getTime()+hours(FIR_REMIND_HOURS)):null;
    const eventView=(e:typeof events[number]):FirFlowEvent|null=>{
      const actorRole=(e.actor_role??'system') as FirFlowEvent['actor'];
      if(isClient){
        if(e.type==='status_changed'&&CLIENT_STATUS_LABELS[e.to_status??''])return {type:e.type,label:CLIENT_STATUS_LABELS[e.to_status!],actor:actorRole,created_at:e.created_at.toISOString()};
        if(!CLIENT_EVENTS.has(e.type))return null;
        return {type:e.type,label:e.type==='fir_sent_to_client'?'Draft ready for your review':e.type==='fir_released_to_client'?'Draft ready':e.type==='fir_client_approved'?'You approved the draft':e.type==='fir_client_changes_requested'?'You requested changes':LABELS[e.type],actor:actorRole,created_at:e.created_at.toISOString()};
      }
      // Why an advocate left a case, or was replaced, is for the admin only.
      const label=firTeamEventLabel(e,actor.role==='admin');
      return label?{type:e.type,label,actor:actorRole,created_at:e.created_at.toISOString()}:null;
    };
    const breakdown=(paid?.quote?.snapshot as {breakdown?:{advocate_entitlement_paise?:string|null}}|undefined)?.breakdown;
    return {case_id:c.id,reference:c.reference,status:c.status,sub_status:c.sub_status,stage:firStage(c),settings,
      created_at:c.created_at.toISOString(),submitted_at:submittedAt?.toISOString()??null,paid_at:(life?.paid_at??paid?.captured_at)?.toISOString()??null,completed_at:c.completed_at?.toISOString()??null,
      intake_step:c.status==='draft'?Math.max(1,Math.min(5,Number((c.details as {intake_step?:unknown}|null)?.intake_step)||1)):null,
      incident_type:intake.incident?.type||null,police_station:intake.jurisdiction?.policeStation||null,city:intake.place?.city||null,
      district:intake.jurisdiction?.district||null,state:intake.jurisdiction?.state||null,
      client:isClient?null:{name:intake.contact?.fullName||'Client',mobile:intake.contact?.mobile||null,email:intake.contact?.email||null,city:intake.place?.city||null},
      advocate,draft,reviews,
      police:police&&receipt?{submitted_on:police.submitted_on.toISOString().slice(0,10),receipt:doc(receipt),created_at:police.created_at.toISOString()}:null,
      remind:actor.role==='advocate'&&c.status==='client_review'?{allowed:!next||next.getTime()<=Date.now(),next_at:next?.toISOString()??null,last_at:reminded?.toISOString()??null}:null,
      share_paise:isClient?null:breakdown?.advocate_entitlement_paise??null,
      events:events.map(eventView).filter((e):e is FirFlowEvent=>!!e)};
  }

  private async currentApproved(tx:Tx,c:Case,draftId:string){
    const sub=await tx.firSubmission.findFirst({where:{case_id:c.id,state:'approved'},orderBy:{submitted_at:'desc'}});
    if(!sub||sub.draft_id!==draftId)throw new ConflictException('A newer draft is available. Reload to review it.');
    return sub;
  }
  private async notifyAdmins(tx:Tx,caseId:string,kind:string,title:string,body:string){
    for(const admin of await tx.user.findMany({where:{role:'admin',status:'active'},select:{id:true}}))await this.notifications.send(tx,{user_id:admin.id,case_id:caseId,kind,title,body});
  }

  /** C11 Approve → C14. With advocate police submission on, the case waits for the receipt (A6). */
  async clientApprove(actor:CaseActor,id:string,body:unknown){
    if(actor.role!=='client')throw new ForbiddenException('Case client required');
    const input=parse(FirClientApproveSchema,body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const c=await lockedCase(tx,actor,id,'fir_draft');
      if(c.status!=='client_review')throw new ConflictException('This draft is not waiting for your approval.');
      await this.currentApproved(tx,c,input.draft_id);
      const {police_submission_by_advocate:byAdvocate}=await this.settings(tx);
      await tx.draftReview.create({data:{draft_id:input.draft_id,reviewer_id:actor.id,reviewer_role:'client',decision:'approved'}});
      const done=await writeFirFlowTransition(tx,actor,id,byAdvocate?{to:'approved',sub_status:FIR_AWAITING_POLICE}:{to:'completed',sub_status:null},'fir_client_approved',{draft_id:input.draft_id,police_submission_by_advocate:byAdvocate});
      await tx.firLifecycle.update({where:{case_id:id},data:{revision:{increment:1}}});
      if(c.advocate_id)await this.notifications.send(tx,{user_id:c.advocate_id,case_id:id,kind:'fir_client_approved',title:'Client approved the FIR draft',
        body:byAdvocate?`${c.reference}: submit it at the police station and upload the receipt.`:`${c.reference} is complete.`});
      await this.notifyAdmins(tx,id,'fir_client_approved','Client approved an FIR draft',c.reference);
      return this.build(tx,actor,done);
    });
  }
  /** C12: sections, text and one optional attachment go to the advocate; the revision goes to the admin again. */
  async clientChanges(actor:CaseActor,id:string,body:unknown){
    if(actor.role!=='client')throw new ForbiddenException('Case client required');
    const input=parse(FirClientChangesSchema,body),db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const c=await lockedCase(tx,actor,id,'fir_draft');
      if(c.status!=='client_review')throw new ConflictException('This draft is not waiting for your review.');
      await this.currentApproved(tx,c,input.draft_id);
      if(input.attachment_document_id){
        const a=await tx.document.findFirst({where:{id:input.attachment_document_id,case_id:id,owner_id:actor.id,kind:FIR_CHANGE_ATTACHMENT_KIND,status:'uploaded'}});
        if(!a||await tx.draftReview.findFirst({where:{attachment_document_id:a.id}}))throw new BadRequestException('Attach a file you uploaded for this change request.');
      }
      await tx.draftReview.create({data:{draft_id:input.draft_id,reviewer_id:actor.id,reviewer_role:'client',decision:'changes_requested',comment:input.comment,sections:input.sections,attachment_document_id:input.attachment_document_id??null}});
      const updated=await writeFirFlowTransition(tx,actor,id,{to:'changes_requested',sub_status:FIR_CLIENT_CHANGES},'fir_client_changes_requested',{draft_id:input.draft_id,sections:input.sections});
      await tx.firLifecycle.update({where:{case_id:id},data:{revision:{increment:1}}});
      if(c.advocate_id)await this.notifications.send(tx,{user_id:c.advocate_id,case_id:id,kind:'fir_client_changes',title:'Client requested changes',
        body:`${c.reference}: ${input.sections.map(firSectionLabel).join(', ')}`});
      return this.build(tx,actor,updated);
    });
  }
  /** A2 Reject: the case returns to admin for reassignment and the advocate loses access. */
  async advocateReject(actor:CaseActor,id:string,body:unknown){
    if(actor.role!=='advocate')throw new ForbiddenException('Assigned advocate required');
    const input=parse(FirAdvocateRejectSchema,body),db=await this.prisma.getClient();
    await db.$transaction(async tx=>{
      const c=await lockedCase(tx,actor,id,'fir_draft');
      if(c.status!=='assigned')throw new ConflictException('Only a new request can be rejected.');
      const {assignment}=await ensureFirLifecycle(tx,c);
      if(assignment)await tx.caseAssignment.update({where:{id:assignment.id},data:{ended_at:new Date(),end_reason:'advocate_rejected'}});
      // A correction marker carried by a reassigned case survives the rejection, for the next advocate.
      const marker=(await firCorrectionState(tx,id))??(c.sub_status===FIR_CLIENT_CHANGES?FIR_CLIENT_CHANGES:null);
      await writeFirFlowTransition(tx,actor,id,{to:'advocate_declined',sub_status:marker,advocate_id:null},'fir_advocate_rejected',{reason:input.reason,assignment_id:assignment?.id??null});
      await tx.firLifecycle.update({where:{case_id:id},data:{revision:{increment:1}}});
      await this.notifyAdmins(tx,id,'fir_advocate_rejected','Advocate rejected an FIR request',`${c.reference}: ${input.reason}`);
    });
    return {rejected:true};
  }
  /** A6 Remind Client: in-app only, at most once every 24 hours. */
  async remindClient(actor:CaseActor,id:string){
    if(actor.role!=='advocate')throw new ForbiddenException('Assigned advocate required');
    const db=await this.prisma.getClient();
    return db.$transaction(async tx=>{
      const c=await lockedCase(tx,actor,id,'fir_draft');
      if(c.status!=='client_review')throw new ConflictException('The client isn’t reviewing a draft right now.');
      const last=await tx.caseEvent.findFirst({where:{case_id:id,type:'fir_client_reminded'},orderBy:{id:'desc'}});
      if(last&&last.created_at.getTime()+hours(FIR_REMIND_HOURS)>Date.now())throw new ConflictException(`You can remind the client again after ${new Date(last.created_at.getTime()+hours(FIR_REMIND_HOURS)).toISOString()}.`);
      await appendCaseEvent(tx,{case_id:id,type:'fir_client_reminded',actor_id:actor.id,actor_role:actor.role,payload:{}});
      await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'fir_review_reminder',title:'Your FIR draft is waiting for you',body:`${c.reference}: please approve it or request changes.`});
      return this.build(tx,actor,c);
    });
  }
  /** C14 / A6 Mark as submitted to police, with the receipt or acknowledgement. */
  async policeSubmitted(actor:CaseActor,id:string,body:unknown){
    if(actor.role!=='advocate')throw new ForbiddenException('Assigned advocate required');
    const input=parse(FirPoliceSubmissionSchema,body),db=await this.prisma.getClient();
    const today=new Date(Date.now()+330*60000).toISOString().slice(0,10);
    if(input.submitted_on>today)throw new BadRequestException('The submission date can’t be in the future.');
    return db.$transaction(async tx=>{
      const c=await lockedCase(tx,actor,id,'fir_draft');
      if(c.status!=='approved')throw new ConflictException('The client hasn’t approved this draft yet.');
      const approvedAt=(await tx.caseEvent.findFirst({where:{case_id:id,type:'fir_client_approved'},orderBy:{id:'desc'}}))?.created_at;
      if(approvedAt&&input.submitted_on<new Date(approvedAt.getTime()+330*60000).toISOString().slice(0,10))throw new BadRequestException('The submission date can’t be before the client approved the draft.');
      const receipt=await tx.document.findFirst({where:{id:input.receipt_document_id,case_id:id,owner_id:actor.id,kind:FIR_POLICE_RECEIPT_KIND,status:'uploaded'}});
      if(!receipt)throw new BadRequestException('Upload the police receipt or acknowledgement first.');
      await tx.firPoliceSubmission.create({data:{case_id:id,submitted_on:new Date(input.submitted_on+'T00:00:00Z'),receipt_document_id:receipt.id,marked_by:actor.id}});
      const done=await writeFirFlowTransition(tx,actor,id,{to:'completed',sub_status:null},'fir_police_submitted',{submitted_on:input.submitted_on,receipt_document_id:receipt.id});
      await tx.firLifecycle.update({where:{case_id:id},data:{revision:{increment:1}}});
      await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'fir_police_submitted',title:'Your FIR was submitted to the police',body:`${c.reference}: the police receipt is in your documents.`});
      await this.notifyAdmins(tx,id,'fir_police_submitted','FIR submitted to police',c.reference);
      return this.build(tx,actor,done);
    });
  }
}
