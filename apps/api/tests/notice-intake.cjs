const test = require('node:test'), assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {PrismaClient} = require('../dist/src/generated/prisma/client');
const {PrismaPg} = require('@prisma/adapter-pg');
const {ApiClient, SIMULATED_NOTICE_SUBJECT} = require('@legalitt/shared');
const {NestFactory} = require('@nestjs/core');
const {AppModule} = require('../dist/src/app.module');
const {PrismaService} = require('../dist/src/prisma.service');
const {AuthService} = require('../dist/src/auth/auth.service');
const {CaseStateMachine} = require('../dist/src/cases/case-state-machine');
const {AI} = require('../dist/src/ai/ai.port');

test('seven-step intake persists columns/parties, authorises AI, rejects stale answers and requires completion',
  {skip: !process.env.LEGALITT_TEST_DATABASE_URL}, async () => {
  const db = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.LEGALITT_TEST_DATABASE_URL})});
  const actors = ['client', 'client', 'advocate'].map(role => ({id: randomUUID(), role}));
  const ids = [];
  const app = await NestFactory.create(AppModule, {logger: false});
  app.get(PrismaService).getClient = async () => db;
  app.get(AuthService).identity = async token => actors.find(a => a.id === token);
  const state = app.get(CaseStateMachine), ai = app.get(AI);
  const original = ai.generate.bind(ai); let externalCalls = 0;
  ai.generate = async request => { externalCalls++; assert.ok(!request.prompt.includes('Sender Test')); return original(request); };
  try {
    for (const a of actors) await db.user.create({data: {...a, cognito_sub: `intake-${a.id}`, full_name: 'Test identity'}});
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    const api = actors.map(a => new ApiClient({baseUrl: url, getTokens: async () => ({idToken: a.id, accessToken: a.id, expiresIn: 3600})}));
    const c = await api[0].createCase({service_code: 'legal_notice', tier: 'urgent'}); ids.push(c.id);
    assert.equal(c.subject_matter, null); assert.equal(c.legal_demand, null);
    await assert.rejects(api[0].generateNoticeSubject(c.id), {status: 400});
    await assert.rejects(api[1].generateNoticeSubject(c.id), {status: 404});
    await assert.rejects(api[2].generateNoticeDemands(c.id), {status: 403});
    assert.equal(externalCalls, 0);
    await api[0].saveIntake(c.id, {matter_type: 'money_recovery', subject_matter: 'A synthetic unpaid invoice.'});
    const subject = await api[0].generateNoticeSubject(c.id);
    assert.deepEqual(subject, {text: SIMULATED_NOTICE_SUBJECT, simulated: true});
    const demands = await api[0].generateNoticeDemands(c.id);
    assert.equal(demands.simulated, true); assert.ok(demands.options.length > 1);
    const legal_demand = {selected: demands.options, custom: 'Synthetic custom demand.'};
    await api[0].saveIntake(c.id, {legal_demand, sender: {age: 41, father_name: 'Father Test'}, details: {
      client: {fullName: 'Sender Test', mobile: '2025550101', email: 'sender@example.invalid', address: 'Synthetic sender address'},
      noticee: {fullName: 'Noticee Test', mobile: '2025550102', email: 'noticee@example.invalid', address: 'Synthetic noticee address'},
    }});
    const row = await api[0].case(c.id);
    assert.equal(row.subject_line, subject.text); assert.deepEqual(row.legal_demand, legal_demand);
    assert.equal(row.parties[0].age, 41); assert.equal(row.parties[0].father_name, 'Father Test');
    assert.equal(row.details.client.age, undefined); assert.equal(row.details.subject_matter, undefined);
    assert.equal(row.events.filter(e => e.source === 'simulated').length, 2);
    await api[0].saveIntake(c.id, {sender: {age: null, father_name: null}});
    assert.equal((await api[0].case(c.id)).parties.length, 1);
    await api[0].saveIntake(c.id, {subject_matter: 'A changed synthetic invoice.'});
    assert.equal((await api[0].case(c.id)).subject_line, null);
    await assert.rejects(state.recordIntakeAi(actors[0],c.id,{matter_type:'money_recovery',subject_matter:'A synthetic unpaid invoice.'},
      {task:'subject',text:'Stale answer',simulated:true}), {status:409});
    await assert.rejects(api[0].submit(c.id), {status:400});
    await api[0].generateNoticeSubject(c.id);
    await api[0].saveIntake(c.id, {legal_demand: {selected:[],custom:''}});
    await assert.rejects(api[0].submit(c.id), {status:400});
    await api[0].saveIntake(c.id, {legal_demand});
    assert.equal((await api[0].submit(c.id)).status, 'payment_pending');
    await assert.rejects(api[0].generateNoticeSubject(c.id), {status:409});
    await assert.rejects(api[0].saveIntake(c.id, {sender:{age:42}}), {status:409});
  } finally {
    ai.generate = original;
    await app.close();
    await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});
    await db.caseParty.deleteMany({where:{case_id:{in:ids}}});
    await db.case.deleteMany({where:{id:{in:ids}}});
    await db.user.deleteMany({where:{id:{in:actors.map(a=>a.id)}}});
    await db.$disconnect();
  }
});
