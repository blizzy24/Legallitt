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
//     with Advocate Gurpreet Chawla", a sixth name. design/304 names the
//     advocate Adv. Gurneet Chawla as well, two screens after Neha Verma.
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

/**
 * design/303 — documents you need.
 *
 * ⚠ CONFLICT 4: the advocate here is Adv. Neha Verma — design/302 one screen
 * earlier confirmed Adv. Abhishek Verma — and the footer link reads "Ask Adv.
 * Rahul in Chat", a third name on one journey step.
 * ⚠ CONFLICT 6: "STEP 5 OF 6" after 302's "STEP 4 OF 6" — consistent with 302,
 * but not with 300's "Step 4 of 10".
 * ⚠ CONFLICT 11 (DPDP): the ID Proof item asks for an Aadhaar card. Collecting
 * Aadhaar is restricted; the client must confirm the purpose and the legal
 * basis. Built as drawn.
 * "2 of 3 Required" counts the two Ready items; the drawing has three Required
 * items and one Optional. Built as drawn.
 */
export const HC_DOCS_NEEDED = {
  title: 'Documents You Need',
  step: 'STEP 5 OF 6 \u2022 DOCUMENTS LIST',
  count: '2 of 3 Required',
  advName: 'Adv. Neha Verma',
  advSub: 'High Court Representation \u2022 HCR-2026-1048',
  h1: 'Documents You Need',
  body: 'Your advocate has shared these documents for your case.',
  h2: 'Document Checklist',
  h2Sub: 'Mark the documents you have ready before sending them to your lawyer.',
  required: 'Required',
  optional: 'Optional',
  docs: [
    { icon: 'folder', title: 'Case Papers', required: true, desc: 'All initial notices, plaints, or filings you have received or prepared.', foot: '1 copy ready', ready: true },
    { icon: 'scale', title: 'Previous Court Order', required: true, desc: 'The latest certified or true copy of orders passed by the court.', foot: 'Certified copy', ready: true },
    // ⚠ CONFLICT 11 (DPDP) — Aadhaar.
    { icon: 'id', title: 'ID Proof', required: true, desc: 'Aadhaar Card, Passport, or Voter ID for client identification.', foot: 'Tap button to confirm you have this', ready: false },
    { icon: 'briefcase', title: 'Previous Advocate Papers', required: false, desc: 'NOC or case brief from previous legal counsel if you are changing advocates.', foot: 'Only if switching lawyers', ready: false },
  ] as const,
  // The pills carry a glyph in their text as well as the icon beside it
  // ("✓ Ready", "○ Not Added") — drawn that way, built that way.
  ready: '\u2713 Ready',
  notAdded: '\u25CB Not Added',
  // "Adv. Neha  Verma" — the double space is in the drawing.
  noteTitle: 'Advocate\u2019s Note \u2022 Adv. Neha  Verma',
  note: '\u201CPlease bring the original papers and keep clear copies ready. Clear photos or scanned copies are also fine for our initial review.\u201D',
  pickup: 'Free Pick-up',
  nextTitle: 'Next Step',
  nextBold: 'Send the required physical documents to your advocate.',
  nextBody: 'You can book a doorstep courier pickup via Blue Dart or drop them off directly.',
  impLead: 'Important: ',
  imp: 'These documents were personally recommended by your assigned advocate for this specific court matter. Legalitt does not automatically decide legal requirements.',
  cta: 'Continue',
  caption: 'Proceed to Send Documents',
  // ⚠ CONFLICT 4 — "Adv. Rahul".
  ask: 'Have questions? Ask Adv. Rahul in Chat',
};

/**
 * design/304 — send documents (choose delivery).
 *
 * ⚠ CONFLICT 4: "Adv. Gurneet Chawla" — design/303 one screen earlier is Adv.
 * Neha Verma, and 305 after it is Neha Verma again. The drawing also runs the
 * name into the gavel icon ("Chawl▯"); it is shown in full here (never
 * ellipsized).
 * ⚠ CONFLICT 9: "High Court" with no bench.
 */
