// Q79/Q113 (docs/flows/ISHAAN-ANSWERS-2026-11-12.md): Court Marriage is not part of
// Legalitt for now. One shared switch (HIDDEN_SERVICES) hides it: no new cases, no
// public service or price listing. Its code and existing cases stay readable to owners.
const test = require('node:test'), assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {SERVICE_CODES, HIDDEN_SERVICES, OFFERED_SERVICE_CODES, CreateCaseSchema, isServiceOffered, serviceNotOfferedMessage, ApiClient} = require('@legalitt/shared');
const {seedDormantCase} = require('./helpers/dormant-case.cjs');

const REFUSAL = "Court Marriage isn't offered right now.";

test('the shared switch hides Court Marriage and nothing else', () => {
  assert.deepEqual([...HIDDEN_SERVICES], ['court_marriage']);
  assert.equal(isServiceOffered('court_marriage'), false);
  for (const code of SERVICE_CODES.filter(c => c !== 'court_marriage')) assert.equal(isServiceOffered(code), true, code);
  for (const code of ['unknown', '', null, undefined]) assert.equal(isServiceOffered(code), false);
  assert.deepEqual([...OFFERED_SERVICE_CODES], SERVICE_CODES.filter(c => c !== 'court_marriage'));
  assert.equal(serviceNotOfferedMessage('court_marriage'), REFUSAL);
  // Existing rows must still parse: the code stays a valid service.
  assert.equal(CreateCaseSchema.parse({service_code: 'court_marriage'}).service_code, 'court_marriage');
});

test('hidden services: creation refused, lists omit them, existing cases stay readable', {skip: !process.env.LEGALITT_TEST_DATABASE_URL}, async t => {
  const {PrismaClient} = require('../dist/src/generated/prisma/client');
  const {PrismaPg} = require('@prisma/adapter-pg');
  const {CaseStateMachine} = require('../dist/src/cases/case-state-machine');
  const {CaseRepository} = require('../dist/src/cases/case-repository');
  const {ServicesController} = require('../dist/src/cases/services.controller');
  const {ServiceReportsService} = require('../dist/src/service-reports/service-reports.service');
  const {InAppNotifications} = require('../dist/src/notifications/in-app-notifications');
  const {SimulatedNotifications} = require('../dist/src/notifications/simulated-notifications');
  const db = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.LEGALITT_TEST_DATABASE_URL})});
  const prisma = {getClient: async () => db};
  const machine = new CaseStateMachine(prisma, new InAppNotifications(new SimulatedNotifications()));
  const cases = new CaseRepository(prisma), services = new ServicesController(prisma);
  const reports = new ServiceReportsService(prisma, machine, null, null);
  const users = ['client', 'client', 'admin'].map(role => ({id: randomUUID(), role, cognito_sub: randomUUID(), full_name: 'TEST hidden services'}));
  const [owner, stranger, admin] = users, ids = [];
  let app;
  try {
    await db.user.createMany({data: users});
    await t.test('a client cannot start a Court Marriage case; offered services still start', async () => {
      const before = await db.case.count({where: {service_code: 'court_marriage'}});
      await assert.rejects(machine.create(owner, {service_code: 'court_marriage'}), {status: 400, message: REFUSAL});
      assert.equal(await db.case.count({where: {service_code: 'court_marriage'}}), before, 'no row written');
      const ok = await machine.create(owner, {service_code: 'property_search'}); ids.push(ok.id);
      assert.equal(ok.status, 'draft');
    });
    await t.test('service and price listings omit Court Marriage', async () => {
      const listed = (await services.list()).map(s => s.code);
      assert.ok(!listed.includes('court_marriage'));
      assert.ok(listed.includes('legal_notice'), 'offered services are still listed');
      await assert.rejects(services.one('court_marriage'), {status: 404});
      await assert.rejects(reports.pricing('court_marriage'), {status: 404});
    });
    await t.test('an existing Court Marriage case stays readable to its owner and the admin only', async () => {
      const row = await seedDormantCase(db, owner, 'court_marriage'); ids.push(row.id);
      assert.equal((await cases.read(owner, row.id)).service_code, 'court_marriage');
      assert.ok((await cases.list(owner, {service_code: 'court_marriage'})).items.some(r => r.id === row.id));
      assert.equal((await cases.read(admin, row.id)).id, row.id);
      await assert.rejects(cases.read(stranger, row.id), {status: 404});
      // An older draft of a hidden service can no longer be submitted for payment.
      await assert.rejects(machine.submitForPayment(owner, row.id), {status: 400, message: REFUSAL});
      assert.equal((await db.case.findUnique({where: {id: row.id}})).status, 'draft');
    });
    await t.test('HTTP: refusal message, omitted listings, owner read', async () => {
      require('reflect-metadata');
      const {NestFactory} = require('@nestjs/core');
      const {AppModule} = require('../dist/src/app.module');
      const {PrismaService} = require('../dist/src/prisma.service');
      const {AuthService} = require('../dist/src/auth/auth.service');
      app = await NestFactory.create(AppModule, {logger: false});
      app.get(PrismaService).getClient = async () => db;
      app.get(AuthService).identity = async token => users.find(u => u.id === token);
      await app.listen(0, '127.0.0.1');
      const base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
      const client = actor => new ApiClient({baseUrl: base, getTokens: async () => ({idToken: actor.id, accessToken: 'test', expiresIn: 3600})});
      await assert.rejects(client(owner).createCase({service_code: 'court_marriage'}), {status: 400, message: REFUSAL});
      assert.ok(!(await client(owner).request('/services')).some(s => s.code === 'court_marriage'));
      await assert.rejects(client(owner).service('court_marriage'), {status: 404});
      await assert.rejects(client(owner).reportPricing('court_marriage'), {status: 404});
      const existing = ids.at(-1);
      assert.equal((await client(owner).case(existing)).service_code, 'court_marriage');
      await assert.rejects(client(stranger).case(existing), {status: 404});
    });
  } finally {
    if (app) await app.close();
    await db.notification.deleteMany({where: {case_id: {in: ids}}});
    await db.caseEvent.deleteMany({where: {case_id: {in: ids}}});
    await db.case.deleteMany({where: {id: {in: ids}}});
    await db.user.deleteMany({where: {id: {in: users.map(u => u.id)}}});
    await db.$disconnect();
  }
});
