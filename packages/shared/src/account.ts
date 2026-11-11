import {z} from 'zod';

/** D-20: in-app notification categories a client can quiet. */
export const NOTIFICATION_CATEGORIES = [
  {code: 'cases', label: 'Case updates', description: 'Advocate assignment, drafts, approvals and delivery'},
  {code: 'consultations', label: 'Consultations', description: 'Bookings, session changes and briefs'},
  {code: 'payments', label: 'Payments', description: 'Payment confirmations and refunds'},
] as const;
export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[number]['code'];
/** One rule shared by the inbox filters and preference handling. */
export function notificationCategory(kind: string, service?: string | null): NotificationCategory {
  if (/payment|refund/.test(kind)) return 'payments';
  if (/consultation|session|brief/.test(kind) || service === 'legal_advice') return 'consultations';
  return 'cases';
}

/** D-22: English is the only language with translations. */
export const LANGUAGES = [
  {code: 'en', label: 'English', native: 'English', available: true},
  {code: 'hi', label: 'Hindi', native: 'हिन्दी', available: false},
  {code: 'mr', label: 'Marathi', native: 'मराठी', available: false},
  {code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', available: false},
  {code: 'bn', label: 'Bengali', native: 'বাংলা', available: false},
  {code: 'ta', label: 'Tamil', native: 'தமிழ்', available: false},
  {code: 'te', label: 'Telugu', native: 'తెలుగు', available: false},
] as const;

export type AccountPreferences = {language: string; notifications: Record<NotificationCategory, boolean>};
export const AccountPreferencesPatchSchema = z.strictObject({
  language: z.enum(LANGUAGES.filter(l => l.available).map(l => l.code) as [string, ...string[]]).optional(),
  notifications: z.strictObject({cases: z.boolean().optional(), consultations: z.boolean().optional(), payments: z.boolean().optional()}).optional(),
});

export type AccountSession = {id: string; method: 'password' | 'one_time_code'; device: string | null; at: string};
export type AccountSecurity = {
  email: string | null; email_verified: boolean; phone: string | null; phone_verified: boolean;
  /** 'demo_managed': seeded demo credentials are maintained by Legalitt and never changed in the app (D-69). */
  password_change: 'available' | 'one_time_code' | 'demo_managed';
  sessions: AccountSession[];
};
export const ChangePasswordSchema = z.strictObject({
  current_password: z.string().min(1).max(256),
  new_password: z.string().min(8).max(256).regex(/[A-Za-z]/).regex(/\d/),
  access_token: z.string().min(10).max(8192),
});
export const AccessTokenSchema = z.strictObject({access_token: z.string().min(10).max(8192)});
export const DeletionRequestSchema = z.strictObject({reason: z.string().trim().max(500).optional(), access_token: z.string().min(10).max(8192).optional()});

export type DeletionBlocker = {id: string; reference: string; service_code: string; status: string};
export type DeletionState = {request: {id: string; status: string; created_at: string} | null; blockers: DeletionBlocker[]};

export type SavedAdvocate = {
  id: string; name: string; city: string | null; state: string | null; practice_areas: string[];
  years_experience: number | null; verified: boolean;
  /** Weekdays (0=Sunday) with published hours; empty when none are set. */
  available_days: number[];
  consultation_total_paise: string | null; saved_at: string;
};
