import {z} from 'zod';
import {FirIntakeSchema,FirPersonSchema,validFirDate,type FirIntake} from './fir';
import {firText,FirTextAnswerSchema,answerSchema,answerText,FIR_PERSONAL_LABELS,type Answer} from './fir-answer';
import type {FirIdentityPolicy} from './fir-identity';
import {firIncidentLabel} from './fir-flow';

const uuid=z.uuid();
const phoneAnswer=answerSchema(z.string().trim().min(1).max(50)).nullable();
const sourced=<T extends z.ZodType>(value:T)=>z.strictObject({source:z.literal('client_filing'),value});
const people=<T extends z.ZodType>(item:T)=>z.discriminatedUnion('status',[
  z.strictObject({status:z.literal('listed'),items:z.array(item).min(1).max(100)}),
  z.strictObject({status:z.literal('none_reported')}),
]).nullable();
export const FirAccusedSchema=z.strictObject({
  id:uuid,source_party_id:uuid.nullable(),
  identity:z.discriminatedUnion('status',[
    z.strictObject({status:z.literal('known'),name:firText}),
    z.strictObject({status:z.literal('unknown'),description:firText}),
  ]),
  primary:z.boolean(),alias:FirTextAnswerSchema,phone:phoneAnswer,other_details:FirTextAnswerSchema,
  vehicle_used:FirTextAnswerSchema,suspected_motive:FirTextAnswerSchema,
});
export const FirWitnessSchema=z.strictObject({
  id:uuid,source_party_id:uuid.nullable(),name:firText,phone:phoneAnswer,
  role_or_relationship:FirTextAnswerSchema,when_present:FirTextAnswerSchema,statement_note:FirTextAnswerSchema,
});
export const FirLegalSectionSchema=z.strictObject({id:uuid,act:firText,section:firText,description:firText});
// Flow A5: every filed proforma field in sections 1-3 is editable. An advocate's
// edit is stored as an override; `client_filing` keeps what the client filed. An
// absent key prints the filed value; an empty string means the advocate cleared it.
const override=firText.max(2000).optional();
export const FirDraftOverridesSchema=z.strictObject({
  police_station:override,district_state:override,
  complainant_name:override,father_name:override,age_gender:override,occupation:override,address:override,residence:override,phone_email:override,
  incident_date:override,incident_time:override,place:override,
});
export type FirDraftOverrides=z.infer<typeof FirDraftOverridesSchema>;
export type FirDraftOverrideKey=keyof FirDraftOverrides;
export const FirDraftEditableSchema=z.strictObject({
  distance_and_direction_from_station:FirTextAnswerSchema,
  accused:people(FirAccusedSchema),legal_sections:z.array(FirLegalSectionSchema).max(100),
  statement_of_facts:firText.max(10000),witnesses:people(FirWitnessSchema),
  identity_document_id:uuid.nullable(),attachment_ids:z.array(uuid).max(100),
  overrides:FirDraftOverridesSchema.optional(),
  /** Section 4 "Other People Involved": optional free text, empty is not printed. */
  others_involved:firText.max(2000).optional(),
}).superRefine((v,ctx)=>{
  for(const [key,ids]of [['attachments',v.attachment_ids],['accused',v.accused?.status==='listed'?v.accused.items.map(x=>x.id):[]],['witnesses',v.witnesses?.status==='listed'?v.witnesses.items.map(x=>x.id):[]],['legal_sections',v.legal_sections.map(x=>x.id)]] as const)
    if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',path:[key],message:'Duplicate entry identifier'});
});
export type FirDraftEditable=z.infer<typeof FirDraftEditableSchema>;
export type FirAccused=z.infer<typeof FirAccusedSchema>;
export type FirWitness=z.infer<typeof FirWitnessSchema>;
export const FirStationUseSchema=z.strictObject({
  fir_number:z.literal('handwritten_at_station'),
  report_received_at:z.literal('handwritten_at_station'),
  receiving_officer_signature:z.literal('handwritten_at_station'),
});
export const FirDraftContentSchema=z.strictObject({
  schema_version:z.literal(2),
  filing_snapshot:z.strictObject({case_id:uuid,captured_at:z.iso.datetime(),intake_hash:z.string().regex(/^[a-f0-9]{64}$/)}),
  police_filing:z.strictObject({jurisdiction:sourced(FirIntakeSchema.shape.jurisdiction),station_use:FirStationUseSchema}),
  complainant:z.strictObject({filed:sourced(FirPersonSchema.nullable()),email:sourced(firText),identity_document_id:uuid.nullable()}),
  incident:z.strictObject({filed:sourced(FirIntakeSchema.shape.incident),distance_and_direction_from_station:FirTextAnswerSchema}),
  accused:people(FirAccusedSchema),legal_sections:z.array(FirLegalSectionSchema).max(100),
  statement_of_facts:firText.max(10000),witnesses:people(FirWitnessSchema),
  attachments:z.array(z.strictObject({document_id:uuid,filename:z.string().min(1).max(512),mime_type:z.enum(['application/pdf','image/png','image/jpeg','video/mp4','audio/mpeg'])})).max(100),
  // Additive (flow A5): drafts saved before these existed still parse.
  overrides:FirDraftOverridesSchema.optional(),
  others_involved:firText.min(1).max(2000).optional(),
});
export type FirDraftContent=z.infer<typeof FirDraftContentSchema>;
export const FirDraftSaveSchema=z.strictObject({base_draft_id:uuid.nullable(),filing_hash:z.string().regex(/^[a-f0-9]{64}$/),content:FirDraftEditableSchema,
  /** Flow A5 auto-save: update the advocate's own, never-sent working version in place (no new version, no event). */
  autosave:z.boolean().optional(),
  /** With autosave: `filing_snapshot.captured_at` of the version on screen, so a stale session can't overwrite newer work. */
  base_saved_at:z.iso.datetime().optional(),
}).refine(v=>!v.autosave||!!v.base_saved_at,{path:['base_saved_at'],message:'Auto-save needs the saved version it updates.'});
export type FirDraftSave=z.infer<typeof FirDraftSaveSchema>;
export type FirDraftContext={requires_new_version?:boolean;identity_policy:FirIdentityPolicy;intake:FirIntake;filing_hash:string;latest_draft_id:string|null;latest_version:number;latest_content:FirDraftContent|null;legacy_content:unknown|null;initial_content:FirDraftEditable};

