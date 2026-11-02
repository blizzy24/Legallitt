const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {NotificationRepository,NotificationsController}=require('../dist/src/notifications/notifications.controller');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');
const {notifyCaseTransition}=require('../dist/src/notifications/case-notifications');
const inbox=()=>new InAppNotifications(new SimulatedNotifications());
test('real role inboxes: lifecycle recipients, atomicity, pagination, unread ownership and HTTP auth', {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
 const users=['client','advocate','admin','client'].map(role=>({id:randomUUID(),cognito_sub:randomUUID(),role,full_name:'Notification test '+role}));
 const [client,advocate,admin,other]=users,ids=[];const prisma={getClient:async()=>db},state=new CaseStateMachine(prisma,inbox()),repo=new NotificationRepository(prisma);
 const make=async(status)=>{const id=randomUUID();ids.push(id);return db.case.create({data:{id,reference:'INBOX-'+id,service_code:'legal_notice',client_id:client.id,advocate_id:advocate.id,status}});};
 let app;
 try {
  await db.user.createMany({data:users});
  for(const [from,to,actor,kinds] of [
   ['assigning','assigned',admin,[[client,'advocate_assigned'],[advocate,'case_assigned']]],
   ['in_progress','client_review',advocate,[[client,'draft_ready']]],
   ['client_review','approved',client,[[advocate,'client_approved']]],
   ['client_review','changes_requested',client,[[advocate,'changes_requested']]],
   ['assigned','advocate_declined',advocate,[[admin,'advocate_declined']]],
   ['dispatching','dispatched',advocate,[[client,'notice_dispatched'],[admin,'delivery_confirmation_needed']]],
   ['dispatched','completed',admin,[[client,'notice_delivered']]],
  ]){
   const row=await make(from);await state.transition(actor,row.id,to);
   const messages=await db.notification.findMany({where:{case_id:row.id,user_id:{in:users.map(u=>u.id)}}});
   assert.deepEqual(messages.map(n=>[n.user_id,n.kind]).sort(),kinds.map(([u,k])=>[u.id,k]).sort());
   assert.ok(messages.every(n=>n.simulated===false&&n.read_at===null&&n.body===row.reference));
   await assert.rejects(state.transition(actor,row.id,to),{status:409});
   assert.equal(await db.notification.count({where:{case_id:row.id,user_id:{in:users.map(u=>u.id)}}}),messages.length);
  }
  const paid=await make('paid');await db.$transaction(tx=>notifyCaseTransition(tx,inbox(),paid));
  assert.equal(await db.notification.count({where:{case_id:paid.id,user_id:admin.id,kind:'assignment_needed'}}),1);
  const rollback=await make('in_progress');
  const broken=new CaseStateMachine(prisma,{send:async(tx,input)=>{await inbox().send(tx,input);throw Error('Inbox transaction failure');}});
  await assert.rejects(broken.transition(advocate,rollback.id,'client_review'),/Inbox transaction failure/);
  assert.equal((await db.case.findUnique({where:{id:rollback.id}})).status,'in_progress');
  assert.equal(await db.notification.count({where:{case_id:rollback.id}}),0);assert.equal(await db.caseEvent.count({where:{case_id:rollback.id}}),0);
  const tied=await make('assigned');
  await db.notification.createMany({data:Array.from({length:4},()=>({user_id:client.id,case_id:tied.id,kind:'test',title:'Tied timestamp test'}))});
  await db.$executeRaw`UPDATE notifications SET created_at = '2030-01-01T01:02:03.123456Z'::timestamptz WHERE case_id = ${tied.id}::uuid`;
  let cursor;const seen=[];
  do {const page=await repo.list(client,{limit:'2',...(cursor?{cursor}:{})});seen.push(...page.items.map(n=>n.id));cursor=page.next_cursor;}while(cursor);
  assert.equal(seen.length,new Set(seen).size);
  assert.equal(seen.length,await db.notification.count({where:{user_id:client.id}}));
  const first=await repo.list(client,{limit:'2'});assert.equal(first.items.length,2);assert.ok(first.next_cursor);assert.ok(first.unread_count>2);
  const second=await repo.list(client,{limit:'2',cursor:first.next_cursor});assert.ok(second.items.every(n=>!first.items.some(p=>p.id===n.id)));
  await assert.rejects(repo.list(client,{cursor:'bad'}),{status:400});
  const row=first.items[0];await assert.rejects(repo.read(other,row.id),{status:404});await assert.rejects(repo.read(admin,row.id),{status:404});
  const marked=await repo.read(client,row.id);assert.ok(marked.read_at);assert.deepEqual(await repo.read(client,row.id),marked);
  assert.equal((await repo.list(client,{})).unread_count,first.unread_count-1);
  const advocateBefore=(await repo.list(advocate,{})).unread_count;await repo.readAll(client);
  assert.equal((await repo.list(client,{})).unread_count,0);assert.equal((await repo.list(advocate,{})).unread_count,advocateBefore);
  assert.equal((await repo.list(other,{})).items.length,0);
  // Lost case membership invalidates both the list and a cached notification URL.
  const advRow=(await repo.list(advocate,{})).items[0];await db.case.update({where:{id:advRow.case_id},data:{advocate_id:null}});
  assert.ok(!(await repo.list(advocate,{})).items.some(n=>n.id===advRow.id));await assert.rejects(repo.read(advocate,advRow.id),{status:404});
  const {Module}=require('@nestjs/common'),{NestFactory}=require('@nestjs/core'),{AuthGuard}=require('../dist/src/auth/auth.controller'),{AuthService}=require('../dist/src/auth/auth.service');
  class TestModule{};Module({controllers:[NotificationsController],providers:[AuthGuard,{provide:NotificationRepository,useValue:repo},{provide:AuthService,useValue:{identity:async token=>{const u=users.find(u=>u.id===token);if(!u)throw Error('bad token');return u;}}}]})(TestModule);
  app=await NestFactory.create(TestModule,{logger:false});await app.listen(0,'127.0.0.1');const url=await app.getUrl();
  assert.equal((await fetch(url+'/api/v1/notifications')).status,401);
  const response=await fetch(url+'/api/v1/notifications',{headers:{Authorization:'Bearer '+client.id}});assert.equal(response.status,200);assert.equal((await response.json()).unread_count,0);
  assert.equal((await fetch(url+'/api/v1/notifications/'+row.id+'/read',{method:'POST',headers:{Authorization:'Bearer '+other.id}})).status,404);
 }finally{
  if(app)await app.close();await db.notification.deleteMany({where:{OR:[{case_id:{in:ids}},{user_id:{in:users.map(u=>u.id)}}]}});
  await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});await db.$disconnect();
 }
});
