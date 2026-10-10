// ═════════════════════════════════════════════════════════════════════════════
// ADVOCATE DOCUMENT FORENSIC FLOW — all copy for designs 222–228.
//
// ⚠⚠ CONTRADICTIONS. Every one is COMMENTED, NOT RESOLVED. One value is picked so
// the screen builds; every variant seen is recorded with its source file.
//
// 1. TWO CLIENTS, ONE DOCKET.
//      Rahul Sharma            designs 222, 223, 224, 225
//      Vikramaditya Singhania  designs 226, 227, 228
//    Vikramaditya Singhania was the property OWNER in the Property Search batch
//    (Sale_Deed_Singhania.pdf, designs 207/210), not a client. The docket is
//    DF-2026-1048 throughout, so one request changes client halfway.
//
// 2. THREE MATTERS, ONE DOCKET.
//      "Signature & Document Forensic", High Court Indore        design/227
//      "Land Title Dispute Forensic", Bengaluru Civil Court      design/228
//      "Document Forensic (Property Sale Deed 1998)"             designs 229/231
//    Indore and Bengaluru are 1,500km apart and in different High Court circuits.
//
// 3. THE DEPONENT IS A CLIENT-SIDE ADVOCATE. design/227's affidavit is sworn by
//    "Adv. Priya Sharma, Enr: MP/1429/2014". Priya Sharma appears on the CLIENT
//    side of this app. The signed-in advocate is Abhishek Chouhan (design/148) /
//    Abhishek Sahu (design/188) / Gurneet Chawla (designs 189/209) — a fifth name.
//
// 4. THE FEE. design/223 shows a ₹15,000 Service Fee; design/232 pays the advocate
//    ₹4,500. If those are the same transaction the platform keeps ₹10,500 — a 70%
//    commission, against 6%, 10%, 14.286%, 15% and 15.56% elsewhere in the app.
//    Neither number is computed; both stored as drawn.
//
// 5. THE SHARED SUFFIX. DF-2026-1048, FIR-2026-1048, PSR-2026-1048, LN-2026-1048,
//    CM-2026-1048 and HCR-2026-1048 — six unrelated services, one serial.
//
// FURTHER CONTRADICTIONS FOUND IN THESE EXPORTS, not in the brief:
//
// 6. design/222 DRAWS TWO SEARCH FIELDS, stacked, with different placeholders:
//    "Search client, document or request ID" and the cases list's own
//    "Search client, case, service or case ID...".
//
// 7. THE SERVICE CHIP READS "Documents Forensic" — plural — where the card chip,
//    the service name and every other screen read "Document Forensic".
//
// 8. THE DOCUMENT COUNT. design/223 says "2 Evidentiary Files" and design/224 says
//    "2 Documents", but design/224's own readiness card says "3 of 3 Ready".
//
// 9. THE CLIENT'S CITY AND NUMBER. design/223 puts Rahul Sharma in "Mumbai,
//    Maharashtra" on +91 98765 •••••. Every other screen in the project puts him
//    in Indore (M.P.) on +91 98260 41298.
//
// 10. DISCLOSURE. design/223 MASKS the phone and email ("Masked", "Verified");
//     designs 215/216/217/219 print the same client's number in full. A fifth
//     disclosure treatment.
//
// 11. design/223's header reads "Request Details" and so does design/224's — two
//     different screens, same title, in sequence.
// ═════════════════════════════════════════════════════════════════════════════

export const DF_REQUESTS = {
  title: 'Document Forensic Requests',
  eyebrow: 'Legalitt Forensic Portal',
  subtitle: 'Review and manage incoming forensic requests.',
  /** ⚠ design/222 draws a SECOND search field above the list's own. See note 6. */
  search: 'Search client, document or request ID',
  /** ⚠ Plural, unlike every other use. See note 7. */
  service: 'Documents Forensic',
  /** ⚠ design/222 draws TWO IDENTICAL cards, as designs 205 and 214 did. */
  drawnCardCount: 2,
};

// ── design/223 — request details ─────────────────────────────────────────────

