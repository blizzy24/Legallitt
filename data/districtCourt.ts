// ─────────────────────────────────────────────────────────────────────────────
// DISTRICT COURT REPRESENTATION — copy and fixtures for the "dcr" designs in
// 299–335. UI-only. Nothing here is fetched, computed or persisted.
//
// ⚠ NO ENTRY OF ITS OWN. The batch draws no District Court landing or intake:
// its first screen, design/299, is reached from the High Court payment success.
// The designs number the two services as ONE journey that alternates between
// them (298 hcr → 299 dcr → 301 hcr → … → 313 dcr …). Routes and data are kept
// separate as instructed; every cross-service step is commented where it is
// wired. See also the conflict register in data/highCourt.ts.
// ─────────────────────────────────────────────────────────────────────────────


/**
 * design/299 — request submitted.
 *
 * ⚠ CROSS-SERVICE: reached from the HIGH COURT payment (design/298), and it
 * reads "District Court Representation", DC-2026-1048, District Court, Indore.
 */
export const DC_SUBMITTED = {
  title: 'Request Submitted',
  h1: 'Request Submitted',
  sub: 'Your request has been sent to Legalitt.',
  pill: 'We are reviewing your request now.',
  idLabel: 'REQUEST ID',
  idMeta: 'Encrypted',
  // ⚠ CONFLICT 5: DC-2026-1048 here, HCR-2026-1048 on the High Court screens.
  id: 'DC-2026-1048',
  copy: 'Copy',
  idInfo: 'Keep this ID for your records and reference.',
  statusLabel: 'Current Status',
  statusPill: 'Under Review',
  statusTitle: 'Legalitt is reviewing your request.',
  statusBody: 'We will notify you immediately once the assessment is finalized.',
  reqTitle: 'Your Request',
  reqPill: 'Civil',
  rows: [
    ['Service', 'District Court Representation'],
    ['Case Details', 'Rahul Sharma vs Amit Verma'],
    // ⚠ CONFLICT 9: District Court, Indore — the High Court screens before it
    // said MP High Court, Indore Bench.
    ['Court Location', 'District Court, Indore'],
    ['Tier', 'Ordinary (Standard Service)'],
  ] as const,
  feeTitle: 'Total Estimated Fee',
  feeSub: 'Payable later upon confirmation',
  // ⚠ CONFLICT 1: "₹25,000 estimated, payable later" — a screen after the High
  // Court payment took ₹40,680, and against 289's and 295's tier prices.
  fee: '\u20B925,000',
  lock: 'No payment is taken right now. Fees will be payable only upon advocate confirmation.',
  nextTitle: 'What Happens Next?',
  // ⚠ CONFLICT 6: "Step 2 of 9".
  nextMeta: 'Step 2 of 9',
  timeline: [
    { title: 'Request Submitted', state: 'done', desc: 'Your request was successfully received.' },
    { title: 'Under Review', state: 'active', chip: 'In Progress', desc: 'Legalitt is reviewing your request details.' },
    { title: 'Advocate Assigned', state: 'waiting' },
    { title: 'Client Review', state: 'waiting' },
    { title: 'Documents', state: 'waiting' },
    { title: 'Case Preparation', state: 'waiting' },
    { title: 'Court Filing', state: 'waiting' },
    { title: 'First Hearing', state: 'waiting' },
    { title: 'Case Completed', state: 'waiting' },
  ] as const,
  waiting: 'Waiting',
  nowTitle: 'What Happens Now?',
  nowBody: 'Legalitt will review your request. If the request is accepted, a suitable advocate will be assigned. You will then see the advocate details in the app.',
  stayTitle: 'Stay Updated',
  stayBody: 'You will get a notification when there is an important update.',
  helpTitle: 'Need Help?',
  helpSub: 'Have a question',
  support: 'Contact Support',
  cta: 'View Request',
  home: 'Go to Home',
};

