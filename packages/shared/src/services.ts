// Service identifiers corresponding to architecture §1.
export const SERVICE_CODES = [
  "legal_notice",
  "fir_draft",
  "legal_advice",
  "property_search",
  "document_forensic",
  "high_court",
  "district_court",
  "court_marriage",
  "courier"
] as const;
export type ServiceCode = typeof SERVICE_CODES[number];

export const SERVICE_NAMES: Record<ServiceCode, string> = {
  "legal_notice": "Legal Notice",
  "fir_draft": "FIR Draft",
  "legal_advice": "Legal Advice",
  "property_search": "Property Search Report",
  "document_forensic": "Document Forensic",
  "high_court": "High Court Representation",
  "district_court": "District Court Representation",
  "court_marriage": "Court Marriage",
  "courier": "Courier"
};

/**
 * Services that stay in code and data but are not offered right now.
 * Q79/Q113 (docs/flows/ISHAAN-ANSWERS-2026-11-12.md): Court Marriage is not part
 * of Legalitt for now. This is the ONE switch: client entry points, advocate
 * filters, the admin sidebar, the public service and pricing endpoints and new
 * case creation all read it. Existing cases stay readable to their owners.
 * Re-enable a service by removing it from this list.
 */
export const HIDDEN_SERVICES: readonly ServiceCode[] = ["court_marriage"];

/** True for a known service that is currently offered (not in HIDDEN_SERVICES). */
export function isServiceOffered(code: string | null | undefined): boolean {
  return typeof code === "string"
    && (SERVICE_CODES as readonly string[]).includes(code)
    && !(HIDDEN_SERVICES as readonly string[]).includes(code);
}

/** SERVICE_CODES without the hidden ones, in the same order. */
export const OFFERED_SERVICE_CODES: readonly ServiceCode[] = SERVICE_CODES.filter(isServiceOffered);

/** The refusal shown when a hidden service is requested, e.g. "Court Marriage isn't offered right now." */
export function serviceNotOfferedMessage(code: ServiceCode): string {
  return `${SERVICE_NAMES[code]} isn't offered right now.`;
}
