// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE SETTINGS — copy and fixtures for designs 245–260.
//
// UI-only. Nothing here is read from or written to anything.
//
// ── CONFLICT REGISTER ───────────────────────────────────────────────────────
// Numbered so screens can point at a note instead of repeating it. Recorded,
// NOT resolved: every screen is built exactly as its PNG draws it.
//
// 2. TWO DIFFERENT ADVOCATES IN ONE BATCH. designs 233–244 are Rahul Sharma
//    (MP Bar Council, MP/1428/2018, Indore); designs 245–260 are Priya Sharma
//    (Bar Council of Delhi, D/1842/2015, New Delhi).
//
// 3. THE BANK ACCOUNT CHANGES MID-FLOW. design/256 shows HDFC Bank, Current
//    account, ••••4821. designs 257–260 show SBI, Savings, ••••4821 — same
//    last four digits, different bank and different account type.
//
// 5. design/255 says "5 Available" and lists two languages. The written spec
//    for that screen says seven.
//
// 6. design/253's HEADER SAYS "App Permissions" while its body is a list of
//    Authorized Devices. Two different screens' chrome on one export.
//
// 7. design/256's header is CLIPPED IN THE EXPORT, reading "ment And Payout
//    Setting". The full string is stored and rendered whole.
//
// 10. design/258 renders a full bank account number in plain text.
//
// ⚠ PALETTE: this whole section is drawn on #F4F6F8, a cool blue-grey, where
// every other screen in the project uses the warm #FAF8F5. See the header of
// constants/tokens/advSettings.ts.
// ─────────────────────────────────────────────────────────────────────────────

export type SettingsRow = {
  key: string;
  icon: string;
  title: string;
  sub?: string;
  value?: string;
  toggle?: boolean;
  href?: string;
};

export type SettingsSection = { title?: string; rows: SettingsRow[] };

export const AS_ROOT = {
  title: 'Settings',

  profile: {
    name: 'Priya Sharma',
    badge: 'Verified Advocate',
    email: 'Priya.sharma@gmail.com',
    action: 'Edit Profile',
  },

  sections: [
    {
      title: 'Account',
      rows: [
        {
          key: 'edit',
          icon: 'user',
          title: 'Edit Profile',
          sub: 'Update your personal and professional details',
          href: '/advocate/settings/edit-profile',
        },
        {
          key: 'verify',
          icon: 'badge',
          title: 'Advocate Verification',
          sub: 'Verify your professional identity and credentials',
          href: '/advocate/verify/intro',
        },
        {
          key: 'password',
          icon: 'lock',
          title: 'Change Password',
          sub: 'Update your account password securely',
          href: '/advocate/settings/password',
        },
        {
          key: 'security',
          icon: 'login',
          title: 'Login & Security',
          sub: 'Manage security, sessions and devices',
          href: '/advocate/settings/security',
        },
        {
          key: 'documents',
          icon: 'docs',
          title: 'Manage Documents',
          sub: 'Manage your verification and documents',
          href: '/advocate/settings/documents',
        },
      ],
    },
    {
      title: 'Notification',
      rows: [
        {
          key: 'booking',
          icon: 'users',
          title: 'Booking Request',
          sub: 'Received alerts for new consultation request',
          toggle: true,
        },
        {
          key: 'reminders',
          icon: 'bell',
          title: 'Appointment Reminders',
          sub: 'Get Reminder before scheduled consultations.',
          toggle: true,
        },
        {
          key: 'messages',
          icon: 'chat',
          title: 'Client Messages',
          sub: 'Receive notifications for new client messages',
          toggle: true,
        },
        {
          key: 'payments',
          icon: 'coins',
          title: 'Payment Notifications',
          sub: 'Get Notified when payments are received',
          toggle: true,
        },
      ],
    },
    {
      title: 'Consultation Availability',
      rows: [
        {
          key: 'available',
          icon: 'clock',
          title: 'Available for Consultations',
          sub: 'Client can book consultations during your available hours.',
          toggle: true,
        },
      ],
    },
    {
      title: 'Consultation Preference',
      rows: [
        { key: 'video', icon: 'video', title: 'Video Consultation', toggle: true },
        { key: 'voice', icon: 'mic', title: 'Voice Consultation', toggle: true },
      ],
    },
    {
      title: 'Privacy & Security',
      rows: [
        {
          key: 'privacy',
          icon: 'user',
          title: 'Privacy Settings',
          sub: 'Control your privacy preferences',
          href: '/advocate/settings/privacy',
        },
        {
          key: 'permissions',
          icon: 'lock',
          title: 'App Permissions',
          sub: 'Manage app permissions',
          href: '/advocate/settings/permissions',
        },
        {
          key: 'sessions',
          icon: 'login',
          title: 'Active Sessions',
          sub: 'View and manage active sessions',
          href: '/advocate/settings/devices',
        },
        {
          key: 'data',
          icon: 'docs',
          title: 'Data & Documents',
          sub: 'Manage your data and documents',
          href: '/advocate/settings/data',
        },
      ],
    },
    {
      title: 'Preferences',
      rows: [
        {
          key: 'language',
          icon: 'lang',
          title: 'Language',
          sub: 'English',
          href: '/advocate/settings/language',
        },
      ],
    },
    {
      title: 'Payment & Payout settings',
      rows: [
        {
          key: 'payout',
          icon: 'card',
          title: 'Payment & Payout Settings',
          sub: 'Manage payouts and preferences',
          href: '/advocate/settings/payout',
        },
        {
          key: 'bank',
          icon: 'bank',
          title: 'Bank Account',
          sub: 'System Default',
          href: '/advocate/settings/bank',
        },
      ],
    },
  ] as SettingsSection[],
};

