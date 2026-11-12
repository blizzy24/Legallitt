// Single source of truth for the service catalogue.
//
// UNCONFIRMED COPY — the two designs disagree in places and the client has not said
// which wording is correct. Until they do, each screen keeps the wording its own design
// shows, so neither screen changes appearance:
//   - `description` is the All Services wording (design/10)
//   - `homeDescription` is the Home wording (design/11 + 12) where it differs
// The same applies to `icon` / `homeIcon`. Once the client picks, delete the `home*`
// overrides and the screens will converge automatically.
//
// `title` is the full service name, printed on Home (design/11 + 12). All Services
// (design/10) prints `shortTitle`.

import { isServiceOffered, type ServiceCode } from '@legalitt/shared';

export type ServiceId =
  | 'legal-advice'
  | 'legal-notice'
  | 'fir-draft'
  | 'cheque-bounce'
  | 'property-search'
  | 'document-forensic'
  | 'court-marriage'
  | 'high-court-rep'
  | 'district-court-rep';

export type ServiceIconKey =
  | 'message-circle'
  | 'message-square'
  | 'file-text'
  | 'clipboard-list'
  | 'pen-line'
  | 'credit-card'
  | 'house'
  | 'shield-check'
  | 'blend'
  | 'landmark'
  | 'user-check'
  | 'square-pen';

export type Service = {
  id: ServiceId;
  title: string;
  shortTitle: string;
  description: string;
  icon: ServiceIconKey;
  /** Home (design/11 + 12) overrides — see note above. */
  homeDescription?: string;
  homeIcon?: ServiceIconKey;
};

export const SERVICES: Service[] = [
  {
    id: 'legal-advice',
    title: 'Legal Advice',
    shortTitle: 'Legal Advice',
    // Variants: "Guidance from a qualified advocate" (design/10),
    //           "Get guidance from a qualified advocate" (design/09)
    description: 'Guidance from a qualified advocate',
    homeDescription: 'Get guidance from a qualified advocate',
    icon: 'message-square',
    homeIcon: 'message-circle',
  },
  {
    id: 'legal-notice',
    title: 'Legal Notice',
    shortTitle: 'Legal Notice',
    // Variants: "Prepare and send a professional legal notice" (design/10),
    //           "Prepare and send a professional notice" (design/09)
    description: 'Prepare and send a professional legal notice',
    homeDescription: 'Prepare and send a professional notice',
    icon: 'file-text',
  },
  {
    id: 'fir-draft',
    title: 'FIR Draft',
    shortTitle: 'FIR Draft',
    // Variants: "Get assistance with preparing an FIR draft" (design/10),
    //           "Assistance with precise FIR drafting" (design/09)
    description: 'Get assistance with preparing an FIR draft',
    homeDescription: 'Assistance with precise FIR drafting',
    icon: 'pen-line',
    homeIcon: 'square-pen',
  },
  {
    id: 'cheque-bounce',
    title: 'Cheque Bounce',
    shortTitle: 'Cheque Bounce',
    // Only appears on Home (design/09).
    description: 'Assistance for dishonour matters',
    icon: 'credit-card',
  },
  {
    id: 'property-search',
    title: 'Property Search',
    shortTitle: 'Property Search',
    // Variants: "Get property records reviewed and obtain report" (design/10),
    //           "Check records and legal verification" (design/09)
    description: 'Get property records reviewed and obtain report',
    homeDescription: 'Check records and legal verification',
    icon: 'house',
  },
  {
    id: 'document-forensic',
    title: 'Document Forensic',
    shortTitle: 'Document Forensic',
    // Variants: "Examine authenticity and inconsistencies" (design/10),
    //           "Examine documents by expert" (design/11 + 12),
    //           "Examine documents by expert panel" (design/09, superseded)
    description: 'Examine authenticity and inconsistencies',
    homeDescription: 'Examine documents by expert',
    icon: 'shield-check',
    homeIcon: 'clipboard-list',
  },
  {
    id: 'court-marriage',
    title: 'Court Marriage',
    shortTitle: 'Court Marriage',
    // Restored by the owner's 11 Nov 2026 instruction to make this service purchasable.
    description: 'Assistance with court marriage procedures',
    icon: 'blend',
  },
  {
    id: 'high-court-rep',
    title: 'High Court Representation',
    shortTitle: 'High Court Rep.',
    // Variants: "Connect for High Court legal representation" (design/10),
    //           "Connect for High court Legal representation" (design/11),
    //           "Expert legal representation before the High Court" (design/12)
    // 11 and 12 disagree; using 12's wording on home until the client confirms.
    description: 'Connect for High Court legal representation',
    homeDescription: 'Expert legal representation before the High Court',
    // design/10, /11, /12 and /13 all draw this as the house glyph, not a landmark.
    icon: 'house',
  },
  {
    id: 'district-court-rep',
    title: 'District Court Representation',
    shortTitle: 'District Court Rep.',
    // Variants: "Advocates for District Court representation" (design/10),
    //           "Advocates for District Court Representation" (design/11),
    //           "Trusted legal representation before District Courts" (design/12)
    // 11 and 12 disagree; using 12's wording on home until the client confirms.
    description: 'Advocates for District Court representation',
    homeDescription: 'Trusted legal representation before District Courts',
    icon: 'user-check',
    homeIcon: 'house',
  },
];

