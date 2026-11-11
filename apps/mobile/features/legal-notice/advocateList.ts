import { CaseStatus, isNoticeCase, type ApiCase } from '@legalitt/shared';
import type { AdvCaseMatter, AdvMatterStatus } from '../../data/advocateSide';
import { noticeMatter } from '../../data/legalNoticeMatter';

// Advocate work, not the client's active/pending grouping. Design 162 provides
// REVIEW / PROGRESS / RESOLVED and Needs Review / In Progress / Open Case.
// 184 supplies Review Request; 443 supplies Continue Draft. No notice is a
// scheduled hearing or consultation, so Upcoming is never a notice bucket.
type Entry = { bucket: 'Needs Review' | 'In Progress' | 'Resolved'; status: AdvMatterStatus;
  action: 'Review Request' | 'Continue Draft' | 'Open Case' | null; screen?: string };
export function advocateNoticeState(status: CaseStatus): Entry {
  switch (status) {
    case CaseStatus.assigned: return {bucket:'Needs Review',status:'Needs Review',action:'Review Request',screen:'fee'};
    case CaseStatus.advocate_accepted: return {bucket:'In Progress',status:'Draft Preparation',action:'Continue Draft',screen:'drafting'};
    case CaseStatus.in_progress: return {bucket:'In Progress',status:'Draft Preparation',action:'Continue Draft',screen:'draft'};
    // The drafting choice starts/resumes the real lifecycle before editing.
    case CaseStatus.changes_requested: return {bucket:'In Progress',status:'Changes Requested',action:'Continue Draft',screen:'drafting'};
    case CaseStatus.client_review: return {bucket:'In Progress',status:'Client Review',action:'Open Case',screen:'review'};
    case CaseStatus.approved: return {bucket:'In Progress',status:'Client Approved',action:'Open Case',screen:'final'};
    case CaseStatus.dispatching: return {bucket:'In Progress',status:'Ready for Dispatch',action:'Open Case',screen:'dispatch'};
    case CaseStatus.dispatched: return {bucket:'In Progress',status:'Dispatched',action:'Open Case',screen:'dispatch'};
    case CaseStatus.completed: return {bucket:'Resolved',status:'Completed',action:'Open Case',screen:'report'};
    // No drawn read-only advocate destination exists for these states. Do not
    // route back to the fee screen, which offers acceptance of a closed request.
    case CaseStatus.advocate_declined: return {bucket:'Resolved',status:'Declined',action:null};
    // D-07/D-53: cancelled cases open the read-only completion view, which says
    // "Cancelled — no further work" without the client's reason or refund.
    case CaseStatus.cancelled: return {bucket:'Resolved',status:'Cancelled',action:'Open Case',screen:'report'};
    case CaseStatus.refunded: return {bucket:'Resolved',status:'Refunded',action:'Open Case',screen:'report'};
    // Normally invisible through the advocate-scoped endpoint; still account
    // for them without granting an action if the backend supplies one.
    case CaseStatus.draft: return {bucket:'Needs Review',status:'Draft',action:null};
    case CaseStatus.submitted: return {bucket:'Needs Review',status:'Submitted',action:null};
    case CaseStatus.payment_pending: return {bucket:'Needs Review',status:'Payment Pending',action:null};
    case CaseStatus.paid: return {bucket:'Needs Review',status:'Paid',action:null};
    case CaseStatus.assigning: return {bucket:'Needs Review',status:'Assigning',action:null};
    default: { const exhaustive: never = status; throw new Error(`Unknown lifecycle: ${exhaustive}`); }
  }
}
export const ADV_NOTICE_FILTERS = ['All','Needs Review','In Progress','Waiting for Client','Resolved'];
export function advocateNoticeMatters(records: ApiCase[]): AdvCaseMatter[] {
  return records.filter(isNoticeCase).slice()
    .sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at)||b.id.localeCompare(a.id))
    .map(r=>{
      const entry=advocateNoticeState(r.status);
      const parties=[r.details.client?.fullName,r.details.noticee?.fullName].filter(Boolean);
      return {id:r.id,service:'Legal Notice',serviceKey:'legal-notice',
        href:entry.screen?`/advocate/notice/${r.id}/${entry.screen}?caseId=${encodeURIComponent(r.id)}`:undefined,
        urgency:r.tier==='urgent'?'URGENT':r.tier==='ordinary'?'ORDINARY':null,
        title:parties.length===2?parties.join(' → '):noticeMatter(r.matter_type).title,
        searchText:parties.join(' '),ref:r.reference,status:entry.status,body:'',footer:'',
        bucket:entry.bucket,filterTags:r.status==='client_review'?['Waiting for Client']:[],
        action:entry.action,actionArrow:entry.action==='Continue Draft'||entry.action==='Open Case'};
    });
}
export function advocateNoticeStatistics(matters: AdvCaseMatter[]) {
  return [
    {label:'REVIEW',value:String(matters.filter(m=>m.bucket==='Needs Review').length),tone:'upcoming' as const},
    {label:'PROGRESS',value:String(matters.filter(m=>m.bucket==='In Progress').length),tone:'active' as const},
    {label:'RESOLVED',value:String(matters.filter(m=>m.bucket==='Resolved').length),tone:'completed' as const},
  ];
}