export const HC_SEND_DOCS = {
  title: 'Send Documents',
  intro: 'Choose how you want to send your physical documents.',
  ref: 'Case Reference \u2022 HCR-2026-1048',
  grid: [
    ['Advocate', 'Adv. Gurneet Chawla'],
    ['Court', 'High Court'],
    ['Matter', 'Civil'],
    ['Case ID', 'HCR-2026-1048'],
  ] as const,
  readyTitle: 'Documents Ready',
  readySub: '5 Documents prepared',
  verified: 'All Verified',
  view: 'View',
  chooseTitle: 'Choose Delivery',
  chooseSub: 'Select how you want to deliver these documents',
  legalitt: {
    title: 'Legalitt Delivery',
    powered: 'Powered by Blue Dart',
    desc: 'Legalitt will send the documents to your advocate.',
  },
  self: {
    title: 'Send Yourself',
    sub: 'Use any courier you like.',
    desc: 'Send the documents directly to your advocate.',
  },
  helpTitle: 'Need Help?',
  helpBody: 'Your advocate has shared the documents needed for your case. Contact your advocate anytime in chat if you have questions.',
  secure: 'Safe & secure legal delivery \u2022 Tracking provided',
  cta: 'Continue \u2192 Legalitt Delivery',
};

/**
 * design/305 — Blue Dart courier booking (Legalitt Delivery from design/304).
 *
 * ⚠ CONFLICT 4: the recipient is Adv. Neha Verma of "Chawla & Associates
 * Legal Chambers" — 304 named the advocate Adv. Gurneet Chawla.
 * ⚠ CONFLICT 6: "Step 2 • Document Shipping" after 303's "STEP 5 OF 6";
 * 306 is "Step 3 of 3".
 * ⚠ FEE: ₹250 here and on 306. The courier payment this flow reuses
 * (design/307 = 277, /courier/payment) charges ₹290. Each screen shows its own
 * figure; the client must pick one.
 */
export const HC_BOOKING = {
  title: 'Blue Dart Delivery',
  step: 'Step 2 \u2022 Document Shipping',
  powered: 'Powered by Blue Dart Express',
  h1: 'Courier Booking',
  sub: 'We will send your documents to your advocate.',
  transitTitle: 'Tamper-Proof Transit',
  transitSub: 'Indore Local Express (Air & Surface)',
  insured: 'Insured',
  pickupLabel: 'Pickup From',
  origin: 'Origin',
  pickupName: 'Rahul Sharma',
  change: 'Change',
  pickupAddr: 'Flat 402, Royal Palms, MG Road, Indore, Madhya Pradesh - 452001',
  pickupPhone: '+91 98260 12345',
  registered: 'Your Registered Pickup Address',
  deliverLabel: 'Deliver To',
  destination: 'Destination',
  advName: 'Adv. Neha Verma',
  firm: 'Chawla & Associates Legal Chambers',
  viewAddress: 'View\nAddress',
  advAddr: 'Chamber No. 14, High Court Bar Building, MG Road Bench, Indore, MP - 452007',
  advPhone: '+91 94250 88910',
  chamber: 'Verified High Court Counsel Chamber',
  docsTitle: 'Documents',
  docsSub: '5 Documents ready for courier',
  viewDocs: 'View\nDocuments',
  // "5 Documents" over four chips — drawn that way.
  chips: ['Case Papers', 'ID Proof', 'Petition Draft', 'Court Orders'],
  detTitle: 'Delivery Details',
  ready: 'Ready for Dispatch',
  tiles: [
    { icon: 'truck', label: 'Courier', value: 'Blue Dart Express', sub: 'Air & Surface Hub' },
    { icon: 'package', label: 'Package', value: '1 Tamper Pouch', sub: 'Reinforced & Sealed' },
    { icon: 'weight', label: 'Weight', value: '350g', sub: 'Calculated standard', tag: 'Auto' },
    { icon: 'clock', label: 'Estimated Delivery', value: '1\u20132 Business Days', sub: 'Blue Dart Air Express' },
  ] as const,
  tracking: 'Real-time tracking link will be sent via SMS upon pickup.',
  feeLabel: 'Delivery Fee',
  fee: '\u20B9250',
  feeTag: 'All-Inclusive Rate',
  feeLead: 'This is only the document delivery fee.',
  feeNote: 'Separate from legal case fee \u2022 Inclusive of tamper-proof packing & transit insurance.',
  custodyTitle: 'Legalitt Chain of Custody',
  custodyBody: "Documents are securely sealed in a tamper-evident pouch and hand-delivered directly to your advocate's office with signature verification.",
  barLabel: 'Total to pay for courier',
  barTotal: 'Delivery Total: \u20B9250',
  secured: 'Secured Pouch',
  cta: 'Continue \u2192 Confirm Delivery',
  foot: 'Safe & contactless courier pickup',
};

