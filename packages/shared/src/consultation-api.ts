import type {ApiCase} from './notice-api';
import type {ConsultationIntake,ConsultationReportContent} from './consultation';
import type {QuoteBreakdown} from './pricing';
export type ConsultationReportView={id:string;kind:'consultation'|'completion';version:number;content:ConsultationReportContent;filing_snapshot:ConsultationIntake;document_id:string|null;status:'draft'|'submitted'|'returned'|'approved';submitted_at:string|null;created_at:string;reason?:string|null};
export type CourtQuoteView={id:string;version:number;base_amount_paise:string;scope:string;exclusions:string;expires_at:string;status:'offered'|'superseded'|'paid';payment_id:string|null};
export type ConsultationView={
  uploads:{id:string;owner_id:string;kind:string;filename:string;mime_type:string;page_count:number|null;size_bytes:string;status:string}[];
  case:ApiCase;revision:number;selected_advocate:{id:string;full_name:string}|null;
  session:{id:string;advocate_id:string;scheduled_at:string;duration_min:number;status:string;reserved_until:string|null;client_joined_at:string|null;started_at:string|null;ended_at:string|null;rating:number|null;review:string|null}|null;
  quotes:CourtQuoteView[];reports:ConsultationReportView[];current_report_id?:string|null;internal_notes?:string;
  consultation_approved_at:string|null;pending_review:{kind:string;submitted_at:string}|null;
  progress:{id:string;stage:string;update:string;court:string|null;case_number:string|null;next_hearing:string|null;hearing_at:string|null;court_room:string|null;next_steps:string|null;document_ids:string[];created_at:string}[];
  payments:{id:string;purpose:string;simulated:boolean;captured_at:string;total_paise:string;breakdown:QuoteBreakdown|null}[];
  payouts?:{id:string;net_paise:string;status:string}[];
};
export type BookableAdvocate={id:string;full_name:string;has_availability:boolean;profile:{city:string|null;state:string|null;years_experience:number|null;practice_areas:string[];languages:string[];bio:string|null;education:string|null}|null};
