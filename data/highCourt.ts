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
//     spellings on design/311), plus "Ask Adv. Rahul in Chat" on 303 — and
//     design/300 assigns Abhishek Verma while its own timeline reads "Matched
//     with Advocate Gurpreet Chawla", a sixth name.
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

import { CO_PAYMENT, CO_SUCCESS } from './courier';

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

/** design/293 — case details. */
export const HC_CASE_DETAILS = {
  title: 'Case Details',
  selected: 'Selected: Civil',
  progress: '50% Completed',
  progressPct: 0.5,
  h1: 'Tell us about your case',
  body: 'Share simple facts so your High Court counsel can review the dispute.',
  caseTitle: { label: 'Case Title', placeholder: 'Example: Rahul Sharma vs Amit Verma', hint: 'Give your case a clear name or mention both parties.' },
  otherParty: {
    label: 'Other Party Name',
    placeholder: "Enter the other person's or company's name",
    hint: 'The person, business, or department on the opposing side.',
  },
  happened: { label: 'What Happened?', placeholder: 'Tell us what happened in simple words.', hint: 'You can explain the problem in your own words.' },
  charsSuffix: 'chars',
  date: { label: 'Important Date', placeholder: 'Select Date (e.g. DD / MM / YYYY)', hint: 'Add the main date related to your case, if any.' },
  optional: 'Optional',
  // ⚠ CONFLICT 9: MP High Court, Indore Bench here; designs 302 and 330 say
  // Delhi High Court; 299 and 313 District Court, Indore.
  bench: { label: 'Court / Bench', tag: 'Pre-selected', value: 'Madhya Pradesh High Court - Indore Bench' },
  dontKnow: "I don't know the exact bench",
  benchInfo: 'If you are not sure which High Court bench applies, choose "I don\'t know". Your advocate will verify this.',
  other: { label: 'Other Details', placeholder: 'Add anything else about your case.' },
  noteTitle: 'Not sure what to write?',
  noteBody: 'Write the problem in your own words. Your advocate will discuss and ask for more details later during consultation.',
  status: 'Complete 3 required details to continue',
  cta: 'Continue to Documents',
  foot: 'Confidential & encrypted \u2022 No filing without your approval',
};

/** design/294 — upload documents. */
export const HC_DOCUMENTS = {
  title: 'Upload Documents',
  // ⚠ CONFLICT 6: "Step 3 of 4" — design/293 had no step, 295 is "Step 2 of 6".
  step: 'STEP 3 OF 4',
  matter: 'Selected Matter: Civil',
  intro: 'Upload the documents you have for your case.',
  addedTitle: 'Documents Added',
  addedPill: '2 of 2 Required Added',
  addedBody: 'All required documents uploaded \u2022 You are ready to continue',
  noteTitle: 'You do not need to upload documents you do not have.',
  noteBody: 'Optional files can be shared directly with your advocate at any time during your consultation.',
  required: 'Required',
  optional: 'Optional',
  view: 'View',
  replace: 'Replace',
  docs: [
    { id: 'case', icon: 'doc', title: 'Case Papers', required: true, sub: 'Upload papers related to your case.', file: { name: 'Case_Papers.pdf', meta: '2.4 MB \u2022 Uploaded' } },
    { id: 'order', icon: 'gavel', title: 'Previous Court Order', required: false, sub: 'Upload the latest court order, if you have one.', upload: '+ Upload PDF / Photo', hint: 'Only if you already received an earlier court order.' },
    // ⚠ CONFLICT 11 (DPDP): an Aadhaar card is requested as ID proof — the same
    // concern raised on the advocate verification batch. Built as drawn.
    { id: 'id', icon: 'id', title: 'ID Proof', required: true, sub: 'Upload a valid ID proof (Aadhaar, Passport, or Voter ID).', file: { name: 'ID_Proof.pdf', meta: '1.1 MB \u2022 Uploaded' } },
    { id: 'notice', icon: 'mail', title: 'Notice or Petition', required: false, sub: 'Upload any notice or petition related to your case.', file: { name: 'Notice.pdf', meta: '850 KB \u2022 Uploaded' } },
    { id: 'other', icon: 'folder', title: 'Other Documents', required: false, sub: 'Upload any other file that may help your case.', upload: '+ Upload File', hint: 'Supported files: PDF, JPG, PNG (up to 25MB)' },
  ] as const,
  helpTitle: 'Not sure what to upload?',
  helpBody: 'Upload the documents you have. Your advocate can ask for more later during your case review.',
  ready: 'Required documents ready (2/2)',
  cta: 'Continue',
  foot: 'Secure & confidential \u2022 Encrypted document storage',
};