/**
 * design/306 — confirm delivery.
 *
 * ⚠ CONFLICT 6: "Step 3 of 3 • Final Confirmation" — 305 was "Step 2 •
 * Document Shipping" (of no stated total).
 * ⚠ CONFLICT 9: the route ends at "High Court Bench"; 305 delivered to "MG
 * Road Bench, Indore".
 * ⚠ FEE: ₹250 (as 305), against the ₹290 the reused courier payment charges.
 * "5 Documents Included" lists three.
 */
export const HC_COURIER_CONFIRM = {
  title: 'Confirm Delivery',
  step: 'Step 3 of 3 \u2022 Final Confirmation',
  verified: 'Pre-verified',
  intro: 'Check your delivery details before booking your Blue Dart pickup.',
  route: 'Direct Transit Route',
  from: 'MG Road Pickup',
  to: 'High Court Bench',
  sendFrom: 'Send From',
  pickupTag: 'Pickup Address',
  edit: 'Edit',
  fromName: 'Rahul Sharma',
  fromAddr: 'Flat 402, Royal Palms, MG Road, Indore, Madhya Pradesh - 452001',
  fromPhone: '+91 98260 12345',
  sendTo: 'Send To',
  toTag: 'Advocate Office',
  toName: 'Adv. Neha Verma',
  toFirm: 'Chawla & Associates Legal Chambers',
  toAddr: 'Chamber No. 14, High Court Bar Building, MG Road Bench, Indore, MP - 452007',
  toPhone: '+91 94250 88910',
  conTitle: 'Consignment & Courier Details',
  docsTitle: '5 Documents Included',
  docsSub: 'Case Papers, ID Proof, Petition Draft',
  viewList: 'View\nList',
  partnerTitle: 'Courier\nPartner',
  partnerSub: 'Blue Dart\nExpress',
  partnerPill: 'Air Express \u2022 Tamper\nPouch',
  etaTitle: 'Estimated Delivery',
  etaSub: 'Standard advocate courier protocol',
  eta: '1\u20132 Business\nDays',
  feeTitle: 'Delivery Fee',
  feeTag: 'All-Inclusive',
  fee: '\u20B9250',
  feeBody: 'This covers secure tamper-evident envelope, doorstep pickup, and insured transit directly to your advocate.',
  warn: 'Please check the address before placing the delivery order.',
  checkTitle: 'I have checked the address and document details.',
  // Drawn with "24" alone on its own line — line breaks kept as drawn.
  checkSub: 'Blue Dart will arrive at your pickup address within\n24\nhours of booking.',
  barLabel: 'Total Delivery Fee',
  barTotal: '\u20B9250',
  cta: 'Book Delivery',
  foot: '100% Sealed Transit \u2022 Direct to Advocate Chamber',
};

/**
 * design/310 — shipment created (after the reused courier payment success).
 *
 * ⚠ CONFLICT 4: "Adv. Gurneet Chawla" again — 305 and 306, two screens back,
 * delivered to Adv. Neha Verma.
 * ⚠ CONFLICT 5: waybill 8492 0419 5821.
 * "5 Documents Packed" over four chips.
 */
