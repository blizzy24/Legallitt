// Advocate-side data (designs 148-159).
//
// One consistent set for every advocate screen, the way data/cases.ts works for the
// client side. Screens read from here rather than carrying their own copies.
//
// ─────────────────────────────────────────────────────────────────────────────
// EARNINGS CONFLICT — FLAGGED, NOT RESOLVED.
//
//   design/148 (dashboard)        "TOTAL EARNINGS  ₹8,500   Settled"
//   design/156 (client payment)   "Total Received  ₹65,000"
//   design/157 (payment details)  one matter nets the advocate ₹32,900
//
// These cannot all be the same quantity. ₹8,500 cannot be a lifetime total if a
// single matter nets ₹32,900, and ₹65,000 sits between them. The likeliest reading
// is that ₹8,500 is TODAY's settled amount (it sits in a grid of today's figures)
// and ₹65,000 is the total received from one client — but the dashboard labels it
// "TOTAL EARNINGS" with no period, which is what makes it ambiguous. Both are drawn
// as-is on their own screens and nothing is derived from either.
// ─────────────────────────────────────────────────────────────────────────────
//
// ─────────────────────────────────────────────────────────────────────────────
// COMMISSION STRUCTURE — THE FIRST STATEMENT OF IT ANYWHERE IN THE PROJECT.
//
// design/157 breaks a matter down as:
//     Client Gross Fee                    ₹35,000
//     Platform Facilitation Fee    5%     −₹1,750
//     Escrow Tech & Regulatory     1%       −₹350
//     Advocate Net Earnings               ₹32,900
//
// Recorded below as named constants so it can drive real calculations once
// confirmed. NOTHING COMPUTES FROM IT YET — the figures on every screen are drawn as
// the designs show them. Note this is the platform's take from the ADVOCATE's fee,
// which is a different thing from the ₹199 platform fee the client pays on top of a
// service price; no design connects the two.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_COMMISSION = {
  /** Fraction of the gross fee taken as the platform's facilitation fee. */
  platformFacilitationRate: 0.05,
  /** Fraction taken for escrow, technology and regulatory cost. */
  escrowRegulatoryRate: 0.01,
  /** design/157's worked example, kept so the rates can be checked against it. */
  example: {
    grossFee: 35000,
    platformFacilitationFee: 1750,
    escrowRegulatoryFee: 350,
    netEarnings: 32900,
  },
};

/** The advocate whose app this is. */
export const ADVOCATE_SELF = {
  firstName: 'Abhishek',
  name: 'Adv. Abhishek Chouhan',
  initials: 'AB',
  /** design/148's header pill. */
  standing: 'VERIFIED ADVOCATE • HIGH COURT',
  barCouncil: 'MP/1234/2018',
  chambers: 'Chambers of Abhishek Chouhan, Indore',
  practice: 'Property, Civil & Commercial',
  /** Consistent with the rest of the app's September 2026 dates. */
  today: '10 Sep 2026',
};

export type AvailabilityMode = 'chat' | 'voice' | 'video';

/** design/148 draws Voice and Video selected and Chat not. */
export const ADV_AVAILABILITY_DEFAULT = {
  online: true,
  modes: ['voice', 'video'] as AvailabilityMode[],
};

export type AdvStat = {
  id: string;
  label: string;
  value: string;
  /** The coloured line under the value. */
  status: string;
  tone: 'brand' | 'green' | 'red';
};

/** design/148's 2x2 grid. See the earnings note above for ₹8,500. */
export const ADV_DASHBOARD_STATS: AdvStat[] = [
  { id: 'hearings', label: "TODAY'S HEARINGS", value: '2', status: 'Indore Bench', tone: 'brand' },
  { id: 'consultations', label: 'CONSULTATIONS', value: '4', status: '1 Ongoing', tone: 'green' },
  { id: 'requests', label: 'NEW REQUESTS', value: '3', status: 'Needs Review', tone: 'red' },
  { id: 'earnings', label: 'TOTAL EARNINGS', value: '₹8,500', status: 'Settled', tone: 'green' },
];

export type AdvEvent =
  | {
      kind: 'hearing';
      id: string;
      time: string;
      type: string;
      state: string;
      title: string;
      location: string;
    }
  | {
      kind: 'consultation';
      id: string;
      time: string;
      meridiem: string;
      mode: 'voice' | 'video';
      modeLabel: string;
      duration: string;
      state: string;
      client: string;
      subject: string;
    };

/** design/148's "TODAY'S SCHEDULE" — three events, two card shapes. */
export const ADV_TODAY: AdvEvent[] = [
  {
    kind: 'hearing',
    id: 'hearing-1',
    time: '11:30 AM',
    type: 'Court Hearing',
    state: 'UPCOMING',
    title: 'Rahul Sharma vs. Amit Verma',
    location: 'District Court, Indore • Courtroom 4',
  },
  {
    kind: 'consultation',
    id: 'consult-1',
    time: '02:00',
    meridiem: 'PM',
    mode: 'video',
    modeLabel: 'Video Consultation',
    duration: '30 Min',
    state: 'SCHEDULED',
    client: 'Ananya Singh',
    subject: 'Property Registration & Title Search Advisory',
  },
  {
    kind: 'consultation',
    id: 'consult-2',
    time: '05:30',
    meridiem: 'PM',
    mode: 'voice',
    modeLabel: 'Voice Consultation',
    duration: '15 Min',
    state: 'SCHEDULED',
    client: 'Rohan Mehta',
    subject: 'Cheque Bounce Legal Advice',
  },
];

// ── Clients (design/151) ─────────────────────────────────────────────────────

export type AdvClient = {
  id: string;
  initials: string;
  name: string;
  summary: string;
  tags: string[];
  caseRef: string;
  caseMeta: string;
  when: string;
  nextStep: string;
  online: boolean;
};

export const ADV_CLIENT_STATS = {
  total: '28',
  totalLabel: 'All-time',
  active: '16',
  activeLabel: 'Engaged',
  thisMonth: '4',
  thisMonthLabel: '+14% MoM',
};

export const ADV_CLIENTS: AdvClient[] = [
  {
    id: 'rahul-sharma',
    initials: 'RS',
    name: 'Rahul Sharma',
    summary: '2 Active Cases • Civil & Writ',
    tags: ['High Court', 'District Court', 'Adv. Brief'],
    caseRef: 'HC-2026-1048',
    caseMeta: '+91 98260 •••••',
    when: 'Today, 11:42 AM',
    nextStep: 'Next: Evidence Review',
    online: true,
  },
  {
    id: 'ananya-singh',
    initials: 'AS',
    name: 'Ananya Singh',
    summary: '1 Active Matter • Commercial',
    tags: ['District Court', 'Injunction'],
    caseRef: 'DC-2026-0814',
    caseMeta: 'Civil Suit',
    when: 'Yesterday',
    nextStep: 'Hearing in 4 days',
    online: false,
  },
  {
    id: 'amit-verma',
    initials: 'AV',
    name: 'Amit Verma',
    summary: '3 Active Matters • Corporate & Land',
    tags: ['Legal Notice', 'Property', 'Consultation'],
    caseRef: 'LN-2026-0391',
    caseMeta: 'Commercial',
    when: '18 Sep 2026',
    nextStep: 'Drafting Reply Pending',
    online: true,
  },
  {
    id: 'pooja-kulkarni',
    initials: 'PK',
    name: 'Pooja Kulkarni',
    summary: '1 Active Matter • Forensic Audit',
    tags: ['Document Forensic', 'Authentication'],
    caseRef: 'DF-2026-0199',
    caseMeta: 'Signature Verification',
    when: '15 Sep 2026',
    nextStep: 'Expert Report Received',
    online: false,
  },
];

/** design/156's figure. See the earnings note at the top of this file. */
export const ADV_CLIENT_TOTAL_RECEIVED = 65000;

// ── Availability (design/149) ────────────────────────────────────────────────
//
// REPORTED — THE LEGEND'S COLOURS ARE NOT THE ONES THE BRIEF DESCRIBED. design/149
// draws Available as GREEN, Not Available as GREY and Blocked as RED (sampled from
// the file). The brief had brown / red / grey. Built as drawn.
//
// REPORTED — the design answers its own interaction question in its sub-line: "Tap a
// date to inspect or update slots". So a tap SELECTS a date and shows its slots
// below; it does not cycle the date's state. Changing a state would need an editor
// that is not drawn.

export type DateState = 'available' | 'unavailable' | 'blocked';

/** design/149 draws September 2026, with the 10th selected. */
export const ADV_AVAILABILITY_MONTH = { year: 2026, month: 8 }; // month is 0-based
export const ADV_AVAILABILITY_SELECTED = 10;

/**
 * Day-of-month to state for the drawn month. Anything not listed is 'available'.
 * Sundays are 'unavailable' and the 12th is 'blocked', as drawn.
 */
export const ADV_DATE_STATES: Record<number, DateState> = {
  6: 'unavailable',
  12: 'blocked',
  13: 'unavailable',
  20: 'unavailable',
  27: 'unavailable',
};

export const ADV_SELECTED_DATE = {
  label: '10 Sep 2026',
  sub: 'Specific date consultation schedule',
  chip: 'Available',
  hoursActive: '4 Hours Active',
  start: '5:00 PM',
  end: '9:00 PM',
  slotLabel: 'Evening Slot',
};

export type WeeklyRow = { day: string; ranges: string[]; on: boolean };

/** design/149's weekly schedule. Sunday is off. */
export const ADV_WEEKLY: WeeklyRow[] = [
  { day: 'Monday', ranges: ['10:00 AM – 1:00 PM', '4:00 PM – 8:00 PM'], on: true },
  { day: 'Tuesday', ranges: ['10:00 AM – 1:00 PM', '4:00 PM – 8:00 PM'], on: true },
  { day: 'Wednesday', ranges: ['10:00 AM – 1:00 PM', '4:00 PM – 8:00 PM'], on: true },
  { day: 'Thursday', ranges: ['10:00 AM – 1:00 PM', '4:00 PM – 8:00 PM'], on: true },
  { day: 'Friday', ranges: ['10:00 AM – 1:00 PM', '4:00 PM – 8:00 PM'], on: true },
  { day: 'Saturday', ranges: ['10:00 AM – 2:00 PM'], on: true },
  { day: 'Sunday', ranges: [], on: false },
];

// ── Notifications (design/150) ───────────────────────────────────────────────
//
// REPORTED — NONE OF THE SIX ROWS HAS A DESIGNED DESTINATION. Every row draws a
// chevron, but no file in the batch shows where any of them leads. They are inert.
//
// Drawn as-is, with the file's errors intact: "New cases Request" (casing), "Rahul
// sharma has request a constitution regarding of divorce metter" — which should
// almost certainly read "has requested a consultation regarding a divorce matter" —
// and two body lines that start lower-case.

export type AdvNotification = {
  id: string;
  icon: 'calendar' | 'wallet' | 'message' | 'document' | 'consult' | 'case';
  title: string;
  body: string;
  when: string;
  unread: boolean;
  section: 'today' | 'earlier';
};

export const ADV_NOTIFICATIONS: AdvNotification[] = [
  {
    id: 'n1',
    icon: 'calendar',
    title: 'New cases Request',
    body: 'Rahul sharma has request a constitution regarding of divorce metter',
    when: '1 hour ago',
    unread: true,
    section: 'today',
  },
  {
    id: 'n2',
    icon: 'wallet',
    title: 'Payment Received',
    body: 'Payment has been added to your wallet',
    when: '1 hour ago',
    unread: true,
    section: 'today',
  },
  {
    id: 'n3',
    icon: 'message',
    title: 'New message from Akash',
    body: 'you have a new message from akash',
    when: '1 hour ago',
    unread: true,
    section: 'today',
  },
  {
    id: 'n4',
    icon: 'document',
    title: 'New Legal notice request',
    body: 'you have a new legal notice request',
    when: '1 hour ago',
    unread: true,
    section: 'today',
  },
  {
    id: 'n5',
    icon: 'consult',
    title: 'Consultation Confirmed',
    body: 'Your consultation with Priya Mehta is confirmed for today at 4 : 00 PM',
    when: 'Yesterday',
    unread: false,
    section: 'earlier',
  },
  {
    id: 'n6',
    icon: 'case',
    title: 'Case Updated',
    body: 'The status of your assigned case has been updated',
    when: 'Yesterday',
    unread: false,
    section: 'earlier',
  },
];

// ── Client search (design/159) ───────────────────────────────────────────────
//
// design/159 draws a search for "Rahul" returning three clients. Two of them —
// Rahul Mehta and Rahul Verma — appear nowhere else in the advocate data; they exist
// only to populate this screen's results. Kept here as search-only records rather
// than added to ADV_CLIENTS, which is the list design/151 draws.

export type AdvSearchResult = {
  id: string;
  initials: string;
  name: string;
  ref: string;
  activity: string;
  status: string;
  statusKind: 'active' | 'previous';
  matters: string[];
  online: boolean;
};

export const ADV_SEARCH_RESULTS: AdvSearchResult[] = [
  {
    id: 'rahul-sharma',
    initials: 'RS',
    name: 'Rahul Sharma',
    ref: 'CLI-2026-0148',
    activity: 'Active 2h ago',
    status: '2 Active Matters',
    statusKind: 'active',
    matters: ['High Court • Special Writ #4102', 'District Court • Injunction Motion'],
    online: true,
  },
  {
    id: 'rahul-mehta',
    initials: 'RM',
    name: 'Rahul Mehta',
    ref: 'CLI-2026-0219',
    activity: 'Active 3d ago',
    status: '1 Active Matter',
    statusKind: 'active',
    matters: ['Legal Consultation • Corporate Advisory'],
    online: true,
  },
  {
    id: 'rahul-verma',
    initials: 'RV',
    name: 'Rahul Verma',
    ref: 'CLI-2025-0892',
    activity: 'Concluded Aug 2025',
    status: 'Previous Client',
    statusKind: 'previous',
    matters: ['Matter Disposed • Full Closure Certificate'],
    online: false,
  },
];

