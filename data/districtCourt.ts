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
 * ⚠ CONFLICT 2: the ₹1,500 change fee's Continue opens the shared payment,
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
  fee: '₹1,500',
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