export function firEditableContent(c:FirDraftContent):FirDraftEditable {
  return {distance_and_direction_from_station:c.incident.distance_and_direction_from_station,accused:c.accused,legal_sections:c.legal_sections,
    statement_of_facts:c.statement_of_facts,witnesses:c.witnesses,identity_document_id:c.complainant.identity_document_id,attachment_ids:c.attachments.map(d=>d.document_id),
    ...(c.overrides?{overrides:c.overrides}:{}),...(c.others_involved?{others_involved:c.others_involved}:{})};
}
const supplied=(value:string|undefined):Answer<string>|null=>value?.trim()?{status:'provided',value:value.trim()}:null;
const FIR_TIME=/^(?:[01]?\d|2[0-3]):[0-5]\d$|^(?:0?[1-9]|1[0-2]):[0-5]\d\s*(?:AM|PM)$/i;
const isoDate=(v:string)=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());return m?`${m[3]}/${m[2]}/${m[1]}`:v.trim();};
const time12=(v:string)=>{const m=/^([01]?\d|2[0-3]):([0-5]\d)$/.exec(v.trim());if(!m)return v.trim().toUpperCase();const h=+m[1];return `${String(h%12||12).padStart(2,'0')}:${m[2]} ${h<12?'AM':'PM'}`;};
/**
 * The filed values of the editable proforma fields (flow A5 sections 1-3), as the
 * editor pre-fills them. Composite boxes ("District & State", "Age & Gender",
 * "Phone & Email") join their parts; the date reads DD/MM/YYYY and the time 12-hour,
 * both formats `firDraftProblems` accepts when the advocate edits them.
 */