export const ADV_SEARCH_DEFAULT_QUERY = 'Rahul';

// ── Client profile (design/152) ──────────────────────────────────────────────
//
// NOTE — design/152 adds a FOURTH earnings figure to the pile: "Retainer escrow of
// ₹45,000 received for High Court matter". With design/148's ₹8,500, design/156's
// ₹65,000 and design/157's ₹32,900 net, no two advocate screens agree on what money
// has moved. See the earnings note at the top of this file.

export const ADV_CLIENT_PROFILE = {
  id: 'rahul-sharma',
  initials: 'RS',
  name: 'Rahul Sharma',
  chip: 'Active Client',
  type: 'Individual Petitioner • Commercial & Civil',
  since: 'Client Since June 2026',
  phone: '+91 98260 41209',
  email: 'rahul.sharma@example.com',
  clientId: 'CLI-2026-0148',
  documents: { count: '12 Documents', chip: 'Verified', body: 'Pleadings, certified orders, leases' },
};

export type AdvMatter = {
  id: string;
  service: string;
  status: string;
  title: string;
  detail: string;
};

export const ADV_CLIENT_MATTERS: AdvMatter[] = [
  {
    id: 'hc-2026-1048',
    service: 'High Court Representation',
    status: 'Active',
    title: 'Rahul Sharma vs. ABC Enterprises',
    detail: 'Special Writ Appeal • HC-2026-1048 • Next Hearing: 24 Sep',
  },
  {
    id: 'dc-2026-0814',
    service: 'District Court Representation',
    status: 'Active',
    title: 'Property Matter (Injunction Suit)',
    detail: 'Civil Suit No. 814 • DC-2026-0814 • Next Stage: Reply Due',
  },
];

export const ADV_CLIENT_ACTIVITY = [
  {
    id: 'a1',
    title: 'Message received',
    body: 'Client confirmed receipt of court cause list position.',
    when: 'Today, 11:42 AM',
    tone: 'dark' as const,
  },
  {
    id: 'a2',
    title: 'Document uploaded',
    body: 'Registered Commercial Lease Agreement (PDF) added to docket.',
    when: '18 Sep 2026',
    tone: 'light' as const,
  },
  {
    id: 'a3',
    title: 'Payment received',
    body: 'Retainer escrow of ₹45,000 received for High Court matter.',
    when: '16 Sep 2026',
    tone: 'dark' as const,
  },
];

export const ADV_CLIENT_FOOTER =
  'All consultations & docket files privileged under BCI rules.';

// ── Client cases (design/153) ────────────────────────────────────────────────
//
// design/153 is a 284x1024 device mock-up, roughly 0.73 px/pt, so its geometry is
// derived rather than measured to the usual tolerance.
//
// Drawn as-is: "Special Writ Appeal" is the file's spelling of "Appeal".

export type AdvCase = {
  id: string;
  court: string;
  status: 'active' | 'completed';
  statusLabel: string;
  title: string;
  type: string;
  courtLine: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  /** Active cases show a hearing bar; the completed one shows a settlement line. */
  hearing?: { date: string; cause: string };
  settlement?: string;
  action: string;
};

export const ADV_CLIENT_CASES: AdvCase[] = [
  {
    id: 'hc-2026-1048',
    court: 'HIGH COURT • INDORE BENCH',
    status: 'active',
    statusLabel: 'Active',
    title: 'Rahul Sharma vs. ABC Enterprises',
    type: 'Civil Matter • Special Writ Appeal',
    courtLine: 'Madhya Pradesh High Court',
    leftLabel: 'CASE ID',
    leftValue: 'HC-2026-1048',
    rightLabel: 'CNR / FILING NO',
    rightValue: 'WP/2026/8492',
    hearing: { date: '24 Sep 2026 • 10:30 AM', cause: 'Cause List #14' },
    action: 'View Case',
  },
  {
    id: 'dc-2026-1042',
    court: 'DISTRICT & SESSIONS COURT',
    status: 'active',
    statusLabel: 'Active',
    title: 'Rahul Sharma vs. Verma Enterprises',
    type: 'Property Matter • Injunction Suit',
    courtLine: 'District Court, Indore',
    leftLabel: 'CASE ID',
    leftValue: 'DC-2026-I042',
    rightLabel: 'SUIT IDENTIFIER',
    rightValue: 'Civil Suit No. 814/2026',
    hearing: { date: '28 Sep 2026 • 02:00 PM', cause: '' },
    action: 'View Case',
  },
  {
    id: 'ln-2026-0182',
    court: 'LEGAL NOTICE & RECOVERY',
    status: 'completed',
    statusLabel: 'Completed',
    title: 'Payment Dispute • Notice & Settlement',
    type: 'Commercial Recovery Notice',
    courtLine: 'Opposing Party: Apex Logistics Ltd.',
    leftLabel: 'NOTICE REF',
    leftValue: 'LN-2026-0182',
    rightLabel: 'STATUS DATE',
    rightValue: '12 Aug 2026',
    settlement: 'Settled via amicable reply & full bank discharge',
    action: 'View Archived Docket',
  },
];

export const ADV_CASE_STATS = [
  { label: 'Active', value: '2 Matters', tone: 'green' as const },
  { label: 'Closed', value: '1 Matter', tone: 'muted' as const },
  { label: 'Total Pool', value: '3 Cases', tone: 'muted' as const },
];

// ── Client documents (design/154) ────────────────────────────────────────────
//
// REPORTED — THE DOCUMENT COUNT CONTRADICTS THE PROFILE. design/152's profile card
// says "12 Documents"; design/154 says "TOTAL FILES 4 Docs" and lists four. Four is
// what this screen actually draws, so four is what is built; the profile keeps its
// drawn 12. One of the two is wrong.

export type AdvDocument = {
  id: string;
  kind: 'pdf' | 'agreement' | 'identity' | 'order';
  name: string;
  meta: string;
  pages: string;
  caseRef: string;
  uploaded: string;
  status?: string;
  category: 'case' | 'identity' | 'other';
};

export const ADV_CLIENT_DOCUMENTS: AdvDocument[] = [
  {
    id: 'petition',
    kind: 'pdf',
    name: 'Petition.pdf',
    meta: '14.2 MB • Scanned & OCR Indexed',
    pages: '24 Pages',
    caseRef: 'HC-2026-1048 • Special Writ',
    uploaded: '18 Sep 2026',
    category: 'case',
  },
  {
    id: 'agreement',
    kind: 'agreement',
    name: 'Property Agreement.pdf',
    meta: '8.6 MB • Registered Commercial Lease',
    pages: '18 Pages',
    caseRef: 'DC-2026-1042 • Injunction Suit',
    uploaded: '16 Sep 2026',
    category: 'case',
  },
  {
    id: 'identity',
    kind: 'identity',
    name: 'Identity Document.pdf',
    meta: '1.4 MB • Masked ID (•••• •••• 4129)',
    pages: '2 Pages',
    caseRef: 'Client Profile',
    uploaded: '10 Sep 2026',
    status: 'KYC Verified',
    category: 'identity',
  },
  {
    id: 'order',
    kind: 'order',
    name: 'Previous Order.pdf',
    meta: '4.1 MB • Certified Lower Court Order',
    pages: '8 Pages',
    caseRef: 'HC-2026-1048 • Trial Order',
    uploaded: '08 Sep 2026',
    category: 'case',
  },
];

export const ADV_DOC_STATS = [
  { label: 'TOTAL FILES', value: '4 Docs', sub: '28.3 MB Total' },
  { label: 'INTEGRITY', value: '4 / 4', sub: 'OCR Indexed' },
  { label: 'VAULT TIER', value: 'AES-256', sub: 'Privileged' },
];

// ── Client messages (design/155) ─────────────────────────────────────────────
//
// REPORTED — THIS IS A FOURTH MESSAGES-LIST DESIGN. design/142 is the client-side
// list: initials avatar, name, a green "Verified" chip, a timestamp, a "Matter:"
// line, a preview, and an unread badge or chevron. This one is the advocate's, and
// differs structurally: three stat cells above the list, a search field with a MIC,
// four filter chips, a matter chip paired with a monospaced case reference, and a
// double-tick read receipt where the client list uses a chevron. Neither is a
// variant of the other; they are two lists of the same thing drawn independently.
//
// The fourth filter chip is clipped as "Notices &…" — inferred as "Notices & Orders"
// from the matter types, but it is a guess, like design/151's "Cor…" chip.

export type AdvClientThread = {
  id: string;
  initials: string;
  name: string;
  verified: boolean;
  online: boolean;
  when: string;
  matter: string;
  caseRef: string;
  preview: string;
  attachment?: boolean;
  unread: number;
  avatarTone: 'peach' | 'grey';
};

export const ADV_CLIENT_THREADS: AdvClientThread[] = [
  {
    id: 'rahul-sharma',
    initials: 'RS',
    name: 'Rahul Sharma',
    verified: true,
    online: true,
    when: '10:42 AM',
    matter: 'HC Representation',
    caseRef: 'HC-2026-1048',
    preview: 'Please check the latest order.',
    unread: 2,
    avatarTone: 'peach',
  },
  {
    id: 'ananya-singh',
    initials: 'AS',
    name: 'Ananya Singh',
    verified: true,
    online: true,
    when: 'Yesterday',
    matter: 'District Court Rep.',
    caseRef: 'DC-2026-0814',
    preview: 'Thank you, Advocate. We will be there.',
    unread: 0,
    avatarTone: 'grey',
  },
  {
    id: 'amit-verma',
    initials: 'AV',
    name: 'Amit Verma',
    verified: false,
    online: false,
    when: '18 Sep',
    matter: 'Legal Notice',
    caseRef: 'LN-2026-0182',
    preview: 'Can we discuss the notice draft?',
    unread: 0,
    avatarTone: 'grey',
  },
  {
    id: 'pooja-kulkarni',
    initials: 'PK',
    name: 'Pooja Kulkarni',
    verified: true,
    online: false,
    when: '15 Sep',
    matter: 'Document Forensic',
    caseRef: 'DF-2026-0199',
    preview: 'Uploaded genuine signature',
    attachment: true,
    unread: 0,
    avatarTone: 'peach',
  },
];

export const ADV_MESSAGE_STATS = [
  { label: 'Active', value: '3', unit: 'Chats', sub: 'Live', dot: true },
  { label: 'Unread', value: '2', unit: 'New', sub: 'Action req.', dot: true },
  { label: 'Avg SLA', value: '<15', unit: 'm', sub: 'Pristine', dot: false },
];

// ── Client payments (design/156) and payment detail (design/157) ─────────────
//
// MEASUREMENT CAVEAT — design/156 is a 239x1024 device mock-up, about 0.61 px/pt.
// Several transaction references sit at the edge of legibility at that size; the
// values below are the best reading of the file and should be checked against a
// clean export before they are trusted as data.

export type AdvPaymentStatus = 'received' | 'pending' | 'refunded';

export type AdvPayment = {
  id: string;
  service: string;
  amount: number;
  status: AdvPaymentStatus;
  matter: string;
  transaction: string;
  counterparty: string;
  action: string;
};

export const ADV_PAYMENTS: AdvPayment[] = [
  {
    id: 'hc-2026-1048',
    service: 'High Court Representation',
    amount: 35000,
    status: 'received',
    matter: 'Special Writ Appeal • HC-2026-1048',
    transaction: 'NEFT Bank Transfer • Ref: TXN-3424  24 Sep, 11:30 AM',
    counterparty: 'ABC Enterprises Settlement Escrow',
    action: 'View Docket Receipt',
  },
  {
    id: 'dc-2026-1042',
    service: 'District Court Representation',
    amount: 20000,
    status: 'pending',
    matter: 'Injunction Suit • DC-2026-1042',
    transaction: 'Escrow Invoice Raised • Due in 2 d  16 Sep, 03:15 PM',
    counterparty: 'Verma Enterprises Counter-Claim',
    action: 'Send Reminder',
  },
  {
    id: 'cs-2026-0312',
    service: 'Legal Consultation Strategy',
    amount: 5000,
    status: 'received',
    matter: 'Chamber Strategy Session • CS-2026-0312',
    transaction: 'UPI / QR Settlement • Instant Verif  12 Sep, 05:00 PM',
    counterparty: 'Retainer Chamber Advisory',
    action: 'Receipt Generated',
  },
  {
    id: 'df-2026-0199',
    service: 'Document Forensic & Verification',
    amount: 15000,
    status: 'received',
    matter: 'Signature Sampling • DF-2026-0199',
    transaction: 'Online Card Escrow • Certified  28 Aug, 02:40 PM',
    counterparty: 'Expert Forensic Witness Deposit',
    action: 'View Invoice',
  },
  {
    id: 'ps-2026-0082',
    service: 'Property Title Search Advance',
    amount: 10000,
    status: 'received',
    matter: 'Cadastral Verification • PS-2026-0082',
    transaction: 'Net Banking Settlement • Sub-Sep  15 Aug, 10:15 AM',
    counterparty: 'Search Registry Search No. 4410',
    action: 'View Clearance',
  },
  {
    id: 'ln-2026-0182',
    service: 'Pre-litigation Mediation Fee',
    amount: 2500,
    status: 'refunded',
    matter: 'Amicable Settlement • LN-2026-0182',
    transaction: 'Reversal to Client Escrow Account  02 Aug, 04:00 PM',
    counterparty: 'Mediation Closed with Compromise',
    action: 'Audit Voucher',
  },
];

