import { z } from 'zod';

export const CompliancePeriodSchema = z.number().int().min(1).max(2147483647);
// Owner decisions made in the client's absence, 4 November 2026 (§9.2).
// Stored under services.config.notice_policy; saved drafts snapshot the policy.
export const NoticePolicySchema = z.object({
  default_compliance_period_days: CompliancePeriodSchema.default(15),
  criminal_clause: z.enum(['when_offences', 'omit', 'required']).default('when_offences'),
  compliance_sentence: z.string().min(1).refine(s => s.includes('{days}'), 'Include {days}').default(
    'You are hereby called upon to comply with the demands set out in this notice within {days} days of receipt of this notice.'),
  civil_consequence: z.string().min(1).default(
    'Failing which, my client shall be constrained to initiate appropriate civil proceedings against you.'),
  criminal_consequence: z.string().min(1).refine(s => s.includes('{offences}'), 'Include {offences}').default(
    'Failing which, my client shall be constrained to initiate appropriate civil proceedings and also lodge a criminal complaint / FIR against you before the police authorities for the offences of {offences}'),
});
export type NoticePolicy = z.infer<typeof NoticePolicySchema>;
export const DEFAULT_NOTICE_POLICY = NoticePolicySchema.parse({});
export function noticeClosing(policy: NoticePolicy, days: number | null, offences = '') {
  const allegation = offences.trim();
  if (policy.criminal_clause === 'required' && !allegation) throw new Error('Enter offences before generating this notice.');
  return {
    compliance: days === null ? '' : policy.compliance_sentence.replaceAll('{days}', String(CompliancePeriodSchema.parse(days))),
    consequence: policy.criminal_clause !== 'omit' && allegation
      ? policy.criminal_consequence.replaceAll('{offences}', allegation)
      : policy.civil_consequence,
  };
}
