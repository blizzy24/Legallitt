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