export const ADV_PAYMENT_SUMMARY = {
  totalReceived: 65000,
  totalChip: 'Settled',
  escrowLine: 'Escrow Released • Settled',
  pending: 20000,
  pendingChip: '1 Due',
  records: '8',
};

/**
 * The fee breakdown, COMPUTED from ADV_COMMISSION rather than hardcoded, so the
 * percentages live in one place. design/157's drawn figures are in
 * ADV_COMMISSION.example for comparison.
 */
export function advFeeBreakdown(grossFee: number) {
  const platform = Math.round(grossFee * ADV_COMMISSION.platformFacilitationRate);
  const escrow = Math.round(grossFee * ADV_COMMISSION.escrowRegulatoryRate);
  return {
    grossFee,
    platformFacilitationFee: platform,
    escrowRegulatoryFee: escrow,
    netEarnings: grossFee - platform - escrow,
  };
}

export const ADV_PAYMENT_DETAIL = {
  id: 'hc-2026-1048',
  ref: 'PAY-HC-2026-1048',
  chip: 'PAYMENT RECEIVED',
  verified: 'Escrow Verified',
  totalLabel: 'TOTAL CLIENT PAYMENT',
  grossFee: 35000,
  depositLine: 'Deposited via NEFT on 22 September 2026',
  matter: 'Rahul Sharma vs. ABC Enterprises',
  matterRef: 'HC-2026-1048 • Madhya Pradesh High Court',
  client: 'Rahul Sharma',
  clientRef: 'CLI-2026-0148',
  service: 'High Court Writ',
  filed: '22 Sep 2026, 11:30 AM',
  protection: 'Protected under Advocate Client Escrow Protocol',
  payoutDate: 'Payout Scheduled for 25 Sep 2026',
  payoutNote:
    'Escrow clearance holds funds for 72 hours per High Court mediation window rules. Disbursement will trigger via direct RTGS.',
  bank: {
    name: 'HDFC Bank Ltd',
    type: 'Advocate Current Account',
    chip: 'PRIMARY',
    masked: '••••  ••••  4821',
    ifsc: 'IFSC: HDFC0001048',
    // REPORTED — THE BENEFICIARY IS THE WRONG ADVOCATE. design/157 pays out to
    // "Adv. Priya Sharma Chambers", but this is Adv. Abhishek Chouhan's app
    // (design/148 greets "Abhishek", design/151 shows the AB avatar). Priya Sharma
    // is a saved advocate on the CLIENT side, and the client on this very payment is
    // Rahul Sharma. Drawn as-is; money is going to the wrong name.
    beneficiary: 'Adv. Priya Sharma Chambers',
  },
  receipts: [
    { id: 'escrow', name: 'Official Escrow Receipt', meta: 'RCT-2026-8819.pdf • 340 KB' },
    { id: 'gst', name: 'GST Tax Invoice', meta: 'INV-2026-1048.pdf • 420 KB' },
  ],
};

/**
 * REPORTED — THE LIST AND THE DETAIL DISAGREE ON THE DATE. design/156's row for this
 * payment reads "24 Sep, 11:30 AM"; design/157 says it was deposited on 22 September
 * and filed at "22 Sep 2026, 11:30 AM". Same payment, two dates two days apart.
 */
export const ADV_PAYMENT_DATE_CONFLICT = { list: '24 Sep', detail: '22 Sep' };

// ═════════════════════════════════════════════════════════════════════════════
// ADVOCATE LEGAL ADVICE FLOW (designs 160-182)
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠ EVERY "AI" FIELD BELOW IS A STATIC STRING COPIED FROM THE DESIGN.
//
// Nothing is generated. There is no model provider, no document ingestion, no OCR,
// no retrieval and no citation grounding. The page numbers in the action plan
// ("IP_Licensing_Draft_v3.2.pdf • Page 92") are drawn text, not references into a
// real document.
//
// A real version of these five surfaces — AI Refresh, AI Document Review, AI
// Recommended Action Plan, Legalitt AI chat, Legal AI Copilot — needs:
//   - a model provider, and a decision about whether client documents may leave the
//     jurisdiction to reach it;
//   - document ingestion and OCR, since the drawn flow reads 160 pages of PDFs;
//   - citation grounding, because the action plan cites specific pages and an
//     ungrounded citation to a page that does not say what is claimed is worse than
//     no citation;
//   - and a position on accuracy and liability. This is a legal product: an advocate
//     acting on "Section 27 Restraint of Trade" because a model surfaced it is
//     professionally accountable for that advice. "AI generated · Review before use"
//     is drawn on the screens, but who carries the risk is not a UI question.
// That is a scope decision, not a build task.
// ─────────────────────────────────────────────────────────────────────────────
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠ COMMISSION CONFLICT — TWO DIFFERENT PLATFORM CUTS, THREE DIFFERENT NAMES.
//
//   design/157   Platform Facilitation Fee      5%   + Escrow Tech & Regulatory 1%
//                                                    = 6% total
//   design/164   Platform Service Charge       10%
//   design/181   Advocate Guild Platform Retainer  10%
//
// The arithmetic inside each screen is self-consistent, so these are not rounding
// errors — they are two different commercial models drawn in the same batch. 10% is
// what these screens draw, so ADV_COMMISSION_10 is what this flow computes from;
// design/157's 6% stays in ADV_COMMISSION for the screen that draws it. Both are
// recorded so the client can pick one. On a ₹28,500 retainer the difference is
// ₹1,140 to the advocate on a single consultation.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_COMMISSION_10 = {
  /** design/164 "Platform Service Charge" / design/181 "Advocate Guild Platform Retainer". */
  platformRate: 0.1,
  labels: {
    schedule: 'Platform Service Charge',
    completed: 'Advocate Guild Platform Retainer',
  },
};

/** Net to the advocate under the 10% model these screens draw. */
export function advNetAt10(grossFee: number) {
  const platform = Math.round(grossFee * ADV_COMMISSION_10.platformRate);
  return { grossFee, platformFee: platform, net: grossFee - platform };
}

// ── Responses / cases list (design/162) ──────────────────────────────────────
//
// REPORTED — TWO CLIPPED FILTER LABELS, as on design/151 and design/155. The first
// row ends "Co…" and the second "Property Sea…". Inferred as "Completed (12)" — the
// stat cells above read REVIEW 3, PROGRESS 5, RESOLVED 12, and 3 + 5 + 12 = 20,
// which is the All count — and "Property Search Report", the service name used
// everywhere else. Both are inferences.

export type AdvCaseStatus =
  | 'draft-in-progress'
  | 'changes-requested'
  | 'needs-review'
  | 'completed';

export type AdvResponseCase = {
  id: string;
  service: string;
  serviceIcon: 'notice' | 'fir' | 'property' | 'advice';
  status: AdvCaseStatus;
  statusLabel: string;
  client: string;
  when: string;
  matter: string;
  note: string;
  noteQuote?: string;
  noteIcon: 'draft' | 'message' | 'docs' | 'done';
};

export const ADV_RESPONSE_STATS = [
  { label: 'REVIEW', value: '3', chip: 'Action', tone: 'brand' as const },
  { label: 'PROGRESS', value: '5', chip: 'Active', tone: 'brand' as const },
  { label: 'RESOLVED', value: '12', chip: 'Done', tone: 'green' as const },
];

export const ADV_RESPONSE_FILTERS = ['All (20)', 'Needs Review (3)', 'In Progress (5)', 'Completed (12)'];
export const ADV_SERVICE_FILTERS = ['All Services', 'Legal Notice', 'FIR Draft', 'Property Search Report'];

export const ADV_RESPONSE_CASES: AdvResponseCase[] = [
  {
    id: 'ananya-deshmukh',
    service: 'Legal Notice',
    serviceIcon: 'notice',
    status: 'draft-in-progress',
    statusLabel: 'Draft in Progress',
    client: 'Ananya Deshmukh',
    when: 'Today • 10:42 AM',
    matter: 'Legal Notice',
    note: 'Notice draft is ready for review.',
    noteIcon: 'draft',
  },
  {
    id: 'ananya-singh',
    service: 'FIR Draft',
    serviceIcon: 'fir',
    status: 'changes-requested',
    statusLabel: 'Changes Requested',
    client: 'Ananya Singh',
    when: 'Yesterday • 4:18 PM',
    matter: 'Payment Fraud (Cybercell)',
    note: 'Client requested changes:',
    noteQuote: '"Please correct incident date to 14th Sept."',
    noteIcon: 'message',
  },
  {
    id: 'rohan-mehta',
    service: 'Property Search Report',
    serviceIcon: 'property',
    status: 'needs-review',
    statusLabel: 'Needs Review',
    client: 'Rohan Mehta',
    when: '18 Sep 2026',
    matter: 'Property Title Search (Survey No. 412)',
    note: '2 documents still need review before title certification.',
    noteIcon: 'docs',
  },
  {
    id: 'vivek-jain',
    service: 'Legal Advice',
    serviceIcon: 'advice',
    status: 'completed',
    statusLabel: 'Completed',
    client: 'Vivek Jain',
    when: '16 Sep 2026',
    matter: 'Commercial Contract Dispute',
    note: 'Consultation completed. Advice memo sent to client.',
    noteIcon: 'done',
  },
];

// ── Incoming request detail (design/163, with 160 and 161 as shorter cuts) ────
//
// REPORTED — design/163's requested window reads "Today, Oct 24", two months adrift
// of the app's September 2026. Same stale October date as design/95 and design/99.
// Normalised to September below.
//
// REPORTED — the brief describes the AI stat cells as PARTIES 4; design/163 draws
// PARTIES 3. The drawn value is used.

export const ADV_REQUEST = {
  id: '2024-88C',
  ref: 'Ref #2024-88C',
  expirySeconds: 17 * 3600 + 42 * 60,
  retainer: {
    label: 'Advisory Retainer',
    fee: 28500,
    duration: '45 min',
    chip: 'Priority Review',
    deadline: 'Court/Board Deadline',
  },
  client: {
    initials: 'AD',
    name: 'Ananya Deshmukh',
    title: 'Managing Director at Finova Tech India Pvt. Ltd.',
    tier: 'Enterprise Tier',
    priorCases: '4 Prior Cases',
    jurisdiction: 'BKC, Mumbai (IST)',
    language: 'English, Hindi, Marathi',
    verified: 'ID Verified',
  },
  briefing: {
    practice: 'Corporate & Commercial',
    mode: 'Video • 45m',
    // design/163 draws "Today, Oct 24"; moved to September to match the app.
    window: 'Today, Sep 24 • 4:00 PM – 4:45 PM (GMT+1)',
  },
  summary:
    'We require immediate legal advisory regarding an IP assignment and software licensing agreement with an international counterpart. Seeking review of strict Indian Contract Act & Bombay High Court exclusive jurisdiction clauses, liability caps, and indemnification exposure prior to final board execution tomorrow morning.',
};

/** AI Refresh (design/163). Static text; nothing synthesises it. */
export const ADV_AI_REFRESH = {
  chip: 'Executive',
  subtitle: 'Clear summary for quick review',
  explanation: 'Original description has been simplified and organized for easier reading.',
  blockLabel: 'AI REFRESHED SUMMARY',
  blockChip: 'Synthesized Brief',
  bullets: [
    {
      label: 'Issue:',
      body: 'Pre-execution review of international IP assignment & software licensing agreement.',
    },
    {
      label: 'Background:',
      body: 'Cross-border contract with counterparty; strict review needed for Indian Contract Act compliance, Bombay High Court exclusive jurisdiction, liability caps, and indemnification risks.',
    },
    {
      label: 'What client needs:',
      body: 'Urgent advisory and risk mitigation before final board execution tomorrow morning.',
    },
    { label: 'Legal View:', body: 'Related laws, rules, and important cases.' },
  ],
  footer: 'AI generated • Review before use',
  original: 'View Original',
};

export const ADV_REQUEST_FILINGS = [
  {
    id: 'ip-licensing',
    kind: 'pdf' as const,
    name: 'IP_Licensing_Draft_v3.2.pdf',
    chip: 'AI Reviewed',
    meta: '148 pages • 1.8 MB • Uploaded 2h ago',
  },
  {
    id: 'jurisdiction',
    kind: 'doc' as const,
    name: 'Jurisdiction_Summary_Addendum.pdf',
    chip: 'AI Reviewed',
    meta: '12 pages • 640 KB • Uploaded 2h ago',
  },
];

/** AI Document Review (design/163). Static. */
export const ADV_AI_DOCS = {
  title: 'AI Document Review',
  chip: 'CONSOLIDATED',
  toggleLabel: 'AI Review On',
  description: 'Let AI read your uploaded documents and create one clear case summary.',
  processing:
    'AI reads all pages across all uploaded documents (2 documents • 160 pages) and prepares one consolidated summary.',
  completeTitle: 'Document review complete',
  completeSub: '160 of 160 pages reviewed',
  completeChip: 'Summary ready',
  stats: [
    { label: 'DOCS', value: '2', risk: false },
    { label: 'PAGES', value: '160', risk: false },
    { label: 'DATES', value: '4', risk: false },
    { label: 'PARTIES', value: '3', risk: false },
    { label: 'RISKS', value: '2', risk: true },
  ],
  summaryTitle: 'AI Document Summary',
  summarySub: 'Key information synthesized from all uploaded filings',
  sections: [
    {
      label: 'CASE OVERVIEW',
      body: 'Cross-border intellectual property assignment and master software licensing transaction between Finova Tech India Pvt. Ltd. and Apex Global Technologies Inc.',
    },
    {
      label: 'PARTIES INVOLVED',
      cite: 'IP_Licensing… • Pg 1',
      body: 'Finova Tech India Pvt. Ltd. (Assignor/Licensor) & Apex Global Technologies Inc., Delaware (Assignee/Licensee).',
    },
    {
      label: 'KEY FACTS',
      cite: 'IP_Licensing… • Pg 14',
      body: 'Multi-jurisdictional transfer of core algorithmic IP with ongoing SaaS co-development and reciprocal licence-back provisions.',
    },
  ],
  disclaimer: 'AI-generated summary. Please verify important details against the original documents.',
};