export const DF_REQUEST = {
  /** ⚠ design/224 carries the SAME header title. See note 11. */
  title: 'Request Details',
  statusChip: 'New Request',
  ref: 'DF-2026-1048',
  heading: 'Document Forensic Examination',

  fee: {
    label: 'Service Fee',
    /** ⚠ design/232 pays the advocate ₹4,500 against this. See note 4. */
    amount: '₹15,000',
    secured: 'Payment Secured',
  },

  cells: [
    { label: 'Service Class', value: 'Online Forensic' },
    { label: 'Examination', value: 'Signature Analysis' },
    { label: 'Expected Time', value: '3–5 Business Days' },
    { label: 'Submission Date & Time', value: '24 Sep, 10:15 AM' },
  ],

  client: {
    /** ⚠ Vikramaditya Singhania from design/226 on. See note 1. */
    name: 'Rahul Sharma',
    id: 'ID: CLI-2026-0148',
    role: 'Client',
    initials: 'RS',
    /** ⚠ +91 98260 41298 everywhere else, and unmasked there. Notes 9 and 10. */
    phone: '+91 98765 •••••',
    phoneTag: 'Masked',
    email: 'rahul.sha***@example.com',
    emailTag: 'Verified',
    /** ⚠ Indore (M.P.) on every other screen. See note 9. */
    city: 'Mumbai, Maharashtra',
  },

  statement: {
    title: "Client's Statement & Objective",
    quote:
      '“I want to check whether the signature on my agreement matches the genuine signature provided. There is a concern that the signature on page 18 may not be authorized.”',
  },

  documents: {
    heading: 'Documents Provided',
    /** ⚠ design/224's readiness card says "3 of 3 Ready". See note 8. */
    note: '2 Evidentiary Files',
    sub: 'Submitted for scientific forensic analysis',
    rows: [
      {
        name: 'Sale Agreement.pdf',
        meta: '24 Pages • 4.8 MB • Uploaded by Client',
        tag: 'Questioned',
        tone: 'questioned' as const,
        flag: 'Page 18 marked for signature examination',
        /** ⚠ Static string. No hashing, no file reading. */
        hash: 'SHA-256:  7f8a…3e12',
      },
      {
        name: 'Previous Agreement.pdf',
        meta: '8 Pages • 2.1 MB • Registered Deed',
        tag: 'Genuine Reference',
        tone: 'reference' as const,
        flag: 'Contains 3 verified genuine specimen signatures',
        hash: 'SHA-256:  9b2d…81fc',
      },
    ],
    view: 'View Document',
  },

  exam: {
    title: 'Requested Examination',
    tag: 'Sec. 45 & 73 IEA',
    item: 'Signature Examination',
    body:
      'Compare the signature style, pen pressure, line quality, and other details with the genuine reference signatures.”',
    protoLabel: 'Standard Protocol:',
    protoValue: 'FDEP-v4 Protocol',
  },

  accept: 'Accept Request',
  more: 'Request More Info',
  decline: 'Decline Request',
};

// ── design/224 — questioned & reference documents ────────────────────────────

export const DF_DOCUMENTS = {
  /** ⚠ The same title as design/223. See note 11. */
  title: 'Request Details',
  caseFile: 'Case File DF-2026-1048',
  client: 'Rahul Sharma',
  verified: 'Verified',
  stats: [
    { icon: 'file' as const, value: '2', label: 'Documents' },
    { icon: 'book' as const, value: '32 Total', label: 'Pages' },
    { icon: 'seal' as const, value: '', label: 'Document Verified' },
  ],

  questioned: {
    band: 'QUESTIONED DOCUMENT',
    note: 'Subject Instrument',
    name: 'Sale Agreement.pdf',
    tag: 'Ready for Inspection',
    meta: '24 Pages • 4.8 MB • Uploaded by Client (Rahul Sharma)',
    focusLabel: 'Target Focus:',
    focusValue: 'Signature Concern on Page 18',
    /** ⚠ Static string. No hashing, no file reading. */
    hash: 'SHA-256: 7f8a42…3e12',
  },

  reference: {
    divider: 'COMPARATIVE REFERENCE EVIDENCE',
    band: 'REFERENCE MATERIAL',
    note: 'Benchmark Standard',
    name: 'Previous Agreement.pdf',
    tag: 'Verified Standard',
    meta: '8 Pages • 2.1 MB • Registered Deed Specimen',
    focusLabel: 'Baseline Standard:',
    focusValue: '3 verified genuine specimen signatures',
    hash: 'SHA-256: 9b2d18…81fc',
  },

  view: 'View Document',
  download: 'Download PDF',

  ready: {
    title: 'Ready for Review',
    /** ⚠ THREE, where this screen's own header says "2 Documents". See note 8. */
    note: '3 of 3 Ready',
    body:
      'We check the submitted files for completeness before assigning them to a specialist. The appointed examiner will conduct the final forensic verification.',
    rows: [
      { title: 'Files Available & Verified', sub: 'Both PDF files are available and can be opened successfully.' },
      { title: 'All 32 Pages Available', sub: 'No Missing or Blank Pages' },
      { title: 'High-Resolution & Legible', sub: '300+ DPI Scan Quality Verified' },
    ],
  },

  continue: 'Continue',
  more: 'Request More Information',
};

