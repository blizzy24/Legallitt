// FIR Draft service data.
//
// ─────────────────────────────────────────────────────────────────────────────
// TODO — PRICING IS UNKNOWN AND DELIBERATELY ABSENT.
// The FIR batch shipped no payment designs of its own: the payment screens in the
// source batch were the Legal Notice ones verbatim (they read "Legal Notice",
// Ref #LGT-849204, ₹999). There is no FIR fee, tier or invoice here, and step 5's
// "Proceed To Pay" routes to app/fir/pay-placeholder.tsx instead of a payment flow.
// When the client confirms FIR pricing, add it here — next to the service tiers in
// data/legalNotice.ts for consistency — and replace that placeholder route.
// ─────────────────────────────────────────────────────────────────────────────

export type IncidentType =
  | 'theft'
  | 'fraud'
  | 'assault'
  | 'harassment'
  | 'property-dispute'
  | 'cyber-crime'
  | 'other';

export type IncidentOption = { id: IncidentType; label: string };

/** Chips under the incident-type field on design/42, in the order drawn. */
export const INCIDENT_TYPES: IncidentOption[] = [
  { id: 'theft', label: 'Theft' },
  { id: 'fraud', label: 'Fraud' },
  { id: 'assault', label: 'Assault' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'property-dispute', label: 'Property Dispute' },
  { id: 'cyber-crime', label: 'Cyber Crime' },
  { id: 'other', label: 'Other' },
];

export const incidentLabel = (id: IncidentType | null) =>
  INCIDENT_TYPES.find((t) => t.id === id)?.label ?? '';

/** Placeholder copy for the jurisdiction selects on design/42. Not real data. */
export const JURISDICTION_PLACEHOLDERS = {
  state: '[ Select state ]',
  district: '[ Select district ]',
  policeStation: '[ Select police station ]',
  incidentType: '[ Select incident type ]',
};

/**
 * Sample values for the step 5 review screen, used where the flow has nothing
 * entered yet. Mirrors how data/legalNotice.ts carries design sample values.
 */
export const FIR_REVIEW_SAMPLE = {
  fullName: 'Suresh Kumar',
  mobile: '+91 98765 43210',
  email: 'suresh.kumar@example.com',
  incidentType: 'Theft',
  state: 'Madhya Pradesh',
  district: 'Indore',
  policeStation: 'Vijay Nagar',
  incidentDate: '2026-09-18',
  documents: 3,
};

/** Reference shown after submission (design/47). */
export const FIR_REQUEST = {
  service: 'FIR Draft',
  requestId: 'FIR2026091801',
  turnaround: '12–24 Hours',
};

export const FIR_STEPS = 5;
