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
