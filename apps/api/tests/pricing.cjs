const test = require('node:test');
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {calculateQuote} = require('../dist/src/payments/quote-math');

const calculate = (base, pages = 0, delivery = 17900n) => calculateQuote({base, pages, delivery,
  commissionBps: 2000, gstBps: 1800, includedPages: 25, pagePrice: 2500n, pageGstBps: 0});

test('confirmed split, combined taxable basis, delivery reimbursement and aggregate page allowance', () => {
  const urgent = calculate(99900n);
  assert.equal(urgent.platform_fee_paise, '24975');
  assert.equal(urgent.gst_paise, '22478');
  assert.equal(urgent.total_paise, '165253');
  assert.equal(urgent.advocate_entitlement_paise, '117800');
  assert.equal(urgent.platform_revenue_paise, '24975');
  assert.equal(calculate(69900n).total_paise, '121003');
  assert.equal(calculate(60000n, 0, 0n).total_paise, '88500');
  assert.equal(calculate(99900n, 0, 0n).total_paise, '147353');
  for (const pages of [0, 24, 25]) assert.equal(calculate(99900n, pages).page_overage_paise, '0');
  const over = calculate(99900n, 18 + 12);
  assert.equal(over.charged_pages, 5);
  assert.equal(over.total_paise, '177753');
  assert.equal(over.gst_paise, urgent.gst_paise);
  assert.equal(over.advocate_entitlement_paise, urgent.advocate_entitlement_paise);
  assert.equal(over.platform_revenue_paise, '37475');
  assert.equal(calculate(99900n, 26).page_overage_paise, '2500');
  const future = calculateQuote({base: 90000n, delivery: 0n, commissionBps: 1000, gstBps: 1800,
    pages: 0, includedPages: 25, pagePrice: 2500n, pageGstBps: 0});
  assert.equal(future.platform_fee_paise, '10000');
  assert.equal(future.advocate_entitlement_paise, '90000');
});

