const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PDFDocument}=require('pdf-lib');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {CaseRepository}=require('../dist/src/cases/case-repository');
const {ServiceReportsService}=require('../dist/src/service-reports/service-reports.service');
const {ReportWorkflowService}=require('../dist/src/service-reports/report-workflow.service');
const {DocumentService}=require('../dist/src/documents/document.service');
const {stagingKey}=require('../dist/src/documents/document-storage');
const {PaymentsService}=require('../dist/src/payments/payments.service');
const {AdminCasesRepository}=require('../dist/src/admin-cases/admin-cases.repository');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');
const {seedConfirmedPricing,seedProvisionalPricing}=require('../dist/prisma/seed-pricing');
const {defaultAffidavitParagraphs,INDIA_JURISDICTIONS,isServiceOffered}=require('@legalitt/shared');
// Court Marriage is hidden (Q79/Q113): new cases are refused, so its dormant workflow
// is still covered on directly seeded drafts (helpers/dormant-case.cjs).
const {seedDormantCase,asIfOffered}=require('./helpers/dormant-case.cjs');
const jurisdiction=(stateName,districtName)=>{const s=INDIA_JURISDICTIONS.find(s=>s.name===stateName),d=s.districts.find(d=>d.name===districtName);return {state_code:s.code,state:s.name,district_code:d.code,district:d.name};};
const signature=[[{x:.1,y:.1},{x:.4,y:.8},{x:.8,y:.2}]];

const intakes={
  property_search:{tier:'ordinary',details:{contact:{fullName:'TEST Applicant',mobile:'+91 90000 00000',email:'test@legalitt.invalid'},
    jurisdiction:jurisdiction('Madhya Pradesh','Indore'),property_address:'Plot 42, Scheme 78, Indore',property_type:'residential',
    survey_number:'Sy. 104/2',search_duration:'30_years',purpose:'buying',requirement:'Thirty-year title search before purchase.'}},
  document_forensic:{tier:'urgent',details:{document_type:'agreement_contract',analysis_type:'signature',questioned_description:'Signature clause',no_reference_sample:false,instructions:'Compare page 3 signature.'}},
  court_marriage:{tier:null,details:{contact:{mobile:'+91 90000 00001'},party_one:{full_name:'TEST One',date_of_birth:'1995-04-02',address:'Pune',marital_status:'never_married'},
    party_two:{full_name:'TEST Two',date_of_birth:'1996-05-03',address:'Pune',marital_status:'never_married'},jurisdiction:jurisdiction('Maharashtra','Pune')}},
};
const totals={property_search:'368603',document_forensic:'884853',court_marriage:'884853'};

