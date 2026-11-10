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
  if(['legal_advice','district_court','high_court'].includes(service))return role==='advocate'
    ? `/advocate/consultation/${encodeURIComponent(id)}/room?caseId=${encodeURIComponent(id)}`
    : `${service==='legal_advice'?'/legal-advice/track':`/services/${service.replaceAll('_','-')}/case-details`}?step=track&caseId=${encodeURIComponent(id)}`;
  if (service === 'fir_draft') return `${role === 'advocate' ? '/advocate/fir/draft' : '/fir/status'}?caseId=${encodeURIComponent(id)}`;
  const report = ({property_search: '/property-search', document_forensic: '/document-forensic', court_marriage: '/court-marriage'} as Partial<Record<ServiceCode, string>>)[service];
  if (report) return `${role === 'advocate' ? '/advocate/service-report' : report + '/track'}?caseId=${encodeURIComponent(id)}`;
  return `${role === 'advocate' ? '/advocate/requests' : '/cases'}/${encodeURIComponent(id)}?service=${service}&caseId=${encodeURIComponent(id)}`;
}