// ── design/225 — waiting for specialist report ───────────────────────────────

export const DF_WAITING = {
  title: 'Waiting For Specialist Report',
  chip: 'WAITING FOR SPECIALIST',
  headline: 'Report Pending',
  ref: 'DF-2026-1048',
  state: 'Intake Dispatched',
  grid: [
    { label: 'Client', value: 'Rahul Sharma', tick: true },
    { label: 'Questioned Document', value: 'Sale Agreement.pdf' },
    { label: 'Forensic Type', value: 'Signature Examination' },
    { label: 'Service Class', value: 'Ordinary Turnaround' },
  ],
  hint: 'Upload report must be filled along with affidavit',
  upload: 'Upload Report',
  view: 'View Request Details',
};

// ── design/226 — forensic report form ────────────────────────────────────────
//
// ⚠ THE CLIENT CHANGES HERE. Rahul Sharma on designs 222–225 becomes Vikramaditya
// Singhania from this screen on, under the same docket DF-2026-1048. See note 1.

export const DF_REPORT = {
  title: 'Forensic Report',
  readyChip: 'READY TO FILL',
  lead: 'Fill in your examination findings to prepare the report.',

  client: {
    label: 'CLIENT INFORMATION',
    chip: 'Verified Client',
    /** ⚠ Rahul Sharma on designs 222–225. See note 1. */
    name: 'Vikramaditya Singhania',
    request: 'Request ID: DF-2026-1048',
    caseLabel: 'Case Type',
    caseValue: 'Document Forensic',
  },

  document: {
    label: 'SUBMITTED DOCUMENT',
    note: 'Under Direct Review',
    name: 'Property_Sale_Deed_1998.pdf',
    sub: 'Disputed Sale Deed / Signature Verification',
    meta: '4 Pages  •  3.2 MB  •  ',
    metaOk: 'Original Scanned',
  },

  exam: {
    title: 'Advocate Examination',
    note: 'Physical & Optical Review',
    sections: [
      {
        title: 'What Was Checked?',
        tag: 'Scope',
        body:
          'Examined signature on page 4 of the sale deed, paper alignment, ink consistency under magnification, and stamp impression.',
      },
      {
        title: 'How Was It Checked?',
        tag: 'Method',
        body:
          'Compared disputed signature with 3 registered genuine reference specimens using 10x optical magnification and side-by-side stroke analysis.',
      },
      {
        title: 'Findings',
        tag: 'Observations',
        body:
          'Natural stroke fluency observed in reference specimens is absent in the disputed document. Hesitation marks and unnatural pen lifts detected at letter joints.',
      },
      {
        title: 'Final Result',
        tag: 'Conclusion',
        body:
          'The questioned signature does not match the specimen signatures provided. Discrepancies indicate strong likelihood of simulated forgery.',
      },
    ],
  },

  notice: {
    title: 'Advocate Examination Notice',
    body:
      'You are preparing this forensic evaluation based on your direct physical and optical examination of the submitted document.',
  },

  draft: {
    label: 'DOCUMENT DRAFT',
    chip: '4 Sections Completed',
    title: 'Preliminary Forensic Examination Report',
    body: 'Ready for advocate verification and attached affidavit sign-off.',
    preview: 'Preview Report',
    by: 'Created by Legalitt',
  },

  continue: 'Continue',
};

