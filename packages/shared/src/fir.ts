import {z} from 'zod';
import {FirPersonalDetailsSchema,FIR_PERSONAL_LABELS} from './fir-answer';

export const FIR_AWAITING_APPROVAL = 'awaiting_admin_approval';
const text = z.string().trim().max(10000).refine(value => !/(?:^|[^\d])\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/.test(value), 'Do not include a full identity number');
const phoneText = z.string().trim().max(50);
export const FirPersonSchema = z.strictObject({
  id: z.uuid().optional(), kind: z.enum(['complainant','accused','witness']), name: text, details: text,
  phone: phoneText.optional(), residence: text.optional(), alias: text.optional(), unknown: z.boolean().optional(),
  primary: z.boolean().optional(), role: text.optional(), presence: text.optional(),
  personal_details: FirPersonalDetailsSchema.optional(),
});
export type FirPerson = z.infer<typeof FirPersonSchema>;
export const FirIntakeSchema = z.strictObject({
  intake_version: z.literal(2).optional(), intake_step: z.number().int().min(1).max(5).optional(),
  contact: z.strictObject({fullName: text, mobile: phoneText, email: text, country_code:z.string().regex(/^[A-Z]{2}$/).optional(),dial_code:z.string().regex(/^\+\d{1,4}$/).optional()}),
  jurisdiction: z.strictObject({state: text, district: text, policeStation: text, state_code: z.string().regex(/^\d*$/).optional(), district_code: z.string().regex(/^\d*$/).optional(), source_retrieved_at: z.iso.datetime().optional()}),
  incident: z.strictObject({type: text, date: text, time: text, location: text, description: text, additional: text.default('')}),
  people: z.array(FirPersonSchema).max(100),
});
export type FirIntake = z.infer<typeof FirIntakeSchema>;
export const FirIntakeSaveSchema = FirIntakeSchema.extend({expected_updated_at:z.iso.datetime().optional()});
// Version 2 stores people in case_parties. Project them into the established
// response shape so existing advocate/admin consumers keep working unchanged.
export function firIntakeDetails(details: unknown, parties: {id:string;kind:string;name:string;details:unknown}[]): Record<string,unknown> {
  const d=(details??{}) as Record<string,unknown>;
  if(d.intake_version!==2)return d;
  const people=parties.filter(p=>['complainant','accused','witness'].includes(p.kind)).map(p=>{
    const v=(p.details??{}) as Record<string,unknown>;
    return {id:p.id,kind:p.kind,name:p.name,details:v.description??'',phone:v.phone??'',residence:v.residence??'',alias:v.alias??'',unknown:v.unknown??false,primary:v.primary??false,role:v.role??'',presence:v.presence??'',...(v.personal_details?{personal_details:v.personal_details}:{}),order:Number(v.order??0)};
  }).sort((a,b)=>a.order-b.order).map(({order,...person})=>person);
  return {...d,people};
}
export function validFirDate(value:string) {
  const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value),local=/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})$/.exec(value);
  if(!iso&&!local)return false;
  const [y,m,d]=iso?[+iso[1],+iso[2],+iso[3]]:[+local![3],+local![2],+local![1]],date=new Date(Date.UTC(y,m-1,d));
  return y>=1900&&date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d;
}
export function firIntakeErrors(v:FirIntake,step=5):Record<string,string> {
  const errors:Record<string,string>={};
  if(!v.contact.fullName.trim())errors.fullName='Enter your full name.';
  if(!/^[+\d ()-]+$/.test(v.contact.mobile)||v.contact.mobile.replace(/\D/g,'').length<7||v.contact.mobile.replace(/\D/g,'').length>15)errors.mobile='Enter a valid contact number.';
  if(v.contact.email&&!z.email().safeParse(v.contact.email).success)errors.email='Enter a valid email address or leave it empty.';
  if(!v.incident.type)errors.type='Choose the incident type.';
  if(!v.jurisdiction.state_code)errors.state='Choose a state or union territory.';
  if(!v.jurisdiction.district_code)errors.district='Choose a district in the selected state.';
  if(!v.jurisdiction.policeStation.trim())errors.policeStation='Enter the police station name.';
  if(step>=2){
    if(!validFirDate(v.incident.date))errors.date='Enter a valid date as DD/MM/YYYY or YYYY-MM-DD.';
    if(!/^(?:[01]?\d|2[0-3]):[0-5]\d$|^(?:0?[1-9]|1[0-2]):[0-5]\d\s*(?:AM|PM)$/i.test(v.incident.time))errors.time='Enter a valid time, for example 14:30 or 02:30 PM.';
    if(!v.incident.location.trim())errors.location='Enter where the incident happened.';
    if(!v.incident.description.trim()||v.incident.description.length>2000)errors.description='Enter the narrative, up to 2,000 characters.';
  }
  if(step>=3){
    const complainants=v.people.filter(p=>p.kind==='complainant');
    if(complainants.length!==1||!complainants[0].name.trim()||!complainants[0].phone?.trim())errors.complainant='Add the complainant’s name and contact number.';
    if(!complainants[0]?.residence?.trim())errors.residence='Enter the complainant’s registered residence.';
    for(const [key,label] of Object.entries(FIR_PERSONAL_LABELS))if(!complainants[0]?.personal_details?.[key as keyof typeof FIR_PERSONAL_LABELS])errors['complainant_'+key]=`Complete ${label.toLowerCase()}, or explicitly choose Unknown or Not applicable.`;
    for(const p of v.people)if(p.kind!=='complainant'&&!p.name.trim()&&!(p.kind==='accused'&&p.unknown))errors[p.id??p.kind]='Enter the person’s name, or mark an accused person as unknown.';
    for(const p of v.people)if(p.phone&&(!/^[+\d ()-]+$/.test(p.phone)||p.phone.replace(/\D/g,'').length<7||p.phone.replace(/\D/g,'').length>15))errors[p.id??p.kind]='Enter a valid contact number, or leave optional numbers empty.';
  }
  return errors;
}
export const FirSubmissionSchema = FirIntakeSchema.refine(v =>
  !!(v.contact.fullName && v.contact.mobile && v.jurisdiction.state && v.jurisdiction.district && v.jurisdiction.policeStation &&
    v.incident.type && v.incident.date && v.incident.time && v.incident.location && v.incident.description),
  'Complete contact, jurisdiction and incident details before submitting.').superRefine((v,ctx)=>{
    for(const [key,message]of Object.entries(firIntakeErrors(v)))ctx.addIssue({code:'custom',path:[key],message});
  });

