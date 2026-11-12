import {ConflictException,ServiceUnavailableException} from '@nestjs/common';
import {z} from 'zod';
import type {Prisma,Case} from '../generated/prisma/client';
import type {FirLifecycleView,FirLifecycleToken} from '@legalitt/shared';

export const FirPolicyConfig=z.strictObject({reassign_after_draft_rejections:z.number().int().positive(),turnaround_warning_hours:z.number().positive(),turnaround_overdue_hours:z.number().positive(),payout_allocation:z.literal('completing_assignment_only'),replaced_advocate_share_bps:z.literal(0)});
// Caller holds the case lock. Lazy import captures writes made by the old image
// between migration and rollout, without changing released documents.
export async function ensureFirLifecycle(tx:Prisma.TransactionClient,c:Case){
 let life=await tx.firLifecycle.findUnique({where:{case_id:c.id}});
 if(!life){const policy=await tx.firPolicy.findFirst({where:{effective_from:{lte:new Date()}},orderBy:{version:'desc'}});if(!policy)throw new ServiceUnavailableException('FIR policy unavailable. Contact support.');FirPolicyConfig.parse(policy.config);
  const payment=await tx.payment.findFirst({where:{case_id:c.id,purpose:'service_fee',status:'captured'},orderBy:{captured_at:'asc'}});
  life=await tx.firLifecycle.create({data:{case_id:c.id,policy_id:policy.id,paid_at:payment?.captured_at}});
 }
 if(!life.paid_at){const payment=await tx.payment.findFirst({where:{case_id:c.id,purpose:'service_fee',status:'captured'},orderBy:{captured_at:'asc'}});if(payment?.captured_at)life=await tx.firLifecycle.update({where:{case_id:c.id},data:{paid_at:payment.captured_at}});}
 let assignment=await tx.caseAssignment.findFirst({where:{case_id:c.id,ended_at:null}});
 if(c.advocate_id&&!assignment){const event=await tx.caseEvent.findFirst({where:{case_id:c.id,to_status:'assigned'},orderBy:{id:'desc'}});
  assignment=await tx.caseAssignment.create({data:{case_id:c.id,advocate_id:c.advocate_id,assigned_by:event?.actor_id,assigned_at:event?.created_at??c.updated_at}});
 }
 if(assignment&&!life.current_submission_id){
  const sent=await tx.caseEvent.findFirst({where:{case_id:c.id,type:'fir_draft_submitted'},orderBy:{id:'desc'}});
  const p=sent?.payload as {draft_id?:string;version?:number;document_id?:string}|undefined;
  if(sent&&p?.draft_id&&p.document_id&&p.version){const draft=await tx.draft.findUnique({where:{id:p.draft_id}}),content=draft?.content as {complainant?:{identity_document_id?:string}}|undefined;
   const approved=await tx.caseEvent.findFirst({where:{case_id:c.id,type:'fir_draft_approved',payload:{path:['draft_id'],equals:p.draft_id}},orderBy:{id:'desc'}});
   const sub=await tx.firSubmission.create({data:{case_id:c.id,assignment_id:assignment.id,draft_id:p.draft_id,version:p.version,document_id:p.document_id,identity_document_id:content?.complainant?.identity_document_id??null,submitted_at:sent.created_at,state:approved?'approved':'pending',decided_by:approved?.actor_id,decided_at:approved?.created_at}});
   life=await tx.firLifecycle.update({where:{case_id:c.id},data:{current_submission_id:sub.id}});
  }
 }
 return {life,assignment,policy:FirPolicyConfig.parse((await tx.firPolicy.findUniqueOrThrow({where:{id:life.policy_id}})).config)};
}
export function checkFirToken(life:{revision:number;current_submission_id:string|null},token:FirLifecycleToken){if(life.revision!==token.revision||life.current_submission_id!==token.submission_id)throw new ConflictException('This FIR review changed. Reload before acting.');}
// Q114: identity is no longer collected. Identity returns recorded on older cases stay
// on record (and in the lifecycle view) but never hold a case in a correction state.
export async function firCorrectionState(tx:Prisma.TransactionClient,id:string){
 const life=await tx.firLifecycle.findUniqueOrThrow({where:{case_id:id}}),sub=life.current_submission_id?await tx.firSubmission.findUnique({where:{id:life.current_submission_id}}):null;
 return sub?.draft_reason&&sub.state==='returned'?'advocate_revision_required':null;
}
export async function firLifecycleView(tx:Prisma.TransactionClient,c:Case,client=false):Promise<FirLifecycleView>{
 const {life,assignment,policy}=await ensureFirLifecycle(tx,c),assignments=await tx.caseAssignment.findMany({where:{case_id:c.id},orderBy:{assigned_at:'asc'}}),submissions=await tx.firSubmission.findMany({where:{case_id:c.id},orderBy:{submitted_at:'asc'}}),returns=await tx.firIdentityReturn.findMany({where:{case_id:c.id},orderBy:{rejected_at:'asc'}});
 const users=await tx.user.findMany({where:{id:{in:assignments.map(a=>a.advocate_id)}},select:{id:true,full_name:true}}),count=(id:string)=>submissions.filter(s=>s.assignment_id===id&&s.state==='returned'&&s.draft_reason).length;
 return {revision:life.revision,current_submission_id:client?null:life.current_submission_id,paid_at:life.paid_at?.toISOString()??null,updated_at:c.updated_at.toISOString(),warning_hours:policy.turnaround_warning_hours,overdue_hours:policy.turnaround_overdue_hours,reassign_after:policy.reassign_after_draft_rejections,rejection_count:client?0:assignment?count(assignment.id):0,
  assignments:client?[]:assignments.map(a=>({id:a.id,advocate_id:a.advocate_id,name:users.find(u=>u.id===a.advocate_id)?.full_name??'Advocate',assigned_at:a.assigned_at.toISOString(),ended_at:a.ended_at?.toISOString()??null,rejections:count(a.id)})),
  submissions:client?[]:submissions.map(s=>({id:s.id,assignment_id:s.assignment_id,draft_id:s.draft_id,version:s.version,document_id:s.document_id,identity_document_id:s.identity_document_id,identity_checked_at:s.identity_checked_at?.toISOString()??null,state:s.state,draft_reason:s.draft_reason,submitted_at:s.submitted_at.toISOString(),decided_at:s.decided_at?.toISOString()??null})),
  identity_returns:returns.map(r=>({id:r.id,document_id:r.document_id,replacement_document_id:r.replacement_document_id,state:r.state,purge_status:r.purge_status,rejected_at:r.rejected_at.toISOString()})),
  entitlement:!client&&c.status==='completed'&&life.completing_assignment_id&&life.advocate_entitlement_paise!==null?{assignment_id:life.completing_assignment_id,amount_paise:life.advocate_entitlement_paise.toString(),policy_id:life.policy_id,commission_rate_id:life.commission_rate_id}:null};
}
