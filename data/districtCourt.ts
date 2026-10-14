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

/**
 * design/321 — process fee (reached from View Hearing Details on design/320,
 * by design numbering).
 *
 * ⚠ CONFLICT 2: "Pay Process Fee (₹850)" opens the shared payment (322–324 =
 * 296–298 apart from 324's "View Receipt"), which charges ₹40,680.
 * ⚠ CONFLICT 5: WP/2026/09876.
 * "Government Portal Charges ₹0 (Included)" — the ₹40,680 screen adds GST.
 */
export const DC_PROCESS_FEE = {
  title: 'Process Fee',
  sub: 'District Court Representation',
  pill: 'FEE REQUESTED BY ADVOCATE',
  task: 'Court Task',
  reqLabel: 'OFFICIAL COURT REQUEST',
  reqTitle: 'Process Fee for Court Notice',
  quote: '“Process fee for sending court notice to the other party.”',
  initials: 'AV',
  adv: 'Adv. Abhishek Verma',
  advRole: 'Assigned Advocate',
  dateLabel: 'Request Date',
  date: '24 Oct 2026',
  amtTitle: 'Process Fee Amount (Bhatta)',
  amtTag: 'Payment Pending',
  amount: '₹850',
  unit: 'INR',
  amtDesc: 'Official court summons fee requested by your advocate for filing directly with the court registry.',
  boxRows: [
    { label: 'Court Notice Service Fee', value: '₹850' },
    { label: 'Government Portal Charges', value: '₹0 (Included)', green: true },
    { label: 'Total Payable Amount', value: '₹850', total: true },
  ] as const,
  matterLabel: 'ASSOCIATED MATTER',
  matterMeta: 'Active Case',
  matter: 'Rahul Sharma vs Amit Verma',
  matterCells: [
    ['Case Number', 'WP/2026/09876'],
    ['Forum', 'District Court'],
  ] as const,
  clarTitle: 'Need clarification?',
  clarSub: 'Ask your advocate before paying',
  chat: 'Chat',
  call: 'Call',
  recTitle: 'Receipt Status: Not Added Yet',
  recBody: 'Your advocate will add the official court receipt after the payment is made and the process is complete.',
  recBox: 'Once uploaded by your advocate, you will be able to view and download the official receipt right here.',
  nextTitle: 'What happens next?',
  nextMeta: '3 quick steps',
  next: [
    { title: 'Pay fee securely', desc: 'Use UPI, debit/credit cards, or net banking.' },
    { title: 'Advocate submits to registry', desc: 'Your advocate files the notice fee directly at the court window.' },
    { title: 'Court receipt uploaded', desc: 'Get the verified stamped receipt stored in your case records.' },
  ],
  cta: 'Pay Process Fee (₹850)',
  foot: '100% Secure Payment • Official Court Filing Record',
};

/**
 * design/325 — process fee receipt (from "View Receipt" on design/324).
 *
 * ⚠ CONFLICT 2: "Amount ₹850" here — the payment just shown charged ₹40,680.
 * ⚠ CONFLICT 5: WP/2026/09876.
 */
export const DC_RECEIPT = {
  title: 'Process Fee Receipt',
  sub: 'District Court Representation',
  doneTitle: 'Process Fee Completed',
  doneBody: 'The process fee has been paid and the official court receipt is ready.',
  stats: [
    { label: 'Amount', value: '₹850' },
    { label: 'Payment', ok: 'Received' },
    { label: 'Receipt', ok: 'Available' },
  ] as const,
  recLabel: 'RECEIPT',
  recTag: 'Official PDF',
  file: 'Process_Fee_Receipt.pdf',
  fileMeta: 'PDF • 2.1 MB • Uploaded by Advocate',
  view: 'View Receipt',
  download: 'Download',
  caseTitle: 'Case Details',
  rows: [
    ['Case Title', 'Rahul Sharma vs Amit Verma'],
    ['Case Number', 'WP/2026/09876'],
    ['Court', 'District Court'],
    ['Assigned Advocate', 'Adv. Abhishek Verma'],
  ] as const,
  nextTitle: 'Next Step',
  next: 'The case will continue with the next court step.',
  qTitle: 'Have questions about this receipt?',
  qSub: 'Ask your advocate directly for any clarification.',
  initials: 'AV',
  adv: 'Adv. Abhishek Verma',
  online: 'Online',
  cta: 'View Receipt',
  foot: 'Verified Court Document • Stored in Case Records',
};

/**
 * design/326 — first hearing (from the Next Step card on design/325).
 *
 * ⚠ CONFLICT 5: WP/2026/09876.
 * ⚠ CONFLICT 6: "Stage 2 of 5" — 320 put First Hearing at "Stage 3 of 6".
 * ⚠ The hearing is "25 Oct 2026 … Sunday Session" — 25 October 2026 is a
 * Sunday; a district-court listing on a Sunday is unusual. Built as drawn.
 * ⚠ The drawing clips "First Hearing Sche[duled]" and "Court listing verified
 * and co[nfirmed]" under the pill; both are shown in full here, shrunk to fit.
 */
export const DC_HEARING = {
  title: 'First Hearing',
  sub: 'District Court Representation',
  alertLabel: 'SCHEDULED ALERT',
  alertTime: 'Just now',
  alertTitle: 'Your first hearing is on 25 October 2026 at 11:00 AM',
  alertSub: 'District Court · Court Room 3, Indore Bench',
  schedTitle: 'First Hearing Scheduled',
  schedSub: 'Court listing verified and confirmed',
  schedPill: 'Scheduled',
  detTitle: 'HEARING DETAILS',
  registry: 'Official Registry',
  dateLabel: 'Date',
  date: '25 Oct\n2026',
  dateSub: 'Sunday Session',
  timeLabel: 'Time',
  time: '11:00 AM',
  timeSub: 'IST (Morning Bench)',
  tiles: [
    ['Court Room', 'Court Room 3'],
    ['Court Authority', 'District Court'],
    ['Bench', 'Indore Bench'],
    ['Presiding Authority', 'District & Sessions Judge'],
  ] as const,
  confirm: 'Hearing date confirmed and added directly from the court registry by your advocate.',
  refLabel: 'CASE REFERENCE',
  civil: 'Civil Matter',
  parties: 'Rahul Sharma vs Amit Verma',
  fileLabel: 'Case File Number',
  file: 'WP/2026/09876',
  copy: 'Copy',
  initials: 'AV',
  adv: 'Adv. Abhishek Verma',
  advSub: 'District Court · Chamber 14',
  beforeLabel: 'BEFORE THE HEARING',
  before: 'Keep your case documents ready and stay in touch with your advocate.',
  beforeSub: 'Your advocate will appear in court on your behalf.',
  update: 'Your advocate will share an update after the hearing. There are no actions required from you right now.',
  progTitle: 'CASE PROGRESS',
  stage: 'Stage 2 of 5',
  steps: [
    { title: 'Court Filing', desc: 'Completed on 18 Oct', state: 'done' },
    { title: 'First Hearing', desc: 'Scheduled for 25 Oct at 11:00 AM', state: 'current', chip: 'Current' },
    { title: 'Hearing Update', desc: 'Upcoming post-session brief', state: 'waiting' },
    { title: 'Next Hearing', desc: 'To be determined by bench', state: 'waiting' },
    { title: 'Case Completed', desc: 'Final order and decree', state: 'waiting' },
  ] as const,
  qTitle: 'Have questions before the hearing?',
  qSub: 'Reach out directly to Adv. Abhishek Verma',
  call: 'Call Advocate',
  chat: 'Chat with\nAdvocate',
  cta: 'View Full Case Details',
  caption: 'Return to Case Dashboard',
};

/**
 * design/327 — case overview (after the first hearing, design/326).
 *
 * ⚠⚠ CONFLICT 8: the progress says First Hearing "Completed on 12 Sep 2026",
 * while this same screen (and 320/326) puts that hearing on 25 October 2026.
 * Built as drawn.
 * ⚠ CONFLICT 6: "Phase 2 of 4", after 326's "Stage 2 of 5".
 * ⚠ CONFLICT 5: Court_Order_25_Oct_2026 — and the drawing clips the file name
 * and its meta ("Court_Order_25_Oct_202", "Certified Registry Or"); both are
 * shown in full here, wrapped.
 * The summary timestamp is clipped too ("25 Oct 2026, 01:"); it is not
 * completed — the minutes are not drawn.
 */