/** design/295 — choose service & price. */
export const HC_PRICING = {
  title: 'Choose Service Price',
  // ⚠ CONFLICT 6: "Step 2 of 6", after 294's "Step 3 of 4".
  step: 'STEP 2 OF 6 \u2022 SERVICE & PRICING',
  h1: 'Choose Service & Price',
  body: 'Choose how quickly you need help with your legal matter.',
  matterLabel: 'SELECTED MATTER',
  matterPill: 'High Court',
  matterTitle: 'Civil Law Representation',
  matterNew: 'New Matter',
  matterCheck: 'Verified High Court track registry & drafting counsel',
  speedHead: 'Choose Service Speed',
  speedMeta: 'Tap to pick',
  speedSub: 'Select one option to see the total guaranteed fee.',
  /** design/295 draws Urgent selected. */
  initial: 'urgent' as const,
  // ⚠ CONFLICT 1: ₹24,999 / ₹34,999 here; ₹18,500 / ₹28,500 on design/289.
  tiers: [
    {
      id: 'ordinary',
      title: 'Ordinary',
      pill: 'Standard',
      price: '\u20B924,999',
      desc: 'Regular timeline for calm matters',
      time: 'Normal processing \u2022 5-7 working days',
      speed: 'Ordinary (5-7 days)',
      bullets: ['Standard document preparation', 'Standard court registry filing timeline', 'Dedicated senior advocate review'],
    },
    {
      id: 'urgent',
      title: 'Urgent',
      pill: 'Priority',
      price: '\u20B934,999',
      desc: 'Immediate action for critical dates',
      time: 'Fast processing \u2022 2-3 working days',
      speed: 'Urgent (2-3 days)',
      bullets: ['Priority express document drafting', 'Express court listing & urgent registry filing', 'Urgent senior advocate assignment'],
    },
  ] as const,
  recommended: 'Recommended',
  feeHead: 'Your Fee',
  feeSub: 'Clear, itemized summary for this request.',
  feeRows: { service: ['Legal Service', 'High Court Representation'], category: ['Matter Category', 'Civil Law'], speed: 'Selected Speed', base: 'Service Base Fee' },
  totalLabel: 'TOTAL AMOUNT',
  totalSub: 'Inclusive of all filing fees & taxes',
  zTitle: 'Zero Surprise Commitment',
  zBody: 'The price shown here is final. You will review everything again on the next screen before any payment is made.',
  zGreen: 'No hidden costs \u2022 No immediate deduction today',
  cta: 'Continue to Pay',
  foot: '100% transparent legal pricing \u2022 Safe & confidential',
};

// ─────────────────────────────────────────────────────────────────────────────
// THE ONE PAYMENT RECORD — designs 296, 315, 322 and 331 (pixel-identical to
// each other) and every fee that routes to them.
//
// ⚠⚠ CONFLICT 2 — BUILT EXACTLY AS DRAWN, AWAITING CLIENT CORRECTION. Do NOT
// "fix" this by wiring the real fees:
//  · 18% of ₹34,999 is ₹6,300, not ₹379;
//  · ₹34,999 + ₹379 = ₹35,378, not ₹40,680;
//  · the ₹3,500 court fee (314), the ₹850 process fee (321) and the ₹1,500
//    change-advocate fee (329) all lead to this same ₹40,680 screen, as does
//    the service fee chosen on 295 whichever tier it is.
//  · The courier fee does NOT: designs 307/308 are the courier batch's own
//    ₹250 + ₹40 = ₹290 screens (277/278), which are reused as they are.
//  · The title is "High Court Represantative" — misspelt (conflict 10) — and
//    the reference #LGT-849204 is the LEGAL NOTICE prefix.
// ─────────────────────────────────────────────────────────────────────────────
export const HC_PAYMENT: typeof CO_PAYMENT = {
  ...CO_PAYMENT,
  service: 'High Court Represantative',
  ref: 'Ref ID: #LGT-849204 \u00B7',
  lines: [
    { label: 'Service Fee', value: '\u20B934,999/-' },
    { label: 'Goods & Services Tax (GST 18%)', value: '\u20B9379' },
  ],
  total: '\u20B940,680/-',
};

/** design/297 (= 316, 323, 332): the Scan & Pay step for HC_PAYMENT. */
export const HC_SCAN_PAY = {
  // ⚠ The QR is labelled "Legal Notice" on a High Court / District Court fee.
  service: 'Legal Notice',
  amount: 40680,
};

