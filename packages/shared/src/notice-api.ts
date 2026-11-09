import { z } from "zod";
import { CaseStatus } from "./lifecycle";
import { LegalNoticeIntake, LegalNoticeTierSchema, type NoticeRelation, type NoticeSalutation } from "./legal-notice";
import { DocumentPresignSchema } from "./documents";
import { CompliancePeriodSchema, type NoticePolicy } from './notice-policy';
import type { ServiceCode } from './services';

const evidenceText = z
  .string()
  .max(50_000)
  .refine(
    (value) => !/(?:^|[^\d])\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/.test(value),
    "Do not include a full identity number",
  );
// The six editor sections drawn in design 188; no generated sample prose.
export const NoticeDraftContentSchema = z.strictObject({
  sender: evidenceText,
  recipient: evidenceText,
  subject: evidenceText,
  facts: evidenceText,
  demand: evidenceText,
  closing: evidenceText,
  // Project-owner letterhead instruction: advocate-supplied template field,
  // separate from the six working sections. Older saved drafts have no value.
  offences: evidenceText.optional(),
});
export type NoticeDraftContent = z.infer<typeof NoticeDraftContentSchema>;
export const NoticeDraftInputSchema = z.strictObject({
  kind: z.literal("legal_notice"),
  content: NoticeDraftContentSchema,
  generated_by: z.literal("manual"),
  compliance_period_days: CompliancePeriodSchema.optional(),
});
export const NoticeCommentSchema = z.strictObject({
  comment: evidenceText.trim().min(1),
});
export const NoticeDeclineSchema = z.strictObject({
  reason: evidenceText.trim().min(1).nullable().optional(),
});
export type ApiTokens = {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt?: number;
};
export type ApiUser = {
  id: string;
  role: "client" | "advocate" | "admin";
  name: string;
  email: string | null;
  phone: string | null;
};
export type ApiAuthResult = { user: ApiUser; tokens: ApiTokens; simulated?: boolean };
export type ApiEvent = {
  source: "real" | "simulated";
  id: string;
  type: string;
  actor_role: string | null;
  from_status: CaseStatus | null;
  to_status: CaseStatus | null;
  payload: Record<string, unknown>;
  created_at: string;
};
export type ApiDocument = {
  id: string;
  owner_id: string;
  simulated: boolean;
  case_id: string;
  kind: string;
  filename: string;
  mime_type: string;
  size_bytes: string;
  page_count: number | null;
  status: string;
  identity_notice?: string;
};
export type ApiDraft = {
  compliance_period_days?: number | null;
  closing_policy?: NoticePolicy | null;
  id: string;
  case_id: string;
  version: number;
  kind: string;
  content: NoticeDraftContent;
  generated_by: string;
  /** Legal_Notice_Draft_v{version}.pdf, rendered when the draft went for review. */
  document_id: string | null;
  created_at: string;
};
export type ApiReview = {
  id: string;
  draft_id: string;
  decision: "approved" | "changes_requested";
  comment: string | null;
  created_at: string;
};
/** advocate_profiles as the case carries it. rating_avg is NUMERIC(2,1), serialised as a string. */
export type ApiAdvocateProfile = {
  years_experience: number | null; practice_areas: string[]; bar_council_number: string | null; enrolment_year: number | null;
  rating_avg: string | null; rating_count: number; verification: 'not_started' | 'in_review' | 'approved' | 'rejected' | 'needs_update';
  verified_at: string | null; city: string | null; state: string | null;
  bio: string | null; courts: string[]; languages: string[]; education: string | null;
  /** A bundled portrait name (advocate-05) for now; an S3 key once advocates upload their own. */
  photo_key: string | null;
};
export type CaseClientFees = {
  page_overage_paise?: string;
  service_fee_paise: string | null; platform_fee_paise: string | null;
  delivery_fee_paise: string | null; gst_paise: string | null; total_paise: string | null;
  breakdown_complete: boolean; simulated: boolean;
};
export type ApiCase = {
  advocate_payout?: {service_share_paise: string; delivery_reimbursement_paise: string; net_paise: string} | null;
  client_fees?: CaseClientFees;
  compliance_period_days?: number | null;
  notice_policy?: NoticePolicy;
  advocate?: {id:string;full_name:string;profile:ApiAdvocateProfile|null}|null;
  id: string;
  reference: string;
  service_code: ServiceCode;
  client_id: string;
  advocate_id: string | null;
  status: CaseStatus;
  tier: string | null;
  title?: string | null;
  sub_status?: string | null;
  /** The case's historical pricing_id relation, never today's service price. */
  pricing?: {base_amount_paise: string} | null;
  matter_type: string | null;
  subject_matter: string | null;
  subject_line: string | null;
  legal_demand: import('./legal-notice').LegalDemand | null;
  parties?: {id: string; kind: string; name: string; age: number | null;
    salutation: NoticeSalutation | null; relation: NoticeRelation | null; relative_name: string | null}[];
  /** Legal_Notice_Final.pdf, rendered on the client's approval. */
  notice_document_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  events?: ApiEvent[];
  documents?: ApiDocument[];
  drafts?: ApiDraft[];
  reviews?: ApiReview[];
  shipments?: import('./shipments').ApiShipment[];};
export type ApiNoticeCase = Omit<ApiCase, 'service_code' | 'details' | 'matter_type' | 'tier'> & {
  service_code: 'legal_notice'; details: LegalNoticeIntake;
  matter_type: import('./legal-notice').LegalNoticeMatterType | null;
  tier: z.infer<typeof LegalNoticeTierSchema> | null;
};
export function isNoticeCase(record: ApiCase): record is ApiNoticeCase {
  return record.service_code === 'legal_notice';
}
export type ApiPage<T> = { items: T[]; next_cursor: string | null };
export type UploadTicket = {
  document: ApiDocument;
  upload: {
    url: string;
    fields: Record<string, string>;
    method: "POST";
    expires_in: number;
    max_bytes: number;
  };
};
export type PresignInput = z.infer<typeof DocumentPresignSchema>;

export type ApiMessage = {id:string;thread_id:string;sender_id:string;body:string|null;document_id:string|null;created_at:string;read_at:string|null};
