const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PDFDocument}=require('pdf-lib');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {CaseRepository}=require('../dist/src/cases/case-repository');
const {FirAdminService}=require('../dist/src/cases/fir-admin.service');
const {FirService}=require('../dist/src/cases/fir.service');
const {DocumentService}=require('../dist/src/documents/document.service');
const {stagingKey}=require('../dist/src/documents/document-storage');
const {PaymentsService}=require('../dist/src/payments/payments.service');
const {AdminCasesRepository}=require('../dist/src/admin-cases/admin-cases.repository');
const {AdminCaseDetailRepository}=require('../dist/src/admin-cases/admin-case-detail');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');
const {seedConfirmedPricing}=require('../dist/prisma/seed-pricing');
const {waitingDuration}=require('@legalitt/shared');

test('FIR: paid intake, advocate version freeze, admin-only approval, oldest-first stalled queue, private PDF and atomic release',
 {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
  const users=['client','client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST FIR '+role}));
  const [client,other,advocate,otherAdvocate,admin]=users,ids=[];
  const inbox=new InAppNotifications(new SimulatedNotifications()),state=new CaseStateMachine(prisma,inbox),repo=new CaseRepository(prisma);
  const objects=new Map(),originalFetch=global.fetch;
  const storage={upload:async key=>({url:'https://fir-storage.invalid',fields:{key:stagingKey(key)}}),
    head:async key=>objects.has(key)?{size:objects.get(key).length,mime:'application/pdf'}:null,
    read:async key=>objects.get(key),promote:async key=>objects.set(key,objects.get(stagingKey(key))),
    remove:async key=>objects.delete(key),discard:async key=>objects.delete(key),download:async key=>'https://fir-storage.invalid/'+key};
  global.fetch=async(url,options)=>url==='https://fir-storage.invalid'?(objects.set(options.body.get('key'),new Uint8Array(await options.body.get('file').arrayBuffer())),new Response(null,{status:204})):originalFetch(url,options);
  const docs=new DocumentService(prisma,storage,{inspect:async bytes=>({mime:'application/pdf',pageCount:(await PDFDocument.load(bytes)).getPageCount()})});
  const review=new FirAdminService(prisma,docs,inbox),token=async id=>{const v=await review.read(admin,id);return {revision:v.revision,submission_id:v.current_submission_id};};
  const fir=new FirService(prisma,docs,inbox),queue=new AdminCasesRepository(prisma),detail=new AdminCaseDetailRepository(prisma);
  let captures=0;
  const pay=new PaymentsService(prisma,state,{capture:async()=>{captures++;return {paymentId:randomUUID(),simulated:true,source:'simulated'};}},inbox);
  const before={};for(const model of ['servicePricing','commissionRate','feePolicy','pageOveragePolicy'])before[model]=await db[model].findMany({select:{id:true}});
  const fixture=require('./helpers/fir.cjs'),intake=fixture.intake(),content=fixture.editable(intake);
  const saveInput=async id=>{const c=await fir.context(advocate,id),doc=await db.document.findFirst({where:{case_id:id,kind:'id_proof',status:'uploaded'}}),content=fixture.editable(c.intake);content.identity_document_id=doc.id;content.attachment_ids=[doc.id];return {base_draft_id:c.latest_draft_id,filing_hash:c.filing_hash,content};};
  const save=async(id,patch={})=>{const input=await saveInput(id);return fir.save(advocate,id,{...input,content:{...input.content,...patch}});};
  const working=async(owner=client)=>{const c=await state.create(owner,{service_code:'fir_draft'});ids.push(c.id);await fir.intake(owner,c.id,fixture.intake());
    assert.equal(await db.document.count({where:{case_id:c.id}}),0);await assert.rejects(state.submitForPayment(owner,c.id),{status:400});await db.document.create({data:{case_id:c.id,owner_id:owner.id,kind:'id_proof',filename:'TEST-identity.pdf',mime_type:'application/pdf',size_bytes:100n,page_count:1,status:'uploaded',s3_key:randomUUID(),identity_evidence:{document_type:'passport',masked_copy:false,policy_version:1,declared_at:new Date().toISOString()}}});
    await fixture.primary(db,c.id,owner.id);await state.submitForPayment(owner,c.id);const q=await pay.quote(owner,{case_id:c.id});assert.equal(q.status,'ready');assert.equal(q.breakdown.total_paise,'147353');await pay.intent(owner,{case_id:c.id,purpose:'service_fee',quote_id:q.id},randomUUID());await state.assign(admin,c.id,{advocate_id:advocate.id});await state.transition(advocate,c.id,'advocate_accepted');return c;};
  try{
    await db.user.createMany({data:users});await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved',city:'Mumbai'}});await seedConfirmedPricing(db);
    await t.test('identity removed after submission blocks payment before gateway capture',async()=>{
      const c=await state.create(client,{service_code:'fir_draft'});ids.push(c.id);await fir.intake(client,c.id,fixture.intake());
      const doc=await db.document.create({data:{case_id:c.id,owner_id:client.id,kind:'id_proof',filename:'TEST-identity.pdf',mime_type:'application/pdf',size_bytes:100n,page_count:1,status:'uploaded',s3_key:randomUUID(),identity_evidence:{document_type:'passport',masked_copy:false,policy_version:1,declared_at:new Date().toISOString()}}});
      await fixture.primary(db,c.id,client.id);await state.submitForPayment(client,c.id);await db.document.update({where:{id:doc.id},data:{status:'deleted'}});
      const q=await pay.quote(client,{case_id:c.id}),before=captures;
      await assert.rejects(pay.intent(client,{case_id:c.id,purpose:'service_fee',quote_id:q.id},randomUUID()),e=>e.status===400&&e.message.includes('identity document'));
      assert.equal(captures,before);assert.equal(await db.payment.count({where:{case_id:c.id,status:'captured'}}),0);
    });
    const c=await working();
    await t.test('partial drafts save, complete errors block PDF, and stale concurrent saves cannot replace current work',async()=>{
      const input=await saveInput(c.id);
      await assert.rejects(fir.save(advocate,c.id,{...input,content:{...input.content,complainant:{name:'Invented'}}}),{status:400});
      await assert.rejects(fir.save(advocate,c.id,{...input,content:{...input.content,attachment_ids:[randomUUID()]}}),{status:400});
      const partial=await fir.save(advocate,c.id,{...input,content:{...input.content,distance_and_direction_from_station:null,legal_sections:[],statement_of_facts:''}});
      await assert.rejects(fir.preview(advocate,c.id,partial.id),e=>e.status===400&&e.message.includes('Statement of facts')&&e.message.includes('legal section'));
      await assert.rejects(fir.send(advocate,c.id,partial.id),{status:400});
      assert.equal(await db.document.count({where:{case_id:c.id,kind:'fir_draft'}}),0);
      await assert.rejects(fir.save(advocate,c.id,input),{status:409});
      const current=await saveInput(c.id),race=await Promise.allSettled([fir.save(advocate,c.id,current),fir.save(advocate,c.id,current)]);
      assert.equal(race.filter(r=>r.status==='fulfilled').length,1);assert.equal(race.find(r=>r.status==='rejected').reason.status,409);
      await assert.rejects(fir.preview(advocate,c.id,partial.id),{status:409});
      const latest=race.find(r=>r.status==='fulfilled').value;
      const preview=await fir.preview(advocate,c.id,latest.id);assert.ok(Buffer.from(preview.pdf_base64,'base64').subarray(0,4).equals(Buffer.from('%PDF')));
      assert.equal(await db.document.count({where:{case_id:c.id,kind:'fir_draft'}}),0,'preview is not a released document');
      const person=await db.caseParty.findFirst({where:{case_id:c.id,kind:'complainant'}});
      assert.deepEqual(latest.content.complainant.filed.value.personal_details,person.details.personal_details);
      await db.caseParty.update({where:{id:person.id},data:{name:'TEST changed source'}});
      await assert.rejects(fir.preview(advocate,c.id,latest.id),{status:409});
      await assert.rejects(fir.save(advocate,c.id,{...current,base_draft_id:latest.id}),{status:409});
      await db.caseParty.update({where:{id:person.id},data:{name:person.name}});
    });
    await t.test('draft permissions and newest version only',async()=>{
      await assert.rejects(fir.save(client,c.id,await saveInput(c.id)),{status:403});await assert.rejects(fir.save(otherAdvocate,c.id,await saveInput(c.id)),{status:404});
      const old=await save(c.id),next=await save(c.id,{statement_of_facts:content.statement_of_facts+' Latest.'});
      await assert.rejects(fir.send(advocate,c.id,old.id),{status:409});
      assert.equal((await repo.read(client,c.id)).drafts.length,0);
      const results=await Promise.allSettled([fir.send(advocate,c.id,next.id),fir.send(advocate,c.id,next.id)]);
      assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
    });
    const pending=await detail.get(admin,c.id),submitted=pending.approval;
    await t.test('waiting draft frozen and no alternate exit or client review',async()=>{
      assert.equal(pending.status,'in_progress');assert.equal(pending.sub_status,'awaiting_admin_approval');
      for(const action of [()=>save(c.id),()=>fir.send(advocate,c.id,submitted.draft_id),()=>state.transition(admin,c.id,'cancelled'),()=>state.transition(client,c.id,'approved'),()=>state.transition(advocate,c.id,'client_review')])await assert.rejects(action(),{status:409});
      await assert.rejects(fir.approve(client,c.id,submitted.draft_id),{status:403});await assert.rejects(fir.approve(advocate,c.id,submitted.draft_id),{status:403});
      await assert.rejects(fir.approve(admin,c.id,randomUUID(),await token(c.id)),{status:409});
      await assert.rejects(docs.delete(admin,submitted.document_id),{status:409});
      await assert.rejects(docs.presign(advocate,{case_id:c.id,kind:'fir_draft',filename:'second.pdf',mime:'application/pdf'}),{status:409});
      assert.equal(await db.caseEvent.count({where:{case_id:c.id,type:'fir_draft_submitted'}}),1);
    });
    await t.test('unapproved PDF denied even by direct document ID; case isolation both ways',async()=>{
      const second=await working(other);await assert.rejects(repo.read(client,second.id),{status:404});await assert.rejects(repo.read(other,c.id),{status:404});
      await assert.rejects(docs.url(client,submitted.document_id),{status:404});await assert.rejects(docs.url(other,submitted.document_id),{status:404});await assert.rejects(docs.url(otherAdvocate,submitted.document_id),{status:404});
      assert.ok((await docs.url(admin,submitted.document_id,true)).url);assert.ok((await docs.url(advocate,submitted.document_id)).url);
      assert.ok((await repo.read(client,c.id)).documents.every(d=>d.owner_id===client.id));
    });
    await t.test('paid approval stalls are in Open; queue paginates oldest first and reports three days',async()=>{
      const old=new Date(Date.now()-3*86400000);await db.case.update({where:{id:c.id},data:{updated_at:old}});await db.caseEvent.updateMany({where:{case_id:c.id,type:'fir_draft_submitted'},data:{created_at:old}});
      const another=await working(),d=await save(another.id);await fir.send(advocate,another.id,d.id);
      const first=await queue.list(admin,{service:'fir_draft',queue:'approval',limit:1,search:'TEST FIR client'});
      assert.equal(first.items[0].id,c.id);assert.equal(first.items[0].bucket,'open');assert.equal(first.approval_waiting,2);assert.match(waitingDuration(first.items[0].approval.submitted_at),/3 days/);
      const next=await queue.list(admin,{service:'fir_draft',queue:'approval',limit:1,search:'TEST FIR client',cursor:first.next_cursor});assert.equal(next.items[0].id,another.id);
      const open=await queue.list(admin,{service:'fir_draft',bucket:'open',search:'TEST FIR client'});assert.equal(open.counts.open,2);assert.equal(open.items.length,2);
      assert.equal((await queue.list(admin,{service:'fir_draft',bucket:'in_progress',search:'TEST FIR client'})).items.some(r=>r.id===c.id),false);
    });
    await t.test('approval pins reviewed PDF and closes once; client can read only approved version',async()=>{
      const doc=await db.document.findUniqueOrThrow({where:{id:submitted.document_id}}),bytes=objects.get(doc.s3_key);
      const life=await review.read(admin,c.id),sub=life.submissions.find(s=>s.id===life.current_submission_id);
      await review.identityReview(admin,c.id,{...await token(c.id),document_id:sub.identity_document_id,decision:'accepted'});
      const approvalToken=await token(c.id);await Promise.all([fir.approve(admin,c.id,submitted.draft_id,approvalToken),fir.approve(admin,c.id,submitted.draft_id,approvalToken)]);
      const done=await repo.read(client,c.id);assert.equal(done.status,'client_review');assert.equal(done.drafts.length,1);assert.equal(done.drafts[0].id,submitted.draft_id);assert.equal(done.approval.document_id,doc.id);
      assert.ok((await docs.url(client,doc.id)).url);assert.deepEqual(objects.get(doc.s3_key),bytes);
      assert.equal(await db.draftReview.count({where:{draft_id:submitted.draft_id}}),1);assert.equal(await db.adminAction.count({where:{subject_id:c.id,action:'approve_fir_draft'}}),1);
      assert.equal(await db.caseEvent.count({where:{case_id:c.id,type:'fir_sent_to_client'}}),1);
      assert.equal(await db.notification.count({where:{case_id:c.id,kind:'fir_ready',user_id:client.id}}),1);
      assert.equal(await db.notification.count({where:{case_id:c.id,kind:{in:['client_approved','notice_delivered']}}}),0);
      assert.equal(done.client_fees.total_paise,'147353');
    });
  }finally{
    global.fetch=originalFetch;
    await db.notification.deleteMany({where:{case_id:{in:ids}}});await db.draftReview.deleteMany({where:{draft_id_relation:{case_id:{in:ids}}}});
    await db.draft.deleteMany({where:{case_id:{in:ids}}});await db.payment.deleteMany({where:{case_id:{in:ids}}});await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});await db.adminAction.deleteMany({where:{admin_id:admin.id}});
    await db.document.deleteMany({where:{case_id:{in:ids}}});await db.caseParty.deleteMany({where:{case_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});await db.advocateProfile.deleteMany({where:{user_id:advocate.id}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
    await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)},fee_policy_id:{not:null}}});await db.feePolicy.deleteMany({where:{id:{notIn:before.feePolicy.map(x=>x.id)}}});await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)}}});await db.commissionRate.deleteMany({where:{id:{notIn:before.commissionRate.map(x=>x.id)}}});await db.pageOveragePolicy.deleteMany({where:{id:{notIn:before.pageOveragePolicy.map(x=>x.id)}}});await db.$disconnect();
  }
});