export type AdvActionState = 'in-progress' | 'not-started';
export type AdvActionButton = 'view-source' | 'add-note' | 'mark-done';

/** AI Recommended Action Plan (design/163). Static; every button is inert. */
export const ADV_AI_ACTIONS: {
  n: string;
  state: AdvActionState;
  stateLabel: string;
  title: string;
  body: string;
  source?: string;
  button: AdvActionButton;
}[] = [
  {
    n: '01',
    state: 'in-progress',
    stateLabel: 'IN PROGRESS',
    title: 'Verify Jurisdiction and Cross-Border Defensibility',
    body: 'Confirm the correct jurisdiction and review whether the matter can be addressed under the applicable legal framework.',
    source: 'IP_Licensing_Draft_v3.2.pdf • Page 92',
    button: 'view-source',
  },
  {
    n: '02',
    state: 'not-started',
    stateLabel: 'NOT STARTED',
    title: 'Check Section 27 Restraint of Trade Concerns',
    body: 'Review the relevant contract terms and assess whether the restraint-of-trade clause requires further legal review.',
    source: 'Jurisdiction_Summary_Addendum.pdf • Page 9',
    button: 'view-source',
  },
  {
    n: '03',
    state: 'not-started',
    stateLabel: 'NOT STARTED',
    title: 'Clarify Minimum Escrow & Execution Terms',
    body: 'Confirm the payment, escrow and execution conditions that apply to the proposed arrangement.',
    source: 'IP_Licensing_Draft_v3.2.pdf • Page 54',
    button: 'add-note',
  },
  {
    n: '04',
    state: 'not-started',
    stateLabel: 'NOT STARTED',
    title: 'Prepare Pre-Execution Risk Advisory',
    body: "Review the identified risks and prepare the advocate's proposed safeguards before execution.",
    button: 'add-note',
  },
  {
    n: '05',
    state: 'not-started',
    stateLabel: 'NOT STARTED',
    title: 'Discuss Action Plan in Scheduled Video Consultation',
    body: 'Discuss the identified issues, required documents and proposed next steps with the client.',
    button: 'mark-done',
  },
];

export const ADV_INFO_NEEDED = {
  title: 'Information Needed',
  chip: '2 PENDING',
  items: ['Schedule B (Patent & Trademark List)', 'Prior Counterparty Board Resolution'],
  disclaimer: 'AI-generated suggestions. Verify important facts before taking action.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Schedule & payout (design/164).
//
// ⚠ The platform charge is COMPUTED from ADV_COMMISSION_10, not hardcoded, so the
// rate lives in one place. design/164 draws 10%; design/157 draws 5% + 1% = 6%.
// See the note above ADV_COMMISSION_10.
//
// ⚠ "Amount on Hold" and "Advance Payment" do NOT reconcile as deductions.
// 8,000 + 17,650 = 25,650, which is exactly the NET payout after the 10% charge.
// They are a SPLIT OF THE NET, not further subtractions, but design/164 lists them
// in the same unsigned column as the fee and the charge, so the column reads as if
// 28,500 − 2,850 − 8,000 − 17,650 = 0. Drawn as designed; flagged here.
//
// ⚠ design/164 renames the client's employer and office against design/163:
// "Finova Technologies" / "Nariman Point, Mumbai" here vs "Finova Tech India Pvt.
// Ltd." / "BKC, Mumbai" there. Both are drawn text and both are kept as drawn.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// ⚠ DATE NORMALISATION.
//
// designs 164, 165, 166, 167, 176, 180 and 181 all read OCTOBER 2024, while
// design/172's private notes read 10 Sep 2026 and the whole client side is anchored
// to MOCK_TODAY = '2026-09-19' (data/cases.ts). The advocate flow is therefore two
// years and one month adrift of the rest of the app.
//
// All of them are normalised to SEPTEMBER 2026, keeping the drawn day numbers:
// "24 Oct 2024" → "24 Sep 2026", "Today, Oct 24" → "Today, Sep 24", and the
// calendar month October 2024 → September 2026.
//
// 1 Oct 2024 and 1 Sep 2026 are both Tuesdays, so design/165's calendar grid keeps
// its exact drawn shape. The one casualty is that September has 30 days, so the
// availability dot design/165 draws on the 31st has nowhere to go and is dropped.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_SCHEDULE = {
  mode: 'Video Chamber',
  client: {
    initials: 'AD',
    name: 'Ananya Deshmukh',
    verified: 'Verified',
    title: 'Managing Director, Finova Technologies',
    location: 'Nariman Point, Mumbai (IST)',
  },
  practice: 'Corporate & Commercial IP',
  matter: 'Cross-Border IP Licensing & Bombay High Court Jurisdiction Structuring',
  rows: [
    {
      icon: 'calendar' as const,
      label: 'Date & Window',
      value: 'Today, Sep 24, 2026 • 4:00 PM – 4:45 PM',
    },
    {
      icon: 'clock' as const,
      label: 'Allocated Session',
      value: '45 Minutes (Confidential Encrypted Line)',
    },
    {
      icon: 'shield' as const,
      label: 'Compliance & Terms',
      value:
        'By accepting this request, the Advocate agrees to the Client’s Terms & Conditions, NDA, and liability terms.',
      link: 'view more',
    },
  ],
  escrowChip: 'Escrow Guaranteed',
  grossFee: 28500,
  grossSub: '45 min session billing',
  /** Drawn as two further rows in the same column; see the reconciliation note above. */
  hold: 8000,
  advance: 17650,
  netLabel: 'NET ADVOCATE PAYOUT',
  netSub: 'Automated release post consultation',
  netNote: 'Net amount after applicable deductions',
  briefs: {
    title: '2 Reference Briefs Attached',
    sub: 'Managing Director, Finova Technologies Pvt. Ltd.',
    link: 'Preview',
  },
  accept: 'Accept & Confirm Consultation',
  propose: 'Propose Alternate Time or Decline',
};

/** 8,000 + 17,650 against the computed net. Used to assert the split in the UI. */
export const ADV_SCHEDULE_SPLIT_MATCHES_NET =
  ADV_SCHEDULE.hold + ADV_SCHEDULE.advance === advNetAt10(ADV_SCHEDULE.grossFee).net;

// ─────────────────────────────────────────────────────────────────────────────
// Propose an alternate time (design/165).
//
// ⚠ design/165 draws the slot grid with two collisions rather than layouts:
// the "Court" label sits ON TOP of the struck-through 12:00 PM slot text, and the
// trailing availability dot abuts the slot text with no gap. Both are rebuilt as
// proper layout here — see the notes in the screen.
//
// ⚠ The message card is titled "Message to Legalitt (Optional)" AND carries a
// right-hand "Optional" label. The word appears twice; both are drawn.
// ─────────────────────────────────────────────────────────────────────────────

export type AdvSlotState = 'available' | 'blocked' | 'original' | 'selected';

export const ADV_PROPOSE = {
  title: 'Propose Alternate Time',
  subtitle: 'Suggest a different time that works for you.',
  sessionChip: 'Alternative Requested',
  client: 'Ananya Deshmukh',
  mode: 'Video Chamber',
  matter: 'Cross-Border IP Licensing & Software Contract',
  originalLabel: 'Original Requested Time:',
  original: '24 Sep 2026, 4:00 PM – 4:45 PM',

  /**
   * design/165 draws October 2024; normalised to September 2026 (MOCK_TODAY).
   * Both months begin on a Tuesday, so the grid keeps the drawn shape exactly —
   * except that September has no 31st, so the dot design/165 draws on the 31st is
   * dropped from datesWithSlots below.
   */
  month: { year: 2026, month: 8 },
  selectedDate: 24,
  /** Dates drawn with an availability dot. */
  datesWithSlots: [25, 28, 29, 30],
  legend: [
    { label: 'Available Slots', tone: 'available' as const },
    { label: 'Selected Date', tone: 'selected' as const },
    { label: 'Unavailable', tone: 'blocked' as const },
  ],

  durationChip: '45 Min Session',
  slots: [
    { id: '10:00', label: '10:00 AM – 10:45 AM', state: 'available' as AdvSlotState },
    { id: '10:30', label: '10:30 AM – 11:15 AM', state: 'available' as AdvSlotState },
    { id: '11:00', label: '11:00 AM – 11:45 AM', state: 'available' as AdvSlotState },
    { id: '11:30', label: '11:30 AM – 12:15 PM', state: 'available' as AdvSlotState },
    { id: '12:00', label: '12:00 PM – 12:45 PM', state: 'blocked' as AdvSlotState, note: 'Court' },
    { id: '16:00', label: '04:00 PM – 04:45 PM', state: 'original' as AdvSlotState, note: 'Original' },
    { id: '17:00', label: '05:00 PM – 05:45 PM', state: 'available' as AdvSlotState },
    { id: '17:30', label: '05:30 PM – 06:15 PM', state: 'selected' as AdvSlotState },
    { id: '18:00', label: '06:00 PM – 06:45 PM', state: 'available' as AdvSlotState },
    { id: '18:30', label: '06:30 PM – 07:15 PM', state: 'available' as AdvSlotState },
  ],
  customTime: { label: 'Custom Time', hint: 'Choose a time manually' },

  customConfig: {
    title: 'Custom Slot Configuration',
    chip: 'IST (UTC+05:30)',
    startLabel: 'Start Time',
    startValue: '05:15 PM',
    durationLabel: 'Session Duration',
    durationValue: '45 minutes',
  },

  proposed: {
    label: 'YOUR PROPOSED TIME',
    chip: 'Slot Selected',
    date: '24 Sep 2026',
    time: '5:30 PM – 6:15 PM IST',
    mode: 'Video Chamber',
  },

  message: {
    title: 'Message to Legalitt (Optional)',
    rightLabel: 'Optional',
    sub: 'Provide a brief note explaining the suggested rescheduling.',
    placeholder:
      'Example: I have an urgent High Court listing at the original time. Please confirm this new slot so we can proceed.',
  },

  submit: 'Propose New Time',
  decline: 'Decline Consultation',
  caption:
    'The proposed alternative schedule will be communicated to the client for their review and explicit confirmation under Legalitt chamber terms.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Consultation confirmed (design/166).
//
// ⚠ design/166 clips two strings behind overlapping elements rather than laying
// them out: the client's title runs under the ₹25,650 column, and the second
// document name runs under the Review chip. Both WRAP here, per the project's
// "shrink or wrap, never ellipsize" rule.
//
// ⚠ The notes are static. "+ Add AI Action Plan and brief in Notes" would pull the
// action plan from design/163, which is itself static mock content — see the AI
// scope note above ADV_AI_REFRESH. Edit and Review are inert.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_CONFIRMED = {
  title: 'Consultation Confirmed',
  docket: 'Docket #2024-88C • Escrow Secured',
  /** The chip counts down from here. */
  countdownSeconds: 18 * 60,
  client: {
    initials: 'AD',
    name: 'Ananya Deshmukh',
    title: 'Managing Director, Finova Technologies',
  },
  escrowAmount: 25650,
  escrowLabel: 'Escrow Funded',
  matterLabel: 'MATTER',
  practice: 'Corporate & Commercial IP',
  matter: 'Cross-Border IP Licensing & Exclusive Jurisdiction Structuring',
  chips: ['End-to-End Encrypted', '45 Minutes'],
  date: { label: 'Date', value: 'Today, 24 Sep 2026' },
  time: { label: 'Scheduled Time', value: '4:00 PM – 4:45 PM IST' },

  summaryLabel: 'EXECUTIVE CASE SUMMARY',
  summary:
    'Advisory review of cross-border software IP assignment and licensing agreement between Finova Tech India Pvt. Ltd. and global counterpart. Focus on Bombay High Court jurisdiction clauses, liability caps under Indian Contract Act, and indemnification exposure prior to board signing tomorrow morning.',
  references: [
    'Governing Law: Indian Contract Act, 1872',
    'Arbitration: MCIA Mumbai / DIAC Delhi',
  ],

  documents: [
    { id: 'ip', name: 'IP_Licensing_Draft_v3.2.pdf', meta: 'PDF • 1.8 MB • Client Upload' },
    {
      id: 'juris',
      name: 'Jurisdiction_Summary_Addendum.pdf',
      meta: 'PDF • 640 KB • Client Upload',
    },
  ],

  notes: {
    label: 'MAKE YOUR NOTES FOR CONSULTATION',
    edit: 'Edit',
    warning: '* THIS NOTE WILL APPEAR IN CALL & CHAT IN NOTES BUTTON',
    privacy: 'Visible only to you',
    entries: [
      'Check Section 14.2 regarding indemnification carve-outs for gross negligence under Sections 23 & 73 Indian Contract Act. Prepare clause comparison sheet for Bombay High Court jurisdiction compatibility.',
      'Confirm signatory authorization threshold per Ministry of Corporate Affairs (MCA21) registry lookup.',
    ],
    add: 'Add AI Action Plan and brief in Notes',
  },

  enter: 'Enter Consultation',
};

