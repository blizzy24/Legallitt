const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {SupportSettings}=require('../dist/src/support/support-settings'),{ReportTariffs}=require('../dist/src/service-reports/report-tariffs');
const {seedRound2BuiltServices}=require('../dist/prisma/seed-round2');
const {ServiceReportsService}=require('../dist/src/service-reports/service-reports.service');
const {reportDeadline}=require('../dist/src/service-reports/report-workflow');
const {supportHours,supportCallbackPromise,redactPrivatePhones}=require('@legalitt/shared');

test('Round 2 settings: confirmed exact-paisa prices, insert-only histories, stale admin edits and role isolation',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db},actors=['admin','client','advocate'].map(role=>({id:randomUUID(),role})),[admin,client,advocate]=actors;
 const before={prices:await db.servicePricing.findMany(),fees:await db.feePolicy.findMany(),workflow:await db.reportWorkflowPolicy.findMany(),support:await db.supportPolicy.findMany()};
 const added=async(model,rows)=>(await model.findMany({where:{id:{notIn:rows.map(r=>r.id)}}})).map(r=>r.id);
 try{
  await db.user.createMany({data:actors.map(a=>({...a,cognito_sub:'round2-settings-'+a.id,full_name:'TEST Round 2 settings'}))});
  await seedRound2BuiltServices(db);await seedRound2BuiltServices(db);
  const reports=new ServiceReportsService(prisma,{}, {}, {}),tariffs=new ReportTariffs(prisma),support=new SupportSettings(prisma);
  await t.test('all four tariffs are confirmed and all durations share the service tariff',async()=>{
   for(const [code,bases,totals] of [['property_search',['49900','99900'],['73603','147353']],['document_forensic',['149900','299900'],['221103','442353']]]){
    const p=await reports.pricing(code);assert.equal(p.confirmed,true);assert.deepEqual(p.tiers.map(v=>v.base_amount_paise),bases);assert.deepEqual(p.tiers.map(v=>v.total_paise),totals);
    const row=await db.servicePricing.findUnique({where:{id:p.tiers[0].pricing_id}});assert.equal(row.variant,null,'15/30/full duration does not select a tariff');
   }
   for(const row of before.prices)assert.deepEqual(await db.servicePricing.findUnique({where:{id:row.id}}),row,'historical tariffs never rewritten');
   const p=(await reports.pricing('document_forensic')).workflow.config;assert.equal(p.turnaround.urgent.unit,'calendar_days');
   assert.equal(reportDeadline(new Date('2026-11-13T10:00:00Z'),p,'urgent').toISOString(),'2026-11-17T10:00:00.000Z');
  });
  await t.test('support policy and tariffs reject every non-admin write; valid edits append and stale edits fail',async()=>{
   const current=await support.read();assert.match(supportHours(current.config),/Mon–Sat/);assert.equal(supportCallbackPromise(current.config),"We'll call you back within 24 hours.");
   const prices=await tariffs.read(admin,'property_search'),price=prices.find(p=>p.confirmed&&p.tier==='ordinary');
   const input={tier:'ordinary',base_pricing_id:price.id,base_amount_paise:'50001',reason:'TEST exact-paisa version'};
   for(const a of [client,advocate]){await assert.rejects(support.save(a,{base_version:current.version,config:current.config}),{status:403});await assert.rejects(tariffs.read(a,'property_search'),{status:403});await assert.rejects(tariffs.save(a,'property_search',input),{status:403});}
   const next=await support.save(admin,{base_version:current.version,config:{...current.config,callback_hours:23}});assert.equal(next.version,current.version+1);assert.deepEqual((await db.supportPolicy.findUnique({where:{id:current.id}})).config,current.config);
   await assert.rejects(support.save(admin,{base_version:current.version,config:current.config}),{status:409});
   const edited=await tariffs.save(admin,'property_search',input);assert.equal(edited.base_amount_paise,50001n);assert.equal((await db.servicePricing.findUnique({where:{id:price.id}})).base_amount_paise,49900n);
   await assert.rejects(tariffs.save(admin,'property_search',input),{status:409});await seedRound2BuiltServices(db);assert.equal((await reports.pricing('property_search')).tiers[0].pricing_id,edited.id,'rerun preserves later admin override');
  });
 }finally{
  const prices=await added(db.servicePricing,before.prices),fees=await added(db.feePolicy,before.fees),workflow=await added(db.reportWorkflowPolicy,before.workflow),support=await added(db.supportPolicy,before.support);
  await db.adminAction.deleteMany({where:{admin_id:admin.id}});await db.servicePricing.deleteMany({where:{id:{in:prices}}});await db.feePolicy.deleteMany({where:{id:{in:fees}}});await db.reportWorkflowPolicy.deleteMany({where:{id:{in:workflow}}});await db.supportPolicy.deleteMany({where:{id:{in:support}}});await db.user.deleteMany({where:{id:{in:actors.map(a=>a.id)}}});await db.$disconnect();
 }
});
test('Known private phones are hidden in nested events and international formatting, while other numbers remain',()=>{
 const raw={contact:{mobile:'+91 91234 56789'},body:'Call 91234-56789 or +91 (91234) 56789',noticee:'9000011111',amount:'49900',created_at:new Date('2026-11-13')};
 const out=redactPrivatePhones(raw,['+919123456789']);assert.doesNotMatch(JSON.stringify(out),/91234/);assert.equal(out.noticee,raw.noticee);assert.equal(out.amount,'49900');assert.equal(out.created_at,raw.created_at);assert.equal(raw.contact.mobile,'+91 91234 56789');
});
