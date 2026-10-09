// ═════════════════════════════════════════════════════════════════════════════
// ADVOCATE FIR FLOW — all copy for designs 214–220.
//
// ⚠⚠ CONTRADICTIONS. Every one of these is COMMENTED, NOT RESOLVED. One value is
// picked so the screens build; every variant seen is recorded with its source.
//
// 1. THE FEE. Two incompatible numbers for the same matter:
//      design/214  "Fee: ₹4,500"                        (the cases card)
//      design/215  client ₹3,500 − Legalitt ₹500 = ₹3,000 advocate
//    Both are kept below, each on the screen that draws it. They cannot both be
//    right: either the client pays 4,500 and the split is wrong, or the client
//    pays 3,500 and the list is wrong.
//
// 2. THE COMMISSION RATE. design/215's ₹500 of ₹3,500 is 14.286%. The app already
//    carries, in data/advocateSide.ts and elsewhere:
//      6%      ADV_COMMISSION (legacy)
//      10%     ADV_COMMISSION_10 (advNetAt10)
//      15%     legal notice schedule
//      15.56%  design/206's property search (₹700 of ₹4,500, stated not computed)
//    14.286% is a fifth. Stored as a literal, deliberately NOT computed.
//
// 3. THE DOCKET NUMBER, and the "#" prefix:
//      FIR-2026-1048    design/214 (card), design/215 (request), design/220 (case)
//      #FIR-2026-8841   design/218 (docket row), design/219 (review header)
//    Two serials AND an inconsistent prefix. 1048 is used as the id because three
//    screens carry it and it matches ADV_CASES; 8841 is kept verbatim on the two
//    screens that draw it, prefix and all.
//
// 4. THE DOCUMENT SET. One screen apart, for the same request:
//      design/215  "Documents · 5 Files"  — Written Complaint Statement.pdf,
//                  Vehicle Damage & CCTV Stills.pdf, Complainant Aadhaar Card.pdf,
//                  Witness Statement (Rajesh).pdf, Shop Lease Agreement.pdf
//      design/216  "Client Documents · 4 Files" — Complaint.pdf, Case Papers.pdf,
//                  ID Proof.pdf, Supporting Document.pdf
//      design/217  "5 Attached" — "Complaint, ID, Witness statement, CCTV & Lease"
//      design/219  "4 Files Attached"
//    Both lists are stored, each on its own screen, because both are drawn.
//
// 5. THE INCIDENT DATE IS IN THE FUTURE. 18 Oct 2026 on designs 215/216/217,
//    against the app's current date of 9 Oct 2026. design/220's payment date,
//    19 Oct 2026, is later still. A previous batch normalised the advocate flow to
//    September 2026 for exactly this reason. NOT normalised here — left as drawn
//    so the contradiction stays visible. Flagged.
//
// 6. THE CLIENT'S MOBILE IS UNMASKED on designs 215, 216, 217 and 219
//    (+91 98260 41298). design/207 masks the same client's number as
//    "+91 98260 •••••" and their email as "rahul.shar***@example.com".
//
// 7. design/215's email is CLIPPED in the export — "rahul@example.co" with the
//    closing "m" cut off by the field. Stored complete; never ellipsized.
// ═════════════════════════════════════════════════════════════════════════════

/** ⚠ 14.286% — a fifth commission rate. Stored, not computed. See note 2. */
export const FIR_COMMISSION_NOTE =
  'design/215: ₹500 of ₹3,500 = 14.286%. Not derivable from any existing rate.';

// ── design/214 — cases list filtered to FIR Draft ────────────────────────────

export const FIR_REQUESTS = {
  /**
   * ⚠ design/214 draws the Cases TAB (scales tab active, full tab bar), i.e. the
   * same screen as designs 204 and 205 with the FIR Draft chip selected — not a
   * pushed screen. Built at this route on request, without the tab bar.
   */
  title: 'FIR Requests',
  service: 'FIR Draft',
  /** ⚠ design/214 draws TWO IDENTICAL FIR cards, as design/205 drew three. */
  drawnCardCount: 2,
};

// ── design/215 — FIR request details ─────────────────────────────────────────