export const HC_SHIPMENT = {
  title: 'Shipment Created',
  h1: 'Delivery Booked',
  sub: 'Your documents are ready for pickup.',
  pill: 'Blue Dart Express \u2022 Doorstep Pickup',
  detTitle: 'Delivery Details',
  detTag: 'Standard Express',
  wayLabel: 'WAYBILL NUMBER',
  waybill: '8492 0419 5821',
  schedLabel: 'SCHEDULED PICKUP',
  sched: 'Tomorrow, 10:00 AM \u2013 1:00 PM',
  schedSub: 'Courier partner will call before arrival',
  fromLabel: 'PICKUP FROM',
  fromName: 'Rahul Sharma',
  fromAddr: 'Flat 402, Royal Palms, MG Road, Indore',
  toLabel: 'DELIVER TO',
  toName: 'Adv. Gurneet Chawla',
  toAddr: 'Chamber No. 14, High Court Bench',
  packTitle: '5 Documents Packed',
  packSub: 'Legal physical docket verification',
  chips: [
    { icon: 'file', label: 'Case Papers' },
    { icon: 'id', label: 'ID Proof' },
    { icon: 'gavel', label: 'Petition Draft' },
    { icon: 'copy', label: 'Supporting Annexures' },
  ] as const,
  seal: 'Tamper-evident envelope sealed \u2022 Barcode assigned',
  statTitle: 'Delivery Status',
  steps: [
    { title: 'Shipment Created', desc: 'Order booked with Blue Dart', state: 'done' },
    { title: 'Pickup Pending', desc: 'Courier agent assigned for pickup', state: 'active', chip: 'Active' },
    { title: 'In Transit', desc: "Direct route to advocate's chamber", state: 'waiting' },
    { title: 'Delivered', desc: 'Handed over with signature verification', state: 'waiting' },
  ] as const,
  smsLead: 'We will send tracking updates to ',
  smsPhone: '+91 98260 12345',
  smsTail: ' via SMS.',
  cta: 'View Tracking',
  cta2: 'View Case',
};

/**
 * design/311 — document delivery (tracking).
 *
 * ⚠ CONFLICT 4: "Adv. Gurneeet Chawla" (three e's) in the Send To card and the
 * Advocate Received step — design/310 spelt it Gurneet. Both kept as drawn.
 * ⚠ CONFLICT 5: waybill 8492 0419 5821 (as 310).
 * "Real courier tracking" / "Live data synced" are drawn claims; nothing here
 * is live. "5 Items" over "Case Papers, ID Proof, Petition Draft & 2
 * Annexures".
 */
export const HC_TRACKING = {
  title: 'Document Delivery',
  intro: 'Track your legal documents on their way to your advocate.',
  courier: 'Blue Dart Express',
  state: 'In Transit',
  wayLabel: 'WAYBILL NUMBER',
  waybill: '8492 0419 5821',
  copy: 'Copy',
  expLead: 'Expected delivery: ',
  exp: 'Tomorrow by 2:00 PM',
  progTitle: 'Delivery Progress',
  progSub: 'Step-by-step courier updates',
  steps: [
    { icon: 'check', title: 'Delivery Booked', desc: 'Order placed on Legalitt \u2022 Oct 24, 10:30 AM', state: 'done', label: 'Completed' },
    { icon: 'check', title: 'Picked Up', desc: 'Collected from your address by courier \u2022 Oct 24, 02:15 PM', state: 'done', label: 'Completed' },
    { icon: 'truck', title: 'In Transit', desc: 'Package moving between hubs towards destination \u2022 Oct 24, 06:40 PM', state: 'current', label: 'Current' },
    { icon: 'clock', title: 'Out for Delivery', desc: 'Courier agent will carry papers for delivery', state: 'waiting' },
    { icon: 'building', title: 'Delivered', desc: 'Reaches advocate reception or chamber', state: 'waiting' },
    // ⚠ CONFLICT 4 — "Gurneeet".
    { icon: 'badge', title: 'Advocate Received', desc: 'Signed and confirmed by Adv. Gurneeet Chawla', state: 'waiting' },
  ] as const,
  sendTitle: 'Send To',
  verified: 'Verified Advocate',
  toName: 'Adv. Gurneeet Chawla',
  toAddr: 'Chamber No. 14, High Court Bar Building, MG Road Bench, Indore, MP - 452007',
  docsTitle: 'Documents',
  items: '5 Items',
  docsText: 'Case Papers, ID Proof, Petition Draft & 2 Annexures',
  seal: 'Sealed in tamper-evident security pouch',
  lastTitle: 'Last Update',
  lastMeta: 'Real courier tracking',
  hub: 'Departed Indore Sorting Hub',
  time: '06:40 PM',
  date: '24 October 2026',
  synced: 'Live data synced',
  refresh: 'Refresh Tracking',
  help: 'Need Help? Contact Courier Support',
};

