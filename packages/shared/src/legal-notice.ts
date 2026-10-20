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
