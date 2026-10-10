// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE VERIFICATION WIZARD — copy and fixtures for designs 233–244.
//
// UI-only. Nothing here is submitted, validated against a registry, or stored.
//
// ── CONFLICT REGISTER ───────────────────────────────────────────────────────
// Numbered so the screens can point at a note instead of repeating it. These are
// recorded, NOT resolved: every screen is built exactly as its PNG draws it.
//
// 1. THE STEPPER IS BROKEN. design/233 names four steps — Personal Details,
//    Professional Details, Documents, Review & Submit — but the wizard is six
//    screens (234 personal, 235 professional, 236 bar council, 237 practice,
//    238 documents, 239 review). The step indicators the exports draw repeat:
//    "Step 3 of 4" and "Step 4 of 4" each appear on two different screens. Each
//    screen renders the indicator its own PNG draws; none is renumbered.
//
// 2. TWO DIFFERENT ADVOCATES IN ONE SECTION. The verification screens are Rahul
//    Sharma (MP Bar Council, MP/1428/2018, Indore); the settings screens that
//    follow in the same batch are Priya Sharma (Bar Council of Delhi,
//    D/1842/2015, New Delhi). Both are kept as drawn.
//
// 4. EMAIL AND ADDRESS DRIFT between design/234's form and design/239's review
//    of that same form.
//
// 8. VER-2026-1048 is the fourth service in this project to use the 1048 suffix.
//
// 9. ⚠ AADHAAR IS BACK. design/238 asks for an Aadhaar card upload and design/240
//    confirms one was received. Aadhaar collection by a private party is legally
//    constrained in a way the other items on this list are not — this is a legal
//    problem, not a cosmetic one. Drawn as designed, uploaded by nothing, and
//    flagged here for the client to decide on before any of it is wired.
// ─────────────────────────────────────────────────────────────────────────────

export const AV_INTRO = {
  title: 'Advocate Verification',

  heading: 'Verify Your Advocate Profile',
  sub: 'Complete your professional verification to provide verified legal services on Legalitt.',

  benefits: [
    {
      title: 'Professional identity verification',
      sub: 'Confirms government-recognized attorney credentials',
    },
    {
      title: 'Bar Council & enrollment verification',
      sub: 'State Bar Council license and active standing check',
    },
    {
      title: 'Verified Advocate badge',
      sub: 'Builds immediate trust with clients on consultation requests',
    },
  ],

  stepsLabel: 'VERIFICATION STEPS',
  // Four names for six screens — see note 1.
  steps: ['Personal Details', 'Professional Details', 'Documents', 'Review & Submit'],

  note: "Verification requirements may vary based on your professional details and Legalitt's verification process.",

  cta: 'Start Verification',
  later: "I'll Do This Later",
};

export const AV_PERSONAL = {
  title: 'Personal Details',
  eyebrow: 'ADVOCATE ENROLLMENT',
  step: 'Step 1 of 4',
  filled: 1,

  note: 'Please enter your details as they appear on your professional records.',

  photo: {
    title: 'Profile Photo',
    sub: 'Optional · Clear legal headshot',
    action: 'Add Photo',
  },

  fullName: { label: 'Full Name', value: 'Rahul Sharma', helper: 'Must match Bar Council records' },
  dob: { label: 'Date of Birth', value: '14 / 08 / 1996' },
  // ⚠ Both of these carry a "Verified" pill on a form that has not been
  // submitted yet, and nothing in the project verifies either. Drawn as drawn.
  mobile: { label: 'Mobile Number', value: '+91 98260 44120', verified: 'Verified' },
  // ⚠ Note 4: design/239 reviews this form and shows a DIFFERENT email.
  email: { label: 'Email Address', value: 'adv.rahul.sharma@example.com', verified: 'Verified' },
  address: { label: 'Residential Address', value: 'Flat 402, Royal Palms, Scheme No. 54' },
  city: { label: 'City', value: 'Indore' },
  state: { label: 'State', value: 'Madhya Pradesh' },

  cta: 'Continue',
};

