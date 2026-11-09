import {z} from 'zod';

export const FIR_AWAITING_APPROVAL = 'awaiting_admin_approval';
const text = z.string().trim().max(10000).refine(value => !/(?:^|[^\d])\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/.test(value), 'Do not include a full identity number');
export const FirIntakeSchema = z.strictObject({
  contact: z.strictObject({fullName: text, mobile: text, email: text}),
  jurisdiction: z.strictObject({state: text, district: text, policeStation: text}),
  incident: z.strictObject({type: text, date: text, time: text, location: text, description: text, additional: text.default('')}),
  people: z.array(z.strictObject({kind: z.enum(['complainant','accused','witness']), name: text, details: text})).max(100),
});
export type FirIntake = z.infer<typeof FirIntakeSchema>;
export const FirSubmissionSchema = FirIntakeSchema.refine(v =>
  !!(v.contact.fullName && v.contact.mobile && v.jurisdiction.state && v.jurisdiction.district && v.jurisdiction.policeStation &&
    v.incident.type && v.incident.date && v.incident.time && v.incident.location && v.incident.description),
  'Complete contact, jurisdiction and incident details before submitting.');

// Fields from the supplied FORM I screen; no sample values or inferred offences.
export const FIR_FIELDS = [
  ['Police Station & Filing Time', ['Police Station','District & State','FIR Number','Report Received Date & Time']],
  ['Complainant / Reporter Info', ['Full Legal Name',"Father's Name",'Age & Gender','Occupation / Job','Home & Present Address','Phone & Email','Official ID Document']],
  ['When and Where It Happened', ['Date & Time of Crime','Place of Incident','Distance from Police Station']],
  ['Accused Person(s)', ['Main Accused Name','Other People Involved','Vehicle Used','Suspected Reason / Motive']],
] as const;
const fieldNames = new Set<string>(FIR_FIELDS.flatMap(([, fields]) => [...fields]));
export const FirDraftSchema = z.strictObject({
  fields: z.record(z.string().refine(k => fieldNames.has(k)), text),
  legal_sections: z.array(text.min(1)).max(100),
  narrative: text,
  witnesses: z.array(text.min(1)).max(100),
  document_ids: z.array(z.uuid()).max(100),
});
export type FirDraftContent = z.infer<typeof FirDraftSchema>;
export const FirSendSchema = FirDraftSchema.refine(v => !!(v.narrative && v.fields['Police Station'] && v.fields['Full Legal Name']),
  'Enter the police station, complainant name and statement of facts before sending.');
export type FirApproval = {draft_id: string; version: number; document_id: string; submitted_at: string; approved_at: string | null};
export function firAwaitingApproval(record: {service_code?: string; status: string; sub_status?: string | null}) {
  return record.service_code === 'fir_draft' && record.status === 'in_progress' && record.sub_status === FIR_AWAITING_APPROVAL;
}
export function waitingDuration(since: string, now = Date.now()) {
  const minutes = Math.max(0, Math.floor((now - Date.parse(since)) / 60000));
  if (!Number.isFinite(minutes)) return 'Waiting time unavailable';
  if (minutes < 1) return 'Waiting less than a minute';
  const days = Math.floor(minutes / 1440), hours = Math.floor(minutes / 60) % 24;
  return days ? `Waiting ${days} ${days === 1 ? 'day' : 'days'} ${hours}h` : minutes >= 60 ? `Waiting ${Math.floor(minutes / 60)}h ${minutes % 60}m` : `Waiting ${minutes}m`;
}