/**
 * designs 298, 317 and 333 (identical) and 324 (button reads "View Receipt").
 * The same wrong-service screen as design/279 — see PaymentSuccessScreen.
 * ⚠ CONFLICT 3: "₹1377", "forensic analysis", #PSR739482 on a court payment.
 */
export const HC_SUCCESS = { ...CO_SUCCESS, ctaReceipt: 'View Receipt' };

/**
 * design/301 — advocate chat. A static transcript.
 *
 * ⚠ CROSS-SERVICE: opened from the DISTRICT COURT advocate screen (design/300,
 * DC-2026-1048) and it reads "High Court Representation · HCR-2026-1048".
 * ⚠ CONFLICT 5: HCR-2026-1048 here against DC-2026-1048 one screen back.
 */
export const HC_CHAT = {
  name: 'Adv. Abhishek Verma',
  status: 'Verified Advocate \u2022 Online',
  ctxTitle: 'High Court Representation',
  ctxType: 'Civil',
  ctxId: 'HCR-2026-1048',
  ctxActive: 'Active',
  today: 'Today',
  enc: 'Messages are 256-bit encrypted and private between you and your advocate.',
  messages: [
    { from: 'me', text: 'Hello. Can you tell me what documents I need?', time: '10:14 AM' },
    { from: 'adv', text: 'Yes. I will share the documents needed for your case.', time: '10:15 AM' },
    { from: 'me', text: 'Okay, please send me the list.', time: '10:15 AM' },
    { from: 'adv', text: 'Sure. Please check the list below.', time: '10:16 AM' },
  ] as const,
  cardTag: 'ADVOCATE RECOMMENDED',
  cardTime: '10:16 AM',
  cardTitle: 'Documents You Need',
  cardSub: 'Please keep these documents ready.',
  docs: [
    { name: 'Case Papers', required: true },
    { name: 'Previous Court Order', required: true },
    { name: 'ID Proof', required: true },
    { name: 'Previous Advocate Papers', required: false },
  ] as const,
  required: 'Required',
  optional: 'Optional',
  noteLabel: 'Advocate Note',
  note: 'Please bring the original papers and keep clear copies ready.',
  cta: 'View List',
  placeholder: 'Type a message...',
};

/**
 * design/302 — confirm advocate.
 *
 * ⚠ CROSS-SERVICE: opened from the District Court screens (Review Advocate on
 * design/300), and it reads High Court Representation · HCR-2026-1048.
 * ⚠ CONFLICT 6: "STEP 4 OF 6" — design/300 just said "Step 4 of 10".
 * ⚠ CONFLICT 9: "Delhi High Court" — design/293 filed in MP High Court, Indore
 * Bench, and design/300 introduced this advocate as practising in Indore
 * District Courts.
 * The photo is drawn as a flat red disc with no portrait; built as drawn.
 */
export const HC_CONFIRM = {
  title: 'Confirm Advocate',
  step: 'STEP 4 OF 6 \u2022 ADVOCATE CONFIRMATION',
  h1: 'Confirm Your Advocate',
  sub: 'Please review your advocate before we proceed to documents.',
  name: 'Adv. Abhishek Verma',
  verified: 'Verified Advocate',
  court: 'Delhi High Court \u2022 Civil & Commercial',
  trackLabel: 'Track Record',
  track: '12+ Yrs \u2022 450+ Cases',
  ratingLabel: 'Client Rating',
  rating: '4.9 (120+ reviews)',
  barLabel: 'Bar Council ID',
  // ⚠ CONFLICT 5 adjacent — one more identifier format.
  barId: 'D/1482/2012 Verified',
  langLabel: 'Languages',
  langs: 'English, Hindi, Punjabi',
  matterLabel: 'ASSIGNED MATTER',
  matter: 'High Court Representation (Civil \u2022 HCR-2026-1048)',
  matterBody: 'You can consult, share documents, and track court dates together once confirmed.',
  question: 'Do you want to continue with this advocate?',
  questionSub: 'Confirming this advocate assigns them to your case so they can request your documents and prepare your court filing.',
  accept: 'Accept Advocate',
  acceptSub: 'Proceeds to Recommended Documents',
  requestNew: 'Request New Advocate',
  cancel: 'Cancel',
  cancelBody: 'Cancel will keep your case on hold and return to Assigned Advocate. It does not accept or reject this advocate.',
  foot: ['Bar Council\nCompliant', '100%\nConfidential', 'Fair Review\nPolicy'],
  need: 'Need assistance choosing? ',
  needLink: 'Chat with Support',
};