export const AS_EDIT_PROFILE = {
  eyebrow: 'ADVOCATE ACCOUNT',
  title: 'Edit Profile',

  name: 'Adv. Priya Sharma',
  badge: 'Verified Advocate',
  meta: 'priyasharma@gmail.com • Bar Council of Delhi',
  changePhoto: 'Change Profile Photo',

  personalTitle: 'PERSONAL INFORMATION',
  personal: [
    { label: 'Full Name', value: 'Priya Sharma' },
    { label: 'Date of Birth', value: '12 Oct 1991', icon: 'calendar' },
    { label: 'Mobile Number', value: '+91 98102 33419', pill: 'Verified' },
    { label: 'Email Address', value: 'priyasharma@gmail.com', pill: 'Verified' },
    { label: 'Residential Address', value: 'Flat 402, Judicial Enclave, Sector 15' },
  ],
  city: { label: 'City', value: 'New Delhi' },
  state: { label: 'State', value: 'Delhi (NCT)' },

  professionalTitle: 'PROFESSIONAL INFORMATION',
  chamber: { label: 'Professional / Chamber Name', value: 'Chambers of Adv. Priya Sharma' },
  qualification: { label: 'Qualification', value: 'B.A. LL.B (Hons.), LL.M (Constitutional Law)' },
  years: { label: 'Years of Practice', value: '9+ Years' },
  // ⚠ Note 2 — D/1842/2015, Bar Council of Delhi. The verification flow at
  // designs 233–244 enrolls MP/1428/2018 with the MP Bar Council.
  enrollment: { label: 'Bar Enrollment No', value: 'D/1842/2015', locked: true },

  areas: {
    label: 'Practice Areas',
    action: '+ Add Area',
    chips: ['Civil Litigation', 'Corporate Law', 'Arbitration & Mediation', 'Family & Matrimonial'],
  },
  courts: {
    label: 'Courts Practiced In',
    action: '+ Add Court',
    chips: ['Supreme Court of India', 'Delhi High Court', 'Patiala House District Court'],
  },
  languages: { label: 'Languages', value: 'English, Hindi, Punjabi' },
  about: {
    label: 'About Your Practice',
    value:
      'Experienced legal counsel specializing in civil litigation, commercial dispute resolution, and contractual drafting before the High Court of Delhi and subordinate tribunals. Dedicated to ethical legal advisory and prompt client resolution.',
  },

  note: 'Bar Council enrollment and verified identity details can only be changed by submitting re-verification documents to Legalitt Compliance.',

  cta: 'Save Changes',
  secondary: 'Cancel',
};