// ─────────────────────────────────────────────────────────────────────────────
// Consultation room (design/167).
//
// ⚠ design/167 introduces a THIRD reference format for the same matter:
// "Matter #2024-CH-882" here, against "Ref #2024-88C" (design/163) and
// "Docket #2024-88C" (design/166). Kept as drawn.
//
// ⚠ design/167 also overflows its own time row — "IST" and "min" each wrap to a
// second line inside cells that are wide enough for neither. Laid out to fit here.
//
// The countdown runs. Everything else is static; View All, both Review chips,
// Edit and Save are inert.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_ROOM = {
  title: 'Consultation Room',
  client: {
    initials: 'AD',
    name: 'Ananya Deshmukh',
    company: 'Managing Director, Finova Tech India Pvt. Ltd.',
    modeChip: 'Video Call',
  },
  when: 'Today, 4:00 PM – 4:45 PM IST',
  duration: '45 min',

  readyLabel: 'SESSION READY',
  /** 05:41 in design/167; counts down. */
  countdownSeconds: 5 * 60 + 41,
  countdownNote: 'until admittance window',
  encrypted: 'End-to-End Encrypted Room Active',
  cleared: '2/2 Pre-Cleared',

  summaryLabel: 'CASE SUMMARY',
  matterRef: 'Matter #2024-CH-882',
  matter: 'Cross-Border IP Licensing & Exclusive Jurisdiction Structuring',
  summary:
    'Advisory review of cross-border software IP assignment and licensing agreement between Finova Tech India and international counterpart. Focus on Bombay High Court / Indian jurisdiction clauses and indemnification exposure.',
  tags: [
    { label: 'Corporate & Commercial IP', tone: 'plain' as const },
    { label: 'Indian Contract Act, 1872', tone: 'plain' as const },
    { label: 'High Priority', tone: 'priority' as const },
  ],

  documentsLink: 'View All',
  documents: [
    { id: 'ip', name: 'IP_Licensing_Draft_v3.2.pdf', meta: 'PDF • 1.8 MB • Client Added' },
    {
      id: 'juris',
      name: 'Jurisdiction_Summary_Addendum.pdf',
      meta: 'PDF • 640 KB • Counsel Memo',
    },
  ],

  notesLabel: 'PRIVATE NOTES',
  notesPrivacy: 'Visible only to you',
  note:
    'Prioritize review of clause 14.2 liability cap compatibility with Indian Contract Act (Sections 23 & 73). Verify indemnity carveouts regarding third-party claims.',
  start: 'Start Consultation Now',
};

// ─────────────────────────────────────────────────────────────────────────────
// Consultation chat (designs 168, 169, 172).
//
// ⚠ design/168 clips the matter chip to a single letter — the folder chip reads
// "M" because the Private Notes chip overlaps it. The full label is not drawn
// anywhere, so ADV_CHAT.matterChip below is an INFERENCE from the matter name.
//
// ⚠ design/168 also wraps the client's company onto two lines inside a header cell
// that is too narrow for it ("Finova Tech / India").
//
// ⚠ design/172's three note cards are the SAME note repeated three times, with the
// same timestamp (10 Sep 2026 11:15 AM) and the same body, and the body misspells
// "Indian" as "indian". Kept as drawn.
// ─────────────────────────────────────────────────────────────────────────────

export type AdvChatMessage =
  | {
      id: string;
      from: 'client';
      sender?: string;
      text: string;
      time: string;
      file?: { name: string; meta: string };
    }
  | {
      id: string;
      from: 'advocate';
      /** Paragraphs; a {term} span renders as an emphasised legal term. */
      paragraphs: string[];
      time: string;
    };

