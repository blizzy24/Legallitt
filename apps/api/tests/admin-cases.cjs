const test = require('node:test');
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {PrismaClient} = require('../dist/src/generated/prisma/client');
const {PrismaPg} = require('@prisma/adapter-pg');
const {AdminCasesRepository} = require('../dist/src/admin-cases/admin-cases.repository');
const {CaseStatus, adminBucketFor} = require('@legalitt/shared');

test('admin list refuses non-admins before touching the database', async () => {
  const repository = new AdminCasesRepository({getClient: () => {throw Error('DB must not be called');}});
  for (const role of ['client','advocate']) await assert.rejects(repository.list({id: randomUUID(), role}, {}), {status:403});
});
test('admin list filters, counts, paginates, groups documents and exposes only table data', {skip: !process.env.LEGALITT_TEST_DATABASE_URL}, async () => {
  const db = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
  const repo = new AdminCasesRepository({getClient:async()=>db});
  const marker = 'ADMINTEST-' + randomUUID();
  const users = ['client','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:marker+' '+role}));
  const [client, advocate, admin] = users;
  const ids = Object.values(CaseStatus).map(()=>randomUUID());
  let priceId; const docs=[]; const draftId=randomUUID();
  try {
    await db.user.createMany({data:users});
    priceId=(await db.servicePricing.findFirstOrThrow({where:{service_code:'legal_notice',tier:'urgent',variant:null,base_amount_paise:99900n}})).id;
    for (const [i,status] of Object.values(CaseStatus).entries()) {
      await db.case.create({data:{id:ids[i],reference:marker+'-'+i,service_code:'legal_notice',client_id:client.id,
        advocate_id:status==='assigned'?advocate.id:null,status,matter_type:'money_recovery',pricing_id:priceId,
        details:{client:{fullName:'Sender test',phone:'PRIVATE'},noticee:{fullName:'Noticee test',address:'PRIVATE'}},created_at:new Date('2026-01-01')}});
    }
    const caseId=ids[Object.values(CaseStatus).indexOf('assigned')];
    // One PDF is client-owned but generated: links, not owner or filenames, decide its origin.
    for (const owner of [client,admin,client,advocate]) {
      const id=randomUUID();docs.push(id);
      await db.document.create({data:{id,case_id:caseId,owner_id:owner.id,kind:'legal_notice',filename:'private.pdf',s3_key:id,mime_type:'application/pdf',size_bytes:1n,status:'uploaded'}});
    }
    await db.draft.create({data:{id:draftId,case_id:caseId,kind:'legal_notice',version:1,content:{},created_by:advocate.id,document_id:docs[2]}});
    const all = await repo.list(admin,{search:marker,limit:100});
    assert.equal(all.total,14); assert.equal(all.filtered_total,14); assert.equal(all.items.length,14);
    assert.deepEqual(all.counts,{open:3,pending:2,in_progress:6,completed:1,closed:2});
    for (const row of all.items) {
      assert.ok(adminBucketFor(row.status)); assert.equal(row.amount_paise,'99900');
      assert.deepEqual(Object.keys(row).sort(),['id','reference','client','matter_type','parties','advocate','documents','status','bucket','amount_paise','created_at'].sort());
      assert.ok(!JSON.stringify(row).includes('PRIVATE')); assert.ok(!JSON.stringify(row).includes('s3_key'));
    }
    const assigned=all.items.find(r=>r.id===caseId);
    assert.equal(assigned.advocate.id,advocate.id);
    assert.deepEqual(assigned.documents,{client:1,admin:1,generated:1,advocate:1});
    assert.deepEqual(assigned.parties,[{kind:'sender',name:'Sender test'},{kind:'noticee',name:'Noticee test'}]);
    const seen=new Set();let cursor;
    do {
      const part=await repo.list(admin,{search:marker,limit:3,...cursor?{cursor}:{}});
      for(const row of part.items){assert.ok(!seen.has(row.id));seen.add(row.id);}cursor=part.next_cursor;
    }while(cursor);
    assert.equal(seen.size,14);
    for(const bucket of ['open','pending','in_progress','completed','closed']) {
      const result=await repo.list(admin,{search:marker,bucket});
      assert.equal(result.filtered_total,all.counts[bucket]); assert.deepEqual(result.counts,all.counts);
      assert.ok(result.items.every(r=>r.bucket===bucket));
    }
    assert.equal((await repo.list(admin,{search:client.full_name})).total,14);
    assert.ok((await repo.list(admin,{search:'Money Recovery',limit:100})).items.some(r=>r.id===caseId));
    assert.equal((await repo.list(admin,{search:marker,service:'fir_draft'})).total,0);
    const first=await repo.list(admin,{search:marker,limit:1});
    await assert.rejects(repo.list(admin,{search:'changed',cursor:first.next_cursor}),{status:400});
    await assert.rejects(repo.list(admin,{cursor:'broken'}),{status:400});
    await assert.rejects(repo.list(admin,{limit:101}),{status:400});
    await assert.rejects(repo.list(admin,{client_id:client.id}),{status:400});
    await db.case.update({where:{id:caseId},data:{pricing_id:null}});
    assert.equal((await repo.list(admin,{search:marker+'-'+Object.values(CaseStatus).indexOf('assigned')})).items.find(r=>r.id===caseId).amount_paise,null);
  } finally {
    await db.draft.deleteMany({where:{id:draftId}});
    await db.document.deleteMany({where:{id:{in:docs}}});
    await db.case.deleteMany({where:{id:{in:ids}}});
    await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
    await db.$disconnect();
  }
});
