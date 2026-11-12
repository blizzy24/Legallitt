// ═════════════════════════════════════════════════════════════════════════════
// ADVOCATE FIR FLOW — copy for designs 214–220 and 449 (docs/flows/FIR-DRAFT-FLOW.md §2).
//
// Labels only. Every value (names, IDs, fees, dates, documents) comes from the API:
// GET /fir/:id/flow, GET /cases/:id and GET /fir/:id/draft-context. The fixture
// values these designs were drawn with are not kept.
//
// Copy follows the flow's [DECIDE] proposals and leaves out its [REMOVE] items:
// no KYC Verified / Verified Client / Verified Complainant, no Escrow line, no
// "All Verified" / "Signed", no SMS, no Resend Review Link, no Preview Switcher,
// no IPC numbers, and the proforma header never implies a police office wrote it.
// Lines marked "not drawn" have no design; they are listed for §9.2.
// ═════════════════════════════════════════════════════════════════════════════

// ── design/215 — FIR request details (A2) ────────────────────────────────────
export const FIR_REQUEST = {
  title: 'Fir Request Details',
  statusChip: 'New Request',
  recv: 'Recv:',
  idLabel: 'FIR Request ID:',
  stationLabel: 'Police Station:',
  client: {title: 'Client Details', name: 'CLIENT NAME', city: 'CITY', mobile: 'MOBILE', email: 'EMAIL'},
  incident: {title: 'Incident Overview', type: 'Incident Type', when: 'Date & Time', where: 'Incident Location'},
  statement: {title: "Client's Statement"},
  // [DECIDE] A2: only what the advocate receives, from the price snapshot.
  fee: {title: 'Fee Structure', advocateLabel: 'YOU WILL RECEIVE', missing: 'The fee for this request isn’t recorded yet.'},
  documents: {title: 'Documents', files: (n: number) => `${n} ${n === 1 ? 'File' : 'Files'}`, none: 'No documents were uploaded with this request.',
    warn: 'Review documents thoroughly before accepting this request.'},
  reject: 'Reject',
  accept: 'Accept Request',
  rejectCaption: 'Reject → Returns to Admin',
  acceptCaption: 'Accept → Review & Draft',
  // Not drawn: the accept confirmation and the required reject reason (flow A2 taps).
  acceptConfirm: {title: 'Accept this request?', body: 'You’ll review the client’s documents next, then prepare the FIR draft.', confirm: 'Accept Request', cancel: 'Not yet'},
  rejectSheet: {title: 'Reject this request?', body: 'Tell Legalitt why. The request returns to the admin for reassignment and you’ll no longer have access to it.',
    label: 'Reason for rejecting', placeholder: 'For example: conflict of interest, outside my jurisdiction', required: 'Enter a reason before rejecting.',
    confirm: 'Reject Request', cancel: 'Cancel'},
};

// ── design/216 — review documents (A3) ───────────────────────────────────────
export const FIR_DOCUMENTS = {
  title: 'Review Documents',
  accepted: {title: 'Request Accepted', body: 'You accepted this request. Please review the documents before drafting.'},
  client: {label: 'CLIENT'},
  documents: {heading: 'Client Documents', view: 'View', none: 'The client didn’t upload any documents.'},
  info: {heading: 'Client Information', date: 'Incident Date', place: 'Incident Place', people: 'People Involved'},
  description: {heading: "Client's Description", chip: 'Original text from client'},
  continue: 'Continue to FIR Draft',
  caption: 'Proceed to draft creation and FIR information',
};

// ── design/217 — FIR draft generator (A4) ────────────────────────────────────
export const FIR_GENERATOR = {
  title: 'Fir Draft Generator',
  readyChip: 'Ready to Create',
  lead: 'Check the details and create the FIR draft.',
  complainant: {title: 'Complainant Details', name: 'FULL NAME', father: 'FATHER / HUSBAND NAME', address: 'ADDRESS', mobile: 'MOBILE NUMBER'},
  incident: {title: 'Incident Details', date: 'Date', time: 'Time', place: 'Place', station: 'Police Station'},
  people: {title: 'People Involved', added: (n: number) => `${n} Added`, add: 'Add Person', complainant: 'Complainant', accused: 'Accused', witness: 'Witness',
    complainantRole: 'Aggrieved / Complainant', unknown: 'Unknown person'},
  happened: {title: 'What Happened?', sub: "Client's original description. You can edit or add details below.",
    savedSub: (v: number) => `From your saved draft v${v}. You can edit or add details below.`, countSuffix: 'characters'},
  other: {title: 'Other Information', sub: 'Add any extra details or advocate observations.', placeholder: 'Add any missing information.'},
  documents: {title: 'Documents', attached: (n: number) => `${n} Attached`, view: 'View Documents'},
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
    // [DECIDE] A4: FIR AI generation (D-08) is not built.
    aiSoon: 'AI drafting is coming soon. Use Create Manually.',
    manual: 'Create Manually',
    manualCaption: 'Open FIR draft proforma with editable fields',
  },
};

