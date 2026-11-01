// Mock data for the "My Cases" section, assembled from design/14–21 so every screen draws
// from one consistent dataset. No backend: everything here is static.
//
// The designs disagree with each other on several facts. Where they do, one value is
// used and every variant is listed in a comment next to it. Nothing is confirmed by the
// client yet.

import type { CaseBucket } from '@legalitt/shared';
export { CaseStatus } from '@legalitt/shared';
export type { CaseBucket } from '@legalitt/shared';
export type HearingStatus = 'upcoming' | 'completed' | 'cancelled';
export type RequestStatus = 'awaiting-review';

export type CaseCategory = 'property' | 'family' | 'cheque-bounce' | 'civil' | 'criminal';

export type Advocate = {
  id: string;
  /** Display name, as printed: "Adv. Priya Sharma". */
  name: string;
  initials: string;
  /** Role label shown on All Active Cases (design/21). */
  role: string;
  barCouncil?: string;
  experience?: string;
  verified: boolean;
};

export type Case = {
  /** Primary case number, monospace on screen. */
  id: string;
  /** Short reference shown as a pill on the Cases tab (design/14, 16). */
  shortRef: string;
  title: string;
  category: CaseCategory | null;
  /** Printed form of the category, e.g. "Property Dispute". */
  categoryLabel: string;
  /** Court name as printed, e.g. "District Court, Indore". */
  court: string;
  city: string;
  state: string;
  status: CaseBucket;
  /** Status as printed on Case Details' info table (design/18). */
  statusLabel: string;
  filedDate: string; // ISO yyyy-mm-dd
  advocateId: string;
  /** Case-supplied advocate; null means unassigned, undefined uses the fixture lookup. */
  advocate?: Pick<Advocate, 'name' | 'initials' | 'role'> | null;
  serviceCode?: string;
  nextHearingId?: string;
  documentsCount: number;
  recentUpdate?: { date: string; text: string };
  nextAction?: string;
};

export type Hearing = {
  id: string;
  caseId: string;
  /** Chip on the Cases tab card (design/14, 15). */
  type: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // as printed, "11:30 AM"
  courtroom: string; // as printed, "Courtroom 4"
  /** Cause-list item, printed "Item No. 12" (design/14, 15). */
  itemNo?: number;
  bench: string;
  status: HearingStatus;
  attendance: string;
  about?: string;
  stage?: string;
  advocateNote?: string;
};

export type PendingRequest = {
  id: string;
  title: string;
  categoryLabel: string;
  note: string;
  requestedDate: string; // ISO yyyy-mm-dd
  estimatedMatch: string;
  status: RequestStatus;
  statusLabel: string;
  progressNote: string;
};

/**
 * The designs' "5 days remaining" against the 24 Sep 2026 hearing implies the screens
 * were drawn as of 19 Sep 2026. Screens should count from this date so the mock matches
 * the PNGs; swap for `new Date()` when real data arrives.
 */
export const MOCK_TODAY = '2026-09-19';

export const ADVOCATES: Advocate[] = [
  {
    id: 'adv-priya-sharma',
    name: 'Adv. Priya Sharma',
    initials: 'PS',
    role: 'Lead Counsel', // design/21
    barCouncil: 'Bar Council of MP', // design/20
    experience: '12+ Yrs Exp.', // design/20
    verified: true, // "Verified" (design/18), "Verified Advocate" (design/20)
  },
  {
    id: 'adv-neha-verma',
    name: 'Adv. Neha Verma',
    initials: 'NV',
    role: 'Family Counsel', // design/21
    verified: true,
  },
  {
    id: 'adv-rohan-mehta',
    name: 'Adv. Rohan Mehta',
    initials: 'RM',
    role: 'Commercial Counsel', // design/21
    verified: true,
  },
  // INVENTED — added so the Civil and Criminal filter chips on All Active Cases have
  // something to match. No design shows these.
  {
    id: 'adv-kavita-rao',
    name: 'Adv. Kavita Rao',
    initials: 'KR',
    role: 'Civil Counsel',
    verified: true,
  },
  {
    id: 'adv-arjun-nair',
    name: 'Adv. Arjun Nair',
    initials: 'AN',
    role: 'Criminal Counsel',
    verified: true,
  },
];