export const DC_OVERVIEW = {
  kicker: 'DISTRICT COURT REPRESENTATION',
  title: 'Case Overview',
  alertLead: 'Update logged: ',
  alert: 'Your advocate has added a verified briefing for your hearing on 25 October 2026.',
  doneHead: 'Hearing Completed',
  donePill: 'Completed',
  doneDate: '25 October 2026',
  doneBody: 'Your advocate has successfully attended and filed all required briefs for this hearing session.',
  detLabel: 'HEARING DETAILS',
  formal: 'Formal Session',
  rows: [
    ['Date & Time', '25 Oct 2026 • 11:00 AM'],
    ['Court Room', 'Court Room 3'],
    ['Court & Bench', 'District Court • Indore'],
    ['Lead Counsel', 'Adv. Abhishek Verma'],
  ] as const,
  whatTitle: 'What Happened?',
  quote: '“The court heard the matter and asked us to file the previous order before the next date. Our argument was taken on record, and the judge granted time to place the certified copy in the registry.”',
  byLead: 'Summary by ',
  byName: 'Adv. Abhishek Verma',
  // Clipped in the drawing; kept as drawn.
  byTime: ' • 25 Oct 2026, 01:',
  initials: 'AV',
  dirLabel: 'COURT DIRECTION',
  dirTitle: 'File the previous court order before the next hearing.',
  handled: 'Action handled directly by your advocate',
  recLabel: 'OFFICIAL RECORD',
  recMeta: '1 File Attached',
  recName: 'Court_Order_25_Oct_2026.pdf',
  recFileMeta: '8 pages • Certified Registry Order',
  view: 'View',
  nextLabel: 'NEXT STEP',
  nextTitle: 'File the previous court order before the next hearing.',
  next: "Advocate's team is compiling the certified copies from the District Registry.",
  upLabel: 'UPCOMING DATE',
  upPill: 'Scheduled',
  upDate: '10 November 2026',
  upTime: '11:30 AM • Court Room 3, Indore Bench',
  upLink: 'View Hearing Schedule',
  progTitle: 'Case Progress',
  phase: 'Phase 2 of 4',
  steps: [
    // ⚠ CONFLICT 8 — 12 Sep 2026 against the 25 Oct hearing above.
    { title: 'First Hearing', desc: 'Completed on 12 Sep 2026', state: 'done' },
    { title: 'Hearing Update', desc: 'Completed 25 Oct 2026', state: 'doneGreen' },
    { title: 'Next Hearing', desc: 'Scheduled • 10 Nov 2026', state: 'current' },
    { title: 'Final Order & Disposition', desc: 'Upcoming', state: 'waiting' },
  ] as const,
  qTitle: 'Have questions?',
  qSub: 'Adv. Abhishek Verma • Lead Representation',
  message: 'Message',
  callChamber: 'Call Chamber',
  cta: 'View Full Case File',
  caption: 'Return to Case Dashboard',
};

/**
 * design/328 — next hearing.
 *
 * ⚠⚠ CONFLICT 7: "Change Advocate??" in pure red (#EE0000) under View Case —
 * an unfinished designer's note left in the export. Rendered as drawn; it is
 * the only drawn link to design/329 (Change Advocate), so it is wired there.
 * ⚠ CONFLICT 9: "District Court · Court Room 3, Indore Bench".
 */
export const DC_NEXT_HEARING = {
  kicker: 'DISTRICT COURT REPRESENTATION',
  title: 'Next Hearing',
  bannerTitle: 'Next Hearing Scheduled',
  bannerBody: 'Your next hearing is on 10 November 2026 at 11:30 AM.',
  bannerSub: 'District Court · Court Room 3, Indore Bench',
  nextLabel: 'NEXT HEARING',
  pill: 'Scheduled',
  date: '10 Nov 2026',
  time: '11:30 AM',
  grid: [
    ['Court Room', 'Room 3'],
    ['Court', 'District Court'],
    ['Bench', 'Indore Bench'],
  ] as const,
  confirm: 'Hearing listing confirmed and added directly by your advocate.',
  advLabel: 'ADVOCATE',
  adv: 'Adv. Abhishek Verma',
  advSub: 'District Court · Lead Counsel',
  verified: 'Verified',
  nsTitle: 'Next Step',
  nsBold: 'File the previous court order before the next hearing.',
  ns: "Your advocate's team is preparing the certified copies from the District Registry.",
  noteTitle: 'Advocate Note',
  note: 'Please keep all original property and transaction receipts accessible in case the bench requests immediate physical inspection on the hearing date.',
  progLabel: 'CASE PROGRESSION',
  steps: [
    { title: 'First Hearing', right: 'Completed', state: 'done' },
    { title: 'Hearing Update', right: 'Completed', state: 'done' },
    { title: 'Next Hearing', right: 'Scheduled · 10 Nov 2026', state: 'current' },
    { title: 'Case Completed', right: 'Upcoming', state: 'waiting' },
  ] as const,
  chat: 'Chat with Adv.',
  call: 'Call Adv.',
  cta: 'View Case',
  // ⚠ CONFLICT 7 — the designer's note, drawn red.
  changeNote: 'Change Advocate??',
};

/**
 * design/329 — change advocate (from the red "Change Advocate??" note on 328).
 *
 * ⚠ CONFLICT 2: the ₹12,000 change fee's (₹1,500 before the 14 Oct re-issue)
 * Continue opens the shared payment,
 * which charges ₹40,680 (see components/CourtPaymentFlow).
 * ⚠ CONFLICT 6: "Court #4" — a fifth progress notation.
 * ⚠ CONFLICT 4: the photo is Adv. Abhishek Verma's.
 */
export const DC_CHANGE = {
  title: 'Change Advocate',
  sub: 'District Court Representation',
  elig: 'Eligible to Change • Ongoing Case',
  h1: 'Request a New Advocate',
  body: 'You can ask Legalitt to change the advocate for your ongoing case.',
  feeNote: 'A separate change fee may apply.',
  curLabel: 'CURRENT ADVOCATE',
  active: 'Active',
  initials: 'AV',
  adv: 'Adv. Abhishek Verma',
  advSub: 'Civil & District Court Representation',
  chat: 'Chat',
  call: 'Call',
  linked: 'Your current advocate stays linked to your case until a new advocate is approved and accepted.',
  stageLabel: 'CURRENT CASE STAGE',
  stageMeta: 'Court #4',
  firstLabel: 'First Hearing',
  firstValue: 'Completed',
  nextLabel: 'Next Hearing',
  nextValue: '10 Nov 2026, 11:30 AM',
  stageNote: 'Next hearing is scheduled. Work will continue smoothly without losing your case history.',
  whyTitle: 'Why Do You Want to Change?',
  whySub: 'Choose the main reason for your request',
  reasons: [
    'I want a different advocate',
    'I need a different practice area',
    'I am not satisfied with the current support',
    'Other',
  ],
  moreTitle: 'Tell us more (optional)',
  morePlaceholder: 'Share any details to help us find the right advocate for you...',
  feeLabel: 'CHANGE ADVOCATE FEE',
  feeTag: 'Payment Pending',
  // Re-issued 14 Oct (design/329): ₹12,000 (was ₹1,500).
  fee: '₹12,000',
  feeSub: 'One-time processing',
  feeBox: 'The fee will be shown and verified before you confirm your request. Administrative fee to transfer case representation.',
  howTitle: 'How It Works',
  how: [
    { icon: 'lock', title: 'Current advocate is not removed immediately', body: 'No sudden stops or gaps in ongoing court actions.' },
    { icon: 'admin', title: 'Legalitt admin reviews your request', body: 'We match you with a verified, experienced advocate.' },
    { icon: 'talk', title: 'You can chat and call the new advocate', body: 'Talk directly before formally accepting the replacement.' },
    { icon: 'folder', title: 'Case documents remain safe', body: 'All filings, dates, and order copies transfer cleanly.' },
  ] as const,
  // Drawn with an arrow in the label and another at the button's edge.
  cta: 'Continue →',
  foot: 'Case History Preserved • Verified Legalitt Process',
};

/**
 * design/335 — case completed. The last District Court screen; reached (by
 * wiring, not by a drawn control) from the change-advocate payment success.
 *
 * ⚠ CONFLICT 5: WP/2026/09876.
 * ⚠ The milestone row ends at "Closed" while 328, a few screens earlier,
 * still had a 10 Nov 2026 hearing pending; completed "15 December 2026".
 * The drawing clips "View filed petitions, court orders and [annexures]";
 * the line is completed here only up to what is drawn and wraps.
 */
export const DC_COMPLETED = {
  title: 'Case Completed',
  sub: 'District Court Representation',
  heroTitle: 'Case Completed',
  heroBody: 'Your case has been marked as completed.',
  heroSub: 'You can still view your case information and documents anytime.',
  msLabel: 'MILESTONE JOURNEY',
  msAll: 'All Steps Finished',
  milestones: ['Docs', 'Prep', 'Filing', 'Hearings', 'Closed'],
  tags: ['Civil Case', 'District Court, Indore'],
  parties: 'Rahul Sharma vs Amit Verma',
  numLabel: 'Case Number: ',
  num: 'WP/2026/09876',
  copy: 'Copy',
  initials: 'AV',
  adv: 'Adv. Abhishek Verma',
  advSub: 'District Court • Chamber 14',
  statLabel: 'Final Status',
  statPill: 'Completed',
  updLabel: 'Final Update',
  upd: 'The case work has been completed.',
  updDate: '15 December 2026',
  docsTitle: 'Case Documents',
  docsSub: 'View filed petitions, court orders and',
  docsLink: 'View',
  histTitle: 'Case History',
  histSub: 'Past hearing logs and entire timeline',
  sumLabel: 'SERVICE SUMMARY',
  plan: ['Service Plan', 'District Court Representation'] as const,
  tier: ['Tier / Type', 'Standard / Ordinary Service'] as const,
  help: 'Need Help? Contact Support',
  cta: 'View Case',
  home: 'Back to Home',
};