export const ADV_CHAT = {
  client: {
    initials: 'AD',
    name: 'Ananya Deshmukh',
    company: 'Finova Tech India',
  },
  encrypted: 'Encrypted',
  timer: '18:40',
  /** Inferred — design/168 clips this chip to "M". */
  matterChip: 'Matter',
  notesChip: 'Private Notes',
  notesCount: 2,
  aiChip: 'Chat with AI',
  context: 'Privileged Legal Consultation • Mumbai, MH',

  messages: [
    {
      id: 'm1',
      from: 'client' as const,
      sender: 'Ananya Deshmukh',
      text: 'Good afternoon. Regarding Clause 14.2 of the master agreement, our board is concerned about the unlimited indemnity carveout for indirect damages. How does this conflict with Section 73 of the Indian Contract Act?',
      time: '16:08',
    },
    {
      id: 'm2',
      from: 'advocate' as const,
      paragraphs: [
        'Good afternoon Ananya. Under {Section 73 of the Indian Contract Act, 1872,} compensation is not granted for remote or indirect loss. Any clause attempting to contract out of willful breach or statutory tort is strictly scrutinized.',
        'We can cap consequential damages effectively if structured with clear liquidated damages under Section 74.',
      ],
      time: '16:09',
    },
    {
      id: 'm3',
      from: 'client' as const,
      text: 'Understood. If we cap gross negligence liability at 2x annual contract value, would Bombay High Court Commercial Division uphold that?',
      time: '16:11',
    },
    {
      id: 'm4',
      from: 'advocate' as const,
      paragraphs: [
        'Under Indian commercial jurisprudence, caps on gross negligence are unenforceable.',
        'Instead, we can structure a {liquidated damages schedule} with DIAC or MCIA arbitration seated in Mumbai. I have noted this directly into your active memorandum.',
      ],
      time: '16:13',
    },
    {
      id: 'm5',
      from: 'client' as const,
      text: 'Attached the revised markup from opposing counsel for quick verification:',
      file: { name: 'Clause_14_Markup_v4.pdf', meta: '420 KB • Redlined Draft' },
      time: '16:14',
    },
  ] as AdvChatMessage[],

  typing: 'Ananya is reviewing draft notes',
  placeholder: 'Type legal advice or cite section...',

  notesPanel: {
    title: 'Private Note',
    privacy: 'Only visible to you',
    add: 'Add Note',
    /** design/172 repeats one note three times, misspelling "Indian". Kept as drawn. */
    entries: [
      {
        id: 'n1',
        at: '10 Sep 2026 11:15 AM',
        body: 'Prioritize review of clause 14.2 liability cap compatibility with indian Contract Act (Section 23 & 73).',
      },
      {
        id: 'n2',
        at: '10 Sep 2026 11:15 AM',
        body: 'Prioritize review of clause 14.2 liability cap compatibility with indian Contract Act (Section 23 & 73).',
      },
      {
        id: 'n3',
        at: '10 Sep 2026 11:15 AM',
        body: 'Prioritize review of clause 14.2 liability cap compatibility with indian Contract Act (Section 23 & 73).',
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Legalitt AI (designs 170, 171).
//
// ⚠ NOTHING HERE IS GENERATED. The response below is a static string copied from
// design/170. Typing appends the advocate's own message and no reply is produced —
// there is no model provider, no document ingestion and no retrieval. See the AI
// scope note above ADV_AI_REFRESH.
//
// ⚠ The header sub-line reads "Legal Intelligence Engineered for an Advocates"
// (sic) — "an Advocates" is ungrammatical; it wants "Advocates" or "an Advocate".
// Kept as drawn.
//
// ⚠ The greeting addresses "Adv. Rahul", but the signed-in advocate is Abhishek
// Chouhan (design/148, ADVOCATE_SELF). Kept as drawn and flagged.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_AI_CHAT = {
  title: 'Legalitt AI',
  subtitle: 'Legal Intelligence Engineered for an Advocates',
  greeting: 'Good evening, Adv. Rahul',
  greetingSub: 'How can Legalitt AI help you today?',
  upload: {
    title: 'Explain this document',
    sub: 'Tap to upload PDF, contract, or notice',
  },
  question: {
    sender: 'Ananya Deshmukh',
    initials: 'AD',
    text: 'Good afternoon. Regarding Clause 14.2 of the master agreement, our board is concerned about the unlimited indemnity carveout for indirect damages. How does this conflict with Section 73 of the Indian Contract Act?',
    time: '16:08',
  },
  answer: {
    label: 'Legalitt AI:',
    text: 'Section 73 generally allows compensation for loss that naturally arises from a breach of contract or that the parties could reasonably have expected when entering the contract. It also excludes remote or indirect losses.',
    copy: 'Copy',
  },
  placeholder: 'Ask Legalitt AI...',
  disclaimer:
    'Legalitt AI provides general information and does not replace advice from a qualified advocate.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Video consultation (designs 173, 174, 177, 178, 182).
//
// ⚠ STATIC MOCK-UP. There is no calling SDK, no camera and no media of any kind.
// Every "feed" is a neutral block drawn at the size of the frame in the design,
// using vkycDark.feed.
//
// ⚠ This flow is MORE DEMANDING than the client-side sessions. Beyond a calling
// vendor it needs: a waiting room, pause/resume with phone-call time EXCLUDED from
// the billed duration, identity-verification overlays, in-call note taking, and an
// in-call AI copilot. Each of those is a vendor capability or a state machine, not
// a layout. See the scope note above ADV_AI_REFRESH for the AI side.
//
// ⚠ design/173 clips two strings behind the controls that overlap them: the client's
// location line ("Finova Tech India • Nariman P…") and the matter name
// ("Cross-Border IP Lic…"). The third suggestion chip in the copilot panel is also
// clipped ("What should I as…"); ADV_COPILOT.suggestions infers it.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_VIDEO = {
  encrypted: 'ENCRYPTED',
  /** 28:13 in design/173; counts down. */
  remainingSeconds: 28 * 60 + 13,
  remainingSuffix: 'rem.',
  client: {
    initials: 'AD',
    name: 'Ananya Deshmukh',
    company: 'Finova Tech India',
    location: 'Nariman Point, Mumbai',
  },
  modes: ['Video', 'Voice'],
  matterLabel: 'Matter #',
  matter: 'Cross-Border IP Licensing',
  noteChip: 'Note',
  attachmentCount: 2,
  connection: 'HD 1080p • 24ms',
  selfLabel: 'You (Advocate)',
  verified: 'Identity Verified',
  speaking: 'Ananya Deshmukh • Speaking',
  note:
    'Prioritize review of clause 14.2 liability cap compatibility with Indian Contract Act (Sections 23 & 73). Verify indemnity carveouts regarding third-party claims.',
  notesEdit: 'Edit',
};

/** designs 178 and 182 — the in-call Legal AI copilot. Static; nothing is generated. */
export const ADV_COPILOT = {
  title: 'Legal AI',
  chip: 'CONSULTATION COPILOT',
  sub: 'Help during this consultation',
  /** design/182 clips the third chip to "What should I as…". Inferred. */
  suggestions: ['Summarize this case', 'Main legal issues', 'What should I ask next?'],
  greeting: 'How can I help with this consultation?',
  question: 'How does Section 73 apply to this issue?',
  answer:
    'Section 73 generally deals with compensation for loss caused by breach of contract. Review the exact contract wording and the nature of the claimed loss before reaching a conclusion.',
  source: 'Source: Contract.pdf • Page 12',
  viewSource: 'View Source',
  copy: 'Copy',
  saveToMemo: 'Save to Memo',
  placeholder: 'Ask Legal AI...',
  disclaimer: 'AI-generated information. Verify important details before relying on it.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Consultation paused (design/175).
//
// ⚠ This screen states a billing rule the prototype cannot enforce: the
// consultation timer is HELD at 18:42 while a separate phone-call timer runs at
// 03:17, "Excluded from consultation". Honouring that needs a server-side session
// clock that can be paused, a record of what caused each pause, and a disbursement
// rule that reads it. None of that is UI.
//
// The waiting room it describes is likewise a vendor capability.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_PAUSED = {
  chip: 'Consultation Paused',
  sessionId: 'Session ID: ADV-2026-8841',
  title: 'Consultation Paused',
  body: 'Your previous consultation is held in a protected state and is ready to continue.',
  client: {
    initials: 'AD',
    name: 'Ananya Deshmukh',
    roleChip: 'Client',
    statusChip: 'Paused',
    service: 'Legal Advice • Video Consultation',
  },
  matterLabel: 'MATTER REFERENCE',
  matter: 'Cross-Border IP Licensing & Software Contract',
  cells: [
    {
      icon: 'clock' as const,
      label: 'Consultation Time',
      value: '18:42',
      state: 'PAUSED',
      note: 'Preserved exact elapsed duration',
      excluded: false,
    },
    {
      icon: 'phone' as const,
      label: 'Phone Call Taken',
      value: '03:17',
      state: 'ELAPSED',
      note: 'Excluded from consultation',
      excluded: true,
    },
  ],
  waiting: {
    title: 'Client is in the Waiting Room',
    body: 'Ananya Deshmukh was notified that you were temporarily disconnected. Your consultation time is paused during your external phone call.',
  },
  prompt: 'WHAT WOULD YOU LIKE TO DO?',
  options: [
    {
      id: 'resume',
      title: 'Resume Consultation',
      meta: 'Resumes at 18:42',
      body: 'Continue the consultation immediately from where you stopped. Client camera and audio will reconnect.',
      action: 'Resume Consultation',
      tone: 'brand' as const,
    },
    {
      id: 'reschedule',
      title: 'Reschedule Consultation',
      meta: 'Propose New Slot',
      body: 'Choose a new date and time with the client via the existing Alternative Time proposal chamber.',
      action: 'Reschedule Consultation',
      tone: 'light' as const,
    },
  ],
  footnote: 'Timer does not count phone call duration.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Reschedule the call (design/176).
//
// design/176 is design/165 with three changes, and nothing else differs.
//
// ⚠ design/176 clips its third suggestion chip to "+ Earliest openin…". The full
// label is drawn nowhere, so the entry below is an INFERENCE.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_RESCHEDULE = {
  title: 'Reschedule the call',
  messageChips: ['+ Court commitment', '+ Reviewing filings', '+ Earliest opening'],
};

// ─────────────────────────────────────────────────────────────────────────────
// End Consultation confirmation (design/179).
//
// ⚠ The figures are static. "16m 48s of 45:00 scheduled" and the pro-rata
// disbursement imply a billed session clock and an escrow release rule that the
// prototype has neither of — see the pause/exclusion note above ADV_PAUSED.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_END = {
  sessionChip: 'Session #88C',
  title: 'End Consultation?',
  body: [
    'Are you sure you want to end this consultation?',
    'Your consultation summary, encrypted transcript, and billable docket notes will be automatically saved to your vault.',
  ],
  summary: {
    clientLabel: 'Client',
    client: 'Ananya Deshmukh',
    matterLabel: 'Legal Matter',
    matter: 'Cross-Border IP Licensing & Mumbai Jurisdiction Structuring',
    matterRef: 'Matter #2024-88C',
    cells: [
      { label: 'Time', value: '16m 48s', note: 'of 45:00 scheduled' },
      { label: 'Disbursement', value: 'Pro-Rata', note: 'Via Chamber Escrow' },
    ],
    footnote: 'Escrow payout calculated pro-rata per Legalitt Chamber protocol in ₹ (INR).',
  },
  confirm: 'End Consultation',
  cancel: 'Continue Consultation',
};

// ─────────────────────────────────────────────────────────────────────────────
// Docket record (design/180).
//
// ⚠ design/180 is a 333×1024 JPEG screenshot — 0.823 px/pt, LESS THAN ONE PIXEL
// PER POINT. Every metric on this screen is read from a frame smaller than the
// layout it describes, so the sizing is the loosest in the project. Shared values
// are reused from neighbouring screens wherever the design does not contradict them.
//
// ⚠ THREE DISBURSEMENT FIGURES FOR ONE JOURNEY:
//     design/164  net ₹25,650  (28,500 gross − 10%)
//     design/180  "DISBURSEMENT ₹26,000"
//     design/181  net ₹28,800  (32,000 gross − 10%)
// None of the three agrees with either other, and only 164 and 181 are internally
// derivable from a rate. ₹26,000 is a bare figure with no fee behind it, so it is
// stored as drawn and NOT computed.
//
// ⚠ The notes box claims "382 chars" but the drawn text is 175 characters and stops
// mid-sentence ("…limit liability for gross"). The rest of the note is not in the
// design, so the box scrolls over exactly what is drawn and the counter reports the
// real length. Both figures are surfaced below.
//
// ⚠ "AI RECOMMENDED NEXT STEPS" is labelled "3 Action Items" but draws two, and the
// second stops mid-phrase ("…Registrar of"). Kept as drawn.
//
// ⚠ The formatting toolbar (B / I / list) and "Dictate" imply a rich-text editor
// with speech input. Neither is specified anywhere, and both are inert.
// ─────────────────────────────────────────────────────────────────────────────

/** Exactly what design/180 draws in the notes box; it stops mid-sentence. */
const ADV_DOCKET_NOTE =
  'Advised client regarding Clause 14.2 indemnification carveouts. Under Section 23 & 73 of the Indian Contract Act, 1872, clauses purporting to exclude or limit liability for gross';

export const ADV_DOCKET = {
  label: 'DOCKET RECORD',
  matterRef: 'Matter #2024-88C',
  autosaved: 'Auto-saved 16:49',
  concluded: 'Consultation Successfully Concluded',
  verifiedChip: 'Verified Session',
  client: {
    initials: 'AD',
    name: 'Ananya Deshmukh',
    title: 'Managing Director · Finova',
  },
  disbursementLabel: 'DISBURSEMENT',
  /** Drawn as a bare figure with no fee behind it; see the note above. */
  disbursement: 26000,
  briefLabel: 'BRIEF DESCRIPTION',
  matter: 'Cross-Border IP Licensing & Exclusive Jurisdiction Structuring',
  date: { label: 'Date', value: '24 Sep 2026' },
  billable: { label: 'Billable Time', value: '42m', unit: '/ 45m' },
  channel: { label: 'Channel', value: 'Chamber' },

  notesLabel: 'ADVOCATE NOTES (PRIVILEGED)',
  dictate: 'Dictate',
  citeChip: '+ Cite Indian Contract Act (1872)',
  note: ADV_DOCKET_NOTE,
  notesFooter: 'Encrypted with Chamber 256-bit HSM',
  /** design/180 prints "382 chars"; the drawn text is this long. Both are reported. */
  notesDrawnCount: '382 chars',
  notesActualCount: ADV_DOCKET_NOTE.length,

  keyPointsLabel: 'KEY POINTS DISCUSSED',
  keyPointsMeta: 'Shared in Client Brief',
  keyPoints: [
    'Enforceability of 2x contract value liability cap under Bombay High Court (Commercial Division) precedent.',
  ],

  stepsLabel: 'AI RECOMMENDED NEXT STEPS',
  /** Labelled 3; design/180 draws 2, the second cut mid-phrase. */
  stepsMeta: '3 Action Items',
  steps: [
    'Circulate revised markup of Annex B with tailored gross-negligence exclusions.',
    'Request certified extract from Registrar of',
  ],

  document: { name: 'Matter_2024-88C_Draft_AnnexB.pdf', meta: '1.4 MB · Logged in Chamber Vault' },
  continue: 'Continue',
  exportPdf: 'Export Client PDF',
};

// ─────────────────────────────────────────────────────────────────────────────
// Consultation completed (design/181).
//
// ⚠ DIFFERENT CLIENT, SAME JOURNEY. Every other screen in this flow has the client
// as Ananya Deshmukh, Managing Director of Finova Tech India, on a cross-border IP
// licensing matter. design/181 names RAHUL SHARMA, Founder & CEO of NexaCorp
// Technologies India Pvt Ltd, on "Series A Term Sheet & Founder Vesting Agreements",
// under a different docket (#2024-91D against #2024-88C). It reads as a screen drawn
// for a different scenario. Built exactly as drawn and flagged.
//
// ⚠ Its "Advocate Guild Platform Retainer (10%)" is the 10% side of the commission
// conflict; see ADV_COMMISSION_10. The figures compute from the rate constant.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_COMPLETED = {
  title: 'Consultation Completed',
  body: 'Your legal advisory session with Rahul Sharma has concluded and verified.',
  docketChip: 'DOCKET #2024-91D • ESCROW RELEASED',
  client: {
    initials: 'RS',
    name: 'Rahul Sharma',
    verifiedChip: 'VERIFIED',
    title: 'Founder & CEO, NexaCorp Technologies India Pvt Ltd',
  },
  matterLabel: 'RETAINED LEGAL MATTER',
  matter: 'Series A Term Sheet & Founder Vesting Agreements',
  cells: [
    { label: 'Session Date', value: 'Today, Sep 24' },
    { label: 'Duration', value: '45m (Billed)' },
    { label: 'Chamber', value: 'Encrypted P2P' },
  ],
  settlementLabel: 'FINANCIAL SETTLEMENT',
  escrowChip: 'Escrow Cleared',
  feeLabel: 'Consultation Fee (45 mins)',
  grossFee: 32000,
  netLabel: 'NET DISBURSEMENT',
  netNote: 'NEFT/RTGS Direct Deposit Initiated',
  back: 'Back To Home',
};

// ═════════════════════════════════════════════════════════════════════════════
// ADVOCATE-SIDE LEGAL NOTICE RESPONSE (designs 183-203).
//
// ⚠ SEVENTH AI SURFACE. designs 186, 187 and 188 add AI document summarisation,
// AI draft generation and an AI edit assistant. All static, as always. With the
// five from the Legal Advice batch and the in-call copilot, that is SEVEN AI
// surfaces in the product, every one of them mock content. The scope question is
// unchanged: model provider, document ingestion and OCR, citation grounding, and a
// position on accuracy and liability — now across seven places.
//
// ⚠ PHYSICAL LOGISTICS. designs 193-202 describe courier booking, waybills, pickup
// scheduling and delivery tracking, naming BLUE DART on one screen and DHL EXPRESS
// on another (design/200, waybill DHL-8942-0194). That is a shipping-vendor
// integration — a fourth external dependency alongside the AI provider, the calling
// vendor and the server-side billing clock. Nothing of it is built beyond the
// screens.
//
// ⚠ PAYOUT CONTRADICTION. design/185 computes ₹3,500 − ₹350 − ₹63 = ₹3,087 net.
// design/203 then states "Advocate Payout ₹3,500" — the gross, on the same journey.
// ₹413 apart. Both are recorded below; the UI computes from the breakdown.
//
// ⚠ design/196 charges ₹250 service fee + ₹40 labelled "Goods & Services Tax
// (GST 18%)" = ₹290. 18% of 250 is ₹45, not ₹40. Either the figure or the label is
// wrong. It also misspells "Represantative". Built as drawn when that screen lands.
//
// ⚠ UNFINISHED DESIGNS. designs 195, 199, 201 and 202 contain literal bracketed
// placeholders ([Client Name], [Document Name], [Courier Name], [Waybill Number],
// [Amount], [Pickup Address], [Receiver Name], [Receiver Address],
// [Document Count]). They will be rendered WITH the brackets intact so the gaps
// stay visible, and every one listed in that batch's report.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * design/185's breakdown, derived rather than hardcoded.
 *
 * ⚠ The ₹63 "Applicable Charges (GST & Gateway)" is not a rate design/185 states.
 * It is exactly 18% of the ₹350 platform fee (350 × 0.18 = 63), so that is the
 * derivation used here. The alternative reading — 1.8% of the client fee — gives the
 * same ₹63 on this one figure but diverges on any other. INFERENCE, flagged.
 */
export const ADV_NOTICE_GST_ON_PLATFORM_FEE = 0.18;

export function advNoticeFee(clientFee: number) {
  const platformFee = Math.round(clientFee * ADV_COMMISSION_10.platformRate);
  const charges = Math.round(platformFee * ADV_NOTICE_GST_ON_PLATFORM_FEE);
  return { clientFee, platformFee, charges, net: clientFee - platformFee - charges };
}

export const ADV_NOTICE = {
  id: 'ln-2026-1048',
  ref: 'LN-2026-1048',
  refLabel: 'Ref: LN-2026-1048',
  docket: 'DOCKET LN-2026-1048',
  typeChip: 'LEGAL NOTICE',
  verifiedChip: 'Client Verified',
  client: { name: 'Rahul Sharma', initials: 'RS' },
  matter: 'Matter: Payment Dispute',
  /** design/190. */
  against: 'Verma Enterprises',
  filingType: 'Statutory Demand',
  slot: { label: 'Consultation Slot', date: '24 Sep 2026', time: '5:30 PM' },
  clientFee: 3500,
  escrowNote: 'paid in escrow',
  payout: {
    chip: 'Pending Acceptance',
    method: { label: 'Payout Method', value: 'Bank ••••4821' },
    window: { label: 'Disbursement Window', value: 'Released after settlement' },
    notes: [
      'Client payment is securely pre-authorized in Legalitt Escrow. Transfer occurs automatically upon matter completion.',
      'Platform fees and applicable charges are deducted before your net earnings are paid out. Breakdown percentages are configured according to your advocate chamber agreement.',
    ],
  },
  /** design/203 states this gross figure against design/185's ₹3,087 net. */
  reportedPayout: 3500,
};

export const ADV_NOTICE_DOCS = {
  summaryTitle: '4 Documents • 24 Pages',
  summarySub: 'AI has reviewed all uploaded pages.',
  statusChip: 'Completed',
  aiTitle: 'AI Document Summary',
  aiChip: 'All Pages (24/24)',
  aiSub: 'Important information from all uploaded documents.',
  aiFindings: [
    'Payment Agreement (Clause 4.2): Terms specify payment within 15 days of invoice date. 18% p.a. interest applies on default.',
    'Invoice #VE-2026-89: Issued 15 Aug 2026 for ₹2,85,000 for deliverables across milestones 1 through 4.',
  ],
  viewFull: 'View Full Summary',
  viewSource: 'View Source',
  filesLabel: 'UPLOADED FILES',
  /**
   * ⚠ design/186 prints "4 Files Attached" and its header reads "4 Documents",
   * but it draws FIVE file rows. Both the count and the rows are kept as drawn.
   */
  filesCountLabel: '4 Files Attached',
  files: [
    { id: 'agreement', name: 'Payment_Agreement.pdf', meta: '12 pages • 1.8 MB' },
    { id: 'invoice', name: 'Invoice_Record.pdf', meta: '8 pages • 920 KB' },
    { id: 'previous', name: 'Previous_Notice.pdf', meta: '4 pages • 640 KB' },
    { id: 'proof', name: 'Payment_Proof.pdf', meta: '2 pages • 320 KB' },
    { id: 'noticee', name: 'Noticee Detail', meta: '1 pages • 320 KB' },
  ],
  additionalLabel: 'Additional Documents ?',
  additionalPlaceholder: 'Type.....',
  send: 'Send',
};

/**
 * Records for designs 187-203 land with the screens that draw them, so that nothing
 * here is invented ahead of being read off an export. Verified so far:
 *   design/187  drafting methods — "AI Generate Draft" (Instant, RECOMMENDED)
 *   design/190  review progress — Draft Prepared → Draft Sent to Client → Client Review
 *   design/193  dispatch — Legal_Notice_Final.pdf, 4 pages, signed by client;
 *               notice to Amit Verma, Flat 402, Green Park Apartments, Sector 18,
 *               Rohini, New Delhi 110085
 *   design/200  courier DHL Express, waybill DHL-8942-0194, to Advocate Sarah Jenkins
 *
 * ⚠ design/190 names the opposing party "Verma Enterprises" (a company) while
 * design/193 addresses the notice to "Amit Verma" (a person). Related but not the
 * same entity; neither screen reconciles them.
 */
export const ADV_NOTICE_PENDING_RECORDS = true;

// ─────────────────────────────────────────────────────────────────────────────
// Choose drafting method (design/187).
//
// ⚠ SEVENTH AI SURFACE, second of three in this flow. "AI Generate Draft" promises
// a draft "synthesized automatically from client records, uploaded annexures, and
// statutory citations" in "~8 seconds". Nothing is synthesised: picking it leads to
// design/188's draft, whose content is a static string.
//
// ⚠ design/187 draws ONLY the AI variant of the primary button ("Continue with AI
// Generation"). The manual label is not drawn anywhere, so the screen derives it
// from the selection rather than inventing a second drawn state.
//
// ⚠ No separate manual builder is designed. Selecting "Create Draft Manually" leads
// to the same design/188 editor, because there is nothing else to lead to.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_NOTICE_DRAFTING = {
  title: 'Create Legal Notice Draft',
  /** design/187 clips this behind the avatar ("…pose how you want to prepare your dra"). */
  sub: 'Choose how you want to prepare your draft.',
  docket: 'DOCKET LN-2026-1048',
  heroLabel: 'Secured Workflow',
  heading: 'Choose Drafting Method',
  headingSub: 'Select how you want to compile and format this document.',
  methods: [
    {
      id: 'ai' as const,
      badge: 'RECOMMENDED',
      title: 'AI Generate Draft',
      chip: 'Instant',
      body: 'Draft synthesized automatically from client records, uploaded annexures, and statutory citations.',
      footnote: 'Populates template in ~8 seconds with full edit control',
      /** design/187 draws only this label. */
      action: 'Continue with AI Generation',
    },
    {
      id: 'manual' as const,
      badge: 'STANDARD BUILDER',
      title: 'Create Draft Manually',
      body: 'Write and format the Legal Notice paragraph-by-paragraph using the structured Legalitt standard framework.',
      footnote: 'Blank clause template with legal clause suggestions',
      /** NOT DRAWN — derived from the selection. See the note above. */
      action: 'Continue with Manual Draft',
    },
  ],
  confidentiality:
    "Drafts remain strictly confidential within your firm's encrypted workspace.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Draft legal notice (design/188).
//
// ⚠ SEVENTH AI SURFACE, third of three in this flow. The six sections below are
// STATIC STRINGS. Nothing was generated from the uploaded documents, and the
// "Legalitt AI" card at the foot — the edit assistant — does nothing: typing into
// it and pressing a suggestion chip change no text.
//
// ⚠ "Step 3 of 5" is a SIXTH STEPPER IDIOM. It is a bare text label inside no other
// counter: no dots, no bar, no numbered track, and nothing else in the notice flow
// shows a step count at all, so there is no way to tell which five steps it means.
//
// ⚠ design/188 names the advocate "Adv. Abhishek Sahu", where design/148 and
// ADVOCATE_SELF have "Abhishek Chouhan". Second surname for the same advocate.
//
// ⚠ design/188 misspells its own suggestion chip as "Fix Grammer". Kept as drawn.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_NOTICE_DRAFT = {
  title: 'Draft Legal Notice',
  /** ⚠ Sixth stepper idiom; see the note above. */
  step: 'Step 3 of 5 • Document Editor',
  statusChip: 'Draft',
  parties: { client: 'Rahul Sharma', opponent: 'Amit Verma' },
  assistChip: 'AI Assist',
  sections: [
    {
      n: 1,
      title: 'Sender Details',
      body: 'Adv. Abhishek Sahu, High Court Bar, Indore, MP (on behalf of Rahul Sharma)',
    },
    {
      n: 2,
      title: 'Recipient Details',
      body: 'Amit Verma, Proprietor, Verma Enterprises, Commercial Enclave, Indore',
    },
    {
      n: 3,
      title: 'Subject',
      body: 'LEGAL NOTICE FOR RECOVERY OF OUTSTANDING DUES OF ₹2,85,000',
    },
    {
      n: 4,
      title: 'Background & Facts',
      body: 'That my client entered into an agreement dated 10 May 2026 with you for deployment of customized enterprise IT infrastructure. The work was completed satisfactorily on 28 July 2026. An invoice numbered VE-2026-89 for ₹2,85,000 was duly raised on 15 August 2026.',
    },
    {
      n: 5,
      title: 'Legal Demand',
      body: 'You are hereby called upon to pay the outstanding sum of ₹2,85,000 along with interest at 18% per annum from 15 Aug 2026 within fifteen (15) days of receipt of this notice.',
    },
    {
      n: 6,
      title: 'Response Time & Closing',
      body: 'Failing compliance, legal proceedings under civil and applicable statutes will be instituted at your sole risk and cost.',
    },
  ],
  ai: {
    chip: 'Legalitt AI',
    title: 'What would you like to change?',
    sub: 'Tell AI what you want to modify in the draft.',
    placeholder: 'e.g Make this more formal or change the response time to 15 days...',
    /** ⚠ design/188 spells the second chip "Grammer". Kept as drawn. */
    suggestions: ['Make more Formal', 'Fix Grammer'],
  },
  generate: 'Generate Draft',
};