/**
 * design/312 — documents delivered.
 *
 * ⚠ CONFLICT 4: "Adv. Gurneet Chawla" (two e's again; 311 had three).
 * ⚠ CONFLICT 6: "Step 2 of 4" — a fourth counter in the courier sub-flow.
 * ⚠ CONFLICT 5: waybill 8492 0419 5821. "Sent from Central Registry" is the
 * first step, though the client sent the documents (305 / 310).
 * "5 Documents" over three names plus "2 Annexures".
 */
export const HC_DELIVERED = {
  title: 'Documents Delivered',
  h1: 'Documents Delivered',
  sub: 'The documents reached your advocate.',
  pill: 'Blue Dart Express \u2022 Safe Delivery Completed',
  detTitle: 'Delivery Details',
  signed: 'Signed & Handed',
  grid: [
    ['Courier', 'Blue Dart Express'],
    ['Waybill', '8492 0419 5821'],
    ['Delivered On', '25 October 2026'],
    ['Delivered At', '11:30 AM'],
  ] as const,
  toLabel: 'Delivered To',
  toName: 'Adv. Gurneet Chawla',
  toAddr: 'High Court Bar Chamber No. 14, Indore',
  docsTitle: 'Documents',
  count: '5 Documents',
  chips: [
    { icon: 'file', label: 'Case Papers' },
    { icon: 'id', label: 'ID Proof' },
    { icon: 'gavel', label: 'Petition Draft' },
    { icon: 'clip', label: '2 Annexures' },
  ] as const,
  secLabel: 'Physical Security Status',
  secState: 'Delivered \u2713',
  sec: 'Tamper-evident security pouch intact at chamber desk',
  waitTitle: 'Waiting for Advocate',
  waitBody: 'Your advocate will confirm when the documents are received.',
  waitPill: 'Confirmation pending chamber check-in',
  docketTitle: 'Docket Status',
  docketStep: 'Step 2 of 4',
  steps: [
    { title: 'Sent from Central Registry', desc: 'Dispatched via secure air courier', state: 'done' },
    { title: 'Delivered to Chamber', desc: 'Signed at reception desk \u2022 Today, 11:30 AM', state: 'done' },
    { title: 'Advocate Confirmation', desc: 'In Progress \u2022 Advocate reviewing physical docket', state: 'active', chip: 'Active' },
    { title: 'Case Preparation', desc: 'Next \u2022 High Court filing preparation', state: 'next' },
  ] as const,
  cta: 'Back to Home',
  help: 'Need help? ',
  helpLink: 'Contact Advocate or Support',
};

/**
 * design/318 — review before filing.
 *
 * ⚠ CROSS-SERVICE: reached from the DISTRICT COURT court-fee payment (317), it
 * is subtitled "District Court / High Court Representation" — both services at
 * once — and carries DC-2026-1048 (CONFLICT 5) on a High Court screen.
 * ⚠ CONFLICT 6: "Step 2 of 7" (Prep → Done), alongside 313's "STAGE 2 OF 7"
 * with different stages.
 * ⚠ CONFLICT 4: "High Court Advocate" Abhishek Verma, introduced on 300 as a
 * District Court advocate. The drawing clips his name ("Adv. Abhishek Vern");
 * it is shown in full here.
 */
