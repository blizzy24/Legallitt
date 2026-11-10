import {z} from 'zod';

export const ConsultationServiceSchema = z.enum(['legal_advice','district_court','high_court']);
export type ConsultationServiceCode = z.infer<typeof ConsultationServiceSchema>;
export const isConsultationService = (code: string): code is ConsultationServiceCode => ConsultationServiceSchema.safeParse(code).success;
export const consultationServiceName = (code: ConsultationServiceCode) => ({legal_advice:'Legal Advice',district_court:'District Court Representation',high_court:'High Court Representation'})[code];
const text = (max=500) => z.string().trim().max(max);
// Draft intake must retain partially typed dates; submission validates the date.
const date = text(20);
export const ConsultationIntakeSchema = z.strictObject({
  intake_version:z.literal(1).default(1), full_name:text(200).default(''), phone:text(30).default(''), email:text(254).default(''),
  matter_type:text(100).default(''), description:text(10000).default(''), title:text(300).default(''), other_party:text(300).default(''),
  state:text(100).default(''), district:text(100).default(''), city:text(150).default(''), court_bench:text(300).default(''),
  bench_unknown:z.boolean().default(false), important_date:date.default(''), important_date_reason:text(500).default(''),
  existing_case:z.boolean().default(false), case_number:text(100).default(''), previous_advocate:text(200).default(''),
  change_reason:text(1000).default(''), sub_category:text(150).default(''), dispute_location:text(500).default(''),
  other_details:text(5000).default(''), consent:z.boolean().default(false),
});
export type ConsultationIntake = z.infer<typeof ConsultationIntakeSchema>;
export function consultationIntakeProblems(code:ConsultationServiceCode, v:ConsultationIntake):string[] {
  const errors:string[]=[];
  if(!v.full_name)errors.push('Enter your full name.');
  if(!/^\+?[0-9 ()-]{7,20}$/.test(v.phone))errors.push('Enter a valid contact phone number.');
  if(!z.email().safeParse(v.email).success)errors.push('Enter a valid email address.');
  if(v.description.length<10)errors.push('Describe your concern in at least 10 characters.');
  if(code!=='legal_advice'){
    if(!v.matter_type)errors.push('Select a case type.');
    if(!v.title)errors.push('Enter a case title.');
    if(!v.other_party)errors.push('Enter the other party’s name.');
    if(!v.state||!v.district)errors.push('Select the state and district.');
    if(code==='high_court'&&!v.court_bench&&!v.bench_unknown)errors.push('Enter the court / bench, or select that you do not know it.');
  }
  if(!v.consent)errors.push('Confirm that your information is correct and agree to submit your request.');
  if(v.important_date&&!z.iso.date().safeParse(v.important_date).success)errors.push('Enter the important date as YYYY-MM-DD.');
  return errors;
}
export const ConsultationIntakeSaveSchema=z.strictObject({expected_updated_at:z.iso.datetime(),intake:ConsultationIntakeSchema});
const time=z.string().regex(/^(?:[01]\d|2[0-3]):[03]0$/,'Use a half-hour time, for example 09:00 or 17:30');
export const WeeklyIntervalSchema=z.strictObject({day:z.number().int().min(0).max(6),start:time,end:z.union([time,z.literal('24:00')])});
export const WeeklyAvailabilitySchema=z.strictObject({expected_version:z.number().int().nonnegative(),intervals:z.array(WeeklyIntervalSchema).max(28)})
  .superRefine((v,ctx)=>{
    const sorted=[...v.intervals].sort((a,b)=>a.day-b.day||a.start.localeCompare(b.start));
    sorted.forEach((r,i)=>{
      if(r.end<=r.start)ctx.addIssue({code:'custom',message:'Each end time must be after its start time; split overnight hours across days.'});
      if(i&&sorted[i-1].day===r.day&&sorted[i-1].end>r.start)ctx.addIssue({code:'custom',message:'Weekly availability periods must not overlap.'});
    });
  });
export type WeeklyInterval=z.infer<typeof WeeklyIntervalSchema>;
export const ConsultationPolicySchema=z.strictObject({version:z.number().int().positive(),timezone:z.literal('Asia/Kolkata'),duration_min:z.literal(30),
  booking_horizon_days:z.number().int().min(1).max(90),minimum_notice_minutes:z.number().int().nonnegative(),hold_minutes:z.number().int().min(1).max(60),
  reschedule_notice_minutes:z.number().int().nonnegative(),quote_valid_days:z.number().int().min(1).max(90),
  completing_advocate_receives_all:z.literal(true),channel:z.literal('chat'),});
export type ConsultationPolicy=z.infer<typeof ConsultationPolicySchema>;
export const ConsultationBookingSchema=z.strictObject({advocate_id:z.uuid(),scheduled_at:z.iso.datetime()});
export const ConsultationActionSchema=z.strictObject({expected_revision:z.number().int().nonnegative()});
export const CourtQuoteInputSchema=z.strictObject({expected_revision:z.number().int().nonnegative(),
  base_amount_paise:z.string().regex(/^[1-9]\d{0,8}$/),scope:text(10000).min(10),exclusions:text(5000).min(1),});
export const ConsultationReportContentSchema=z.strictObject({key_points:text(20000).min(10),next_steps:text(20000).min(3),
  outcome:text(10000).min(3),attachment_ids:z.array(z.uuid()).max(30).refine(a=>new Set(a).size===a.length,'Do not repeat attachments')});
export type ConsultationReportContent=z.infer<typeof ConsultationReportContentSchema>;
export const ConsultationReportSaveSchema=z.strictObject({expected_revision:z.number().int().nonnegative(),kind:z.enum(['consultation','completion']),content:ConsultationReportContentSchema});
export const ConsultationReportReviewSchema=z.strictObject({expected_revision:z.number().int().nonnegative(),report_id:z.uuid(),decision:z.enum(['approved','returned']),reason:text(5000).optional()})
  .refine(v=>v.decision==='approved'||!!v.reason?.trim(),'Describe what must be corrected.');
export const CourtProgressSchema=z.strictObject({expected_revision:z.number().int().nonnegative(),stage:z.enum(['preparation','filed','hearing','decision']),
  update:text(10000).min(3),court:text(300).optional(),case_number:text(100).optional(),next_hearing:z.iso.datetime().optional(),
  hearing_at:z.iso.datetime().optional(),court_room:text(200).optional(),next_steps:text(5000).optional(),
  document_ids:z.array(z.uuid()).max(30).default([])});
export const ConsultationPaymentSchema=z.strictObject({purpose:z.enum(['service_fee','representation']),quote_id:z.uuid(),court_quote_id:z.uuid().optional()});
export const ConsultationReviewSchema=z.strictObject({rating:z.number().int().min(1).max(5),review:text(2000).default('')});