/**
 * design/300 — advocate assigned.
 *
 * ⚠ CONFLICT 4: the card assigns Adv Abhishek Verma; the timeline's own
 * "Advocate Assigned" step reads "Matched with Advocate Gurpreet Chawla".
 * ⚠ CONFLICT 6: "Step 4 of 10" — design/299 one screen earlier was
 * "Step 2 of 9", with nine timeline steps, not ten.
 */
export const DC_ASSIGNED = {
  title: 'Your Advocate',
  sub: 'District Court Representation',
  bannerTitle: 'Advocate Assigned',
  bannerBody: 'Legalitt has assigned an advocate to your case.',
  bannerNote: 'You can review the advocate and talk to them before making your decision.',
  verified: 'Verified Advocate',
  name: 'Adv Abhishek Verma',
  initials: 'AV',
  practice: 'District Court Matters',
  chips: [
    { icon: 'award', label: '8+ Years Experience' },
    { icon: 'pin', label: 'Indore, Madhya Pradesh' },
    { icon: 'gavel', label: 'Civil & Property' },
  ] as const,
  bio: 'Experienced in civil, property and family matters with extensive trial appearance record in Indore District Courts.',
  profile: 'View Advocate Profile',
  caseTitle: 'Your Case',
  tier: 'Ordinary (Standard)',
  rows: [
    ['Case Title', 'Rahul Sharma vs Amit Verma'],
    ['Case Type', 'Civil'],
    ['Court', 'District Court, Indore'],
  ] as const,
  idLabel: 'Request ID',
  id: 'DC-2026-1048',
  talkTitle: 'Talk to Your Advocate',
  talkBody: 'You can ask questions and discuss your case before making your decision.',
  chat: 'Chat with Advocate',
  call: 'Call Advocate',
  talkNote: 'Direct consultation before confirmation • No video call required',
  decideTitle: 'Before You Decide',
  decideBody: 'Please review the advocate details and talk to the advocate first. After that, you can decide whether to continue with this advocate.',
  review: 'Review Advocate',
  statusTitle: 'Request Status',
  step: 'Step 4 of 10',
  timeline: [
    { title: 'Request Submitted', desc: 'Details and payment completed', state: 'done' },
    { title: 'Under Review', desc: 'Legalitt reviewed court jurisdiction', state: 'done' },
    // ⚠ CONFLICT 4 — Gurpreet Chawla, not the Abhishek Verma assigned above.
    { title: 'Advocate Assigned', desc: 'Matched with Advocate Gurpreet Chawla', state: 'done' },
    { title: 'Talk to Advocate', desc: 'You can chat or call directly with the advocate', state: 'active', chip: 'Active Step' },
    { title: 'Client Decision', desc: 'Accept or request another advocate', state: 'waiting' },
    { title: 'Documents', desc: 'Upload required evidence and ID', state: 'waiting' },
    { title: 'Case Preparation', desc: 'Drafting petitions & legal notice', state: 'waiting' },
    { title: 'Court Filing', desc: 'Official submission in District Court', state: 'waiting' },
    { title: 'First Hearing', desc: 'Advocate appears before the magistrate', state: 'waiting' },
    { title: 'Case Completed', desc: 'Final order & certified decree copies', state: 'waiting' },
  ] as const,
  nextTitle: 'What Happens Next?',
  next: [
    'Talk to your advocate first to discuss your case details.',
    'After that, you can decide whether to continue with this advocate.',
    'If you accept the advocate, your case will move to the document step.',
  ],
  cta: 'Review Advocate',
  // ⚠ Reads like a designer's annotation, but it is drawn as on-screen text
  // under the button, so it is built as drawn.
  caption: 'Opens Review Advocate screen • Decide whether to accept or request a new advocate',
};