// ─────────────────────────────────────────────────────────────────────────────
// THE DISTRICT COURT INTAKE AND MIDDLE SECTION — designs 338–355, issued
// 14 Oct. Before these the District Court service had no entry of its own (its
// first screen was 299, reached from the High Court payment); 338 is now the
// District Court tile's landing on client Home.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * design/338 — District Court landing.
 *
 * ⚠ CONFLICT 1 (pricing): both tiers read "₹XX,XXX" — placeholders — while
 * design/343, three screens on, prices them ₹25,000 / ₹35,000. Built as drawn.
 * The body copy's line breaks ("connect with / a verified / advocate…") are
 * drawn; kept.
 */
export const DC_LANDING = {
  title: 'District Court Representation',
  heroPill: 'Verified Court Coverage',
  h1: 'District Court Representation',
  body: 'Get help from a verified advocate for your District Court case.',
  start: 'Start New Case',
  helpTitle: 'Get Help With Your Case',
  helpBody: 'Legalitt helps you connect with\na verified\nadvocate and manage your\nDistrict Court\ncase through the app.',
  whyTitle: 'Why Legalitt?',
  whyPill: 'Simple & Safe',
  why: [
    { icon: 'shield', title: 'Verified Advocates', body: 'Connect with a verified advocate.' },
    { icon: 'support', title: 'Case Support', body: 'Get support through your case.' },
    { icon: 'bell', title: 'Case Updates', body: 'See important case updates in the app.' },
    { icon: 'folder', title: 'Document Help', body: 'Share and manage your documents.' },
  ] as const,
  learnTitle: 'Learn About District Court Cases',
  learnBody: 'Learn how District Court\nrepresentation\nworks and what happens after\nyou start\na case.',
  learnMore: 'Learn More',
  optTitle: 'Service Options',
  options: [
    { badge: 'Ordinary', tone: 'grey', sub: 'Standard service', price: '₹XX,XXX', proc: 'Normal processing', icon: 'clock' },
    { badge: 'Urgent', tone: 'peach', sub: 'Priority service', price: '₹XX,XXX', proc: 'Faster processing', icon: 'zap' },
  ] as const,
  optNote: 'Final price is shown before you submit your request. No payment is taken now.',
  readyTitle: 'Ready to Start?',
  readySub: 'Tell us about your case and submit a request.',
  needTitle: 'Need Help First?',
  needBody: 'Not sure what you\nneed? We can\nguide you.',
  getHelp: 'Get Assistance',
  supTitle: 'Legalitt Service Support',
  supBody: 'If your confirmed advocate does not attend a hearing or does not handle the agreed work, Legalitt may review the issue and may return part of the service fee.',
  supNote: 'Any refund or fee return depends on the case and Legalitt review.',
  caption: 'Opens case selection • Takes 2 mins',
};

/** design/339 — District Court information guide (Learn More on 338). */
export const DC_INFO = {
  title: 'District Court Information',
  caps: 'INFORMATION GUIDE',
  h1: 'What Is District Court Representation?',
  body: 'A District Court handles many types of cases. A qualified advocate can help you understand your case, prepare the required work, appear in court, and guide you through the next steps.',
  artPill: 'Verified Court Advocates',
  mattersTitle: 'Common District Court Matters',
  mattersSub: 'Advocates on Legalitt handle various matters in District Courts:',
  // "…property…", "and.." — the truncation marks are drawn text; kept.
  matters: [
    { icon: 'scale', title: 'Civil', body: 'Disputes between people, agreements, and property…' },
    { icon: 'shield', title: 'Criminal', body: 'Defense, bail requests, and criminal court matters.' },
    { icon: 'family', title: 'Family', body: 'Family matters, guardianship, and..' },
    { icon: 'heart', title: 'Divorce', body: 'Mutual consent or contested divorce...' },
    { icon: 'building', title: 'Property', body: 'Ownership disputes, possession, tenant, and..' },
    { icon: 'money', title: 'Money Recovery', body: 'Cheque bounce (NI Act), unpaid loans, and claims.' },
    { icon: 'bag', title: 'Consumer', body: 'Defective products, poor service, and forum claims.' },
    { icon: 'more', title: 'Other Matters', body: 'Other valid legal disputes eligible in District Court.' },
  ] as const,
  howTitle: 'How It Works',
  howSub: 'A simple step-by-step process to get legal representation:',
  how: [
    ['Tell Us About Your Case', 'Share basic details of your matter.'],
    ['Upload Your Documents', 'Share your papers securely through the app.'],
    ['Legalitt Reviews Your Request', 'We review your case details and requirements.'],
    ['An Advocate Is Assigned', 'A verified local District Court advocate is assigned.'],
    ['Chat or Call With the Advocate', 'Discuss your case directly with your advocate.'],
    ['Confirm the Advocate', 'Review and confirm your advocate when you are ready.'],
    ['Share Required Documents', 'Provide any additional court papers needed.'],
    ['Your Case Moves Forward', 'Your advocate prepares and represents you in court.'],
  ] as const,
  afterTitle: 'What Happens After You Start?',
  progPill: 'Typical Court Progression',
  // ⚠ CONFLICT 6 — a ten-stage progression, against 299's nine and 300's ten
  // differently named steps.
  progression: [
    'Request Submitted',
    'Advocate Assigned',
    'Client Confirms Advocate',
    'Documents Collected',
    'Case Preparation',
    'Court Filing',
    'First Hearing',
    'Hearing Updates',
    'Next Hearings',
    'Case Completed',
  ],
  docTitle: 'Your Documents',
  docBody: 'The advocate may ask for documents based on your case. You can upload and share documents through Legalitt.',
  docNote: 'Requirements differ by case, so your advocate will guide you on exactly which documents are required.',
  trackTitle: 'Track Your Case',
  trackBody: 'You can see important case updates, hearing dates, documents and next steps in the Legalitt app.',
  optTitle: 'Service Options',
  options: [
    { icon: 'clock', title: 'Ordinary', sub: 'Standard service', proc: 'Normal processing' },
    { icon: 'zap', title: 'Urgent', sub: 'Priority service', proc: 'Faster processing' },
  ] as const,
  optNote: 'The available service and final price are shown before you submit your request.',
  supTitle: 'Legalitt Service Support',
  supBody: 'If your confirmed advocate does not attend a hearing or does not handle the agreed work, Legalitt may review the issue and may return part of the service fee.',
  supNote: 'Any refund or fee return depends on the case and Legalitt review.',
  impTitle: 'Important',
  impBody: 'Legalitt connects you with advocates and helps you manage your case. The advocate handles the legal work. Case results and timelines can vary.',
  cta: 'Start New Case',
  back: 'Back to District Court Representation',
};

/**
 * design/340 — select case type.
 *
 * ⚠ CONFLICT 6: "STEP 1 OF 4" — a four-step intake (Case Type, Details,
 * Documents, Service); the review that follows (344) is also "STEP 4 OF 4".
 */
export const DC_CASE_TYPE = {
  title: 'Select Case Type',
  sub: 'District Court Representation',
  step: 'STEP 1 OF 4',
  setup: 'Case Setup',
  steps: ['Case Type', 'Details', 'Documents', 'Service'],
  h1: 'What Type of Case Do You Have?',
  lead: 'Choose the option that best matches your case.',
  info: 'You can add more details on the next step.',
  types: [
    { id: 'civil', icon: 'scale', title: 'Civil', desc: 'General civil matters.' },
    { id: 'criminal', icon: 'gavel', title: 'Criminal', desc: 'Criminal case support.' },
    { id: 'family', icon: 'family', title: 'Family', desc: 'Family-related matters.' },
    { id: 'divorce', icon: 'file', title: 'Divorce', desc: 'Divorce case support.' },
    { id: 'property', icon: 'building', title: 'Property', desc: 'Property-related matters.' },
    { id: 'money', icon: 'wallet', title: 'Money Recovery', desc: 'Help with money recovery matters.' },
    { id: 'consumer', icon: 'bag', title: 'Consumer', desc: 'Consumer-related matters.' },
    { id: 'other', icon: 'more', title: 'Other', desc: 'For matters not listed above.' },
  ] as const,
  /** Drawn selected. */
  initial: 'property' as const,
  noteTitle: 'District Court Representation',
  noteBody: 'Standard procedural coverage for original petitions and suits.',
  link: 'Not sure which one to choose? View examples',
  cta: 'Continue',
  caption: 'Next: Case Details • Takes 2 mins',
};