// ─────────────────────────────────────────────────────────────────────────────
// Legal notice response — the rendered document (design/189).
//
// ⚠ THE DOCUMENT IS A BLANK FORM. design/188 has just produced a fully drafted
// notice — sender, recipient, subject, facts, demand and closing, all written out.
// design/189 then renders a template with EMPTY BLANKS for every one of those
// fields. The draft content does not carry forward into the artefact the flow
// exists to produce. Built as drawn; this is the single largest gap in the flow.
//
// ⚠ THIRD ADVOCATE NAME. The letterhead reads "GURNEET CHAWLA ADVOCATE", against
// "Abhishek Chouhan" (design/148, ADVOCATE_SELF) and "Adv. Abhishek Sahu"
// (design/188). Three names for the advocate across one product.
//
// ⚠ The letterhead firm is "INT LegalConsultants Pvt. Ltd." and the sign-off
// "INT LegalConsultant Pvt. Ltd." — singular against plural, same document.
//
// ⚠ design/189 misspells "Reffrence Id" and writes "has been preserve in my office".
// Both kept as drawn.
//
// ⚠ At the drawn scale the body runs at roughly 7pt on a 390pt screen, which is
// below legible size on a device. Reproduced at the drawn proportions because it is
// a document preview, but a real implementation needs a zoomable document view.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_NOTICE_RESPONSE = {
  title: 'Legal Notice Response',
  heading: 'Prepare Response',
  statusChip: 'No Response Required',
  toolbar: { block: 'Paragraph' },
  letterhead: {
    brand: 'Legalitt',
    firm: 'INT LegalConsultants Pvt. Ltd.',
    email: 'Intlegalconsultantspvtltd@gmail.com',
    web: 'www.legalitt.com',
    advocate: 'GURNEET CHAWLA ADVOCATE',
    quals: '(BBA, LLB, LLM)',
    enrolment: 'Enrollment No :-',
    enrolmentNo: '821/2017',
  },
  docTitle: 'LEGAL NOTICE',
  /** ⚠ "Reffrence" as drawn. */
  refLabel: 'Reffrence Id',
  refSuffix: '/20',
  dateLabel: 'Date:',
  toLabel: 'To,',
  toLines: 3,
  subjectLabel: 'Subject:',
  intro: [
    'Under instructions and authority from my client Mr. ',
    ' S/o Shri ',
    ',Age',
    ' R/o ',
    ', I hereby serve upon you this Legal Notice as under:',
  ],
  clauses: 5,
  thereforeLine: 'Therefore, Through this Legal Notice, I call upon you to:',
  thereforeItems: ['A.', 'B.'],
  failing: {
    lead: 'Failing which, my client shall be constrained to initiate appropriate ',
    boldA: 'civil proceedings and',
    mid: ' also lodge a ',
    boldB: 'criminal complaint / FIR',
    tail: ' against you before the police authorities for the offences of',
    further: ' Further you are hereby called to pay ',
    cost: ' as the cost of this legal notice.',
  },
  /** ⚠ "has been preserve" as drawn. */
  copyLine: 'A copy of this Notice has been preserve in my office for record and future reference.',
  signFor: 'For',
  signFirm: 'INT LegalConsultant Pvt. Ltd.',
  placeLabel: 'Place :',
  signDateLabel: 'Date :',
  disclaimer:
    'Disclaimer : This legal notice has been generated through an automated document preparation platform based solely on the information, statements, and instructions provided by the user. The platform utilizes technology-assisted drafting tools to facilitate document creation and does not independently verify the accuracy, completeness, authenticity, or legal sufficiency of any information supplied by the user.',
  editDraft: 'Edit Draft',
  saveUpload: 'Save & Upload',
  shareReview: 'Share for Review',
};

// ─────────────────────────────────────────────────────────────────────────────
// Client review (designs 190 and 191) — one screen, two states.
//
// design/191 is identical to design/190 above the awaiting card. It differs in
// exactly two ways: the "Client Approved" outcome row is REMOVED, and the "Changes
// Requested" row gains a note box. Both are driven by the state below.
//
// ⚠ design/190 clips its own filename to "Legal_Notice_Rahul_Sharm" — no extension
// and the last letter of the surname missing. Kept as drawn.
//
// ⚠ design/191's note box reads "Client Suggestion recieve here." — "recieve" is
// misspelled and the sentence is ungrammatical. It also reads as placeholder copy
// rather than a real client note, but it carries no brackets, so it is kept as drawn
// rather than treated as one of the bracketed placeholders.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_NOTICE_REVIEW = {
  title: 'Client Review',
  stateChip: 'AWAITING CLIENT REVIEW',
  heading: 'Draft Sent for Review',
  body: 'The Legal Notice draft has been sent to the client for review.',
  typeChip: 'Legal Notice',
  ref: 'LN-2026-1048',
  cells: [
    { label: 'CLIENT', value: 'Rahul Sharma', verified: true },
    { label: 'AGAINST', value: 'Verma Enterprises' },
    { label: 'FILING TYPE', value: 'Statutory Demand' },
    { label: 'STATUS', value: 'In Client Queue', dot: true },
  ],
  progressLabel: 'REVIEW PROGRESS',
  progress: [
    { title: 'Draft Prepared', status: 'Completed • Ready for dispatch', state: 'done' as const },
    { title: 'Draft Sent to Client', status: 'Completed • Delivered via App & Email', state: 'done' as const },
    {
      title: 'Client Review',
      status: 'In Progress • Waiting for client feedback',
      state: 'active' as const,
      chip: 'Active',
    },
    { title: 'Final Approval', status: 'Upcoming • Final dispatch & service', state: 'upcoming' as const },
  ],
  draftLabel: 'DRAFT SENT',
  /** ⚠ Clipped in design/190; kept as drawn. */
  draftFile: { name: 'Legal_Notice_Rahul_Sharm', size: '2.4 MB', status: 'Sent to Client' },
  viewDraft: 'View Draft',
  messageLabel: 'MESSAGE SENT TO CLIENT',
  messageMeta: 'Sent just now',
  message: '“Please review the draft and let us know if any changes are required.”',
  awaiting: {
    title: 'Awaiting Client Review',
    body: 'Once the client reviews the draft, you will receive their response here.',
    approved: 'Client Approved → Continue to Final Dispatch',
    changes: 'Changes Requested → Review Client Notes',
    /** ⚠ "recieve" as drawn (design/191). */
    note: 'Client Suggestion recieve here.',
  },
  messageClient: 'Message Client',
  backToRequest: 'Back to Request',
};

// ─────────────────────────────────────────────────────────────────────────────
// Final notice ready (design/192) and prepare for dispatch (design/193).
//
// ⚠ BLUE DART IS HARDCODED IN A CAPTION. Both screens caption their primary button
// "Takes you to Send via Blue Dart", but design/194 still offers a CHOICE between
// sending the notice yourself and using the Legalitt partner. The caption pre-empts
// a decision the next screen has not asked for yet — and design/200 then tracks the
// shipment under DHL EXPRESS, not Blue Dart. Three screens, two couriers, one of
// them promised before the choice exists.
//
// ⚠ design/193 ends with TWO PRIMARY ACTIONS and no stated relationship between
// them: "Continue to Send →" and "Confirm Dispatch". Nothing says which advances the
// flow, whether Confirm Dispatch is terminal, or what happens to the other. Built as
// drawn, with Continue to Send routing onward.
//
// ⚠ design/193's checklist draws two Done rows and two Pending rows but no
// interaction for completing them. They are made tappable here; see the screen note.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_NOTICE_RECIPIENT = {
  name: 'Amit Verma',
  address: 'Flat 402, Green Park Apartments, Sector 18, Rohini, New Delhi 110085',
};

export const ADV_NOTICE_FINAL = {
  title: 'Final Notice Ready',
  approved: {
    title: 'Client Approved',
    chip: 'Ready',
    body: 'The client has reviewed and approved this legal notice. It is ready to be sent.',
  },
  clientLabel: 'CLIENT',
  verifiedChip: 'Verified',
  clientName: 'Rahul Sharma',
  signOff: 'Client Sign-off complete • Approved today, 11:20 AM',
  sendToLabel: 'SEND NOTICE TO',
  sendToChip: 'Official Delivery Address',
  docLabel: 'LEGAL NOTICE DOCUMENT',
  docChip: 'Approved',
  doc: { name: 'Legal_Notice_Final.pdf', meta: '4 Pages • Signed by Client' },
  download: 'Download PDF',
  downloadNote: 'Download the final notice and print it separately.',
  nextStep: {
    title: 'Next Step: Send the Notice',
    body: 'Download the PDF, print the notice, and prepare it for courier.',
    note: 'Keep the postal receipt safe. You will add tracking details once the packet is posted.',
  },
  cta: 'Continue to Send',
  /** ⚠ Hardcodes a courier the next screen still lets you choose. */
  ctaCaption: 'Takes you to Send via Blue Dart',
};

