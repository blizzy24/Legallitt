import {z} from 'zod';

/** 12 Nov flow: shared by client, advocate and admin. No role invents a status. */
export const NOTICE_DELIVERY_METHODS = ['courier', 'email', 'whatsapp'] as const;
export const NoticeDeliveryMethodSchema = z.enum(NOTICE_DELIVERY_METHODS);
export type NoticeDeliveryMethod = z.infer<typeof NoticeDeliveryMethodSchema>;
export const NOTICE_STAGES = ['Request submitted', 'Payment', 'Advocate assigned', 'Draft preparation', 'Your approval', 'Admin preparation', 'Dispatched', 'Delivered'] as const;
export const NOTICE_ADMIN_STAGES = ['address_check', 'notice_check', 'advocate_correction', 'awaiting_test_esign', 'ready_for_dispatch', 'delivery_in_progress', 'delivery_failed', 'delivered'] as const;
export type NoticeAdminStage = typeof NOTICE_ADMIN_STAGES[number];
export function noticeStage(input: {status: string; sub_status?: string | null}) {
  const {status, sub_status: sub} = input;
  let stage = 0, client = 'Request not submitted', advocate = 'Draft', admin = 'Not submitted';
  if (['submitted', 'payment_pending'].includes(status)) {stage = 1; client = advocate = admin = 'Awaiting payment';}
  if (['paid', 'assigning', 'advocate_declined'].includes(status)) {stage = 2; client = 'Finding your advocate'; advocate = 'Returned to admin'; admin = status === 'advocate_declined' ? 'Advocate declined · reassign' : 'Assign an advocate';}
  if (status === 'assigned') {stage = 2; client = 'Advocate assigned'; advocate = 'Review request'; admin = 'Awaiting advocate acceptance';}
  if (['advocate_accepted', 'in_progress', 'changes_requested'].includes(status)) {
    stage = 3; client = status === 'changes_requested' ? 'Draft being updated' : 'Draft being prepared';
    advocate = status === 'advocate_accepted' ? 'Review documents' : status === 'changes_requested' ? 'Changes requested' : 'Continue draft'; admin = advocate;
  }
  if (status === 'client_review') {stage = 4; client = 'Awaiting your approval'; advocate = admin = 'Waiting for client';}
  if (status === 'approved' || sub?.startsWith('notice_admin_')) {
    stage = 5; client = 'Your notice is being finalised'; advocate = 'Sent to Legalitt';
    admin = ({notice_admin_address_check: 'Verify delivery contacts', notice_admin_notice_check: 'Review notice', notice_admin_advocate_correction: 'Returned to advocate', notice_admin_awaiting_test_esign: 'Awaiting test e-sign', notice_admin_ready_for_dispatch: 'Ready to dispatch'} as Record<string, string>)[sub ?? ''] ?? 'Verify delivery contacts';
    if (sub === 'notice_admin_advocate_correction') advocate = 'Admin requested corrections';
    if (sub === 'notice_admin_awaiting_test_esign') advocate = 'Complete test e-sign';
  }
  if (['dispatching', 'dispatched'].includes(status) && !sub?.startsWith('notice_admin_')) {stage = 6; client = 'Delivery in progress'; advocate = 'Dispatch in progress'; admin = 'Update delivery';}
  if (sub === 'notice_delivery_failed') {stage = 6; client = 'Delivery needs attention'; advocate = 'Admin handling delivery'; admin = 'Failed delivery · action required';}
  if (status === 'completed') {stage = 7; client = advocate = admin = 'Delivered';}
  if (['cancelled', 'refunded'].includes(status)) {client = advocate = admin = status === 'refunded' ? 'Cancelled and refunded' : 'Cancelled';}
  return {stage, label: NOTICE_STAGES[stage], client, advocate, admin, complete: status === 'completed', cancelled: ['cancelled', 'refunded'].includes(status)};
}

