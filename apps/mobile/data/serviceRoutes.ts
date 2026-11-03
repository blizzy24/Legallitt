import type { Href } from 'expo-router';

import type { ServiceId } from './services';

/**
 * Where each service tile goes. Services with no landing page yet are absent, and
 * their tiles stay inert rather than navigating somewhere wrong.
 */
export const SERVICE_ROUTES: Partial<Record<ServiceId, Href & string>> = {
  'legal-advice': '/legal-advice',
  'legal-notice': '/legal-notice',
  'fir-draft': '/fir',
  'property-search': '/property-search',
  'document-forensic': '/document-forensic',
  // designs 289–337 and 338–355.
  'high-court-rep': '/services/high-court',
  'district-court-rep': '/services/district-court',
};
