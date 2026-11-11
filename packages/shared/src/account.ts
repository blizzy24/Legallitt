import type {QuoteBreakdown} from './pricing';
// D-15, D-17, D-18: the signed-in client's account area.
export type AccountProfile = {
  id: string; name: string; email: string | null; phone: string | null; email_verified: boolean; phone_verified: boolean;
  date_of_birth: string | null; gender: 'female' | 'male' | 'other' | 'prefer_not_to_say' | null;
  city: string | null; state: string | null; country: string | null;
  counts: {active_cases: number; total_cases: number};
};
export type AccountProfileUpdate = Partial<Pick<AccountProfile, 'date_of_birth' | 'gender' | 'city' | 'state' | 'country'>> & {name?: string};
export const GENDER_OPTIONS = [
  {code: 'female', label: 'Female'}, {code: 'male', label: 'Male'}, {code: 'other', label: 'Other'}, {code: 'prefer_not_to_say', label: 'Prefer not to say'},
] as const;
type CaseRef = {id: string; reference: string; service_code: string; service_name: string; status: string};
export type AccountDocument = {
  id: string; filename: string; kind: string; mime_type: string; size_bytes: string; page_count: number | null; created_at: string;
  origin: 'client' | 'advocate' | 'legalitt'; case: CaseRef; deletable: boolean; delete_blocked_reason: string | null;
};
export type AccountPayment = {
  id: string; purpose: string; status: string; simulated: boolean; reference: string | null;
  base_amount_paise: string; gst_paise: string; total_paise: string; created_at: string; captured_at: string | null;
  case: CaseRef & {tier: string | null}; breakdown: QuoteBreakdown | null;
};