export const ADV_NOTICE_DISPATCH = {
  title: 'Prepare For Dispatch',
  ready: {
    title: 'Notice Ready for Dispatch',
    chip: 'Ready',
    body: 'Follow the simple steps below to prepare your printed notice packet for courier pickup.',
  },
  docLabel: 'LEGAL NOTICE DOCUMENT',
  doc: { name: 'Legal_Notice_Final.pdf', meta: '4 Pages • Signed by Client', chip: 'Downloaded' },
  download: 'Download PDF',
  downloadNote: 'Download the final notice to your device and print it separately.',
  noticeToLabel: 'NOTICE TO',
  noticeToChip: 'Delivery Address',
  checklistLabel: 'BEFORE COURIER',
  checklistIntro: 'Check off these steps before booking courier pickup:',
  checklist: [
    { id: 'approved', title: 'Final notice approved', sub: 'Signed off by client', done: true },
    { id: 'downloaded', title: 'PDF downloaded', sub: 'Saved to device storage', done: true },
    { id: 'printed', title: 'Printed', sub: 'Print outside Legalitt on physical paper', done: false },
    {
      id: 'packed',
      title: 'Ready for courier',
      sub: 'Pack in an envelope with recipient address',
      done: false,
    },
  ],
  note: 'Legalitt does not print documents. Please print the downloaded PDF on your physical printer before the courier arrives.',
  cta: 'Continue to Send',
  /** ⚠ Same hardcoded courier as design/192; see the note above ADV_NOTICE_FINAL. */
  ctaCaption: 'Takes you to Send via Blue Dart',
  /** ⚠ Second primary action, relationship to the first unstated. */
  confirm: 'Confirm Dispatch',
};

// ─────────────────────────────────────────────────────────────────────────────
// Send documents (design/194).
//
// ⚠ FOURTH SPELLING OF THE ADVOCATE'S NAME. design/194 writes "Adv. Gurneeet
// Chawla" — three e's — against design/189's "GURNEET CHAWLA", design/188's
// "Adv. Abhishek Sahu" and design/148's "Abhishek Chouhan". Kept as drawn.
//
// ⚠ ANOTHER SERVICE AND ANOTHER REFERENCE. The chip reads "High Court
// Representation" and the matter "#HCR-2026-1048", where this same journey has been
// a Legal Notice under "LN-2026-1048" since design/185. design/196 then calls it
// "High Court Represantative" (sic) under "#LGT-849204". One matter, three service
// names and three reference formats.
//
// ⚠ The fourth document chip is CLIPPED to a sliver at the screen edge, with no
// legible text. It is tinted differently from the three grey document chips, and the
// card counts "5 Documents" against three named chips, so it is INFERRED as a "+2"
// overflow counter. It could instead be a fourth document name; nothing in the
// export decides it.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_NOTICE_SEND = {
  title: 'Send Documents',
  intro: 'Choose how you want to send your physical documents.',
  serviceChip: 'High Court Representation',
  matterRef: 'Matter #HCR-2026-1048',
  parties: 'Rahul Sharma vs Amit Verma',
  assignedLabel: 'Assigned Advocate:',
  /** ⚠ "Gurneeet" as drawn. */
  advocate: 'Adv. Gurneeet Chawla',
  docsTitle: 'Documents Ready',
  docsChip: '5 Documents',
  docsLink: 'View',
  docChips: ['Case Papers', 'Court Order', 'ID Proof'],
  /** ⚠ INFERRED from the clipped chip; see the note above. */
  docChipOverflow: '+2',
  chooseTitle: 'Choose how to send',
  chooseHint: 'Tap an option',
  options: [
    {
      id: 'self' as const,
      title: 'Send by Yourself',
      body: 'Send the documents directly to your advocate.',
      sub: 'Use any courier or delivery service.',
    },
    {
      id: 'partner' as const,
      title: 'Legalitt Delivery Partner',
      chip: 'Recommended',
      body: 'Legalitt will arrange delivery to your advocate.',
      safe: 'Safe document delivery',
    },
  ],
  sendToLabel: 'Send To',
  copy: 'Copy',
  sendTo: {
    name: 'Adv. Gurneeet Chawla',
    lines: ['Chamber No. 14, High Court Bar Building', 'Indore, Madhya Pradesh • 452001'],
  },
  note: {
    title: 'Your advocate needs the physical documents for the case.',
    body: 'You can send them yourself or use Legalitt Delivery.',
  },
  cta: 'Continue',
  ctaCaption: 'Next: Book Legalitt Delivery Partner pickup',
};

// ─────────────────────────────────────────────────────────────────────────────
// Delivery details (design/195) — UNFINISHED DESIGN.
//
// Every value below in [square brackets] is a LITERAL PLACEHOLDER drawn in the
// export. They are rendered with the brackets intact so the gaps stay visible, and
// nothing is invented to fill them.
//
// ⚠ design/195 reuses the SAME [City], [State] - [PIN] and [Mobile Number]
// placeholders for both the pickup and the receiver address, so the two blocks are
// indistinguishable in the export.
//
// ⚠ Courier reads "Blue Dart" here and on design/199, but design/200 tracks the
// shipment under DHL Express.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_NOTICE_DELIVERY = {
  title: 'Delivery Details',
  check: 'Check the delivery details before booking.',
  partner: {
    title: 'Legalitt Delivery Partner',
    chip: 'Selected',
    body: 'Your documents will be picked up and sent to the receiver.',
    poweredBy: 'Powered by Blue Dart',
    bullet: 'Direct secure legal courier',
  },
  pickup: {
    label: 'Pickup From',
    link: 'Change',
    name: '[Client Name]',
    address: '[Pickup Address]',
    cityLine: '[City], [State] - [PIN]',
    mobile: '[Mobile Number]',
  },
  sendTo: {
    label: 'Send To',
    link: 'View Address',
    name: '[Advocate Name]',
    address: '[Receiver Address]',
    cityLine: '[City], [State] - [PIN]',
    mobile: '[Mobile Number]',
  },
  documents: {
    label: 'Documents',
    chip: '[Document Count] Documents',
    rows: ['[Document Name]', '[Document Name]', '[Document Name]'],
    link: 'View Documents',
  },
  delivery: {
    label: 'Delivery',
    cells: [
      { label: 'Courier', value: 'Blue Dart' },
      { label: 'Package', value: '1' },
      { label: 'Weight', value: '[Weight]' },
      { label: 'Estimated Delivery', value: '[Date / Time]' },
    ],
  },
  fee: {
    label: 'Delivery Fee',
    amount: '[₹ Amount]',
    note: 'This is the delivery fee only. It is separate from any legal service fees.',
  },
  warning: {
    title: 'Please check both addresses before booking.',
    body: 'Your documents will be picked up from the address shown above.',
  },
  cta: 'Book Delivery',
  ctaCaption: 'Next: Shipment Created',
};

// ─────────────────────────────────────────────────────────────────────────────
// Delivery payment (design/196).
//
// ⚠ THE GST DOES NOT COMPUTE. design/196 draws a ₹250 service fee and ₹40 labelled
// "Goods & Services Tax (GST 18%)", totalling ₹290. 18% of 250 is ₹45, not ₹40 —
// which would make the total ₹295. Either the figure or the label is wrong. Drawn
// figures are used verbatim and NOT computed, so the screen matches the export.
//
// ⚠ "High Court Represantative" (sic) — misspelled, and it names a DIFFERENT SERVICE
// from the Legal Notice flow this screen sits inside. design/194 calls the same
// matter "High Court Representation"; design/185 onward call it a Legal Notice.
//
// ⚠ Ref ID "#LGT-849204" is the Legal Notice reference reused once more. It has now
// appeared on design/28, design/29, design/30, design/86 and design/196 — FIVE
// screens across three unrelated services. Kept as drawn here.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_NOTICE_PAYMENT = {
  title: 'Complete Payment',
  /** ⚠ Misspelled and a different service name; see above. */
  service: 'High Court Represantative',
  refLabel: 'Ref ID:',
  ref: '#LGT-849204',
  /** ⚠ Drawn figures, not computed — the label and the arithmetic disagree. */
  lines: [
    { label: 'Service Fee', amount: '₹250/-' },
    { label: 'Goods & Services Tax (GST 18%)', amount: '₹40/-' },
  ],
  totalLabel: 'Total Payable',
  total: '₹290/-',
  totalAmount: 290,
  totalNote: 'Inclusive of all legal taxes',
  methodsLabel: 'SELECT PAYMENT METHOD',
  methodsMeta: 'Fast & Secure',
  secureNote: 'Your payment is processed securely through our payment provider.',
  barLabel: 'Amount to pay',
  pay: 'Pay',
};

// ─────────────────────────────────────────────────────────────────────────────
// Shipment created (design/199) — UNFINISHED DESIGN.
//
// Every [bracketed] value is a literal placeholder drawn in the export, rendered
// with the brackets intact.
//
// ⚠ design/199's "Important" note is drawn in a column roughly a third of the card
// wide, so its five words wrap one or two per line. Laid out to the card width here.
//
// ⚠ FIVE STATUS STEPS here against design/200's SEVEN, for the same shipment.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_NOTICE_SHIPMENT = {
  title: 'Shipment Created',
  heading: 'Delivery Booked',
  body: 'Your documents are ready for pickup.',
  chip: 'Booking Confirmed • Pickup Scheduled',
  detailsLabel: 'Delivery Details',
  details: [
    { label: 'Courier', value: '[Courier Name]' },
    { label: 'Waybill', value: '[Waybill Number]', copy: true },
    { label: 'Pickup Date', value: '[Date]' },
  ],
  pickupLabel: 'Pickup Address',
  pickupAddress: '[Pickup Address]',
  sendToLabel: 'Send To',
  receiverName: '[Receiver Name]',
  receiverAddress: '[Receiver Address]',
  documents: { count: '[Document Count] Documents', sub: 'Packed for courier handover' },
  statusLabel: 'Delivery Status',
  /** ⚠ Five steps; design/200 draws seven for the same shipment. */
  steps: [
    { title: 'Booking Created', state: 'done' as const },
    { title: 'Pickup Pending', state: 'active' as const },
    { title: 'In Transit', state: 'upcoming' as const },
    { title: 'Delivered', state: 'upcoming' as const },
    { title: 'Received by Advocate', state: 'upcoming' as const },
  ],
  important: { title: 'Important', body: 'Keep the documents packed and ready for pickup.' },
  viewTracking: 'View Tracking',
  viewCase: 'View Case',
};

// ─────────────────────────────────────────────────────────────────────────────
// Document delivery tracking (design/200).
//
// ⚠ DHL EXPRESS here, BLUE DART on designs 195 and 199 — the same shipment under
// two couriers, and designs 192/193 promise Blue Dart before the choice is made.
//
// ⚠ SEVEN steps here against design/199's FIVE, for the same journey. design/199
// has Booking Created / Pickup Pending / In Transit / Delivered / Received by
// Advocate; design/200 inserts Pickup Booked and Out for Delivery and renames the
// last to Advocate Received. No screen reconciles the two.
//
// Dates normalised from design/200's October to September 2026, as the rest of the
// advocate flow already was.
// ─────────────────────────────────────────────────────────────────────────────

export const ADV_NOTICE_TRACKING = {
  title: 'Document Delivery',
  courierLabel: 'COURIER SERVICE',
  /** ⚠ DHL Express; designs 195 and 199 say Blue Dart. */
  courier: 'DHL Express',
  statusChip: 'Picked Up',
  waybillLabel: 'Waybill Number',
  waybill: 'DHL-8942-0194',
  sendToLabel: 'SEND TO',
  sendTo: {
    name: 'Advocate Sarah Jenkins',
    lines: ['High Court Chambers, 4th Floor', "24 St. George's Avenue, District 3"],
  },
  documents: { title: 'Documents', sub: '3 Physical Documents', link: 'View' },
  progressLabel: 'Delivery Progress',
  /** ⚠ Seven steps; design/199 draws five. */
  steps: [
    { title: 'Booking Created', meta: 'Sep 24, 09:15 AM', state: 'done' as const },
    { title: 'Pickup Booked', meta: 'Sep 24, 11:30 AM', state: 'done' as const },
    { title: 'Picked Up', meta: 'Sep 24, 02:45 PM', state: 'active' as const },
    { title: 'In Transit', meta: 'Expected Sep 25', state: 'upcoming' as const },
    { title: 'Out for Delivery', meta: 'Pending arrival', state: 'upcoming' as const },
    { title: 'Delivered', meta: 'Delivery agent drop-off', state: 'upcoming' as const },
    { title: 'Advocate Received', meta: 'Final formal receipt', state: 'upcoming' as const },
  ],
  latest: {
    label: 'LATEST UPDATE',
    at: 'Today • 02:45 PM',
    title: 'Package collected by courier',
    body: 'Shipment processed at local intake facility. En route to sorting hub.',
  },
  note: {
    title: 'Delivery and advocate receipt are different steps.',
    body: 'The advocate will confirm in the system once physical documents are in hand and reviewed.',
  },
  refresh: 'Refresh Status',
  estimate: 'Estimated advocate receipt: Sep 25, 05:00 PM',
};