export const CASES: Case[] = [
  {
    // ID variants for this case: "LGL-2026-IND-0241" (design/18, 19, 20), "#CAS-1048"
    // (design/14, 16), "Case #IND-2026-881" (hearing card, design/14, 15) and
    // "Matter #2026-IND" (design/20). LGL-… is used as the case number and CAS-… as the
    // short reference; the other two are dropped.
    id: 'LGL-2026-IND-0241',
    shortRef: 'CAS-1048',
    title: 'Rahul Sharma vs. Amit Verma',
    category: 'property',
    categoryLabel: 'Property Dispute',
    // Court variants: "District Court, Indore" (design/14, 18, 19, 21) vs filing court
    // "Indore Civil Court" (design/20). Using District Court, Indore.
    court: 'District Court, Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    status: 'active',
    statusLabel: 'Ongoing', // design/18 info table; the chip says "Active"
    filedDate: '2026-08-14',
    advocateId: 'adv-priya-sharma',
    nextHearingId: 'hrg-0241-2026-09-24',
    documentsCount: 3,
    recentUpdate: {
      date: '2026-09-08',
      text: 'Advocate reviewed the submitted property documents.',
    },
    nextAction: 'Review documents and prepare for the upcoming hearing.',
  },
  {
    // ID variants: "#CAS-0922" (design/14, 16) vs "LGL-2026-BHP-0814" (design/19).
    id: 'LGL-2026-BHP-0814',
    shortRef: 'CAS-0922',
    title: 'Ananya Singh vs. Rajesh Singh',
    category: 'family',
    // Label variants: "Family & Matrimonial Matter" (design/14, 16, 21) vs
    // "FAMILY & MATRIMONIAL" (design/19 chip).
    categoryLabel: 'Family & Matrimonial Matter',
    court: 'Family Court, Bhopal',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    status: 'active',
    statusLabel: 'Ongoing',
    filedDate: '2026-08-14', // not shown in any design; mirrors the first case
    advocateId: 'adv-neha-verma',
    nextHearingId: 'hrg-0814-2026-10-08',
    documentsCount: 2, // not shown in any design
  },
  {
    // Only design/21 shows this case. No ID, court state or hearing details appear there;
    // the number, short ref and hearing time/room below are invented to match the others'
    // pattern and need confirming.
    id: 'LGL-2026-BHP-0932',
    shortRef: 'CAS-0932',
    title: 'Vivek Jain vs. Mehta Traders',
    category: 'cheque-bounce',
    categoryLabel: 'Cheque Bounce',
    court: 'District Court, Bhopal',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    status: 'active',
    statusLabel: 'Ongoing',
    filedDate: '2026-08-28',
    advocateId: 'adv-rohan-mehta',
    nextHearingId: 'hrg-0932-2026-10-15',
    documentsCount: 1,
  },
  // INVENTED — the All Active Cases filter chips (design/21) include Civil and Criminal,
  // but no design shows a case in either category. These two exist so those filters
  // return something; every field follows the pattern of the cases above and none of it
  // is client copy.
  {
    id: 'LGL-2026-IND-0356',
    shortRef: 'CAS-1102',
    title: 'Sunita Rao vs. Kiran Deshmukh',
    category: 'civil',
    categoryLabel: 'Civil Suit',
    court: 'District Court, Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    status: 'active',
    statusLabel: 'Ongoing',
    filedDate: '2026-09-02',
    advocateId: 'adv-kavita-rao',
    nextHearingId: 'hrg-0356-2026-10-22',
    documentsCount: 2,
  },
  {
    id: 'LGL-2026-BHP-1043',
    shortRef: 'CAS-1155',
    title: 'State vs. Manoj Kulkarni',
    category: 'criminal',
    categoryLabel: 'Criminal Matter',
    court: 'Sessions Court, Bhopal',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    status: 'active',
    statusLabel: 'Ongoing',
    filedDate: '2026-09-11',
    advocateId: 'adv-arjun-nair',
    nextHearingId: 'hrg-1043-2026-10-29',
    documentsCount: 4,
  },
];

