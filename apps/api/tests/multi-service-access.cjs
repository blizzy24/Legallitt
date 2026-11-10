const test = require('node:test'), assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {SERVICE_CODES, ApiClient} = require('@legalitt/shared');
const {PrismaClient} = require('../dist/src/generated/prisma/client');
const {PrismaPg} = require('@prisma/adapter-pg');
const {CaseRepository} = require('../dist/src/cases/case-repository');
const {CaseStateMachine, lockedCase} = require('../dist/src/cases/case-state-machine');
const {caseScope} = require('../dist/src/cases/case-access');
const {AdminCasesRepository} = require('../dist/src/admin-cases/admin-cases.repository');
const {AdminCaseDetailRepository} = require('../dist/src/admin-cases/admin-case-detail');
const {DocumentService} = require('../dist/src/documents/document.service');
const {NotificationRepository} = require('../dist/src/notifications/notifications.controller');
const {InAppNotifications} = require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications} = require('../dist/src/notifications/simulated-notifications');

test('service filters only narrow ownership; unknown roles fail closed', () => {
  for (const service of SERVICE_CODES) {
    assert.deepEqual(caseScope({id:'a',role:'client'},service), {service_code:service,client_id:'a'});
    assert.deepEqual(caseScope({id:'b',role:'advocate'},service), {service_code:service,advocate_id:'b'});
  }
  assert.deepEqual(caseScope({id:'a',role:'client'}), {client_id:'a'});
  assert.throws(()=>caseScope({id:'a',role:'owner'}), {status:403});
});