/**
 * design/341 — case details, drawn filled in.
 *
 * ⚠ CONFLICT 6: "STEP 2 OF 4" on the pill, while the stepper below ticks Case
 * Type AND Details and draws Documents as the current (brown) step 3.
 * "Basic Details — Step 1 of 5" is a second, inner counter.
 * ⚠ The matter is "[ Civil Matter ]" / "Civil Case", while 340 draws Property
 * selected.
 * ⚠ CONFLICT 7: "CS/2024/8912" is a case number no other export uses.
 * ⚠ CONFLICT 8: "Adv. R.K. Trivedi" — a previous advocate named nowhere else.
 */
export const DC_CASE_DETAILS = {
  title: 'Case Details',
  sub: 'District Court Representation',
  step: 'STEP 2 OF 4',
  tag: '[ Civil Matter ]',
  steps: ['Case Type', 'Details', 'Documents', 'Service'],
  h1: 'Tell Us About Your Case',
  lead: 'Add a few details so we can understand your case clearly.',
  info: 'You can always add more information or papers later.',

  basicTitle: 'Basic Details',
  basicStep: 'Step 1 of 5',
  caseTitleLabel: 'Case Title',
  caseTitle: 'Rahul Sharma vs Amit Verma',
  caseTitleHelp: 'Add the names of the main people or parties in this dispute.',
  partyLabel: 'Other Party Name',
  party: 'Amit Verma & Associates',
  courtCaps: 'COURT LOCATION',
  cityLabel: 'Your City',
  city: 'Indore',
  districtLabel: 'District',
  district: 'Indore',
  stateLabel: 'State',
  state: 'Madhya Pradesh',

  happenedTitle: 'Tell Us What Happened',
  happenedLabel: 'What Happened?',
  happened:
    'There is a boundary wall and ancestral land ownership dispute regarding Plot No. 14. The adjacent neighbor has started unauthorized construction despite written notices.',
  happenedHint: 'You do not need to use legal words. Just explain the situation in your own comfortable words.',

  dateTitle: 'Important Date',
  dateQuestion: 'Is there any upcoming or important date?',
  yes: 'Yes',
  no: 'No',
  dateLabel: 'Date',
  date: '18 Nov 2026',
  aboutLabel: 'What is this date about?',
  about: 'Municipal reply submission deadline',
  noteLead: 'Note:',
  note: ' This is a date you are tracking. The advocate will add official district court appearance dates after filing.',

  newTitle: 'Is This a New Case?',
  newYes: 'Yes, this is a fresh new case',
  newNo: 'No, my case is already going on',
  numberLabel: 'Case Number',
  number: 'CS/2024/8912',
  prevLabel: 'Previous Advocate',
  prev: 'Adv. R.K. Trivedi',
  reasonLabel: 'Reason for Changing Advocate',
  reason: 'Relocation to district headquarter',
  nocTitle: 'NOC from Previous Advocate',
  nocChip: 'Not Added Yet',
  nocBody: 'You can provide the NOC later if needed. It is not required right now to proceed.',

  moreTitle: 'More About Your Case',
  moreTag: 'Civil Case',
  subLabel: 'Matter Sub-Category',
  subs: ['Property Dispute', 'Money Recovery', 'Contract / Agreement', 'Other Civil Matter'],
  locLabel: 'Property or Dispute Location',
  loc: 'Scheme No. 54, Vijay Nagar, Indore',

  otherTitle: 'Other Details',
  otherPlaceholder: 'Add anything else you think we should know.',

  optional: ' (Optional)',
  protTitle: 'Your Information is Protected',
  protBody:
    'Your case details will only be used to review your request and help the designated advocate understand your matter.',
  cta: 'Continue to Documents',
  caption: 'Step 3: Upload Documents • 100% Secure & Confidential',
};

/**
 * design/342 — upload documents.
 *
 * ⚠ CONFLICT 6: the stepper card says "Step 3 of 4" (Documents current); the
 * intake pill on 341 called the screen before this one "STEP 2 OF 4".
 * ⚠ CONFLICT 10 (DPDP): an Aadhaar card is drawn as an uploaded, REQUIRED
 * file ("Valid Gov ID"). Aadhaar is sensitive personal data; nothing on the
 * screen states purpose or consent. Kept as drawn.
 * ⚠ The second file name is clipped by its REQ chip in the export
 * ("Aadhaar_Card_Frc"). The full name below is completed from that fragment
 * and its "JPG" meta — confirm with the designer.
 */
export const DC_DOCUMENTS = {
  title: 'Upload Documents',
  /** Drawn on two lines. */
  sub: 'District Court\nRepresentation',
  matter: 'CIVIL MATTER',
  ssl: 'High-Assurance SSL',
  stepsCaps: 'VERIFICATION STEPS',
  stepsCount: 'Step 3 of 4',
  steps: ['Case Type', 'Details', 'Documents', 'Service'],
  h1: 'Upload Your Documents',
  lead: 'Upload the relevant records and proof you currently have for your civil court filing.',
  infoLead: 'No pressure:',
  info: " Some documents can be furnished later if you don't have them handy today. You can safely proceed with partial paperwork.",
  sec: 'Documents for Your Case',
  ready: '2 of 5 ready',
  req: 'REQ',
  uploaded: 'Uploaded',
  view: 'View',
  replace: 'Replace',
  files: [
    { icon: 'file', name: 'Case_Papers.pdf', meta: '12 pages • PDF • 4.2 MB' },
    { icon: 'id', name: 'Aadhaar_Card_Front.jpg', meta: '2.4 MB • JPG • Valid Gov ID' },
  ] as const,
  optional: 'Optional',
  noHave: "I don't have this",
  upload: 'Upload',
  slots: [
    {
      icon: 'court',
      title: 'Previous Court Order',
      desc: 'Add the latest court order if you have one from an earlier hearing or court.',
      skip: true,
    },
    {
      icon: 'mail',
      title: 'Notice or Petition',
      desc: 'Upload any notice received or legal petition related to this dispute.',
      skip: true,
    },
    {
      icon: 'files',
      title: 'Other Supporting Files',
      desc: 'Add property receipts, letters, site photos, or municipal slips that may assist.',
      skip: false,
    },
  ] as const,
  add: '+ Add Another Document',
  cantTitle: "Can't upload a required document?",
  cantBody:
    'You can still continue to the next step. Your assigned advocate will discuss legal workarounds, affidavit substitutes, or petition dispensations directly during your consultation.',
  safeTitle: 'Your Documents Are Safe',
  safeBody:
    'Files are stored under strict end-to-end statutory encryption and used solely for briefing your verified district court advocate. Never disclosed to third parties or opposing counsel.',
  clarTitle: 'Need document clarity?',
  clarBody: 'Your advocate can request remaining exhibits inside the app later.',
  cta: 'Continue to Submission',
};

/**
 * design/343 — choose service & price.
 *
 * ⚠ CONFLICT 1: ₹25,000 (Ordinary) and ₹35,000 (Urgent) here; design/338
 * prints both prices as "₹XX,XXX".
 * ⚠ CONFLICT 6: "STEP 4 OF 4 · Final step", yet the review that follows (344)
 * is also "STEP 4 OF 4".
 * ⚠ The button says "Proceed to Pay", while its caption says "Next: Review
 * Request" and the summary says "No payment is taken right now". Wired to the
 * review (design/344), as the caption says.
 */
export const DC_PRICING = {
  title: 'Choose Service & Price',
  sub: 'District Court Representation',
  step: 'STEP 4 OF 4',
  final: 'Final step',
  steps: ['Case', 'Details', 'Docs', 'Service'],
  chips: [
    { icon: 'gavel', label: 'Civil Matter' },
    { icon: 'court', label: 'District Court' },
  ] as const,
  h1: 'Choose Your Service',
  lead: 'Choose the service speed that fits your need.',
  info: 'The final price is shown here before you send your request.',
  tiers: [
    {
      id: 'ordinary',
      title: 'Ordinary',
      chip: 'Standard',
      sub: 'Normal service',
      price: '₹25,000',
      feats: ['Standard case support', 'Normal processing', 'Case updates in Legalitt'],
    },
    {
      id: 'urgent',
      title: 'Urgent',
      chip: 'Priority',
      sub: 'Priority service',
      price: '₹35,000',
      feats: ['Priority case handling', 'Faster processing', 'Case updates in Legalitt'],
    },
  ] as const,
  tierFoot: 'Example price • Final price confirmed from service catalog',
  diffTitle: 'What Is the Difference?',
  diff: [
    ['Ordinary', 'Standard service • Normal processing'],
    ['Urgent', 'Priority service • Faster processing'],
  ] as const,
  diffNote: 'Both options provide a verified District Court advocate. No court outcomes or hearing dates are guaranteed.',
  sumTitle: 'Your Request',
  sumChip: 'Summary',
  rows: [
    ['Service', 'District Court Representation'],
    ['Case Type', 'Civil'],
    ['Case', 'Rahul Sharma vs Amit Verma'],
    ['Court', 'District Court, Indore'],
  ] as const,
  selectedLabel: 'Service Selected',
  totalLabel: 'Total Price',
  sumNote: 'No payment is taken right now. Review all details on the next step.',
  beforeTitle: 'Before You Submit',
  beforeBody:
    'You will review your complete case details, documents, and selected service before sending your request to Legalitt.',
  supportTitle: 'Legalitt Service Support',
  supportBody:
    'If your confirmed advocate does not attend a hearing or does not handle the agreed work, Legalitt may review the issue and may return part of the service fee.',
  supportNote: 'Any refund or fee return depends on the case and Legalitt review.',
  cta: 'Proceed to Pay',
  caption: 'Next: Review Request • Takes 1 min',
};

