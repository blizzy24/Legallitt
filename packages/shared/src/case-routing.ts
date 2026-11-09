import type { ServiceCode } from './services';

// Keep existing notice URLs stable. Other services use shared case destinations;
// mobile's existing API availability boundary keeps unbuilt workflows unavailable.
export function adminCaseListPath(service: ServiceCode) {
  return service === 'legal_notice' ? '/legal-notices' : `/services/${service}/cases`;
}
export function adminCasePath(service: ServiceCode, id: string) {
  return `${adminCaseListPath(service)}/${encodeURIComponent(id)}`;
}
export function unbuiltCasePath(service: ServiceCode, id: string, role: 'client' | 'advocate') {
  if (service === 'fir_draft') return `${role === 'advocate' ? '/advocate/fir/draft' : '/fir/status'}?caseId=${encodeURIComponent(id)}`;
  return `${role === 'advocate' ? '/advocate/requests' : '/cases'}/${encodeURIComponent(id)}?service=${service}&caseId=${encodeURIComponent(id)}`;
}