export const HC_REVIEW = {
  title: 'Review Before Filing',
  sub: 'District Court / High Court Representation',
  matter: 'CIVIL MATTER',
  id: 'DC-2026-1048',
  initials: 'AV',
  name: 'Adv. Abhishek Verma',
  role: 'High Court Advocate',
  chat: 'Chat',
  call: 'Call',
  stepHead: 'Step 2 of 7',
  stepMeta: 'Client Review',
  steps: ['Prep', 'Review', 'Filing', 'Hearing', 'Order', 'Next', 'Done'],
  round: 'Review Round 1 of 3',
  roundMeta: '2 rounds left if needed',
  roundTitle: 'Please Review Before Filing',
  roundBody: 'Your advocate prepared these final documents. Please check every page before they go to court.',
  docsTitle: 'Documents for Review',
  files: '3 Files',
  tap: 'Tap to view',
  info: 'Tapping View opens document viewer. To change words, tap Add Comment.',
  docs: [
    { icon: 'file', name: 'Petition.pdf', meta: '32 pages \u2022 Main Plaint \u2022 2.4 MB', badge: 'Ready for sign-off', tone: 'green', add: 'Add Comment', note: true },
    { icon: 'badge', name: 'Affidavit.pdf', meta: '8 pages \u2022 Sworn Statement \u2022 840 KB', badge: 'Signed & Ready', tone: 'peach', add: '+ Add Comment' },
    { icon: 'folder', name: 'Supporting Papers.pdf', meta: '18 pages \u2022 6 Exhibits \u2022 3.1 MB', badge: 'Annexures', tone: 'grey', add: '+ Add Comment' },
  ] as const,
  view: 'View Document',
  noteLabel: 'Your note on Page 6',
  edit: 'Edit',
  remove: 'Remove',
  noteQuote: '\u201CPlease correct the property address on page 6 to House No. 42-B, Sector 15.\u201D',
  elseTitle: 'Anything Else?',
  optional: 'Optional',
  elseSub: 'Tell your advocate anything else you want checked before court filing.',
  placeholder: 'Example: Please make sure the hearing date avoids next Tuesday if possible.',
  sentTo: 'Sent directly to Adv. Abhishek Verma',
  limit: 300,
  checkTitle: 'I have reviewed the documents and want my advocate to continue with filing.',
  checkSub: 'Your advocate will only file after your confirmation.\nNo automated submission.',
  approve: 'Approve Documents',
  changes: 'Request Changes',
  caption: 'Request Changes sends all your notes back to Adv. Abhishek Verma for Round 2 revisions.',
  protocol: 'Legalitt Protocol \u2022 Client approval required before court filing \u2022 Safe & verified',
};

/**
 * design/319 — change-request tracking (sheet over design/318).
 *
 * ⚠ CONFLICT 5: DC-2026-1048 and "District Court Representation" on a sheet
 * opened from a High Court screen.
 * ⚠ The request quoted here ("correct the property details in the final
 * draft") is not the note drawn on 318 ("correct the property address on page
 * 6 to House No. 42-B, Sector 15"). Built as drawn.
 * ⚠ Step 5 is drawn about 12pt left of steps 1–4 (an export glitch, it sits
 * under the fade at the sheet's bottom); aligned with the others here.
 */
