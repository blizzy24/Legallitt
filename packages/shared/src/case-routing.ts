import type { ServiceCode } from './services';
import { firStage, type FirAdvocateScreen } from './fir-flow';

// Keep existing notice URLs stable. Other services use shared case destinations;
// mobile's existing API availability boundary keeps unbuilt workflows unavailable.
export function adminCaseListPath(service: ServiceCode) {
  return service === 'legal_notice' ? '/legal-notices' : `/services/${service}/cases`;
}
export function adminCasePath(service: ServiceCode, id: string) {
  return `${adminCaseListPath(service)}/${encodeURIComponent(id)}`;
}
// docs/flows/FIR-DRAFT-FLOW.md A1: each advocate FIR screen (A2 request, A3 documents,
// A5 draft, A6 status, A7 completed). The screen comes from firStage().advocate.screen.
const FIR_ADVOCATE_ROUTES: Record<Exclude<FirAdvocateScreen, 'request'>, string> = {documents: 'documents', draft: 'draft', status: 'review', completed: 'completed'};
export function advocateFirPath(id: string, screen: FirAdvocateScreen) {
  const query = `caseId=${encodeURIComponent(id)}`;
  return screen === 'request' ? `/advocate/fir/${encodeURIComponent(id)}?${query}` : `/advocate/fir/${FIR_ADVOCATE_ROUTES[screen]}?${query}`;
}
export function unbuiltCasePath(service: ServiceCode, id: string, role: 'client' | 'advocate', state?: {status: string; sub_status?: string | null}) {
  if(['legal_advice','district_court','high_court'].includes(service))return role==='advocate'
    ? `/advocate/consultation/${encodeURIComponent(id)}/room?caseId=${encodeURIComponent(id)}`
    : `${service==='legal_advice'?'/legal-advice/track':`/services/${service.replaceAll('_','-')}/case-details`}?step=track&caseId=${encodeURIComponent(id)}`;
  // Without a known state the advocate lands on the status screen (A6), which handles every state.
  if (service === 'fir_draft') return role === 'advocate' ? advocateFirPath(id, (state && firStage(state).advocate.screen) || 'status') : `/fir/status?caseId=${encodeURIComponent(id)}`;
  const report = ({property_search: '/property-search', document_forensic: '/document-forensic', court_marriage: '/court-marriage'} as Partial<Record<ServiceCode, string>>)[service];
  if (report) return `${role === 'advocate' ? '/advocate/service-report' : report + '/track'}?caseId=${encodeURIComponent(id)}`;
  return `${role === 'advocate' ? '/advocate/requests' : '/cases'}/${encodeURIComponent(id)}?service=${service}&caseId=${encodeURIComponent(id)}`;
}