/**
 * design/344 — review request.
 *
 * ⚠ CONFLICT 6: "STEP 4 OF 4 · Final Review" — 343 was already STEP 4 OF 4.
 * ⚠ The screen says "No payment is taken right now … payable only upon
 * advocate confirmation", yet the exports place the service-fee payment
 * (design/298) after Submit Request. Wired Submit → that payment, per the
 * brief; reported, not resolved.
 * ⚠ The document list names five files ("Documents (5)"), three of which 342
 * shows as not yet uploaded; the Aadhaar file is "Aadhaar_Card_Front_Back.jpg"
 * here (DPDP — see DC_DOCUMENTS). CS/2024/8912 and Adv. R.K. Trivedi as on 341.
 */
export const DC_REVIEW = {
  title: 'Review Request',
  sub: 'District Court Representation',
  step: 'STEP 4 OF 4',
  final: 'Final Review',
  steps: ['Type', 'Details', 'Docs', 'Service'],
  h1: 'Check Your Request',
  lead: 'Please check your details before sending your request.',
  hint: 'You can edit any section if something is wrong.',
  edit: 'Edit',

  typeHead: 'Case Type',
  typeTitle: 'District Court Representation',
  typeChip: 'Civil Matter',
  typeNote: 'Non-criminal proceedings',

  detailsHead: 'Case Details',
  fields: [
    ['Case Title', 'Rahul Sharma vs Amit Verma', 'strong'],
    ['Other Party / Defendant', 'Amit Verma & Associates', 'plain'],
    ['Court Location', 'Indore, Madhya Pradesh (District Court, Indore)', 'pin'],
  ] as const,
  storyLabel: 'What Happened (Summary)',
  story:
    'There is a boundary wall and ancestral land ownership dispute regarding Plot No. 14. The adjacent neighbor has started unauthorized construction despite written notices.',
  dateTitle: 'Important Impending Date',
  date: '18 Nov 2026 (Municipal reply deadline)',

  existingHead: 'Existing Case',
  ongoingLabel: 'Ongoing Matter',
  ongoing: 'Yes, ongoing',
  numberLabel: 'Court Case Number',
  number: 'CS/2024/8912',
  prevLabel: 'Previous Advocate',
  prev: 'Adv. R.K. Trivedi',
  nocLabel: 'NOC Status',
  noc: 'Not Added Yet',
  reasonLabel: 'Reason for Advocate Change',
  reason: 'Relocation to district headquarter',
  nocNote: 'NOC can be uploaded later if formally requested by registry.',

  docsHead: 'Documents (5)',
  docs: [
    { name: 'Case_Papers.pdf', meta: '12 pages • 4.2 MB', id: false },
    { name: 'Aadhaar_Card_Front_Back.jpg', meta: '2.4 MB • Valid Gov ID', id: true },
    { name: 'Previous_Court_Order.pdf', meta: '2 pages • 1.1 MB', id: false },
    { name: 'Notice_or_Petition.pdf', meta: '4 pages • 1.8 MB', id: false },
    { name: 'Boundary_Site_Photos.pdf', meta: '3 pages • 3.2 MB', id: false },
  ] as const,
  docsFoot: 'Optional items: None missing',
  viewAll: 'View All Documents',

  svcHead: 'Service',
  svcTitle: 'Ordinary (Standard Service)',
  svcDesc: 'Normal processing • Standard case support • Case updates in Legalitt',
  svcPrice: '₹25,000',
  svcRate: 'Standard rate',

  sumTitle: 'Request Summary',
  sumRows: [
    ['Service', 'District Court Representation'],
    ['Case Type', 'Civil'],
    ['Client Name', 'Rahul Sharma'],
    ['Target Court', 'District Court, Indore'],
    ['Speed', 'Ordinary'],
  ] as const,
  totalLabel: 'Total Estimated',
  totalSub: 'Inclusive of advocate retainer fees',
  totalPrice: '₹25,000',
  sumInfo: 'No payment is taken right now. Fees are confirmed and payable only upon advocate confirmation.',

  beforeTitle: 'Before You Submit',
  beforeBody:
    'Your request will be sent to Legalitt for review. After review, Legalitt will assign a suitable advocate if the request is accepted.',
  beforeNote: 'Sending a request does not mean that an advocate has been assigned yet. Case results and timelines can vary.',

  confirm: 'I confirm that the information above is correct.',
  agree: 'I agree to submit this request to Legalitt.',
  legal: ['By submitting this request, you agree to the Legalitt ', 'Terms of Service', ' and ', 'Privacy Policy', '.'] as const,
  cta: 'Submit Request',
  caption: 'Request will be submitted for Legalitt team review • No payment now',
};

/**
 * design/345 — decide on the advocate.
 *
 * ⚠ CONFLICT 6: "Step 4 of 9" — the assignment screen before it (300) says
 * "Step 4 of 10" with a ten-step list; this one has nine.
 * ⚠ CONFLICT 4: the advocate is Adv Abhishek Verma here; the next screen (346)
 * names Gurpreet Chawla.
 * ⚠ The export runs past the screen into a black band carrying an "Action
 * completed successfully" toast. It belongs to no control on the screen and is
 * not built.
 */
export const DC_DECIDE = {
  title: 'Your Advocate',
  sub: 'District Court Representation',
  readyMark: '?',
  readyTitle: 'Ready to Decide?',
  readyBody:
    'You have reviewed the advocate and talked to them. Now choose what you want to do next with your case.',
  verified: 'Verified Advocate',
  name: 'Adv Abhishek Verma',
  initials: 'AV',
  bio: 'Experienced in civil, property, and family matters.',
  chips: [
    { icon: 'award', label: '8+ Years Experience' },
    { icon: 'gavel', label: 'District Court Matters' },
    { icon: 'pin', label: 'Indore, Madhya Pradesh' },
  ] as const,
  profile: 'View Full Profile',
  convTitle: 'Your Conversation',
  convBody: 'You can talk to your advocate again before making your final decision.',
  avail: ['Chat available', 'Call available'] as const,
  chat: 'View Chat',
  call: 'Call Again',
  caseTitle: 'Your Case',
  tier: 'Standard Service',
  rows: [
    ['Case Type', 'Civil Dispute'],
    ['Case', 'Rahul Sharma vs Amit Verma'],
    ['Court', 'District Court, Indore'],
  ] as const,
  idLabel: 'Request ID',
  id: 'DC-2026-1048',
  ask: 'What Do You Want To Do?',
  askSub: 'Choose one option below to move forward.',
  accept: 'Accept Advocate',
  acceptCap: 'Continue with this advocate for your case.',
  change: 'Request New Advocate',
  changeCap: 'Ask Legalitt to assign another advocate.',
  cancel: 'Cancel Request',
  cancelCap: 'Cancel your District Court representation request.',
  beforeTitle: 'Before You Choose',
  beforeBody:
    'Please make sure you are comfortable continuing with this advocate. You can chat or call the advocate again at any time before deciding.',
  statusTitle: 'Request Status',
  step: 'Step 4 of 9',
  timeline: [
    { title: 'Request Submitted', status: 'Completed', state: 'done' },
    { title: 'Under Review', status: 'Completed', state: 'done' },
    { title: 'Advocate Assigned', status: 'Completed', state: 'done' },
    { title: 'User Review', status: 'Your turn to decide', state: 'current' },
    { title: 'Documents', status: 'Waiting', state: 'wait' },
    { title: 'Case Preparation', status: 'Waiting', state: 'wait' },
    { title: 'Court Filing', status: 'Waiting', state: 'wait' },
    { title: 'First Hearing', status: 'Waiting', state: 'wait' },
    { title: 'Case Completed', status: 'Waiting', state: 'wait' },
  ] as const,
};

/**
 * design/346 — advocate accepted.
 *
 * ⚠ CONFLICT 4: the advocate accepted here is Adv Abhishek Verma, but the
 * caption names "Advocate Gurpreet Chawla" as the one sharing the checklist.
 * ⚠ The notification strip is clipped mid-sentence in the export ("…Case
 * moving to"). Built with the drawn words only; the rest is not drawn.
 * ⚠ The progress list has eleven steps (345 had nine; 350 says "Step 5 of 11").
 */
