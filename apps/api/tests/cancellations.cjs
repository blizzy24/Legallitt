const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {ServiceReportsService}=require('../dist/src/service-reports/service-reports.service');
const {ReportWorkflowService}=require('../dist/src/service-reports/report-workflow.service');
const {CancellationsService}=require('../dist/src/cancellations/cancellations.service');
const {PaymentsService}=require('../dist/src/payments/payments.service');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');
const {seedConfirmedPricing,seedProvisionalPricing}=require('../dist/prisma/seed-pricing');

const intake={tier:'ordinary',details:{contact:{fullName:'TEST Cancel',mobile:'+91 90000 00000'},jurisdiction:{state_code:'23',state:'Madhya Pradesh',district_code:'410',district:'Indore'},
  property_address:'Plot 1, Indore',property_type:'residential',purpose:'buying',search_duration:'30_years'}};

test('Cancellations and simulated refunds (D-12, D-13, D-14)',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
  const users=['client','client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST CANCEL '+role}));
  const [client,other,advocate,otherAdvocate,admin]=users,ids=[];
  const inbox=new InAppNotifications(new SimulatedNotifications()),state=new CaseStateMachine(prisma,inbox);
  const reports=new ServiceReportsService(prisma,state,{},inbox),cancels=new CancellationsService(prisma,inbox);
  const workflows=new ReportWorkflowService(prisma,inbox);
  const pay=new PaymentsService(prisma,state,{capture:async()=>({paymentId:randomUUID(),simulated:true,source:'simulated'})},inbox);
  const paidCase=async(accept=false)=>{
    const c=await state.create(client,{service_code:'property_search'});ids.push(c.id);
    await reports.intake(client,c.id,intake);await state.submitForPayment(client,c.id);
    const q=await pay.quote(client,{case_id:c.id});await pay.intent(client,{case_id:c.id,purpose:'service_fee',quote_id:q.id},randomUUID());
    await workflows.action(admin,c.id,'verify',{revision:(await workflows.view(admin,c.id)).revision});
    await state.assign(admin,c.id,{advocate_id:advocate.id});
    if(accept)await state.transition(advocate,c.id,'advocate_accepted');
    return c;
  };
  try{
    await db.user.createMany({data:users});await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved',city:'Indore'}});
    await seedConfirmedPricing(db);await seedProvisionalPricing(db);
    await t.test('unpaid draft cancels with nothing to refund',async()=>{
      const c=await state.create(client,{service_code:'property_search'});ids.push(c.id);
      const v=await cancels.read(client,c.id);assert.equal(v.mode,'unpaid');
      await assert.rejects(cancels.cancel(client,c.id,{}),{status:400},'confirmation required');
      const done=await cancels.cancel(client,c.id,{confirm:true});assert.equal(done.status,'cancelled');assert.equal(done.refunds.length,0);
    });
    await t.test('before acceptance: self-serve, immediate, full simulated refund, advocate released',async()=>{
      const c=await paidCase();
      assert.equal((await cancels.read(client,c.id)).mode,'self_serve');
      const done=await cancels.cancel(client,c.id,{reason:'cost',note:'Too expensive',confirm:true});
      assert.equal(done.status,'refunded');assert.equal(done.refunds.length,1);assert.equal(done.refunds[0].amount_paise,'368603');assert.equal(done.refunds[0].simulated,true);
      assert.equal(done.request.mode,'self_serve');assert.equal(done.request.status,'completed');
      assert.ok(await db.notification.findFirst({where:{user_id:advocate.id,case_id:c.id,kind:'case_cancelled_advocate'}}));
      const events=(await db.caseEvent.findMany({where:{case_id:c.id},orderBy:{id:'asc'}})).map(e=>e.type);
      assert.ok(events.includes('case_cancelled')&&events.includes('refund_recorded'));
      await assert.rejects(cancels.cancel(client,c.id,{confirm:true}),{status:409});
      const queue=await cancels.queue(admin,{status:'decided'});assert.ok(queue.items.some(i=>i.case_id===c.id&&i.mode==='self_serve'));
    });
    await t.test('after acceptance: request, admin partial refund with visible reason',async()=>{
      const c=await paidCase(true);
      const pending=await cancels.cancel(client,c.id,{reason:'found_another_option',confirm:true});
      assert.equal(pending.mode,'request');assert.equal(pending.request.status,'pending');assert.equal(pending.status,'advocate_accepted');
      await assert.rejects(cancels.cancel(client,c.id,{confirm:true}),{status:409},'one pending request');
      const q=await cancels.queue(admin,{});const row=q.items.find(i=>i.case_id===c.id);assert.ok(row);assert.equal(row.refundable_paise,'368603');
      await assert.rejects(cancels.decide(admin,row.id,{decision:'approve',refund_amount_paise:'999999999',reason:'Too much'}),{status:400});
      await assert.rejects(cancels.decide(client,row.id,{decision:'approve',refund_amount_paise:'1',reason:'Self'}),{status:403});
      const done=await cancels.decide(admin,row.id,{decision:'approve',refund_amount_paise:'200000',reason:'Advocate had started the search.'});
      assert.equal(done.status,'cancelled','partial refund leaves the case cancelled');assert.equal(done.refunds[0].amount_paise,'200000');
      const seen=await cancels.read(client,c.id);assert.equal(seen.request.decision_reason,'Advocate had started the search.');assert.equal(seen.refundable_paise,'168603');
      await assert.rejects(cancels.decide(admin,row.id,{decision:'decline',reason:'Again'}),{status:409});
    });
    await t.test('admin can decline; case continues',async()=>{
      const c=await paidCase(true);await cancels.cancel(client,c.id,{confirm:true});
      const row=(await cancels.queue(admin,{})).items.find(i=>i.case_id===c.id);
      const v=await cancels.decide(admin,row.id,{decision:'decline',reason:'Report already delivered to admin review.'});
      assert.equal(v.status,'advocate_accepted');assert.equal(v.request.status,'declined');
      assert.ok(await db.notification.findFirst({where:{user_id:client.id,case_id:c.id,kind:'cancellation_declined'}}));
    });
    await t.test('delivered work cannot be cancelled',async()=>{
      const c=await paidCase(true);await db.case.update({where:{id:c.id},data:{status:'completed'}});
      assert.equal((await cancels.read(client,c.id)).mode,'closed');
      await assert.rejects(cancels.cancel(client,c.id,{confirm:true}),{status:409});
    });
    await t.test('isolation: other client and advocates get 404; queue is admin-only',async()=>{
      const c=await paidCase();
      await assert.rejects(cancels.read(other,c.id),{status:404});await assert.rejects(cancels.cancel(other,c.id,{confirm:true}),{status:404});
      await assert.rejects(cancels.read(advocate,c.id),{status:404});await assert.rejects(cancels.cancel(advocate,c.id,{confirm:true}),{status:404});
      await assert.rejects(cancels.read(otherAdvocate,c.id),{status:404});
      await assert.rejects(cancels.queue(client,{}),{status:403});await assert.rejects(cancels.queue(advocate,{}),{status:403});
      assert.equal((await db.case.findUnique({where:{id:c.id}})).status,'assigned');
    });
  }finally{
    for(const id of ids){
      await db.notification.deleteMany({where:{case_id:id}});await db.adminAction.deleteMany({where:{subject_id:id}});
      await db.refund.deleteMany({where:{case_id:id}});await db.cancellationRequest.deleteMany({where:{case_id:id}});
      await db.payment.deleteMany({where:{case_id:id}});await db.casePriceQuote.deleteMany({where:{case_id:id}});
      await db.caseAssignment.deleteMany({where:{case_id:id}}).catch(()=>{});
      await db.reportWorkflow.deleteMany({where:{case_id:id}});
      await db.document.deleteMany({where:{case_id:id}});await db.caseEvent.deleteMany({where:{case_id:id}});await db.caseParty.deleteMany({where:{case_id:id}});await db.case.delete({where:{id}});
    }
    await db.notification.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});
    await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
    await db.$disconnect();
  }
});