export const HC_CHANGE = {
  title: 'Change Request Tracking',
  round: 'Round 1',
  sub: 'District Court Representation \u2022 DC-2026-1048',
  reqLabel: 'YOUR REQUEST',
  reqDate: '07 Oct 2026, 11:30 AM',
  reqQuote: '\u201CPlease correct the property details in the final draft.\u201D',
  requestedBy: 'Requested by:',
  requester: 'Rahul Sharma',
  client: '(Client)',
  advLabel: 'Advocate:',
  adv: 'Abhishek Verma',
  tlTitle: 'TRACKING TIMELINE',
  live: 'Live Status',
  steps: [
    { title: '1. Change Request Sent', badge: 'Completed', state: 'done', desc: '07 Oct 2026, 11:30 AM', box: 'Client notes submitted to Adv. Abhishek Verma for Round 1 revisions.' },
    { title: '2. Advocate Reviewing', badge: 'In Progress', state: 'active', desc: 'Advocate is checking your requested changes in the draft.' },
    { title: '3. Documents Being Updated', badge: 'Pending', state: 'pending', desc: 'Advocate edits the petition and drafts revised pages.' },
    { title: '4. New Documents Sent', badge: 'Pending', state: 'pending', desc: 'Revised PDF files are uploaded for your re-examination.' },
    { title: '5. Client Review Again', badge: 'Pending', state: 'pending' },
  ] as const,
  close: 'Close',
};

/**
 * design/330 (pixel-identical to 336) — pending case details. Reached from
 * "Pending Case" on design/291.
 *
 * ⚠ CONFLICT 4: the previous advocate is "Adv. Rajesh Sharma".
 * ⚠ CONFLICT 5: case number WP(C) 4120/2023.
 * ⚠ CONFLICT 6: "STEP 2 OF 4 • CASE DETAILS" — 291 was "Step 1 of 4 • Intake",
 * the same counter, but 292 (the New Case branch) was "Step 1 • High Court".
 * ⚠ CONFLICT 9: "High Court of Delhi, New Delhi" — 293 filed in MP High Court,
 * Indore Bench.
 * The drawing breaks "case history" onto its own line ("verify your / case
 * history / directly from court servers") — line breaks kept as drawn.
 * "eIDAS" (an EU e-signature regulation) on an Indian court service — copy
 * built as drawn; flagged.
 */
export const HC_PENDING = {
  title: 'Pending Case',
  step: 'STEP 2 OF 4 \u2022 CASE DETAILS',
  h1: 'Pending Case Details',
  sub: 'Add your current case details.',
  transTitle: 'Seamless Advocate Transition',
  transBody: 'We will safely read and verify your\ncase history\ndirectly from court servers.',
  infoTitle: 'Case Information',
  required: 'Required',
  caseNumberLabel: 'Case Number',
  caseNumber: 'WP(C) 4120/2023',
  caseNumberHint: 'You can find this on your court receipt or daily order sheet.',
  courtLabel: 'Court Name',
  court: 'High Court of Delhi, New Delhi',
  typeLabel: 'Case Type',
  type: 'Writ Petition (Civil)',
  advLabel: 'Current Advocate (Optional)',
  optional: 'Optional',
  // ⚠ CONFLICT 4 — Rajesh Sharma.
  adv: 'Adv. Rajesh Sharma',
  advHint: 'Helpful if we need to coordinate case handover.',
  statusLabel: 'Case Status',
  status: 'Arguments Pending',
  nocTitle: 'No Objection Certificate (NOC)',
  nocBody: 'If you are changing your advocate, an NOC may be required.',
  nocInfo: "Don't have it yet? No worries, you can also request help from Legalitt or upload it later.",
  nocFile: 'NOC_Previous_Advocate.pdf',
  nocMeta: '1.4 MB \u2022 Uploaded',
  uploaded: '\u2713 Uploaded',
  view: 'View',
  replace: 'Replace',
  addNoc: '+ Upload Additional NOC Page',
  otherTitle: 'Other Court Documents',
  otherBody: 'Petitions, previous court orders, and annexures will be collected in the next step.',
  cont: 'Continue to Documents',
  privTitle: 'Bank-Grade Privacy',
  privBody: 'Your case information is kept private and 256-bit encrypted.',
  review: 'You can review or edit these details before advocate assignment.',
  cta: 'Submit Case Verification',
  caption: 'Encrypted & legally compliant eIDAS session',
};
