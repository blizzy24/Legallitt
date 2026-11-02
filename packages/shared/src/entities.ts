import { z } from 'zod';
import { CaseStatus } from './lifecycle';
import { SERVICE_CODES } from './services';

// Domain entity schemas, not create-input DTOs. Database-generated fields are
// required on loaded entities. Date and bigint retain database precision; JSON
// transport adapters belong to the API layer (no coercion of monetary floats).
export const CaseStatusSchema = z.enum(CaseStatus);
export const CaseBucketSchema = z.enum(['active', 'pending', 'closed']);
export const ServiceCodeSchema = z.enum(SERVICE_CODES);
export const UserRoleSchema = z.enum(['client', 'advocate', 'admin']);
export const VerificationStatusSchema = z.enum(['not_started', 'in_review', 'approved', 'rejected', 'needs_update']);
export const PaymentStatusSchema = z.enum(['created', 'pending', 'captured', 'failed', 'refunded']);
export const PayoutStatusSchema = z.enum(['pending', 'released', 'processing', 'paid', 'failed', 'reversed']);
export const PaiseSchema = z.bigint().min(-9223372036854775808n).max(9223372036854775807n);
const int32 = z.number().int().min(-2147483648).max(2147483647);
const bigint64 = PaiseSchema;

export const UserSchema = z.strictObject({
  id: z.uuid(),
  cognito_sub: z.string(),
  role: UserRoleSchema,
  full_name: z.string(),
  email: z.string().nullable(),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/).nullable(),
  phone_verified: z.boolean(),
  email_verified: z.boolean(),
  status: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type User = z.infer<typeof UserSchema>;

export const AdvocateProfileSchema = z.strictObject({
  user_id: z.uuid(),
  bar_council_state: z.string().nullable(),
  bar_council_number: z.string().nullable(),
  enrolment_year: int32.nullable(),
  practice_areas: z.array(z.string()),
  languages: z.array(z.string()),
  courts: z.array(z.string()),
  city: z.string().nullable(),
  state: z.string().nullable(),
  years_experience: int32.nullable(),
  education: z.string().nullable(),
  bio: z.string().nullable(),
  photo_key: z.string().nullable(),
  consultation_fee_paise: PaiseSchema.nullable(),
  verification: VerificationStatusSchema,
  verified_at: z.date().nullable(),
  rating_avg: z.number().min(-9.9).max(9.9).multipleOf(0.1).nullable(),
  rating_count: int32,
  rzp_linked_account_id: z.string().nullable(),
  rzp_account_status: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});
export type AdvocateProfile = z.infer<typeof AdvocateProfileSchema>;

export const CaseSchema = z.strictObject({
  id: z.uuid(),
  reference: z.string(),
  service_code: ServiceCodeSchema,
  client_id: z.uuid(),
  advocate_id: z.uuid().nullable(),
  status: CaseStatusSchema,
  sub_status: z.string().nullable(),
  matter_type: z.string().nullable(),
  subject_matter: z.string().nullable(),
  subject_line: z.string().nullable(),
  legal_demand: z.json().nullable(),
  tier: z.string().nullable(),
  title: z.string().nullable(),
  details: z.json(),
  pricing_id: z.uuid().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
  completed_at: z.date().nullable(),
});
export type Case = z.infer<typeof CaseSchema>;

export const CaseEventSchema = z.strictObject({
  source: z.enum(["real", "simulated"]),
  id: bigint64,
  case_id: z.uuid(),
  type: z.string(),
  actor_id: z.uuid().nullable(),
  actor_role: UserRoleSchema.nullable(),
  from_status: CaseStatusSchema.nullable(),
  to_status: CaseStatusSchema.nullable(),
  payload: z.json(),
  created_at: z.date(),
});
export type CaseEvent = z.infer<typeof CaseEventSchema>;

export const DocumentSchema = z.strictObject({
  id: z.uuid(),
  case_id: z.uuid().nullable(),
  owner_id: z.uuid(),
  kind: z.string(),
  filename: z.string(),
  s3_key: z.string(),
  mime_type: z.string(),
  size_bytes: bigint64,
  page_count: int32.nullable(),
  status: z.string(),
  simulated: z.boolean(),
  created_at: z.date(),
});
export type Document = z.infer<typeof DocumentSchema>;

export const DraftSchema = z.strictObject({
  id: z.uuid(),
  case_id: z.uuid(),
  kind: z.string(),
  version: int32,
  content: z.json(),
  generated_by: z.string().nullable(),
  created_by: z.uuid(),
  created_at: z.date(),
});
export type Draft = z.infer<typeof DraftSchema>;

export const PaymentSchema = z.strictObject({
  payer_id: z.uuid(),
  simulated: z.boolean(),
  id: z.uuid(),
  case_id: z.uuid(),
  purpose: z.string(),
  base_amount_paise: PaiseSchema,
  gst_paise: PaiseSchema,
  total_paise: PaiseSchema,
  status: PaymentStatusSchema,
  rzp_order_id: z.string().nullable(),
  rzp_payment_id: z.string().nullable(),
  idempotency_key: z.string(),
  created_at: z.date(),
  captured_at: z.date().nullable(),
});
export type Payment = z.infer<typeof PaymentSchema>;

export const PayoutSchema = z.strictObject({
  id: z.uuid(),
  case_id: z.uuid(),
  advocate_id: z.uuid(),
  payment_id: z.uuid(),
  gross_paise: PaiseSchema,
  commission_rate_bps: int32,
  commission_paise: PaiseSchema,
  net_paise: PaiseSchema,
  status: PayoutStatusSchema,
  rzp_transfer_id: z.string().nullable(),
  utr: z.string().nullable(),
  released_by: z.uuid().nullable(),
  released_at: z.date().nullable(),
  created_at: z.date(),
});
export type Payout = z.infer<typeof PayoutSchema>;

