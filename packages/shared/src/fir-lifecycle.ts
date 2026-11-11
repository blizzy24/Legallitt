import {z} from 'zod';
export const FIR_REJECTION_HELP='Visible to any advocate who works this case. Describe what’s wrong with the draft.';
export const FIR_REASSIGNED_CLIENT='We’ve assigned a new advocate to your case to make sure your draft meets our standards';
export const FirLifecycleTokenSchema=z.strictObject({revision:z.number().int().nonnegative(),submission_id:z.uuid().nullable()});
export const FirRejectSchema=FirLifecycleTokenSchema.extend({draft_reason:z.string().trim().min(1).max(4000).optional(),identity_document_id:z.uuid().optional()}).refine(v=>!!v.draft_reason||!!v.identity_document_id,'Choose a draft or identity rejection.');
// Flow §3.4: the reason is shown in the case timeline.
export const FirReassignSchema=FirLifecycleTokenSchema.extend({advocate_id:z.uuid(),reason:z.string().trim().min(1,'Enter the reason for reassignment').max(2000)});
export const FirIdentityReviewSchema=FirLifecycleTokenSchema.extend({document_id:z.uuid(),decision:z.enum(['accepted','unmasked_aadhaar'])});
export type FirLifecycleToken=z.infer<typeof FirLifecycleTokenSchema>;
export type FirLifecycleView={revision:number;current_submission_id:string|null;paid_at:string|null;updated_at:string;warning_hours:number;overdue_hours:number;reassign_after:number;rejection_count:number;
 assignments:{id:string;advocate_id:string;name:string;assigned_at:string;ended_at:string|null;rejections:number}[];
 submissions:{id:string;assignment_id:string;draft_id:string;version:number;document_id:string;identity_document_id:string|null;identity_checked_at:string|null;state:string;draft_reason:string|null;submitted_at:string;decided_at:string|null}[];
 identity_returns:{id:string;document_id:string;replacement_document_id:string|null;state:string;purge_status:string;rejected_at:string}[];
 entitlement:{assignment_id:string;amount_paise:string;policy_id:string;commission_rate_id:string|null}|null};
export function firTurnaround(life:Pick<FirLifecycleView,'paid_at'|'warning_hours'|'overdue_hours'>,now=Date.now()){
 if(!life.paid_at)return {level:'unknown',text:'Payment time unavailable'};
 const hours=Math.max(0,(now-Date.parse(life.paid_at))/3600000);
 return hours>=life.overdue_hours?{level:'overdue',text:`Overdue · ${Math.floor(hours)}h since payment (promised ${life.warning_hours}–${life.overdue_hours}h)`}:hours>=life.warning_hours?{level:'warning',text:`Over ${life.warning_hours}h · ${Math.floor(hours)}h since payment`}:{level:'within',text:`${Math.floor(hours)}h since payment · ${life.warning_hours}–${life.overdue_hours}h turnaround`};
}