export const AS_PASSWORD = {
  eyebrow: 'ACCOUNT SECURITY',
  title: 'Change Password',
  sub: 'Update your password to keep your account secure.',

  fields: [
    { label: 'Current Password', placeholder: 'Enter current password' },
    { label: 'New Password', placeholder: 'Enter new password' },
    { label: 'Confirm New Password', placeholder: 'Confirm new password' },
  ],

  reqTitle: 'PASSWORD REQUIREMENTS',
  // ⚠ The export draws all four in ONE state, with all three fields empty, so
  // there is no validation state to build. Static, per the brief.
  requirements: ['8+ characters', '1 uppercase', '1 number', '1 special symbol'],

  forgot: 'Forgot Password?',
  cta: 'Update Password',
  note: 'Active courtroom and portal sessions across other authenticated devices remain verified and active.',
};

export const AS_DOCUMENTS = {
  eyebrow: 'ADVOCATE CREDENTIALS',
  title: 'Manage Documents',

  // ⚠ PAIR B. Two headers for one screen. design/248 draws the compact card,
  // design/250 the illustrated hero — and 250's eyebrow and body differ too.
  heroCompact: {
    eyebrow: 'REGULATORY FILINGS',
    title: 'Professional Records',
    // ⚠ Clipped in the export at "and bar…". Stored and rendered whole.
    body: 'View and manage your verified advocate credentials and bar records.',
  },
  heroIllustrated: {
    eyebrow: 'REGULATORY FILINGS & RECORDS',
    title: 'Professional Records',
    body: 'View and manage your uploaded professional documents and bar credentials.',
  },

  cta: 'Upload New Document',

  // ⚠ The last chip is clipped in both exports, reading "Othe". Stored whole.
  chips: ['All (3)', 'Verification (2)', 'Professional (1)', 'Other'],

  docs: [
    {
      // ⚠ Clipped in both exports at "Enrollment Certificat".
      title: 'Enrollment Certificate',
      sub: 'State Bar Council Sanad',
      meta: 'Uploaded: 18 Sep 2026',
      size: '4.2 MB',
      kind: 'PDF',
      status: 'Verified',
      tone: 'done',
    },
    {
      // ⚠ Clipped in both exports at "Certificate of Pr".
      title: 'Certificate of Practice',
      sub: 'All India Bar Exam (AIBE)',
      meta: 'Uploaded: 18 Sep 2026',
      size: '3.8 MB',
      kind: 'PDF',
      status: 'Pending Review',
      tone: 'pending',
    },
    {
      title: 'Identity Document',
      sub: 'Government Photo ID',
      meta: 'Uploaded: 18 Sep 2026',
      size: '4.4 MB',
      kind: 'PDF',
      status: 'Verified',
      tone: 'done',
    },
  ] as const,

  view: 'View',
  replace: 'Replace',

  add: {
    title: 'Add Additional Credential',
    sub: 'Chamber accreditation, LL.M or High Court registry',
  },

  vault: {
    title: 'VAULT ALLOCATION',
    meta: '3 documents • 12.4 MB',
    fill: 0.3,
    // ⚠ The one copy change between the pair: design/248 ends "remain sealed.",
    // design/250 ends "remain sealed and private."
    note248: 'End-to-end encrypted under Bar Council standards. Document numbers remain sealed.',
    note250:
      'End-to-end encrypted under Bar Council standards. Document numbers remain sealed and private.',
  },
};

export const AS_SECURITY = {
  eyebrow: 'ACCOUNT SECURITY',
  title: 'Login & Security',

  pill: 'BAR COUNCIL IDENTITY SHIELD',
  h1: 'Login & Security Overview',
  sub: 'Manage how you sign in and keep your advocate credentials safe and verified.',

  loginTitle: 'LOGIN INFORMATION',
  login: [
    { label: 'Email Address', value: 'priyasharma@gmail.com', pill: 'Verified' },
    { label: 'Mobile Number', value: '+91 98102 •••••', pill: 'Verified' },
  ],

  controlsTitle: 'SECURITY CONTROLS',
  controls: [
    {
      icon: 'phone',
      title: 'Two-Step Verification',
      sub: 'Authenticate high-value actions & client escrow files.',
    },
    { icon: 'bell', title: 'Login Alerts', sub: 'Instant SMS and secure email notice on new sessions.' },
  ],

  passwordTitle: 'PASSWORD',
  password: {
    title: 'Change Password',
    // ⚠ Clipped in the export at "(Court Rec". Stored and rendered whole.
    sub: 'Last modified 3 months ago (Court Records)',
  },

  sessionsTitle: 'ACTIVE SESSIONS',
  devices: { title: 'Active Devices', sub: '2 devices authorized and active' },
  signOut: {
    title: 'Sign Out of All Devices',
    // ⚠ Clipped in the export at "companio". Stored whole.
    sub: 'Terminates web portals and companion devices',
  },

  note: 'Your advocate profile is safeguarded with State Bar Council verified dual keys and end-to-end encrypted docket sessions.',
};