export const FIR_REQUEST = {
  title: 'Fir Request Details',
  statusChip: 'New Request',
  recv: 'Recv: Today, 10:14 AM',
  idLabel: 'FIR Request ID:',
  /** ⚠ 1048 here; design/218 and design/219 read #FIR-2026-8841. See note 3. */
  id: 'FIR-2026-1048',
  stationLabel: 'Police Station:',
  station: 'Central Kotwali, Indore',

  client: {
    title: 'Client Details',
    chip: 'KYC Verified',
    cells: [
      { label: 'CLIENT NAME', value: 'Rahul Sharma' },
      { label: 'CITY', value: 'Indore (M.P.)' },
      /** ⚠ Unmasked. design/207 masks this client's number. See note 6. */
      { label: 'MOBILE', value: '+91 98260 41298', icon: 'phone' as const },
      /** ⚠ design/215 clips this to "rahul@example.co". Stored whole. See note 7. */
      { label: 'EMAIL', value: 'rahul@example.com', icon: 'mail' as const },
    ],
  },

  incident: {
    title: 'Incident Overview',
    rows: [
      { icon: 'alert' as const, label: 'Incident Type', value: 'Criminal Intimidation & Extortion Attempt' },
      /** ⚠ 18 Oct 2026 is NINE DAYS IN THE FUTURE. Not normalised. See note 5. */
      { icon: 'calendar' as const, label: 'Date & Time', value: '18 Oct 2026, ~09:30 PM' },
      { icon: 'pin' as const, label: 'Incident Location', value: 'Commercial Complex Parking, Scheme No. 54, Indore' },
    ],
  },

  statement: {
    title: "Client's Statement",
    quote:
      '"Two unknown individuals blocked my vehicle at the office parking gate, demanded extortion money of ₹2,50,000, verbally threatened me, and damaged the front windshield. Security guard Rajesh witnessed the scuffle."',
  },

  fee: {
    title: 'Fee Structure',
    rows: [
      { label: 'Client Retainer Fee', value: '₹3,500' },
      /** ⚠ ₹500 of ₹3,500 = 14.286%, a fifth commission rate. See note 2. */
      { label: 'Legalitt Service Fee', value: '-₹500', deduct: true },
    ],
    advocateLabel: 'ADVOCATE WILL RECEIVE',
    /** ⚠ Stored as drawn. NOT computed — see FIR_COMMISSION_NOTE. */
    advocateAmount: '₹3,000',
    escrow: 'Escrow Protected • Direct Bank Transfer upon acceptance',
  },

  documents: {
    title: 'Documents',
    /** ⚠ design/216 lists FOUR different files for the same request. See note 4. */
    chip: '5 Files',
    verified: 'All Verified',
    rows: [
      { icon: 'doc' as const, name: 'Written Complaint Statement.pdf', meta: '1.2 MB • Signed' },
      { icon: 'image' as const, name: 'Vehicle Damage & CCTV Stills.pdf', meta: '4.8 MB • 3 Images' },
      { icon: 'id' as const, name: 'Complainant Aadhaar Card.pdf', meta: '840 KB • Masked' },
      { icon: 'quote' as const, name: 'Witness Statement (Rajesh).pdf', meta: '620 KB • Eyewitness' },
      { icon: 'home' as const, name: 'Shop Lease Agreement.pdf', meta: '2.1 MB • Supporting' },
    ],
    warn: 'Review documents thoroughly before accepting this request.',
  },

  reject: 'Reject',
  accept: 'Accept Request',
  rejectCaption: 'Reject → Returns to Admin',
  acceptCaption: 'Accept → Review & Draft',
};

// ── design/216 — review documents ────────────────────────────────────────────

export const FIR_DOCUMENTS = {
  title: 'Review Documents',
  accepted: {
    title: 'Request Accepted',
    body: 'You accepted this request. Please review the documents before drafting.',
  },
  client: {
    label: 'CLIENT',
    chip: 'Verified Client',
    initials: 'RS',
    name: 'Rahul Sharma',
    /** ⚠ Unmasked, as on design/215. See note 6. */
    meta: '+91 98260 41298 • Indore (M.P.)',
  },
  documents: {
    heading: 'Client Documents',
    /**
     * ⚠ FOUR files with GENERIC names, where design/215 lists FIVE specific ones
     * for the same request one screen earlier. See note 4. Both are stored.
     */
    chip: '4 Files',
    rows: [
      { name: 'Complaint.pdf', meta: '12 Pages • 4.2 MB' },
      { name: 'Case Papers.pdf', meta: '18 Pages • 6.1 MB' },
      { name: 'ID Proof.pdf', meta: '2 Pages • 1.4 MB' },
      { name: 'Supporting Document.pdf', meta: '6 Pages • 2.8 MB' },
    ],
    view: 'View',
  },
  info: {
    heading: 'Client Information',
    rows: [
      /** ⚠ In the future. See note 5. */
      { label: 'Incident Date', value: '18 Oct 2026, ~09:30 PM' },
      { label: 'Incident Place', value: 'Commercial Complex Parking, Scheme No. 54, Indore' },
      { label: 'People Involved', value: 'Rahul Sharma (Complainant), Vikram Singh & 2 Associates (Accused)' },
    ],
  },
  description: {
    heading: "Client's Description",
    chip: 'Original text from client',
    body:
      '“Two unknown individuals blocked my vehicle at the office parking gate, demanded extortion money of ₹2,50,000, verbally threatened me, and damaged the front windshield. Security guard Rajesh witnessed the scuffle.”',
  },
  continue: 'Continue to FIR Draft',
  caption: 'Proceed to draft creation and FIR information',
};

