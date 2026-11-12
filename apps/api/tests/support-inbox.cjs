const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {SupportService}=require('../dist/src/support/support.service');
const {NoticeMessages}=require('../dist/src/cases/notice-messages');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');

test('D-26/D-28/D-42: support tickets, callbacks, chat, admin inbox and unified messages inbox stay private',
 {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
  const users=['client','client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST SUPPORT '+role}));
  const [client,other,advocate,otherAdvocate,admin]=users,caseIds=[];
  const inbox=new InAppNotifications(new SimulatedNotifications());
  const support=new SupportService(prisma,inbox),threads=new NoticeMessages(prisma),state=new CaseStateMachine(prisma,inbox);
  try{
    await db.user.createMany({data:users});
    await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved',city:'Indore'}});
    const mk=async(owner,adv)=>{const c=await state.create(owner,{service_code:'property_search'});caseIds.push(c.id);
      await db.case.update({where:{id:c.id},data:{advocate_id:adv?.id??null,status:adv?'advocate_accepted':'draft'}});return c;};
    const mine=await mk(client,advocate),theirs=await mk(other,otherAdvocate);await mk(client,null);

    await t.test('contact support ticket, admin reply appears in client inbox under support, close',async()=>{
      await assert.rejects(support.createTicket(client,{subject:'payment',related_to:'payment',description:'short',contact_method:'email'}),{status:400});
      await assert.rejects(support.createTicket(client,{subject:'payment',related_to:'case',description:'Where is my refund please?',contact_method:'email',case_id:theirs.id}),{status:404},'cannot link another client’s case');
      const ticket=await support.createTicket(client,{subject:'payment',related_to:'case',description:'Where is my refund please?',contact_method:'email',case_id:mine.id});
      assert.equal(ticket.subject,'Payment or refund question');assert.equal(ticket.messages.length,1);
      const list=await support.adminList(admin,{});const row=list.items.find(i=>i.id===ticket.id);assert.ok(row.waiting_since);assert.equal(row.requester.name,'TEST SUPPORT client');
      await assert.rejects(support.adminList(client,{}),{status:403});
      await assert.rejects(support.one(other,ticket.id),{status:404});
      await assert.rejects(support.one(advocate,ticket.id),{status:404});
      await assert.rejects(support.reply(other,ticket.id,{body:'hi'}),{status:404});
      await assert.rejects(support.markRead(other,ticket.id),{status:404});
      const detail=await support.adminOne(admin,ticket.id);assert.equal(detail.case.reference,mine.reference);
      await support.adminReply(admin,ticket.id,{body:'We are checking this for you.'});
      assert.equal((await support.adminList(admin,{})).items.find(i=>i.id===ticket.id).waiting_since,null);
      const items=(await support.inbox(client,{})).items;const s=items.find(i=>i.ticket_id===ticket.id);
      assert.equal(s.kind,'support');assert.equal(s.unread,1);assert.equal(s.last_message.body,'We are checking this for you.');
      assert.equal((await support.inbox(other,{})).items.some(i=>i.ticket_id===ticket.id),false);
      await support.markRead(client,ticket.id);assert.equal((await support.inbox(client,{})).items.find(i=>i.ticket_id===ticket.id).unread,0);
      await support.adminClose(admin,ticket.id);
      await assert.rejects(support.reply(client,ticket.id,{body:'thanks'}),{status:409});
      assert.ok(await db.notification.findFirst({where:{user_id:client.id,kind:'support_reply'}}));
    });
    await t.test('callback is idempotent while open; chat reuses one open thread',async()=>{
      await assert.rejects(support.requestCallback(client,{name:'X',phone:'abc'}),{status:400});
      const a=await support.requestCallback(client,{name:'TEST',phone:'+91 90000 00000'}),b=await support.requestCallback(client,{name:'TEST',phone:'+91 90000 00000'});
      assert.equal(a.id,b.id);assert.equal(a.kind,'callback');
      const c1=await support.chat(client,{body:'Hello'}),c2=await support.chat(client,{body:'Anyone there?'});
      assert.equal(c1.id,c2.id);assert.equal(c2.messages.length,2);
      assert.equal((await support.currentChat(other)),null);
      await assert.rejects(support.chat(admin,{body:'x'}),{status:403});
    });
    await t.test('inbox lists only member case threads; search covers message text; unread is per reader',async()=>{
      const thread=await threads.thread(client,mine.id);
      await threads.send(advocate,thread.id,{body:'Please upload the sale deed.'});
      const c=(await support.inbox(client,{})).items.find(i=>i.case_id===mine.id);
      assert.equal(c.unread,1);assert.equal(c.title,'TEST SUPPORT advocate');assert.equal(c.verified,true);
      assert.equal((await support.inbox(client,{})).items.some(i=>i.case_id===theirs.id),false);
      assert.equal((await support.inbox(client,{q:'sale deed'})).items.filter(i=>i.kind==='case').length,1);
      assert.equal((await support.inbox(client,{q:'nothing-matches-this'})).items.length,0);
      const adv=(await support.inbox(advocate,{})).items;assert.deepEqual(adv.filter(i=>i.kind==='case').map(i=>i.case_id),[mine.id]);
      assert.equal(adv.find(i=>i.case_id===mine.id).unread,0,'own message is not unread');
      assert.equal((await support.inbox(otherAdvocate,{})).items.some(i=>i.case_id===mine.id),false);
      await assert.rejects(threads.list(other,thread.id),{status:404});await assert.rejects(threads.list(otherAdvocate,thread.id),{status:404});
      await assert.rejects(support.inbox(admin,{}),{status:403});
    });
  }finally{
    const tickets=await db.supportTicket.findMany({where:{user_id:{in:users.map(u=>u.id)}},select:{id:true}});
    await db.supportMessage.deleteMany({where:{ticket_id:{in:tickets.map(t=>t.id)}}});
    await db.adminAction.deleteMany({where:{subject_id:{in:tickets.map(t=>t.id)}}});
    await db.supportTicket.deleteMany({where:{id:{in:tickets.map(t=>t.id)}}});
    const ths=await db.messageThread.findMany({where:{case_id:{in:caseIds}},select:{id:true}});
    await db.message.deleteMany({where:{thread_id:{in:ths.map(t=>t.id)}}});await db.messageThread.deleteMany({where:{case_id:{in:caseIds}}});
    await db.notification.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});
    await db.reportWorkflow.deleteMany({where:{case_id:{in:caseIds}}});
    await db.caseEvent.deleteMany({where:{case_id:{in:caseIds}}});await db.case.deleteMany({where:{id:{in:caseIds}}});
    await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
    await db.$disconnect();
  }
});