export function firFiledValues(intake:FirIntake):Record<FirDraftOverrideKey,string> {
  const p=intake.people.find(x=>x.kind==='complainant'),pd=p?.personal_details,j=intake.jurisdiction;
  const age=answerText(pd?.age),gender=answerText(pd?.gender);
  return {
    police_station:j.policeStation.trim(),district_state:[j.district,j.state].map(v=>v.trim()).filter(Boolean).join(', '),
    complainant_name:(p?.name??'').trim(),father_name:answerText(pd?.father_name),
    age_gender:[age&&(pd?.age?.status==='provided'?`${age} Years`:age),gender].filter(Boolean).join(' / '),
    occupation:answerText(pd?.occupation),address:answerText(pd?.present_address),residence:(p?.residence??'').trim(),
    phone_email:[p?.phone?.trim()||intake.contact.mobile.trim(),intake.contact.email.trim()].filter(Boolean).join(' | '),
    incident_date:isoDate(intake.incident.date),incident_time:time12(intake.incident.time),place:intake.incident.location.trim(),
  };
}
/**
 * Flow A5 §6: the statement starts as the letter an advocate files ("To, The Station
 * House Officer, … Respected Sir, I, <name>, aged <age> years, state that …") around
 * the client's own words. Each part appears only when its value exists.
 */
export function firLetterStatement(intake:FirIntake):string {
  const p=intake.people.find(x=>x.kind==='complainant'),j=intake.jurisdiction;
  const station=[j.policeStation,j.district].map(v=>v.trim()).filter(Boolean).join(', ');
  const name=(p?.name||intake.contact.fullName).trim(),age=p?.personal_details?.age?.status==='provided'?p.personal_details.age.value:null;
  const facts=[intake.incident.description,intake.incident.additional].map(v=>v.trim()).filter(Boolean).join('\n\n');
  const who=name?`I, ${[name,age!==null?`aged ${age} years`:''].filter(Boolean).join(', ')}, state that `:'I state that ';
  return [['To,','The Station House Officer,',...(station?[`${station}.`]:[])].join('\n'),['Respected Sir,',...(facts?[who+facts]:[])].join('\n')].join('\n\n');
}
export function seedFirDraft(intake:FirIntake,makeId:()=>string):FirDraftEditable {
  const accused=intake.people.filter(p=>p.kind==='accused'),witnesses=intake.people.filter(p=>p.kind==='witness');
  return {distance_and_direction_from_station:null,
    accused:accused.length?{status:'listed',items:accused.map(p=>({id:p.id??makeId(),source_party_id:p.id??null,identity:p.unknown?{status:'unknown',description:p.details||p.alias||''}:{status:'known',name:p.name},primary:p.primary??false,alias:supplied(p.alias),phone:supplied(p.phone),other_details:supplied(p.details),vehicle_used:null,suspected_motive:null}))}:null,
    witnesses:witnesses.length?{status:'listed',items:witnesses.map(p=>({id:p.id??makeId(),source_party_id:p.id??null,name:p.name,phone:supplied(p.phone),role_or_relationship:supplied(p.role),when_present:supplied(p.presence),statement_note:supplied(p.details)}))}:null,
    legal_sections:[],statement_of_facts:firLetterStatement(intake),identity_document_id:null,attachment_ids:[]};
}
export function assembleFirDraft(caseId:string,intake:FirIntake,hash:string,capturedAt:string,editable:FirDraftEditable,attachments:FirDraftContent['attachments']):FirDraftContent {
  const filed=<T,>(value:T)=>({source:'client_filing' as const,value});
  const overrides=Object.fromEntries(Object.entries(editable.overrides??{}).filter(([,v])=>v!==undefined));
  const others=editable.others_involved?.trim();
  return FirDraftContentSchema.parse({schema_version:2,filing_snapshot:{case_id:caseId,captured_at:capturedAt,intake_hash:hash},
    police_filing:{jurisdiction:filed(intake.jurisdiction),station_use:{fir_number:'handwritten_at_station',report_received_at:'handwritten_at_station',receiving_officer_signature:'handwritten_at_station'}},
    complainant:{filed:filed(intake.people.find(p=>p.kind==='complainant')??null),email:filed(intake.contact.email),identity_document_id:editable.identity_document_id},
    incident:{filed:filed(intake.incident),distance_and_direction_from_station:editable.distance_and_direction_from_station},
    accused:editable.accused,legal_sections:editable.legal_sections,statement_of_facts:editable.statement_of_facts,witnesses:editable.witnesses,attachments,
    ...(Object.keys(overrides).length?{overrides}:{}),...(others?{others_involved:others}:{})});
}
/** The value a filed field prints: the advocate's override where there is one, otherwise the client's filing. */
const pick=(c:FirDraftContent,key:FirDraftOverrideKey,filed:string|null|undefined)=>c.overrides?.[key]??filed??'';
/** The police station the draft is prepared for (flow A5 header), after any advocate edit. */
export const firDraftStation=(c:FirDraftContent)=>pick(c,'police_station',c.police_filing.jurisdiction.value.policeStation).trim();