export const DC_ACCEPTED = {
  title: 'Advocate Accepted',
  sub: 'District Court Representation',
  notif: 'Notification sent: Advocate accepted. Case moving to',
  okTitle: 'Advocate Accepted',
  okBody: 'You have accepted this advocate for your case.',
  okSub: 'Your case can now move to the next step.',
  yourAdv: 'YOUR ADVOCATE',
  verified: 'Verified Advocate',
  name: 'Adv Abhishek Verma',
  initials: 'AV',
  chips: ['8+ Years Exp', 'District Court'] as const,
  loc: 'Indore, Madhya Pradesh',
  profile: 'View Profile',
  caseTitle: 'Your Case',
  id: 'DC-2026-1048',
  grid: [
    [
      ['Case Type', 'Civil'],
      ['Court', 'District Court'],
    ],
    [['Case Matter', 'Rahul Sharma vs Amit Verma']],
    [['Service Tier', 'Ordinary']],
  ] as const,
  statusCaps: 'CASE STATUS',
  statusPill: 'Client Accepted',
  statusBody: 'You have accepted the assigned advocate.',
  statusSub: 'The case can now move to the document step.',
  nextCaps: 'NEXT STEP',
  nextTitle: 'Recommended Documents',
  nextBody: 'Your advocate will send the list of documents needed for your case.',
  nextSub: 'You will get a notification when the list is ready.',
  docLabel: 'Documents',
  docChip: 'Waiting for Advocate',
  talkTitle: 'Talk to Your Advocate',
  talkBody: 'You can still message or call your advocate if you have questions.',
  chat: 'Chat',
  call: 'Call',
  progressTitle: 'Case Progress',
  timeline: [
    { title: 'Request Submitted', status: 'Completed', state: 'done' },
    { title: 'Under Review', status: 'Completed', state: 'done' },
    { title: 'Advocate Assigned', status: 'Completed', state: 'done' },
    { title: 'User Accepted', status: 'Completed', state: 'done' },
    { title: 'Documents', status: 'Next Step', state: 'current' },
    { title: 'Case Preparation', status: 'Waiting', state: 'wait' },
    { title: 'Court Filing', status: 'Waiting', state: 'wait' },
    { title: 'First Hearing', status: 'Waiting', state: 'wait' },
    { title: 'Hearing Update', status: 'Waiting', state: 'wait' },
    { title: 'Next Hearing', status: 'Waiting', state: 'wait' },
    { title: 'Case Completed', status: 'Waiting', state: 'wait' },
  ] as const,
  whatTitle: 'What Happens Next?',
  whatBody: [
    'Your advocate will review your case and send the documents needed for the next step.',
    'You can review the list and then send the documents.',
  ] as const,
  wait: '[ Waiting for Advocate ]',
  caption: 'You will be notified once Advocate Gurpreet Chawla shares the document checklist.',
};

/**
 * design/347 — request a new advocate.
 *
 * ⚠ The header still reads "Advocate Accepted" (346's title) on this
 * change-request screen. Built as drawn.
 * ⚠ The case title shortens to "Sharma vs Verma" here.
 */
export const DC_CHANGE_REQUEST = {
  title: 'Advocate Accepted',
  sub: 'District Court Representation',
  topTitle: 'Want a Different Advocate?',
  topBody: 'You can ask Legalitt to assign another advocate.',
  topSub: 'Your request will be reviewed by the Legalitt team.',
  assigned: 'CURRENTLY ASSIGNED',
  verified: 'Verified Advocate',
  name: 'Adv Abhishek Verma',
  initials: 'AV',
  loc: 'Indore, Madhya Pradesh',
  chips: ['8+ Years Experience', 'District Court Matters'] as const,
  caseTitle: 'Your Case',
  id: 'DC-2026-1048',
  grid: [
    [
      ['Case Title', 'Sharma vs Verma'],
      ['Case Type', 'Civil'],
    ],
    [
      ['Court', 'District Court'],
      ['Service', 'Ordinary'],
    ],
  ] as const,
  whyTitle: 'Why Do You Want a New Advocate?',
  whySub: 'Choose the reason that best matches your request.',
  reasons: [
    'I want a different advocate',
    'I need a different practice area',
    'I prefer another location',
    'I was not comfortable after talking to the advocate',
    'I have another reason',
  ] as const,
  moreTitle: 'Tell Us More',
  optional: '(Optional)',
  moreSub: 'Share any context that helps us match the right counsel.',
  morePlaceholder: 'Tell us briefly why you want a new advocate.',
  warn: 'Please do not share passwords, OTPs or private account details.',
  nextTitle: 'What Happens Next?',
  nextBody: 'Your request will go to the Legalitt team. The team will review it and decide the next step.',
  nextNote: 'A new advocate is not assigned automatically.',
  agree: 'I want Legalitt to review my request for a new advocate.',
  agreeSub: 'Your current representation remains active until approved.',
  cta: 'Send Request',
  back: 'Go Back',
};

/**
 * design/348 — new advocate request sent.
 *
 * ⚠ THUMBNAIL (169px wide) — NEEDS A CLEAN RE-EXPORT, as design/289. The
 * headings and the request rows are legible; the strings marked (?) below are
 * best readings of illegible text and must be confirmed against a clean export.
 * ⚠ CONFLICT 6: the timeline here has twelve steps (Admin Review current).
 * ⚠ Both actions read "Back to Home" — a filled button and a text link.
 */
export const DC_CHANGE_SENT = {
  title: 'New Advocate Request',
  sub: 'District Court Representation',
  heroTitle: 'Request Sent',
  heroBody: 'Your request for a new advocate has been sent to Legalitt.', // (?)
  heroSub: 'The Legalitt team will review your request.', // (?)
  statusCaps: 'CURRENT STATUS',
  statusPill: 'New Advocate Requested', // (?)
  statusTitle: 'Your request is now waiting for Legalitt review.',
  statusBody: 'Our team will reevaluate your case requirements and assign a suitable advocate.', // (?)
  reqTitle: 'Your Request',
  reqChip: 'Active Request',
  rows: [
    ['Service', 'District Court Representation'],
    ['Case Type', 'Civil'],
    ['Case Matter', 'Rahul Sharma vs Amit Verma'],
    ['Court', 'District Court'],
  ] as const,
  idLabel: 'Request ID',
  id: 'DC-2026-1048',
  subTitle: 'Submission Details',
  reasonCaps: 'REASON SELECTED',
  reason: 'I want a different advocate',
  noteCaps: 'YOUR NOTE',
  note: '“Looking for an advocate with specific focus on local civil property documentation.”', // (?)
  submitted: 'Submitted just now', // (?)
  viewAll: 'View Full Submission', // (?)
  nextTitle: 'What Happens Next?',
  steps: [
    {
      title: 'Legalitt Reviews Your Request',
      desc: 'Our legal operations team checks your matter details.', // (?)
      pill: 'In Progress',
      state: 'current',
    },
    {
      title: 'A New Advocate Is Assigned',
      desc: 'We will match an experienced advocate from the District Court panel.', // (?)
      pill: 'Waiting',
      state: 'wait',
    },
    {
      title: 'You Review the New Advocate',
      desc: 'You can view their profile, chat, or call before deciding to accept.', // (?)
      state: 'wait',
    },
  ] as const,
  tlTitle: 'Request Timeline',
  tlLink: 'View details', // (?)
  timeline: [
    { title: 'Request Submitted', status: 'Initial case details submitted', state: 'done' }, // (?) status
    { title: 'Under Review', status: 'Case details verified', state: 'done' }, // (?) status
    { title: 'Advocate Assigned', status: 'Previous advocate linked', state: 'past' }, // (?) status
    { title: 'New Advocate Requested', status: 'Client change request received', state: 'done' }, // (?) status
    { title: 'Admin Review', status: 'Legalitt team is reviewing your request', state: 'current', pill: 'Current' }, // (?) status
    { title: 'New Advocate Assigned', state: 'wait' },
    { title: 'Client Review', state: 'wait' },
    { title: 'Documents', state: 'wait' },
    { title: 'Case Preparation', state: 'wait' },
    { title: 'Court Filing', state: 'wait' },
    { title: 'First Hearing', state: 'wait' },
    { title: 'Case Completed', state: 'wait' },
  ] as const,
  updTitle: 'We Will Update You',
  updBody: 'You will get an app notification and SMS when Legalitt updates your request.',
  updNote: 'No new advocate has been assigned yet. Your current advocate stays on the case until the team reviews.', // (?)
  helpTitle: 'Need Help?',
  helpSub: 'Have a question about your request?', // (?)
  contact: 'Contact Support',
  cta: 'Back to Home',
  back: 'Back to Home',
};

/**
 * design/349 — cancel request.
 *
 * ⚠ No "request cancelled" screen is drawn. Cancel Request (drawn disabled
 * until the box is ticked) returns to client Home. Flagged.
 */
