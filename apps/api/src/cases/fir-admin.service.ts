import {BadRequestException,ConflictException,ForbiddenException,Inject,Injectable} from '@nestjs/common';
import {z} from 'zod';
import {DOCUMENT_URL_SECONDS,FirRejectSchema,FirReassignSchema,FirIdentityReviewSchema,FirLifecycleTokenSchema,FIR_REASSIGNED_CLIENT,type FirLifecycleToken} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import {lockedCase,appendCaseEvent,writeFirReviewState,writeFirFlowTransition} from './case-state-machine';
import {checkFirToken,ensureFirLifecycle,firCorrectionState,firLifecycleView} from './fir-lifecycle';
import {requireFirIdentity} from '../documents/fir-identity';
import {DocumentService} from '../documents/document.service';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import type {CaseActor} from './case-access';
import type {Prisma} from '../generated/prisma/client';
@Injectable()
export class FirAdminService {
 constructor(private readonly prisma:PrismaService,private readonly documents:DocumentService,@Inject(NOTIFICATIONS) private readonly notifications:NotificationsPort){}
 async read(actor:CaseActor,id:string){const db=await this.prisma.getClient();return db.$transaction(async tx=>firLifecycleView(tx,await lockedCase(tx,actor,id,'fir_draft'),actor.role==='client'));}
 private admin(actor:CaseActor){if(actor.role!=='admin')throw new ForbiddenException('Admin review required');}
 private async event(tx:Prisma.TransactionClient,actor:CaseActor,id:string,type:string,payload:Prisma.InputJsonValue){
  await appendCaseEvent(tx,{case_id:id,type,actor_id:actor.id,actor_role:actor.role,payload});
  if(actor.role==='admin')await tx.adminAction.create({data:{admin_id:actor.id,action:type==='fir_draft_approved'?'approve_fir_draft':type,subject_type:'case',subject_id:id,payload}});
 }
 private async invalidateIdentity(tx:Prisma.TransactionClient,actor:CaseActor,id:string,submissionId:string,documentId:string){
  const doc=await tx.document.findFirst({where:{id:documentId,case_id:id,kind:'id_proof',status:'uploaded'}});if(!doc)throw new ConflictException('Identity document changed. Reload.');
  await tx.document.update({where:{id:doc.id},data:{status:'deleted'}});
  return tx.firIdentityReturn.create({data:{case_id:id,submission_id:submissionId,document_id:doc.id,rejected_by:actor.id,purge_after:new Date(Date.now()+DOCUMENT_URL_SECONDS*1000)}});
 }
 async reject(actor:CaseActor,id:string,body:unknown){this.admin(actor);const input=parse(FirRejectSchema,body),db=await this.prisma.getClient();
  await db.$transaction(async tx=>{const c=await lockedCase(tx,actor,id,'fir_draft'),{life}=await ensureFirLifecycle(tx,c);checkFirToken(life,input);
   const sub=life.current_submission_id?await tx.firSubmission.findUnique({where:{id:life.current_submission_id}}):null;
   if(!sub||sub.state!=='pending'||c.sub_status!=='awaiting_admin_approval')throw new ConflictException('No current submission awaits review.');
   if(input.identity_document_id)await this.invalidateIdentity(tx,actor,id,sub.id,input.identity_document_id);
   await tx.firSubmission.update({where:{id:sub.id},data:{state:'returned',draft_reason:input.draft_reason??null,decided_by:actor.id,decided_at:new Date()}});
   await tx.draftReview.create({data:{draft_id:sub.draft_id,reviewer_id:actor.id,reviewer_role:'admin',decision:input.draft_reason?'changes_requested':'identity_rejected',comment:input.draft_reason??'Unmasked Aadhaar; replacement required.'}});
   await tx.firLifecycle.update({where:{case_id:id},data:{revision:{increment:1}}});
   await writeFirReviewState(tx,actor,id,{status:'changes_requested',sub_status:await firCorrectionState(tx,id),updated_at:new Date()});
   await this.event(tx,actor,id,'fir_admin_returned',{submission_id:sub.id,draft_id:sub.draft_id,version:sub.version,draft_reason:input.draft_reason??null,identity_rejected:!!input.identity_document_id});
   if(input.draft_reason&&c.advocate_id)await this.notifications.send(tx,{user_id:c.advocate_id,case_id:id,kind:'fir_draft_returned',title:`FIR draft v${sub.version} returned`,body:input.draft_reason});
   if(input.identity_document_id)await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'fir_identity_required',title:'Replace your identity document',body:'Full Aadhaar is not accepted. Upload the UIDAI masked version or another accepted identity document.'});
   else await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'fir_revision_progress',title:'Your draft is being revised',body:'Your draft is being revised following our review. No action is needed from you.'});
  });
  if(input.identity_document_id)await this.documents.purgeRejectedIdentity(input.identity_document_id);
  return this.read(actor,id);
 }
 async replaceIdentity(actor:CaseActor,id:string,body:unknown){if(actor.role!=='client')throw new ForbiddenException('Case client required');
  const input=parse(z.strictObject({revision:z.number().int().nonnegative(),return_id:z.uuid(),document_id:z.uuid()}),body),db=await this.prisma.getClient();
  await db.$transaction(async tx=>{const c=await lockedCase(tx,actor,id,'fir_draft'),{life}=await ensureFirLifecycle(tx,c);if(input.revision!==life.revision)throw new ConflictException('Identity request changed. Reload.');
   const request=await tx.firIdentityReturn.findFirst({where:{id:input.return_id,case_id:id,state:'replacement_required'}});if(!request||!['assigned','advocate_accepted','in_progress','changes_requested'].includes(c.status))throw new ConflictException('No replacement is required.');
   await requireFirIdentity(tx,id,input.document_id);
   const doc=await tx.document.findUniqueOrThrow({where:{id:input.document_id}});if(doc.owner_id!==actor.id||doc.created_at<request.rejected_at)throw new BadRequestException('Choose the new identity document you uploaded for this request.');
   await tx.firIdentityReturn.update({where:{id:request.id},data:{replacement_document_id:doc.id,state:'review_pending'}});
   await tx.firLifecycle.update({where:{case_id:id},data:{revision:{increment:1}}});
   await writeFirReviewState(tx,actor,id,{sub_status:await firCorrectionState(tx,id),updated_at:new Date()});
   await this.event(tx,actor,id,'fir_identity_replaced',{request_id:request.id,document_id:doc.id});
   for(const admin of await tx.user.findMany({where:{role:'admin',status:'active'}}))await this.notifications.send(tx,{user_id:admin.id,case_id:id,kind:'fir_identity_review',title:'Replacement identity needs review',body:c.reference});
  });return this.read(actor,id);
 }
 async identityReview(actor:CaseActor,id:string,body:unknown){this.admin(actor);const input=parse(FirIdentityReviewSchema,body),db=await this.prisma.getClient();
  await db.$transaction(async tx=>{const c=await lockedCase(tx,actor,id,'fir_draft'),{life}=await ensureFirLifecycle(tx,c);checkFirToken(life,input);
   const sub=life.current_submission_id?await tx.firSubmission.findUnique({where:{id:life.current_submission_id}}):null;if(!sub||['completed','cancelled','refunded'].includes(c.status))throw new ConflictException('No active identity review.');
   const replacement=await tx.firIdentityReturn.findFirst({where:{case_id:id,replacement_document_id:input.document_id,state:'review_pending'}});
   if(!replacement&&(sub.state!=='pending'||sub.identity_document_id!==input.document_id))throw new ConflictException('This is not the current identity evidence.');
   if(input.decision==='unmasked_aadhaar'){
    if(!replacement)throw new BadRequestException('Use Return to reject the submitted identity document.');
    await tx.firIdentityReturn.update({where:{id:replacement.id},data:{state:'superseded',reviewed_by:actor.id,reviewed_at:new Date()}});
    await this.invalidateIdentity(tx,actor,id,sub.id,input.document_id);
    await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'fir_identity_required',title:'Replace your identity document',body:'The replacement is unmasked Aadhaar. Upload the UIDAI masked version or another accepted identity document.'});
   }else{
    await requireFirIdentity(tx,id,input.document_id);
    if(replacement){await tx.firIdentityReturn.update({where:{id:replacement.id},data:{state:'accepted',reviewed_by:actor.id,reviewed_at:new Date()}});
     if(c.advocate_id)await this.notifications.send(tx,{user_id:c.advocate_id,case_id:id,kind:'fir_identity_accepted',title:'Replacement identity accepted',body:'Select the replacement attachment and submit a new PDF version for admin review.'});
     await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'fir_identity_accepted',title:'Replacement identity accepted',body:'Your draft preparation can continue. No further action is needed from you.'});
    }else await tx.firSubmission.update({where:{id:sub.id},data:{identity_checked_by:actor.id,identity_checked_at:new Date()}});
   }
   await tx.firLifecycle.update({where:{case_id:id},data:{revision:{increment:1}}});
   if(replacement){const correction=await firCorrectionState(tx,id);await writeFirReviewState(tx,actor,id,{status:['assigned','advocate_accepted'].includes(c.status)?c.status:correction?'changes_requested':'in_progress',sub_status:correction,updated_at:new Date()});}
   await this.event(tx,actor,id,'fir_identity_reviewed',{document_id:input.document_id,decision:input.decision});
  });if(input.decision==='unmasked_aadhaar')await this.documents.purgeRejectedIdentity(input.document_id);return this.read(actor,id);
 }
 async reassign(actor:CaseActor,id:string,body:unknown){this.admin(actor);const input=parse(FirReassignSchema,body),db=await this.prisma.getClient();
  await db.$transaction(async tx=>{const c=await lockedCase(tx,actor,id,'fir_draft'),{life,assignment,policy}=await ensureFirLifecycle(tx,c);checkFirToken(life,input);
   if(!assignment||!['changes_requested','in_progress'].includes(c.status))throw new ConflictException('This case cannot be reassigned now.');
   const count=await tx.firSubmission.count({where:{assignment_id:assignment.id,state:'returned',draft_reason:{not:null}}});if(count<policy.reassign_after_draft_rejections)throw new ConflictException('Reassignment is available after the required draft rejections.');
   if(input.advocate_id===c.advocate_id)throw new BadRequestException('Choose a different advocate.');
   const next=await tx.user.findFirst({where:{id:input.advocate_id,role:'advocate',status:'active',advocate_profiles_user_id_relations:{is:{verification:'approved'}}}});if(!next)throw new BadRequestException('Choose an active approved advocate.');
   await tx.caseAssignment.update({where:{id:assignment.id},data:{ended_at:new Date(),end_reason:'admin_reassignment_after_draft_rejections: '+input.reason}});
   await tx.caseAssignment.create({data:{case_id:id,advocate_id:next.id,assigned_by:actor.id}});
   await tx.firSubmission.updateMany({where:{case_id:id,state:'pending'},data:{state:'withdrawn',decided_by:actor.id,decided_at:new Date()}});
   await tx.firLifecycle.update({where:{case_id:id},data:{revision:{increment:1}}});
   await writeFirReviewState(tx,actor,id,{advocate_id:next.id,status:'assigned',sub_status:await firCorrectionState(tx,id),updated_at:new Date()});
   await this.event(tx,actor,id,'fir_advocate_reassigned',{previous_assignment_id:assignment.id,advocate_id:next.id,reason:input.reason});
   // Standalone notification deliberately survives removal of case access and
   // has no dead case link. It contains only the reference and outcome.
   await this.notifications.send(tx,{user_id:assignment.advocate_id,kind:'fir_reassigned_away',title:'FIR case reassigned',body:`${c.reference} has been reassigned to another advocate. You no longer have access to this case.`});
   await this.notifications.send(tx,{user_id:next.id,case_id:id,kind:'case_assigned',title:'FIR case assigned to you',body:c.reference});
   await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'fir_reassigned',title:'New advocate assigned',body:FIR_REASSIGNED_CLIENT});
  });return this.read(actor,id);
 }
 async approve(actor:CaseActor,id:string,draftId:string,body:unknown){this.admin(actor);const input=parse(FirLifecycleTokenSchema,body),db=await this.prisma.getClient();
  return db.$transaction(async tx=>{const c=await lockedCase(tx,actor,id,'fir_draft'),{life,assignment}=await ensureFirLifecycle(tx,c);
   const sub=life.current_submission_id?await tx.firSubmission.findUnique({where:{id:life.current_submission_id}}):null;
   if(sub?.state==='approved'&&c.status!=='in_progress'&&sub.draft_id===draftId&&input.submission_id===sub.id)return c;
   checkFirToken(life,input);
   if(!sub||sub.state!=='pending'||sub.draft_id!==draftId||sub.assignment_id!==assignment?.id||c.sub_status!=='awaiting_admin_approval')throw new ConflictException('This is not the current submission. Reload.');
   if(!sub.identity_checked_at||!sub.identity_document_id)throw new ConflictException('Review and accept the uploaded identity document first.');
   await requireFirIdentity(tx,id,sub.identity_document_id);
   if(await tx.firIdentityReturn.count({where:{case_id:id,state:{in:['replacement_required','review_pending']}}}))throw new ConflictException('Identity corrections remain outstanding.');
   const doc=await tx.document.findFirst({where:{id:sub.document_id,case_id:id,status:'uploaded',kind:'fir_draft'}});if(!doc)throw new ConflictException('Submitted PDF unavailable.');
   const payment=await tx.payment.findFirst({where:{case_id:id,status:'captured',purpose:'service_fee'},include:{quote:true},orderBy:{captured_at:'asc'}});
   const breakdown=(payment?.quote?.snapshot as {breakdown?:{advocate_entitlement_paise?:string}}|undefined)?.breakdown;
   if(!breakdown?.advocate_entitlement_paise)throw new ConflictException('Captured advocate entitlement is unavailable. Resolve pricing before completion.');
   await tx.firSubmission.update({where:{id:sub.id},data:{state:'approved',decided_by:actor.id,decided_at:new Date()}});
   await tx.firLifecycle.update({where:{case_id:id},data:{revision:{increment:1},completing_assignment_id:assignment!.id,advocate_entitlement_paise:BigInt(breakdown.advocate_entitlement_paise),commission_rate_id:payment!.quote!.commission_rate_id}});
   await tx.draftReview.create({data:{draft_id:draftId,reviewer_id:actor.id,reviewer_role:'admin',decision:'approved'}});
   await this.event(tx,actor,id,'fir_draft_approved',{submission_id:sub.id,draft_id:draftId,document_id:doc.id,version:sub.version});
   // Flow A5/C11: the admin approves before the client sees the draft; the client then approves or asks for changes.
   const sent=await writeFirFlowTransition(tx,actor,id,{to:'client_review',sub_status:null},'fir_sent_to_client',{draft_id:draftId,document_id:doc.id,version:sub.version});
   await this.notifications.send(tx,{user_id:c.client_id,case_id:id,kind:'fir_ready',title:'Your FIR draft is ready to review',body:`${c.reference}: approve it or request changes.`});
   await this.notifications.send(tx,{user_id:assignment!.advocate_id,case_id:id,kind:'fir_approved',title:'Admin approved the FIR draft',body:`${c.reference} has been sent to the client for review.`});return sent;
  });
 }
}