export const HEARINGS: Hearing[] = [
  {
    id: 'hrg-0241-2026-09-24',
    caseId: 'LGL-2026-IND-0241',
    type: 'Court Hearing',
    date: '2026-09-24',
    time: '11:30 AM',
    // Room variants: "Courtroom 4 • Item No. 12" (design/14, 15), "Room 4" (design/19),
    // "Courtroom 4" (design/18, 20).
    courtroom: 'Courtroom 4',
    itemNo: 12,
    bench: 'Bench 2', // design/19, 20
    status: 'upcoming',
    attendance: 'Advocate attending in person', // design/14, 15
    about:
      'Next scheduled hearing for the ongoing property dispute case. Arguments will be presented concerning ancestral property boundaries and ownership deed verification.',
    stage: 'Submission of original registry documents & surveyor report',
    advocateNote: 'Client attendance is optional. Counsel will argue preliminary objection.',
  },
  {
    id: 'hrg-0814-2026-10-08',
    caseId: 'LGL-2026-BHP-0814',
    type: 'Court Hearing',
    date: '2026-10-08',
    time: '10:00 AM', // design/19
    courtroom: 'Courtroom 2', // "Room 2" on design/19
    bench: 'Main Bench', // design/19
    status: 'upcoming',
    attendance: 'Advocate attending in person',
  },
  {
    // Invented for the third case — design/21 only gives the date.
    id: 'hrg-0932-2026-10-15',
    caseId: 'LGL-2026-BHP-0932',
    type: 'Court Hearing',
    date: '2026-10-15',
    time: '10:30 AM',
    courtroom: 'Courtroom 1',
    bench: 'Bench 1',
    status: 'upcoming',
    attendance: 'Advocate attending in person',
  },
  // INVENTED — hearings for the two invented cases above.
  {
    id: 'hrg-0356-2026-10-22',
    caseId: 'LGL-2026-IND-0356',
    type: 'Court Hearing',
    date: '2026-10-22',
    time: '11:00 AM',
    courtroom: 'Courtroom 3',
    bench: 'Bench 1',
    status: 'upcoming',
    attendance: 'Advocate attending in person',
  },
  {
    id: 'hrg-1043-2026-10-29',
    caseId: 'LGL-2026-BHP-1043',
    type: 'Court Hearing',
    date: '2026-10-29',
    time: '02:30 PM',
    courtroom: 'Courtroom 6',
    bench: 'Main Bench',
    status: 'upcoming',
    attendance: 'Advocate attending in person',
  },
];

export const PENDING_REQUESTS: PendingRequest[] = [
  {
    id: 'req-district-representation',
    title: 'District Representation',
    categoryLabel: 'Property Dispute',
    note: 'Adv. assignment pending',
    requestedDate: '2026-09-09',
    estimatedMatch: '< 24 hrs',
    status: 'awaiting-review',
    statusLabel: 'Awaiting Review',
    progressNote: 'Verification in progress',
  },
];

// ---------------------------------------------------------------------------
// Lookups and derived values

export const getCase = (id: string) => CASES.find((c) => c.id === id);
export const getHearing = (id: string) => HEARINGS.find((h) => h.id === id);
export const getAdvocate = (id: string) => ADVOCATES.find((a) => a.id === id);

export const activeCases = () => CASES.filter((c) => c.status === 'active');

export const hearingsForCase = (caseId: string) =>
  HEARINGS.filter((h) => h.caseId === caseId).sort((a, b) => a.date.localeCompare(b.date));

export const upcomingHearings = () =>
  HEARINGS.filter((h) => h.status === 'upcoming').sort((a, b) => a.date.localeCompare(b.date));

/**
 * Counts for the stat cards on the Cases tab.
 * Count variants: design/14 shows ACTIVE CASES 2 / HEARINGS 2 / PENDING 1 and design/19
 * says "2 hearings", both drawn before the third case existed; design/21 says "3 cases".
 * The counts below are derived from the data, so they read 3 / 3 / 1.
 */
export const caseStats = () => ({
  active: activeCases().length,
  hearings: upcomingHearings().length,
  pending: PENDING_REQUESTS.length,
});

/** Whole days from `today` to an ISO date, e.g. 5 for the 24 Sep hearing (design/14). */
export function daysUntil(isoDate: string, today: string = MOCK_TODAY) {
  const ms = Date.parse(isoDate) - Date.parse(today);
  return Math.round(ms / 86_400_000);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-09-24" -> "24 Sep 2026", the format used throughout the designs. */
export function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`;
}

/** An API timestamp's calendar date on this device, as formatDate expects
 * ("2026-10-28T10:37:11Z" -> "2026-10-28" in UTC, "2026-10-28" in IST). formatDate
 * takes a date, not a timestamp; slicing the string would give the UTC day. */
export function calendarDate(timestamp: string) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "04:07 PM": the clock format drawn on design/31 and design/441. */
export function clockTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/** "2026-09-24" -> { month: "SEP", day: "24" } for the calendar tiles (design/18, 20). */
export function calendarParts(isoDate: string) {
  const [, m, d] = isoDate.split('-').map(Number);
  return { month: MONTHS[m - 1].toUpperCase(), day: String(d) };
}
