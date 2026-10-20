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
