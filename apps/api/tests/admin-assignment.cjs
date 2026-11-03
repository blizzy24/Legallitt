const inbox = () => new (require('../dist/src/notifications/in-app-notifications').InAppNotifications)(new (require('../dist/src/notifications/simulated-notifications').SimulatedNotifications)());
const test=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client');
const {PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {AdminAdvocatesRepository}=require('../dist/src/admin-cases/admin-advocates');
const {DemoProgression}=require('../dist/src/demo/demo-progression');

test('picker eligibility/load, real assignment event, and stale timer cannot overwrite a human', {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
 const prisma={getClient:async()=>db}, state=new CaseStateMachine(prisma, inbox()), repo=new AdminAdvocatesRepository(prisma);
 const users=['client','admin','advocate','advocate','advocate','advocate'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'Assignment test'}));
 const [client,admin,approved,pending,suspended,other]=users;
 const cases=[];
 const makeCase=async(status,advocate_id=null)=>{const id=randomUUID();cases.push(id);await db.case.create({data:{id,reference:'ASSIGNTEST-'+id,service_code:'legal_notice',client_id:client.id,status,advocate_id}});return id;};
 try {
  await db.user.createMany({data:users});
  for(const [user,verification] of [[approved,'approved'],[pending,'in_review'],[suspended,'approved'],[other,'approved']])
   await db.advocateProfile.create({data:{user_id:user.id,verification,practice_areas:['Property Law'],city:'Indore'}});
  await db.user.update({where:{id:suspended.id},data:{status:'suspended'}});
  for(const status of ['assigned','client_review','dispatched','completed','cancelled','refunded','advocate_declined'])await makeCase(status,approved.id);
  const items=(await repo.list(admin)).items;
  assert.equal(items.find(a=>a.id===approved.id).open_cases,3);
  assert.equal(items.find(a=>a.id===other.id).open_cases,0);
  assert.ok(!items.some(a=>[client.id,admin.id,pending.id,suspended.id].includes(a.id)));
  assert.deepEqual(items.find(a=>a.id===approved.id).practice_areas,['Property Law']);
  assert.equal(items.find(a=>a.id===approved.id).city,'Indore');
  await assert.rejects(repo.list(client),{status:403});
  await assert.rejects(repo.list(approved),{status:403});
  const id=await makeCase('assigning');
  for(const invalid of [client,pending,suspended])await assert.rejects(state.assign(admin,id,{advocate_id:invalid.id}),{status:400});
  await assert.rejects(state.assign(client,id,{advocate_id:approved.id}),{status:403});
  // Approval revoked after picker loading must be rechecked on assignment.
  await db.advocateProfile.update({where:{user_id:approved.id},data:{verification:'rejected'}});
  await assert.rejects(state.assign(admin,id,{advocate_id:approved.id}),{status:400});
  await db.advocateProfile.update({where:{user_id:approved.id},data:{verification:'approved'}});
  const assigned=await state.assign(admin,id,{advocate_id:approved.id});
  assert.equal(assigned.status,'assigned');assert.equal(assigned.advocate_id,approved.id);
  const event=await db.caseEvent.findFirstOrThrow({where:{case_id:id,to_status:'assigned'}});
  assert.equal(event.actor_id,admin.id);assert.equal(event.actor_role,'admin');assert.equal(event.source,'real');assert.equal(event.from_status,'assigning');
  await assert.rejects(state.assign({...admin,trigger:'system',source:'simulated'},id,{advocate_id:other.id}),{status:409});
  assert.equal((await db.case.findUnique({where:{id}})).advocate_id,approved.id);
  assert.equal(await db.caseEvent.count({where:{case_id:id,to_status:'assigned'}}),1);
  const declined=await makeCase('advocate_declined',approved.id);
  await assert.rejects(state.assign(admin,declined,{advocate_id:other.id}),{status:409});
  const race=await makeCase('paid');
  const outcomes=await Promise.allSettled([state.assign(admin,race,{advocate_id:approved.id}),state.assign({...admin,trigger:'system',source:'simulated'},race,{advocate_id:other.id})]);
  assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(outcomes.find(r=>r.status==='rejected').reason.status,409);
  assert.equal(await db.caseEvent.count({where:{case_id:race,to_status:'assigned'}}),1);
 } finally {
  await db.notification.deleteMany({where:{OR:[{case_id:{in:cases}},{user_id:{in:users.map(u=>u.id)}}]}});
  await db.adminAction.deleteMany({where:{subject_id:{in:cases}}});
  await db.caseEvent.deleteMany({where:{case_id:{in:cases}}});await db.case.deleteMany({where:{id:{in:cases}}});
  await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});await db.$disconnect();
 }
});
test('demo timer does not assign already-assigned cases',async()=>{
 const config={assignDelayMs:1,draftStartDelayMs:1,draftDoneDelayMs:1,dispatchDelayMs:1,shipmentStepMs:1,deliveryConfirmDelayMs:1};
 const timer=new DemoProgression({getClient:async()=>({case:{findMany:async()=>[{id:'case',status:'assigned',advocate_id:'human-choice',shipments_case_id_relations:[],case_events_case_id_relations:[{created_at:new Date(0)}]}]}})}, {}, {}, config);
 timer.session=async role=>({id:'seeded-'+role,role});
 let called=false;timer.act=async()=>{called=true;};
 await timer.tick();assert.equal(called,false);
 assert.equal(timer.due('paid').actor,'admin');assert.equal(timer.due('assigned').actor,'advocate');
 assert.equal(timer.due('assigning'),null);assert.equal(timer.due('advocate_declined'),null);
});
