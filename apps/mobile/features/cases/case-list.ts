import { adminBucketFor, isNoticeCase, SERVICE_NAMES, unbuiltCasePath, type ApiCase, type ServiceCode, type CaseStatus } from '@legalitt/shared';
import { advocateNoticeMatters, advocateNoticeState } from '../legal-notice/advocateList';
import { noticeMatter } from '../../data/legalNoticeMatter';
import type { AdvCaseMatter } from '../../data/advocateSide';

export function caseTitle(record: ApiCase) {
  return isNoticeCase(record) ? noticeMatter(record.matter_type).title : record.title?.trim() || SERVICE_NAMES[record.service_code];
}
export function caseCategory(record: ApiCase) {
  return isNoticeCase(record) ? noticeMatter(record.matter_type).noticeType : SERVICE_NAMES[record.service_code];
}
export function caseDestination(record: ApiCase, advocate = false) {
  if (!isNoticeCase(record)) return unbuiltCasePath(record.service_code, record.id, advocate ? 'advocate' : 'client');
  const suffix = advocate ? advocateNoticeState(record.status).screen
    : ({draft:'step1',submitted:'step6',payment_pending:'step6',client_review:'tracking',approved:'request-submitted',dispatching:'request-submitted',dispatched:'delivery',completed:'tracking'} as Record<string,string>)[record.status] ?? 'tracking';
  if (!suffix) return null;
  return `${advocate ? `/advocate/notice/${record.id}` : '/legal-notice'}/${suffix}?caseId=${encodeURIComponent(record.id)}`;
}
const serviceKeys: Record<ServiceCode, AdvCaseMatter['serviceKey']> = {
  legal_notice:'legal-notice', fir_draft:'fir', legal_advice:'legal-advice', property_search:'property-search',
  document_forensic:'forensic', high_court:'high-court', district_court:'district-court', court_marriage:'court-marriage', courier:'other',
};
const statusLabels: Record<CaseStatus, AdvCaseMatter['status']> = {
  draft:'Draft', submitted:'Submitted', payment_pending:'Payment Pending', paid:'Paid', assigning:'Assigning',
  assigned:'Needs Review', advocate_accepted:'Active', advocate_declined:'Declined', in_progress:'Active',
  client_review:'Client Review', changes_requested:'Changes Requested', approved:'Client Approved',
  dispatching:'Ready for Dispatch', dispatched:'Dispatched', completed:'Completed', cancelled:'Cancelled', refunded:'Refunded',
};
export function advocateCaseMatters(records: ApiCase[]): AdvCaseMatter[] {
  return records.slice().sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at)||b.id.localeCompare(a.id)).map(record => {
    if (isNoticeCase(record)) return advocateNoticeMatters([record])[0];
    const bucket = adminBucketFor(record.status);
    return {id:record.id,service:SERVICE_NAMES[record.service_code],serviceKey:serviceKeys[record.service_code],
      href:caseDestination(record,true)!,urgency:null,title:caseTitle(record),ref:record.reference,
      status:statusLabels[record.status],body:'',footer:'',
      bucket:bucket==='completed'||bucket==='closed'?'Resolved':bucket==='open'||record.status==='assigned'?'Needs Review':'In Progress',
      filterTags:record.status==='client_review'?['Waiting for Client']:[],action:'Open Case',actionArrow:true};
  });
}