// ── design/217 — FIR draft generator ─────────────────────────────────────────

export const FIR_GENERATOR = {
  title: 'Fir Draft Generator',
  readyChip: 'Ready to Create',
  lead: 'Check the details and create the FIR draft.',

  complainant: {
    title: 'Complainant Details',
    fields: [
      { label: 'FULL NAME', value: 'Rahul Sharma' },
      { label: 'FATHER / HUSBAND NAME', value: 'Ramesh Sharma' },
      { label: 'ADDRESS', value: '142/B, Silver Residency, Scheme No. 54, Vijay Nagar, Indore (M.P.)' },
      /** ⚠ Unmasked. See note 6. */
      { label: 'MOBILE NUMBER', value: '+91 98260 41298' },
    ],
  },

  incident: {
    title: 'Incident Details',
    cells: [
      /** ⚠ In the future. See note 5. */
      { label: 'Date', value: '18 Oct 2026', half: true },
      { label: 'Time', value: '~09:30 PM', half: true },
      { label: 'Place', value: 'Commercial Complex Parking, Scheme No. 54, Indore' },
      { label: 'Police Station', value: 'Central Kotwali, Indore' },
    ],
  },

  people: {
    title: 'People Involved',
    chip: '2 Added',
    rows: [
      { name: 'Rahul Sharma', role: 'Aggrieved / Complainant', chip: 'Complainant', accused: false },
      /** ⚠ design/217 CLIPS this to "Vikram Singh & 2 Associ". Stored whole. */
      { name: 'Vikram Singh & 2 Associates', role: 'Accused', chip: 'Accused', accused: true },
    ],
    add: 'Add Person',
  },

  happened: {
    title: 'What Happened?',
    sub: "Client's original description. You can edit or add details below.",
    /**
     * ⚠ THE CHARACTER COUNT IS WRONG. design/217 prints "230 characters" under a
     * statement that is 212 characters. The same defect as design/211's 86/300
     * over an 83-character message. The counter here is live, so it reads 212.
     */
    body:
      'Two unknown individuals blocked my vehicle at the office parking gate, demanded extortion money of ₹2,50,000, verbally threatened me, and damaged the front windshield. Security guard Rajesh witnessed the scuffle.',
    countSuffix: 'characters',
    drawnCount: 230,
  },

  other: {
    title: 'Other Information',
    sub: 'Add any extra details or advocate observations.',
    placeholder: 'Add any missing information.',
  },

  documents: {
    title: 'Documents',
    /** ⚠ "5 Attached" — design/216 shows four. See note 4. */
    chip: '5 Attached',
    sub: 'Complaint, ID, Witness statement, CCTV & Lease',
    view: 'View Documents',
  },

  create: {
    title: 'Create FIR Draft',
    sub: 'Use the case details to create the draft.',
    rulesTitle: 'Important AI Rules',
    rules: [
      'AI can use only the information available in this case (client details, incident facts, people involved, advocate notes, and uploaded documents).',
      'AI will never invent facts, names, dates, witnesses, or events.',
      "AI cannot change the client's facts or make final legal decisions.",
      'You must review the draft before it is sent to the client.',
    ],
    ai: 'Generate with AI',
    aiCaption: 'Uses case details to create standard FIR draft proforma',
    manual: 'Create Manually',
    manualCaption: 'Open FIR draft proforma with editable fields',
  },
};