// ── design/218 — FIR draft proforma editor (A5) ──────────────────────────────
export const FIR_DRAFT = {
  eyebrow: 'WORKSPACE',
  title: 'Fir Draft',
  docket: 'Docket',
  saved: (ago: string) => `Saved ${ago}`,
  autoSaved: (ago: string) => `Auto-saved ${ago}`,
  // [DECIDE] A5: the header names where it will be filed, never "Madhya Pradesh Police State Command".
  // Below it, the proforma's own name as drawn.
  proforma: {
    header: (place: string) => place ? `FIR DRAFT — Prepared for submission at ${place}` : 'FIR DRAFT',
    title: 'FIRST INFORMATION REPORT', form: 'FORM I — Police Information Proforma', under: 'Under Section 173 BNSS',
  },
  sections: {
    station: 'Police Station & Filing Time', complainant: 'Complainant / Reporter Info', when: 'When and Where It Happened',
    accused: 'Accused Person(s)', legal: 'Applicable Legal Sections', facts: 'Statement of Facts', witnesses: 'Witnesses', attached: 'Attached Documents',
  },
  legal: {hint: 'Tap × to remove any section not needed for this complaint.', add: '+ Add Legal Section', count: (n: number) => `${n} ${n === 1 ? 'Section' : 'Sections'}`},
  facts: {note: 'Full Narrative', words: (n: number) => `${n} Words • Editable`, edit: 'Edit text'},
  accused: {note: 'Known / Suspected', add: '+ Add Accused / Person', main: 'Main Accused Name', others: 'Other People Involved', vehicle: 'Vehicle Used', motive: 'Suspected Reason / Motive'},
  witnesses: {add: '+ Add Witness', label: (n: number) => `Witness ${n}`},
  attached: {included: (n: number) => `${n} Included`, add: '+ Attach Additional Document'},
  save: 'Save Draft',
  // [DECIDE] A5: the admin approves before the client sees the draft.
  send: 'Send for Review',
  caption: 'Send for Review opens FIR Review & Status',
};

// ── designs 219 / 449 — FIR review & status (A6) ─────────────────────────────
export const FIR_REVIEW = {
  title: 'Fir Review',
  client: {label: 'CLIENT DETAILS'},
  draft: {title: 'FIR Draft', proforma: 'Statutory Police Proforma', view: 'View Draft'},
  timeline: {label: 'FILING TIMELINE'},
  audit: {label: 'AUDIT LOG & HISTORY'},
  waitingClient: {title: 'Waiting for Client Review', body: (client: string) => `The FIR draft has been sent to ${client}.`,
    note: 'The client has received the draft in the Legalitt Client App. You will be notified the moment they respond.', remind: 'Remind Client'},
  continue: 'Continue',
};

// ── design/220 — FIR completed (A7) ──────────────────────────────────────────
export const FIR_COMPLETED = {
  title: 'Fir Completed',
  // [DECIDE] A7: the design's "FIR Submitted Successfully" is replaced.
  headline: 'FIR Draft Completed',
  body: 'The client approved your draft.',
  caseCard: {label: 'CASE', chip: 'Completed', client: 'Client', request: 'Request ID', service: 'Service', serviceName: 'FIR Draft'},
  payment: {label: 'YOUR PAYMENT', chip: 'Added to Wallet', unit: 'INR', body: 'This amount has been added to your Legalitt wallet.',
    date: 'Payment Date', addedTo: 'Added To', wallet: (reference: string) => `Wallet (${reference})`},
  steps: {label: 'COMPLETED STEPS'},
  primary: 'View Earnings',
  secondary: 'View FIR',
};
