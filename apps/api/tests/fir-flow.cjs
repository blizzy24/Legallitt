const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PDFDocument}=require('pdf-lib');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {CaseRepository}=require('../dist/src/cases/case-repository');
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
  const fir=new FirService(prisma,docs,inbox),queue=new AdminCasesRepository(prisma),detail=new AdminCaseDetailRepository(prisma);
  const pay=new PaymentsService(prisma,state,{capture:async()=>({paymentId:randomUUID(),simulated:true,source:'simulated'})},inbox);
  const before={};for(const model of ['servicePricing','commissionRate','feePolicy','pageOveragePolicy'])before[model]=await db[model].findMany({select:{id:true}});
  const intake={contact:{fullName:'TEST complainant',mobile:'2025550100',email:''},jurisdiction:{state:'Maharashtra',district:'Mumbai',policeStation:'TEST station'},incident:{type:'theft',date:'2026-11-10',time:'09:00',location:'TEST location',description:'TEST ONLY synthetic incident.',additional:''},people:[]};
  const content={fields:{'Police Station':'TEST station','Full Legal Name':'TEST complainant'},legal_sections:[],narrative:'TEST ONLY synthetic complaint. No real offence or filing.',witnesses:[],document_ids:[]};
  const working=async(owner=client)=>{const c=await state.create(owner,{service_code:'fir_draft'});ids.push(c.id);await fir.intake(owner,c.id,intake);
    await assert.rejects(state.submitForPayment(owner,c.id),{status:400});
    await db.document.create({data:{case_id:c.id,owner_id:owner.id,kind:'id_proof',filename:'TEST-ID-proof.pdf',mime_type:'application/pdf',size_bytes:100n,page_count:1,status:'uploaded',s3_key:randomUUID()}});
    await state.submitForPayment(owner,c.id);const q=await pay.quote(owner,{case_id:c.id});assert.equal(q.status,'ready');assert.equal(q.breakdown.total_paise,'147353');await pay.intent(owner,{case_id:c.id,purpose:'service_fee',quote_id:q.id},randomUUID());await state.assign(admin,c.id,{advocate_id:advocate.id});await state.transition(advocate,c.id,'advocate_accepted');return c;};
  try{
    await db.user.createMany({data:users});await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved',city:'Mumbai'}});await seedConfirmedPricing(db);
    const c=await working();
    await t.test('draft permissions and newest version only',async()=>{
      await assert.rejects(fir.save(client,c.id,content),{status:403});await assert.rejects(fir.save(otherAdvocate,c.id,content),{status:404});
      const old=await fir.save(advocate,c.id,content),next=await fir.save(advocate,c.id,{...content,narrative:content.narrative+' Latest.'});
      await assert.rejects(fir.send(advocate,c.id,old.id),{status:409});
      assert.equal((await repo.read(client,c.id)).drafts.length,0);
      const results=await Promise.allSettled([fir.send(advocate,c.id,next.id),fir.send(advocate,c.id,next.id)]);
      assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
    });
    const pending=await detail.get(admin,c.id),submitted=pending.approval;
    await t.test('waiting draft frozen and no alternate exit or client review',async()=>{
      assert.equal(pending.status,'in_progress');assert.equal(pending.sub_status,'awaiting_admin_approval');
      for(const action of [()=>fir.save(advocate,c.id,content),()=>fir.send(advocate,c.id,submitted.draft_id),()=>state.transition(admin,c.id,'cancelled'),()=>state.transition(client,c.id,'approved'),()=>state.transition(advocate,c.id,'client_review')])await assert.rejects(action(),{status:409});
      await assert.rejects(fir.approve(client,c.id,submitted.draft_id),{status:403});await assert.rejects(fir.approve(advocate,c.id,submitted.draft_id),{status:403});
      await assert.rejects(fir.approve(admin,c.id,randomUUID()),{status:409});
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
      const another=await working(),d=await fir.save(advocate,another.id,content);await fir.send(advocate,another.id,d.id);
      const first=await queue.list(admin,{service:'fir_draft',queue:'approval',limit:1,search:'TEST FIR client'});
      assert.equal(first.items[0].id,c.id);assert.equal(first.items[0].bucket,'open');assert.equal(first.approval_waiting,2);assert.match(waitingDuration(first.items[0].approval.submitted_at),/3 days/);
      const next=await queue.list(admin,{service:'fir_draft',queue:'approval',limit:1,search:'TEST FIR client',cursor:first.next_cursor});assert.equal(next.items[0].id,another.id);
      const open=await queue.list(admin,{service:'fir_draft',bucket:'open',search:'TEST FIR client'});assert.equal(open.counts.open,2);assert.equal(open.items.length,2);
      assert.equal((await queue.list(admin,{service:'fir_draft',bucket:'in_progress',search:'TEST FIR client'})).items.some(r=>r.id===c.id),false);
    });
    await t.test('approval pins reviewed PDF and closes once; client can read only approved version',async()=>{
      const doc=await db.document.findUniqueOrThrow({where:{id:submitted.document_id}}),bytes=objects.get(doc.s3_key);
      await Promise.all([fir.approve(admin,c.id,submitted.draft_id),fir.approve(admin,c.id,submitted.draft_id)]);
      const done=await repo.read(client,c.id);assert.equal(done.status,'completed');assert.equal(done.drafts.length,1);assert.equal(done.drafts[0].id,submitted.draft_id);assert.equal(done.approval.document_id,doc.id);
      assert.ok((await docs.url(client,doc.id)).url);assert.deepEqual(objects.get(doc.s3_key),bytes);
      assert.equal(await db.draftReview.count({where:{draft_id:submitted.draft_id}}),1);assert.equal(await db.adminAction.count({where:{subject_id:c.id,action:'approve_fir_draft'}}),1);
      assert.equal(await db.caseEvent.count({where:{case_id:c.id,type:'fir_released_to_client'}}),1);
      assert.equal(await db.notification.count({where:{case_id:c.id,kind:'fir_ready',user_id:client.id}}),1);
      assert.equal(await db.notification.count({where:{case_id:c.id,kind:{in:['client_approved','notice_delivered']}}}),0);
      assert.equal(done.client_fees.total_paise,'147353');
    });
  }finally{
    global.fetch=originalFetch;
    await db.notification.deleteMany({where:{case_id:{in:ids}}});await db.draftReview.deleteMany({where:{draft_id_relation:{case_id:{in:ids}}}});
    await db.draft.deleteMany({where:{case_id:{in:ids}}});await db.payment.deleteMany({where:{case_id:{in:ids}}});await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});await db.adminAction.deleteMany({where:{admin_id:admin.id}});
    await db.document.deleteMany({where:{case_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});await db.advocateProfile.deleteMany({where:{user_id:advocate.id}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
    await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)},fee_policy_id:{not:null}}});await db.feePolicy.deleteMany({where:{id:{notIn:before.feePolicy.map(x=>x.id)}}});await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)}}});await db.commissionRate.deleteMany({where:{id:{notIn:before.commissionRate.map(x=>x.id)}}});await db.pageOveragePolicy.deleteMany({where:{id:{notIn:before.pageOveragePolicy.map(x=>x.id)}}});await db.$disconnect();
  }
});
