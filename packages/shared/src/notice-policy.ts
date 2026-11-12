import { z } from 'zod';

export const CompliancePeriodSchema = z.number().int().min(1).max(2147483647);
// Owner decisions made in the client's absence, 4 November 2026 (§9.2).
// Stored under services.config.notice_policy; saved drafts snapshot the policy.
export const NoticePolicySchema = z.object({
  default_compliance_period_days: CompliancePeriodSchema.default(15),
  // Retained for reading historical policy snapshots only. New rendering never
  // emits an offences sentence, including when opening an old saved draft.
  criminal_clause: z.enum(['when_offences', 'omit', 'required']).default('omit'),
  compliance_sentence: z.string().min(1).refine(s => s.includes('{days}'), 'Include {days}').default(
    'You are hereby called upon to comply with the demands set out in this notice within {days} days of receipt of this notice.'),
  civil_consequence: z.string().min(1).default(
    'Failing which, my client shall be constrained to initiate appropriate civil proceedings against you.'),
  criminal_consequence: z.string().default(''),
});
export type NoticePolicy = z.infer<typeof NoticePolicySchema>;
export const DEFAULT_NOTICE_POLICY = NoticePolicySchema.parse({});
export function noticeClosing(policy: NoticePolicy, days: number | null, offences = '') {
  return {
    compliance: days === null ? '' : policy.compliance_sentence.replaceAll('{days}', String(CompliancePeriodSchema.parse(days))),
    consequence: policy.civil_consequence,
  };
}
