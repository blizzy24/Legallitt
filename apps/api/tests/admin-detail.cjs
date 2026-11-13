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
  await assert.rejects(repo.get(client,id),{status:403});await assert.rejects(repo.get(adv,id),{status:403});
  assert.equal((await repo.get(admin,other)).service_code,'fir_draft');
  await assert.rejects(repo.get(client,other),{status:403});await assert.rejects(repo.get(adv,other),{status:403});
  await assert.rejects(repo.get(admin,randomUUID()),{status:404});await assert.rejects(repo.get(admin,'bad'),{status:400});
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

test('development seed: tagged through the real path, legacy seeds completed once and validated', {skip:!process.env.LEGALITT_TEST_DATABASE_URL}, async()=>{
 const {tagDevelopmentSeed,repairDevelopmentSeed,syncDevelopmentSeedSender}=require('../dist/src/cases/case-state-machine');
 const oldEnv=process.env.ENVIRONMENT,oldNode=process.env.NODE_ENV;
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
 const clientId=randomUUID(),seedKey='test-'+randomUUID(),freshKey='test-'+randomUUID();
 const pricing=await db.servicePricing.findFirstOrThrow({where:{service_code:'legal_notice',tier:'ordinary',variant:null,effective_to:null}});
 const intake={tier:'ordinary',details:{client:{fullName:'Sunita Mehra',mobile:'9000000101',address:'B-14, Malviya Nagar, Jaipur'},noticee:{fullName:'Rajeev Mehra',mobile:'9000000102',email:'rajeev@example.com',address:'22, Vaishali Nagar, Jaipur'},issueType:'family-dispute'},
  subject_matter:'Maintenance unpaid since June 2025.',subject_line:'Legal notice for non-payment of agreed maintenance',legal_demand:{selected:['Pay the outstanding maintenance.'],custom:''},sender:{salutation:'Mrs.',relation:'W/o',relative_name:'Rajeev Mehra'}};
 const pricingIdForTier=async()=>pricing.id;
 try {
  process.env.ENVIRONMENT='prod';process.env.NODE_ENV='production';
  await assert.rejects(tagDevelopmentSeed({},randomUUID(),seedKey),{status:503});
  await assert.rejects(repairDevelopmentSeed({},{seedKey,intake,pricingIdForTier}),{status:503});
  await assert.rejects(syncDevelopmentSeedSender({},seedKey,intake.sender),{status:503});
  process.env.ENVIRONMENT='dev';process.env.NODE_ENV='test';
  await db.user.create({data:{id:clientId,cognito_sub:randomUUID(),full_name:'Seed test',role:'client'}});
  // A legacy seed: written straight to assigning with placeholder intake and no pricing.
  const legacy=await db.case.create({data:{reference:'SEEDTEST-'+randomUUID(),service_code:'legal_notice',client_id:clientId,status:'assigning'}});
  await db.caseEvent.create({data:{case_id:legacy.id,type:'development_seed',source:'simulated',to_status:'assigning',payload:{actor:'system',seed_key:seedKey}}});
  assert.equal(await repairDevelopmentSeed(db,{seedKey:'absent-'+randomUUID(),intake,pricingIdForTier}),'absent');
  // The submit schemas still apply: an intake missing a required field is refused.
  await assert.rejects(repairDevelopmentSeed(db,{seedKey,intake:{...intake,subject_line:''},pricingIdForTier}));
  await assert.rejects(repairDevelopmentSeed(db,{seedKey,intake:{...intake,details:{...intake.details,noticee:{...intake.details.noticee,address:''}}},pricingIdForTier}));
  assert.equal(await repairDevelopmentSeed(db,{seedKey,intake,pricingIdForTier}),'repaired');
  assert.equal(await repairDevelopmentSeed(db,{seedKey,intake,pricingIdForTier}),'already');
  const after=await db.case.findUniqueOrThrow({where:{id:legacy.id}});
  assert.equal(after.status,'assigning');assert.equal(after.pricing_id,pricing.id);assert.equal(after.subject_line,intake.subject_line);
  assert.equal(after.matter_type,'family_dispute');assert.equal(after.details.noticee.address,intake.details.noticee.address);
  const sender=await db.caseParty.findFirstOrThrow({where:{case_id:legacy.id,kind:'sender'}});
  assert.equal(sender.age,null,'age is no longer collected by the notice seed');assert.equal(sender.salutation,'Mrs.');assert.equal(sender.relation,'W/o');assert.equal(sender.relative_name,'Rajeev Mehra');
  // Cases seeded before the intake gained a field get it from the seed source, once, audited.
  await db.caseParty.update({where:{id:sender.id},data:{salutation:null,relation:null,relative_name:'Ramesh Chandra Sharma'}});
  assert.deepEqual(await syncDevelopmentSeedSender(db,seedKey,intake.sender),['salutation','relation','relative_name']);
  assert.deepEqual(await syncDevelopmentSeedSender(db,seedKey,intake.sender),[]);
  assert.deepEqual(await syncDevelopmentSeedSender(db,'absent-'+randomUUID(),intake.sender),[]);
  const synced=await db.caseEvent.findMany({where:{case_id:legacy.id,type:'development_seed_sender_updated'}});
  assert.equal(synced.length,1);assert.equal(synced[0].source,'simulated');assert.deepEqual(synced[0].payload.changed,['salutation','relation','relative_name']);
  assert.equal((await db.caseParty.findUniqueOrThrow({where:{id:sender.id}})).relative_name,'Rajeev Mehra');
  const repairs=await db.caseEvent.findMany({where:{case_id:legacy.id,type:'development_seed_repaired'}});
  assert.equal(repairs.length,1);assert.equal(repairs[0].source,'simulated');assert.equal(repairs[0].to_status,'assigning');
  assert.deepEqual(repairs[0].payload.filled.sort(),['recipient_address','recipient_name','sender_address','sender_name','service_fee','subject']);
  // A case that went through submit is never rewritten.
  const fresh=await db.case.create({data:{reference:'SEEDTEST-'+randomUUID(),service_code:'legal_notice',client_id:clientId,status:'draft'}});
  await tagDevelopmentSeed(db,fresh.id,freshKey);await tagDevelopmentSeed(db,fresh.id,freshKey);
  assert.equal(await db.caseEvent.count({where:{type:'development_seed',payload:{path:['seed_key'],equals:freshKey}}}),1);
  await db.caseEvent.create({data:{case_id:fresh.id,type:'status_changed',from_status:'draft',to_status:'submitted'}});
  assert.equal(await repairDevelopmentSeed(db,{seedKey:freshKey,intake,pricingIdForTier}),'valid');
 }finally{
  const ids=(await db.case.findMany({where:{client_id:clientId},select:{id:true}})).map(c=>c.id);
  await db.caseParty.deleteMany({where:{case_id:{in:ids}}});await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});await db.user.deleteMany({where:{id:clientId}});await db.$disconnect();
  if(oldEnv===undefined)delete process.env.ENVIRONMENT;else process.env.ENVIRONMENT=oldEnv;
  if(oldNode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=oldNode;
 }
});