// ── design/218 — FIR draft (FORM I proforma) ─────────────────────────────────
//
// ⚠ THE DOCKET JUMPS TO #FIR-2026-8841 here, prefixed with "#". designs 214, 215
// and 220 all read FIR-2026-1048, unprefixed. Note 3.
//
// ⚠ THE NARRATIVE IS CUT OFF. design/218 states "158 Words" under a Statement of
// Facts box that is a fixed height and clips mid-sentence at "...the accused Vikram
// Singh along with two". Roughly 55 words are legible; the remaining ~100 are not
// in the export. Stored exactly as far as the export shows, with the cut marked.
// NOTHING INVENTED.
//
// ⚠ FOUR LEGAL SECTIONS here ("4 Sections"), EIGHT on design/219 ("8 Legal
// Sections"). An eighth count conflict in this flow.
//
// ⚠ A FOURTH EMAIL FORM. design/218 reads rahul.sharma@example.com (itself clipped
// to "...@example"), design/215 reads rahul@example.com, design/211 reads
// rahul.sharma@example.com and design/207 masks it as rahul.shar***@example.com.
//
// ⚠ "4 Included" documents here, with a FOURTH set of names and subtitles again
// (Complaint Document.pdf / Case Papers.pdf / ID Proof.pdf / Other Document.pdf) —
// and "Case Papers.pdf" is subtitled "Lease agreement executed copy", which does
// not match its name.

export const FIR_DRAFT = {
  eyebrow: 'WORKSPACE',
  title: 'Fir Draft',
  statusChip: 'Draft Ready',
  saved: 'Auto-Saved 1 min ago',
  /** ⚠ 8841 and a "#" prefix. See note 3. */
  docket: 'Docket #FIR-2026-8841',
  docketSub: 'Central Kotwali, Indore',

  ai: {
    title: 'AI Draft — Please Review',
    body: 'All facts from your client intake are filled below. You can change, add, or clear any field.',
  },

  proforma: {
    command: 'MADHYA PRADESH POLICE STATE COMMAND',
    title: 'FIRST INFORMATION REPORT',
    form: 'FORM I — POLICE INFORMATION PROFORMA',
    under: 'Under Section 173 BNSS / 154 CrPC',
  },

  sections: [
    {
      n: '1',
      title: 'Police Station & Filing Time',
      fields: [
        { label: 'Police Station', value: 'Central Kotwali, Zone 2, Indore (M.P.)' },
        { label: 'District & State', value: 'Indore, Madhya Pradesh', half: true },
        { label: 'FIR Number', value: 'FIR No. ____ / 2026', half: true },
        { label: 'Report Received Date & Time', value: '18/10/2026 at 22:45 IST' },
      ],
    },
    {
      n: '2',
      title: 'Complainant / Reporter Info',
      fields: [
        { label: 'Full Legal Name', value: 'Rahul Sharma' },
        { label: "Father's Name", value: 'Ramesh Sharma', half: true },
        { label: 'Age & Gender', value: '34 Years / Male', half: true },
        { label: 'Occupation / Job', value: 'Business Owner / Retailer' },
        { label: 'Home & Present Address', value: '142/B, Silver Residency, Scheme No. 54, Vijay Nagar, Indore (M.P.)' },
        /** ⚠ A fourth form of this client's email. Stored whole. */
        { label: 'Phone & Email', value: '+91 98260 41298 | rahul.sharma@example.com' },
        { label: 'Official ID Document', value: 'Aadhaar Card (XXXX-XXXX-4812) Verified', tint: true, icon: 'id' as const },
      ],
    },
    {
      n: '3',
      title: 'When and Where It Happened',
      fields: [
        { label: 'Date & Time of Crime', value: '18 October 2026, ~09:30 PM (Sunday)' },
        { label: 'Place of Incident', value: 'Commercial Complex Parking, Scheme No. 54, Indore' },
        { label: 'Distance from Police Station', value: 'Approx. 4.5 km North-East' },
      ],
    },
    {
      n: '4',
      title: 'Accused Person(s)',
      note: 'Known / Suspected',
      fields: [
        { label: 'Main Accused Name', value: 'Vikram Singh, S/o Not Known' },
        { label: 'Other People Involved', value: 'Accompanied by two (2) unidentified male associates' },
        { label: 'Vehicle Used', value: 'White SUV (Reg: MP-09-CZ-4412)' },
        { label: 'Suspected Reason / Motive', value: 'Extortion of ₹2,50,000 & intimidation regarding shop lease' },
      ],
      add: '+ Add Accused / Person',
      addIcon: 'person' as const,
    },
  ],

  legal: {
    n: '5',
    title: 'Applicable Legal Sections',
    /** ⚠ "4 Sections" here, "8 Legal Sections" on design/219. */
    note: '4 Sections',
    hint: 'Tap × to remove any section not needed for this complaint.',
    tags: [
      'BNS 308(2) / IPC 384 (Extortion)',
      'BNS 329(3) / IPC 447 (Trespass)',
      'BNS 351(2) / IPC 506 (Threatening)',
      'BNS 324(4) / IPC 427 (Damage)',
    ],
    add: '+ Add Legal Section',
  },

  facts: {
    n: '6',
    title: 'Statement of Facts',
    note: 'Full Narrative',
    /**
     * ⚠ CUT OFF IN THE EXPORT. design/218 claims 158 words; the box clips at
     * "...along with two" and the rest is not visible anywhere. Stored exactly
     * as far as the PNG shows. Nothing invented.
     */
    body:
      'To, The Station House Officer, Central Kotwali, Indore.\n\nRespected Sir,\nI, Rahul Sharma, aged 34 years, state that on 18th October 2026 at approximately 09:30 PM, as I was exiting my office parking at Scheme No. 54 in my vehicle, the accused Vikram Singh along with two',
    /** ⚠ As drawn. The visible text is ~55 words, not 158. */
    foot: '158 Words • Editable',
    edit: 'Edit text',
  },

  witnesses: {
    n: '7',
    title: 'Witnesses',
    fields: [
      /** ⚠ Clipped in design/218 at "Scheme N". Stored whole. */
      { label: 'Witness 1', value: 'Rajesh (On-duty Security Guard, Scheme No. 54)' },
    ],
    add: '+ Add Witness',
  },

  attached: {
    n: '8',
    title: 'Attached Documents',
    /** ⚠ A fourth document set and a fourth count. See note 4. */
    note: '4 Included',
    rows: [
      { name: 'Complaint Document.pdf', sub: 'Original signed physical statement', icon: 'copy' as const },
      /** ⚠ The subtitle does not match the name. As drawn. */
      { name: 'Case Papers.pdf', sub: 'Lease agreement executed copy', icon: 'doc' as const },
      { name: 'ID Proof.pdf', sub: 'Complainant Aadhaar & PAN Card', icon: 'id' as const },
      { name: 'Other Document.pdf', sub: 'CCTV footage video stills of SUV', icon: 'image' as const },
    ],
    add: '+ Attach Additional Document',
  },

  save: 'Save Draft',
  send: 'Send to Client for Review',
  caption: 'Send to Client for Review opens FIR Review & Status',
};

