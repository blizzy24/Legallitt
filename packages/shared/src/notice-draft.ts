import type { ApiNoticeCase as ApiCase, NoticeDraftContent } from './notice-api';
import { DEFAULT_NOTICE_POLICY } from './notice-policy';
import { noticeSenderDescription } from './notice-pdf-fields';

type NoticeIntakeSource = Pick<ApiCase, 'details' | 'parties' | 'subject_matter' | 'subject_line' | 'legal_demand'>;
export const NOTICE_INTAKE_DRAFT_FIELDS = ['sender', 'recipient', 'subject', 'facts', 'demand'] as const;
export const NOTICE_FILING_DRAFT_FIELDS = [] as const;
// Flow A5: all six advocate-authored sections reach the document verbatim.
export const NOTICE_EDITABLE_DRAFT_FIELDS = ['sender', 'recipient', 'subject', 'facts', 'demand', 'closing'] as const;

const lines = (values: (string | undefined | null)[]) => values
  .map(value => value?.trim() ?? '').filter(Boolean).join('\n');

/** This case's supplied intake plus the approved closing template (flow A5).
 * No missing personal facts, deadlines or offences are invented here. */
export function seedNoticeDraft(record: NoticeIntakeSource): NoticeDraftContent {
  const sender = record.details.client;
  const senderParty = record.parties?.find(party => party.kind === 'sender');
  const recipient = record.details.noticee;
  const filing = record.details as unknown as Partial<import('./notice-flow').NoticeFiling>;
  return {
    sender: lines([
      // Same rule as the letterhead: a part prints only when it was supplied.
      sender?.fullName?.trim() ? noticeSenderDescription({name: sender.fullName, salutation: senderParty?.salutation,
        relation: senderParty?.relation, relative: senderParty?.relative_name}) : '',
      ...(['fatherName','motherName','husbandName'] as const).map((key,i)=>filing.client?.[key]?`${['Father’s name','Mother’s name','Husband’s name'][i]}: ${filing.client[key]}`:''),
      sender?.address, sender?.email,
    ]),
    recipient: filing.intake_version===2 ? lines([filing.noticee?.fullName,filing.noticee?.throughDesignation,
      ...(filing.noticee?.methods.includes('courier')?[filing.noticee.address,filing.noticee.pin]:[]),
      filing.noticee?.methods.includes('email')?filing.noticee.email:null,
      filing.noticee?.methods.includes('whatsapp')?filing.noticee.whatsapp:null]) : lines([recipient?.fullName, recipient?.address, recipient?.mobile, recipient?.email]),
    subject: record.subject_line ?? '',
    facts: record.subject_matter ?? '',
    demand: lines([...(record.legal_demand?.selected ?? []), record.legal_demand?.custom]),
    closing: DEFAULT_NOTICE_POLICY.civil_consequence,
  };
}

/** Advocate-authored saved values always win, including intentional blanks.
 * Opening creates no database version; the normal save path does. */
export function noticeDraftOnOpen(record: NoticeIntakeSource & Pick<ApiCase, 'drafts'>): NoticeDraftContent {
  const seed = seedNoticeDraft(record);
  const saved = record.drafts?.at(-1)?.content;
  if (!saved) return seed;
  const {offences: _retired, ...content} = saved;
  return content;
}

/** Mark only nonempty, unchanged intake values. An advocate's changed or cleared
 * section must not still claim to be the client's original text. */
export function unchangedNoticeIntakeFields(record: NoticeIntakeSource, content: NoticeDraftContent) {
  const seed = seedNoticeDraft(record);
  return NOTICE_INTAKE_DRAFT_FIELDS.filter(key => seed[key].trim() && content[key] === seed[key]);
}
