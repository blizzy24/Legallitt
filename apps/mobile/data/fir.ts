// FIR Draft service data.
//
// Audited every design/40–47: no base service fee or total is drawn.
// design/45 DOES draw ₹25 per page above 25 pages (PER_PAGE_NOTE below);
// that conditional overage is not a base fee and the preview has no page count.
// UNCONFIRMED PLACEHOLDER, chosen for the client walkthrough: ₹1,000 flat total
// for FIR drafting. Replace after pricing confirmation; no tax/fee is inferred.
export const FIR_PAYMENT_TOTAL = 1000;
export const FIR_PAYMENT_SERVICE = 'FIR Draft';

export type IncidentType =
  | 'theft'
  | 'fraud'
  | 'assault'
  | 'harassment'
  | 'property-dispute'
  | 'cyber-crime'
  | 'other';

export type IncidentOption = { id: IncidentType; label: string };

/** Chips under the incident-type field on design/42, in the order drawn. */
export const INCIDENT_TYPES: IncidentOption[] = [
  { id: 'theft', label: 'Theft' },
  { id: 'fraud', label: 'Fraud' },
  { id: 'assault', label: 'Assault' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'property-dispute', label: 'Property Dispute' },
  { id: 'cyber-crime', label: 'Cyber Crime' },
  { id: 'other', label: 'Other' },
];

export const incidentLabel = (id: string | null) =>
  INCIDENT_TYPES.find((t) => t.id === id)?.label ?? '';

/** Placeholder copy for the jurisdiction selects on design/42. Not real data. */
export const JURISDICTION_PLACEHOLDERS = {
  state: '[ Select state ]',
  district: '[ Select district ]',
  policeStation: '[ Select police station ]',
  incidentType: '[ Select incident type ]',
};

/**
 * Evidence sections on step 4 (design/45), in the order drawn. `state` is the
 * right-hand label; the design pills two of the four and leaves the other two as
 * bare text — see the note in app/fir/step4.tsx.
 */
export type EvidenceSection = {
  n: number;
  title: string;
  description: string;
  state: string;
  /** design/45 draws a pill behind "Required" and "1 File" only. */
  pill: boolean;
};

export const EVIDENCE_SECTIONS: EvidenceSection[] = [
  {
    n: 1,
    title: 'Primary Documents',
    description: 'Agreements, legal notices, receipts & stamps',
    state: 'Required',
    pill: true,
  },
  {
    n: 2,
    title: 'Scene Photos & Video',
    description: 'Geo-tagged photos, CCTV clips, or physical damage',
    state: '0 / 5 Attached',
    pill: false,
  },
  {
    n: 3,
    title: 'Digital Communications',
    description: 'WhatsApp logs, emails, SMS threats or notices',
    state: '1 File',
    pill: true,
  },
  {
    n: 4,
    title: 'Ancillary / Other Records',
    description: 'Audio recordings, bank statements, affidavits',
    state: 'Optional',
    pill: false,
  },
];

/** The two files design/45 shows already staged. */
export const STAGED_FILES = {
  primary: {
    name: 'lease_deed_stamp_2026.pdf',
    size: '1.8 MB',
    validation: 'SHA-256 Validated',
  },
  digital: {
    name: 'threat_msg_archive_0412.png',
    size: '840 KB',
    validation: 'Timestamp Verified',
  },
};

/** Chain-of-custody stat boxes at the foot of step 4 (design/45). */
export const CUSTODY_STATS = [
  { value: '2 Files', label: 'Staged' },
  { value: '2.64 MB', label: 'Total Size' },
  { value: 'AES-256', label: 'Cipher' },
];

/**
 * REPORTED — design/45 prints "₹25 per page for every page above 25 pages" directly
 * above the Continue button, but no invoice in the batch carries a per-page line, and
 * FIR pricing is unconfirmed (see the TODO at the top of this file). Rendered as drawn
 * and flagged: it is copy the client has to confirm before this screen can ship.
 */
export const PER_PAGE_NOTE = '₹25 per page for every page above 25 pages.';

/**
 * Values shown on the step 5 review screen (design/46). These are the design's own
 * sample values, used where the flow has nothing entered yet — the same way
 * data/legalNotice.ts carries design sample values.
 */