test('multi-service spine: real DB ownership, references, locks, documents, inbox and HTTP', {skip:!process.env.LEGALITT_TEST_DATABASE_URL}, async t => {
  const db = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
  const prisma = {getClient:async()=>db};
  const machine = new CaseStateMachine(prisma,new InAppNotifications(new SimulatedNotifications()));
  const cases = new CaseRepository(prisma), admins = new AdminCasesRepository(prisma), detail = new AdminCaseDetailRepository(prisma);
  const users = ['client','client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'Spine test'}));
  const [owner, stranger, advocate, otherAdvocate, admin] = users;
  const ids=[], docs=[];
  let app;
  const create = async service => {const row=await machine.create(owner,{service_code:service});ids.push(row.id);return row;};
  try {
    await db.user.createMany({data:users});
    await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved',city:'Test city'}});
    await t.test('all supported services create empty spines; reference allocation is concurrent and service-specific',async()=>{
      const rows=await Promise.all(SERVICE_CODES.flatMap(service=>[create(service),create(service)]));
      assert.equal(new Set(rows.map(r=>r.reference)).size,rows.length);
      for (const service of SERVICE_CODES) {
        const pair=rows.filter(r=>r.service_code===service);
        const prefix=service==='legal_notice'?'LN':service.toUpperCase();
        for(const row of pair){assert.match(row.reference,new RegExp(`^${prefix}-\\d{4}-\\d{4,}$`));assert.equal(row.client_id,owner.id);assert.equal(row.status,'draft');assert.deepEqual(row.details,{});}
        const serials=pair.map(r=>Number(r.reference.split('-').at(-1))).sort((a,b)=>a-b);
        assert.equal(serials[1],serials[0]+1);
        const own=await cases.list(owner,{service_code:service,limit:100});
        assert.deepEqual(new Set(own.items.map(r=>r.id)),new Set(pair.map(r=>r.id)));
        const first=await cases.list(owner,{service_code:service,limit:1});
        const second=await cases.list(owner,{service_code:service,limit:1,cursor:first.next_cursor});
        assert.deepEqual(new Set([...first.items,...second.items].map(r=>r.id)),new Set(pair.map(r=>r.id)));
        assert.equal((await cases.list(stranger,{service_code:service,cursor:first.next_cursor})).items.length,0);
        assert.equal((await cases.list(stranger,{service_code:service})).items.length,0);
        assert.equal((await cases.list(owner,{service_code:service,role:'admin'})).items.length,0);
        for(const row of pair){
          assert.equal((await cases.read(owner,row.id)).service_code,service);
          assert.equal((await cases.events(owner,row.id,{})).items.length,1);
          assert.equal((await cases.read(admin,row.id)).client_id,owner.id);
          for(const actor of [stranger,advocate,otherAdvocate]) {
            await assert.rejects(cases.read(actor,row.id),{status:404});
            await assert.rejects(cases.events(actor,row.id,{}),{status:404});
            await assert.rejects(machine.transition(actor,row.id,'cancelled'),{status:404});
          }
        }
      }
      for(const body of [{service_code:'unknown'}, {service_code:'property_search',client_id:stranger.id}, {service_code:'property_search',status:'paid'}, {service_code:'property_search',details:{anything:'unvalidated intake'}}, {service_code:'legal_notice',tier:'invented'}])
        await assert.rejects(machine.create(owner,body),{status:400});
      for(const actor of [advocate,admin]) await assert.rejects(machine.create(actor,{service_code:'property_search'}),{status:403});
      await assert.rejects(cases.list(owner,{service_code:'unknown'}),{status:400});
      await db.service.update({where:{code:'courier'},data:{active:false}});
      try{await assert.rejects(machine.create(owner,{service_code:'courier'}),{status:400});}
      finally{await db.service.update({where:{code:'courier'},data:{active:true}});}
    });
    await t.test('assignment and document access remain tied to the current owner/advocate for every service',async()=>{
      let downloads=0;
      const documents=new DocumentService(prisma,{upload:async()=>({url:'https://storage.invalid',fields:{}}),download:async()=>{downloads++;return 'https://storage.invalid/file';}},{});
      for(const service of SERVICE_CODES){
        const row=await create(service);
        const ticket=await documents.presign(owner,{case_id:row.id,kind:'supporting_document',filename:'test.pdf',mime:'application/pdf'});
        docs.push(ticket.document.id);
        await db.document.update({where:{id:ticket.document.id},data:{status:'uploaded'}});
        await db.case.update({where:{id:row.id},data:{status:'paid'}}); // fixture only: no new payment workflow
        if(['legal_advice','district_court','high_court'].includes(service))await db.consultation.create({data:{case_id:row.id,advocate_id:advocate.id,client_id:owner.id,mode:'chat',scheduled_at:new Date(Date.now()+86400000),duration_min:30,status:'scheduled'}});
        await assert.rejects(machine.assign(owner,row.id,{advocate_id:advocate.id}),{status:403});
        await machine.assign(admin,row.id,{advocate_id:advocate.id});
        assert.equal((await cases.read(advocate,row.id)).advocate_id,advocate.id);
        await assert.rejects(cases.read(otherAdvocate,row.id),{status:404});
        await assert.rejects(machine.transition(owner,row.id,'advocate_accepted'),{status:403});
        await assert.rejects(machine.transition(otherAdvocate,row.id,'advocate_accepted'),{status:404});
        assert.equal((await machine.transition(advocate,row.id,'advocate_accepted')).status,'advocate_accepted');
        for(const actor of [owner,advocate,admin]) assert.ok((await documents.url(actor,ticket.document.id)).url);
        const before=downloads;
        for(const actor of [stranger,otherAdvocate]) {
          await assert.rejects(documents.url(actor,ticket.document.id),{status:404});
          await assert.rejects(documents.complete(actor,ticket.document.id),{status:404});
          await assert.rejects(documents.presign(actor,{case_id:row.id,kind:'supporting_document',filename:'test.pdf',mime:'application/pdf'}),{status:404});
          await assert.rejects(documents.delete(actor,ticket.document.id),{status:404});
        }
        assert.equal(downloads,before);
        assert.equal((await detail.get(admin,row.id)).service_code,service);
        const page=await admins.list(admin,{service,limit:100,search:'Spine test'});
        assert.deepEqual(page.items.map(r=>r.id),[row.id]);
        assert.equal(page.items[0].service_code,service);
        assert.deepEqual(page.counts,{open:0,pending:0,in_progress:1,completed:0,closed:0});
        const inbox=new NotificationRepository(prisma);
        assert.equal((await inbox.list(advocate,{})).items.find(n=>n.case_id===row.id).case.service_code,service);
        await db.case.update({where:{id:row.id},data:{advocate_id:otherAdvocate.id}});
        await assert.rejects(cases.read(advocate,row.id),{status:404});
        await assert.rejects(documents.url(advocate,ticket.document.id),{status:404});
        await assert.rejects(machine.transition(advocate,row.id,'advocate_accepted'),{status:404});
        assert.ok(!(await inbox.list(advocate,{})).items.some(n=>n.case_id===row.id));
        assert.ok((await documents.url(otherAdvocate,ticket.document.id)).url);
      }
    });
    await t.test('waiting writers recheck membership after a concurrent owner change',async()=>{
      const row=await create('property_search');
      let unlock, acquired;
      const gate=new Promise(resolve=>{unlock=resolve;}), ready=new Promise(resolve=>{acquired=resolve;});
      const holder=db.$transaction(async tx=>{await lockedCase(tx,admin,row.id);acquired();await gate;await tx.case.update({where:{id:row.id},data:{client_id:stranger.id}});});
      await ready;
      const refused=assert.rejects(machine.transition(owner,row.id,'cancelled'),{status:404});
      try {
        // Prove the second writer is waiting in PostgreSQL, not merely scheduled
        // after the owner change. This exercises SELECT FOR UPDATE's recheck.
        const deadline=Date.now()+3000;
        let waiting=false;
        do {
          const [result]=await db.$queryRaw`SELECT EXISTS (
            SELECT 1 FROM pg_stat_activity WHERE datname = current_database()
            AND wait_event_type = 'Lock' AND query LIKE '%FROM cases%FOR UPDATE%'
          ) AS waiting`;
          waiting=result.waiting;
          if(!waiting)await new Promise(resolve=>setTimeout(resolve,10));
        } while(!waiting&&Date.now()<deadline);
        assert.equal(waiting,true,'the scoped writer must be blocked on the case lock');
      } finally {unlock();await holder;await refused;}
      assert.equal((await cases.read(stranger,row.id)).status,'draft');
    });
    await t.test('other services cannot enter the unchanged notice intake/draft/payment/dispatch workflow',async()=>{
      const row=await create('property_search');
      await assert.rejects(machine.updateDraft(owner,row.id,{tier:'urgent'}),{status:404});
      await assert.rejects(machine.submitForPayment(owner,row.id),{status:404});
      await assert.rejects(machine.transition(owner,row.id,'submitted'),{status:409});
      await db.case.update({where:{id:row.id},data:{advocate_id:advocate.id}});
      await assert.rejects(machine.startDrafting(advocate,row.id),{status:404});
      await assert.rejects(machine.dispatch(advocate,row.id,{}),{status:404});
      const {NoticePdfService}=require('../dist/src/cases/notice-pdf.service');
      await assert.rejects(new NoticePdfService(prisma,{}).preview(advocate,row.id,randomUUID()),{status:409,message:'Case not found'});
      const {PaymentsService}=require('../dist/src/payments/payments.service');
      const payments=new PaymentsService(prisma,machine,{capture:()=>{throw Error('Must not capture');}},{});
      await assert.rejects(payments.intent(owner,{case_id:row.id,purpose:'service_fee'},randomUUID()),{status:404});
      assert.equal((await machine.transition(owner,row.id,'cancelled')).status,'cancelled');
    });
    await t.test('HTTP uses token identity, never a service filter or supplied owner to grant access',async()=>{
      require('reflect-metadata');
      const {NestFactory}=require('@nestjs/core');
      const {AppModule}=require('../dist/src/app.module');
      const {PrismaService}=require('../dist/src/prisma.service');
      const {AuthService}=require('../dist/src/auth/auth.service');
      app=await NestFactory.create(AppModule,{logger:false});
      app.get(PrismaService).getClient=async()=>db;
      app.get(AuthService).identity=async token=>users.find(u=>u.id===token);
      await app.listen(0,'127.0.0.1');
      const client=actor=>new ApiClient({baseUrl:app.getHttpServer().address()&&`http://127.0.0.1:${app.getHttpServer().address().port}`,getTokens:async()=>({idToken:actor.id,accessToken:'test',expiresIn:3600})});
      const row=await client(owner).createCase({service_code:'property_search'});ids.push(row.id);
      assert.equal((await client(owner).case(row.id)).service_code,'property_search');
      await assert.rejects(client(stranger).case(row.id),{status:404});
      await assert.rejects(client(otherAdvocate).events(row.id),{status:404});
      await assert.rejects(client(stranger).cancel(row.id),{status:404});
      await assert.rejects(client(owner).adminCases({service:'property_search'}),{status:403});
      await assert.rejects(client(owner).request('/cases?service_code=property_search&client_id='+stranger.id),{status:400});
      assert.ok((await client(owner).cases(undefined,'property_search')).items.every(r=>r.client_id===owner.id&&r.service_code==='property_search'));
      assert.equal((await client(admin).case(row.id)).id,row.id);
      assert.ok((await client(admin).adminCases({service:'property_search'})).items.every(r=>r.service_code==='property_search'));
    });
  } finally {
    if(app)await app.close();
    await db.notification.deleteMany({where:{case_id:{in:ids}}});
    await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});
    await db.adminAction.deleteMany({where:{admin_id:admin.id}});
    await db.document.deleteMany({where:{id:{in:docs}}});
    await db.consultation.deleteMany({where:{case_id:{in:ids}}});
    await db.case.deleteMany({where:{id:{in:ids}}});
    await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});
    await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
    await db.$disconnect();
  }
});