// ── design/219 — FIR review & status ─────────────────────────────────────────
//
// ⚠ THE PREVIEW SWITCHER IS DRAWN IN THE DESIGN. Unlike the other unreachable-state
// switchers in this project, which are dev affordances we added, design/219 draws
// this one as part of the screen, with its own label ("ADVOCATE PREVIEW SWITCHER")
// and an "Interactive Demo" tag. It is gated behind DEV_PREVIEW_TOGGLES on request,
// which means turning that flag off removes UI the design actually draws.
//
// ⚠ ITS LABELS ARE "Waiting / Approved / Changes" — not "Changes Needed".
//
// ⚠ ONLY THE "Waiting" STATE IS DESIGNED. design/219 is a single-state export. There
// is no Approved screen and no Changes screen anywhere in this batch, so selecting
// those segments cannot change the content without inventing it. The segments
// select; the content stays as drawn, and a dev-only note says so.
//
// ⚠ "8 Legal Sections" here, "4 Sections" on design/218.
// ⚠ "4 Files Attached" here — a fifth document count in this flow.
// ⚠ The docket is #FIR-2026-8841 with a "#". Note 3.

export const FIR_REVIEW = {
  title: 'Fir Review',
  switcher: {
    label: 'ADVOCATE PREVIEW SWITCHER',
    demo: 'Interactive Demo',
    /** ⚠ "Changes", not "Changes Needed". */
    states: ['Waiting', 'Approved', 'Changes'],
    /** Dev-only. Not drawn in any design. */
    devNote:
      'Only the Waiting state is designed. design/219 is a single-state export — there is no Approved or Changes screen in this batch, so these two segments show the drawn content unchanged.',
  },

  /** ⚠ 8841 and a "#". See note 3. */
  docket: '#FIR-2026-8841',
  statusChip: 'WAITING FOR CLIENT',
  station: 'PS Central Kotwali, Indore',

  client: {
    label: 'CLIENT DETAILS',
    chip: 'Verified Complainant',
    initials: 'RS',
    name: 'Rahul Sharma',
    /** ⚠ Unmasked. Note 6. */
    phone: '+91 98260 41298',
    city: 'Indore (Madhya Pradesh)',
  },

  draft: {
    title: 'FIR Draft',
    version: 'v2.1',
    by: 'Created by Legalitt Advocate',
    proforma: 'Statutory Police Proforma',
    /** ⚠ EIGHT here; design/218 lists FOUR. */
    sections: '8 Legal Sections',
    /** ⚠ A fifth count for the document set. Note 4. */
    files: '4 Files Attached',
    view: 'View Draft',
  },

  timeline: {
    label: 'FILING TIMELINE',
    stage: 'Stage 3 of 5',
    /**
     * ⚠ NO CONNECTOR LINES. design/219 draws five standalone circles, 23pt across,
     * on a 50pt row pitch — no rail between them. The Property Search tracker's
     * connector values are deliberately not reused.
     */
    rows: [
      { title: 'Draft Created', sub: 'AI Assisted Proforma • 10:28 AM', tone: 'done' as const, icon: 'check' as const },
      { title: 'Sent to Client', sub: 'SMS & App Link • Today, 10:30 AM', tone: 'done' as const, icon: 'check' as const },
      { title: 'Waiting for Client Review', sub: 'Active step • Awaiting sign-off', tone: 'active' as const, icon: 'hourglass' as const },
      { title: 'Approved', sub: 'Client formal consent', tone: 'todo' as const, icon: 'checkcheck' as const },
      { title: 'Submitted to Police', sub: 'Final dispatch & receipt', tone: 'todo' as const, icon: 'send' as const },
    ],
  },

  alert: {
    title: 'Waiting for Client Review',
    body: 'The FIR draft has been sent to Rahul Sharma.',
    note: 'The client has received the draft link via Legalitt Client App and SMS. You will be notified the moment they respond.',
    resend: 'Resend Review Link',
    remind: 'Remind Client',
  },

  audit: {
    label: 'AUDIT LOG & HISTORY',
    rows: [
      { text: 'Client viewed draft online', time: '11:10 AM' },
      { text: 'Draft sent to client via SMS', time: '10:30 AM' },
      { text: 'Draft generated with Legalitt AI', time: '10:28 AM' },
    ],
  },
};