export const FIR_REVIEW_SAMPLE = {
  fullName: 'Adv. Rajesh V. Sharma',
  mobile: '+91 98765 43210',
  email: 'rajesh.sharma@domain.in',
  incidentDateTime: '14 Oct 2024, 08:30 PM',
  location: 'Sec 42, Gurugram, HR',
  /** The collapsed form design/46 draws, ending in an ellipsis. */
  offenceSummaryShort: 'Unlawful trespass and criminal intimidation at commercial warehouse premises\u2026',
  /**
   * design/46 only draws the collapsed line, so the expansion below is written to
   * complete that sentence plausibly. Replace it with the client's copy.
   */
  offenceSummaryFull:
    'Unlawful trespass and criminal intimidation at commercial warehouse premises on the night of 14 October 2024. Two identified individuals entered the leased godown without authorisation, threatened the on-site caretaker, and removed stock and documents before leaving the premises.',
  people: {
    count: '3 People Added',
    entries: [
      { label: '1 Complainant (Self)', tone: 'primary' as const },
      { label: '2 Suspects / Accused', tone: 'accused' as const },
    ],
    note: 'Primary complainant statements recorded along with 2 identified named accused parties.',
  },
  documents: {
    count: '4 Files Attached',
    files: [
      { tag: 'PDF' as const, name: 'lease_deed_stamp.pdf', size: '1.8 MB' },
      { tag: 'IMG' as const, name: 'threat_msg_archive.png', size: '840 KB' },
      { tag: 'IMG' as const, name: 'cctv_still_gate_01.jpg', size: '2.1 MB' },
      { tag: 'DOC' as const, name: 'bank_transfer_rec.pdf', size: '420 KB' },
    ],
    validation: 'SHA-256 Validated \u2022 End-to-End Encrypted',
  },
};

/** Reference and turnaround shown after submission (design/47, 48, 49). */
export const FIR_REQUEST = {
  service: 'FIR Draft',
  /** design/47, 48 and 49 all print #FIR12345678. */
  requestId: '#FIR12345678',
  submittedOn: '23 May 2026',
  submittedAt: 'Today, 08:35 PM',
  turnaround: 'Within 24\u201348 Hours',
  turnaroundShort: 'Within 24\u201348 hrs',
  turnaroundNote: 'Standard legal verification window',
  draftFile: {
    name: 'FIR_Draft_Final.pdf',
    caption: 'Prepared for your verification',
    meta: 'PDF Dossier \u00b7 2.4 MB \u00b7 Certified',
  },
};

export type TimelineState = 'done' | 'active' | 'pending';
export type TimelineItem = {
  title: string;
  description: string;
  /** Right-hand label exactly as drawn — the two screens word it differently. */
  state: string;
  tone: TimelineState;
  /** Extra line inside the highlighted active card (design/48 only). */
  footnote?: string;
};

/**
 * REPORTED — design/48 chips this list "Stage 2 of 4" but draws five items. Both are
 * rendered as drawn; the chip text is data so it is a one-line change once the client
 * says which is right (five stages, or four with one of these merged).
 */
export const STATUS_STAGE_CHIP = 'Stage 2 of 5';

export const STATUS_TIMELINE: TimelineItem[] = [
  {
    title: 'Request Submitted',
    description: 'Your FIR Draft request and submitted incident synopsis have been received.',
    state: 'Completed',
    tone: 'done',
  },
  {
    title: 'Information Review',
    description:
      'Our legal documentation team is examining the facts, jurisdiction clauses, and IPC/BNS applicable provisions.',
    state: 'Active',
    tone: 'active',
    footnote: 'Drafting team assigned',
  },
  {
    title: 'Draft Preparation',
    description:
      'Your FIR draft will be formulated as per police jurisdictional requirements once verification finishes.',
    state: 'Pending',
    tone: 'pending',
  },
  {
    title: 'Awaiting Your Approval',
    description: 'Review and approve the draft before dispatch.',
    state: 'Pending',
    tone: 'pending',
  },
  {
    title: 'Draft Ready',
    description:
      'You will receive instant access to download, print, and file the draft at the designated police station.',
    state: 'Upcoming',
    tone: 'pending',
  },
];

export const READY_STAGE_CHIP = 'Stage 5 of 5';

export const READY_TIMELINE: TimelineItem[] = STATUS_TIMELINE.map((item, index) => ({
  ...item,
  state: index === STATUS_TIMELINE.length - 1 ? 'ACTIVE' : 'Completed',
  tone: index === STATUS_TIMELINE.length - 1 ? 'active' : 'done',
  footnote: undefined,
}));

export const FIR_STEPS = 5;
