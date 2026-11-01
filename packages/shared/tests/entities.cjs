const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const shared=require('../dist');
const spec=fs.readFileSync(path.resolve(__dirname,'../../../docs/LEGALITT-BACKEND-ARCHITECTURE.md'),'utf8');
test('all lifecycle values match the authoritative DDL and have the confirmed bucket',()=>{
 const ddl=spec.match(/CREATE TYPE case_status AS ENUM \(([\s\S]*?)\);/)[1];
 const statuses=[...ddl.matchAll(/'([^']+)'/g)].map(m=>m[1]);
 assert.deepEqual(Object.values(shared.CaseStatus),statuses);
 const groups={pending:['draft','submitted','payment_pending','assigning','assigned','advocate_declined','client_review'],active:['paid','advocate_accepted','in_progress','changes_requested','approved','dispatching','dispatched'],closed:['completed','cancelled','refunded']};
 assert.equal(Object.values(groups).flat().length,statuses.length);
 for(const [bucket,states] of Object.entries(groups))for(const status of states) assert.equal(shared.bucketFor(status),bucket);
 assert.throws(()=>shared.bucketFor('unknown'));
});
test('core schemas preserve every DDL column and nullable flag',()=>{
 const tables={users:'User',advocate_profiles:'AdvocateProfile',cases:'Case',case_events:'CaseEvent',documents:'Document',drafts:'Draft',payments:'Payment',payouts:'Payout'};
 for(const [table,name] of Object.entries(tables)){
  const body=spec.match(new RegExp('CREATE TABLE '+table+' \\(([\\s\\S]*?)\\n\\);'))[1];
  const columns=body.split('\n').map(line=>line.split('--')[0].trim()).filter(line=>line&&!line.startsWith('UNIQUE'));
  const shape=shared[name+'Schema'].shape;
  assert.deepEqual(Object.keys(shape).sort(),columns.map(line=>line.split(/\s+/)[0]).sort(),table);
  // JSON null is a valid JSONB value, distinct from SQL NULL.
  for(const line of columns){const field=line.split(/\s+/)[0];assert.equal(shape[field].isNullable(),line.includes('JSONB') || (!line.includes('NOT NULL')&&!line.includes('PRIMARY KEY')),table+'.'+field);}
 }
});
test('money retains integer paise and rejects floats and unsafe coercion',()=>{
 assert.equal(shared.PaiseSchema.parse(137782n),137782n);
 assert.equal(shared.PaiseSchema.parse(9007199254740993n),9007199254740993n);
 for(const bad of [1377.82,137782,'137782',9223372036854775808n])assert.equal(shared.PaiseSchema.safeParse(bad).success,false);
});
test('nine distinct services and lifecycle/bucket separation',()=>{
 assert.equal(new Set(shared.SERVICE_CODES).size,9);
 assert.equal(shared.CaseStatusSchema.safeParse('active').success,false);
 assert.equal(shared.CaseBucketSchema.safeParse('in_progress').success,false);
});
