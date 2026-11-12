const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {NoticeReminders}=require('../dist/src/cases/notice-reminders'),{NoticeFlowService}=require('../dist/src/cases/notice-flow.service'),{CaseRepository}=require('../dist/src/cases/case-repository');
test('pinned reminder policy, visible overdue work and reassignment preserve history without automatic progression',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),sent=[],notifications={send:async(_tx,value)=>{sent.push(value);return {};}},prisma={getClient:async()=>db};
 try{
  const actors=['client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role})),[client,old,next,admin]=actors;
  for(const a of actors)await db.user.create({data:{...a,full_name:'TEST notice reminders',cognito_sub:'test-'+a.id}});
  for(const a of [old,next])await db.advocateProfile.create({data:{user_id:a.id,verification:'approved',city:'Indore'}});
  const base=await db.noticeWorkflowPolicy.findFirstOrThrow({where:{version:1}}),last=await db.noticeWorkflowPolicy.findFirst({orderBy:{version:'desc'}});
  const policy=await db.noticeWorkflowPolicy.create({data:{version:last.version+1,effective_from:new Date('2099-01-01'),config:{...base.config,client_reminder_hours:[1,2],client_idle_admin_hours:3,deadline_alert_hours:1}}});
  const now=new Date(),c=await db.case.create({data:{reference:'TEST-reminder-'+randomUUID(),service_code:'legal_notice',client_id:client.id,advocate_id:old.id,status:'client_review',tier:'urgent'}});
  await db.noticeLifecycle.create({data:{case_id:c.id,policy_id:policy.id,contacts:{methods:['email'],fullName:'TEST',email:'test@example.invalid'}}});
  await db.caseEvent.create({data:{case_id:c.id,type:'draft_sent',from_status:'in_progress',to_status:'client_review',created_at:new Date(now.getTime()-4*3600000)}});
  const reminders=new NoticeReminders(prisma,notifications);await reminders.tick(now);
  const count=sent.filter(n=>n.case_id===c.id).length;assert.equal(sent.filter(n=>n.case_id===c.id&&n.user_id===client.id).length,2,'uses the pinned one/two hour test policy');assert.ok(sent.some(n=>n.case_id===c.id&&n.user_id===admin.id&&n.title==='Client has not responded'));
  await reminders.tick(now);assert.equal(sent.filter(n=>n.case_id===c.id).length,count);assert.equal((await db.case.findUnique({where:{id:c.id}})).status,'client_review','a reminder never approves a case');
  const work=await db.case.create({data:{reference:'TEST-overdue-'+randomUUID(),service_code:'legal_notice',client_id:client.id,advocate_id:old.id,status:'in_progress',tier:'urgent'}});
  await db.noticeLifecycle.create({data:{case_id:work.id,policy_id:policy.id,deadline_at:new Date(now.getTime()-3600000),contacts:{methods:['email']}}});
  await db.caseAssignment.create({data:{case_id:work.id,advocate_id:old.id,assigned_by:admin.id}});await reminders.tick(now);
  assert.ok(sent.some(n=>n.case_id===work.id&&n.user_id===admin.id&&n.title==='Legal Notice overdue'));
  const flow=new NoticeFlowService(prisma,{}, {},notifications);assert.equal((await flow.view(admin,work.id)).overdue,true);await flow.reassign(admin,work.id,{revision:0,advocate_id:next.id,reason:'TEST deadline missed'});
  assert.equal((await db.case.findUnique({where:{id:work.id}})).advocate_id,next.id);await assert.rejects(new CaseRepository(prisma).read(old,work.id),{status:404});
  const assignments=await db.caseAssignment.findMany({where:{case_id:work.id},orderBy:{assigned_at:'asc'}});assert.equal(assignments.length,2);assert.ok(assignments.find(a=>a.advocate_id===old.id).ended_at);assert.equal(assignments.find(a=>a.advocate_id===next.id).ended_at,null);
  assert.ok(sent.some(n=>n.case_id===work.id&&n.user_id===old.id&&n.kind==='case_reassigned'));assert.ok(sent.some(n=>n.case_id===work.id&&n.user_id===client.id&&n.body.includes('make sure your draft meets our standards')));
  await assert.rejects(flow.reassign(admin,work.id,{revision:0,advocate_id:old.id,reason:'stale'}),{status:409});
 }finally{await db.$disconnect();}
});
