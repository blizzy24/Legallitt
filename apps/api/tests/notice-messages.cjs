const {test}=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {NoticeMessages}=require('../dist/src/cases/notice-messages');
test('Notice chat persists both sides, checks case membership and records read receipts',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),service=new NoticeMessages({getClient:async()=>db});
 const actors=['client','advocate','advocate'].map(role=>({id:randomUUID(),role}));const [client,advocate,outsider]=actors;let id,thread;
 try{
  for(const a of actors)await db.user.create({data:{...a,cognito_sub:'chat-test-'+a.id,full_name:'Test identity'}});
  const c=await db.case.create({data:{reference:'CHAT-'+randomUUID(),service_code:'legal_notice',client_id:client.id,advocate_id:advocate.id,status:'in_progress'}});id=c.id;
  const threads=await Promise.all([service.thread(client,id),service.thread(advocate,id)]);assert.equal(threads[0].id,threads[1].id);thread=threads[0].id;
  await assert.rejects(service.thread(outsider,id),{status:404});await assert.rejects(service.list(outsider,thread),{status:404});
  await assert.rejects(service.send(client,thread,{body:''}),{status:400});await assert.rejects(service.send(client,thread,{body:'Test',sender_id:outsider.id}),{status:400});
  await assert.rejects(service.send(client,thread,{document_id:randomUUID()}),{status:400});
  const first=await service.send(client,thread,{body:'Test client message'});assert.equal(first.sender_id,client.id);
  assert.equal((await service.list(advocate,thread)).items[0].body,'Test client message');await service.read(advocate,thread);
  assert.ok((await service.list(client,thread)).items[0].read_at);
  const second=await service.send(advocate,thread,{body:'Test advocate reply'});assert.deepEqual((await service.list(client,thread,first.id)).items.map(m=>m.id),[second.id]);
  await db.case.update({where:{id},data:{advocate_id:outsider.id}});
  await assert.rejects(service.send(advocate,thread,{body:'Revoked access'}),{status:404});await assert.rejects(service.read(advocate,thread),{status:404});
  assert.equal((await service.list(outsider,thread)).items.length,2);
 }finally{
  if(thread){await db.message.deleteMany({where:{thread_id:thread}});await db.messageThread.delete({where:{id:thread}});}
  if(id)await db.case.delete({where:{id}});await db.user.deleteMany({where:{id:{in:actors.map(a=>a.id)}}});await db.$disconnect();
 }
});