export const AV_PROFESSIONAL = {
  title: 'Professional Details',
  eyebrow: 'ADVOCATE ENROLLMENT',
  step: 'Step 2 of 4',
  filled: 2,

  note: 'These details help Legalitt create your verified professional profile.',

  credentials: 'PROFESSIONAL CREDENTIALS',
  name: {
    label: 'Professional Name',
    value: 'Adv. Rahul Sharma',
    helper: 'Will be displayed on client consultation requests',
  },
  qualification: { label: 'Qualification', value: 'LL.B (Hons.)' },
  year: { label: 'Year of Qual.', value: '2018' },
  practiceYears: { label: 'Years of Practice', value: '6+ Years Active Practice' },

  jurisdiction: 'JURISDICTION & PRACTICE',
  areas: {
    label: 'Primary Practice Areas',
    hint: 'Select top specialties',
    chips: [
      { label: 'Civil Matters', state: 'on' },
      { label: 'Family & Matrimonial', state: 'on' },
      { label: 'Consumer Disputes', state: 'on' },
      { label: 'Criminal Law', state: 'off' },
      { label: 'Corporate & Commercial', state: 'off' },
      { label: 'Add Area', state: 'add' },
    ] as const,
  },
  courts: {
    label: 'Courts Practiced In',
    chips: [
      { label: 'High Court of M.P. (Indore Bench)', state: 'on' },
      { label: 'District & Sessions Court, Indore', state: 'on' },
      { label: 'Supreme Court of India', state: 'off' },
      { label: 'DRT / NCLT', state: 'off' },
    ] as const,
  },
  languages: {
    label: 'Languages Spoken',
    chips: [
      { label: 'English', state: 'on' },
      { label: 'Hindi', state: 'on' },
      { label: 'Marathi', state: 'off' },
      { label: 'Gujarati', state: 'off' },
    ] as const,
  },
  city: { label: 'City of Practice', value: 'Indore' },
  state: { label: 'State of Practice', value: 'Madhya Pradesh' },

  chamber: 'CHAMBER SUMMARY',
  about: {
    label: 'About Your Practice',
    value:
      'Specialized in civil litigation, property documentation, matrimonial dispute settlement, and pre-litigation legal notices with 6+ years of court representation.',
    helper: 'Brief overview for litigants',
    // ⚠ Drawn as 168 characters. The string above is 161. Stored as drawn; the
    // counter is a label, not a computation, because nothing here is editable.
    counter: '168 / 300 characters',
  },

  cta: 'Continue',
  secondary: 'Save & Exit',
};

export const AV_BAR_COUNCIL = {
  title: 'Bar Council Details',
  eyebrow: 'ADVOCATE ENROLLMENT',
  // ⚠ Note 1 again, and this is where it breaks: design/235 said "Step 2 of 4"
  // and design/237 says "Step 4 of 4". This screen and design/237 therefore
  // skip nothing and overlap nothing — but design/238 ALSO says "Step 3 of 4".
  step: 'Step 3 of 4',
  filled: 3,

  note: {
    title: 'Professional Verification',
    body: 'Enter your enrollment details exactly as shown on your official State Bar Council license or Sanad.',
  },

  section: 'PROFESSIONAL REGISTRATION',

  council: {
    label: 'State Bar Council',
    mandatory: 'Mandatory',
    value: 'State Bar Council of Madhya Pradesh',
  },
  enrollment: {
    label: 'Enrollment Number',
    hint: 'Format: MP/1428/2018 or as issued by your State Bar Council',
    value: 'MP/1428/2018',
  },
  enrolledOn: { label: 'Enrollment Date', value: '18 / 07 / 2018' },
  status: { label: 'Certificate / Practice Status', value: 'Active / Sanad Issued (Authorized to Practice)' },
  place: { label: 'Place of Enrollment', value: 'Jabalpur / Indore Bench' },

  why: 'Why we ask for Bar Council details',

  cta: 'Continue to Identity Upload',
  secondary: 'Save & Exit',
};