export const AS_PRIVACY = {
  eyebrow: 'PRIVACY & PREFERENCES',
  title: 'Privacy Settings',
  pill: 'ADVOCATE PRIVACY CONTROL',
  h1: 'Privacy & Visibility',
  sub: 'Control how your professional profile, courtroom status, and client communications are visible on Legalitt.',

  visibilityTitle: 'PROFILE VISIBILITY',
  visibilityMeta: 'Publicly Regulated',
  visibility: [
    {
      title: 'Show Professional Profile',
      sub: 'Allow verified litigants to view your public advocate docket',
    },
    { title: 'Show Online Status', sub: "Let clients see when you're active and available for briefings" },
  ],

  commsTitle: 'COMMUNICATION PRIVACY',
  comms: [
    { title: 'Read Receipts', sub: 'Show clients when you have read their case-related inquiries', toggle: true },
    {
      title: 'Call Privacy',
      sub: 'Control who can initiate secure video and voice consults',
      pill: 'Verified Clients Only',
    },
    { title: 'Message Requests', sub: 'Screen unsolicited advisory and representation inquiries', pill: 'Filtered' },
  ],

  dataTitle: 'DATA PREFERENCES',
  data: [
    {
      title: 'Personalized Recommendations',
      sub: 'Receive case briefs matched strictly to your court jurisdiction',
      toggle: true,
    },
    { title: 'Data Sharing Preferences', sub: 'Manage regulatory compliance audits and court telemetry' },
  ],

  note: {
    title: 'Advocate Privilege & Confidentiality',
    body: 'Advocate confidentiality and client privilege are strictly guarded under Bar Council of India professional ethics standards.',
  },
};

export const AS_PERMISSIONS = {
  eyebrow: 'DEVICE & PRIVACY',
  title: 'App Permissions',
  pill: 'DEVICE ACCESS & PRIVACY',
  h1: 'System Permissions',
  sub: 'Manage the permissions Legalitt uses on your device.',

  permissions: [
    { icon: 'camera', title: 'Camera', sub: 'Required for video consultations', status: 'Allowed', tone: 'allowed' },
    { icon: 'mic', title: 'Microphone', sub: 'Required for voice and video consultations', status: 'Allowed', tone: 'allowed' },
    { icon: 'bell', title: 'Notifications', sub: 'Receive booking and payment alerts', status: 'Allowed', tone: 'allowed' },
    { icon: 'folder', title: 'Photos & Files', sub: 'Upload documents and profile photos', status: 'Allowed', tone: 'allowed' },
    { icon: 'pin', title: 'Location', sub: 'Used when location-based features are enabled', status: 'Not Allowed', tone: 'denied' },
  ] as const,

  system: { title: 'System Settings', sub: 'Configure device-level permissions', action: 'Open Settings' },
  note: 'You can change permissions from your device settings. Legalitt only accesses hardware during active sessions under strict client confidentiality.',
};

