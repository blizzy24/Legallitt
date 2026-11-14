import {ConflictException,ForbiddenException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import {LegalAdviceConfigSchema,legalAdviceTierFor,legalAdviceSlotAllowed,redactPrivatePhones,matchesAdvicePractice} from '@legalitt/shared';
import {adviceData,adviceJson} from './legal-advice-rules';
import {z} from 'zod';
import {parse} from '../auth/auth.service';
import {acceptLegalAdviceCase} from '../cases/case-state-machine';
import type {CaseActor} from '../cases/case-access';
import {PrismaService} from '../prisma.service';
import type {Prisma} from '../generated/prisma/client';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import {lockPeople,inHours} from './consultation-rules';
import type {WeeklyInterval} from '@legalitt/shared';
import {DocumentStorage} from '../documents/document-storage';

async function lock(tx:Prisma.TransactionClient,id:string){
 await tx.$queryRaw`SELECT id FROM cases WHERE id=${id}::uuid FOR UPDATE`;
 const c=await tx.case.findFirst({where:{id,service_code:'legal_advice'}}),b=await tx.legalAdviceBooking.findUnique({where:{case_id:id}});
 if(!c||!b)throw new NotFoundException('Consultation not found');
 return {c,b};
}
@Injectable()
export class LegalAdviceInvitations {
 constructor(private readonly prisma:PrismaService,@Inject(NOTIFICATIONS) private readonly notifications:NotificationsPort,private readonly storage:DocumentStorage){}
 async inbox(actor:CaseActor){
  if(actor.role!=='advocate')throw new ForbiddenException('Advocate action required');
  const db=await this.prisma.getClient();
  // No client contact, private notes, document URL or unassigned case body.
  const rows=await db.legalAdviceInvitation.findMany({where:{advocate_id:actor.id},select:{id:true,case_id:true,state:true,expires_at:true,created_at:true},orderBy:{created_at:'desc'},take:100}),items=[];
  for(const row of rows){const b=await db.legalAdviceBooking.findUniqueOrThrow({where:{case_id:row.case_id}}),c=await db.case.findUniqueOrThrow({where:{id:row.case_id}}),data=adviceData(b.session),isPending=row.state==='pending'&&row.expires_at>new Date();
   items.push({...row,...isPending?{reference:c.reference,mode:b.mode,requested_at:b.requested_at,category:data.intake?.category??'General Consultation',description:data.intake?.description??'',client_name:(await db.user.findUniqueOrThrow({where:{id:c.client_id},select:{full_name:true}})).full_name,base_paise:(b.pricing_snapshot as {breakdown?:{advocate_entitlement_paise?:string}})?.breakdown?.advocate_entitlement_paise,documents:await db.document.findMany({where:{case_id:c.id,owner_id:c.client_id,status:'uploaded',kind:{not:'id_proof'}},select:{id:true,mime_type:true,page_count:true,size_bytes:true}})}:{}});
  }
  const phones=[];for(const row of rows){const c=await db.case.findUniqueOrThrow({where:{id:row.case_id},include:{client_id_relation:{select:{phone:true}}}});phones.push(c.client_id_relation.phone,(c.details as {phone?:string}).phone);}
  return redactPrivatePhones({items},phones);
 }
 async document(actor:CaseActor,invitationId:string,documentId:string){
  if(actor.role!=='advocate')throw new ForbiddenException('Advocate action required');
  const db=await this.prisma.getClient();return db.$transaction(async tx=>{
   const invitation=await tx.legalAdviceInvitation.findFirst({where:{id:invitationId,advocate_id:actor.id,state:'pending',expires_at:{gt:new Date()}}});if(!invitation)throw new NotFoundException('Document not found');
   const {c,b}=await lock(tx,invitation.case_id);if(b.accepted_advocate_id||!['paid','assigning','advocate_declined'].includes(c.status))throw new NotFoundException('Document not found');
   const doc=await tx.document.findFirst({where:{id:documentId,case_id:c.id,owner_id:c.client_id,status:'uploaded',kind:{not:'id_proof'}}});if(!doc)throw new NotFoundException('Document not found');
   const filename=doc.mime_type==='application/pdf'?'Consultation document.pdf':doc.mime_type==='image/png'?'Consultation image.png':'Consultation image.jpg';
   return {url:await this.storage.download(doc.s3_key,filename,true),document:{id:doc.id,kind:doc.kind,filename,mime_type:doc.mime_type,page_count:doc.page_count,size_bytes:doc.size_bytes.toString()},case:{id:c.id,reference:c.reference,service_code:c.service_code,client_name:(await tx.user.findUniqueOrThrow({where:{id:c.client_id},select:{full_name:true}})).full_name}};
  });
 }
 async assign(actor:CaseActor,id:string,body:unknown){
  if(actor.role!=='admin')throw new ForbiddenException('Admin action required');
  const input=parse(z.strictObject({expected_revision:z.number().int().nonnegative(),advocate_ids:z.array(z.uuid()).min(1).max(20).refine(a=>new Set(a).size===a.length),reason:z.string().trim().min(3).max(1000)}),body);
  const db=await this.prisma.getClient();return db.$transaction(async tx=>{
   const {c,b}=await lock(tx,id);
   if(b.revision!==input.expected_revision)throw new ConflictException('This consultation changed. Reload before assigning.');
   if(b.accepted_advocate_id||!['paid','assigning','advocate_declined'].includes(c.status))throw new ConflictException('Only paid unaccepted consultations can receive invitations.');
   const policy=await tx.legalAdvicePolicy.findUniqueOrThrow({where:{id:b.policy_id}}),config=LegalAdviceConfigSchema.parse(policy.config);
   if(!config.tariffs.some(t=>t.tier_code===b.tier_code&&t.mode===b.mode&&t.base_paise!==null))throw new ConflictException('This tier and mode has no configured price.');
   const now=new Date(),expires=new Date(now.getTime()+config.acceptance_minutes*60000);
   for(const advocateId of input.advocate_ids){
    const user=await tx.user.findFirst({where:{id:advocateId,role:'advocate',status:'active'},include:{advocate_profiles_user_id_relations:true}}),p=user?.advocate_profiles_user_id_relations;
    if(!p||p.verification!=='approved'||legalAdviceTierFor(p.years_experience,config.tiers)?.code!==b.tier_code)throw new ConflictException('Every invitee must be an approved advocate in the booked experience tier.');
    const category=adviceData(b.session).intake?.category??'General Consultation';
    if(!matchesAdvicePractice(category,p.practice_areas))throw new ConflictException('Choose advocates whose practice areas match the filing.');
    const hours=await tx.advocateAvailability.findFirst({where:{advocate_id:advocateId},orderBy:{version:'desc'}});
    if(hours&&b.requested_at&&!inHours(b.requested_at,config.session_minutes,hours.intervals as unknown as WeeklyInterval[]))throw new ConflictException('An invitee is outside their configured available hours. Choose another advocate.');
    if(await tx.legalAdviceInvitation.findFirst({where:{case_id:id,advocate_id:advocateId,state:'pending',expires_at:{gt:now}}}))continue;
    await tx.legalAdviceInvitation.updateMany({where:{case_id:id,advocate_id:advocateId,state:'pending'},data:{state:'expired',decided_at:now}});
    await tx.legalAdviceInvitation.create({data:{case_id:id,advocate_id:advocateId,assigned_by:actor.id,expires_at:expires}});
    await this.notifications.send(tx,{user_id:advocateId,kind:'legal_advice_invited',title:'Consultation invitation',body:'A consultation invitation is waiting in your requests.'});
   }
   await tx.legalAdviceBooking.update({where:{case_id:id},data:{revision:{increment:1},phase:'pending_acceptance',updated_at:now}});
   await tx.legalAdviceEvent.create({data:{case_id:id,actor_id:actor.id,kind:'advocates_invited',visibility:'internal',data:{advocate_ids:input.advocate_ids,reason:input.reason}}});
   return {assigned:true};
  });
 }
 async decide(actor:CaseActor,invitationId:string,body:unknown){
  if(actor.role!=='advocate')throw new ForbiddenException('Advocate action required');
  const input=parse(z.strictObject({decision:z.enum(['accept','decline']),reason:z.string().trim().max(1000).optional(),proposed_at:z.iso.datetime().optional()}),body);
  const db=await this.prisma.getClient();return db.$transaction(async tx=>{
   const invitation=await tx.legalAdviceInvitation.findFirst({where:{id:invitationId,advocate_id:actor.id}});
   if(!invitation)throw new NotFoundException('Invitation not found');
   const {c,b}=await lock(tx,invitation.case_id),now=new Date();
   const current=await tx.legalAdviceInvitation.findUniqueOrThrow({where:{id:invitationId}});
   if(current.state==='accepted'&&b.accepted_advocate_id===actor.id&&input.decision==='accept')return {accepted:true};
   if(current.state!=='pending'||current.expires_at<=now||b.accepted_advocate_id||!['paid','assigning','advocate_declined'].includes(c.status))throw new ConflictException('This invitation is no longer available.');
   if(input.decision==='decline'){
    await tx.legalAdviceInvitation.update({where:{id:invitationId},data:{state:'declined',reason:input.reason,decided_at:now}});
    await tx.legalAdviceEvent.create({data:{case_id:c.id,actor_id:actor.id,kind:'invitation_declined',visibility:'internal',data:{invitation_id:invitationId,reason:input.reason??''}}});
    return {accepted:false};
   }
   const user=await tx.user.findFirst({where:{id:actor.id,role:'advocate',status:'active'},include:{advocate_profiles_user_id_relations:true}}),p=user?.advocate_profiles_user_id_relations;
   const config=LegalAdviceConfigSchema.parse((await tx.legalAdvicePolicy.findUniqueOrThrow({where:{id:b.policy_id}})).config);
   if(!p||p.verification!=='approved'||legalAdviceTierFor(p.years_experience,config.tiers)?.code!==b.tier_code)throw new ConflictException('Your eligibility changed. Contact Legalitt support.');
   // A user lock also serializes acceptances for two different cases. The case
   // lock alone cannot prevent one advocate winning overlapping appointments.
   await lockPeople(tx,[actor.id,c.client_id]);
   const requested=input.proposed_at?new Date(input.proposed_at):b.requested_at;
   if(!requested)throw new ConflictException('No appointment was requested. Contact Legalitt.');
   if(input.proposed_at&&!legalAdviceSlotAllowed(requested.getTime(),config,Date.now()))throw new ConflictException('Propose a future platform slot.');
   if(requested<=now)throw new ConflictException('The requested appointment has passed. Ask Legalitt to arrange a new time.');
   const lower=new Date(requested.getTime()-config.session_minutes*60000),upper=new Date(requested.getTime()+config.session_minutes*60000);
   const clientCases=(await tx.case.findMany({where:{client_id:c.client_id},select:{id:true}})).map(c=>c.id);
   const collision=await tx.legalAdviceBooking.findFirst({where:{case_id:{not:c.id},OR:[{accepted_advocate_id:actor.id},{case_id:{in:clientCases}}],phase:{in:['confirmed','in_progress','paused']},confirmed_at:{gt:lower,lt:upper}}});
   const legacy=await tx.consultation.findFirst({where:{OR:[{advocate_id:actor.id},{client_id:c.client_id}],case_id:{not:c.id},status:{in:['scheduled','in_progress']},scheduled_at:{gt:lower,lt:upper},case_id_relation:{status:{notIn:['cancelled','refunded']}}}});
   if(collision||legacy)throw new ConflictException('This appointment overlaps another accepted consultation. Propose another time.');
   await tx.legalAdviceInvitation.update({where:{id:invitationId},data:{state:'accepted',decided_at:now}});
   const losers=await tx.legalAdviceInvitation.findMany({where:{case_id:c.id,state:'pending'}});
   await tx.legalAdviceInvitation.updateMany({where:{case_id:c.id,state:'pending'},data:{state:'superseded',decided_at:now}});
   const data=adviceData(b.session);
   if(input.proposed_at)data.proposal={at:input.proposed_at,reason:input.reason??'',created_at:now.toISOString(),by:'advocate'};
   await tx.legalAdviceBooking.update({where:{case_id:c.id},data:{accepted_advocate_id:actor.id,accepted_at:now,confirmed_at:input.proposed_at?null:b.requested_at,phase:input.proposed_at?'time_proposed':'confirmed',...(input.proposed_at?{session:adviceJson(data)}:{}),revision:{increment:1},updated_at:now}});
   await acceptLegalAdviceCase(tx,actor,c.id);
   await tx.consultation.create({data:{case_id:c.id,advocate_id:actor.id,client_id:c.client_id,mode:b.mode,scheduled_at:requested,duration_min:config.session_minutes,status:input.proposed_at?'time_proposed':'scheduled'}});
   await tx.legalAdviceEvent.create({data:{case_id:c.id,actor_id:actor.id,kind:'advocate_accepted',visibility:'public',data:{advocate_id:actor.id}}});
   await this.notifications.send(tx,{user_id:c.client_id,case_id:c.id,kind:input.proposed_at?'legal_advice_time_proposed':'legal_advice_confirmed',title:input.proposed_at?'New consultation time proposed':'Consultation confirmed'});
   for(const loser of losers)await this.notifications.send(tx,{user_id:loser.advocate_id,kind:'legal_advice_invitation_closed',title:'Consultation invitation closed',body:'Another advocate accepted this consultation. No action is needed.'});
   return {accepted:true};
  });
 }
}
