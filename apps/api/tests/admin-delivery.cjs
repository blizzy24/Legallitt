const inbox = () => new (require('../dist/src/notifications/in-app-notifications').InAppNotifications)(new (require('../dist/src/notifications/simulated-notifications').SimulatedNotifications)());
const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client');const {PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {AdminCaseDetailRepository}=require('../dist/src/admin-cases/admin-case-detail');
const {SimulatedAdminUi}=require('../dist/src/admin-ui/simulated-admin-ui');
const {DemoProgression}=require('../dist/src/demo/demo-progression');
test('human delivery persists receiver/time, real source and POD; duplicates and stale timer cannot overwrite', {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
 const state=new CaseStateMachine({getClient:async()=>db}, inbox());
 const actors=['client','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'Delivery '+role}));const [client,adv,admin]=actors;
 const ids=[],docs=[];
 async function setup(){const id=randomUUID();ids.push(id);await db.case.create({data:{id,reference:'DELIVERYTEST-'+id,service_code:'legal_notice',client_id:client.id,advocate_id:adv.id,status:'dispatched'}});const shipment=await db.shipment.create({data:{case_id:id,direction:'to_recipient',status:'out_for_delivery',simulated:true}});
  const proof=await db.document.create({data:{case_id:id,owner_id:admin.id,kind:'proof_of_delivery',filename:'human-test.pdf',s3_key:'test-only',mime_type:'application/pdf',size_bytes:100n}});docs.push(proof.id);return{id,shipment,proof};}
 try{
  await db.user.createMany({data:actors});const c=await setup();
  for(const actor of [client,adv])await assert.rejects(state.deliver(actor,c.id,{pod_document_id:c.proof.id}),{status:403});
  await assert.rejects(state.deliver(admin,c.id,{pod_document_id:c.proof.id,delivered_at:'not a date'}),{status:400});
  await db.document.update({where:{id:c.proof.id},data:{simulated:true}});
  await assert.rejects(state.deliver(admin,c.id,{pod_document_id:c.proof.id}),{status:400});
  await db.document.update({where:{id:c.proof.id},data:{simulated:false}});
  const when='2026-11-01T12:34:00+05:30';await state.deliver(admin,c.id,{pod_document_id:c.proof.id,received_by:'  Delivery recipient  ',delivered_at:when});
  const shipment=await db.shipment.findUnique({where:{id:c.shipment.id}});assert.equal(shipment.received_by,'Delivery recipient');assert.equal(shipment.delivered_at.toISOString(),new Date(when).toISOString());assert.equal(shipment.simulated,false);assert.equal(shipment.pod_document_id,c.proof.id);
  const event=await db.caseEvent.findFirst({where:{case_id:c.id,to_status:'completed'}});assert.equal(event.source,'real');assert.equal(event.actor_id,admin.id);assert.equal(event.payload.received_by,'Delivery recipient');assert.equal(event.payload.delivered_at,new Date(when).toISOString());
  await assert.rejects(state.deliver(admin,c.id,{pod_document_id:c.proof.id,received_by:'Overwrite'}),{status:409});
  await assert.rejects(state.deliver({...admin,trigger:'system',source:'simulated'},c.id,{pod_document_id:c.proof.id}),{status:409});
  assert.equal(await db.caseEvent.count({where:{case_id:c.id,to_status:'completed'}}),1);
  assert.equal((await db.shipment.findUnique({where:{id:c.shipment.id}})).received_by,'Delivery recipient');
  const blank=await setup();await state.deliver(admin,blank.id,{pod_document_id:blank.proof.id,received_by:'  '});assert.equal((await db.shipment.findUnique({where:{id:blank.shipment.id}})).received_by,null);
  const concurrent=await setup();const outcomes=await Promise.allSettled([state.deliver(admin,concurrent.id,{pod_document_id:concurrent.proof.id}),state.deliver(admin,concurrent.id,{pod_document_id:concurrent.proof.id})]);assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);assert.equal(outcomes.find(r=>r.status==='rejected').reason.status,409);
  const simulated=await setup();await db.document.update({where:{id:simulated.proof.id},data:{simulated:true}});await state.deliver({...admin,trigger:'system',source:'simulated'},simulated.id,{pod_document_id:simulated.proof.id});assert.equal((await db.shipment.findUnique({where:{id:simulated.shipment.id}})).simulated,true);
 }finally{await db.notification.deleteMany({where:{OR:[{case_id:{in:ids}},{user_id:{in:actors.map(a=>a.id)}}]}});await db.adminAction.deleteMany({where:{subject_id:{in:ids}}});await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});await db.shipment.deleteMany({where:{case_id:{in:ids}}});await db.document.deleteMany({where:{id:{in:docs}}});await db.case.deleteMany({where:{id:{in:ids}}});await db.user.deleteMany({where:{id:{in:actors.map(a=>a.id)}}});await db.$disconnect();}
});
test('completed case is excluded by timer and simulator returns without authentication/upload',async()=>{
 const oldFetch=global.fetch;global.fetch=()=>{throw Error('Completed case must not call HTTP');};
 try{let queried;const simulator=new SimulatedAdminUi({getClient:async()=>({case:{findFirst:async({where})=>{queried=where;return null;}}})},{});await simulator.confirmDelivery(randomUUID());assert.equal(queried.status,'dispatched');
 const timer=new DemoProgression({getClient:async()=>({case:{findMany:async({where})=>{assert.ok(!where.status.in.includes('completed'));return[];}}})},{},{},{});assert.equal(timer.due('completed'),null);await timer.tick();
 }finally{global.fetch=oldFetch;}
});
test('header retains the case pricing id and captured historical payment, independent of new prices', {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),id=randomUUID(),client=randomUUID(),old=randomUUID(),current=randomUUID();
 try{await db.user.create({data:{id:client,cognito_sub:randomUUID(),role:'client',full_name:'Historical price test'}});await db.servicePricing.createMany({data:[{id:old,service_code:'legal_notice',tier:'urgent',base_amount_paise:137700n,effective_from:new Date('2020-01-01'),effective_to:new Date('2021-01-01')},{id:current,service_code:'legal_notice',tier:'urgent',base_amount_paise:99900n}]});await db.case.create({data:{id,reference:'PRICE-'+id,service_code:'legal_notice',client_id:client,pricing_id:old}});await db.payment.create({data:{case_id:id,payer_id:client,purpose:'service_fee',base_amount_paise:137700n,gst_paise:24786n,total_paise:162486n,status:'captured',idempotency_key:randomUUID()}});
 const result=await new AdminCaseDetailRepository({getClient:async()=>db}).get({id:randomUUID(),role:'admin'},id);assert.equal(result.pricing.base_amount_paise,'137700');assert.equal(result.payments[0].total_paise,'162486');
 }finally{await db.payment.deleteMany({where:{case_id:id}});await db.case.deleteMany({where:{id}});await db.servicePricing.deleteMany({where:{id:{in:[old,current]}}});await db.user.deleteMany({where:{id:client}});await db.$disconnect();}
});