export const AV_PRACTICE = {
  title: 'Practice Details',
  eyebrow: 'ADVOCATE ENROLLMENT',
  // ⚠ Note 1. "Step 4 of 4" with all four segments filled — and design/239,
  // the review screen, is still ahead of it.
  step: 'Step 4 of 4',
  filled: 4,

  note: {
    lead: 'Professional Profile',
    body: ' — You can update these details later from your profile settings.',
  },

  jurisdiction: {
    section: 'JURISDICTION & CHAMBERS',
    city: { label: 'PRIMARY CITY', value: 'Indore' },
    council: { label: 'STATE BAR COUNCIL', value: 'Madhya Pradesh' },
    courtsLabel: 'COURTS & FORUMS PRACTICING IN',
    courts: [
      { label: 'High Court of M.P. (Indore Bench)', state: 'on' },
      { label: 'District & Sessions Court, Indore', state: 'on' },
      { label: 'Supreme Court of India', state: 'add' },
      { label: 'Debt Recovery Tribunal (DRT)', state: 'add' },
    ] as const,
    // ⚠ A FOURTH chip style: a green dot instead of a tick, on a white fill
    // with a brand border, and the unselected chips are dashed rather than
    // solid. design/235 drew the same idea three ways already.
    specializationsLabel: 'PRACTICE SPECIALIZATIONS',
    specializations: [
      { label: 'Civil Matters', state: 'on' },
      { label: 'Commercial & Corporate', state: 'on' },
      { label: 'Family & Matrimonial', state: 'on' },
      { label: 'Banking & Finance', state: 'add' },
      { label: 'Criminal Law', state: 'add' },
    ] as const,
  },

  office: {
    section: 'OFFICE DETAILS',
    firm: { label: 'LAW FIRM NAME', value: 'Sharma & Associates Chamber' },
    // ⚠ The export clips this value mid-word ("…M.G. Road, Indor"). The full
    // string is stored and rendered whole; never ellipsized.
    address: {
      label: 'PHYSICAL CHAMBER ADDRESS',
      value: 'Suite 402, High Court Bar Chambers, M.G. Road, Indore',
    },
    modesLabel: 'AUTHORIZED CONSULTATION MODES',
    modes: [
      { name: 'Online Video', pill: 'Enabled', tone: 'green' },
      { name: 'In-Person', pill: 'At Chamber', tone: 'brand' },
    ] as const,
  },

  experience: {
    section: 'PRACTICE EXPERIENCE & SUMMARY',
    label: 'Brief Professional Profile Summary',
    value:
      'Over 6 years of active practice across High Court and District courts specializing in commercial disputes, property restitution, and arbitration advisory.',
    check: 'Includes key practice highlights',
    // Drawn as 148; the string above is 152. Stored as drawn — nothing is
    // editable, so the counter is a label, not a computation.
    counter: '148  /  300',
  },

  cta: 'Continue to Final Review',
  secondary: 'Save & Exit',
};

type VerifyDoc = {
  title: string;
  pill: string;
  status: string;
  tone: 'done' | 'idle' | 'busy';
  sub: string;
  file?: { name: string; size: string; action: string };
  progress?: number;
  upload?: string;
};