// ── design/227 — legal affidavit ─────────────────────────────────────────────
//
// ⚠ THE DEPONENT IS A CLIENT-SIDE ADVOCATE. The affidavit is sworn by "Adv. Priya
// Sharma, Enr: MP/1429/2014". Priya Sharma appears on the CLIENT side of this app.
// The signed-in advocate has been Abhishek Chouhan (design/148), Abhishek Sahu
// (design/188), Gurneet Chawla (designs 189/209) and Gurneeet Chawla (design/194) —
// Priya Sharma is a fifth name, and the only one from the other side of the product.
// See note 3.
//
// ⚠ THE MATTER IS "Signature & Document Forensic", High Court Indore, where
// design/228 calls the same docket "Land Title Dispute Forensic", Bengaluru Civil
// Court. See note 2.

export const DF_AFFIDAVIT = {
  title: 'Affidavit',
  readyChip: 'Ready to Fill',
  docket: 'Docket DF-2026-1048',
  headline: 'Legal Affidavit',
  lead: 'Complete the affidavit for this report.',

  steps: {
    done: { title: 'Forensic Report', state: 'Ready' },
    now: { title: 'Affidavit', state: 'In Progress' },
    note: 'The affidavit is an essential companion verification document to the forensic report.',
  },

  summary: {
    label: 'MATTER SUMMARY',
    /** ⚠ Bengaluru Civil Court on design/228. See note 2. */
    court: 'High Court Indore',
    rows: [
      { label: 'Client Name', value: 'Vikramaditya Singhania' },
      { label: 'Request ID', value: 'DF-2026-1048', alt: true },
      /** ⚠ "Land Title Dispute Forensic" on design/228. See note 2. */
      { label: 'Matter', value: 'Signature & Document Forensic' },
      { label: 'Target Document', value: 'Property_Sale_Deed_1998.pdf', alt: true },
    ],
  },

  proforma: {
    label: 'PROFORMA VERIFICATION',
    title: 'AFFIDAVIT OF FORENSIC EXAMINATION',
    sub: 'BEFORE THE COMPETENT LEGAL AUTHORITY',
  },

  /** ⚠ Priya Sharma — see note 3. */
  deponent:
    'Deponent Identity: I, Adv. Priya Sharma, Advocate enrolled with State Bar Council (Enr: MP/1429/2014), aged 38 years, having my office at High Court Precinct, Indore, do hereby solemnly affirm and state on oath as under:',

  clauses: [
    '1. Scope & Engagement: That I was formally engaged under Request ID #DF-2026-1048 by client Vikramaditya Singhania to conduct a direct\nphysical and optical forensic evaluation of the questioned document titled\nProperty_Sale_Deed_1998.pdf.',
    '2. Methodology: That I examined the questioned signature on Page 4 against verified genuine reference specimens using 10x optical magnification, pen-stroke sequencing, and line-continuity analysis.',
    '3. Confirmation: That the findings set forth in the Preliminary Forensic Examination Report dated 19 Oct 2026 represent my true and honest professional evaluation without fear, bias, or external influence.',
    '4. Verification: That the contents of this affidavit are true to my personal professional knowledge and nothing material has been concealed therein.',
  ],

  edit: 'Edit Text',
  add: 'Add Info',
  save: 'Save',

  signature: {
    title: 'Advocate Signature',
    chip: 'Signed',
    sub: 'Sign to authenticate this formal affidavit',
    /**
     * ⚠ STATIC SVG PATH, drawn to match the export. There is NO signature capture
     * and no drawing surface anywhere in this flow — that capability is unscoped
     * and has not been agreed. Viewbox is 200×36.
     */
    path:
      'M2 26 C 10 18, 16 12, 24 16 C 32 20, 30 30, 38 30 C 46 30, 48 12, 56 10 C 64 8, 66 26, 74 27 C 82 28, 84 16, 92 17 C 100 18, 100 27, 108 27 C 116 27, 120 16, 128 15 C 136 14, 140 22, 150 21 C 160 20, 170 16, 182 13 C 190 11, 194 10, 198 9',
    underlinePath: 'M26 34 C 70 32, 130 31, 184 29',
    signedAt: 'Signed: 19 Oct 2026, 11:42 AM',
    enrLabel: 'Enr:',
    enrValue: 'MP/1429/2014',
    resign: 'Re-sign / Edit Signature',
  },

  file: {
    name: 'Affidavit.pdf',
    meta: '2 Pages • 240 KB • Ready to submit',
    by: 'Created by Legalitt',
    preview: 'Preview',
  },

  saveDraft: 'Save Draft',
  continue: 'Continue to Review & Submit',
};
