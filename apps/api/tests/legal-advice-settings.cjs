const {test}=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {LegalAdviceSettings}=require('../dist/src/consultations/legal-advice-settings');
const {seedLegalAdvice}=require('../dist/prisma/seed-legal-advice');
const manifest=require('../prisma/legal-advice-rebuild.json');
test('Legal Advice policy: roles, stale concurrent edits, immutable versions and repeatable seed',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const url=new URL(process.env.LEGALITT_TEST_DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));assert.match(url.pathname,/test$/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:url.href})}),service=new LegalAdviceSettings({getClient:async()=>db});
 const admin={id:randomUUID(),role:'admin'},client={id:randomUUID(),role:'client'},advocate={id:randomUUID(),role:'advocate'};
 try{
  await db.user.create({data:{id:admin.id,role:'admin',cognito_sub:randomUUID(),full_name:'TEST Legal Advice Settings'}});
  await seedLegalAdvice(db);
  const latest=await db.legalAdvicePolicy.findFirst({orderBy:{version:'desc'}}),version=latest.version+1;
  await db.legalAdvicePolicy.create({data:{version,config:{...manifest,version},created_by:admin.id,reason:'TEST isolated policy fixture'}});
  const original=await service.read();
  const config={...original.config,version:original.version+1,maximum_pause_minutes:9},body={expected_version:original.version,config,reason:'TEST edit scheduling'};
  for(const actor of [client,advocate])await assert.rejects(service.save(actor,body),{status:403});
  const outcomes=await Promise.allSettled([service.save(admin,body),service.save(admin,body)]);
  assert.equal(outcomes.filter(x=>x.status==='fulfilled').length,1);assert.equal(outcomes.find(x=>x.status==='rejected').reason.status,409);
  const current=await service.read();assert.equal(current.version,config.version);assert.equal(current.config.maximum_pause_minutes,9);
  assert.deepEqual((await db.legalAdvicePolicy.findUnique({where:{id:original.id}})).config,original.config);
  await seedLegalAdvice(db);assert.equal((await service.read()).id,current.id);
  await assert.rejects(service.save(admin,{...body,config:{...manifest,tariffs:[]}}),{status:400});
  const slots=await service.slots(client,new Date(Date.now()+86400000).toISOString().slice(0,10));assert.equal(slots.requested_only,true);assert.equal(slots.version,current.version);
  for(const actor of [admin,advocate])await assert.rejects(service.slots(actor,'2026-11-20'),{status:403});
 }finally{await db.legalAdvicePolicy.deleteMany({where:{created_by:admin.id}});await db.user.deleteMany({where:{id:admin.id}});await db.$disconnect();}
});
