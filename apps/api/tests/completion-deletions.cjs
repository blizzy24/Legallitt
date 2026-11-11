const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {AdvocateCompletionService}=require('../dist/src/completion/advocate-completion');
const {AccountDeletionsAdminService}=require('../dist/src/account/account-deletions-admin');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');

test('D-07 completion view and D-24 admin deletion queue: data, decisions and isolation',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
  const users=['client','client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST H '+role}));
  const [client,other,adv,otherAdv,admin]=users,ids=[];
  const completion=new AdvocateCompletionService(prisma),queue=new AccountDeletionsAdminService(prisma,new InAppNotifications(new SimulatedNotifications()));
  try{
    await db.user.createMany({data:users});
    const id=randomUUID();ids.push(id);
    await db.case.create({data:{id,reference:'COMPLETIONTEST-'+id.slice(0,8),service_code:'legal_notice',client_id:client.id,advocate_id:adv.id,status:'completed',completed_at:new Date('2026-11-10T10:00:00Z')}});
    const notice=await db.document.create({data:{case_id:id,owner_id:admin.id,kind:'final_notice',filename:'Final.pdf',s3_key:'t1',mime_type:'application/pdf',size_bytes:10n,page_count:2,status:'uploaded'}});
    const pod=await db.document.create({data:{case_id:id,owner_id:admin.id,kind:'proof_of_delivery',filename:'POD.pdf',s3_key:'t2',mime_type:'application/pdf',size_bytes:10n,page_count:1,status:'uploaded'}});
    await db.case.update({where:{id},data:{notice_document_id:notice.id}});
    await db.shipment.create({data:{case_id:id,direction:'to_recipient',status:'delivered',carrier:'Speed Post',waybill:'EX1',received_by:'Recipient',delivered_at:new Date('2026-11-10T09:00:00Z'),pod_document_id:pod.id}});
    const pricing=await db.servicePricing.findFirstOrThrow({where:{service_code:'legal_notice',tier:'ordinary',confirmed:true}});
    const quote=await db.casePriceQuote.create({data:{case_id:id,pricing_id:pricing.id,document_fingerprint:'x',snapshot:{breakdown:{advocate_entitlement_paise:'87800'}}}});
    await db.payment.create({data:{case_id:id,payer_id:client.id,purpose:'service_fee',base_amount_paise:1n,gst_paise:0n,total_paise:1n,status:'captured',idempotency_key:randomUUID(),simulated:true,quote_id:quote.id}});
    await t.test('assigned advocate sees completion, POD, notice and entitlement',async()=>{
      const v=await completion.completion(adv,id);
      assert.equal(v.completed,true);assert.equal(v.entitlement_paise,'87800');assert.equal(v.entitlement_complete,true);
      assert.deepEqual(v.documents.map(d=>d.label),['Final notice','Proof of delivery']);assert.equal(v.delivery.received_by,'Recipient');
      assert.equal((await completion.completion(admin,id)).completed,true);
    });
    await t.test('isolation: other advocate 404, clients 403',async()=>{
      await assert.rejects(completion.completion(otherAdv,id),{status:404});
      await assert.rejects(completion.completion(client,id),{status:403});
      await assert.rejects(completion.completion(other,id),{status:403});
    });
    await t.test('deletion queue: admin only, oldest first, complete keeps deactivated, reactivate restores, no erasure',async()=>{
      await db.user.update({where:{id:other.id},data:{status:'deactivated'}});
      const first=await db.accountDeletionRequest.create({data:{user_id:other.id,reason:'TEST no longer needed',created_at:new Date(Date.now()-60000)}});
      for(const actor of [client,other,adv])await assert.rejects(queue.list(actor),{status:403});
      for(const actor of [client,adv])await assert.rejects(queue.decide(actor,first.id,{decision:'reactivate',note:'nope'}),{status:403});
      const list=await queue.list(admin);const mine=list.items.filter(i=>[other.id,client.id].includes(i.user.id));
      assert.equal(mine[0].id,first.id);assert.equal(mine[0].user.account_status,'deactivated');
      await assert.rejects(queue.decide(admin,first.id,{decision:'complete',note:''}),{status:400});
      await queue.decide(admin,first.id,{decision:'complete',note:'TEST completed per request'});
      assert.equal((await db.user.findUnique({where:{id:other.id}})).status,'deactivated');
      assert.ok(await db.user.findUnique({where:{id:other.id}}),'user row kept');
      await assert.rejects(queue.decide(admin,first.id,{decision:'reactivate',note:'again'}),{status:409});
      const decided=(await queue.list(admin,'decided')).items.find(i=>i.id===first.id);assert.equal(decided.decision_note,'TEST completed per request');
      await db.user.update({where:{id:client.id},data:{status:'deactivated'}});
      const second=await db.accountDeletionRequest.create({data:{user_id:client.id}});
      await queue.decide(admin,second.id,{decision:'reactivate',note:'TEST client asked to keep the account'});
      assert.equal((await db.user.findUnique({where:{id:client.id}})).status,'active');
      assert.ok(await db.notification.findFirst({where:{user_id:client.id,kind:'account_reactivated'}}));
      await assert.rejects(queue.decide(admin,randomUUID(),{decision:'complete',note:'missing'}),{status:404});
    });
  }finally{
    const userIds=users.map(u=>u.id);
    await db.adminAction.deleteMany({where:{admin_id:admin.id}});await db.accountDeletionRequest.deleteMany({where:{user_id:{in:userIds}}});
    await db.notification.deleteMany({where:{user_id:{in:userIds}}});
    for(const id of ids){await db.payment.deleteMany({where:{case_id:id}});await db.casePriceQuote.deleteMany({where:{case_id:id}});await db.case.update({where:{id},data:{notice_document_id:null}});
      await db.shipment.deleteMany({where:{case_id:id}});await db.document.deleteMany({where:{case_id:id}});await db.caseEvent.deleteMany({where:{case_id:id}});await db.case.delete({where:{id}});}
    await db.user.deleteMany({where:{id:{in:userIds}}});await db.$disconnect();
  }
});