/**
 * design/313 — case preparation.
 *
 * ⚠ UNREACHABLE BY DESIGN — design/312 (the High Court courier's last screen)
 * ends at Back to Home; nothing drawn leads here. Linked as a development
 * preview state on Home.
 * ⚠ CROSS-SERVICE: a District Court screen after the High Court courier flow.
 * ⚠ CONFLICT 4: Adv. Abhishek Verma — 310–312 delivered to Adv. Gurneet
 * Chawla.
 * ⚠ CONFLICT 5: "Ref: DL-2026-CV" — a fourth identifier format for one matter.
 * ⚠ CONFLICT 6: "STAGE 2 OF 7" (299 counted 9 steps, 300 counted 10).
 * "All 5 physical documents" — 310–312 listed four.
 */
export const DC_PREP = {
  kicker: 'DISTRICT COURT REPRESENTATION',
  title: 'Case Preparation',
  pill: 'In Progress',
  desk: 'CHAMBER DESK',
  h1: 'Case Preparation',
  sub: 'Your advocate is preparing your case.',
  note: 'All 5 physical documents have been received in the chamber. Your advocate is now drafting the case documents.',
  sumLabel: 'CASE SUMMARY',
  ref: 'Ref: DL-2026-CV',
  parties: 'Rahul Sharma vs Amit Verma',
  chips: ['Civil Case', 'District Court'],
  initials: 'AV',
  adv: 'Adv. Abhishek Verma',
  advRole: 'Assigned Advocate',
  latestTitle: 'Latest Update',
  latestTag: 'Advocate Update',
  latest: 'Your documents have been received and your advocate is now preparing the case.',
  latestDate: '26 October 2026 • 02:30 PM',
  nextLabel: 'NEXT STEP',
  nextTitle: 'Court Filing',
  next: 'Your advocate will file the case in court once the draft is finalized. You will be notified immediately.',
  nextFoot: 'No action required from you right now.',
  progTitle: 'Case Progress',
  stage: 'STAGE 2 OF 7',
  steps: [
    { title: 'Documents Received', desc: 'Completed on 26 Oct', state: 'done' },
    { title: 'Case Preparation', desc: 'Drafting petitions and affidavits', state: 'current', chip: 'Current Stage' },
    { title: 'Court Filing', desc: 'Upcoming', state: 'waiting' },
    { title: 'First Hearing', desc: 'Upcoming', state: 'waiting' },
    { title: 'Hearing Update', desc: 'Upcoming', state: 'waiting' },
    { title: 'Next Hearing', desc: 'Upcoming', state: 'waiting' },
    { title: 'Case Completed', desc: 'Upcoming', state: 'waiting' },
  ] as const,
  qaTitle: 'Have a question about your case?',
  qaSub: 'Speak directly with Adv. Abhishek Verma.',
  chat: 'Chat',
  call: 'Call',
  cta: 'View Case',
  caption: 'Return to Case Dashboard',
};

/**
 * design/314 — court fee (reached from View Case on design/313).
 *
 * ⚠ CONFLICT 2: "Pay Court Fee (₹3,500)" opens the shared payment (designs
 * 315–317 = 296–298), which charges ₹40,680 — see components/CourtPaymentFlow.
 * ⚠ CONFLICT 1: a ₹3,500 court fee, after 299 promised a ₹25,000 estimate
 * "payable only upon advocate confirmation" and 296 took ₹40,680.
 */
export const DC_COURT_FEE = {
  title: 'Court Fee',
  sub: 'District Court Representation',
  pill: 'FRESH CASE • REQUIRED BEFORE FILING',
  reqTitle: 'Court Fee Required',
  reqBody: 'A court fee is needed before your fresh case can be filed in court.',
  reqInfo: 'This fee goes directly to the court registry to register your case.',
  amtTitle: 'Court Fee Amount',
  amtTag: 'Payment Pending',
  amount: '₹3,500',
  unit: 'INR',
  amtDesc: 'The actual fee for your case is shown here. It is calculated by the court rules for your case value.',
  boxRows: [
    ['Court Registry Fee', '₹3,500'],
    ['Filing Status', 'Awaiting Fee Payment'],
  ] as const,
  infoTitle: 'Case Information',
  infoTag: 'Fresh Case',
  parties: ['Parties', 'Rahul Sharma vs Amit Verma'] as const,
  facts: [
    ['Case Type', 'Civil Suit'],
    ['Court', 'District Court, Indore'],
  ] as const,
  initials: 'AV',
  adv: 'Adv. Abhishek Verma',
  advRole: 'Assigned Advocate',
  ask: 'Have a question about this fee? Ask your advocate.',
  chat: 'Chat',
  call: 'Call',
  nextTitle: 'What Happens Next',
  next: [
    'Pay the court fee securely through UPI, Card, or Net Banking.',
    'Your advocate will submit the court filing immediately.',
    'You will receive the official court filing confirmation and receipt.',
  ],
  cta: 'Pay Court Fee (₹3,500)',
  foot: '100% Secure Government Court Payment • Verified by Legalitt',
};