// Fields from the supplied FORM I screen; no sample values or inferred offences.
export const FIR_FIELDS = [
  ['Police Station & Filing Time', ['Police Station','District & State','FIR Number','Report Received Date & Time']],
  ['Complainant / Reporter Info', ['Full Legal Name',"Father's Name",'Age & Gender','Occupation / Job','Home & Present Address','Phone & Email','Official ID Document']],
  ['When and Where It Happened', ['Date & Time of Crime','Place of Incident','Distance from Police Station']],
  ['Accused Person(s)', ['Main Accused Name','Other People Involved','Vehicle Used','Suspected Reason / Motive']],
] as const;
const fieldNames = new Set<string>(FIR_FIELDS.flatMap(([, fields]) => [...fields]));
export const LegacyFirDraftSchema = z.strictObject({
  fields: z.record(z.string().refine(k => fieldNames.has(k)), text),
  legal_sections: z.array(text.min(1)).max(100),
  narrative: text,
  witnesses: z.array(text.min(1)).max(100),
  document_ids: z.array(z.uuid()).max(100),
});
export type LegacyFirDraftContent = z.infer<typeof LegacyFirDraftSchema>;
export const LegacyFirSendSchema = LegacyFirDraftSchema.refine(v => !!(v.narrative && v.fields['Police Station'] && v.fields['Full Legal Name']),
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
