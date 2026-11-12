import {ConflictException, NotFoundException} from '@nestjs/common';
import {isFlowReportService, ReportWorkflowPolicySchema, reportStage, type ReportWorkflowData, type ReportWorkflowPolicy, type ReportWorkflowView} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';

type WorkflowCase={id:string;service_code:string;status:string;sub_status:string|null;advocate_id:string|null;completed_at:Date|null;tier:string|null;details:unknown};
export function reportDeadline(start:Date,policy:ReportWorkflowPolicy,tier:string|null):Date {
  const window=policy.turnaround[tier==='urgent'?'urgent':'ordinary'];
  if(window.unit==='hours')return new Date(start.getTime()+window.max*3600000);
  const deadline=new Date(start);let remaining=window.max;
  while(remaining){deadline.setUTCDate(deadline.getUTCDate()+1);const istDay=new Date(deadline.getTime()+330*60000).getUTCDay();if(policy.working_weekdays.includes(istDay))remaining--;}
  return deadline;
}
/** Call under the case lock. Each case pins the policy in effect on first use. */
export async function ensureReportWorkflow(tx:Prisma.TransactionClient,c:WorkflowCase){
  if(!isFlowReportService(c.service_code))throw new NotFoundException('Report workflow not found');
  let row=await tx.reportWorkflow.findUnique({where:{case_id:c.id},include:{policy:true}});
  if(!row){
    const policy=await tx.reportWorkflowPolicy.findFirst({where:{service_code:c.service_code,effective_from:{lte:new Date()}},orderBy:{version:'desc'}});
    if(!policy)throw new ConflictException('Turnaround settings are unavailable. Contact admin support.');
    row=await tx.reportWorkflow.create({data:{case_id:c.id,policy_id:policy.id,data:{original_details:c.details as Prisma.InputJsonValue,tasks:[]}},include:{policy:true}});
  }
  const policy=ReportWorkflowPolicySchema.parse(row.policy.config),data=row.data as ReportWorkflowData&{original_details_frozen?:boolean};
  if(!data.legacy&&!data.original_details_frozen&&!['draft','submitted','payment_pending'].includes(c.status)){
    data.original_details=c.details;data.original_details_frozen=true;
    await tx.reportWorkflow.update({where:{case_id:c.id},data:{data:data as Prisma.InputJsonObject}});
  }
  if(!data.deadline_at){
    const paid=await tx.caseEvent.findFirst({where:{case_id:c.id,to_status:'paid'},orderBy:{id:'asc'}});
    if(paid){data.deadline_at=reportDeadline(paid.created_at,policy,c.tier).toISOString();await tx.reportWorkflow.update({where:{case_id:c.id},data:{data:data as Prisma.InputJsonObject}});}
  }
  return {row,policy,data};
}
export function reportChat(c:Pick<WorkflowCase,'status'|'completed_at'>,data:ReportWorkflowData,policy:ReportWorkflowPolicy,now=new Date()){
  if(['cancelled','refunded','draft','submitted','payment_pending','paid','assigning','assigned','advocate_declined'].includes(c.status))return {writable:false,closes_at:null,reason:['cancelled','refunded'].includes(c.status)?'This case is closed.':'Chat opens when your advocate accepts the case.'};
  if(c.status!=='completed')return {writable:true,closes_at:null,reason:'Chat is open while the report is being prepared.'};
  const normal=c.completed_at?c.completed_at.getTime()+policy.chat_days_after_delivery*86400000:0;
  const until=Math.max(normal,data.chat_reopened_until?Date.parse(data.chat_reopened_until):0);
  return {writable:until>now.getTime(),closes_at:until?new Date(until).toISOString():null,reason:until>now.getTime()?'Chat is open for follow-up questions.':'The follow-up window has ended. Contact admin support to reopen chat.'};
}
export async function reportCorrectionAllowed(tx:Prisma.TransactionClient,c:WorkflowCase){
 if(c.service_code!=='property_search'||c.status!=='completed')return false;
 const w=await ensureReportWorkflow(tx,c);return !!w.data.correction_open&&reportChat(c,w.data,w.policy).writable;
}
export function reportWorkflowView(c:WorkflowCase,w:Awaited<ReturnType<typeof ensureReportWorkflow>>):ReportWorkflowView{
  return {case_id:c.id,revision:w.row.revision,policy_id:w.row.policy_id,policy_version:w.row.policy.version,policy:w.policy,stage:reportStage(c,w.data),deadline_at:w.data.deadline_at??null,paused_at:w.data.paused_at??null,overdue:!!w.data.deadline_at&&!w.data.paused_at&&c.status!=='completed'&&Date.parse(w.data.deadline_at)<Date.now(),verification:w.data.verification,tasks:w.data.tasks??[],checklist:w.data.checklist,chat:reportChat(c,w.data,w.policy),legacy:!!w.data.legacy,review_checklist:w.data.review_checklist};
}
