// Property Search Report service data.
//
// ─────────────────────────────────────────────────────────────────────────────
// PRICING — FLAGGED FOR THE CLIENT.
//
// design/72 draws two tiers: Ordinary ₹499 and Urgent ₹999, with Ordinary selected.
// design/77's payment screen draws a total of ₹1,377.
//
// Applying the Legal Notice formula (fee + 18% GST truncated + ₹199 platform fee)
// gives ₹787 for Ordinary and ₹1,377 for Urgent. So design/77's figure is NOT
// arbitrary — it is the URGENT total. It is also, exactly, the Legal Notice total,
// because both services price their top tier at ₹999 and share the same formula.
//
// The conflict that remains: design/77 shows the URGENT total on a flow whose
// landing screen pre-selects ORDINARY, so the two screens disagree about which tier
// the user is paying for. The payment screen therefore computes the invoice from the
// tier actually chosen rather than hardcoding either figure.
// ─────────────────────────────────────────────────────────────────────────────

export type PropertyTierId = 'ordinary' | 'urgent';

export type PropertyTier = {
  id: PropertyTierId;
  /** The small caps chip: STANDARD / PRIORITY. */
  badge: string;
  /** The tier's own name: Ordinary / Urgent. */
  label: string;
  price: number;
  /** design/72 prints the price with a trailing slash-dash. */
  priceSuffix: string;
  note: string;
};

export const PROPERTY_TIERS: PropertyTier[] = [
  {
    id: 'ordinary',
    badge: 'STANDARD',
    label: 'Ordinary',
    price: 499,
    priceSuffix: '/-',
    note: 'Standard processing',
  },
  {
    id: 'urgent',
    badge: 'PRIORITY',
    label: 'Urgent',
    price: 999,
    priceSuffix: '/-',
    note: 'Priority processing',
  },
];

export function tierFor(id: PropertyTierId): PropertyTier {
  return PROPERTY_TIERS.find((t) => t.id === id) ?? PROPERTY_TIERS[0];
}

// ── Property types (design/75), in the order drawn ──

export type PropertyTypeId =
  | 'residential'
  | 'commercial'
  | 'agricultural'
  | 'plot'
  | 'industrial'
  | 'apartment'
  | 'other';

export const PROPERTY_TYPES: { id: PropertyTypeId; label: string }[] = [
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'agricultural', label: 'Agricultural' },
  { id: 'plot', label: 'Plot / Land' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'apartment', label: 'Apartment / Flat' },
  { id: 'other', label: 'Other' },
];

export const propertyTypeLabel = (id: PropertyTypeId | null) =>
  PROPERTY_TYPES.find((t) => t.id === id)?.label ?? '';

// ── Search duration (design/74) ──

export type SearchDuration = '15' | '30' | 'full';

export const SEARCH_DURATIONS: { id: SearchDuration; label: string }[] = [
  { id: '15', label: '15 Years' },
  { id: '30', label: '30 Years' },
  { id: 'full', label: 'Full Record' },
];

/** design/74 labels the field "Recommended: 30 Yrs" and pre-selects 30 Years. */
export const RECOMMENDED_DURATION: SearchDuration = '30';

/**
 * Placeholders for the jurisdiction pickers on design/74.
 *
 * REPORTED — design/74 draws "Madhya Pradesh" as the value in EVERY jurisdiction
 * dropdown, including Ward Number and Colony, where it cannot be a real value. They
 * are treated as placeholder text, so each picker renders unselected with its own
 * placeholder rather than carrying a nonsensical default.
 */
export const JURISDICTION_PLACEHOLDERS = {
  state: 'Select state',
  district: 'Select district',
  // Kept short so the paired pickers stay one line at 390pt, as design/74 draws them.
  ward: 'Select ward',
  tehsil: 'Select tehsil',
  colony: 'Select colony',
  propertyType: 'Select property type',
};

export const SURVEY_PLACEHOLDER = 'e.g. Survey No. 122/4B';

/**
 * Sample values for the review screen (design/76), used where the flow has nothing
 * entered. These are the file's own values.
 *
 * REPORTED — design/76 shows a "Purpose of Report" row ("Buying a New Property")
 * that the request form on design/74 never collects. It is rendered as drawn and
 * always falls back to this sample, because nothing upstream can set it.
 */
