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
const {GeminiAi} = require('../dist/src/ai/gemini-ai');
const {AiProviderError} = require('../dist/src/ai/ai-error');
const {NoticeIntakeAiController} = require('../dist/src/cases/notice-intake-ai');

const failureCopy = {
  subject: 'Couldn’t generate the subject just now. Please try again.',
  demands: 'Couldn’t generate suggestions just now. Try again, or type your own.',
};

test('AI failures keep provider diagnostics in attributed events/logs, return plain HTTP errors, and preserve retry',
  {skip: !process.env.LEGALITT_TEST_DATABASE_URL}, async () => {
  const db = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.LEGALITT_TEST_DATABASE_URL})});
  const actor = {id: randomUUID(), role: 'client'};
  const app = await NestFactory.create(AppModule, {logger: false});
  const logs = [], previousNodeEnv = process.env.NODE_ENV;
  app.useLogger({error(message) {logs.push(String(message));}, log() {}, warn() {}});
  app.get(PrismaService).getClient = async () => db;
  app.get(AuthService).identity = async token => token === actor.id ? actor : undefined;
  const ai = app.get(AI), original = ai.generate.bind(ai);
  const key = 'synthetic-secret-do-not-log', privateMatter = 'Private synthetic test input.';
  let id, calls = 0;
  ai.generate = request => new GeminiAi({apiKey: key, model: 'gemini-3.5-flash-lite', environment: 'dev', nodeEnv: 'test'}, async () => {
    calls++;
    return Response.json({error: {status: 'RESOURCE_EXHAUSTED', message: `Quota exceeded: ${key} ${request.prompt}`}}, {status: 429});
  }).generate(request);
  try {
    await db.user.create({data: {...actor, cognito_sub: `ai-error-${actor.id}`, full_name: 'Test identity'}});
    await app.listen(0, '127.0.0.1');
    const url = await app.getUrl();
    const api = new ApiClient({baseUrl: url, getTokens: async () => ({idToken: actor.id, accessToken: actor.id, expiresIn: 3600})});
    const record = await api.createCase({service_code: 'legal_notice', tier: 'urgent'}); id = record.id;
    await api.saveIntake(id, {matter_type: 'money_recovery', subject_matter: privateMatter,
      legal_demand: {selected: [], custom: 'Keep my custom demand.'}});
    const before = await db.case.findUniqueOrThrow({where: {id}});
    for (const environment of ['development', 'production']) {
      process.env.NODE_ENV = environment;
      for (const [task, endpoint] of [['subject','subject'], ['demands','demand-options']]) {
        const response = await fetch(`${url}/api/v1/cases/${id}/${endpoint}`, {
          method: 'POST', headers: {'Content-Type': 'application/json', Authorization: `Bearer ${actor.id}`}, body: '{}',
        });
        assert.equal(response.status, 502);
        assert.deepEqual(await response.json(), {message: failureCopy[task], error: 'Bad Gateway', statusCode: 502});
      }
    }
    assert.equal(calls, 4, 'exactly one provider call per request; no retries/fallback added');
    const events = await db.caseEvent.findMany({where: {case_id: id}, orderBy: {id:'asc'}});
    const failures = events.filter(e => e.type.endsWith('_generation_failed'));
    assert.equal(failures.length, 4);
    for (const event of failures) {
      assert.equal(event.actor_id, actor.id); assert.equal(event.actor_role, 'client'); assert.equal(event.source, 'real');
      assert.equal(event.from_status, null); assert.equal(event.to_status, null);
      assert.deepEqual(event.payload, {task: event.type === 'subject_generation_failed' ? 'subject' : 'demands',
        provider: 'Gemini', model: 'gemini-3.5-flash-lite', code: 'RESOURCE_EXHAUSTED'});
    }
    const logged = logs.join('\n');
    assert.equal(logs.filter(message => message.includes('RESOURCE_EXHAUSTED')).length, 4);
    assert.ok(logged.includes(id)); assert.ok(!logged.includes(key)); assert.ok(!logged.includes(privateMatter));
    const after = await db.case.findUniqueOrThrow({where: {id}});
    assert.equal(after.status, before.status); assert.equal(after.subject_line, before.subject_line);
    assert.equal(after.subject_matter, before.subject_matter); assert.deepEqual(after.legal_demand, before.legal_demand);
    assert.equal(after.updated_at.getTime(), before.updated_at.getTime());
    // Existing retry calls succeed and append their normal success events.
    ai.generate = original;
    assert.equal((await api.generateNoticeSubject(id)).text, SIMULATED_NOTICE_SUBJECT);
    assert.ok((await api.generateNoticeDemands(id)).options.length > 1);
    assert.equal((await db.caseEvent.count({where:{case_id:id,type:{in:['subject_generated','demand_options_generated']}}})), 2);
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousNodeEnv;
    ai.generate = original; await app.close();
    if (id) {await db.caseEvent.deleteMany({where:{case_id:id}});await db.case.delete({where:{id}});}
    await db.user.deleteMany({where:{id:actor.id}}); await db.$disconnect();
  }
});

