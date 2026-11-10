import {z} from 'zod';
import {FirIntakeSchema,FirPersonSchema,validFirDate,type FirIntake} from './fir';
import {firText,FirTextAnswerSchema,answerSchema,answerText,FIR_PERSONAL_LABELS,type Answer} from './fir-answer';

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
export const FirDraftEditableSchema=z.strictObject({
  distance_and_direction_from_station:FirTextAnswerSchema,
  accused:people(FirAccusedSchema),legal_sections:z.array(FirLegalSectionSchema).max(100),
  statement_of_facts:firText.max(10000),witnesses:people(FirWitnessSchema),
  identity_document_id:uuid.nullable(),attachment_ids:z.array(uuid).max(100),
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
  attachments:z.array(z.strictObject({document_id:uuid,filename:z.string().min(1).max(512),mime_type:z.enum(['application/pdf','image/png','image/jpeg'])})).max(100),
});
export type FirDraftContent=z.infer<typeof FirDraftContentSchema>;
export const FirDraftSaveSchema=z.strictObject({base_draft_id:uuid.nullable(),filing_hash:z.string().regex(/^[a-f0-9]{64}$/),content:FirDraftEditableSchema});
export type FirDraftSave=z.infer<typeof FirDraftSaveSchema>;
export type FirDraftContext={intake:FirIntake;filing_hash:string;latest_draft_id:string|null;latest_version:number;latest_content:FirDraftContent|null;legacy_content:unknown|null;initial_content:FirDraftEditable};

export function firEditableContent(c:FirDraftContent):FirDraftEditable {
  return {distance_and_direction_from_station:c.incident.distance_and_direction_from_station,accused:c.accused,legal_sections:c.legal_sections,
    statement_of_facts:c.statement_of_facts,witnesses:c.witnesses,identity_document_id:c.complainant.identity_document_id,attachment_ids:c.attachments.map(d=>d.document_id)};
}
const supplied=(value:string|undefined):Answer<string>|null=>value?.trim()?{status:'provided',value:value.trim()}:null;
export function seedFirDraft(intake:FirIntake,makeId:()=>string):FirDraftEditable {
  const accused=intake.people.filter(p=>p.kind==='accused'),witnesses=intake.people.filter(p=>p.kind==='witness');
  return {distance_and_direction_from_station:null,
    accused:accused.length?{status:'listed',items:accused.map(p=>({id:p.id??makeId(),source_party_id:p.id??null,identity:p.unknown?{status:'unknown',description:p.details||p.alias||''}:{status:'known',name:p.name},primary:p.primary??false,alias:supplied(p.alias),phone:supplied(p.phone),other_details:supplied(p.details),vehicle_used:null,suspected_motive:null}))}:null,
    witnesses:witnesses.length?{status:'listed',items:witnesses.map(p=>({id:p.id??makeId(),source_party_id:p.id??null,name:p.name,phone:supplied(p.phone),role_or_relationship:supplied(p.role),when_present:supplied(p.presence),statement_note:supplied(p.details)}))}:null,
    legal_sections:[],statement_of_facts:[intake.incident.description,intake.incident.additional].filter(Boolean).join('\n\n'),identity_document_id:null,attachment_ids:[]};
}
export function assembleFirDraft(caseId:string,intake:FirIntake,hash:string,capturedAt:string,editable:FirDraftEditable,attachments:FirDraftContent['attachments']):FirDraftContent {
  const filed=<T,>(value:T)=>({source:'client_filing' as const,value});
  return FirDraftContentSchema.parse({schema_version:2,filing_snapshot:{case_id:caseId,captured_at:capturedAt,intake_hash:hash},
    police_filing:{jurisdiction:filed(intake.jurisdiction),station_use:{fir_number:'handwritten_at_station',report_received_at:'handwritten_at_station',receiving_officer_signature:'handwritten_at_station'}},
    complainant:{filed:filed(intake.people.find(p=>p.kind==='complainant')??null),email:filed(intake.contact.email),identity_document_id:editable.identity_document_id},
    incident:{filed:filed(intake.incident),distance_and_direction_from_station:editable.distance_and_direction_from_station},
    accused:editable.accused,legal_sections:editable.legal_sections,statement_of_facts:editable.statement_of_facts,witnesses:editable.witnesses,attachments});
}

