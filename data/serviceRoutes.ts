import type { Href } from 'expo-router';

import type { ServiceId } from './services';

/**
 * Where each service tile goes. Services with no landing page yet are absent, and
 * their tiles stay inert rather than navigating somewhere wrong.
 */
export const SERVICE_ROUTES: Partial<Record<ServiceId, Href>> = {
  'legal-advice': '/legal-advice',
  'legal-notice': '/legal-notice',
  'fir-draft': '/fir',
  'property-search': '/property-search',
  'document-forensic': '/document-forensic',
  // designs 289–337. The District Court tile stays inert: the batch draws no
  // District Court landing — its first screen (design/299) follows the High
  // Court payment — so there is nowhere drawn for that tile to go.
  'high-court-rep': '/services/high-court',
};
