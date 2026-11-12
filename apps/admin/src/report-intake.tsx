import {PROPERTY_TYPES,PROPERTY_PURPOSES,SEARCH_DURATIONS,FORENSIC_DOCUMENT_TYPES,FORENSIC_ANALYSES,labelOf,type AdminCaseDetail,type PropertySearchIntake,type DocumentForensicIntake} from '@legalitt/shared';
export function ReportIntake({record:r}:{record:AdminCaseDetail}){
 const rows:[string,string|number|null|undefined][]=[];
 if(r.service_code==='property_search'){
  const f=r.intake as PropertySearchIntake;rows.push(['Full name',f.contact?.fullName],['Mobile',f.contact?.mobile],['Email',f.contact?.email],['Property address',f.property_address],['State',f.jurisdiction?.state],['District',f.jurisdiction?.district],['Ward',f.jurisdiction?.ward],['Tehsil / village',f.jurisdiction?.tehsil],['Colony',f.jurisdiction?.colony],['Property type',labelOf(PROPERTY_TYPES,f.property_type)],['Other property type',f.property_type_other],['Survey / plot / khata number',f.survey_number],['Search duration',labelOf(SEARCH_DURATIONS,f.search_duration)],['Purpose',labelOf(PROPERTY_PURPOSES,f.purpose)],['Other purpose',f.purpose_other],['Known owners',f.owner_names?.join(', ')],['What to check',f.requirement]);
 }else{
  const f=r.intake as DocumentForensicIntake;rows.push(['Document type',labelOf(FORENSIC_DOCUMENT_TYPES,f.document_type)],['Requested analysis',labelOf(FORENSIC_ANALYSES,f.analysis_type)],['Document description',f.questioned_description],['Instructions',f.instructions],['Reference sample',f.no_reference_sample?'Client has no reference sample':null]);
  const documents=r.documents.filter(d=>d.kind==='questioned_document');for(const [i,d]of documents.entries())rows.push([`Focus for document ${i+1}`,f.document_focus?.[d.id]]);
 }
 const visible=rows.filter(([,v])=>v!==null&&v!==undefined&&v!=='');return <section className="detail-panel"><div className="section-title"><h2>Client intake</h2></div><p>Client-supplied facts, including any requested corrections. Earlier values remain in the case history.</p>{visible.length?<dl className="event-values">{visible.map(([label,value])=><div className="detail-field" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>:<p>No intake details supplied yet.</p>}</section>;
}
