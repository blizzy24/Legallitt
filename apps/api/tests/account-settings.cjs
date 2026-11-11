const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {AccountService}=require('../dist/src/account/account.service');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');
const {NotificationRepository}=require('../dist/src/notifications/notifications.controller');
const {seedConfirmedPricing}=require('../dist/prisma/seed-pricing');

const token=sub=>`h.${Buffer.from(JSON.stringify({sub})).toString('base64url')}.s`;

test('Account settings: preferences, security, password, export, deletion request, saved advocates — own data only (D-20–D-27)',
 {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
  const mk=(role,email)=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST ACCOUNT '+role,email});
  const client=mk('client',`acct-${randomUUID()}@example.test`),other=mk('client',`acct-${randomUUID()}@example.test`),
    demo=mk('client',`acct-${randomUUID()}@legalitt.invalid`),advocate=mk('advocate',`acct-${randomUUID()}@example.test`),
    unapproved=mk('advocate',`acct-${randomUUID()}@example.test`);
  const users=[client,other,demo,advocate,unapproved],calls=[];
  const cognito={changePassword:async(...a)=>{calls.push(['change',...a]);if(a[1]==='wrong'){const e=new Error('x');e.name='NotAuthorizedException';throw e;}},
    globalSignOut:async a=>{calls.push(['signout',a]);}};
  const account=new AccountService(prisma,cognito),inbox=new InAppNotifications(new SimulatedNotifications()),feed=new NotificationRepository(prisma);
  const cases=[];
  try{
    await db.user.createMany({data:users});
    await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved',city:'Indore',practice_areas:['Property']}});
    await db.advocateProfile.create({data:{user_id:unapproved.id,verification:'in_review'}});
    await db.advocateAvailability.create({data:{advocate_id:advocate.id,version:1,timezone:'Asia/Kolkata',intervals:[{day:1,start:'10:00',end:'13:00'},{day:3,start:'10:00',end:'13:00'}]}});
    await seedConfirmedPricing(db);
    await t.test('preferences default on, persist per user, and quiet categories arrive read',async()=>{
      assert.deepEqual(await account.preferences(client),{language:'en',notifications:{cases:true,consultations:true,payments:true}});
      await assert.rejects(account.updatePreferences(client,{language:'hi'}),{status:400},'untranslated languages cannot be chosen');
      const saved=await account.updatePreferences(client,{notifications:{payments:false}});
      assert.equal(saved.notifications.payments,false);assert.equal((await account.preferences(other)).notifications.payments,true,'isolated');
      await db.$transaction(tx=>inbox.send(tx,{user_id:client.id,kind:'payment_captured',title:'Payment Successful'}));
      await db.$transaction(tx=>inbox.send(tx,{user_id:client.id,kind:'advocate_assigned',title:'Advocate assigned'}));
      const page=await feed.list(client,{});assert.equal(page.items.length,2);assert.equal(page.unread_count,1);
    });
    await t.test('security reflects sign-in method; demo credentials are never changed',async()=>{
      await db.authEvent.create({data:{user_id:client.id,identifier:client.email,event:'password_login',user_agent:'Mozilla/5.0 (Windows NT 10.0)'}});
      const s=await account.security(client);assert.equal(s.password_change,'available');assert.equal(s.sessions[0].device,'Web browser');assert.equal(s.sessions[0].method,'password');
      assert.equal((await account.security(other)).sessions.length,0,'sessions are per user');
      await assert.rejects(account.changePassword(demo,{current_password:'a',new_password:'abcdefg1',access_token:token(demo.cognito_sub)}),{status:409});
      await assert.rejects(account.changePassword(client,{current_password:'a',new_password:'abcdefg1',access_token:token(other.cognito_sub)}),{status:403},'another user’s token is refused');
      await assert.rejects(account.changePassword(client,{current_password:'wrong',new_password:'abcdefg1',access_token:token(client.cognito_sub)}),e=>e.status===400&&/incorrect/.test(e.message));
      await assert.rejects(account.changePassword(client,{current_password:'a',new_password:'short',access_token:token(client.cognito_sub)}),{status:400});
      assert.deepEqual(await account.changePassword(client,{current_password:'right',new_password:'abcdefg1',access_token:token(client.cognito_sub)}),{changed:true});
      await db.authEvent.create({data:{user_id:other.id,identifier:'+910000000000',event:'otp_verified'}});
      assert.equal((await account.security(other)).password_change,'one_time_code');
      await account.signOutEverywhere(client,{access_token:token(client.cognito_sub)});
      assert.equal(calls.filter(c=>c[0]==='signout').length,1);
      assert.equal(calls.filter(c=>c[0]==='change').every(c=>c[1]===token(client.cognito_sub)),true,'only the owner’s token reached Cognito');
    });
    await t.test('saved advocates: approved only, per client, with availability and the consultation total',async()=>{
      await assert.rejects(account.saveAdvocate(client,unapproved.id),{status:404});
      await assert.rejects(account.saveAdvocate(client,other.id),{status:404},'a client is not an advocate');
      await assert.rejects(account.saveAdvocate(advocate,advocate.id),{status:403});
      await account.saveAdvocate(client,advocate.id);await account.saveAdvocate(client,advocate.id);
      const list=await account.savedAdvocates(client);assert.equal(list.items.length,1);
      assert.deepEqual(list.items[0].available_days,[1,3]);assert.equal(list.items[0].consultation_total_paise,'88500');
      assert.equal((await account.savedAdvocates(other)).items.length,0,'isolated');
      await account.unsaveAdvocate(other,advocate.id);assert.equal((await account.savedAdvocates(client)).items.length,1,'another client cannot unsave mine');
      await account.unsaveAdvocate(client,advocate.id);assert.equal((await account.savedAdvocates(client)).items.length,0);
    });
    await t.test('export contains only the caller’s own cases, payments and messages',async()=>{
      for(const owner of [client,other]){
        const c=await db.case.create({data:{reference:`TEST-ACCT-${randomUUID().slice(0,8)}`,service_code:'legal_notice',client_id:owner.id,status:'draft'}});cases.push(c.id);
        const thread=await db.messageThread.create({data:{case_id:c.id,kind:'client_advocate'}});
        await db.message.create({data:{thread_id:thread.id,sender_id:owner.id,body:'hello from '+owner.id}});
      }
      const data=await account.exportData(client);
      assert.equal(data.cases.length,1);assert.equal(data.messages.length,1);assert.ok(data.messages[0].body.includes(client.id));
      assert.equal(JSON.stringify(data).includes(other.id),false,'nothing about another client');
      assert.equal(JSON.stringify(data).includes(client.cognito_sub),false,'no identity-provider identifiers');
    });
    await t.test('deletion: blocked by an active paid case, otherwise deactivates immediately',async()=>{
      const paid=await db.case.create({data:{reference:`TEST-ACCT-${randomUUID().slice(0,8)}`,service_code:'legal_notice',client_id:other.id,status:'paid'}});cases.push(paid.id);
      const state=await account.deletionState(other);assert.equal(state.blockers.length,1);assert.equal(state.request,null);
      await assert.rejects(account.requestDeletion(other,{}),{status:409});
      assert.equal((await account.deletionState(client)).blockers.length,0,'blockers are per user');
      const req=await account.requestDeletion(client,{reason:'No longer needed',access_token:token(client.cognito_sub)});
      assert.equal(req.status,'pending');assert.equal((await db.user.findUnique({where:{id:client.id}})).status,'deactivated');
      assert.equal((await account.deletionState(client)).request.id,req.id);
      assert.equal((await account.deletionState(other)).request,null);
      await assert.rejects(account.requestDeletion(client,{}),{status:409},'one pending request');
    });
  }finally{
    for(const id of cases){const threads=await db.messageThread.findMany({where:{case_id:id}});await db.message.deleteMany({where:{thread_id:{in:threads.map(x=>x.id)}}});
      await db.messageThread.deleteMany({where:{case_id:id}});await db.notification.deleteMany({where:{case_id:id}});await db.caseEvent.deleteMany({where:{case_id:id}});await db.case.delete({where:{id}});}
    const ids=users.map(u=>u.id);
    await db.notification.deleteMany({where:{user_id:{in:ids}}});await db.authEvent.deleteMany({where:{user_id:{in:ids}}});
    await db.savedAdvocate.deleteMany({where:{user_id:{in:ids}}});await db.userPreference.deleteMany({where:{user_id:{in:ids}}});
    await db.accountDeletionRequest.deleteMany({where:{user_id:{in:ids}}});await db.advocateAvailability.deleteMany({where:{advocate_id:{in:ids}}});
    await db.advocateProfile.deleteMany({where:{user_id:{in:ids}}});await db.user.deleteMany({where:{id:{in:ids}}});
    await db.$disconnect();
  }
});
