const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {assembleFirDraft,firDraftProblems,firEditableContent,firLetterStatement,seedFirDraft,FirDraftSaveSchema}=require('@legalitt/shared');
const {renderFirPdf}=require('../dist/src/documents/fir-pdf');
const {readPdfText}=require('./helpers/pdf-text.cjs'),fixture=require('./helpers/fir.cjs');
// Q114: no identity document; the draft attaches ordinary evidence.
function content(){const intake=fixture.intake(),editable=fixture.editable(intake);const id=randomUUID();editable.attachment_ids=[id];return assembleFirDraft(randomUUID(),intake,'a'.repeat(64),'2026-11-10T12:00:00.000Z',editable,[{document_id:id,filename:'TEST-evidence.pdf',mime_type:'application/pdf'}]);}
test('FIR PDF prints all eight structured sections, repeatable records and edited values; no identity document row (Q114)',async()=>{
 const c=content();c.attachments=[{document_id:randomUUID(),filename:'TEST second upload chosen first.pdf',mime_type:'application/pdf'},{document_id:randomUUID(),filename:'TEST first upload chosen second.png',mime_type:'image/png'}];
 assert.equal(c.complainant.identity_document_id,null);assert.deepEqual(firDraftProblems(c),[]);const {text,pages}=await readPdfText(await renderFirPdf('FIR_DRAFT-2026-TEST',c));
 for(const value of ['FIR DRAFT — prepared for submission at TEST Colaba Station, Maharashtra','FIRST INFORMATION REPORT','FORM I — POLICE INFORMATION PROFORMA','Police Station & Filing Time','Complainant / Reporter Info','When and Where It Happened','Accused Person(s)','Applicable Legal Sections','Statement of Facts','Witnesses','Attached Documents','Maharashtra','Mumbai','TEST Colaba Station','TEST Father Rao','37','Woman','TEST Teacher','TEST Present Street 22','TEST Registered Street 11','TEST Complainant Rao','2025550100','fir-test@example.invalid','Theft','2026-11-10','09:30','TEST Harbour Road','TEST 2 km north','TEST Known Suspect','TEST alias','TEST jacket','TEST accused 1 vehicle_used','TEST accused 1 suspected_motive','Unknown suspect','TEST unknown suspect blue coat','TEST accused 2 alias','TEST accused 2 suspected_motive','Unknown','Not applicable','TEST Act (synthetic)','TEST 123','TEST manually chosen provision','TEST ONLY advocate edited narrative.','TEST Witness One','TEST Witness Two','2025550102','2025550103','TEST passerby','TEST shopkeeper','TEST at start','TEST at end','TEST first note','TEST second note','For completion at the police station','FIR number','Date / time received at the station','Receiving officer’s signature'])assert.ok(text.includes(value),value);
 assert.ok(text.indexOf('second upload chosen first.pdf')<text.indexOf('first upload chosen second.png'));
 for(const wrong of ['Madhya Pradesh','Police State Command','LEGAL NOTICE','S/o Shri','Mr.','criminal complaint / FIR','disclaimer','________','original client narrative','Other people involved'])assert.ok(!text.includes(wrong),wrong);
 for(const gone of ['Identity document','Official ID','Identity proof'])assert.ok(!text.includes(gone),gone);assert.ok(pages.length>=2);
});
test('Send for Review requires only the flow’s fields; optional facts may stay empty and are left out of the PDF',async()=>{
 // Distance, accused/witness attributes, an explicit "None reported", district/state, LGD codes, phone and residence are optional.
 const c=content();c.incident.distance_and_direction_from_station=null;
 for(const a of c.accused.items)for(const k of ['alias','phone','other_details','vehicle_used','suspected_motive'])a[k]=null;
 for(const w of c.witnesses.items)for(const k of ['phone','role_or_relationship','when_present','statement_note'])w[k]=null;
 Object.assign(c.police_filing.jurisdiction.value,{state:'',district:'',state_code:'',district_code:''});Object.assign(c.complainant.filed.value,{phone:'',residence:''});
 assert.deepEqual(firDraftProblems(c),[]);
 const {text}=await readPdfText(await renderFirPdf('TEST',c));
 for(const wrong of ['Distance','Alias','Vehicle used','Suspected reason','Role / relationship','When present','District:','State / UT','Registered residence','Phone:','Not applicable'])assert.ok(!text.includes(wrong),wrong);
 c.accused=null;c.witnesses=null;assert.deepEqual(firDraftProblems(c),[]);
 const none=(await readPdfText(await renderFirPdf('TEST',c))).text;assert.ok(none.includes('Accused: None reported'));assert.ok(none.includes('Witnesses: None reported'));
 // The required ones, after the advocate's edits: name, station, a valid date and time, place, statement,
 // a complete legal section, names of listed people and the client's personal details. Never an identity document (Q114).
 const r=content();r.complainant.filed.value.personal_details.age=null;r.legal_sections[0].act='';r.statement_of_facts=' ';
 r.overrides={complainant_name:' ',police_station:'',incident_date:'31/02/2026',incident_time:'25:00',place:'',father_name:''};
 r.accused.items[0].identity={status:'known',name:''};r.witnesses.items[1].name='';
 const fields=firDraftProblems(r).map(p=>p.field);
 for(const f of ['Age','Legal section 1: act','Complainant name','Police station','Incident date','Incident time','Place of incident','Father’s name','Statement of facts','Accused 1: name','Witness 2: name'])assert.ok(fields.includes(f),f);
 assert.ok(!fields.includes('Identity document'),'no identity document is ever required');
 assert.ok(!fields.includes('Accused 2: name'),'an accused the client marked unknown needs no name');
 await assert.rejects(renderFirPdf('TEST',r),/Age must be answered by the client/);
 r.complainant.filed.value.personal_details.age={status:'unknown'};r.legal_sections[0].act='TEST Act';r.statement_of_facts='TEST facts';delete r.overrides;
 r.accused.items[0].identity={status:'known',name:'TEST Named'};r.witnesses.items[1].name='TEST Witness Two';
 assert.deepEqual(firDraftProblems(r),[]);await renderFirPdf('TEST',r);
});
test('Advocate edits to filed fields print instead of the filing, which stays on record; Other People Involved prints when present',async()=>{
 const intake=fixture.intake(),editable=fixture.editable(intake),id=randomUUID();editable.attachment_ids=[id];
 editable.overrides={police_station:'TEST Edited Station',district_state:'TEST Edited District, TEST Edited State',complainant_name:'TEST Edited Name',father_name:'TEST Edited Father',age_gender:'38 Years / Woman',occupation:'TEST Edited Occupation',address:'TEST Edited Address 9',residence:'TEST Edited Residence 7',phone_email:'',incident_date:'11/11/2026',incident_time:'10:15 AM',place:'TEST Edited Place'};
 editable.others_involved='  TEST two unidentified associates  ';
 const c=assembleFirDraft(randomUUID(),intake,'a'.repeat(64),'2026-11-10T12:00:00.000Z',editable,[{document_id:id,filename:'TEST-evidence.pdf',mime_type:'application/pdf'}]);
 assert.equal(c.complainant.filed.value.name,'TEST Complainant Rao','the client filing is kept as filed');assert.equal(c.police_filing.jurisdiction.value.policeStation,'TEST Colaba Station');
 assert.equal(c.others_involved,'TEST two unidentified associates');assert.deepEqual(firEditableContent(c).overrides,editable.overrides);assert.equal(firEditableContent(c).others_involved,'TEST two unidentified associates');
 assert.deepEqual(firDraftProblems(c),[]);
 const {text}=await readPdfText(await renderFirPdf('FIR_DRAFT-2026-TEST',c));
 for(const value of ['prepared for submission at TEST Edited Station','Police station: TEST Edited Station','District & State: TEST Edited District, TEST Edited State','Full legal name: TEST Edited Name','TEST Edited Father','Age & Gender: 38 Years / Woman','TEST Edited Occupation','TEST Edited Address 9','TEST Edited Residence 7','Date of incident: 11/11/2026','Time of incident: 10:15 AM','Place of incident: TEST Edited Place','Other people involved: TEST two unidentified associates'])assert.ok(text.includes(value),value);
 for(const filed of ['TEST Colaba Station','Maharashtra','TEST Complainant Rao','TEST Father Rao','TEST Teacher','TEST Present Street 22','TEST Registered Street 11','2025550100','fir-test@example.invalid','2026-11-10','09:30','TEST Harbour Road','Phone & Email'])assert.ok(!text.includes(filed),filed);
 // An unchanged draft carries neither key.
 const plain=content();assert.equal('overrides' in plain,false);assert.equal('others_involved' in plain,false);
});
test('Statement of Facts is seeded as a letter around the client’s own words, leaving out parts with no value',()=>{
 const i=fixture.intake();
 assert.equal(seedFirDraft(i,randomUUID).statement_of_facts,'To,\nThe Station House Officer,\nTEST Colaba Station, Mumbai.\n\nRespected Sir,\nI, TEST Complainant Rao, aged 37 years, state that TEST ONLY original client narrative.\n\nTEST original additional information.');
 i.jurisdiction.district='';i.people[0].personal_details.age={status:'unknown'};i.incident.additional='';
 assert.equal(firLetterStatement(i),'To,\nThe Station House Officer,\nTEST Colaba Station.\n\nRespected Sir,\nI, TEST Complainant Rao, state that TEST ONLY original client narrative.');
 i.jurisdiction.policeStation='';i.incident.description='';
 assert.equal(firLetterStatement(i),'To,\nThe Station House Officer,\n\nRespected Sir,');
});
test('FIR PDF wraps long content and Hindi across pages without clipping or changing logical text',async()=>{
 const c=content();c.statement_of_facts=Array.from({length:45},(_,i)=>`Paragraph ${i+1}: हिंदी कथन और घटना का विवरण। TEST facts retained in the generated document.`).join('\n');
 c.accused.items[0].identity.name='TEST '+('VeryLongUnbrokenName'.repeat(20));
 const {text,pages}=await readPdfText(await renderFirPdf('FIR_DRAFT-2026-TEST',c));assert.ok(pages.length>=3);
 assert.ok(text.includes('हिंदी कथन और घटना का विवरण।'));assert.ok(text.includes('Paragraph 45:'));
 for(const page of pages)for(const run of page.runs){assert.ok(run.x>=43&&run.x+run.width<=552,`horizontal overflow ${run.text}`);assert.ok(run.y>=22&&run.y<=807,`vertical overflow ${run.text}`);}
 c.statement_of_facts='Unsupported 漢字';await assert.rejects(renderFirPdf('TEST',c),/Statement of Facts: unsupported characters/);
});
test('FIR save accepts only editable content, explicit base token and source hash',()=>{
 const input={base_draft_id:null,filing_hash:'a'.repeat(64),content:fixture.editable()};assert.equal(FirDraftSaveSchema.safeParse(input).success,true);
 for(const v of [{...input,base_draft_id:undefined},{...input,filing_hash:undefined},{...input,content:{...input.content,complainant:{name:'invented'}}},{...input,content:{...input.content,attachment_ids:['bad-id']}}])assert.equal(FirDraftSaveSchema.safeParse(v).success,false);
 assert.equal(FirDraftSaveSchema.safeParse({...input,content:{...input.content,others_involved:'TEST',overrides:{place:'TEST'}}}).success,true);
 assert.equal(FirDraftSaveSchema.safeParse({...input,content:{...input.content,overrides:{fir_number:'1'}}}).success,false,'police-only boxes are not advocate fields');
 assert.equal(FirDraftSaveSchema.safeParse({...input,autosave:true}).success,false,'an auto-save names the version it updates');
 assert.equal(FirDraftSaveSchema.safeParse({...input,autosave:true,base_saved_at:'2026-11-10T12:00:00.000Z'}).success,true);
});