/** The two "Popular Services" cards on Home (design/11 + 12). */
export const POPULAR_SERVICE_IDS: ServiceId[] = ['legal-advice', 'legal-notice'];

/**
 * Order shown in the Home "Our Services" grid (design/11 + 12). Cheque Bounce and
 * Court Marriage are in the catalogue but do not appear on Home.
 */
export const HOME_SERVICE_IDS: ServiceId[] = [
  'legal-advice',
  'legal-notice',
  'fir-draft',
  'property-search',
  'document-forensic',
  'high-court-rep',
  'district-court-rep',
];

/**
 * Order shown on the All Services screen (design/13, supersedes design/10).
 * D-05: Court Marriage is hidden from client entry points (no client design; not on
 * either drawn list). Q79/Q113 (12 Nov): it is not offered at all for now; the shared
 * HIDDEN_SERVICES switch also filters it here, so it stays off even if re-listed.
 * Its code and existing cases stay; /court-marriage takes no new requests.
 */
export const ALL_SERVICE_IDS: ServiceId[] = [
  'legal-notice',
  'property-search',
  'fir-draft',
  'high-court-rep',
  'document-forensic',
  'legal-advice',
  'district-court-rep',
];

export type ResolvedService = {
  id: ServiceId;
  title: string;
  shortTitle: string;
  description: string;
  icon: ServiceIconKey;
};

function byId(id: ServiceId): Service {
  const service = SERVICES.find((s) => s.id === id);
  if (!service) throw new Error(`Unknown service id: ${id}`);
  return service;
}

/** The API service behind each catalogue entry (Cheque Bounce has none). */
const SERVICE_CODE_BY_ID: Partial<Record<ServiceId, ServiceCode>> = {
  'legal-advice': 'legal_advice',
  'legal-notice': 'legal_notice',
  'fir-draft': 'fir_draft',
  'property-search': 'property_search',
  'document-forensic': 'document_forensic',
  'court-marriage': 'court_marriage',
  'high-court-rep': 'high_court',
  'district-court-rep': 'district_court',
};

/** Q79/Q113: a service in the shared HIDDEN_SERVICES switch is never listed or searchable. */
export const isServiceIdOffered = (id: ServiceId) => {
  const code = SERVICE_CODE_BY_ID[id];
  return !code || isServiceOffered(code);
};

/** Services for a screen, in that screen's order and with its wording/icons. */
export function servicesFor(screen: 'home' | 'all'): ResolvedService[] {
  const ids = (screen === 'home' ? HOME_SERVICE_IDS : ALL_SERVICE_IDS).filter(isServiceIdOffered);
  return ids.map((id) => {
    const s = byId(id);
    return {
      id: s.id,
      title: s.title,
      shortTitle: s.shortTitle,
      description: (screen === 'home' && s.homeDescription) || s.description,
      icon: (screen === 'home' && s.homeIcon) || s.icon,
    };
  });
}

export const homeServices = () => servicesFor('home');
export const allServices = () => servicesFor('all');

/** The two cards under the "Popular Services" heading. */
export const popularServices = (): ResolvedService[] =>
  homeServices().filter((s) => POPULAR_SERVICE_IDS.includes(s.id));
