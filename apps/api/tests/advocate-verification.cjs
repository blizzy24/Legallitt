const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {AdvocateVerificationService}=require('../dist/src/advocate-verification/advocate-verification.service');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {stagingKey}=require('../dist/src/documents/document-storage');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');

const details={personal:{full_name:'TEST Adv Priya',phone:'+91 90000 11111',date_of_birth:'1988-01-02',gender:'Female'},
  professional:{years_experience:9,education:'LL.B.',courts:['District Court Indore'],languages:['Hindi','English']},
  bar_council:{state:'Madhya Pradesh',number:'MP/1429/2014',enrolment_year:2014},practice:{areas:['Civil','Property'],city:'Indore',state:'Madhya Pradesh'}};

test('D-35 advocate verification: owner-scoped documents, submit, admin decisions, isolation',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
  const users=['advocate','advocate','client','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST VERIFY '+role}));
  const [adv,other,client,admin]=users,objects=new Map();
  const storage={upload:async key=>({url:'https://verify.invalid',fields:{key:stagingKey(key)}}),head:async key=>objects.has(key)?{size:objects.get(key).length,mime:'application/pdf'}:null,
    read:async key=>objects.get(key),promote:async key=>objects.set(key,objects.get(stagingKey(key))),remove:async key=>objects.delete(key),discard:async key=>objects.delete(key),
    download:async key=>'https://verify.invalid/'+key};
  const svc=new AdvocateVerificationService(prisma,storage,{inspect:async()=>({mime:'application/pdf',pageCount:1})},new InAppNotifications(new SimulatedNotifications()));
  const upload=async(actor,kind,filename='TEST.pdf')=>{const ticket=await svc.presign(actor,{kind,filename,mime:'application/pdf'});objects.set(stagingKey(ticket.document.s3_key),new Uint8Array([1,2,3]));return svc.complete(actor,ticket.document.id);};
  try{
    await db.user.createMany({data:users});
    await t.test('partial saves allowed; submit blocked until complete; identity filename never persisted',async()=>{
      assert.equal((await svc.read(adv)).status,'not_started');
      const partial=await svc.save(adv,{details:{personal:{full_name:'TEST Adv Priya'}}});assert.ok(partial.problems.length>3);
      await assert.rejects(svc.submit(adv),{status:400});
      await svc.save(adv,{details});
      const id=await upload(adv,'verification_identity','Aadhaar 1234 5678 9012.pdf');assert.match(id.filename,/^Identity-proof-/);
      await upload(adv,'verification_enrolment');await upload(adv,'verification_practice');
      assert.deepEqual((await svc.read(adv)).problems,[]);
    });
    await t.test('isolation: other advocates, clients and admins cannot act as this advocate',async()=>{
      const doc=(await svc.read(adv)).documents[0];
      await assert.rejects(svc.url(other,doc.id),{status:404});await assert.rejects(svc.url(client,doc.id),{status:404});
      await assert.rejects(svc.complete(other,doc.id),{status:404});await assert.rejects(svc.remove(other,doc.id),{status:404});
      assert.equal((await svc.read(other)).documents.length,0);
      await assert.rejects(svc.read(client),{status:403});await assert.rejects(svc.save(admin,{details}),{status:403});
      await assert.rejects(svc.queue(adv,'waiting'),{status:403});await assert.rejects(svc.detail(client,adv.id),{status:403});
      await assert.rejects(svc.decide(adv,adv.id,{decision:'approved'}),{status:403});
      assert.ok((await svc.url(admin,doc.id)).url);
      // The generic case document pipeline never serves case-less files.
      assert.equal(await db.document.count({where:{owner_id:adv.id,case_id:{not:null}}}),0);
    });
    await t.test('submit → in review, frozen; admin requests update with reason; resubmit; approve publishes profile',async()=>{
      assert.equal((await svc.submit(adv)).status,'in_review');
      await assert.rejects(svc.save(adv,{details}),{status:409});await assert.rejects(upload(adv,'verification_practice'),{status:409});
      assert.ok((await svc.queue(admin,'waiting')).items.some(i=>i.user_id===adv.id));
      await assert.rejects(svc.decide(admin,adv.id,{decision:'needs_update'}),{status:400});
      const upd=await svc.decide(admin,adv.id,{decision:'needs_update',reason:'Upload a clearer certificate of practice.'});
      assert.equal(upd.status,'needs_update');assert.equal((await svc.read(adv)).decision.reason,'Upload a clearer certificate of practice.');
      await upload(adv,'verification_practice','Clearer.pdf');await svc.submit(adv);
      const done=await svc.decide(admin,adv.id,{decision:'approved'});assert.equal(done.status,'approved');
      const profile=await db.advocateProfile.findUnique({where:{user_id:adv.id}});
      assert.equal(profile.bar_council_number,'MP/1429/2014');assert.deepEqual(profile.practice_areas,['Civil','Property']);assert.equal(profile.city,'Indore');
      await assert.rejects(svc.decide(admin,adv.id,{decision:'rejected',reason:'x'}),{status:409});
      assert.ok(await db.adminAction.findFirst({where:{subject_id:adv.id,action:'advocate_verification_approved'}}));
    });
    await t.test('only approved advocates are assignable',async()=>{
      await svc.save(other,{details});
      const state=new CaseStateMachine(prisma,new InAppNotifications(new SimulatedNotifications()));
      const c=await state.create(client,{service_code:'property_search'});
      try{
        await db.case.update({where:{id:c.id},data:{status:'paid'}});
        const {ReportWorkflowService}=require('../dist/src/service-reports/report-workflow.service');
        const workflow=new ReportWorkflowService(prisma,new InAppNotifications(new SimulatedNotifications()));
        await workflow.action(admin,c.id,'verify',{revision:(await workflow.view(admin,c.id)).revision});
        await assert.rejects(state.assign(admin,c.id,{advocate_id:other.id}),{status:400});
      }finally{await db.reportWorkflow.deleteMany({where:{case_id:c.id}});await db.caseEvent.deleteMany({where:{case_id:c.id}});await db.case.delete({where:{id:c.id}});}
    });
  }finally{
    const ids=users.map(u=>u.id);
    await db.notification.deleteMany({where:{user_id:{in:ids}}});await db.adminAction.deleteMany({where:{subject_id:{in:ids}}});
    await db.document.deleteMany({where:{owner_id:{in:ids}}});await db.advocateVerification.deleteMany({where:{user_id:{in:ids}}});
    await db.advocateProfile.deleteMany({where:{user_id:{in:ids}}});await db.user.deleteMany({where:{id:{in:ids}}});await db.$disconnect();
  }
});