test('audit failures do not leak diagnostics or replace the actionable intake error', async () => {
  const id = randomUUID(), events = [], logs = [];
  const controller = new NoticeIntakeAiController(
    {generate: async ({task}) => {throw new AiProviderError('Gemini','gemini-3.5-flash-lite',task,'UNAVAILABLE','Provider unavailable','provider-request-id');}},
    {read: async () => ({status:'draft',matter_type:'money_recovery',subject_matter:'Synthetic'})},
    {recordIntakeAiFailure: async (...args) => {events.push(args);throw new Error('Database unavailable');}},
  );
  controller.logger = {error: message => logs.push(message)};
  for (const task of ['subject','demands']) {
    await assert.rejects(controller[task]({user:{id:randomUUID(),role:'client'}},id,{}), error => {
      assert.equal(error.getStatus(),502);assert.equal(error.getResponse().message,failureCopy[task]);return true;
    });
  }
  assert.equal(events.length,2);assert.ok(events.every(([, , failure])=>failure.code==='UNAVAILABLE'&&failure.request_id==='provider-request-id'));
  assert.equal(logs.filter(message=>message.includes('Could not record')).length,2);
});

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
    await api[0].saveIntake(c.id, {legal_demand, sender: {father_name:'Father Test',salutation: 'Ms.', relation: 'D/o', relative_name: 'Father Test'}, details: {
      client: {fullName: 'Sender Test', mobile: '2025550101', email: 'sender@example.invalid', address: 'Synthetic sender address'},
      noticee: {fullName: 'Noticee Test', mobile: '2025550102', email: 'noticee@example.invalid', address: 'Synthetic noticee address'},
    }});
    const row = await api[0].case(c.id);
    assert.equal(row.subject_line, subject.text); assert.deepEqual(row.legal_demand, legal_demand);
    assert.equal(row.parties[0].age, undefined);await assert.rejects(api[0].saveIntake(c.id,{sender:{age:41}}),{status:400}); assert.equal(row.parties[0].relative_name, 'Father Test');
    assert.equal(row.parties[0].salutation, 'Ms.'); assert.equal(row.parties[0].relation, 'D/o');
    // Only the listed choices are accepted; a guess cannot be stored.
    for (const sender of [{salutation: 'Smt.'}, {relation: 'C/o'}])
      await assert.rejects(api[0].saveIntake(c.id, {sender}), {status: 400});
    assert.equal(row.details.client.age, undefined); assert.equal(row.details.subject_matter, undefined);
    assert.equal(row.events.filter(e => e.source === 'simulated').length, 2);
    await api[0].saveIntake(c.id, {sender: {salutation: null, relation: null, relative_name: null}});
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
    // These required PDF sources cannot disappear through the normal paid intake.
    const complete=(await api[0].case(c.id)).details;
    for (const party of ['client','noticee']) for (const field of ['fullName','address']) {
      await api[0].saveIntake(c.id,{details:{[party]:{[field]:'   '}}});
      await assert.rejects(api[0].submit(c.id),{status:400});
      assert.equal((await api[0].case(c.id)).status,'draft');
      await api[0].saveIntake(c.id,{details:complete});
    }
    assert.equal((await api[0].submit(c.id)).status, 'payment_pending');
    assert.ok((await api[0].case(c.id)).pricing,'payment submission binds this case’s pricing');
    await assert.rejects(api[0].generateNoticeSubject(c.id), {status:409});
    await assert.rejects(api[0].saveIntake(c.id, {sender:{father_name:'Changed after payment'}}), {status:409});
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
