import {z} from 'zod';
import {CourtIntakeSchema,CourtPolicySchema} from '@legalitt/shared';
const text=(max=5000)=>z.string().trim().max(max),reason=text().min(1),id=z.uuid(),ids=z.array(id).max(50),money=z.string().regex(/^[1-9]\d{0,10}$/),date=z.iso.date();
const base={revision:z.number().int().nonnegative()};
export const CourtActions={
 intake:z.strictObject({...base,intake:CourtIntakeSchema,tier:z.enum(['ordinary','urgent'])}),
 submit:z.strictObject(base),
 verify:z.strictObject({...base,decision:z.enum(['verified','more_details']),reason:text().optional()}),
 'information-reply':z.strictObject({...base,reply:reason}),
 assign:z.strictObject({...base,advocate_id:id,reason:reason}),
 'advocate-decision':z.strictObject({...base,decision:z.enum(['accept','decline']),reason:text().optional()}),
 'client-accept':z.strictObject(base),
 'change-request':z.strictObject({...base,reason:reason,note:text().default(''),non_refundable_confirmed:z.boolean().optional()}),
 'change-decision':z.strictObject({...base,change_id:id,decision:z.enum(['approved','rejected']),reason:reason}),
 'handover':z.strictObject({...base,change_id:id,document_id:id}),
 checklist:z.strictObject({...base,message:text().default(''),items:z.array(z.strictObject({id:id.optional(),title:text(200).min(1),description:text(2000).default(''),required:z.boolean()})).min(1).max(50)}),
 'checklist-upload':z.strictObject({...base,item_id:id,document_ids:ids.min(1)}),
 pickup:z.strictObject({...base,method:z.enum(['legalitt','self']),name:text(200).min(1),phone:text(30).min(7),address:text(1000).min(5),date,slot:text(100).min(1),instructions:text(1000).default(''),carrier:text(100).optional(),awb:text(200).optional()}),
 'pickup-update':z.strictObject({...base,carrier:text(100).min(1),awb:text(200).min(1),detail:reason,received:z.boolean().default(false)}),
 'documents-received':z.strictObject({...base,item_ids:ids,confirmed:z.literal(true)}),
 'missing-documents':z.strictObject({...base,reason:reason}),
 preparation:z.strictObject({...base,tasks:z.array(text(200).min(1)).max(20),note:text().default('')}),
 'private-note':z.strictObject({...base,note:text(20000)}),
 'fee-request':z.strictObject({...base,kind:z.enum(['court','process']),heading:text(200).min(1),description:reason,amount_paise:money}),
 'fee-receipt':z.strictObject({...base,fee_id:id,document_id:id}),
 'review-send':z.strictObject({...base,document_ids:ids.min(1)}),
 'review-decision':z.strictObject({...base,review_id:id,decision:z.enum(['approved','changes']),comment:text(300).default(''),comments:z.array(z.strictObject({document_id:id,page:z.number().int().min(1),note:text(1000).min(1)})).max(100).default([]),confirmed:z.literal(true)}),
 'review-unlock':z.strictObject({...base,reason:reason}),
 filing:z.strictObject({...base,date,number:text(200).min(1),case_number:text(200).default(''),status:text(200).min(1),note:text().default(''),receipt_id:id.optional(),confirmed:z.literal(true)}),
 hearing:z.strictObject({...base,at:z.iso.datetime({offset:true}),court:text(300).min(1),room:text(200).min(1),bench:text(300).min(1),judge:text(200).optional(),note:text().default('')}),
 'hearing-start':z.strictObject({...base,hearing_id:id,ready:z.literal(true)}),
 'hearing-draft':z.strictObject({...base,hearing_id:id,attendance:z.enum(['appeared','absent','adjournment_sought']),client_present:z.enum(['yes','no','not_required']),status:z.enum(['completed','adjourned','order_passed','not_taken_up','other']),what_happened:text(),direction:text(),order_id:id.optional(),next_step:text(),documents_needed:z.array(text(300)).max(30),private_note:text(10000)}),
 'hearing-update':z.strictObject({...base,hearing_id:id,attendance:z.enum(['appeared','absent','adjournment_sought']),client_present:z.enum(['yes','no','not_required']),status:z.enum(['completed','adjourned','order_passed','not_taken_up','other']),what_happened:reason,direction:text().default(''),order_id:id.optional(),next_step:reason,next_hearing:z.iso.datetime({offset:true}).optional(),documents_needed:z.array(text(300)).max(30).default([]),private_note:text(10000).default('')}),
 'hearing-classify':z.strictObject({...base,hearing_id:id,kind:z.enum(['effective','passive']),reason:reason}),
 'completion-request':z.strictObject({...base,note:reason,order_id:id}),
 'completion-confirm':z.strictObject({...base,confirmed:z.literal(true)}),
 'chat-reopen':z.strictObject({...base,until:z.iso.datetime({offset:true}),reason:reason}),
 'cancel-request':z.strictObject({...base,reason:reason}),
 'cancel-decide':z.strictObject({...base,decision:z.enum(['approved','rejected']),refund_paise:z.string().regex(/^\d{1,12}$/),reason:reason}),
 rate:z.strictObject({...base,rating:z.number().int().min(1).max(5),review:text(500).default('')}),
} as const;
export type CourtAction=keyof typeof CourtActions;
export const CourtSettingsInput=z.strictObject({expected_version:z.number().int().nonnegative(),config:CourtPolicySchema,ordinary_base_paise:money,urgent_base_paise:money,effective_rate_paise:money.nullable(),passive_rate_paise:money.nullable(),reason:reason});