// ── design/220 — FIR completed ───────────────────────────────────────────────
//
// ⚠ THE DOCKET RETURNS TO FIR-2026-1048, unprefixed, after designs 218 and 219
// used #FIR-2026-8841. Note 3.
//
// ⚠ THE PAYMENT DATE IS 19 Oct 2026 — ten days in the future, and a day after the
// incident date the same flow calls the past. Note 5.
//
// ⚠ THE SUCCESS MARK IS A FOURTH GREEN (#55A900). designs 203 and 212 draw the
// identical mark in #4CA214. See the quarantine note in constants/tokens/advFir.ts.
//
// ⚠ ReportSentScreen does NOT fit and is not reused. That component (designs 203
// and 212) is a check, one PAYMENT SUMMARY card and one button. design/220 has a
// close (×) header, a headline and sub-line, a CASE card, a YOUR PAYMENT card with
// an inner receipt box, a five-row COMPLETED STEPS card and two actions.

export const FIR_COMPLETED = {
  title: 'Fir Completed',
  headline: 'FIR Submitted Successfully',
  body: 'The client approved the draft and the FIR was submitted.',

  caseCard: {
    label: 'CASE',
    chip: 'Completed',
    rows: [
      { label: 'Client', value: 'Rahul Sharma' },
      /** ⚠ Back to 1048, unprefixed. Note 3. */
      { label: 'Request ID', value: 'FIR-2026-1048' },
      { label: 'Service', value: 'FIR Draft' },
    ],
  },

  payment: {
    label: 'YOUR PAYMENT',
    chip: 'Payment Received',
    /** Matches design/215's ₹3,000 split, not design/214's ₹4,500 fee. Note 1. */
    amount: '₹3,000',
    unit: 'INR',
    body: 'This amount has been added to your Legalitt wallet.',
    rows: [
      /** ⚠ Ten days in the future. Note 5. */
      { label: 'Payment Date', value: '19 Oct 2026, 11:20 AM' },
      { label: 'Added To', value: 'Wallet (WAL-7729)' },
    ],
  },

  steps: {
    label: 'COMPLETED STEPS',
    rows: ['Draft created', 'Sent to client', 'Client approved', 'FIR submitted', 'Payment received'],
  },

  primary: 'View Earnings',
  secondary: 'View FIR',
};