// Flow A5 Send for Review: only the fields the flow requires (name, police station,
// date, place, a complete legal section, the statement), plus the personal details
// the client had to answer at filing. No identity document (Q114).
// Everything else is optional: an empty value is simply not printed.
export function firDraftProblems(c:FirDraftContent):{field:string;message:string}[] {
  const issues:{field:string;message:string}[]=[];
  const need=(field:string,value:unknown,message=field+' is required before generating the PDF.')=>{if(value===null||value===undefined||typeof value==='string'&&!value.trim())issues.push({field,message});};
  const j=c.police_filing.jurisdiction.value,p=c.complainant.filed.value,i=c.incident.filed.value,ov=c.overrides??{};
  need('Police station',pick(c,'police_station',j.policeStation));
  need('Complainant name',pick(c,'complainant_name',p?.name));
  if(!validFirDate(pick(c,'incident_date',i.date).trim()))issues.push({field:'Incident date',message:'Enter a valid incident date as DD/MM/YYYY.'});
  if(!FIR_TIME.test(pick(c,'incident_time',i.time).trim()))issues.push({field:'Incident time',message:'Enter a valid incident time, for example 14:30 or 02:30 PM.'});
  need('Place of incident',pick(c,'place',i.location));
  for(const [key,label]of Object.entries(FIR_PERSONAL_LABELS))need(label,p?.personal_details?.[key as keyof typeof FIR_PERSONAL_LABELS],label+' must be answered by the client. It cannot be filled by the advocate.');
  for(const [key,label]of [['father_name','Father’s name'],['age_gender','Age & gender'],['occupation','Occupation'],['address','Address']] as const)
    if(ov[key]!==undefined&&!ov[key].trim())issues.push({field:label,message:`${label} can’t be left empty: the client answered it. Enter the value.`});
  need('Statement of facts',c.statement_of_facts);
  if(!c.legal_sections.length)issues.push({field:'Applicable legal sections',message:'Add at least one complete legal section.'});
  c.legal_sections.forEach((s,n)=>{for(const k of ['act','section','description']as const)need(`Legal section ${n+1}: ${k}`,s[k]);});
  // A listed person needs a name; an accused the client marked unknown is described instead.
  if(c.accused?.status==='listed')c.accused.items.forEach((a,n)=>{if(a.identity.status==='known')need(`Accused ${n+1}: name`,a.identity.name);});
  if(c.witnesses?.status==='listed')c.witnesses.items.forEach((w,n)=>need(`Witness ${n+1}: name`,w.name));
  return issues;
}
// One complete rendering contract, shared by preview, submission and PDF tests.
// Empty optional labels are omitted; only typed station-use fields produce rules.
// Q114: no "Official ID Document" row, and an identity file an older draft selected
// (`complainant.identity_document_id`) is never listed among the attachments.
export function firPdfSections(c:FirDraftContent):{title:string;lines:{label:string;value:string}[]}[] {
  const j=c.police_filing.jurisdiction.value,p=c.complainant.filed.value,pd=p?.personal_details,i=c.incident.filed.value,ov=c.overrides??{};
  const line=(label:string,value:string|undefined|null)=>({label,value:value??''});
  const a=(label:string,value:Answer<string|number>|null|undefined)=>line(label,answerText(value));
  // An advocate's edit replaces the filed value; a composite box replaces all its parts.
  const filed=(key:FirDraftOverrideKey,label:string,parts:{label:string;value:string}[])=>ov[key]!==undefined?[line(label,ov[key])]:parts;
  const attachments=c.attachments.filter(d=>d.document_id!==c.complainant.identity_document_id);
  const accused=c.accused?.status==='listed'?c.accused.items.flatMap((p,n)=>[line(`Accused ${n+1}${p.primary?' (Primary)':''}`,p.identity.status==='known'?p.identity.name:'Unknown suspect'),...(p.identity.status==='unknown'?[line('Known description',p.identity.description)]:[]),a('Alias / identifying information',p.alias),a('Phone',p.phone),a('Other details',p.other_details),a('Vehicle used',p.vehicle_used),a('Suspected reason / motive',p.suspected_motive)]):[];
  const others=c.others_involved?.trim()?[line('Other people involved',c.others_involved)]:[];
  const sections=[
    {title:'1. Police Station & Filing Time',lines:[line('Police station',pick(c,'police_station',j.policeStation)),...filed('district_state','District & State',[line('District',j.district),line('State / UT',j.state)])]},
    {title:'2. Complainant / Reporter Info',lines:[line('Full legal name',pick(c,'complainant_name',p?.name)),
      ...filed('father_name',FIR_PERSONAL_LABELS.father_name,[a(FIR_PERSONAL_LABELS.father_name,pd?.father_name)]),
      ...filed('age_gender','Age & Gender',[a(FIR_PERSONAL_LABELS.age,pd?.age),a(FIR_PERSONAL_LABELS.gender,pd?.gender)]),
      ...filed('occupation',FIR_PERSONAL_LABELS.occupation,[a(FIR_PERSONAL_LABELS.occupation,pd?.occupation)]),
      ...filed('address',FIR_PERSONAL_LABELS.present_address,[a(FIR_PERSONAL_LABELS.present_address,pd?.present_address)]),
      line('Registered residence',pick(c,'residence',p?.residence)),
      ...filed('phone_email','Phone & Email',[line('Phone',p?.phone),line('Email',c.complainant.email.value)])]},
    {title:'3. When and Where It Happened',lines:[line('Incident type',firIncidentLabel(i.type)),line('Date of incident',pick(c,'incident_date',i.date)),line('Time of incident',pick(c,'incident_time',i.time)),line('Place of incident',pick(c,'place',i.location)),a('Distance / direction from police station',c.incident.distance_and_direction_from_station)]},
    {title:'4. Accused Person(s)',lines:accused.length||others.length?[...accused,...others]:[line('Accused','None reported')]},
    {title:'5. Applicable Legal Sections',lines:c.legal_sections.map((s,n)=>line(`${n+1}. ${s.act} — ${s.section}`,s.description))},
    {title:'6. Statement of Facts',lines:[line('',c.statement_of_facts)]},
    {title:'7. Witnesses',lines:c.witnesses?.status==='listed'?c.witnesses.items.flatMap((w,n)=>[line(`Witness ${n+1}`,w.name),a('Phone',w.phone),a('Role / relationship',w.role_or_relationship),a('When present',w.when_present),a('Statement note',w.statement_note)]):[line('Witnesses','None reported')]},
    {title:'8. Attached Documents',lines:attachments.length?attachments.map((d,n)=>line(`Attachment ${n+1}`,d.filename)):[line('Attachments','None included')]},
  ];
  return sections.map(s=>({...s,lines:s.lines.filter(l=>l.value.trim())}));
}
