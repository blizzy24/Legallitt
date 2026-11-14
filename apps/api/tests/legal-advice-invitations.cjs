const {test}=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {LegalAdviceInvitations}=require('../dist/src/consultations/legal-advice-invitations');
const manifest=require('../prisma/legal-advice-rebuild.json');
test('Legal Advice invitation race has exactly one winner; foreign invitations stay private',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const url=new URL(process.env.LEGALITT_TEST_DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));assert.match(url.pathname,/test$/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:url.href})});
 const users=['client','client','advocate','advocate','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST Advice '+role}));
 const [client,other,a,b,wrongTier,admin]=users,id=randomUUID(),sent=[];
 const service=new LegalAdviceInvitations({getClient:async()=>db},{send:async(tx,n)=>{sent.push(n);return {id:randomUUID(),simulated:true};}});
 let policy;
 try{
  await db.user.createMany({data:users});
  for(const advocate of [a,b,wrongTier])await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved',years_experience:advocate===wrongTier?9:3}});
  const latest=await db.legalAdvicePolicy.findFirst({orderBy:{version:'desc'}});
  policy=await db.legalAdvicePolicy.create({data:{version:(latest?.version??0)+1,config:manifest,reason:'TEST race',created_by:admin.id}});
  await db.case.create({data:{id,reference:'TEST-LA-'+id,service_code:'legal_advice',client_id:client.id,status:'paid'}});
  await db.legalAdviceBooking.create({data:{case_id:id,policy_id:policy.id,mode:'audio',tier_code:'emerging',chosen_advocate_id:a.id,requested_at:new Date(Date.now()+86400000)}});
  await assert.rejects(service.assign(client,id,{}),{status:403});
  await assert.rejects(service.assign(admin,randomUUID(),{expected_revision:0,advocate_ids:[a.id],reason:'TEST'}),{status:404});
  await assert.rejects(service.assign(admin,id,{expected_revision:0,advocate_ids:[wrongTier.id],reason:'TEST'}),{status:409});
  await service.assign(admin,id,{expected_revision:0,advocate_ids:[a.id,b.id],reason:'TEST'});
  assert.equal((await service.inbox(wrongTier)).items.length,0);
  const invites=await db.legalAdviceInvitation.findMany({where:{case_id:id}}),ia=invites.find(x=>x.advocate_id===a.id),ib=invites.find(x=>x.advocate_id===b.id);
  await assert.rejects(service.decide(client,ia.id,{decision:'accept'}),{status:403});
  await assert.rejects(service.decide(wrongTier,ia.id,{decision:'accept'}),{status:404});
  const result=await Promise.allSettled([service.decide(a,ia.id,{decision:'accept'}),service.decide(b,ib.id,{decision:'accept'})]);
  assert.equal(result.filter(x=>x.status==='fulfilled').length,1);assert.equal(result.find(x=>x.status==='rejected').reason.status,409);
  const winner=await db.legalAdviceInvitation.findFirst({where:{case_id:id,state:'accepted'}}),loser=await db.legalAdviceInvitation.findFirst({where:{case_id:id,state:'superseded'}});
  assert.ok(winner&&loser);assert.equal((await db.case.findUnique({where:{id}})).advocate_id,winner.advocate_id);
  assert.equal((await db.legalAdviceBooking.findUnique({where:{case_id:id}})).accepted_advocate_id,winner.advocate_id);
  assert.ok(sent.some(n=>n.user_id===loser.advocate_id&&n.kind==='legal_advice_invitation_closed'));
  await service.decide(users.find(x=>x.id===winner.advocate_id),winner.id,{decision:'accept'});
  assert.equal(await db.caseEvent.count({where:{case_id:id,type:'legal_advice_accepted'}}),1);
  assert.ok((await service.inbox(a)).items.every(x=>!('phone' in x)&&!('details' in x)));
  await assert.rejects(service.inbox(other),{status:403});
 }finally{
  await db.caseEvent.deleteMany({where:{case_id:id}});await db.legalAdviceEvent.deleteMany({where:{case_id:id}});await db.legalAdviceInvitation.deleteMany({where:{case_id:id}});await db.legalAdviceBooking.deleteMany({where:{case_id:id}});await db.case.deleteMany({where:{id}});
  if(policy)await db.legalAdvicePolicy.delete({where:{id:policy.id}});
  await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(x=>x.id)}}});await db.user.deleteMany({where:{id:{in:users.map(x=>x.id)}}});await db.$disconnect();
 }
});
