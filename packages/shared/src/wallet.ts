import {z} from 'zod';

/** D-36: payout requests below this are refused (design 359 draws ₹1,000). */
export const PAYOUT_MINIMUM_PAISE = '100000';
/** D-01/D-36: the only claim the product makes about payouts. */
export const PAYOUT_COPY = "Paid to your bank account by Legalitt. You'll see the UTR here once sent.";

export type WalletPeriod = 'month' | 'last_month' | 'year' | 'all';
export type WalletEntry = {
  case_id: string; reference: string; service_code: string; completed_at: string | null;
  /** D-37: our structure — client paid, platform fee (25% of base), GST, your share. */
  client_paid_paise: string; platform_fee_paise: string; gst_paise: string; share_paise: string;
  source: 'completed' | 'cancellation_decision';
};
export type MaskedBankAccount = {holder_name: string; bank_name: string; ifsc: string; account_last4: string;
  account_type: string | null; verified: false; updated_at: string};
export type PayoutRequestView = {id: string; amount_paise: string; status: 'pending' | 'paid'; requested_at: string;
  utr: string | null; paid_on: string | null; paid_at: string | null; bank: {bank_name: string; account_last4: string}};
export type Wallet = {
  period: WalletPeriod;
  /** Lifetime figures; period figures only filter `entries` and `period_earned_paise`. */
  earned_paise: string; ready_paise: string; requested_paise: string; paid_paise: string;
  period_earned_paise: string; entries: WalletEntry[]; requests: PayoutRequestView[];
  bank: MaskedBankAccount | null; minimum_paise: string;
};
export const BankAccountInputSchema = z.strictObject({
  holder_name: z.string().trim().min(2).max(120),
  bank_name: z.string().trim().min(2).max(120),
  ifsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid 11-character IFSC'),
  account_number: z.string().trim().regex(/^\d{9,18}$/, 'Enter the account number (9–18 digits)'),
  account_type: z.enum(['savings', 'current']).nullable().optional(),
});
export type BankAccountInput = z.infer<typeof BankAccountInputSchema>;
export const PayoutRequestInputSchema = z.strictObject({amount_paise: z.string().regex(/^[1-9]\d{0,13}$/)});
export const PayoutPaidInputSchema = z.strictObject({
  utr: z.string().trim().regex(/^[A-Za-z0-9]{6,30}$/, 'Enter the UTR exactly as the bank shows it'),
  paid_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
export type AdminPayoutRow = {
  id: string; advocate: {id: string; name: string; email: string | null}; amount_paise: string; status: 'pending' | 'paid';
  requested_at: string; paid_at: string | null; paid_on: string | null; utr: string | null;
  /** Admin-only: full details needed to pay outside the app (D-82). */
  bank: {holder_name: string; bank_name: string; ifsc: string; account_number: string; account_type: string | null; verified: boolean};
};
export const maskAccount = (n: string) => n.slice(-4);