export const AV_DOCUMENTS = {
  title: 'Verification Documents',
  // ⚠ Note 1, and this is the duplicate: design/236 ALSO says "Step 3 of 4".
  step: 'STEP 3 OF 4',
  filled: 3,

  lead: 'Upload clear and valid documents for verification.',
  accepted: 'Accepted: PDF, JPG, PNG (Max 10MB per file)',

  docs: [
    {
      // ⚠ NOTE 9 — AADHAAR. This screen asks an advocate to upload an Aadhaar
      // card, and design/240 confirms one was received. Aadhaar collection by a
      // private party is legally constrained in a way nothing else on this list
      // is. Drawn as designed, uploaded by nothing, and flagged for a decision
      // before any of it is wired.
      title: 'Identity Document',
      pill: 'Required',
      status: 'Uploaded',
      tone: 'done',
      sub: 'Aadhaar Card, Passport, or Voter ID (Front & Back)',
      file: { name: 'rahul_sharma_aadhaar.pdf', size: '2.4 MB', action: 'Replace' },
    },
    {
      title: 'Enrollment Certificate',
      pill: 'Required',
      status: 'Not Uploaded',
      tone: 'idle',
      sub: 'Official Sanad or State Bar Council Certificate',
      upload: 'Upload Document',
    },
    {
      title: 'Certificate of Practice',
      pill: 'Required',
      // The export draws this mid-upload at 68%. The bar renders at its drawn
      // percentage and goes nowhere — see the screen's header comment.
      status: '68%',
      tone: 'busy',
      sub: 'All India Bar Exam (AIBE) Certificate or Membership',
      file: { name: 'aibe_cop_certificate.pdf', size: '', action: 'Uploading...' },
      progress: 0.68,
    },
    {
      // ⚠ PARTLY UNREADABLE IN THE EXPORT. design/238 composites its pinned
      // footer OVER this card, so only the tops of the title glyphs survive.
      // "Additional Document" is legible from the letterforms and the Upload
      // Document button below it is fully visible; the pill, the status and any
      // subtitle are covered and are NOT guessed at here beyond what the ghost
      // text supports. Reported rather than invented.
      title: 'Additional Document',
      pill: 'Optional',
      status: 'Not Uploaded',
      tone: 'idle',
      sub: '',
      upload: 'Upload Document',
    },
  ] as VerifyDoc[],

  privacy: {
    body: "Your documents are used for verification and handled according to Legalitt's privacy and document policies.",
    link: 'Learn more about document safety',
  },

  cta: 'Continue',
  secondary: 'Save & Exit',
};

type ReviewRow = { label: string; value: string; pill?: string; mono?: boolean; dot?: boolean };

export const AV_REVIEW = {
  eyebrow: 'ADVOCATE ENROLLMENT',
  title: 'Review & Submit',
  sub: 'Check your information before submitting for verification.',
  pill: 'Final Step • 4 of 4 Completed',
  filled: 4,

  sections: [
    {
      title: 'PERSONAL DETAILS',
      action: 'Edit',
      rows: [
        { label: 'Full Name', value: 'Adv. Rahul Sharma' },
        // ⚠ design/234 wrote this as "14 / 08 / 1996".
        { label: 'Date of Birth', value: '14 Aug 1996' },
        { label: 'Mobile', value: '+91 98260 44120', pill: 'Verified' },
        // ⚠ NOTE 4. design/234's form says adv.rahul.sharma@example.com.
        { label: 'Email', value: 'rahul.sharma@legalitt.in', pill: 'Verified' },
        // ⚠ NOTE 4. design/234's form says "Flat 402, Royal Palms, Scheme No. 54".
        { label: 'Address', value: '402, Royal Residency, M.G. Road, Indore, M.P. - 452001' },
      ] as ReviewRow[],
    },
    {
      title: 'PROFESSIONAL DETAILS',
      action: 'Edit',
      rows: [
        { label: 'Qualification', value: 'LL.B (Hons.), 2018' },
        // ⚠ design/235 selected Civil Matters, Family & Matrimonial and
        // Consumer Disputes. This review lists Civil Matters, Corporate &
        // Commercial and Matrimonial Disputes — two of the three differ.
        { label: 'Practice Areas', value: 'Civil Matters, Corporate & Commercial, Matrimonial Disputes' },
        { label: 'Courts', value: 'High Court of M.P. (Indore Bench), District & Sessions Court' },
        { label: 'Experience', value: '6+ Years Active Practice' },
      ] as ReviewRow[],
    },
    {
      title: 'BAR COUNCIL',
      action: 'Edit',
      rows: [
        { label: 'State Bar Council', value: 'State Bar Council of Madhya Pradesh' },
        { label: 'Enrollment Number', value: 'MP/1428/2018', mono: true },
        { label: 'Enrollment Date', value: '18 / 07 / 2018' },
        { label: 'Status', value: 'Active / Sanad Issued', dot: true },
      ] as ReviewRow[],
    },
  ],

  documents: {
    title: 'DOCUMENTS',
    action: 'View Documents',
    // ⚠ All three read "Verified" on a form that has not been submitted yet,
    // and design/238 drew the third one mid-upload at 68%. Drawn as drawn.
    rows: [
      { name: 'Identity Document', file: 'rahul_sharma_aadhaar.pdf (2.4 MB)', status: 'Verified' },
      { name: 'Enrollment Certificate', file: 'mp_bar_council_sanad.pdf (3.1 MB)', status: 'Verified' },
      { name: 'Professional Proof (COP)', file: 'aibe_cop_certificate.pdf (1.8 MB)', status: 'Verified' },
    ],
  },

  confirm: {
    title: 'I confirm that the information and documents provided are accurate and belong to me.',
    body: 'Submitted information may be reviewed by Legalitt before your profile receives verified status.',
  },

  bci: {
    lead: 'BCI Compliance & Data Privacy:',
    body: ' Information submitted is encrypted and strictly maintained for professional verification.',
  },

  cta: 'Submit for Verification',
  secondary: 'Save & Exit',
};

