// Profile data, as drawn on design/50 (profile) and design/51 (edit profile).
//
// ─────────────────────────────────────────────────────────────────────────────
// LOCALISATION IS NOT SCOPED. design/61 offers seven languages and this file lists
// them so the picker has something to show, but nothing in the app is translated:
// there is no i18n library, no string catalogue and no locale switching. Choosing a
// language changes this one value and the label on the profile row, nothing else.
// Real localisation is a separate piece of work that has not been specified.
// ─────────────────────────────────────────────────────────────────────────────

export type ConsultationMode = 'chat' | 'voice' | 'video';

export type ConsultationOption = {
  id: ConsultationMode;
  label: string;
  /** design/51 prints the same availability line under all three. */
  availability: string;
};

export const CONSULTATION_OPTIONS: ConsultationOption[] = [
  { id: 'chat', label: 'Chat', availability: 'Available' },
  { id: 'voice', label: 'Voice', availability: 'Available' },
  { id: 'video', label: 'Video', availability: 'Available' },
];

/** The seven languages on design/61, in the order drawn. */
export const LANGUAGES = [
  'English',
  'हिन्दी (Hindi)',
  'मराठी (Marathi)',
  'ગુજરાતી (Gujarati)',
  'தமிழ் (Tamil)',
  'తెలుగు (Telugu)',
  'ಕನ್ನಡ (Kannada)',
];

export type Profile = {
  fullName: string;
  initials: string;
  accountType: string;
  email: string;
  /** design/50 and design/51 both draw the mobile masked. Stored as drawn. */
  mobile: string;
  mobileVerified: boolean;
  dateOfBirth: string;
  gender: string;
  city: string;
  state: string;
  country: string;
  language: string;
  consultation: ConsultationMode[];
};

export const DEFAULT_PROFILE: Profile = {
  fullName: 'Rahul Sharma',
  initials: 'RS',
  accountType: 'Client Account',
  email: 'rahul.sharma@example.com',
  mobile: '+91 98XXXXXX21',
  mobileVerified: true,
  dateOfBirth: '15 May 2000',
  gender: 'Prefer not to say',
  city: 'Indore',
  state: 'Madhya Pradesh',
  country: 'India',
  language: 'English',
  // design/51 draws Chat and Voice selected, Video not.
  consultation: ['chat', 'voice'],
};

/** Counts shown as chips on the profile menu rows (design/50). */
export const PROFILE_COUNTS = {
  activeCases: '3 Active',
};

/** design/50's footer line. */
export const APP_VERSION = 'Version 2.4.1';
export const APP_NAME = 'Legalitt Client App';
