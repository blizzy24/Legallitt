import {z} from 'zod';
import type {ReportServiceCode} from './service-reports';

export const FlowReportServices=['property_search','document_forensic'] as const;
export type FlowReportService=typeof FlowReportServices[number];
export const isFlowReportService=(s:string):s is FlowReportService=>(FlowReportServices as readonly string[]).includes(s);
const window=z.object({min:z.number().int().positive(),max:z.number().int().positive(),unit:z.enum(['hours','working_days'])}).refine(v=>v.max>=v.min);
export const ReportWorkflowPolicySchema=z.object({turnaround:z.object({ordinary:window,urgent:window}),chat_days_after_delivery:z.number().int().min(0).max(90),chat_reopen_days:z.number().int().min(1).max(90),followup_hours:z.number().positive(),admin_review_hours:z.number().positive(),max_upload_bytes:z.number().int().min(1024).max(104857600),working_weekdays:z.array(z.number().int().min(0).max(6)).min(1),timezone:z.literal('Asia/Kolkata')});
export type ReportWorkflowPolicy=z.infer<typeof ReportWorkflowPolicySchema>;
export type ReportInfoTask={id:string;kind:'details'|'document';prompt:string;document_kind:string|null;requested_by:string;requested_role:string;requested_at:string;status:'requested'|'responded'|'resolved';reply?:string;document_ids:string[];responded_at?:string;resolved_at?:string};
export type ReportWorkflowData={legacy?:boolean;legacy_pending_submission?:boolean;original_details?:unknown;phase?:string;verification?:{at:string;source:string;actor_id?:string}|null;deadline_at?:string;paused_at?:string|null;tasks?:ReportInfoTask[];checklist?:{files_open:boolean;pages_complete:boolean;legible:boolean;at:string;actor_id:string;document_ids:string[]};chat_reopened_until?:string;reopening_reason?:string;correction_open?:boolean;review_checklist?:{draft_id:string;format:boolean;signature:boolean;conclusion:boolean;question:boolean;actor_id:string;at:string}};
export type ReportWorkflowView={case_id:string;revision:number;policy_id:string;policy_version:number;policy:ReportWorkflowPolicy;stage:ReportStage;deadline_at:string|null;paused_at:string|null;overdue:boolean;verification:ReportWorkflowData['verification'];tasks:ReportInfoTask[];checklist:ReportWorkflowData['checklist'];chat:{writable:boolean;closes_at:string|null;reason:string};legacy:boolean;review_checklist:ReportWorkflowData['review_checklist']};
export type ReportStage={key:string;client:string;advocate:string;admin:string;index:number};
export const PROPERTY_STAGES=['Request Submitted','Payment Received','Verification in Progress','Assign Advocate','Report Preparation','Report Delivered'] as const;
export const FORENSIC_STAGES=['Payment Received','Document Uploaded','Expert Assigned','Forensic Analysis','Quality Review','Report Ready'] as const;
export function reportStage(c:{service_code:string;status:string;sub_status?:string|null;advocate_id?:string|null},data:ReportWorkflowData={}):ReportStage{
 const ps=c.service_code==='property_search';const result=(key:string,client:string,advocate:string,admin:string,index:number)=>({key,client,advocate,admin,index});
 if(['cancelled','refunded'].includes(c.status))return result(c.status,'Cancelled','Cancelled','Cancelled',-1);
 if(c.status==='completed'&&!data.correction_open)return result('delivered',ps?'Report Ready':'Analysis Completed','Report Completed','Delivered',5);
 if(['draft','submitted','payment_pending'].includes(c.status))return result('intake',c.status==='draft'?'Draft request':'Payment pending','Awaiting payment','Awaiting payment',-1);
 if(data.tasks?.some(t=>t.status!=='resolved'))return result('more_information',ps?'We need more details':'The expert needs more information','Waiting for client','Waiting for client',ps?2:3);
 if(c.sub_status==='awaiting_admin_approval')return result('admin_review','Quality Review','Waiting for admin review','Review report',4);
 if(c.sub_status==='admin_changes_requested')return result('changes_requested','Forensic Analysis','Changes Needed','Waiting for advocate corrections',3);
 if(!c.advocate_id||['paid','assigning','advocate_declined'].includes(c.status))return result(ps&&!data.verification?'verification':'assignment',ps&&!data.verification?'Verification in Progress':'Assigning advocate','Awaiting assignment',ps&&!data.verification?'Verify request':'Assign advocate',ps?2:1);
 if(c.status==='assigned')return result('assigned',ps?'Advocate Assigned':'Expert Assigned','New Request','Awaiting advocate acceptance',ps?3:2);
 if(!ps&&!data.checklist&&!data.legacy_pending_submission)return result('files_check','Forensic Analysis','Check the files','Advocate checking files',3);
 if(!ps&&data.phase!=='report_draft')return result('waiting','Forensic Analysis','Waiting for Specialist Report','Advocate preparing examination',3);
 return result('preparing',ps?'Report Preparation':'Forensic Analysis',ps?'Report Preparation':'Report Draft','Advocate preparing report',ps?4:3);
}
export const reportTurnaround=(p:ReportWorkflowPolicy,tier:string|null|undefined)=>{const v=p.turnaround[tier==='urgent'?'urgent':'ordinary'];return `${v.min}–${v.max} ${v.unit==='hours'?'hours':'working days'}`;};
export const reportSpeed=(tier?:string|null)=>tier==='urgent'?'Urgent':tier==='ordinary'?'Ordinary':null;
export function reportFileLabel(d:{kind?:string;slot_label?:string|null},index?:number){const labels:Record<string,string>={questioned_document:'Document to examine',reference_document:'Reference sample',property_document:'Property document',service_report:'Property Search Report',forensic_report:'Forensic report',forensic_affidavit:'Affidavit',id_proof:'Identity proof'};return d.slot_label?.trim()||`${labels[d.kind??'']??'Supporting document'}${index===undefined?'':` ${index+1}`}`;}
export const ReportTaskInputSchema=z.strictObject({revision:z.number().int().min(0),kind:z.enum(['details','document']),prompt:z.string().trim().min(1).max(1000),document_kind:z.enum(['property_document','questioned_document','reference_document']).optional()});
export const ReportTaskReplySchema=z.strictObject({revision:z.number().int().min(0),task_id:z.uuid(),reply:z.string().trim().max(2000).default(''),document_ids:z.array(z.uuid()).max(30).default([]),details:z.record(z.string(),z.unknown()).optional()});
export const ReportFileChecklistSchema=z.strictObject({revision:z.number().int().min(0),files_open:z.literal(true),pages_complete:z.literal(true),legible:z.literal(true)});
export const ReportAdminChecklistSchema=z.strictObject({revision:z.number().int().min(0),draft_id:z.uuid(),format:z.literal(true),signature:z.literal(true),conclusion:z.literal(true),question:z.literal(true)});
export const ReportReopenSchema=z.strictObject({revision:z.number().int().min(0),reason:z.string().trim().min(1).max(600)});
export type ReportTimelineItem={title:string;at:string|null;detail:string;done:boolean};
export function reportTimeline(c:{service_code:ReportServiceCode;status:string;created_at:string;completed_at?:string|null;events?:{type:string;to_status?:string|null;created_at:string;payload?:unknown}[]},flow:ReportWorkflowView):ReportTimelineItem[]{
 const events=c.events??[],at=(...names:string[])=>events.find(e=>names.includes(e.type)||!!e.to_status&&names.includes(e.to_status))?.created_at??null;
 const paid=at('paid','payment_captured'),assigned=at('assigned'),accepted=at('advocate_accepted'),delivered=at('service_report_released')??c.completed_at??null;
 const ps=c.service_code==='property_search';
 return (ps?[
  {title:PROPERTY_STAGES[0],at:at('submitted'),detail:'Your property search request was submitted.',done:!!paid},
  {title:PROPERTY_STAGES[1],at:paid,detail:'Payment received for this request.',done:!!paid},
  {title:PROPERTY_STAGES[2],at:flow.verification?.at??null,detail:flow.verification?.source==='legacy_assignment'?'Earlier request retained from its existing assignment.':'Legalitt checked the supplied request details.',done:!!flow.verification},
  {title:PROPERTY_STAGES[3],at:assigned,detail:'An advocate was assigned to your request.',done:!!assigned},
  {title:PROPERTY_STAGES[4],at:accepted,detail:'Your advocate accepted and began preparing the report.',done:!!accepted},
  {title:PROPERTY_STAGES[5],at:delivered,detail:'Your report is available to view and download.',done:!!delivered},
 ]:[
  {title:FORENSIC_STAGES[0],at:paid,detail:'Payment received for the examination.',done:!!paid},
  {title:FORENSIC_STAGES[1],at:at('report_document_uploaded'),detail:'Your supplied documents are available for examination.',done:!!paid},
  {title:FORENSIC_STAGES[2],at:assigned,detail:'An advocate was assigned to examine your documents.',done:!!assigned},
  {title:FORENSIC_STAGES[3],at:accepted,detail:'Your advocate began the examination.',done:!!accepted},
  {title:FORENSIC_STAGES[4],at:at('service_report_approved'),detail:'Legalitt reviewed the report and affidavit before release.',done:!!delivered},
  {title:FORENSIC_STAGES[5],at:delivered,detail:'The approved report and affidavit are available.',done:!!delivered},
 ]);
}
