import { gst18, moneyTotal } from './tax';

// Legal Notice service data: prices and the payment invoice. Everything money-related
// on the detail, payment, scan-pay and success screens reads from here.

export type InvoiceLine = { label: string; amount: number };

// Two price points from design/22 (service detail). Which is which is confirmed
// there; the payment invoice charges the standard fee.
// UNCONFIRMED: the current urgent taxable base is ₹1,377 (₹999 service +
// ₹179 delivery + ₹199 platform), derived from design/279’s unconfirmed figure.
// Keep these values pending client confirmation; update the fee constants here
// when confirmed, and all Notice invoices/payment totals will follow.
export const LEGAL_NOTICE_PRICES = {
  standard: 999,
  express: 699,
};

export const INVOICE = {
  service: 'Legal Notice',
  refId: 'LGT-849204',
  // design/30 shows PSR739482; design/31–32 show LN12345678. One ID everywhere.
  requestId: 'LN12345678',
};

export const GST_RATE = 0.18;
/** design/28 draws a flat ₹199 with no percentage, so it does not scale with the fee. */
export const PLATFORM_FEE = 199;
/** design/434 draws this base fee. Client authorised correcting the arithmetic. */
export const NOTICE_DELIVERY_FEE = 179;

/**
 * The invoice for a given service tier. The Service Fee is the tier's price, so
 * picking ORDINARY on the detail screen lowers the whole bill.
 */
export function invoiceLines(tierId: ServiceTier['id']): InvoiceLine[] {
  const fee = tierFor(tierId).price;
  return [
    { label: 'Service Fee', amount: fee },
    { label: 'Legal Notice Delivery Fee', amount: NOTICE_DELIVERY_FEE },
    // 434's static ₹199 GST and ₹1,377 total do not add up. All displayed fees
    // are exclusive of GST; client approved computing 18% on their sum.
    { label: 'Goods & Services Tax (GST 18%)', amount: gst18(moneyTotal(fee, NOTICE_DELIVERY_FEE, PLATFORM_FEE)) },
    { label: 'Platform fees', amount: PLATFORM_FEE },
  ];
}

export function invoiceTotal(lines: InvoiceLine[]) {
  return moneyTotal(...lines.map((l) => l.amount));
}

/** "₹1,377" — Indian grouping for the amounts this app shows. */
export function rupees(n: number, grouped = true) {
  return '₹' + (grouped ? n.toLocaleString('en-IN') : String(n));
}

// Tracking screens 31, 32 and 437: dates follow the supplied May 2026 design.
export type TrackingState = 'drafting' | 'approval';

export const TRACKING = {
  // design/31 reads "Ref: LN-2026/05" while the invoice's Ref ID is #LGT-849204.
  ref: 'LN-2026/05',
  submittedOn: '2026-05-23',
  submittedAt: '10:30 AM',
  estimate: { date: '2026-05-25', time: '6 PM' },
  // Near-duplicate of data/cases.ts's "Adv. Arjun Nair" — the file names Sharma.
  advocate: {
    name: 'Adv. Arjun Sharma',
    initials: 'AS',
    experience: '8+ Years Experience',
    practice: 'Property Law',
    barReg: 'D/1842/2016',
    rating: 4.9,
    reviews: 142,
  },
  draftFile: 'Legal_Notice_Draft_v1.pdf',
};

export type TrackingStep = { title: string; description: string };

export const TRACKING_STEPS: TrackingStep[] = [
  { title: 'Request Submitted', description: 'Your legal notice request has been received.' },
  { title: 'Payment Confirmed', description: 'Payment successfully received.' },
  { title: 'Advocate Assigned', description: 'A verified advocate has been assigned.' },
  { title: 'Drafting in Progress', description: 'Your legal notice is currently being prepared.' },
  { title: 'Awaiting Your Approval', description: 'Review and approve the draft before dispatch.' },
  { title: 'Notice Dispatched', description: 'Your approved notice will be sent to the recipient.' },
  { title: 'Delivery Confirmed', description: 'Delivery status will appear here.' },
];

/** 1-based index of the current step for each state. */
export const TRACKING_CURRENT: Record<TrackingState, number> = { drafting: 4, approval: 5 };

// Service tiers shown on the detail screen (design/22). `standard` is the fee the
// payment screen charges, so the two can't drift.
export type ServiceTier = {
  id: 'urgent' | 'ordinary';
  label: string;
  /** "Urgent Tier" — the status-card wording on design/31. */
  tierLabel: string;
  price: number;
  /** design/22's casing, used on the detail screen. */
  speed: string;
  /** design/31 capitalises "Days" in the tracking table; kept per screen. */
  trackingSpeed: string;
  note: string;
  /** Wording used by the selected-summary bar. */
  summary: string;
};

export function tierFor(id: ServiceTier['id']): ServiceTier {
  return SERVICE_TIERS.find((t) => t.id === id) ?? SERVICE_TIERS[0];
}

export const SERVICE_TIERS: ServiceTier[] = [
  {
    id: 'urgent',
    label: 'URGENT',
    tierLabel: 'Urgent Tier',
    price: LEGAL_NOTICE_PRICES.standard,
    speed: 'Within 5 days',
    trackingSpeed: 'Within 5 Days',
    note: 'Priority advocate assign',
    summary: 'Urgent Assignment (5 Days)',
  },
  {
    id: 'ordinary',
    label: 'ORDINARY',
    tierLabel: 'Ordinary Tier',
    price: LEGAL_NOTICE_PRICES.express,
    speed: 'Within 10 days',
    trackingSpeed: 'Within 10 Days',
    note: 'Standard advocate assign',
    summary: 'Ordinary Assignment (10 Days)',
  },
];
