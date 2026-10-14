// ─────────────────────────────────────────────────────────────────────────────
// HIGH COURT REPRESENTATION — copy and fixtures for the "hcr" designs, 289–337.
//
// UI-only. Nothing here is fetched, computed or persisted.
//
// ── CONFLICT REGISTER (recorded, NOT resolved) ───────────────────────────────
//  1. PRICING. ₹18,500 Ordinary / ₹28,500 Urgent on design/289; ₹24,999 /
//     ₹34,999 on design/295; ₹25,000 "Total Estimated Fee" on design/299.
//     Each screen renders its own figures.
//  2. PAYMENT ARITHMETIC — see HC_PAYMENT below.
//  3. THE SUCCESS SCREEN names the wrong service, amount and reference — see
//     components/PaymentSuccessScreen.tsx.
//  4. FIVE ADVOCATES: Abhishek Verma (300, 313, 318, 325–328), Neha Verma (303,
//     305, 306), Rajesh Sharma (330), Gurneet Chawla and Gurneeet Chawla (both
//     spellings on design/311), plus "Ask Adv. Rahul in Chat" on 303.
//  5. IDENTIFIERS: HCR-2026-1048, DC-2026-1048, DL-2026-CV, WP/2026/09876,
//     WP(C) 4120/2023, HCR-VER-2026-8941, #LGT-849204, #PSR739482.
//  6. STEP COUNTERS — thirteen systems ("Step 1 of 4", "Step 1 • High Court",
//     "Step 2 of 6", "Step 3 of 4", "Step 5 of 6", "Step 3 of 3", "Step 2 of 7",
//     "Step 2 of 9", "Step 4 of 10", "Stage 2 of 7", "Stage 3 of 6", "Stage 2
//     of 5", "Phase 2 of 4"). Each built as drawn, none harmonised.
//  9. COURT DRIFT: MP High Court Indore Bench (293), Delhi High Court (302,
//     330), District Court Indore (299, 313).
// 10. "High Court Represantative" on the payment screens — misspelt, and not
//     the service's name.
// 11. design/294 asks for an Aadhaar card as ID proof (DPDP — see HC_DOCUMENTS).
//  (7 and 8 are District Court — see data/districtCourt.ts.)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * design/289 — service landing.
 *
 * ⚠ design/289 is a 0.528 px/pt thumbnail. The headline, buttons, card titles
 * and prices are legible; the small lines marked "inferred" are read at the
 * edge of legibility and should be checked against a full-size export.
 */
export const HC_LANDING = {
  title: 'High Court Representation',
  heroBadge: 'Jurisdiction Verified',
  /** inferred */
  heroTier: 'High Court Tier',
  chip: 'High Court Division',
  h1: 'High Court Representation',
  body: 'Get help from a verified advocate for your High Court case.',
  /** inferred */
  check: 'Professional case support from start to finish',
  start: 'Start Now',
  learn: 'Learn More',

  receiveLabel: 'WHAT YOU RECEIVE',
  receiveMeta: 'Verified Standards',
  receive: [
    { icon: 'shield', title: 'Verified Advocates', desc: 'Choose from verified High Court advocates.' },
    { icon: 'scale', title: 'Case Support', desc: 'Get help with case preparation & filing.' },
    { icon: 'calendar', title: 'Track Your Case', desc: 'See hearings, documents & timely updates.' },
    { icon: 'doc', title: 'Document Help', desc: 'Advocate prepares needed affidavits & records.' },
  ] as const,

  howTitle: 'How High Court Representation Works',
  /** inferred */
  howBody: 'Tell us about your case. Legalitt assigns an advocate. You can chat with the advocate before you confirm.',
  howLink: 'Learn More',

  serviceHead: 'Choose a Service',
  serviceMeta: 'Select path',
  services: [
    { id: 'quick', title: 'Quick Submission', badge: 'Self Service', desc: 'Send your case details and documents online.' },
    { id: 'assist', title: 'Assistance Service', badge: 'Guided', desc: 'Tell us your problem and our team will help you step-by-step.' },
  ] as const,

  speedHead: 'Choose Service Speed',
  speedMeta: 'Assignment speed',
  // ⚠ CONFLICT 1: ₹18,500 / ₹28,500 here; design/295 prices the same two
  // speeds at ₹24,999 / ₹34,999.
  speeds: [
    { id: 'ordinary', pill: 'Standard', title: 'Ordinary', desc: 'Standard court preparation timeline', price: '₹18,500', note: 'Base tier' },
    { id: 'urgent', pill: 'Priority', title: 'Urgent', desc: 'Fast-track advocate assignment within 24h', price: '₹28,500', note: 'High-priority docket' },
  ] as const,
  popular: 'Popular',

  mattersTitle: 'Your Case Matters',
  /** inferred */
  mattersBody:
    'If a confirmed advocate does not attend a hearing or does not handle the case as agreed, Legalitt may review the matter and return part of the service fee.',
  mattersLink: 'View Service Policy',

  barTitle: 'High Court Representation',
  barSub: { ordinary: 'Ordinary • Standard', urgent: 'Urgent • Priority' },
  barNote: 'Inclusive of GST',
  cta: 'Continue → Choose Case Type',
};
