import { CaseStatus, isNoticeCase, type ApiCase } from '@legalitt/shared';
import type { AdvCaseMatter, AdvMatterStatus } from '../../data/advocateSide';
import { noticeMatter } from '../../data/legalNoticeMatter';

// Advocate work, not the client's active/pending grouping. Design 162 provides
// Needs Review / In Progress / Open Case (the dashboard's groups, kept in
// `bucket`). 184 supplies Review Request; 443 supplies Continue Draft. No notice
// is a scheduled hearing or consultation, so Upcoming is never a notice tag.
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
// Designs 213/214: the cases list counts ACTIVE / UPCOMING / COMPLETED and filters
// All · Active · Upcoming · Waiting for Client, for every service. Open work is
// Active; Upcoming is a scheduled appointment, which no case in the list carries
// yet, so it counts only what is really scheduled (none today); Completed is
// completed. Cancelled, refunded and declined cases appear under All only.
// `bucket` keeps the dashboard's Needs Review / In Progress / Resolved groups.
export const ADV_MATTER_FILTERS = ['All','Active','Upcoming','Waiting for Client'];
const OPEN_WORK = new Set<string>([CaseStatus.assigned, CaseStatus.advocate_accepted, CaseStatus.in_progress, CaseStatus.client_review,
  CaseStatus.changes_requested, CaseStatus.approved, CaseStatus.dispatching, CaseStatus.dispatched]);
export function advocateMatterTags(status: CaseStatus): string[] {
  if (status === CaseStatus.completed) return ['Completed'];
  if (!OPEN_WORK.has(status)) return [];
  return status === CaseStatus.client_review ? ['Active', 'Waiting for Client'] : ['Active'];
}
export function advocateMatterStatistics(matters: AdvCaseMatter[]) {
  const count = (tag: string) => String(matters.filter(m => m.filterTags?.includes(tag)).length);
  return [
    {label:'ACTIVE',value:count('Active'),tone:'active' as const},
    {label:'UPCOMING',value:count('Upcoming'),tone:'upcoming' as const},
    {label:'COMPLETED',value:count('Completed'),tone:'completed' as const},
  ];
}
/** "8 active" beside Your Matters (design/214). */
export const advocateMatterCount = (matters: AdvCaseMatter[]) => `${matters.filter(m => m.filterTags?.includes('Active')).length} active`;
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
        bucket:entry.bucket,filterTags:advocateMatterTags(r.status),
        action:entry.action,actionArrow:entry.action==='Continue Draft'||entry.action==='Open Case'};
    });
}
