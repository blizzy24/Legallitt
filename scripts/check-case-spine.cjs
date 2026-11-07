const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const {SERVICE_CODES,SERVICE_NAMES,CaseStatus,bucketFor}=require('../packages/shared/dist');
const {caseTitle,caseCategory,caseDestination,advocateCaseMatters}=require('../apps/mobile/features/cases/case-list.ts');
const {advocateNoticeMatters,advocateNoticeStatistics}=require('../apps/mobile/features/legal-notice/advocateList.ts');
const {unavailableSection}=require('../apps/mobile/lib/unavailable-sections.ts');
const sample=(service_code,status)=>({id:`${service_code}-${status}`,reference:'test',service_code,status,details:{},tier:null,matter_type:null,updated_at:'2026-11-08T00:00:00Z'});

test('mixed service lists retain every record, count once and route unbuilt work to the availability boundary',()=>{
  const rows=SERVICE_CODES.flatMap(s=>Object.values(CaseStatus).map(status=>sample(s,status)));
  const matters=advocateCaseMatters(rows);
  assert.equal(matters.length,rows.length);
  assert.equal(advocateNoticeStatistics(matters).reduce((n,s)=>n+Number(s.value),0),rows.length);
  assert.deepEqual(advocateCaseMatters(rows.filter(r=>r.service_code==='legal_notice')),advocateNoticeMatters(rows));
  for(const row of rows){
    assert.ok(['active','pending','closed'].includes(bucketFor(row.status)));
    if(row.service_code==='legal_notice')continue;
    assert.equal(caseTitle(row),SERVICE_NAMES[row.service_code]);
    assert.equal(caseCategory(row),SERVICE_NAMES[row.service_code]);
    for(const advocate of [false,true]){
      const path=caseDestination(row,advocate),url=new URL(path,'http://localhost');
      assert.equal(url.searchParams.get('service'),row.service_code);
      assert.equal(url.searchParams.get('caseId'),row.id);
      const route=advocate?'advocate/requests/[id]':'cases/[id]';
      assert.ok(unavailableSection(route,Object.fromEntries(url.searchParams)));
      assert.equal(url.pathname,`${advocate?'/advocate/requests':'/cases'}/${row.id}`);
    }
  }
});

test('all seventeen Legal Notice states retain the existing client and advocate destinations',()=>{
  const client={draft:'step1',submitted:'step6',payment_pending:'step6',approved:'request-submitted',dispatching:'request-submitted',dispatched:'delivery'};
  const advocate={assigned:'fee',advocate_accepted:'drafting',in_progress:'draft',changes_requested:'drafting',client_review:'review',approved:'final',dispatching:'dispatch',dispatched:'dispatch',completed:'report'};
  for(const status of Object.values(CaseStatus)){
    const row=sample('legal_notice',status),suffix=`?caseId=${row.id}`;
    assert.equal(caseDestination(row),`/legal-notice/${client[status]??'tracking'}${suffix}`);
    assert.equal(caseDestination(row,true),advocate[status]?`/advocate/notice/${row.id}/${advocate[status]}${suffix}`:null);
  }
});