test('quotes pin rows, reject unresolved/changed documents, preserve receipts, and seed reruns preserve history',
  {skip: !process.env.LEGALITT_TEST_DATABASE_URL}, async () => {
  const {PrismaClient} = require('../dist/src/generated/prisma/client');
  const {PrismaPg} = require('@prisma/adapter-pg');
  const {seedConfirmedPricing} = require('../dist/prisma/seed-pricing');
  const {PaymentsService} = require('../dist/src/payments/payments.service');
  const {CaseStateMachine} = require('../dist/src/cases/case-state-machine');
  const {CaseRepository} = require('../dist/src/cases/case-repository');
  const {ServicesController} = require('../dist/src/cases/services.controller');
  const db = new PrismaClient({adapter: new PrismaPg({connectionString: process.env.LEGALITT_TEST_DATABASE_URL})});
  const prisma = {getClient: async () => db};
  const notices = {send: async () => {}};
  const state = new CaseStateMachine(prisma, notices);
  const repo = new CaseRepository(prisma);
  let captures = 0;
  const payments = new PaymentsService(prisma, state, {capture: async ({totalPaise}) => {
    captures++; return {paymentId: randomUUID(), totalPaise, simulated: true, source: 'simulated'};
  }}, notices);
  const before = {};
  for (const table of ['servicePricing','commissionRate','feePolicy','pageOveragePolicy']) before[table] = await db[table].findMany({orderBy:{id:'asc'}});
  const client = {id: randomUUID(), role:'client'}, other = {id: randomUUID(), role:'client'};
  const ids = [];
  const extraRates = [];
  try {
    for (const a of [client,other]) await db.user.create({data:{...a,cognito_sub:a.id,full_name:'TEST ONLY pricing'}});
    await seedConfirmedPricing(db);
    const initial = await db.servicePricing.findMany({orderBy:{id:'asc'}});
    await seedConfirmedPricing(db);
    assert.deepEqual(await db.servicePricing.findMany({orderBy:{id:'asc'}}), initial);
    for (const old of before.servicePricing) assert.deepEqual(initial.find(r=>r.id===old.id),old);
    assert.equal(await db.commissionRate.count({where:{confirmed:true,service_code:'courier'}}),0);
    assert.equal(await db.commissionRate.count({where:{confirmed:true}}),8);
    const services = new ServicesController(prisma);
    for (const code of ['district_court','high_court']) {
      const service = await services.one(code);
      const hasRepresentation=!!await db.courtPolicy.findFirst({where:{service_code:code}});
      assert.equal(service.pricing_mode,hasRepresentation?'representation_advance':'consultation_then_quote');
      const legacy=service.pricing.filter(p=>p.variant==='consultation_30_minutes');
      assert.equal(legacy.length,1);
      assert.equal(legacy[0].base_amount_paise,'60000');
      assert.equal(legacy[0].duration_minutes,30);
      assert.equal(legacy[0].tier,null);
      if(hasRepresentation)assert.ok(service.pricing.some(p=>p.variant==='representation'&&p.tier==='ordinary'));
    }
    const base = await db.servicePricing.findFirstOrThrow({where:{service_code:'legal_notice',tier:'urgent',confirmed:true,variant:null}});
    const c = await db.case.create({data:{reference:'TEST-PRICE-'+randomUUID(),service_code:'legal_notice',client_id:client.id,
      tier:'urgent',pricing_id:base.id,status:'payment_pending'}}); ids.push(c.id);
    const doc = async (pages, status='uploaded', mime='application/pdf') => db.document.create({data:{case_id:c.id,owner_id:client.id,
      kind:'supporting_document',filename:randomUUID()+'.pdf',s3_key:'test/'+randomUUID(),mime_type:mime,size_bytes:100n,page_count:pages,status}});
    await doc(18); const second = await doc(12); await doc(1,'uploaded','image/png');
    const pending = await doc(null,'pending');
    await assert.rejects(payments.quote(other,{case_id:c.id}),{status:404});
    const blocked = await payments.quote(client,{case_id:c.id});
    assert.equal(blocked.status,'blocked'); assert.equal(blocked.documents[0].id,pending.id);
    assert.match(blocked.documents[0].reason,/finish or remove/);
    await db.document.update({where:{id:pending.id},data:{status:'deleted'}});
    await db.document.update({where:{id:second.id},data:{page_count:null}});
    assert.match((await payments.quote(client,{case_id:c.id})).documents[0].reason,/readable, unlocked PDF/);
    await db.document.update({where:{id:second.id},data:{page_count:12}});
    const quote = await payments.quote(client,{case_id:c.id});
    assert.equal(quote.status,'ready'); assert.equal(quote.breakdown.total_pages,30);
    assert.equal(quote.breakdown.total_paise,'177753');
    assert.equal((await payments.quote(client,{case_id:c.id})).id,quote.id);
    await assert.rejects(payments.intent(client,{case_id:c.id,purpose:'service_fee'},randomUUID()),{status:409});
    assert.equal(captures,0);
    await assert.rejects(db.casePriceQuote.update({where:{id:quote.id},data:{document_fingerprint:'tampered'}}));
    const futureRate = await db.commissionRate.create({data:{service_code:'legal_notice',rate_bps:1000,confirmed:true}}); extraRates.push(futureRate.id);
    const added = await doc(1);
    await assert.rejects(payments.intent(client,{case_id:c.id,purpose:'service_fee',quote_id:quote.id},randomUUID()),{status:409});
    assert.equal(captures,0);
    const newer = await payments.quote(client,{case_id:c.id});
    assert.notEqual(newer.id,quote.id); assert.equal(newer.breakdown.platform_fee_paise,'24975','existing case keeps commission version');
    assert.equal(newer.breakdown.total_paise,'180253');
    const key = randomUUID();
    const payment = await payments.intent(client,{case_id:c.id,purpose:'service_fee',quote_id:newer.id},key);
    assert.equal(payment.total_paise,180253n); assert.equal(captures,1);
    assert.equal((await payments.intent(client,{case_id:c.id,purpose:'service_fee',quote_id:newer.id},key)).id,payment.id);
    assert.equal(captures,1);
    await db.document.update({where:{id:added.id},data:{status:'deleted'}});
    const receipt = (await repo.read(client,c.id)).client_fees;
    assert.equal(receipt.total_paise,'180253'); assert.equal(receipt.page_overage_paise,'15000');
    assert.equal(receipt.breakdown_complete,true);
    assert.equal((await db.casePriceQuote.findUnique({where:{id:quote.id}})).snapshot.breakdown.total_paise,'177753');
  } finally {
    await db.notification.deleteMany({where:{case_id:{in:ids}}});
    await db.noticeLifecycle.deleteMany({where:{case_id:{in:ids}}});
    await db.payment.deleteMany({where:{case_id:{in:ids}}});
    await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});
    await db.document.deleteMany({where:{case_id:{in:ids}}});
    await db.case.deleteMany({where:{id:{in:ids}}});
    await db.user.deleteMany({where:{id:{in:[client.id,other.id]}}});
    // Test-only database: remove precisely the versions this test inserted.
    await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)},fee_policy_id:{not:null}}});
    await db.feePolicy.deleteMany({where:{id:{notIn:before.feePolicy.map(x=>x.id)}}});
    await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)}}});
    await db.commissionRate.deleteMany({where:{id:{notIn:before.commissionRate.map(x=>x.id)}}});
    await db.pageOveragePolicy.deleteMany({where:{id:{notIn:before.pageOveragePolicy.map(x=>x.id)}}});
    await db.$disconnect();
  }
});
