import { adminBucketFor, advocateFirPath, firStage, formatPaise, isNoticeCase, isFlowReportService,reportStage,noticeDate,SERVICE_NAMES, unbuiltCasePath, type ApiCase, type ServiceCode, type CaseStatus } from '@legalitt/shared';
import { advocateNoticeMatters, advocateNoticeState, advocateMatterTags } from '../legal-notice/advocateList';
import { noticeMatter } from '../../data/legalNoticeMatter';
import type { AdvCaseMatter, AdvMatterStatus } from '../../data/advocateSide';
import { incidentLabel } from '../../data/fir';

export function caseTitle(record: ApiCase) {
  return isNoticeCase(record) ? noticeMatter(record.matter_type).title : record.title?.trim() || SERVICE_NAMES[record.service_code];
}
export function caseCategory(record: ApiCase) {
  return isNoticeCase(record) ? noticeMatter(record.matter_type).noticeType : SERVICE_NAMES[record.service_code];
}
export function caseDestination(record: ApiCase, advocate = false) {
  if (!isNoticeCase(record)) return unbuiltCasePath(record.service_code, record.id, advocate ? 'advocate' : 'client', record);
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
/** What the FIR list card shows beyond the list row: the advocate's share and the latest audit note. */
export type FirCardDetail = { share_paise: string | null; note: string | null };

/** "Updated: Today · 04:18 PM" / "Yesterday · …" / "18 Oct 2026 · …", in IST (design/214). */
function updatedLabel(iso: string) {
  const at = Date.parse(iso); if (Number.isNaN(at)) return '';
  const day = (ms: number) => new Date(ms + 330 * 60000).toISOString().slice(0, 10);
  const time = new Date(at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  const label = day(at) === day(Date.now()) ? 'Today' : day(at) === day(Date.now() - 86400000) ? 'Yesterday'
    : new Date(at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
  return `Updated: ${label} · ${time}`;
}
/** Design/214's FIR card, driven by the shared C10 mapping (firStage). */
function firMatter(record: ApiCase, detail: FirCardDetail | undefined, bucket: AdvCaseMatter['bucket']): AdvCaseMatter {
  // No police submission (ISHAAN-ANSWERS 2026-11-12 Q119/Q120): the retired 'approved' state reads as completed.
  const stage = firStage(record.status === 'approved' ? { ...record, status: 'completed' } : record).advocate;
  const d = (record.details ?? {}) as { contact?: { fullName?: string }; incident?: { type?: string } };
  // The filing stores the incident type's id ("fraud"); the card shows its label ("Fraud").
  const client = d.contact?.fullName?.trim() ?? '', type = d.incident?.type?.trim() ?? '', incident = incidentLabel(type) || type;
  return {
    id: record.id, service: 'FIR DRAFT', serviceKey: 'fir',
    href: stage.screen ? advocateFirPath(record.id, stage.screen) : undefined,
    // FIR Draft has one service level, so a request without a tier is the ordinary one (design 214's tag).
    urgency: record.tier === 'urgent' ? 'URGENT' : 'ORDINARY',
    title: [client, incident].filter(Boolean).join(' · ') || SERVICE_NAMES.fir_draft,
    searchText: [client, incident].join(' '), ref: record.reference,
    fee: detail?.share_paise ? `Fee: ${formatPaise(detail.share_paise)}` : undefined,
    // The C10 chips ("New Request", "Sent to Admin", …) are display text for this card.
    status: stage.chip as AdvMatterStatus, body: detail?.note ?? '', footer: updatedLabel(record.updated_at),
    bucket, filterTags: advocateMatterTags(record.status),
    action: stage.screen ? stage.action : null, actionArrow: stage.action === 'Continue Draft',
  };
}
export function advocateCaseMatters(records: ApiCase[], fir: Record<string, FirCardDetail> = {}): AdvCaseMatter[] {
  return records.slice().sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at)||b.id.localeCompare(a.id)).map(record => {
    if (isNoticeCase(record)) return advocateNoticeMatters([record])[0];
    const bucket = adminBucketFor(record.status);
    // The dashboard's three groups read `bucket`; the cases list's chips and counters read filterTags.
    const legacy: AdvCaseMatter['bucket'] = bucket==='completed'||bucket==='closed'?'Resolved':bucket==='open'||record.status==='assigned'?'Needs Review':'In Progress';
    if (record.service_code === 'fir_draft') return firMatter(record, record.fir_card ?? fir[record.id], legacy);
    if(isFlowReportService(record.service_code)){const stage=record.report_card?.stage??reportStage(record);return {id:record.id,service:SERVICE_NAMES[record.service_code],serviceKey:serviceKeys[record.service_code],href:caseDestination(record,true)!,urgency:record.tier==='urgent'?'URGENT':'ORDINARY',title:record.report_card?.client_name??caseTitle(record),ref:record.reference,status:stage.advocate as AdvMatterStatus,body:record.report_card?.deadline_at&&record.status!=='completed'?`Expected by ${noticeDate(record.report_card.deadline_at)}`:'',footer:updatedLabel(record.updated_at),bucket:legacy,filterTags:advocateMatterTags(record.status),action:'Review Request',actionArrow:true};}
    return {id:record.id,service:SERVICE_NAMES[record.service_code],serviceKey:serviceKeys[record.service_code],
      href:caseDestination(record,true)!,urgency:null,title:caseTitle(record),ref:record.reference,
      status:statusLabels[record.status],body:'',footer:'',bucket:legacy,
      filterTags:advocateMatterTags(record.status),action:'Open Case',actionArrow:true};
  });
}
