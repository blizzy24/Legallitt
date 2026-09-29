// Property Search Report service data.
//
// ─────────────────────────────────────────────────────────────────────────────
// PRICING CONFLICT — UNRESOLVED, FLAGGED FOR THE CLIENT.
//
// design/72 draws two tiers: Ordinary ₹499 and Urgent ₹999.
// design/77's payment screen draws a total of ₹1,377.
//
// ₹1,377 is neither tier, and it is not either tier plus tax: it is the LEGAL
// NOTICE total (₹999 fee + ₹179 GST + ₹199 platform fee — see data/legalNotice.ts,
// which produces exactly that figure). design/77 appears to be the Legal Notice
// payment screen with the heading changed, the same way the FIR batch shipped Legal
// Notice payment screens verbatim.
//
// Nothing here invents a property-search invoice. The tiers below are structured
// the way data/legalNotice.ts structures its own so they CAN drive an invoice once
// the client confirms the real figures — see tierFor() and the note on each tier.
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

/** Sample values for the review screen (design/76). */
export const PROPERTY_REVIEW_SAMPLE = {
  fullName: 'Rahul Sharma',
  mobile: '+91 98765 43210',
  email: 'rahul.sharma@example.com',
  state: 'Madhya Pradesh',
  district: 'Indore',
  ward: 'Ward 42',
  tehsil: 'Kanadiya',
  colony: 'Vijay Nagar',
  propertyType: 'Residential',
  surveyNo: 'Survey No. 122/4B',
  duration: '30 Years',
};

export const PS_SERVICE = 'Property Search Report';
