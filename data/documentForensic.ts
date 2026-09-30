// Document Forensic service data.
//
// ─────────────────────────────────────────────────────────────────────────────
// PRICING CONFLICT — FLAGGED, NOT RESOLVED.
//
// design/82 draws two tiers: Ordinary ₹1,499 and Urgent ₹2,999, with Ordinary
// selected and the footer bar reading "Fee: ₹1,499".
//
// design/86's payment screen draws a Service Fee of ₹3,167 — which matches NEITHER
// tier, and is not either tier plus anything. Its GST line (₹570) is internally
// consistent with ₹3,167 at 18%, so the fee is the odd figure rather than the tax.
//
// design/86 also carries "Ref ID: #LGT-849204" — the LEGAL NOTICE reference, the
// same one the FIR batch's payment screens shipped with. That screen has been
// through at least one copy-paste.
//
// The invoice below is computed from the tiers instead, using the method the other
// services use (fee + 18% GST truncated + ₹199 platform fee):
//
//     Ordinary  ₹1,499 + ₹269 + ₹199 = ₹1,967
//     Urgent    ₹2,999 + ₹539 + ₹199 = ₹3,737
//
// Neither is ₹3,939, design/86's drawn total. Nothing here reproduces ₹3,167.
// ─────────────────────────────────────────────────────────────────────────────

export type DfTierId = 'ordinary' | 'urgent';

export type DfTier = {
  id: DfTierId;
  /** Small caps chip: STANDARD / PRIORITY. */
  badge: string;
  /** The note beside the badge, right of it on design/82. */
  processing: string;
  label: string;
  price: number;
  description: string;
};

export const DF_TIERS: DfTier[] = [
  {
    id: 'ordinary',
    badge: 'STANDARD',
    processing: 'Regular processing',
    label: 'Ordinary',
    price: 1499,
    description: 'Standard document forensic processing.',
  },
  {
    id: 'urgent',
    badge: 'PRIORITY',
    processing: 'Faster handling',
    label: 'Urgent',
    price: 2999,
    description: 'Priority document forensic processing.',
  },
];

export function dfTierFor(id: DfTierId): DfTier {
  return DF_TIERS.find((t) => t.id === id) ?? DF_TIERS[0];
}

export const DF_GST_RATE = 0.18;
export const DF_PLATFORM_FEE = 199;

export type DfInvoiceLine = { label: string; amount: number };

export function dfInvoiceLines(tierId: DfTierId): DfInvoiceLine[] {
  const fee = dfTierFor(tierId).price;
  return [
    { label: 'Service Fee', amount: fee },
    // Truncated, not rounded — design/28 and design/86 both truncate.
    { label: 'Goods & Services Tax (GST 18%)', amount: Math.floor(fee * DF_GST_RATE) },
    // design/86 prints "Plat form fees"; rendered as "Platform fees".
    { label: 'Platform fees', amount: DF_PLATFORM_FEE },
  ];
}

export function dfInvoiceTotal(tierId: DfTierId) {
  return dfInvoiceLines(tierId).reduce((sum, l) => sum + l.amount, 0);
}

/**
 * ₹25 per page above 25 pages.
 *
 * NOTE — THIS LOOKS PLATFORM-WIDE, NOT SERVICE-SPECIFIC. The identical rule is drawn
 * on the FIR batch's design/45 ("₹25 per page for every page above 25 pages"), where
 * it was also flagged because it appears in no invoice. Two unrelated services
 * carrying the same per-page overage suggests it is a platform rule that belongs in
 * one shared place — and that the invoices which omit it are the ones in error.
 * Kept per service until the client confirms which.
 */
export const PAGE_OVERAGE = { perPage: 25, freePages: 25 };
export const PAGE_OVERAGE_NOTE = '₹25 per page for every page above 25 pages.';

// ── Document types for the picker on design/84 ──
//
// design/84 draws only the CLOSED dropdown reading "Agreement / Contract", and no
// open list anywhere in the batch. The options below are inferred from the document
// kinds design/83 names in its "When Should You Consider Document Forensics?" list,
// plus the "Property Deed" that design/86's reference line mentions. Reported.

export type DfDocTypeId =
  | 'agreement'
  | 'property-deed'
  | 'affidavit'
  | 'signature'
  | 'digital'
  | 'government'
  | 'other';

export const DF_DOC_TYPES: { id: DfDocTypeId; label: string }[] = [
  { id: 'agreement', label: 'Agreement / Contract' },
  { id: 'property-deed', label: 'Property Deed' },
  { id: 'affidavit', label: 'Affidavit / Declaration' },
  { id: 'signature', label: 'Signature / Handwriting' },
  { id: 'digital', label: 'Digital Document / Screenshot' },
  { id: 'government', label: 'Government Document' },
  { id: 'other', label: 'Other' },
];

export const dfDocTypeLabel = (id: DfDocTypeId | null) =>
  DF_DOC_TYPES.find((t) => t.id === id)?.label ?? '';

/** design/82's "WHAT YOU RECEIVE" card, in the order drawn. */
export const DF_DELIVERABLES = [
  'Forensic review findings',
  'Key observations summary',
  'Document-based report',
  'Access via secure portal',
];

/** Sample values for the review (design/85) and report (design/90) screens. */
export const DF_SAMPLE = {
  documentName: 'Questioned_Contract_Page3.pdf',
  documentMeta: 'Signature clause under analysis',
  documentSize: '3.2 MB',
  documentFormat: 'PDF',
  docType: 'Agreement / Contract',
  referenceName: 'Agreement_2022_Signed.pdf',
  referenceSize: '2.4 MB',
  referenceState: 'Reference Verified',
  instructions:
    'Compare signature on page 3 clause 12 against known signature in reference agreement.',
  requestId: '#DF-2026-000245',
};

export const DF_SERVICE = 'Online Document Forensic';