export function noticeChatWritable(record: {status: string}, handedToAdmin: boolean) {
  return !handedToAdmin && ['advocate_accepted', 'in_progress', 'changes_requested', 'client_review'].includes(record.status);
}
const cleanText = z.string().trim().refine(v => !/(?:^|[^\d])\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/.test(v), 'Do not include a full identity number');
export const NoticeFilingSchema = z.strictObject({
  intake_version: z.literal(2),
  step: z.number().int().min(1).max(6).optional(),
  client: z.strictObject({fullName: cleanText.max(300).optional(), relativeName: cleanText.max(300).optional(), age: z.number().int().min(1).max(120).optional(),
    address: cleanText.max(2000).optional(), mobile: z.string().trim().max(20).optional(), email: z.string().trim().max(320).optional()}).default({}),
  noticee: z.strictObject({fullName: cleanText.max(300).optional(), type: z.enum(['person', 'company']).optional(), throughDesignation: cleanText.max(300).optional(),
    methods: z.array(NoticeDeliveryMethodSchema).max(3).refine(v => new Set(v).size === v.length, 'Select each method once').default([]),
    address: cleanText.max(2000).optional(), pin: z.string().trim().max(6).optional(), email: z.string().trim().max(320).optional(),
    whatsapp: z.string().trim().max(20).optional()}).default({methods: []}),
  issueType: z.enum(['property-dispute', 'money-recovery', 'tenant-issue', 'family-dispute', 'cheque-bounce', 'consumer-complaint', 'other']).optional(),
  narrative: cleanText.max(2000).optional(), amount_paise: z.string().regex(/^\d+$/).optional(), key_date: z.string().max(10).optional(),
  identity_kind: z.enum(['masked_aadhaar','pan']).optional(),
  custom_slots: z.array(cleanText.min(1).max(100)).max(15).optional(),
  cheque: z.strictObject({number: cleanText.max(100).optional(), date: z.string().max(10).optional(), amount_paise: z.string().regex(/^\d+$/).optional(), bank: cleanText.max(300).optional(), return_date: z.string().max(10).optional()}).optional(),
});
export type NoticeFiling = z.infer<typeof NoticeFilingSchema>;
export const NoticeFilingSubmissionSchema = NoticeFilingSchema.superRefine((v, ctx) => {
  const need = (ok: unknown, path: (string | number)[], message: string) => {if (!ok) ctx.addIssue({code: 'custom', path, message});};
  for (const field of ['fullName', 'relativeName', 'age', 'address'] as const) need(v.client[field], ['client', field], 'Complete this client detail');
  if(v.client.email)need(z.email().safeParse(v.client.email).success,['client','email'],'Enter a valid email address');
  if(v.key_date)need(z.iso.date().safeParse(v.key_date).success,['key_date'],'Use a valid date in YYYY-MM-DD format');
  need(v.noticee.fullName, ['noticee', 'fullName'], 'Enter the noticee’s name');
  need(v.identity_kind, ['identity_kind'], 'Choose masked Aadhaar or PAN for the identity upload');
  need(v.noticee.methods.length, ['noticee', 'methods'], 'Choose at least one delivery method');
  if (v.noticee.methods.includes('courier')) {need(v.noticee.address, ['noticee', 'address'], 'Enter the postal address'); need(/^[1-9]\d{5}$/.test(v.noticee.pin ?? ''), ['noticee', 'pin'], 'Enter a six-digit PIN');}
  if (v.noticee.methods.includes('email')) need(z.email().safeParse(v.noticee.email).success, ['noticee', 'email'], 'Enter the delivery email');
  if (v.noticee.methods.includes('whatsapp')) need(/^(?:\+91)?[6-9]\d{9}$/.test(v.noticee.whatsapp ?? ''), ['noticee', 'whatsapp'], 'Enter a ten-digit WhatsApp number, optionally prefixed +91');
  need(v.issueType, ['issueType'], 'Choose the issue'); need(v.narrative, ['narrative'], 'Describe the issue');
  if (v.issueType === 'cheque-bounce') for (const field of ['number', 'date', 'amount_paise', 'bank', 'return_date'] as const) need(v.cheque?.[field], ['cheque', field], 'Complete this cheque detail');
  if(v.issueType==='cheque-bounce')for(const field of ['date','return_date'] as const)need(z.iso.date().safeParse(v.cheque?.[field]).success,['cheque',field],'Use a valid date in YYYY-MM-DD format');
});
export const NoticeRevisionSchema = z.strictObject({revision: z.number().int().nonnegative()});
export const NoticeAdminCheckSchema = NoticeRevisionSchema.extend({confirmed: z.literal(true)});
export const NoticeAdminReturnSchema = NoticeRevisionSchema.extend({reason: cleanText.min(1).max(2000)});
export const NoticeClientChangesSchema = z.strictObject({comment: cleanText.min(1).max(600), sections: z.array(z.enum(['sender', 'recipient', 'facts', 'demand', 'amount_dates', 'other'])).min(1).max(6), attachment_document_id: z.uuid().nullable().optional()});
export const NoticeDispatchSchema = NoticeRevisionSchema.extend({method: NoticeDeliveryMethodSchema, carrier: cleanText.max(200).optional(), waybill: cleanText.max(200).optional(), dispatch_date: z.iso.date().optional(), receipt_document_id: z.uuid().optional(), manual_confirmation: z.literal(true).optional()});
export const NoticeTrackingSchema = NoticeRevisionSchema.extend({attempt_id: z.uuid(), occurred_at: z.iso.datetime({offset: true}), place: cleanText.max(300).optional(), text: cleanText.min(1).max(1000)});
export const NoticeDeliveryResultSchema = NoticeRevisionSchema.extend({attempt_id: z.uuid(), result: z.enum(['delivered', 'failed']), occurred_at: z.iso.datetime({offset: true}), received_by: cleanText.max(300).optional(), proof_document_id: z.uuid().optional(), reason: cleanText.max(1000).optional()});

export type NoticeFlowView={case_id:string;reference:string;status:string;sub_status:string|null;stage:ReturnType<typeof noticeStage>;revision:number;
  contacts:NoticeFiling['noticee'];handed_to_admin_at:string|null;chat:{writable:boolean;reason:string};document_id:string|null;draft_id:string|null;
  deadline_at:string|null;overdue:boolean;deadline_alert:boolean;esign:{mode:'test';completed_at:string|null;label:string};retry_courier_paise:string;test_actions:boolean;
  attempts:{id:string;method:NoticeDeliveryMethod;attempt:number;status:string;recipient:NoticeFiling['noticee'];document_id:string|null;carrier:string|null;waybill:string|null;dispatch_date:string|null;receipt_document_id:string|null;source:string;sent_at:string|null;delivered_at:string|null;received_by:string|null;proof_document_id:string|null;failure_reason:string|null;retry_payment_id:string|null;tracking:{id:string;occurred_at:string;place:string|null;text:string}[]}[];
  tasks:{id:string;kind:'contact'|'documents';method?:NoticeDeliveryMethod;reason:string;status:'requested'|'responded'|'resolved';created_at:string;response:{contact?:Partial<NoticeFiling['noticee']>;document_ids?:string[]}|null}[];
  reviews:{id:string;version:number;decision:string;comment:string|null;reviewer_role:string;created_at:string;sections?:string[];attachment_document_id?:string|null}[];
};
