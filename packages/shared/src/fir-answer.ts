import {z} from 'zod';

export const firText = z.string().trim().max(10000).refine(
  value => !/(?:^|[^\d])\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/.test(value),
  'Do not include a full identity number',
);
export function answerSchema<T extends z.ZodType>(value: T) {
  return z.discriminatedUnion('status', [
    z.strictObject({status: z.literal('provided'), value}),
    z.strictObject({status: z.literal('unknown')}),
    z.strictObject({status: z.literal('not_applicable')}),
  ]);
}
export type Answer<T> = {status:'provided';value:T}|{status:'unknown'}|{status:'not_applicable'};
// Null means unanswered, never an inferred "unknown" or "not applicable".
export const FirTextAnswerSchema = answerSchema(firText.min(1)).nullable();
export const FirPersonalDetailsSchema = z.strictObject({
  father_name: FirTextAnswerSchema,
  age: answerSchema(z.number().int().min(0).max(130)).nullable(),
  gender: FirTextAnswerSchema,
  occupation: FirTextAnswerSchema,
  present_address: FirTextAnswerSchema,
});
export type FirPersonalDetails = z.infer<typeof FirPersonalDetailsSchema>;
export const FIR_PERSONAL_LABELS = {father_name:"Father’s name",age:'Age',gender:'Gender',occupation:'Occupation',present_address:'Present address'} as const;
export const emptyFirPersonalDetails = ():FirPersonalDetails => ({father_name:null,age:null,gender:null,occupation:null,present_address:null});
export function answerText(answer:Answer<string|number>|null|undefined) {
  return answer?.status==='provided'?String(answer.value):answer?.status==='unknown'?'Unknown':answer?.status==='not_applicable'?'Not applicable':'';
}
export const FIR_OPTIONAL_ID_NOTICE = 'ID proof is optional for FIR. Which identity documents are accepted is awaiting client confirmation (Q15). If you upload Aadhaar, use a masked copy only. An upload does not verify identity.';
