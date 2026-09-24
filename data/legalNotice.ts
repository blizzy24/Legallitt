// Legal Notice service data: prices and the payment invoice. Everything money-related
// on the detail, payment, scan-pay and success screens reads from here.

export type InvoiceLine = { label: string; amount: number };

// Two price points from design/22 (service detail). Which is which is confirmed
// there; the payment invoice charges the standard fee.
export const LEGAL_NOTICE_PRICES = {
  standard: 999,
  express: 699,
};

export const INVOICE = {
  service: 'Legal Notice',
  refId: 'LGT-849204',
  // design/30 shows PSR739482; design/31–32 show LN12345678. One ID everywhere.
  requestId: 'LN12345678',
  lines: [
    { label: 'Service Fee', amount: LEGAL_NOTICE_PRICES.standard },
    // design/28 shows ₹179 for 18% GST (18% of ₹999 is ₹179.82) — kept as drawn.
    { label: 'Goods & Services Tax (GST 18%)', amount: 179 },
    // design/28 reads "Plat form fees"; rendered as "Platform fees".
    { label: 'Platform fees', amount: 199 },
  ] as InvoiceLine[],
};

export function invoiceTotal(lines: InvoiceLine[] = INVOICE.lines) {
  return lines.reduce((sum, l) => sum + l.amount, 0);
}

/** "₹1,377" — Indian grouping for the amounts this app shows. */
export function rupees(n: number, grouped = true) {
  return '₹' + (grouped ? n.toLocaleString('en-IN') : String(n));
}

// Tracking screen (design/31, 32). Dates are September 2026 to sit with
// data/cases.ts (the files say 23 / 25 May 2026).
export type TrackingState = 'drafting' | 'approval';

export const TRACKING = {
  // design/31 reads "Ref: LN-2026/05" while the invoice's Ref ID is #LGT-849204.
  ref: 'LN-2026/05',
  tier: 'Urgent Tier',
  serviceSpeed: 'Within 5 Days',
  submittedOn: '2026-09-19',
  submittedAt: '10:30 AM',
  estimate: { date: '2026-09-21', time: '6 PM' },
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
  price: number;
  speed: string;
  note: string;
  /** Wording used by the selected-summary bar. */
  summary: string;
};

export const SERVICE_TIERS: ServiceTier[] = [
  {
    id: 'urgent',
    label: 'URGENT',
    price: LEGAL_NOTICE_PRICES.standard,
    speed: 'Within 5 days',
    note: 'Priority advocate assign',
    summary: 'Urgent Assignment (5 Days)',
  },
  {
    id: 'ordinary',
    label: 'ORDINARY',
    price: LEGAL_NOTICE_PRICES.express,
    speed: 'Within 10 days',
    note: 'Standard advocate assign',
    summary: 'Ordinary Assignment (10 Days)',
  },
];
