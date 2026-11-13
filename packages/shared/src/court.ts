import {z} from 'zod';
import type {ApiCase,ApiDocument} from './notice-api';

export const CourtServiceSchema=z.enum(['district_court','high_court']);
export type CourtService=z.infer<typeof CourtServiceSchema>;
export const isCourtService=(value:string):value is CourtService=>CourtServiceSchema.safeParse(value).success;
const text=(max=1000)=>z.string().trim().max(max);
export const CourtIntakeSchema=z.strictObject({
  intake_version:z.literal(3).default(3),path:z.enum(['new','pending']).default('new'),
  full_name:text(200).default(''),phone:text(30).default(''),email:text(254).default(''),
  case_type:text(100).default(''),title:text(300).default(''),other_party:text(300).default(''),
  state:text(100).default(''),district:text(100).default(''),city:text(150).default(''),
  high_court:text(150).default(''),bench:text(200).default(''),bench_unknown:z.boolean().default(false),
  narrative:text(10000).default(''),important_date:text(10).default(''),important_date_reason:text(500).default(''),
  sub_category:text(150).default(''),dispute_location:text(500).default(''),other_details:text(5000).default(''),
  case_number:text(100).default(''),existing_court:text(300).default(''),case_status:text(100).default(''),
  previous_advocate:text(200).default(''),change_reason:text(1000).default(''),noc_later:z.boolean().default(false),
  identity_kind:z.enum(['masked_aadhaar','passport','voter_id']).optional(),
  information_correct:z.boolean().default(false),terms_accepted:z.boolean().default(false),
});
export type CourtIntake=z.infer<typeof CourtIntakeSchema>;
export const COURT_CASE_TYPES:Record<CourtService,readonly string[]>={district_court:['Civil','Criminal','Family','Divorce','Property','Money Recovery','Consumer','Other'],high_court:['Writ','Civil','Bail','Appeal','Service','Property','Other']};
const paise=z.string().regex(/^\d{1,12}$/);
export const CourtPolicySchema=z.strictObject({
  deposit_paise:paise,change_fee_paise:paise,pickup_paise:paise,
  free_changes:z.number().int().min(0).max(10),paid_changes:z.number().int().min(0).max(10),
  review_rounds:z.number().int().min(1).max(10),chat_days:z.number().int().min(0).max(90),
  receipt_alert_days:z.number().int().min(1).max(90),
  ordinary_days:z.tuple([z.number().int().positive(),z.number().int().positive()]),
  urgent_days:z.tuple([z.number().int().positive(),z.number().int().positive()]),
  working_weekdays:z.array(z.number().int().min(0).max(6)).min(1).max(7),
  high_courts:z.array(text(150).min(1)).min(1).max(50),
}).refine(v=>v.ordinary_days[0]<=v.ordinary_days[1]&&v.urgent_days[0]<=v.urgent_days[1],{message:'Minimum working days must not exceed maximum working days.'});
export type CourtPolicy=z.infer<typeof CourtPolicySchema>;
export const COURT_STAGES=[
  {key:'draft',label:'Request submitted'}, {key:'verification',label:'Under review'},
  {key:'assignment',label:'Advocate assigned'}, {key:'discussion',label:'Talk to advocate'},
  {key:'decision',label:'Client decision'}, {key:'documents',label:'Documents'},
  {key:'preparation',label:'Case preparation'}, {key:'filed',label:'Court filing'},
  {key:'hearings',label:'Hearings'}, {key:'completed',label:'Case completed'},
] as const;
export type CourtPhase=typeof COURT_STAGES[number]['key']|'deposit'|'balance'|'completion_review'|'cancelled';
export const courtStage=(phase:CourtPhase)=>({index:phase==='deposit'?0:phase==='balance'?4:phase==='completion_review'?8:Math.max(0,COURT_STAGES.findIndex(s=>s.key===phase)),label:phase==='draft'?'Draft request':phase==='deposit'?'Submission payment pending':phase==='balance'?'Balance payment pending':phase==='completion_review'?'Completion awaiting admin confirmation':phase==='cancelled'?'Cancelled':COURT_STAGES.find(s=>s.key===phase)?.label??'Request submitted'});
export type CourtChecklistItem={id:string;title:string;description:string;required:boolean;document_ids:string[];received_at?:string};
export type CourtReview={id:string;version:number;document_ids:string[];sent_at:string;status:'pending'|'approved'|'changes';comment?:string;comments?:{document_id:string;page:number;note:string}[];decided_at?:string};
export type CourtFee={id:string;kind:'court'|'process';heading:string;description:string;amount_paise:string;created_at:string;payment_id?:string;paid_at?:string;receipt_id?:string;receipt_at?:string};
export type CourtChange={id:string;kind:'free'|'paid';reason:string;note:string;status:'payment_pending'|'requested'|'approved'|'rejected'|'reassigned'|'contact';created_at:string;old_advocate_id:string;payment_id?:string;decision_reason?:string;noc_id?:string};
export type CourtPickup={method:'legalitt'|'self';name:string;phone:string;address:string;date:string;slot:string;instructions:string;status:'payment_pending'|'booking'|'sent'|'received';payment_id?:string;carrier?:string;awb?:string;events:{at:string;detail:string}[]};
export type CourtData={
  phase:CourtPhase;accepted_at?:string;client_accepted_at?:string;deposit_id?:string;balance_id?:string;
  deadline_at?:string;verified_at?:string;verification_reason?:string;information_reply?:string;
  previous_phase?:CourtPhase;checklist:CourtChecklistItem[];checklist_message?:string;preparation_tasks:string[];
  reviews:CourtReview[];review_limit:number;fees:CourtFee[];changes:CourtChange[];pickup?:CourtPickup;
  filing?:{date:string;number:string;case_number:string;status:string;note:string;receipt_id?:string};
  completion?:{note:string;order_id:string;requested_at:string;confirmed_at?:string};
  chat_reopened_until?:string;cancel_requested?:{reason:string;at:string;decided_at?:string;decision?:string};
  public_documents:string[];
  feedback?:{rating:number;review:string;at:string};
};
export type CourtHearing={id:string;case_id:string;advocate_id:string;at:string;court:string;room:string;bench:string;judge?:string|null;note:string;started_at?:string|null;update?:{attendance:string;client_present:string;status:string;what_happened:string;direction:string;order_id?:string;next_step:string;next_hearing?:string;documents_needed:string[]}|null;classification?:'effective'|'passive'|null;amount_paise?:string|null;classified_at?:string|null;private_note?:string;draft?:{attendance:string;client_present:string;status:string;what_happened:string;direction:string;next_step:string;documents_needed:string[];private_note:string;order_id?:string;saved_at:string}};
export type CourtPaymentView={id:string;purpose:string;total_paise:string;simulated:boolean;captured_at:string|null};
export type CourtView={case:ApiCase;revision:number;policy:CourtPolicy;data:CourtData;stage:ReturnType<typeof courtStage>;documents:ApiDocument[];hearings:CourtHearing[];private_note?:string;payments?:CourtPaymentView[];chat:{writable:boolean;reason:string;closes_at:string|null};warnings:string[];legacy:false};
export function courtChat(data:CourtData,policy:CourtPolicy,completedAt?:string|null,now=Date.now()){
  const closes=completedAt?new Date(Date.parse(completedAt)+policy.chat_days*86400000).toISOString():null;
  const reopened=!!data.chat_reopened_until&&Date.parse(data.chat_reopened_until)>now;
  const writable=data.phase!=='cancelled'&&!!data.accepted_at&&(reopened||!closes||Date.parse(closes)>now);
  return {writable,closes_at:reopened?data.chat_reopened_until!:closes,reason:writable?'Talk through in-app chat. Phone numbers are never shared.':!data.accepted_at?'Chat opens when the advocate accepts.':'This case chat is read-only. Contact Support if you need it reopened.'};
}
export function courtDueDate(paidAt:Date,days:number,weekdays:number[]){const at=new Date(paidAt);let left=days;while(left>0){at.setUTCDate(at.getUTCDate()+1);if(weekdays.includes(new Date(at.getTime()+330*60000).getUTCDay()))left--;}return at.toISOString();}
