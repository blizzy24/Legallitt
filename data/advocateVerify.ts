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