type WorkflowStep = { title: string; sub: string; state: 'done' | 'active' | 'idle'; pill?: string };

export const AV_SUBMITTED = {
  eyebrow: 'ADVOCATE ENROLLMENT',
  title: 'Verification Submitted',

  h1: 'Your Verification Is Under Review',
  sub: "We've received your professional verification details.",

  statusLabel: 'Verification Status',
  statusPill: 'Pending Review',
  submittedLabel: 'SUBMITTED',
  // ⚠ Dated 18 September 2026 — in the future relative to the build date, like
  // several other dates across this project. Drawn as drawn.
  submittedValue: '18 September 2026',
  referenceLabel: 'REFERENCE',
  // ⚠ NOTE 8: the fourth Legalitt service to use the 1048 suffix.
  referenceValue: 'VER-2026-1048',

  workflow: 'VERIFICATION WORKFLOW',
  steps: [
    { title: 'Information Submitted', sub: 'Personal & professional data saved', state: 'done' },
    // ⚠ NOTE 9 — Aadhaar again: this line confirms an Aadhaar upload was
    // received. See the header comment on app/advocate/verify/documents.tsx.
    { title: 'Documents Received', sub: 'Aadhaar, Sanad & COP uploaded', state: 'done' },
    {
      title: 'Verification Review',
      pill: 'IN PROGRESS',
      sub: 'Under review by Legalitt Compliance',
      state: 'active',
    },
    { title: 'Verified Advocate', sub: 'Profile badge and full client access unlocked', state: 'idle' },
  ] as WorkflowStep[],

  note: 'Legalitt will review your submitted information and documents. You can continue updating eligible profile details while verification is pending.',

  cta: 'View Verification Details',
  secondary: 'Back to Settings',
};

type IncompleteItem = {
  title: string;
  sub: string;
  state: 'todo' | 'done';
  action: string;
};

