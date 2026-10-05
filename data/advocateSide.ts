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
