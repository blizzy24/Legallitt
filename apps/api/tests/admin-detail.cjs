const test=require('node:test'), assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client');
const {PrismaPg}=require('@prisma/adapter-pg');
const {AdminCaseDetailRepository}=require('../dist/src/admin-cases/admin-case-detail');
test('admin detail: boundaries, sparse data, origins, payer, timeline and shipment evidence', {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
 const repo=new AdminCaseDetailRepository({getClient:async()=>db});
 const users=['client','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:role+' detail test',email:randomUUID()+'@example.invalid'}));
 const [client,adv,admin]=users;const id=randomUUID(),sparse=randomUUID(),other=randomUUID(),doc=randomUUID(),final=randomUUID(),shipment=randomUUID();
 try {
  await db.user.createMany({data:users});
  for(const [caseId,service] of [[id,'legal_notice'],[sparse,'legal_notice'],[other,'fir_draft']])await db.case.create({data:{id:caseId,reference:'DETAIL-'+caseId,service_code:service,client_id:client.id,status:'assigning'}});
  await assert.rejects(repo.get(client,id),{status:403});await assert.rejects(repo.get(adv,id),{status:403});await assert.rejects(repo.get(admin,other),{status:404});await assert.rejects(repo.get(admin,randomUUID()),{status:404});await assert.rejects(repo.get(admin,'bad'),{status:400});
  const blank=await repo.get(admin,sparse);assert.equal(blank.pricing,null);assert.equal(blank.advocate_id,null);assert.deepEqual(blank.documents,[]);assert.deepEqual(blank.events,[]);assert.equal(blank.contacts.length,1);assert.equal(blank.contacts[0].phone,null);
  await db.case.update({where:{id},data:{advocate_id:adv.id,details:{noticee:{fullName:'Noticee',email:'noticee@example.invalid',address:'Test address'}}}});
  await db.document.createMany({data:[{id:doc,case_id:id,owner_id:admin.id,kind:'proof_of_delivery',filename:'simulated-pod.pdf',s3_key:'private-pod-key',mime_type:'application/pdf',size_bytes:100n,simulated:true},{id:final,case_id:id,owner_id:adv.id,kind:'legal_notice',filename:'notice.pdf',s3_key:'private-final-key',mime_type:'application/pdf',size_bytes:200n}]});
  await db.case.update({where:{id},data:{notice_document_id:final}});
  await db.draft.create({data:{case_id:id,version:1,kind:'legal_notice',content:{subject:'Test draft'},created_by:adv.id,document_id:final}});
  await db.payment.create({data:{case_id:id,payer_id:adv.id,purpose:'courier',base_amount_paise:25000n,gst_paise:4500n,total_paise:29500n,status:'captured',idempotency_key:randomUUID(),simulated:true}});
  await db.shipment.create({data:{id:shipment,case_id:id,direction:'to_recipient',status:'delivered',carrier:'Test carrier',waybill:'test-waybill',pod_document_id:doc,simulated:true}});
  for(const [type,created_at,source] of [['status_changed','2026-01-01','real'],['shipment_status_changed','2026-01-02','simulated']]) await db.caseEvent.create({data:{case_id:id,type,created_at:new Date(created_at),source,actor_id:source==='real'?admin.id:null,actor_role:source==='real'?'admin':null,payload:source==='simulated'?{actor:'system',shipment_id:shipment,to:'delivered'}:{}}});
  const result=await repo.get(admin,id);
  assert.equal(result.simulated,true);assert.equal(result.events[0].actor.name,'System');assert.equal(result.events[1].actor.name,admin.full_name);
  assert.equal(result.documents.find(d=>d.id===doc).origin,'admin');assert.equal(result.documents.find(d=>d.id===doc).simulated,true);assert.equal(result.documents.find(d=>d.id===final).origin,'generated');assert.equal(result.documents.find(d=>d.id===final).final,true);
  assert.equal(result.payments[0].payer.role,'advocate');assert.equal(result.payments[0].total_paise,'29500');assert.equal(result.shipments[0].waybill,'test-waybill');assert.equal(result.contacts.find(c=>c.role==='noticee').email,'noticee@example.invalid');assert.equal(result.drafts[0].content.subject,'Test draft');
  const json=JSON.stringify(result);assert.ok(!json.includes('s3_key'));assert.ok(!json.includes('cognito_sub'));assert.ok(!json.includes('private-pod-key'));
 }finally{
  await db.case.updateMany({where:{id:{in:[id,sparse,other]}},data:{notice_document_id:null}});
  for(const table of ['caseEvent','shipment','payment','draft','document'])await db[table].deleteMany({where:{case_id:{in:[id,sparse,other]}}});
  await db.case.deleteMany({where:{id:{in:[id,sparse,other]}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});await db.$disconnect();
 }
});

test('development workload seed is guarded, idempotent and visibly simulated', {skip:!process.env.LEGALITT_TEST_DATABASE_URL}, async()=>{
 const {seedDevelopmentNotice}=require('../dist/src/cases/case-state-machine');
 const oldEnv=process.env.ENVIRONMENT,oldNode=process.env.NODE_ENV;
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
 const clientId=randomUUID(),seedKey='test-'+randomUUID();
 try {
  process.env.ENVIRONMENT='prod';process.env.NODE_ENV='production';
  await assert.rejects(seedDevelopmentNotice({},{}),{status:503});
  process.env.ENVIRONMENT='dev';process.env.NODE_ENV='test';
  await db.user.create({data:{id:clientId,cognito_sub:randomUUID(),full_name:'Seed test',role:'client'}});
  const input={seedKey,clientId,status:'assigning',sparse:true,pricingId:randomUUID()};
  await seedDevelopmentNotice(db,input);await seedDevelopmentNotice(db,input);
  const events=await db.caseEvent.findMany({where:{type:'development_seed',payload:{path:['seed_key'],equals:seedKey}}});
  assert.equal(events.length,1);assert.equal(events[0].source,'simulated');assert.equal(events[0].actor_id,null);
  assert.equal(await db.case.count({where:{client_id:clientId}}),1);
 }finally{
  const ids=(await db.case.findMany({where:{client_id:clientId},select:{id:true}})).map(c=>c.id);
  await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});await db.user.deleteMany({where:{id:clientId}});await db.$disconnect();
  if(oldEnv===undefined)delete process.env.ENVIRONMENT;else process.env.ENVIRONMENT=oldEnv;
  if(oldNode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=oldNode;
 }
});
