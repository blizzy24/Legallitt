import { z } from "zod";

// Intake fields drawn on 24–26 and represented by mobile/context/legalNotice.
// Documents/KYC have their own tables and endpoints; no file or Aadhaar payload
// belongs in intake JSON. No invented issue summary or sample values are saved.
// §7.1: reject full twelve-digit identity numbers in free-text intake fields,
// including the common spaced/hyphenated form. Phone fields are separate.
const text = z.string().trim().refine(
  value => !/(?:^|[^\d])\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/.test(value),
  "Do not include a full identity number",
);
const mobile = z.string().trim();
const email = z.union([z.email(), z.literal("")]);
const client = z.strictObject({
  fullName: text,
  mobile,
  email: email.optional(),
  address: text,
});
const noticee = client.extend({ relationship: text.optional() });
export const LegalNoticeTierSchema = z.enum(["ordinary", "urgent"]);
export const LegalNoticeIssueSchema = z.enum([
  "property-dispute",
  "money-recovery",
  "tenant-issue",
  "family-dispute",
  "cheque-bounce",
  "consumer-complaint",
  "other",
]);

// Drafts can be saved incrementally. Submission validates the required fields
// marked on screens 24/25 and the issue selection on 26.
export const LegalNoticeIntakeSchema = z.strictObject({
  client: client.partial().optional(),
  noticee: noticee.partial().optional(),
  issueType: LegalNoticeIssueSchema.optional(),
});
export const LegalNoticeSubmissionSchema = z.strictObject({
  client: client.extend({
    fullName: text.min(1),
    mobile: mobile.min(1),
    address: text.min(1),
  }),
  noticee: noticee.extend({
    fullName: text.min(1),
    mobile: mobile.min(1),
    email: z.email(),
    address: text.min(1),
  }),
  issueType: LegalNoticeIssueSchema,
});
export type LegalNoticeIntake = z.infer<typeof LegalNoticeIntakeSchema>;

// Owner-instructed seven-step intake. These are dedicated database columns, not
// keys in cases.details. Keep selected options separate from the client's prose.
export const LegalDemandSchema = z.strictObject({
  selected: z.array(text.min(1).max(5000)).max(20),
  custom: text.max(10000),
});
export type LegalDemand = z.infer<typeof LegalDemandSchema>;
// Owner instruction (4 Nov 2026): how the notice introduces the sender. Both are
// optional; an absent salutation or relation is left out of the phrase, never guessed.
export const NOTICE_SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.'] as const;
export const NOTICE_RELATIONS = ['S/o', 'D/o', 'W/o'] as const;
export const NoticeSalutationSchema = z.enum(NOTICE_SALUTATIONS);
export const NoticeRelationSchema = z.enum(NOTICE_RELATIONS);
export type NoticeSalutation = z.infer<typeof NoticeSalutationSchema>;
export type NoticeRelation = z.infer<typeof NoticeRelationSchema>;
export const NoticeSenderFieldsSchema = z.strictObject({
  father_name: text.max(300).optional(), mother_name: text.max(300).optional(), husband_name: text.max(300).optional(),
  salutation: NoticeSalutationSchema.nullable().optional(),
  relation: NoticeRelationSchema.nullable().optional(),
  /** The father's or husband's name, printed after the relation as "Shri …". */
  relative_name: text.max(300).nullable().optional(),
});
export type NoticeSenderFields = z.infer<typeof NoticeSenderFieldsSchema>;
export const NoticeIntakeFieldsSchema = z.strictObject({
  subject_matter: text.max(10000).nullable().optional(),
  legal_demand: LegalDemandSchema.nullable().optional(),
  sender: NoticeSenderFieldsSchema.optional(),
});
export type NoticeIntakeFields = z.infer<typeof NoticeIntakeFieldsSchema>;
export const NoticeReadySchema = z.strictObject({
  subject_matter: text.min(1).max(10000),
  subject_line: text.min(1),
  legal_demand: LegalDemandSchema.refine(v => v.selected.length > 0 || v.custom.length > 0,
    'Choose a legal demand or write your own'),
});

// Fixed simulator outputs: no names, dates, amounts, offences or invented facts.
export const SIMULATED_NOTICE_SUBJECT = 'Legal notice concerning the matter in dispute';
export const SIMULATED_NOTICE_DEMANDS = [
  'Resolve the matter described in this notice.',
  'Provide a written response to the issues raised in this notice.',
] as const;

/** The advocate's opening message, exactly as drawn on designs 33 and 439 ("relevent" as drawn). */
export const NOTICE_ADVOCATE_GREETING = 'Hello you can now message me with any case concerns or upload any relevent documents here...';

/** §9.2: matter types are selected data, never copy substitutions. */
export const LegalNoticeMatterTypeSchema = z.enum([
  'property_dispute', 'money_recovery', 'tenant_issue', 'family_dispute',
  'cheque_bounce', 'consumer_complaint', 'other',
]);
export type LegalNoticeMatterType = z.infer<typeof LegalNoticeMatterTypeSchema>;
export function noticeMatterType(issue: LegalNoticeIntake['issueType']): LegalNoticeMatterType | null {
  return issue ? LegalNoticeMatterTypeSchema.parse(issue.replaceAll('-', '_')) : null;
}
export function noticeIssueType(matter: LegalNoticeMatterType | null): LegalNoticeIntake['issueType'] {
  return matter ? LegalNoticeIssueSchema.parse(matter.replaceAll('_', '-')) : undefined;
}