export function firDraftProblems(c:FirDraftContent):{field:string;message:string}[] {
  const issues:{field:string;message:string}[]=[];
  const need=(field:string,value:unknown,message=field+' is required before generating the PDF.')=>{if(value===null||value===undefined||typeof value==='string'&&!value.trim())issues.push({field,message});};
  const j=c.police_filing.jurisdiction.value,p=c.complainant.filed.value,i=c.incident.filed.value;
  for(const [label,value]of [['State/UT',j.state],['State LGD code',j.state_code],['District',j.district],['District LGD code',j.district_code],['Police station',j.policeStation],['Complainant name',p?.name],['Complainant phone',p?.phone],['Registered residence',p?.residence],['Incident location',i.location]] as const)need(label,value);
  if(!validFirDate(i.date))issues.push({field:'Incident date',message:'A valid incident date is required from the client’s filing.'});
  if(!/^(?:[01]?\d|2[0-3]):[0-5]\d$|^(?:0?[1-9]|1[0-2]):[0-5]\d\s*(?:AM|PM)$/i.test(i.time))issues.push({field:'Incident time',message:'A valid incident time is required from the client’s filing.'});
  for(const [key,label]of Object.entries(FIR_PERSONAL_LABELS))need(label,p?.personal_details?.[key as keyof typeof FIR_PERSONAL_LABELS],label+' must be answered by the client. It cannot be filled by the advocate.');
  need('Distance/direction from station',c.incident.distance_and_direction_from_station);
  need('Statement of facts',c.statement_of_facts);
  if(!c.legal_sections.length)issues.push({field:'Applicable legal sections',message:'Add at least one complete legal section.'});
  c.legal_sections.forEach((s,n)=>{for(const k of ['act','section','description']as const)need(`Legal section ${n+1}: ${k}`,s[k]);});
  need('Accused',c.accused,'Add accused records or explicitly select None reported.');
  if(c.accused?.status==='listed')c.accused.items.forEach((a,n)=>{
    if(a.identity.status==='known')need(`Accused ${n+1}: name`,a.identity.name);
    // Explicit unknown identity is itself meaningful; a description is optional.
    for(const k of ['alias','phone','other_details','vehicle_used','suspected_motive']as const)need(`Accused ${n+1}: ${k.replaceAll('_',' ')}`,a[k]);
  });
  need('Witnesses',c.witnesses,'Add witnesses or explicitly select None reported.');
  if(c.witnesses?.status==='listed')c.witnesses.items.forEach((w,n)=>{need(`Witness ${n+1}: name`,w.name);for(const k of ['phone','role_or_relationship','when_present','statement_note']as const)need(`Witness ${n+1}: ${k.replaceAll('_',' ')}`,w[k]);});
  if(c.complainant.identity_document_id&&!c.attachments.some(d=>d.document_id===c.complainant.identity_document_id))issues.push({field:'Identity document',message:'Include the selected optional identity document in attachments, or clear the selection.'});
  return issues;
}
// One complete rendering contract, shared by preview, submission and PDF tests.
// Empty optional labels are omitted; only typed station-use fields produce rules.
export function firPdfSections(c:FirDraftContent):{title:string;lines:{label:string;value:string}[]}[] {
  const j=c.police_filing.jurisdiction.value,p=c.complainant.filed.value,i=c.incident.filed.value;
  const line=(label:string,value:string|undefined|null)=>({label,value:value??''});
  const a=(label:string,value:Answer<string|number>|null|undefined)=>line(label,answerText(value));
  const identity=c.attachments.find(d=>d.document_id===c.complainant.identity_document_id);
  const sections=[
    {title:'1. Police Station & Filing Time',lines:[line('Police station',j.policeStation),line('District',j.district),line('State / UT',j.state)]},
    {title:'2. Complainant / Reporter Info',lines:[line('Full legal name',p?.name),...Object.entries(FIR_PERSONAL_LABELS).map(([key,label])=>a(label,p?.personal_details?.[key as keyof typeof FIR_PERSONAL_LABELS])),line('Registered residence',p?.residence),line('Phone',p?.phone),line('Email',c.complainant.email.value),line('Identity document',identity?.filename)]},
    {title:'3. When and Where It Happened',lines:[line('Incident type',i.type),line('Date of incident',i.date),line('Time of incident',i.time),line('Place of incident',i.location),a('Distance / direction from police station',c.incident.distance_and_direction_from_station)]},
    {title:'4. Accused Person(s)',lines:c.accused?.status==='listed'?c.accused.items.flatMap((p,n)=>[line(`Accused ${n+1}${p.primary?' (Primary)':''}`,p.identity.status==='known'?p.identity.name:'Unknown suspect'),...(p.identity.status==='unknown'?[line('Known description',p.identity.description)]:[]),a('Alias / identifying information',p.alias),a('Phone',p.phone),a('Other details',p.other_details),a('Vehicle used',p.vehicle_used),a('Suspected reason / motive',p.suspected_motive)]):[line('Accused','None reported')]},
    {title:'5. Applicable Legal Sections',lines:c.legal_sections.map((s,n)=>line(`${n+1}. ${s.act} — ${s.section}`,s.description))},
    {title:'6. Statement of Facts',lines:[line('',c.statement_of_facts)]},
    {title:'7. Witnesses',lines:c.witnesses?.status==='listed'?c.witnesses.items.flatMap((w,n)=>[line(`Witness ${n+1}`,w.name),a('Phone',w.phone),a('Role / relationship',w.role_or_relationship),a('When present',w.when_present),a('Statement note',w.statement_note)]):[line('Witnesses','None reported')]},
    {title:'8. Attached Documents',lines:c.attachments.length?c.attachments.map((d,n)=>line(`Attachment ${n+1}`,d.filename)):[line('Attachments','None included')]},
  ];
  return sections.map(s=>({...s,lines:s.lines.filter(l=>l.value.trim())}));
}
