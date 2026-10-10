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