export const PROPERTY_REVIEW_SAMPLE = {
  fullName: 'Abhishek Saho',
  mobile: '+91 99898987898',
  email: 'abhishek@gmail.com',
  locationLine1: '123, Vijay Nagar Indore',
  locationLine2: 'Indore 452001',
  propertyType: 'Residential',
  purpose: 'Buying a New Property',
  deliveryLabel: 'Estimate Delivery Time',
  delivery: '3 - 5 Working Days',
};

export const PS_SERVICE = 'Property Search Report';

/**
 * Request reference. design/77 and design/78 both use #PSR739482.
 *
 * REPORTED — design/80 instead prints "DF-2026-000245", which appears nowhere else
 * in the flow. PSR739482 is used throughout; see app/property-search/completed.tsx.
 */
export const PS_REQUEST_ID = '#PSR739482';

/**
 * Invoice, computed the same way data/legalNotice.ts computes its own: the tier fee,
 * 18% GST truncated (not rounded), and a flat platform fee.
 *
 * design/77 prints ₹1,377, which this formula produces for the URGENT tier — but
 * design/72 pre-selects ORDINARY (₹787). The figure is not hardcoded; the invoice is
 * computed from whichever tier the user actually picked. See the header note.
 */
export const PS_GST_RATE = 0.18;
export const PS_PLATFORM_FEE = 199;

export type PsInvoiceLine = { label: string; amount: number };

export function psInvoiceLines(tierId: PropertyTierId): PsInvoiceLine[] {
  const fee = tierFor(tierId).price;
  return [
    { label: 'Service Fee', amount: fee },
    { label: 'Goods & Services Tax (GST 18%)', amount: Math.floor(fee * PS_GST_RATE) },
    { label: 'Platform fees', amount: PS_PLATFORM_FEE },
  ];
}

export function psInvoiceTotal(tierId: PropertyTierId) {
  return psInvoiceLines(tierId).reduce((sum, l) => sum + l.amount, 0);
}

// ── Track (design/78) ──
//
// REPORTED — design/78's timestamps read 22–23 May 2026. Every other dated screen in
// the app uses September 2026 (data/cases.ts, data/legalNotice.ts, data/fir.ts), so
// these are moved to September to stay consistent. The times and the day-apart
// spacing the file draws are kept.

export type PsStageState = 'done' | 'active' | 'pending';

export type PsStage = {
  title: string;
  /** Timestamp for the reached stages; the pending ones read "Pending" instead. */
  detail: string;
  state: PsStageState;
};

export const PS_STAGES: PsStage[] = [
  { title: 'Request Submitted', detail: '22 Sep 2026, 10:30 AM', state: 'done' },
  { title: 'Payment Received', detail: '23 Sep 2026, 10:30 AM', state: 'done' },
  { title: 'Verification in Progress', detail: '23 Sep 2026, 10:30 AM', state: 'active' },
  { title: 'Assign Advocate', detail: 'Pending', state: 'pending' },
  { title: 'Report Preparation', detail: 'Pending', state: 'pending' },
  { title: 'Report Delivered', detail: 'Pending', state: 'pending' },
];

export const PS_TRACK_STATUS = 'In Progress';

// ── Checking (design/79) ──
//
// REPORTED — this list mixes two different things. "Ownership Verification" is a
// check being performed; the other four are the tracking timeline's own stages
// (design/78 lists Payment Received, Verification in Progress, Report Preparation
// and Report Delivered as progress steps, not as things being checked). Drawn as the
// file has it, under the heading "What We Are Checking".
export const PS_CHECKING = [
  'Ownership Verification',
  'Payment Received',
  'Verification in Progress',
  'Report Preparation',
  'Report Delivered',
];

export const PS_CHECKING_NOTE =
  'This may take 3 - 5 working days depending on the property and record';

// ── Completed (design/80) ──
export const PS_COMPLETED = {
  title: 'Analysis Completed Successfully',
  body: 'Your Property Search Report analysis report is ready and has been delivered securely.',
  status: 'Completed',
};
