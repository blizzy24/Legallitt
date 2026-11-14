import {ConflictException,ForbiddenException,Inject,Injectable,NotFoundException} from '@nestjs/common';
import {LegalAdviceConfigSchema,legalAdviceTierFor} from '@legalitt/shared';
import {z} from 'zod';
import {parse} from '../auth/auth.service';
import {acceptLegalAdviceCase} from '../cases/case-state-machine';
import type {CaseActor} from '../cases/case-access';
import {PrismaService} from '../prisma.service';
import type {Prisma} from '../generated/prisma/client';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import {lockPeople} from './consultation-rules';

async function lock(tx:Prisma.TransactionClient,id:string){
 await tx.$queryRaw`SELECT id FROM cases WHERE id=${id}::uuid FOR UPDATE`;
 const c=await tx.case.findFirst({where:{id,service_code:'legal_advice'}}),b=await tx.legalAdviceBooking.findUnique({where:{case_id:id}});
 if(!c||!b)throw new NotFoundException('Consultation not found');
 return {c,b};
}
@Injectable()
export class LegalAdviceInvitations {
 constructor(private readonly prisma:PrismaService,@Inject(NOTIFICATIONS) private readonly notifications:NotificationsPort){}
 async inbox(actor:CaseActor){
  if(actor.role!=='advocate')throw new ForbiddenException('Advocate action required');
  const db=await this.prisma.getClient();
  // No client contact, private notes, document URL or unassigned case body.
  return {items:await db.legalAdviceInvitation.findMany({where:{advocate_id:actor.id},select:{id:true,case_id:true,state:true,expires_at:true,created_at:true},orderBy:{created_at:'desc'},take:100})};
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
  const input=parse(z.strictObject({decision:z.enum(['accept','decline']),reason:z.string().trim().max(1000).optional()}),body);
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
   if(b.requested_at<=now)throw new ConflictException('The requested appointment has passed. Ask Legalitt to arrange a new time.');
   const lower=new Date(b.requested_at.getTime()-config.session_minutes*60000),upper=new Date(b.requested_at.getTime()+config.session_minutes*60000);
   const collision=await tx.legalAdviceBooking.findFirst({where:{case_id:{not:c.id},accepted_advocate_id:actor.id,phase:{in:['confirmed','in_progress','paused']},confirmed_at:{gt:lower,lt:upper}}});
   const legacy=await tx.consultation.findFirst({where:{advocate_id:actor.id,case_id:{not:c.id},status:{in:['scheduled','in_progress']},scheduled_at:{gt:lower,lt:upper},case_id_relation:{status:{notIn:['cancelled','refunded']}}}});
   if(collision||legacy)throw new ConflictException('This appointment overlaps another accepted consultation. Propose another time.');
   await tx.legalAdviceInvitation.update({where:{id:invitationId},data:{state:'accepted',decided_at:now}});
   const losers=await tx.legalAdviceInvitation.findMany({where:{case_id:c.id,state:'pending'}});
   await tx.legalAdviceInvitation.updateMany({where:{case_id:c.id,state:'pending'},data:{state:'superseded',decided_at:now}});
   await tx.legalAdviceBooking.update({where:{case_id:c.id},data:{accepted_advocate_id:actor.id,accepted_at:now,confirmed_at:b.requested_at,phase:'confirmed',revision:{increment:1},updated_at:now}});
   await acceptLegalAdviceCase(tx,actor,c.id);
   await tx.legalAdviceEvent.create({data:{case_id:c.id,actor_id:actor.id,kind:'advocate_accepted',visibility:'public',data:{advocate_id:actor.id}}});
   await this.notifications.send(tx,{user_id:c.client_id,case_id:c.id,kind:'legal_advice_confirmed',title:'Consultation confirmed'});
   for(const loser of losers)await this.notifications.send(tx,{user_id:loser.advocate_id,kind:'legal_advice_invitation_closed',title:'Consultation invitation closed',body:'Another advocate accepted this consultation. No action is needed.'});
   return {accepted:true};
  });
 }
}
