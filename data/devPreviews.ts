import type { DevPreviewGroup } from '../components/DevPreviewLinks';

// DEVELOPMENT ONLY. Screens no designed navigation reaches, listed for the
// grouped preview links on the advocate dashboard and the client home. Each
// entry is the first screen of its group; the rest are reached from it by
// tapping. See components/DevPreviewLinks.tsx.

export const ADVOCATE_DEV_PREVIEWS: DevPreviewGroup[] = [
  {
    label: 'CONSULTATION CHAT',
    links: [
      { label: 'advocate chat (design/168)', href: '/advocate/consultation/la-2026-1048/chat' },
      { label: 'Legalitt AI chat (design/170)', href: '/advocate/ai' },
    ],
  },
  {
    label: 'COURIER — ADVOCATE',
    links: [{ label: 'confirm documents received (design/282)', href: '/advocate/courier/confirm' }],
  },
  {
    label: 'REVIEWS',
    links: [{ label: 'reviews & ratings (design/264)', href: '/advocate/reviews' }],
  },
  {
    label: 'HIGH COURT / DISTRICT COURT',
    links: [
      // No drawn control leads here. DC case preparation (design/313) is no
      // longer a preview: View Case on design/355 reaches it.
      { label: 'HC documents delivered (design/312)', href: '/services/high-court/courier/delivered' },
    ],
  },
  {
    label: 'OUTCOME STATES',
    links: [
      { label: 'verification incomplete (design/241)', href: '/advocate/verify/incomplete' },
      { label: 'verification needs update (design/243)', href: '/advocate/verify/needs-update' },
      { label: 'forensic payment received (design/232)', href: '/advocate/forensic/paid' },
    ],
  },
];

export const CLIENT_DEV_PREVIEWS: DevPreviewGroup[] = [
  {
    label: 'COURIER — CLIENT',
    links: [
      { label: 'choose how to send (design/275)', href: '/courier/choose' },
      // Courier success (design/279) is no longer a preview: design/278's
      // "Pay using UPI App" button reaches it.
    ],
  },
  {
    label: 'HIGH COURT / DISTRICT COURT',
    links: [
      // No drawn control leads here. DC case preparation (design/313) is no
      // longer a preview: View Case on design/355 reaches it.
      { label: 'HC documents delivered (design/312)', href: '/services/high-court/courier/delivered' },
    ],
  },
  {
    label: 'OUTCOME STATES',
    links: [
      { label: 'property search — what we are checking (design/79)', href: '/property-search/checking' },
      { label: 'property search — completed (design/80)', href: '/property-search/completed' },
      { label: 'document forensic — report (design/90)', href: '/document-forensic/report' },
    ],
  },
  {
    label: 'BEHIND THE PAYMENT PLACEHOLDER',
    links: [
      { label: 'FIR submitted (design/47)', href: '/fir/submitted' },
      { label: 'legal advice confirmed (design/89)', href: '/legal-advice/confirmed' },
      { label: 'legal advice chat session (design/113)', href: '/legal-advice/session/chat' },
      { label: 'legal advice video session (design/114)', href: '/legal-advice/session/video' },
      { label: 'legal advice audio session (design/115)', href: '/legal-advice/session/audio' },
      { label: 'legal advice completed (design/116)', href: '/legal-advice/completed' },
      { label: 'legal advice rate & review (design/119)', href: '/legal-advice/rate' },
    ],
  },
];