test('Report services: provisional pricing, paid intake, assignment, advocate report, admin gate, private release',
 {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
  const users=['client','client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST REPORT '+role}));
  const [client,other,advocate,otherAdvocate,admin]=users,ids=[];
  const inbox=new InAppNotifications(new SimulatedNotifications()),state=new CaseStateMachine(prisma,inbox),repo=new CaseRepository(prisma);
  const objects=new Map(),originalFetch=global.fetch;
  const storage={upload:async key=>({url:'https://report-storage.invalid',fields:{key:stagingKey(key)}}),
    head:async key=>objects.has(key)?{size:objects.get(key).length,mime:'application/pdf'}:null,
    read:async key=>objects.get(key),promote:async key=>objects.set(key,objects.get(stagingKey(key))),
    remove:async key=>objects.delete(key),discard:async key=>objects.delete(key),download:async key=>'https://report-storage.invalid/'+key};
  global.fetch=async(url,options)=>url==='https://report-storage.invalid'?(objects.set(options.body.get('key'),new Uint8Array(await options.body.get('file').arrayBuffer())),new Response(null,{status:204})):originalFetch(url,options);
  const docs=new DocumentService(prisma,storage,{inspect:async bytes=>({mime:'application/pdf',pageCount:(await PDFDocument.load(bytes)).getPageCount()})});
  const reports=new ServiceReportsService(prisma,state,docs,inbox),queue=new AdminCasesRepository(prisma);
  const workflows=new ReportWorkflowService(prisma,inbox);
  const policyIds=[];
  const workflowAction=async(actor,id,action,body={})=>workflows.action(actor,id,action,{revision:(await workflows.view(actor,id)).revision,...body});
  const pay=new PaymentsService(prisma,state,{capture:async()=>({paymentId:randomUUID(),simulated:true,source:'simulated'})},inbox);
  const pdf=async()=>{const d=await PDFDocument.create();d.addPage();return d.save();};
  const upload=async(actor,caseId,kind,filename='TEST.pdf')=>{const ticket=await docs.presign(actor,{case_id:caseId,kind,filename,mime:'application/pdf'});
    objects.set(stagingKey(ticket.document.s3_key),await pdf());return docs.complete(actor,ticket.document.id);};
  const draft=async code=>{const c=isServiceOffered(code)?await state.create(client,{service_code:code}):await seedDormantCase(db,client,code);ids.push(c.id);return c;};
  const paid=async(code)=>{
    const c=await draft(code);
    if(code==='property_search'||code==='document_forensic')assert.match(c.reference,code==='property_search'?/^PSR-\d{4}-\d{5,}$/:/^DF-\d{4}-\d{5,}$/,'Current flow reference format; legacy references stay untouched');
    await reports.intake(client,c.id,intakes[code]);
    if(code!=='property_search')await assert.rejects(state.submitForPayment(client,c.id),{status:400},'required documents block submission');
    if(code==='document_forensic'){await upload(client,c.id,'questioned_document','Questioned.pdf');await upload(client,c.id,'reference_document','Reference.pdf');}
    if(code==='court_marriage'){await upload(client,c.id,'id_proof');await upload(client,c.id,'id_proof');}
    if(code==='property_search')await upload(client,c.id,'property_document','Sale_Deed.pdf');
    // A hidden service's dormant workflow is exercised as if re-enabled (its live refusal is in hidden-services.cjs).
    if(isServiceOffered(code))await state.submitForPayment(client,c.id);else await asIfOffered(code,()=>state.submitForPayment(client,c.id));
    const q=await pay.quote(client,{case_id:c.id});assert.equal(q.status,'ready');assert.equal(q.breakdown.total_paise,totals[code]);
    await pay.intent(client,{case_id:c.id,purpose:'service_fee',quote_id:q.id},randomUUID());
    if(code==='property_search')await workflowAction(admin,c.id,'verify');
    await state.assign(admin,c.id,{advocate_id:advocate.id});assert.equal(require('@legalitt/shared').REPORT_INTAKE_SCHEMAS[code].safeParse((await repo.read(advocate,c.id)).details).success,true,'redacted intake retains the service schema');await state.transition(advocate,c.id,'advocate_accepted');
    if(code==='document_forensic')await workflowAction(advocate,c.id,'file-checklist',{files_open:true,pages_complete:true,legible:true});
    return c;
  };
  try{
    await db.user.createMany({data:users});await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved',city:'Indore',bar_council_number:'MP/1429/2014'}});
    await seedConfirmedPricing(db);await seedProvisionalPricing(db);await seedProvisionalPricing(db);
    await t.test('provisional tariffs are unconfirmed and price as base + 25% platform + 18% GST',async()=>{
      const p=await reports.pricing('property_search');
      assert.equal(p.confirmed,false);assert.deepEqual(p.tiers.map(t=>[t.tier,t.total_paise]),[['ordinary','368603'],['urgent','589853']]);
      // Hidden service: no public price list. Its seeded tariff still prices dormant cases (paid('court_marriage')).
      await assert.rejects(reports.pricing('court_marriage'),{status:404});
      await assert.rejects(state.create(client,{service_code:'court_marriage'}),{status:400,message:"Court Marriage isn't offered right now."});
      await assert.rejects(reports.pricing('legal_notice'),{status:404});
    });
    await t.test('intake rules: client-only, draft-only, validated jurisdiction, no foreign kinds',async()=>{
      const c=await state.create(client,{service_code:'property_search'});ids.push(c.id);
      await assert.rejects(reports.intake(advocate,c.id,intakes.property_search),{status:403});
      await assert.rejects(reports.intake(other,c.id,intakes.property_search),{status:404});
      await assert.rejects(reports.intake(client,c.id,{details:{jurisdiction:{state_code:'23',state:'Kerala'}}}),{status:400});
      await assert.rejects(reports.intake(client,c.id,{tier:'express',details:{}}),{status:400});
      await assert.rejects(docs.presign(client,{case_id:c.id,kind:'questioned_document',filename:'x.pdf',mime:'application/pdf'}),{status:409});
      const saved=await reports.intake(client,c.id,{details:{contact:{fullName:'Partial'}}});assert.equal(saved.status,'draft');
      const pending=await docs.presign(client,{case_id:c.id,kind:'property_document',filename:'Interrupted.pdf',mime:'application/pdf'});
      assert.ok((await repo.read(client,c.id)).documents.some(d=>d.id===pending.document.id&&d.status==='pending'),'owner can recover an interrupted upload');
      assert.ok(!(await repo.read(admin,c.id)).documents.some(d=>d.id===pending.document.id),'unfinished content is not exposed to other members');
      await docs.delete(client,pending.document.id);
      assert.ok(!(await repo.read(client,c.id)).documents.some(d=>d.id===pending.document.id),'removed upload no longer blocks recovery');
      const minor=await draft('court_marriage');
      await reports.intake(client,minor.id,{details:{...intakes.court_marriage.details,party_two:{...intakes.court_marriage.details.party_two,date_of_birth:new Date().toISOString().slice(0,10)}}});
      await upload(client,minor.id,'id_proof');await upload(client,minor.id,'id_proof');
      await assert.rejects(asIfOffered('court_marriage',()=>state.submitForPayment(client,minor.id)),e=>e.status===400&&/at least 18/.test(e.message));
    });
    await t.test('Property Search: advocate uploads the PDF and sends it straight to the client (design 211)',async()=>{
      const c=await paid('property_search');
      const view=await repo.read(advocate,c.id);assert.equal(view.report.stage,'not_started');assert.equal(view.client_name,'TEST REPORT client');assert.equal(view.advocate_payout.net_paise,'249900');
      await assert.rejects(upload(client,c.id,'property_document'),{status:409},'client documents freeze after payment');
      const report=await upload(advocate,c.id,'service_report','Property_Search_Report.pdf');
      assert.equal((await repo.read(client,c.id)).documents.some(d=>d.id===report.id),false,'unsent report invisible');
      await assert.rejects(docs.url(client,report.id),{status:404});
      await assert.rejects(reports.save(advocate,c.id,{base_draft_id:randomUUID(),report_document_id:report.id,note:''}),{status:409});
      const research={owner_details:'TEST owner research',documents_checked:[{description:'TEST checked record',reference:'TEST record reference'}],search_date:'2026-11-11',search_period:'1996–2026',records_inspected:'TEST inspected records',registry_office:'TEST registry office',search_notes:'TEST search notes',ownership_history:'TEST ownership history',findings:'TEST search findings',conclusion:'TEST final opinion'};
      const unsigned=await reports.save(advocate,c.id,{base_draft_id:null,production:'property',report:research,note:''});
      await assert.rejects(reports.preview(advocate,c.id,unsigned.id),{status:400},'personal record check is required before generating a PDF');
      await assert.rejects(reports.submit(advocate,c.id,unsigned.id),{status:400},'sign-off is required before direct delivery');
      const working=await reports.save(advocate,c.id,{base_draft_id:unsigned.id,production:'property',report:{...research,personally_checked:true},note:''});
      const preview=await reports.preview(advocate,c.id,working.id),extracted=await require('./helpers/pdf-text.cjs').readPdfText(Buffer.from(preview.files[0].pdf_base64,'base64'));
      for(const text of ['TEST owner research','TEST checked record','TEST record reference','TEST inspected records','TEST registry office','TEST search notes','TEST ownership history','TEST search findings','TEST final opinion','Plot 42, Scheme 78, Indore'])assert.ok(extracted.text.includes(text),text+' reaches PDF');
      const draft=await reports.save(advocate,c.id,{base_draft_id:working.id,report_document_id:report.id,note:'Title clear for 30 years.'});
      assert.equal((await repo.read(advocate,c.id)).report.property_draft.id,working.id,'research survives final-upload versions');
      await assert.rejects(reports.approve(admin,c.id,draft.id),{status:409},'no admin gate for property search');
      const done=await reports.submit(advocate,c.id,draft.id);assert.equal(done.status,'completed');
      const seen=await repo.read(client,c.id);assert.equal(seen.report.stage,'released');assert.equal(seen.report.released.note,'Title clear for 30 years.');
      assert.ok(seen.documents.some(d=>d.id===report.id));assert.ok((await docs.url(client,report.id)).url);
      assert.equal(seen.report.latest_draft,null,'clients never get drafts');
      await assert.rejects(docs.delete(advocate,report.id),{status:409});
      assert.ok(await db.notification.findFirst({where:{user_id:client.id,case_id:c.id,kind:'report_ready'}}));
    });
    await t.test('Document Forensic: rendered report + affidavit, admin changes, resubmit, approve, release',async()=>{
      const c=await paid('document_forensic');
      const affidavit={deponent_name:'TEST Advocate',enrolment_number:'MP/1429/2014',age:38,office_address:'High Court Precinct, Indore',
        paragraphs:defaultAffidavitParagraphs({reference:c.reference,client:'TEST REPORT client',document:'Questioned.pdf'})};
      const report={what_checked:'Signature on page 3.',how_checked:'Visual comparison of supplied scans.',findings:'Hesitation marks.',final_result:'Does not match.',overall_status:'likely_not_genuine',risk_level:'high',authenticity:'Visible differences in the supplied signature copies.'};
      const unsigned=await reports.save(advocate,c.id,{base_draft_id:null,report,affidavit,signed:false});
      assert.equal((await db.case.findUnique({where:{id:c.id}})).status,'in_progress');
      await assert.rejects(reports.preview(advocate,c.id,unsigned.id),e=>e.status===400&&/Sign/.test(e.message));
      const reportPreview=await reports.preview(advocate,c.id,unsigned.id,true);assert.equal(reportPreview.files.length,1,'report can be previewed before signing the affidavit');
      const v2=await reports.save(advocate,c.id,{base_draft_id:unsigned.id,report,affidavit,signature,signed:true});
      const preview=await reports.preview(advocate,c.id,v2.id);assert.equal(preview.files.length,2);
      for(const f of preview.files)assert.ok(Buffer.from(f.pdf_base64,'base64').subarray(0,4).equals(Buffer.from('%PDF')));
      assert.equal(await db.document.count({where:{case_id:c.id,kind:{in:['forensic_report','forensic_affidavit']}}}),0,'preview stores nothing');
      const race=await Promise.allSettled([reports.submit(advocate,c.id,v2.id),reports.submit(advocate,c.id,v2.id)]);
      assert.equal(race.filter(r=>r.status==='fulfilled').length,1);
      const waiting=await db.case.findUnique({where:{id:c.id}});assert.equal(waiting.sub_status,'awaiting_admin_approval');
      assert.equal(await db.document.count({where:{case_id:c.id,kind:{in:['forensic_report','forensic_affidavit']},status:'uploaded'}}),2,'losing race leaves no extra files');
      await assert.rejects(reports.save(advocate,c.id,{base_draft_id:v2.id,report,affidavit,signed:true}),{status:409},'frozen while waiting');
      const page=await queue.list(admin,{service:'document_forensic',queue:'approval'});assert.ok(page.items.some(i=>i.id===c.id&&i.bucket==='open'));
      const clientView=await repo.read(client,c.id);assert.equal(clientView.report.stage,'preparing');assert.equal(clientView.report.submission,null);
      for(const d of await db.document.findMany({where:{case_id:c.id,kind:{in:['forensic_report','forensic_affidavit']}}}))await assert.rejects(docs.url(client,d.id),{status:404});
      await assert.rejects(reports.requestChanges(advocate,c.id,v2.id,{items:[{title:'x'}]}),{status:403});
      await reports.requestChanges(admin,c.id,v2.id,{items:[{title:'Add more details to the findings',detail:'Seal ink under UV.'}]});
      await assert.rejects(reports.submit(advocate,c.id,v2.id),{status:409},'an old returned submission cannot be requeued');
      for(const clientData of [await repo.read(client,c.id),await repo.events(client,c.id,{})])assert.doesNotMatch(JSON.stringify(clientData,(_,v)=>typeof v==='bigint'?v.toString():v),/Add more details|Seal ink under UV|service_report_saved|service_report_changes_requested/,'private review data stays internal on both case and event APIs');
      await assert.rejects(docs.presign(advocate,{case_id:c.id,kind:'forensic_report',filename:'forged.pdf',mime:'application/pdf'}),{status:409},'public uploads cannot impersonate server-generated reports');
      const adv=await repo.read(advocate,c.id);assert.equal(adv.report.stage,'changes_requested');assert.equal(adv.report.changes.items[0].title,'Add more details to the findings');
      await assert.rejects(reports.approve(admin,c.id,v2.id),{status:409});
      const v3=await reports.save(advocate,c.id,{base_draft_id:v2.id,report:{...report,findings:'Hesitation marks; seal ink differs under UV.'},affidavit,signature,signed:true});
      await reports.submit(advocate,c.id,v3.id);
      await assert.rejects(reports.approve(admin,c.id,v2.id),{status:409},'stale version cannot be approved');
      await workflowAction(admin,c.id,'review-checklist',{draft_id:v3.id,format:true,signature:true,conclusion:true,question:true});
      const done=await reports.approve(admin,c.id,v3.id);assert.equal(done.status,'completed');
      assert.equal((await reports.approve(admin,c.id,v3.id)).status,'completed','idempotent');
      const seen=await repo.read(client,c.id);assert.equal(seen.report.released.document_ids.length,2);
      for(const id of seen.report.released.document_ids)assert.ok((await docs.url(client,id)).url);
      const events=(await db.caseEvent.findMany({where:{case_id:c.id},orderBy:{id:'asc'}})).map(e=>e.type);
      for(const type of ['service_report_submitted','service_report_changes_requested','service_report_approved','service_report_released'])assert.ok(events.includes(type),type);
      assert.ok(await db.adminAction.findFirst({where:{subject_id:c.id,action:'approve_service_report'}}));
    });
    await t.test('Court Marriage: uploaded application goes through admin approval',async()=>{
      const c=await paid('court_marriage');
      await assert.rejects(reports.save(otherAdvocate,c.id,{base_draft_id:null,report_document_id:randomUUID(),note:''}),{status:404});
      const file=await upload(advocate,c.id,'service_report','Application.pdf');
      const draft=await reports.save(advocate,c.id,{base_draft_id:null,report_document_id:file.id,note:''});
      const sent=await reports.submit(advocate,c.id,draft.id);assert.equal(sent.sub_status,'awaiting_admin_approval');
      await assert.rejects(reports.approve(client,c.id,draft.id),{status:403});
      await reports.approve(admin,c.id,draft.id);
      assert.ok((await docs.url(client,file.id)).url);
      await assert.rejects(repo.read(other,c.id),{status:404});
    });
    await t.test('Workflow actions isolate other clients and advocates, pause deadlines and release the editor PDF directly',async()=>{
      const c=await paid('property_search');
      const calls=[['verify',{}],['request-information',{kind:'details',prompt:'Confirm owner spelling'}],['reply',{task_id:randomUUID(),reply:'Response'}],['resolve',{task_id:randomUUID()}],['file-checklist',{files_open:true,pages_complete:true,legible:true}],['begin-report',{}],['review-checklist',{draft_id:randomUUID(),format:true,signature:true,conclusion:true,question:true}],['reopen-chat',{reason:'Follow-up'}]];
      for(const outsider of [other,otherAdvocate]){
        await assert.rejects(workflows.view(outsider,c.id),{status:404});
        for(const [action,body]of calls)await assert.rejects(workflows.action(outsider,c.id,action,{revision:0,...body}),{status:404},action+' isolation');
        await assert.rejects(workflows.settings(outsider,'property_search'),{status:403});
        await assert.rejects(workflows.settings(outsider,'property_search',{}),{status:403});
      }
      const before=await workflows.view(admin,c.id);
      await workflowAction(admin,c.id,'request-information',{kind:'details',prompt:'Confirm the full property address'});
      const requested=await workflows.view(client,c.id),task=requested.tasks.at(-1);assert.ok(requested.paused_at);assert.equal(requested.chat.writable,true);
      await assert.rejects(workflows.action(client,c.id,'reply',{revision:before.revision,task_id:task.id,reply:'New address'}),{status:409},'stale response refused');
      await workflowAction(client,c.id,'reply',{task_id:task.id,reply:'Confirmed street number',details:{...intakes.property_search.details,property_address:'Plot 42, updated street, Indore'}});
      await workflowAction(admin,c.id,'resolve',{task_id:task.id});
      const resumed=await workflows.view(client,c.id);assert.equal(resumed.paused_at,null);assert.ok(Date.parse(resumed.deadline_at)>=Date.parse(before.deadline_at));
      assert.equal((await db.reportWorkflow.findUnique({where:{case_id:c.id}})).data.original_details.property_address,intakes.property_search.details.property_address,'original filing retained');
      await workflowAction(advocate,c.id,'request-information',{kind:'document',document_kind:'property_document',prompt:'Please supply the title deed'});
      const documentTask=(await workflows.view(client,c.id)).tasks.at(-1);
      await assert.rejects(upload(client,c.id,'reference_document'),{status:409},'request does not authorize another document kind');
      const extra=await upload(client,c.id,'property_document');
      await workflowAction(client,c.id,'reply',{task_id:documentTask.id,document_ids:[extra.id]});await workflowAction(advocate,c.id,'resolve',{task_id:documentTask.id});
      await assert.rejects(upload(client,c.id,'property_document'),{status:409},'upload closes when the information request is resolved');
      const research={client_details:'Client details entered and verified',property_details:'Property description edited by advocate',total_area:'120 square metres',owner_details:'Owner research',documents_checked:[{description:'Sale deed',reference:'R42',office:'Registry office A',checked:true}],search_date:'2026-11-13',search_period:'1996–2026',records_inspected:'Registry index',registry_office:'Indore registry',search_notes:'No extra records found',ownership_history:'Recorded chain of title',findings:'No encumbrance found in inspected records',findings_detail:{ownership:'Recorded owner',charges:'None in inspected index',court_case:'Not independently searched',property_tax:'Receipt supplied'},conclusion:'Limited to records inspected',personally_checked:true};
      const d=await reports.save(advocate,c.id,{production:'property',base_draft_id:null,report:research,note:'Research complete'});
      const preview=await reports.preview(advocate,c.id,d.id),text=(await require('./helpers/pdf-text.cjs').readPdfText(Buffer.from(preview.files[0].pdf_base64,'base64'))).text;
      for(const phrase of ['Client details entered and verified','Property description edited by advocate','120 square metres','Registry office A','Not independently searched','Receipt supplied'])assert.ok(text.includes(phrase),phrase+' reaches PDF');
      await reports.submit(advocate,c.id,d.id);const released=(await repo.read(client,c.id)).report.released;assert.equal(released.document_ids.length,1);assert.ok((await docs.url(client,released.document_ids[0])).url);
      await assert.rejects(reports.submit(advocate,c.id,d.id),{status:409},'no double release');
      const {NoticeMessages}=require('../dist/src/cases/notice-messages');const messages=new NoticeMessages(prisma),thread=await messages.thread(client,c.id);
      await messages.send(client,thread.id,{body:'Thank you'});
      await db.case.update({where:{id:c.id},data:{completed_at:new Date(Date.now()-8*86400000)}});
      await assert.rejects(messages.send(client,thread.id,{body:'Expired'}),{status:409});
      await workflowAction(admin,c.id,'reopen-chat',{reason:'Client follow-up on registry result'});await messages.send(client,thread.id,{body:'Reopened question'});
      const {WalletService}=require('../dist/src/wallet/wallet.service');const wallet=new WalletService(prisma,inbox);
      const earnedBefore=await wallet.wallet(advocate,{period:'all'}),completedBefore=(await db.case.findUnique({where:{id:c.id}})).completed_at;
      await workflowAction(advocate,c.id,'open-correction');
      await assert.rejects(reports.submit(advocate,c.id,d.id),{status:409},'correction must be a new version');
      const corrected=await reports.save(advocate,c.id,{production:'property',base_draft_id:d.id,report:{...research,conclusion:'Corrected opinion, still limited to inspected records'},note:'Corrected version'});
      await reports.submit(advocate,c.id,corrected.id);
      const earnedAfter=await wallet.wallet(advocate,{period:'all'});assert.equal(earnedAfter.earned_paise,earnedBefore.earned_paise);assert.equal(earnedAfter.entries.filter(e=>e.case_id===c.id).length,1);assert.equal((await db.case.findUnique({where:{id:c.id}})).completed_at.toISOString(),completedBefore.toISOString());
      for(const outsider of [other,otherAdvocate])await assert.rejects(workflows.wording(outsider,c.id,{base_draft_id:null,section:'findings',text:'Original'}),{status:404});
    });
    await t.test('overdue reassignment retains work, removes former access and requires fresh authorship',async()=>{
      const c=await paid('property_search');await db.advocateProfile.create({data:{user_id:otherAdvocate.id,verification:'approved',city:'Pune'}});
      const old=await reports.save(advocate,c.id,{base_draft_id:null,production:'property',report:{...require('@legalitt/shared').emptyPropertyReport(),personally_checked:true},note:''});
      await assert.rejects(workflowAction(admin,c.id,'reassign',{advocate_id:otherAdvocate.id,reason:'Capacity'}),{status:409},'not overdue');
      const w=await db.reportWorkflow.findUnique({where:{case_id:c.id}});await db.reportWorkflow.update({where:{case_id:c.id},data:{data:{...w.data,deadline_at:new Date(Date.now()-86400000).toISOString()}}});
      await workflowAction(admin,c.id,'reassign',{advocate_id:otherAdvocate.id,reason:'TEST overdue research'});
      await assert.rejects(repo.read(advocate,c.id),{status:404});await assert.rejects(workflows.view(advocate,c.id),{status:404});await assert.rejects(reports.preview(advocate,c.id,old.id),{status:404});
      const next=await repo.read(otherAdvocate,c.id);assert.equal(next.status,'assigned');assert.equal(next.report.property_draft.report.personally_checked,false);assert.equal((await db.draft.findUnique({where:{id:old.id}})).content.report.personally_checked,true,'old attestation stays in history');
      assert.equal((await db.caseAssignment.findMany({where:{case_id:c.id}})).length,2);assert.ok(await db.notification.findFirst({where:{user_id:advocate.id,case_id:c.id,title:'A new advocate has been assigned to your case'}}));
      await state.transition(otherAdvocate,c.id,'advocate_accepted');await reports.start(otherAdvocate,c.id);await assert.rejects(reports.preview(otherAdvocate,c.id,old.id),{status:409},'cannot reuse previous advocate submission');
    });
    await t.test('upload limits are versioned per service and enforced on storage completion',async()=>{
      const original=await draft('property_search'),pinned=await workflows.view(admin,original.id),prior=(await workflows.settings(admin,'property_search'))[0];
      const policy=await workflows.settings(admin,'property_search',{base_version:prior.version,config:{...prior.config,max_upload_bytes:1024}});policyIds.push(policy.id);
      assert.equal((await workflows.view(admin,original.id)).policy.max_upload_bytes,pinned.policy.max_upload_bytes,'existing case retains its policy');
      const newer=await draft('property_search'),ticket=await docs.presign(client,{case_id:newer.id,kind:'property_document',filename:'TEST-too-large.pdf',mime:'application/pdf'});assert.equal(ticket.upload.max_bytes,1024);objects.set(stagingKey(ticket.document.s3_key),new Uint8Array(2048));await assert.rejects(docs.complete(client,ticket.document.id),{status:400});
      const oldTicket=await docs.presign(client,{case_id:original.id,kind:'property_document',filename:'TEST-old-limit.pdf',mime:'application/pdf'});assert.equal(oldTicket.upload.max_bytes,pinned.policy.max_upload_bytes);
      await assert.rejects(workflows.settings(admin,'property_search',{base_version:prior.version,config:prior.config}),{status:409},'stale setting edits are refused');
    });
  }finally{
    global.fetch=originalFetch;
    for(const id of ids){
      const messageThreads=await db.messageThread.findMany({where:{case_id:id},select:{id:true}});await db.message.deleteMany({where:{thread_id:{in:messageThreads.map(t=>t.id)}}});
      await db.notification.deleteMany({where:{case_id:id}});await db.adminAction.deleteMany({where:{subject_id:id}});
      const drafts=await db.draft.findMany({where:{case_id:id},select:{id:true}});
      await db.draftReview.deleteMany({where:{draft_id:{in:drafts.map(d=>d.id)}}});
      await db.payment.deleteMany({where:{case_id:id}});await db.casePriceQuote.deleteMany({where:{case_id:id}});
      await db.draft.deleteMany({where:{case_id:id}});await db.document.deleteMany({where:{case_id:id}});
      await db.reportWorkflow.deleteMany({where:{case_id:id}});await db.caseAssignment.deleteMany({where:{case_id:id}});
      const threads=await db.messageThread.findMany({where:{case_id:id},select:{id:true}});await db.message.deleteMany({where:{thread_id:{in:threads.map(t=>t.id)}}});await db.messageThread.deleteMany({where:{case_id:id}});
      await db.caseEvent.deleteMany({where:{case_id:id}});await db.caseParty.deleteMany({where:{case_id:id}});await db.case.delete({where:{id}});
    }
    await db.adminAction.deleteMany({where:{subject_id:{in:policyIds}}});await db.reportWorkflowPolicy.deleteMany({where:{id:{in:policyIds}}});
    await db.notification.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});
    await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
    await db.$disconnect();
  }
});