export const AS_DEVICES = {
  // ⚠ NOTE 6: design/253's header says "App Permissions" — the same header
  // design/252 draws — while its body is Authorized Devices. Built as drawn.
  eyebrow: 'DEVICE & PRIVACY',
  title: 'App Permissions',
  pill: 'DEVICE AUTHORIZATION & PRIVACY',
  h1: 'Authorized Devices',
  sub: 'View and manage devices currently signed in to your account. Revoke access immediately if you recognize suspicious activity.',

  currentTitle: 'CURRENT ACTIVE SESSION',
  currentMeta: '1 DEVICE',
  current: {
    name: 'This Device',
    sub: 'Windows 11 • Google Chrome',
    where: 'New Delhi, India • Active now',
    pill: 'Current',
    note: 'Session secured via Bar Council two-factor token. Client consultation escrow access enabled.',
  },

  othersTitle: 'OTHER AUTHORIZED SESSIONS (2)',
  othersAction: 'Sync',
  others: [
    {
      name: 'Android Phone',
      sub: 'Android 14 • Legalitt Mobile',
      where: 'Mumbai, India • 12 mins ago',
      net: 'High Court Chambers Wi-Fi',
      // ⚠ Partly masked in the export; stored exactly as drawn.
      ip: 'IP: 103.21.***.***',
    },
    {
      name: 'iPhone 15 Pro',
      sub: 'iOS 18 • Safari Mobile',
      where: 'Bengaluru, India • Yesterday, 6:45 PM',
      net: 'Cellular Network',
      ip: 'IP: 49.36.***.***',
    },
  ],
  signOutAll: 'Sign Out All Other Devices',
  signOutNote: 'You will remain signed in only on this Windows workstation.',
  note: 'Legalitt enforces Bar Council identity protection. Signing out terminates all active client case docket viewers and pending biometric authorizations on remote devices.',
};

export const AS_DATA = {
  eyebrow: 'DATA & PRIVACY',
  title: 'Data & Documents',
  pill: 'ACCOUNT DATA & RECORDS',
  h1: 'Data & Documents',
  sub: 'Manage your Legalitt account data and stored documents.',

  yourDataTitle: 'YOUR DATA',
  yourData: [
    // ⚠ Both subtitles are clipped in the export, at "your acc" and "inform".
    // Stored and rendered whole.
    { icon: 'user', title: 'Personal Information', sub: 'View the information stored in your account' },
    { icon: 'archive', title: 'Download Account Data', sub: 'Request a copy of your account information' },
  ],

  documentsTitle: 'DOCUMENTS',
  documents: [
    { icon: 'folder', title: 'My Documents', sub: 'View uploaded documents', pill: '3 Files' },
    { icon: 'cloud', title: 'Storage', sub: '12.4 MB used of 1 GB', pill: '1.2%' },
  ],

  actionsTitle: 'DATA ACTIONS',
  // ⚠ STATIC, AND THESE TWO IN PARTICULAR. "Download My Data" and "Delete
  // Account" are the DPDP Act's portability and erasure duties. They are real
  // legal obligations. They are DRAWN here and WIRED TO NOTHING, deliberately.
  actions: [
    { icon: 'cloud', title: 'Download My Data', sub: 'Export available account data' },
    // ⚠ Clipped in the export at "Legalitt acc". Stored whole.
    { icon: 'trash', title: 'Delete Account', sub: 'Permanently remove your Legalitt account', danger: true },
  ],

  note: {
    title: 'BCI Privacy Standard',
    body: 'Your advocate profile data and client dockets are encrypted according to Bar Council of India digital privacy and data protection norms.',
  },
};

export const AS_LANGUAGE = {
  eyebrow: 'PREFERENCES & ACCESSIBILITY',
  title: 'Language',
  pill: 'APP PREFERENCES',
  h1: 'Choose Your Language',
  sub: "Select the primary language you'd like to navigate, draft notes, and manage dockets in Legalitt.",

  sectionTitle: 'SUPPORTED JURISDICTION LANGUAGES',
  // ⚠ NOTE 5: the export says "5 Available" and lists TWO. The written spec for
  // this screen says seven. Drawn as drawn — two rows, the label "5 Available".
  sectionMeta: '5 Available',
  languages: [
    { code: 'EN', name: 'English', sub: 'Default (India / International)', pill: 'Active', on: true },
    { code: 'हि', name: 'Hindi', sub: 'हिन्दी (भारत)', on: false },
  ],

  note: {
    title: 'BCI & High Court Rules Note',
    body: 'Court pleadings, legal notice drafts, and statutory citations remain strictly aligned with the official court language and high court regional rules.',
  },
  cta: 'Save Language',
};