/**
 * design/320 — court filing (reached from Approve Documents on design/318).
 *
 * ⚠ CROSS-SERVICE: a District Court screen after the High Court review.
 * ⚠ CONFLICT 5: filing number HC/IND/2026/18452 — an "HC" (High Court)
 * prefix on a District Court filing — plus case number WP/2026/09876.
 * ⚠ CONFLICT 6: "Stage 3 of 6" (313 was "STAGE 2 OF 7").
 * ⚠ CONFLICT 9: "District Court, Indore Bench".
 * "Filed Documents 3" — Petition, Affidavit, Supporting Papers — after five
 * documents were couriered.
 */
export const DC_FILING = {
  kicker: 'DISTRICT COURT REPRESENTATION',
  title: 'Court Filing',
  notifTitle: 'Notification Sent',
  notifBody: 'Your advocate has updated your court filing details and scheduled your first hearing.',
  filedTitle: 'Case Filed',
  filedPill: 'Filed',
  filedBody: 'Your advocate has updated the court filing details.',
  filedNote: 'Details verified and submitted by your assigned advocate.',
  detTitle: 'Filing Details',
  detMeta: 'Official Registry',
  rows: [
    { label: 'Filing Date', value: '18 October 2026' },
    { label: 'Filing Number', value: 'HC/IND/2026/18452', copy: true },
    { label: 'Case Number', value: 'WP/2026/09876', copy: true },
    { label: 'Filing Status', value: 'Filed', dot: true },
    { label: 'Court', value: 'District Court, Indore Bench' },
  ] as const,
  hearTitle: 'First Hearing',
  hearPill: 'Scheduled',
  hearDate: '25 October 2026 • 11:00 AM',
  hearRoom: 'Court Room 3, Indore Bench',
  hearConfirm: 'Hearing details confirmed by your advocate.',
  hearNote: 'Hearing information appears only after your advocate verifies real dates directly with the court roster.',
  docsTitle: 'Filed Documents',
  docs: [
    { name: 'Petition.pdf', meta: '32 pages · PDF' },
    { name: 'Affidavit.pdf', meta: '8 pages · PDF' },
    { name: 'Supporting Papers.pdf', meta: '18 pages · PDF' },
  ],
  view: 'View',
  nextLabel: 'NEXT STEP',
  nextTitle: 'First Hearing',
  next: 'Your advocate will appear in court on 25 October 2026. You will receive an update after the hearing.',
  progTitle: 'Case Progress',
  stage: 'Stage 3 of 6',
  steps: [
    { title: 'Case Preparation', desc: 'Completed', state: 'done' },
    { title: 'Court Filing', desc: 'Completed on 18 Oct', state: 'done' },
    { title: 'First Hearing', desc: 'Current • Scheduled for 25 Oct', state: 'current' },
    { title: 'Hearing Update', desc: 'Upcoming', state: 'waiting' },
    { title: 'Next Hearing', desc: 'Upcoming', state: 'waiting' },
    { title: 'Case Completed', desc: 'Upcoming', state: 'waiting' },
  ] as const,
  cta: 'View Hearing Details',
  caption: 'Return to Case Overview',
};
