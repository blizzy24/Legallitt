import { z } from 'zod';

/** Required output fields approved by the owner (§9.2). Optional father/age
 * phrases are omitted; the signature is the only intentional handwritten blank. */
export const NOTICE_PDF_FIELD_LABELS = {
  subject: 'Subject line',
  sender_name: 'Sender name',
  sender_address: 'Sender address',
  recipient_name: 'Recipient name',
  recipient_address: 'Recipient address',
  service_fee: 'Service fee',
  place: 'Place (advocate’s city)',
} as const;
export const NoticePdfFieldSchema = z.enum(Object.keys(NOTICE_PDF_FIELD_LABELS) as [keyof typeof NOTICE_PDF_FIELD_LABELS, ...(keyof typeof NOTICE_PDF_FIELD_LABELS)[]]);
export type NoticePdfField = z.infer<typeof NoticePdfFieldSchema>;
export const NoticePdfProblemSchema = z.object({
  code: z.literal('notice_fields_missing'),
  message: z.string(),
  missing_fields: z.array(NoticePdfFieldSchema),
});
export type NoticePdfRequiredValues = {
  subject?: string | null;
  sender?: {name?: string | null; address?: string | null};
  recipient?: {name?: string | null; address?: string | null};
  serviceFeePaise?: bigint | string | null;
  place?: string | null;
};
export function noticePdfProblem(input: NoticePdfRequiredValues) {
  const present: Record<NoticePdfField, boolean> = {
    subject: Boolean(input.subject?.trim()),
    sender_name: Boolean(input.sender?.name?.trim()),
    sender_address: Boolean(input.sender?.address?.trim()),
    recipient_name: Boolean(input.recipient?.name?.trim()),
    recipient_address: Boolean(input.recipient?.address?.trim()),
    // Zero is an amount, not an absent pricing row.
    service_fee: input.serviceFeePaise != null && String(input.serviceFeePaise).trim() !== '',
    place: Boolean(input.place?.trim()),
  };
  const missing_fields = (Object.keys(present) as NoticePdfField[]).filter(key => !present[key]);
  return missing_fields.length ? {
    code: 'notice_fields_missing' as const,
    message: `Cannot generate this notice. Missing fields: ${missing_fields.map(key => NOTICE_PDF_FIELD_LABELS[key]).join('; ')}.`,
    missing_fields,
  } : null;
}

export type NoticeSenderPhrase = {name?: string | null; salutation?: string | null; relation?: string | null;
  relative?: string | null; age?: number | null; address?: string | null};
/** "Mrs. Sunita Mehra W/o Shri Rajeev Mehra, Age 41": each part only when known.
 * A relation prints only with the relative's name, and the name only with a relation. */
export function noticeSenderDescription(sender: NoticeSenderPhrase) {
  const salutation = sender.salutation?.trim(), relation = sender.relation?.trim(), relative = sender.relative?.trim();
  return `${salutation ? salutation + ' ' : ''}${sender.name?.trim() ?? ''}${relation && relative ? ` ${relation} Shri ${relative}` : ''}${sender.age != null ? `, Age ${sender.age}` : ''}`;
}
export function noticeSenderIntroduction(sender: NoticeSenderPhrase) {
  return `Under instructions and authority from my client ${noticeSenderDescription(sender)} R/o ${sender.address?.trim() ?? ''}, I hereby serve upon you this Legal Notice as under:`;
}
