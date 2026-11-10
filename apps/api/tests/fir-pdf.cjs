const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {assembleFirDraft,firDraftProblems,FirDraftSaveSchema}=require('@legalitt/shared');
const {renderFirPdf}=require('../dist/src/documents/fir-pdf');
const {readPdfText}=require('./helpers/pdf-text.cjs'),fixture=require('./helpers/fir.cjs');
function content(){const intake=fixture.intake(),editable=fixture.editable(intake);const id=randomUUID();editable.identity_document_id=id;editable.attachment_ids=[id];return assembleFirDraft(randomUUID(),intake,'a'.repeat(64),'2026-11-10T12:00:00.000Z',editable,[{document_id:id,filename:'Identity-proof.pdf',mime_type:'application/pdf'}]);}
test('FIR PDF prints all eight structured sections, repeatable records and edited values; ID evidence is referenced without an ID number',async()=>{
 const c=content();c.attachments=[{document_id:randomUUID(),filename:'TEST second upload chosen first.pdf',mime_type:'application/pdf'},{document_id:randomUUID(),filename:'TEST first upload chosen second.png',mime_type:'image/png'}];
 c.complainant.identity_document_id=c.attachments[0].document_id;assert.deepEqual(firDraftProblems(c),[]);const {text,pages}=await readPdfText(await renderFirPdf('FIR_DRAFT-2026-TEST',c));
 for(const value of ['Police Station & Filing Time','Complainant / Reporter Info','When and Where It Happened','Accused Person(s)','Applicable Legal Sections','Statement of Facts','Witnesses','Attached Documents','Maharashtra','Mumbai','TEST Colaba Station','TEST Father Rao','37','Woman','TEST Teacher','TEST Present Street 22','TEST Registered Street 11','TEST Complainant Rao','2025550100','fir-test@example.invalid','theft','2026-11-10','09:30','TEST Harbour Road','TEST 2 km north','TEST Known Suspect','TEST alias','TEST jacket','TEST accused 1 vehicle_used','TEST accused 1 suspected_motive','Unknown suspect','TEST unknown suspect blue coat','TEST accused 2 alias','TEST accused 2 suspected_motive','Unknown','Not applicable','TEST Act (synthetic)','TEST 123','TEST manually chosen provision','TEST ONLY advocate edited narrative.','TEST Witness One','TEST Witness Two','2025550102','2025550103','TEST passerby','TEST shopkeeper','TEST at start','TEST at end','TEST first note','TEST second note','For completion at the police station','FIR number','Date / time received at the station','Receiving officer’s signature'])assert.ok(text.includes(value),value);
 assert.ok(text.indexOf('second upload chosen first.pdf')<text.indexOf('first upload chosen second.png'));
 for(const wrong of ['Madhya Pradesh','LEGAL NOTICE','S/o Shri','Mr.','criminal complaint / FIR','disclaimer','________','original client narrative'])assert.ok(!text.includes(wrong),wrong);
 assert.ok(text.includes('Identity document:'));assert.ok(pages.length>=2);
});
test('FIR PDF refuses unanswered client facts and incomplete advocate answers, but accepts explicit answers with selected ID evidence',async()=>{
 const c=content();c.complainant.filed.value.personal_details.age=null;c.incident.distance_and_direction_from_station=null;c.legal_sections[0].act='';
 const problems=firDraftProblems(c);assert.ok(problems.some(p=>p.field==='Age'));assert.ok(problems.some(p=>p.field==='Distance/direction from station'));assert.ok(problems.some(p=>p.field==='Legal section 1: act'));
 await assert.rejects(renderFirPdf('TEST',c),/Age must be answered by the client/);
 c.complainant.filed.value.personal_details.age={status:'unknown'};c.incident.distance_and_direction_from_station={status:'not_applicable'};c.legal_sections[0].act='TEST Act';
 assert.deepEqual(firDraftProblems(c),[]);await renderFirPdf('TEST',c);
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
});