export const DC_CANCEL = {
  title: 'Cancel Request',
  sub: 'District Court Representation',
  topTitle: 'Cancel This Request?',
  topBody: 'Are you sure you want to cancel your District Court request?',
  topSub: 'Your current request and advocate process will stop if you cancel.',
  reqTitle: 'Your Request',
  id: 'DC-2026-1048',
  cells: [
    [
      ['Case Type', 'Civil'],
      ['Court', 'District Court'],
    ],
    [['Case', 'Rahul Sharma vs Amit Verma']],
    [
      ['Service', 'Ordinary'],
      ['Current Status', 'Client Review'],
    ],
  ] as const,
  advTitle: 'Current Advocate',
  advChip: 'Awaiting Your Decision',
  name: 'Adv Abhishek Verma',
  initials: 'AV',
  verified: 'Verified Advocate',
  release: 'Will be released from this request upon cancellation.',
  whyTitle: 'Why Are You Cancelling?',
  whySub: 'You can choose a reason. This helps Legalitt improve the service. (Optional)',
  reasons: [
    'No longer need this service',
    'Want to handle the case another way',
    'Cost is not suitable',
    'Found another option',
    'Other',
  ] as const,
  moreTitle: 'Tell Us More (Optional)',
  morePlaceholder: 'Tell us why you want to cancel.',
  lock: 'Please do not share sensitive personal information, passwords, or OTPs.',
  beforeTitle: 'Before You Cancel',
  bullets: [
    'After cancellation, this request will stop and the assigned advocate will no longer be part of this request.',
    'You may need to create a new request later if you need this service again.',
    'No penalty or fees apply for cancelling at the review stage.',
  ] as const,
  agree: 'I understand that this will cancel my request.',
  agreeNote: 'This action cannot be undone once confirmed.',
  cancel: 'Cancel Request',
  keep: 'Keep My Request',
};

/**
 * design/350 — recommended documents.
 *
 * ⚠ CONFLICT 4: Advocate Gurpreet Chawla requests these documents, though the
 * advocate accepted on 345–346 is Adv Abhishek Verma; Abhishek Verma then
 * receives them (351–355).
 * ⚠ CONFLICT 6: "Step 5 of 11".
 * ⚠ The export clips the header sub-line ("…Representati · DC-2026-1048"),
 * the advocate name ("Adv. Gurpreet Chaw") and two file names
 * ("Original_Case_Par", "Interim_Order_20"). Never-ellipsize wraps them; the
 * first is completed from its fragment. The court order's name is UNREADABLE
 * in the export past "Interim_Order_20" — it is a neutral placeholder below,
 * awaiting a clean re-export.
 * ⚠ DPDP: Identity Proof asks for an Aadhaar (or Voter ID / Passport), as 342.
 */
export const DC_DOCS_NEEDED = {
  title: 'Recommended Documents',
  sub: 'District Court Representation',
  subId: ' · DC-2026-1048',
  pill: 'District Court Representation • Case ID: DC-2026-1048',
  h1: 'Recommended Documents',
  lead: 'Advocate Gurpreet Chawla has reviewed your case and requested the documents below.',
  caseTitle: 'Your Case',
  caseChip: 'Active Case',
  grid: [
    [
      ['Client', 'Rahul Sharma'],
      ['Case Type', 'Civil Dispute'],
    ],
    [['Matter Title', 'Rahul Sharma vs Amit Verma']],
    [
      ['Court', 'District Court'],
      ['Assigned Advocate', 'Adv. Gurpreet Chawla'],
    ],
  ] as const,
  msgTitle: 'Message From Your Advocate',
  quote:
    '“Please keep the original case papers and clear copies ready. I may ask for more documents if needed.”',
  sig: '— Advocate Gurpreet Chawla',
  senior: 'Senior Counsel',
  progTitle: 'Document Checklist Progress',
  progSub: '3 of 5 total documents attached',
  pct: '60%',
  /** The drawn bar is 60% filled. */
  pctValue: 0.6,
  legend: [
    ['Required:', ' 2 of 4 added', 'req'],
    ['Optional:', ' 1 of 1 added', 'opt'],
  ] as const,
  info: 'You can upload digital copies now or prepare physical copies for delivery.',
  sec: 'Documents Recommended',
  secChip: '5 items',
  secSub: 'These documents were specifically requested by your advocate for this matter.',
  uploaded: 'Uploaded',
  missing: 'Not Added',
  view: 'View',
  replace: 'Replace',
  still: 'This document is still needed.',
  upload: 'Upload Document',
  docs: [
    {
      tag: 'REQUIRED',
      title: 'Original Case Papers',
      desc: 'Please provide the original case papers.',
      file: { name: 'Original_Case_Papers.pdf', meta: '14 pages • 4.2 MB • PDF', icon: 'file' },
    },
    {
      tag: 'REQUIRED',
      title: 'Latest Court Order',
      desc: 'Please provide the latest court order.',
      // ⚠ PLACEHOLDER — unreadable in the export (clipped after "Interim_Order_20");
      // awaiting a clean re-export.
      file: { name: 'Interim_Order_XXXX.pdf', meta: '3 pages • 1.1 MB • PDF', icon: 'pdf' },
    },
    {
      tag: 'REQUIRED',
      title: 'Identity Proof',
      desc: 'Please provide a valid identity document (Aadhaar, Voter ID, or Passport).',
      icon: 'id',
    },
    {
      tag: 'REQUIRED',
      title: 'Property Papers',
      desc: 'Please provide the property papers related to the case.',
      icon: 'house',
    },
    {
      tag: 'OPTIONAL',
      title: 'Previous Advocate Papers',
      desc: 'Add these papers if you have them.',
      file: { name: 'Prior_Vakalatnama.pdf', meta: '2 pages • 820 KB • PDF', icon: 'clip' },
    },
  ] as const,
  physTitle: 'Physical Documents',
  physBody:
    'Your advocate may need the original physical documents. After preparing the documents, you can choose how to send them.',
  physNote: 'Digital upload helps your advocate review immediately, but physical originals may still be required in court.',
  journeyTitle: 'Case Journey Overview',
  step: 'Step 5 of 11',
  timeline: [
    { title: 'Request Submitted', status: 'Completed', state: 'done' },
    { title: 'Under Review', status: 'Completed', state: 'done' },
    { title: 'Advocate Assigned', status: 'Completed', state: 'done' },
    { title: 'Client Accepted', status: 'Completed', state: 'done' },
    { title: 'Documents', status: 'Current Step - In Progress', state: 'current' },
    { title: 'Case Preparation', status: 'Waiting for documents', state: 'wait' },
    { title: 'Court Filing', status: 'Waiting', state: 'wait' },
    { title: 'First Hearing', status: 'Waiting', state: 'wait' },
    { title: 'Hearing Update', status: 'Waiting', state: 'wait' },
    { title: 'Next Hearing', status: 'Waiting', state: 'wait' },
    { title: 'Case Completed', status: 'Final Stage', state: 'wait' },
  ] as const,
  cta: 'Continue to Delivery',
  caption: 'Next: Choose how to send your physical documents (Send by Yourself or Legalitt Delivery)',
};

/**
 * design/351 — courier delivery details (District Court).
 *
 * ⚠ CONFLICT 1: the delivery fee is "₹XXX" here; 352 charges ₹249.
 * ⚠ CONFLICT 6: "STEP 2 OF 3" (352 is STEP 3 OF 3; no step 1 is drawn).
 * ⚠ CONFLICT 4: the receiver is Adv. Abhishek Verma, though 350's documents
 * were requested by Gurpreet Chawla. His office is on "High Court Road".
 * ⚠ The export clips the header title ("Delivery Detail") and the documents
 * count ("5 Documents" under the Ready pill). Built in full and wrapped.
 */
export const DC_COURIER_DETAILS = {
  kicker: 'LEGALITT DELIVERY',
  title: 'Delivery Details',
  step: 'STEP 2 OF 3',
  h1: 'Confirm Delivery Details',
  lead: 'Check the pickup and receiver details before booking.',
  docsLabel: 'Documents:',
  docsValue: ' 5 Documents',
  ready: 'Ready',
  view: 'View',
  pickTitle: 'Pickup Details',
  pickSub: 'Where the courier will collect your documents.',
  useMine: 'Use My\nAddress',
  fields: [
    [['Full Name', 'Rahul Sharma']],
    [['Mobile Number', '+91 98765 43210']],
    [['Pickup Address', 'Flat 204, Vijay Nagar']],
    [
      ['Area / Locality', 'Vijay Nagar'],
      ['City', 'Indore'],
    ],
    [
      ['State', 'Madhya Pradesh'],
      ['PIN Code', '452010'],
    ],
  ] as const,
  recvTitle: 'Receiver Details',
  recvSub: 'These details are taken from your advocate profile.',
  recvName: 'Adv. Abhishek Verma',
  recvAddr: 'District Court Office, High Court Road\nIndore, Madhya Pradesh - PIN 452001',
  mobLabel: 'Mobile: ',
  mob: '+91 98XXXXXX10',
  editRecv: 'Edit Receiver',
  copyAll: 'Copy All Details',
  dateTitle: 'Pickup Date & Time',
  dateSub: 'Choose when the courier can collect the documents.',
  dateLabel: 'Pickup Date',
  date: '24 Oct 2026',
  timeLabel: 'Pickup Time',
  time: '10:00 AM – 12:00 PM',
  instrTitle: 'Delivery Instructions',
  optional: 'Optional',
  instrPlaceholder: 'Add any special instruction for pickup or delivery (e.g., Please call before pickup).',
  feeTitle: 'Estimated Delivery Fee',
  feeChip: 'Calculated at Booking',
  fee: '₹XXX',
  feeSub: 'Final fee will be shown before booking.',
  agree: 'I confirm that the pickup and receiver details are correct.',
  agreeSub: 'Please check the address and phone number carefully.',
  cta: 'Continue to Book Delivery',
  caption: 'Next step: Book Delivery',
};

