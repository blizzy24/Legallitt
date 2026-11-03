import type { ApiCase, NoticeDraftContent } from './notice-api';

type NoticeIntakeSource = Pick<ApiCase, 'details' | 'parties' | 'subject_matter' | 'subject_line' | 'legal_demand'>;
export const NOTICE_INTAKE_DRAFT_FIELDS = ['sender', 'recipient', 'subject', 'facts', 'demand'] as const;
export const NOTICE_FILING_DRAFT_FIELDS = ['sender', 'recipient', 'subject', 'demand'] as const;
// Only these fields currently affect the letterhead. Do not offer an input
// whose saved value the PDF ignores (owner decision, 3 November 2026).
export const NOTICE_EDITABLE_DRAFT_FIELDS = ['facts', 'offences'] as const;

const lines = (values: (string | undefined | null)[]) => values
  .map(value => value?.trim() ?? '').filter(Boolean).join('\n');

/** An editable starting point containing only this case's supplied intake.
 * No legal prose, deadlines or offences are generated here. */
export function seedNoticeDraft(record: NoticeIntakeSource): NoticeDraftContent {
  const sender = record.details.client;
  const senderParty = record.parties?.find(party => party.kind === 'sender');
  const recipient = record.details.noticee;
  return {
    sender: lines([
      sender?.fullName,
      senderParty?.father_name?.trim() ? `S/o Shri ${senderParty.father_name.trim()}` : '',
      senderParty?.age != null ? `Age ${senderParty.age}` : '',
      sender?.address, sender?.mobile, sender?.email,
    ]),
    recipient: lines([recipient?.fullName, recipient?.address, recipient?.mobile, recipient?.email]),
    subject: record.subject_line ?? '',
    facts: record.subject_matter ?? '',
    demand: lines([...(record.legal_demand?.selected ?? []), record.legal_demand?.custom]),
    closing: '',
    offences: '',
  };
}

/** Advocate-authored saved values always win, including intentional blanks.
 * Filing fields reflect the same intake used by the PDF and are read-only.
 * Opening creates no database version; the normal save path does. */
export function noticeDraftOnOpen(record: NoticeIntakeSource & Pick<ApiCase, 'drafts'>): NoticeDraftContent {
  const seed = seedNoticeDraft(record);
  const saved = record.drafts?.at(-1)?.content;
  if (!saved) return seed;
  const content = { ...saved };
  for (const key of NOTICE_FILING_DRAFT_FIELDS) content[key] = seed[key];
  return content;
}

/** Mark only nonempty, unchanged intake values. An advocate's changed or cleared
 * section must not still claim to be the client's original text. */
export function unchangedNoticeIntakeFields(record: NoticeIntakeSource, content: NoticeDraftContent) {
  const seed = seedNoticeDraft(record);
  return NOTICE_INTAKE_DRAFT_FIELDS.filter(key => seed[key].trim() && content[key] === seed[key]);
}