export const AS_PAYOUT = {
  eyebrow: 'SETTINGS',
  // ⚠ NOTE 7: the export CLIPS this header, rendering "ment And Payout Setting".
  // The full string is stored and rendered whole.
  title: 'Payment And Payout Settings',
  pill: 'FINANCIAL ACCOUNTS & SETTLEMENT',
  h1: 'Payment & Payout Settings',
  sub: 'Manage your linked settlement bank accounts, payout schedules, and earnings records.',

  statusLabel: 'Payout Status',
  statusPill: 'Active',
  totalLabel: 'TOTAL EARNINGS',
  totalValue: '₹84,500',
  pendingLabel: 'PENDING PAYOUT',
  pendingValue: '₹6,800',
  settlement: 'Next automatic settlement initiates on Friday via RTGS/NEFT.',

  prefsTitle: 'PAYOUT PREFERENCES',
  // ⚠ NOTE 3: HDFC Bank, Current Account here. designs 257–260 show SBI,
  // Savings, same last four digits. Clipped in the export at "Current Accou";
  // stored and rendered whole.
  bank: { title: 'Bank Account', sub: '••••4821 (HDFC Bank • Current Account)', pill: 'Primary' },
  // ⚠ Clipped at "Every Fri". Stored whole.
  schedule: { title: 'Payout Schedule', sub: 'Current settlement schedule: Weekly (Every Friday)' },

  infoTitle: 'PAYMENT INFORMATION',
  info: [
    { icon: 'trend', title: 'Earnings History', sub: 'View your earnings and consultation fees' },
    { icon: 'receipt', title: 'Payout History', sub: 'View completed and pending payouts' },
    // ⚠ Clipped at "payment re". Stored whole.
    { icon: 'file', title: 'Receipts & Invoices', sub: 'View and download tax invoices and payment receipts' },
  ],

  note: 'Platform fees and applicable charges are shown before final earnings are settled. Payout information is synchronized directly with your verified advocate bank records.',
};

export const AS_BANK = {
  eyebrow: 'FINANCIAL SETTINGS',
  title: 'Bank Account',
  pill: 'SETTLEMENT ACCOUNT',
  h1: 'Bank Account',
  sub: 'Manage your verified bank account for Legalitt consultation fee payouts and professional settlements.',
  banner: 'Bank Account Verified • Active for Payouts',

  // ⚠ NOTE 3: SBI, Savings here; design/256 one tap back says HDFC, Current.
  bank: { name: 'State Bank of India', sub: 'Primary Settlement Account', pill: 'Primary' },
  details: [
    { label: 'Account Holder', value: 'Priya Sharma', verified: true },
    { label: 'Account Number', value: '•••• •••• 4821' },
    { label: 'IFSC Code', value: 'SBIN0001234' },
    { label: 'Account Type', value: 'Savings Account' },
    { label: 'Branch', value: 'High Court Branch, New Delhi' },
  ],

  payoutTitle: 'PAYOUT ACCOUNT',
  payoutBody:
    'This account is used for your Legalitt payouts. Payouts are transferred automatically on scheduled settlement dates.',
  payoutCta: 'Update Bank Account',

  verificationTitle: 'VERIFICATION STATUS',
  verification: [
    { icon: 'id', title: 'Account Holder', pill: 'Verified' },
    { icon: 'bank', title: 'Bank Details', pill: 'Verified' },
    // ⚠ STATIC. There is no penny-drop here and no payment rail anywhere in
    // this project. "Matched" is a drawn label.
    { icon: 'cash', title: 'Penny Drop Test', pill: 'Matched' },
  ],

  note: {
    title: 'Regulatory Trust & Encryption',
    body: 'For your security, sensitive banking information is partially hidden. Legalitt encrypts all banking details in compliance with Bar Council and RBI settlement guidelines.',
  },
};

