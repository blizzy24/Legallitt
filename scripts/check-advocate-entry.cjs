const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const {CaseStatus}=require('../packages/shared/dist');
const {advocateNoticeState:state,advocateNoticeMatters:matters,advocateNoticeStatistics:stats}=require('../apps/mobile/features/legal-notice/advocateList.ts');
const sample=(status,id=status)=>({id,reference:id,service_code:'legal_notice',status,tier:null,matter_type:null,details:{},updated_at:'2026-11-02T00:00:00Z'});
const rows=matters(Object.values(CaseStatus).map(s=>sample(s)));
assert.equal(rows.length,Object.values(CaseStatus).length);
assert.equal(stats(rows).reduce((n,s)=>n+Number(s.value),0),rows.length);
assert.ok(rows.every(r=>r.status!=='Upcoming'&&r.bucket!=='Upcoming'));
assert.deepEqual(state(CaseStatus.assigned),{bucket:'Needs Review',status:'Needs Review',action:'Review Request',screen:'fee'});
for(const [s,path] of [['advocate_accepted','drafting'],['in_progress','draft'],['changes_requested','drafting']]){
 assert.equal(state(s).action,'Continue Draft');assert.equal(state(s).screen,path);
}
for(const [s,path] of [['client_review','review'],['approved','final'],['dispatching','dispatch'],['dispatched','dispatch'],['completed','report'],['cancelled','report'],['refunded','report']]){
 assert.equal(state(s).action,'Open Case');assert.equal(state(s).screen,path);
}
for(const s of ['advocate_declined','draft','submitted','payment_pending','paid','assigning']){
 assert.equal(state(s).action,null);assert.equal(matters([sample(s)])[0].href,undefined);
}
const realShape=matters([...Array.from({length:7},(_,i)=>sample('client_review','review-'+i)),...Array.from({length:13},(_,i)=>sample('completed','done-'+i)),sample('advocate_declined')]);
assert.deepEqual(stats(realShape).map(s=>Number(s.value)),[0,7,14]);
assert.equal(realShape.filter(r=>r.filterTags?.includes('Waiting for Client')).length,7);
assert.ok(realShape.every(r=>r.urgency===null));
assert.ok(realShape.filter(r=>r.href).every(r=>r.href.includes('caseId='+r.id)));
console.log('PASS all lifecycle states: disjoint totals, waiting subset, legal actions/routes and missing values');