/**
 * design/352 — book the courier delivery.
 *
 * ⚠ CONFLICT 1: ₹249 here; 351 showed "₹XXX". The courier payment that
 * follows (design/307, ?flow=dcr) reads Total Payable ₹249 but Amount to pay
 * ₹290 — see CO_PAYMENT_HCR.
 * ⚠ CONFLICT 6: "STEP 3 OF 3 · FINAL STEP".
 */
export const DC_COURIER_BOOK = {
  kicker: 'LEGALITT DELIVERY',
  title: 'Book Delivery',
  step: 'STEP 3 OF 3 • FINAL STEP',
  lead: 'Review your delivery details and book your document pickup.',
  readyTitle: 'Ready to Book',
  readySub: 'Your delivery details are ready for booking.',
  sumTitle: 'Delivery Summary',
  edit: 'Edit',
  sections: [
    {
      icon: 'from',
      caps: 'FROM (PICKUP ADDRESS)',
      name: 'Rahul Sharma',
      body: 'Flat 204, Vijay Nagar, Indore, Madhya Pradesh · 452010',
      phone: '+91 98765 43210',
    },
    {
      icon: 'to',
      caps: 'TO (ADVOCATE CHAMBER)',
      name: 'Adv. Abhishek Verma',
      body: 'District Court Office, High Court Road, Indore · 452001',
      phone: '+91 98XXXXXX10',
    },
    {
      icon: 'docs',
      caps: 'DOCUMENTS',
      chip: 'Sealed Pouch',
      name: '5 Legal Documents Ready',
      body: 'Case Papers, Court Order, ID Proof, Property Papers, Other',
    },
    {
      icon: 'date',
      caps: 'PICKUP DATE & TIME',
      name: '24 Oct 2026 · 10:00 AM – 12:00 PM',
      phone: 'Courier partner will call before arrival',
    },
  ] as const,
  feeTitle: 'Delivery Fee',
  feeChip: 'Standard Delivery',
  fee: '₹249',
  feeLabel: 'Final delivery fee',
  feeBody: 'Includes doorstep collection, tamper-proof sealed envelope, and direct advocate chamber handoff.',
  note: 'Please make sure the pickup and receiver details are correct before booking.',
  agree: 'I confirm these delivery details are correct.',
  agreeSub: 'You can track the shipment in the app once booked.',
  cta: 'Book Delivery',
  caption: 'Next: Shipment Created with tracking waybill',
};

/**
 * design/353 — courier shipment created.
 *
 * ⚠ CONFLICT 7: new identifiers LD-2026-001248 (delivery) and BD123456789
 * (Blue Dart waybill), used nowhere else.
 * ⚠ CONFLICT 4: received by Adv. Abhishek Verma.
 */
export const DC_SHIPMENT = {
  kicker: 'LEGALITT DELIVERY',
  title: 'Shipment Created',
  heroTitle: 'Delivery Booked',
  heroBody: 'Your document delivery has been booked successfully.',
  heroPill: 'Pickup Scheduled • Ready for Courier',
  cardTitle: 'Shipment Details',
  handoff: 'Official Courier Handoff',
  idLabel: 'Delivery ID',
  id: 'LD-2026-001248',
  partnerLabel: 'Courier Partner',
  partner: 'Blue Dart',
  awbLabel: 'Waybill / AWB',
  awb: 'BD123456789',
  statusLabel: 'Shipment Status',
  status: 'Pickup Scheduled',
  pkgLabel: 'Package\nContents',
  pkgLead: '5 Legal Documents',
  pkgRest: ' (Sealed Pouch)',
  pickCaps: 'PICKUP SCHEDULED',
  pickValue: '24 October 2026 • 10:00 AM – 12:00 PM',
  pickLine: 'Indore (Doorstep Collection)',
  pickPhone: 'Courier partner will call before arrival.',
  recvCaps: 'RECEIVER',
  recvName: 'Adv. Abhishek Verma',
  recvLine: 'District Court Office, Indore',
  notifTitle: 'Notification Sent',
  notifBody: 'Your document delivery has been booked. Pickup is scheduled for 24 October 2026.',
  note: 'Please keep the sealed documents ready for pickup. Your advocate will confirm once documents are delivered.',
  cta: 'Track Delivery',
  done: 'Done',
};

/**
 * design/354 — courier delivery tracking.
 *
 * ⚠ The brief says this screen's QR is labelled "Legal Notice". No QR is
 * drawn here — the Legal-Notice-labelled QR is the shared courier Scan & Pay
 * (design/308) that precedes 353. Reported, not changed.
 * ⚠ The button reads "View Shipment Details"; the next screen the batch draws
 * is "Documents Received" (design/355), which it opens. Flagged.
 */
export const DC_TRACKING = {
  kicker: 'LEGALITT DELIVERY',
  title: 'Delivery Tracking',
  pill: 'In Transit',
  heroTitle: 'Your documents are on the way.',
  heroSub: 'The latest delivery status is shown below.',
  estCaps: 'ESTIMATED DELIVERY',
  est: '26 Oct 2026',
  tiles: [
    ['From', 'Indore'],
    ['To', 'District Court'],
    ['Docs', '5 Items'],
  ] as const,
  infoCaps: 'SHIPMENT INFORMATION',
  secured: 'Secured',
  courierLabel: 'Courier',
  courier: 'Blue Dart',
  awbLabel: 'Waybill',
  awb: 'BD123456789',
  idLabel: 'Delivery ID',
  id: 'LD-2026-001248',
  trTitle: 'Tracking',
  live: 'Live updates',
  current: 'Current',
  timeline: [
    { title: 'Shipment Created', status: '24 Oct 2026, 09:30 AM', state: 'done' },
    { title: 'Pickup Scheduled', status: '10:00 AM – 12:00 PM', state: 'done' },
    { title: 'Picked Up', status: '24 Oct 2026, 11:15 AM • Indore Hub', state: 'done' },
    { title: 'In Transit', status: 'On vehicle to sorting hub', state: 'current' },
    { title: 'Out for Delivery', status: 'Waiting', state: 'wait' },
    { title: 'Delivered', status: 'Waiting', state: 'wait' },
  ] as const,
  info: 'Once the courier marks the package delivered, your advocate will verify and confirm physical receipt in their chamber.',
  help: 'Need Help? Contact Support',
  cta: 'View Shipment Details',
};

/**
 * design/355 — courier documents received.
 *
 * ⚠ CONFLICT 6: "Stage 2 of 6" — a six-stage list, against 350's eleven
 * steps.
 * ⚠ CONFLICT 4: received by Adv. Abhishek Verma.
 * ⚠ The list names "Other Document" as the fifth item; 350 and 352 call it
 * "Previous Advocate Papers" / "Other".
 */
export const DC_RECEIVED = {
  kicker: 'DISTRICT COURT REPRESENTATION',
  title: 'Documents Received',
  heroTitle: 'Documents Delivered',
  heroBody: 'Your advocate has received the physical documents.',
  heroSub: 'The document step is now complete.',
  pill: 'Advocate Verified • Chain of Custody Confirmed',
  receiptTitle: 'Receipt Details',
  verified: 'Verified',
  byLabel: 'Received By',
  by: 'Adv. Abhishek Verma',
  docsLabel: 'Documents',
  docsLead: '5 Documents',
  docsRest: ' (Verified physical count)',
  onLabel: 'Received On',
  on: '26 October 2026',
  statusLabel: 'Status',
  status: 'Received • In Chamber',
  listTitle: 'Documents Received',
  viewAll: 'View Documents',
  docs: ['Case Papers', 'Latest Court Order', 'Identity Proof', 'Property Papers', 'Other Document'] as const,
  nextCaps: 'NEXT STEP',
  nextTitle: 'Case Preparation',
  nextBody: 'Your advocate will now prepare the case for the next stage.',
  nextNote: 'You will receive an update once the court filing draft is ready for review.',
  progTitle: 'Case Progress',
  stage: 'Stage 2 of 6',
  inProgress: 'In Progress',
  timeline: [
    { title: 'Documents Received', status: 'Completed on 26 Oct', state: 'done' },
    { title: 'Case Preparation', state: 'current' },
    { title: 'Court Filing', state: 'wait' },
    { title: 'First Hearing', state: 'wait' },
    { title: 'Hearing Update', state: 'wait' },
    { title: 'Next Hearing', state: 'wait' },
  ] as const,
  notifLead: 'Notification Sent:',
  notif: ' Your advocate has confirmed that the physical documents were received.',
  cta: 'View Case',
  caption: 'Next stage: Advocate starts case preparation',
};