export const AS_BANK_UPDATE = {
  title: 'Update Bank Account',
  eyebrow: 'DIRECT DEPOSIT SETUP',
  h1: 'Enter your bank details.',
  sub: 'Add your trusted bank account so legal consultation earnings arrive smoothly and on schedule.',

  cardTitle: 'Bank Details',
  cardSub: 'Linked advocate payout profile',
  cardPill: 'Active Link',

  holder: { label: 'Account Holder Name', hint: 'As on passbook', value: 'Priya Sharma' },
  // ⚠ NOTE 10: design/258 renders the FULL account number in plain text, twice.
  // Every other screen in this flow masks it to "•••• 4821". Drawn as drawn and
  // flagged: this is a disclosure decision, not a styling one.
  account: { label: 'Account Number', value: '987654324821' },
  confirm: {
    label: 'Confirm Account Number',
    pill: 'Matches',
    value: '987654324821',
    helper: 'Re-enter your numbers carefully to prevent payment delays.',
  },
  ifsc: { label: 'IFSC Code', pill: 'Branch Verified', value: 'SBIN0001234' },
  bankName: { label: 'Bank Name', value: 'State Bank of India' },
  branch: { label: 'Branch', value: 'High Court Branch, New Delhi' },

  typeTitle: 'Account Type',
  typeHint: 'Select one',
  types: [
    { title: 'Savings', sub: 'Personal use', on: true },
    { title: 'Current', sub: 'Firm / business', on: false },
  ],

  warn: { title: 'Check your bank details before saving them.', body: 'These details will be used for your payouts.' },
  check: {
    title: 'Bank Details Check',
    lead: 'Automatic instant Penny-Drop validation',
    body: 'We will check these details before saving them. A nominal test credit of ₹1 will be deposited to verify active ownership.',
    never: 'Legalitt never asks for your ATM PIN, UPI PIN, or bank passwords.',
  },
  vault: '256-bit encrypted legal-grade payout vault',

  ctaTitle: 'Verify Bank Details',
  ctaSub: 'Saves and validates instantly',
  ctaAction: 'Continue',
};

export const AS_BANK_VERIFY = {
  title: 'Verify Bank Details',
  // Client UI drawn in the export — NOT a dev toggle. All three segments work.
  segments: ['Checking', 'Verified', 'Failed'],

  bankLabel: 'BANK NAME',
  bankName: 'State Bank of India',
  typePill: 'Savings',
  holder: { label: 'Account Holder', value: 'Priya Sharma' },
  account: { label: 'Account Number', value: '•••• 4821' },
  ifsc: { label: 'IFSC Code', value: 'SBIN0001234', pill: 'Branch Verified' },

  // ⚠ WHAT THE EXPORT DRAWS AND WHAT IT DOES NOT. design/259 draws the
  // CHECKING state only. The Verified and Failed segments are drawn on the
  // switcher but no export shows either screen. Both are rendered through the
  // SAME drawn layout with only the mark, the two lines of copy, the tracker's
  // current step and the button label changing — the Verified wording follows
  // design/260, which is the success screen. Nothing new is invented around
  // them; if the client has those two screens, they replace this copy.
  states: {
    Checking: {
      h1: 'Checking Bank Account',
      sub: 'Please wait while we check your bank details.',
      step: 1,
      cta: 'Verifying Account...',
      ctaNote: 'This usually takes less than 30 seconds',
    },
    Verified: {
      h1: 'Bank Account Verified',
      sub: 'Your bank details have been checked and matched.',
      step: 2,
      cta: 'Continue',
      ctaNote: 'This usually takes less than 30 seconds',
    },
    Failed: {
      h1: 'Verification Failed',
      sub: 'We could not match these bank details. Check them and try again.',
      step: 0,
      cta: 'Try Again',
      ctaNote: 'This usually takes less than 30 seconds',
    },
  },

  tracker: ['Details Added', 'Checking', 'Verified'],
  note: {
    title: 'Secure Bank Verification',
    body: 'Your bank details are checked securely. Your data stays private.',
  },
};

export const AS_BANK_UPDATED = {
  title: 'Bank Account Updated',
  h1: 'Bank Account Updated',
  sub: 'Your bank account has been updated successfully.',

  bank: { name: 'State Bank of India', sub: 'Primary Settlement Node', pill: 'Verified' },
  details: [
    { label: 'Account Holder', value: 'Priya Sharma' },
    { label: 'Account Number', value: '••••  4821' },
    { label: 'IFSC Code', value: 'SBIN0001234' },
    { label: 'Account Type', value: 'Savings Account' },
  ],

  note: {
    title: 'Your payouts will go to this account.',
    body: 'This bank account is now active for future legal fee payouts and retainer reimbursements.',
  },
  // ⚠ 30 Sep 2026 is in the future, like every other date in this batch.
  updated: 'Updated on 30 Sep 2026',
  active: 'Active',
  cta: 'Done',
  secondary: 'View Payout Settings',
};
