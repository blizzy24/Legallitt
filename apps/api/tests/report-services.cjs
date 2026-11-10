const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PDFDocument}=require('pdf-lib');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {CaseRepository}=require('../dist/src/cases/case-repository');
const {ServiceReportsService}=require('../dist/src/service-reports/service-reports.service');
const {DocumentService}=require('../dist/src/documents/document.service');
const {stagingKey}=require('../dist/src/documents/document-storage');
const {PaymentsService}=require('../dist/src/payments/payments.service');
const {AdminCasesRepository}=require('../dist/src/admin-cases/admin-cases.repository');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');
const {seedConfirmedPricing,seedProvisionalPricing}=require('../dist/prisma/seed-pricing');
const {defaultAffidavitParagraphs}=require('@legalitt/shared');

const intakes={
  property_search:{tier:'ordinary',details:{contact:{fullName:'TEST Applicant',mobile:'+91 90000 00000',email:'test@legalitt.invalid'},
    jurisdiction:{state_code:'23',state:'Madhya Pradesh',district:'Indore'},property_address:'Plot 42, Scheme 78, Indore',property_type:'residential',
    survey_number:'Sy. 104/2',search_duration:'30_years',requirement:'Thirty-year title search before purchase.'}},
  document_forensic:{tier:'urgent',details:{document_type:'agreement_contract',questioned_description:'Signature clause',no_reference_sample:false,instructions:'Compare page 3 signature.'}},
  court_marriage:{tier:null,details:{contact:{mobile:'+91 90000 00001'},party_one:{full_name:'TEST One',date_of_birth:'1995-04-02',address:'Pune',marital_status:'never_married'},
    party_two:{full_name:'TEST Two',date_of_birth:'1996-05-03',address:'Pune',marital_status:'never_married'},jurisdiction:{state:'Maharashtra',district:'Pune'}}},
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
  const pay=new PaymentsService(prisma,state,{capture:async()=>({paymentId:randomUUID(),simulated:true,source:'simulated'})},inbox);
  const pdf=async()=>{const d=await PDFDocument.create();d.addPage();return d.save();};
  const upload=async(actor,caseId,kind,filename='TEST.pdf')=>{const ticket=await docs.presign(actor,{case_id:caseId,kind,filename,mime:'application/pdf'});
    objects.set(stagingKey(ticket.document.s3_key),await pdf());return docs.complete(actor,ticket.document.id);};
  const paid=async(code)=>{
    const c=await state.create(client,{service_code:code});ids.push(c.id);
    await reports.intake(client,c.id,intakes[code]);
    if(code!=='property_search')await assert.rejects(state.submitForPayment(client,c.id),{status:400},'required documents block submission');
    if(code==='document_forensic'){await upload(client,c.id,'questioned_document','Questioned.pdf');await upload(client,c.id,'reference_document','Reference.pdf');}
    if(code==='court_marriage'){await upload(client,c.id,'id_proof');await upload(client,c.id,'id_proof');}
    if(code==='property_search')await upload(client,c.id,'property_document','Sale_Deed.pdf');
    await state.submitForPayment(client,c.id);
    const q=await pay.quote(client,{case_id:c.id});assert.equal(q.status,'ready');assert.equal(q.breakdown.total_paise,totals[code]);
    await pay.intent(client,{case_id:c.id,purpose:'service_fee',quote_id:q.id},randomUUID());
    await state.assign(admin,c.id,{advocate_id:advocate.id});await state.transition(advocate,c.id,'advocate_accepted');
    return c;
  };
  try{
    await db.user.createMany({data:users});await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved',city:'Indore',bar_council_number:'MP/1429/2014'}});
    await seedConfirmedPricing(db);await seedProvisionalPricing(db);await seedProvisionalPricing(db);
    await t.test('provisional tariffs are unconfirmed and price as base + 25% platform + 18% GST',async()=>{
      const p=await reports.pricing('property_search');
      assert.equal(p.confirmed,false);assert.deepEqual(p.tiers.map(t=>[t.tier,t.total_paise]),[['ordinary','368603'],['urgent','589853']]);
      assert.equal((await reports.pricing('court_marriage')).tiers[0].tier,null);
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
      const minor=await state.create(client,{service_code:'court_marriage'});ids.push(minor.id);
      await reports.intake(client,minor.id,{details:{...intakes.court_marriage.details,party_two:{...intakes.court_marriage.details.party_two,date_of_birth:new Date().toISOString().slice(0,10)}}});
      await upload(client,minor.id,'id_proof');await upload(client,minor.id,'id_proof');
      await assert.rejects(state.submitForPayment(client,minor.id),e=>e.status===400&&/at least 18/.test(e.message));
    });
    await t.test('Property Search: advocate uploads the PDF and sends it straight to the client (design 211)',async()=>{
      const c=await paid('property_search');
      const view=await repo.read(advocate,c.id);assert.equal(view.report.stage,'not_started');assert.equal(view.client_name,'TEST REPORT client');assert.equal(view.advocate_payout.net_paise,'249900');
      await assert.rejects(upload(client,c.id,'property_document'),{status:409},'client documents freeze after payment');
      const report=await upload(advocate,c.id,'service_report','Property_Search_Report.pdf');
      assert.equal((await repo.read(client,c.id)).documents.some(d=>d.id===report.id),false,'unsent report invisible');
      await assert.rejects(docs.url(client,report.id),{status:404});
      await assert.rejects(reports.save(advocate,c.id,{base_draft_id:randomUUID(),report_document_id:report.id,note:''}),{status:409});
      const draft=await reports.save(advocate,c.id,{base_draft_id:null,report_document_id:report.id,note:'Title clear for 30 years.'});
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
      const report={what_checked:'Signature on page 3.',how_checked:'10x optical comparison.',findings:'Hesitation marks.',final_result:'Does not match.'};
      const unsigned=await reports.save(advocate,c.id,{base_draft_id:null,report,affidavit,signed:false});
      assert.equal((await db.case.findUnique({where:{id:c.id}})).status,'in_progress');
      await assert.rejects(reports.preview(advocate,c.id,unsigned.id),e=>e.status===400&&/Sign/.test(e.message));
      const v2=await reports.save(advocate,c.id,{base_draft_id:unsigned.id,report,affidavit,signed:true});
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
      const adv=await repo.read(advocate,c.id);assert.equal(adv.report.stage,'changes_requested');assert.equal(adv.report.changes.items[0].title,'Add more details to the findings');
      await assert.rejects(reports.approve(admin,c.id,v2.id),{status:409});
      const v3=await reports.save(advocate,c.id,{base_draft_id:v2.id,report:{...report,findings:'Hesitation marks; seal ink differs under UV.'},affidavit,signed:true});
      await reports.submit(advocate,c.id,v3.id);
      await assert.rejects(reports.approve(admin,c.id,v2.id),{status:409},'stale version cannot be approved');
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
  }finally{
    global.fetch=originalFetch;
    for(const id of ids){
      await db.notification.deleteMany({where:{case_id:id}});await db.adminAction.deleteMany({where:{subject_id:id}});
      const drafts=await db.draft.findMany({where:{case_id:id},select:{id:true}});
      await db.draftReview.deleteMany({where:{draft_id:{in:drafts.map(d=>d.id)}}});
      await db.payment.deleteMany({where:{case_id:id}});await db.casePriceQuote.deleteMany({where:{case_id:id}});
      await db.draft.deleteMany({where:{case_id:id}});await db.document.deleteMany({where:{case_id:id}});
      await db.caseEvent.deleteMany({where:{case_id:id}});await db.caseParty.deleteMany({where:{case_id:id}});await db.case.delete({where:{id}});
    }
    await db.notification.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});
    await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
    await db.$disconnect();
  }
});
