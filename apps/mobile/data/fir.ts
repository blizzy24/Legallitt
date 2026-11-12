// FIR Draft option lists. No sample request, price or timeline lives here: every
// FIR screen reads real data (docs/flows/FIR-DRAFT-FLOW.md).

export type IncidentType =
  | 'theft'
  | 'fraud'
  | 'assault'
  | 'harassment'
  | 'property-dispute'
  | 'cyber-crime'
  | 'other';

export type IncidentOption = { id: IncidentType; label: string };

/** Chips under the incident-type field on Step 1 (Figma F0b), in the order drawn. */
export const INCIDENT_TYPES: IncidentOption[] = [
  { id: 'theft', label: 'Theft' },
  { id: 'fraud', label: 'Fraud' },
  { id: 'assault', label: 'Assault' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'property-dispute', label: 'Property Dispute' },
  { id: 'cyber-crime', label: 'Cyber Crime' },
  { id: 'other', label: 'Other' },
];

export const incidentLabel = (id: string | null) =>
  INCIDENT_TYPES.find((t) => t.id === id)?.label ?? '';

export const FIR_STEPS = 5;