export const AV_INCOMPLETE = {
  eyebrow: 'ADVOCATE ENROLLMENT',
  title: 'Complete Verification',
  // ⚠ Note 1 again — a third "Step 3 of 4" (design/236 and design/238 both say
  // it too), on a screen that is not a wizard step at all.
  step: 'Step 3 of 4',

  h1: 'Verification Almost Complete',
  sub: 'A few details are still required before you can submit your advocate profile.',

  progressLabel: 'Verification Progress',
  progressValue: '75% Complete',
  progress: 0.75,
  progressCaption: '3 of 4 required sections completed',
  progressLeft: '1 Section Left',

  section: 'ITEMS NEEDED TO SUBMIT',
  // ⚠ "2 actions pending" against four rows, two of which are already complete.
  sectionMeta: '2 actions pending',

  items: [
    // ⚠ The export clips this subtitle at "or V(". The full string is stored
    // and rendered whole. Note 9 — Aadhaar again.
    { title: 'Identity Document', sub: 'Aadhaar Card, Passport, or Voter ID', state: 'todo', action: 'Upload' },
    { title: 'Enrollment Certificate', sub: 'Official Sanad or Bar Council', state: 'todo', action: 'Upload' },
    { title: 'Personal Details', sub: 'Contact info, address & basics', state: 'done', action: 'Completed' },
    // ⚠ Clipped in the export at "& pr". Stored whole.
    {
      title: 'Professional Details',
      sub: 'Qualifications, Bar Council & practice',
      state: 'done',
      action: 'Completed',
    },
  ] as IncompleteItem[],

  draft: {
    title: 'Draft Automatically Saved',
    body: 'You can step away anytime and pick up right where you left off. All uploaded documentation remains encrypted.',
  },

  cta: 'Complete Verification',
  secondary: 'Save & Exit for Now',
};

export const AV_NEEDS_UPDATE = {
  eyebrow: 'ADVOCATE ENROLLMENT',
  title: 'Verification Status',

  pill: 'Needs Attention',
  h1: 'Verification Needs Update',
  quote: '"We couldn\'t complete your verification with the information currently provided."',

  issue: {
    eyebrow: 'DOCUMENT ISSUE',
    title: 'Enrollment Certificate',
    pill: 'Action Required',
    body: 'The uploaded document could not be verified. Please ensure the Sanad or State Bar Council enrollment certificate is clearly readable and shows your official enrollment number.',
    action: 'Replace Document',
  },

  other: {
    title: 'OTHER SUBMITTED ITEMS',
    meta: '3 Approved',
    rows: ['Personal Details', 'Professional Details', 'Identity Document'],
    status: 'Verified',
  },

  note: 'Your previously approved items remain securely saved. Only the requested document will undergo expedited re-review upon resubmission.',

  cta: 'Update & Resubmit',
  secondary: 'Contact Support',
};

export const AV_COMPLETE = {
  eyebrow: 'ADVOCATE ENROLLMENT',
  title: 'Verification Complete',

  pill: 'CONFIRMED STATUS',
  h1: 'Verified Advocate',
  sub: 'Your professional profile has been successfully verified by Legalitt.',

  label: 'ADVOCATE',
  // ⚠ Drawn as "Adv. Rahul" — no surname, where every other screen in this flow
  // says "Adv. Rahul Sharma". Stored as drawn.
  name: 'Adv. Rahul',
  verified: 'Verified',
  enrollmentLabel: 'ENROLLMENT NUMBER',
  enrollmentValue: 'MP/1428/2018',
  verifiedOnLabel: 'VERIFIED ON',
  // ⚠ The same date design/240 gives as the SUBMISSION date, so the review
  // takes zero days. Both are in the future. Drawn as drawn.
  verifiedOnValue: '18 September 2026',

  badge: 'Legalitt Professional Verification Badge Active across client matching.',

  capabilitiesTitle: 'UNLOCKED ADVOCATE CAPABILITIES',
  capabilities: [
    {
      title: 'Verified profile badge',
      sub: 'Visible across Legalitt client searches and consultation requests.',
    },
    {
      title: 'Access to verified legal services',
      sub: 'Accept legal notice requests, document drafting, and client consultations.',
    },
    {
      title: 'Priority placement & direct client messaging',
      sub: 'Direct secure chambers for all matched client matters.',
    },
  ],

  disclaimer:
    'Legalitt verifies identity, practice credentials, and active enrollment. This verification indicates platform credential confirmation and does not constitute a Bar Council endorsement.',

  cta: 'View My Profile',
  secondary: 'Done',
};
