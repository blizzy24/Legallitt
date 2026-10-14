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

/** design/290 — High Court information ("Learn More"). */
export const HC_INFO = {
  title: 'High Court Information',
  pillL: 'Legal Guide \u2022 High Court',
  pillR: 'Simple Guide',
  h1: 'High Court Representation',
  sub: 'Understand the service clearly before you get started.',

  whatTitle: 'What Is High Court Representation?',
  whatBody:
    'High Court representation means a verified advocate handles your case directly in the High Court and helps you through every court step.',
  whatPill: 'Verified Advocate Support',

  whenTitle: 'When Can You Use It?',
  whenSub: 'Common matters handled in the High Court',
  when: [
    { icon: 'writ', label: 'Writ Cases' },
    { icon: 'bail', label: 'Bail Matters' },
    { icon: 'civil', label: 'Civil Cases' },
    { icon: 'criminal', label: 'Criminal Cases' },
    { icon: 'appeal', label: 'Appeals' },
    { icon: 'service', label: 'Service Matters' },
    { icon: 'property', label: 'Property Matter' },
    { icon: 'other', label: 'Other Cases' },
  ] as const,

  doTitle: 'What Does the Advocate Do?',
  doSub: 'Your advocate will take care of these tasks:',
  does: [
    'Reviews your case details',
    'Checks all your documents',
    'Prepares the legal filing carefully',
    'Files the required papers in court',
    'Attends all scheduled court hearings',
    'Gives you clear case updates',
  ],

  needTitle: 'What Do You Need?',
  needBody: 'Your assigned advocate will tell you which exact documents are required for your matter.',
  needNote: 'No need to worry if you do not have all papers ready right now.',

  howTitle: 'How Legalitt Works',
  howSub: '6 simple steps from start to finish',
  steps: [
    { title: 'Submit your case', desc: 'Tell us what your case is about in a few taps.' },
    { title: 'Legalitt assigns an advocate', desc: 'We match you with an experienced High Court specialist.' },
    { title: 'Chat with the advocate', desc: 'Discuss your concerns and clarify expectations freely.' },
    { title: 'Confirm the advocate', desc: 'Once you are comfortable, approve and secure the booking.' },
    { title: 'Send required documents', desc: 'Upload photos or digital copies directly within the app.' },
    { title: 'Track your case', desc: 'Receive continuous hearing dates and stage updates.' },
  ],

  protTitle: 'Your Protection',
  protBody:
    'If a confirmed advocate does not attend a hearing or does not handle the case as agreed, Legalitt will review the matter and may return part of the service fee.',
  protLine: 'Fair review policy for your peace of mind.',

  helpTitle: 'Need Help?',
  helpSub: 'Our team can help guide you.',
  chat: 'Chat',
  back: 'Back to High Court Representation',
};

/** design/291 — choose case type. */
export const HC_CASE_TYPE = {
  title: 'Choose Case Type',
  // ⚠ CONFLICT 6: "Step 1 of 4 • Intake" here; design/292 reads "Step 1 •
  // High Court", 294 "Step 3 of 4", 295 "Step 2 of 6". Each as drawn.
  step: 'STEP 1 OF 4 \u2022 INTAKE',
  h1: 'Tell us about your legal matter',
  body: 'Select an option below so we can pair you with the best advocate and prepare the right court paperwork.',
  options: [
    {
      id: 'new',
      title: 'New Case',
      chip: 'Fresh Filing',
      desc: 'This matter has not been submitted to court yet.',
      bullets: ['Draft brand new petition, notices, or claims', '1-on-1 strategy call with assigned advocate'],
    },
    {
      id: 'pending',
      title: 'Pending Case',
      chip: 'In Court',
      desc: 'Hearings or notices are already ongoing in court.',
      bullets: ['Enter appearance, file vakalatnama, or appeal', 'Digital calendar for hearing dates & daily orders'],
      noc: 'A No Objection Certificate (NOC) is only needed if you are replacing a previous lawyer. We help request this smoothly.',
    },
  ] as const,
  helpTitle: 'Not sure which one applies?',
  helpBody:
    'Don\u2019t worry! Pick the closest option. You will speak freely with an advocate who reviews your court documents before anything is submitted.',
  helpLink: 'Contact Legal Support',
  helpAvg: 'Average reply: < 5 mins',
  trust: ['Bar Council Compliant', '256-bit Encrypted'],
  cta: 'Continue',
  /** Drawn with New Case selected; kept as drawn when Pending is chosen (no other state is designed). */
  ctaSub: 'Next: Case Details Form',
  foot: 'You can review or change this selection at any point.',
};

/** design/292 — matter type. Its header reads "Case Verification". */
export const HC_MATTER_TYPE = {
  title: 'Case Verification',
  // ⚠ CONFLICT 6: "Step 1 • High Court" — design/291 already called itself Step 1 of 4.
  step: 'STEP 1 \u2022 HIGH COURT',
  verified: 'Verified Legal Desk',
  h1: 'Choose your case type',
  body: 'Pick the matter you want to file or review in the High Court.',
  secTitle: 'High Court Matters',
  secMeta: 'Choose one',
  /** design/292 draws Civil selected. */
  initial: 'civil' as const,
  matters: [
    { id: 'writ', title: 'Writ', desc: 'Court order or public matter' },
    { id: 'civil', title: 'Civil', desc: 'Civil dispute or suit' },
    { id: 'criminal', title: 'Criminal', desc: 'Criminal case or defense' },
    { id: 'bail', title: 'Bail', desc: 'Anticipatory or regular bail' },
    { id: 'appeal', title: 'Appeal', desc: 'Challenge an earlier order' },
    { id: 'service', title: 'Service', desc: 'Employment & service matter' },
    { id: 'property', title: 'Property', desc: 'Land, registry & tenancy' },
    { id: 'other', title: 'Other', desc: 'Other High Court matter' },
  ] as const,
  noteTitle: 'Not sure which matter fits?',
  /** design/292 hard-wraps this into three ragged lines; reproduced. "Other" is set in ink. */
  noteLines: [['Select ', 'Other', ' or discuss it with'], ['your assigned'], ['advocate in the next step.']] as const,
  cta: 'Continue to Case Details',
  foot: 'Confidential high-assurance legal platform',
};
