const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
const exportsForTest = {};
const source = fs.readFileSync(path.resolve(__dirname, '../../mobile/features/legal-notice/navigation.ts'), 'utf8');
vm.runInNewContext(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, {exports:exportsForTest,URLSearchParams});
const {noticePaid,noticeHref,noticeParents,noticeFinishedIntake} = exportsForTest;
test('paid Notice cases cannot reopen intake/payment, including cancelled cases with payment history', () => {
  for(const status of ['paid','assigned','in_progress','client_review','approved','dispatching','dispatched','completed','refunded']) assert.equal(noticePaid({status}),true,status);
  for(const status of ['draft','submitted','payment_pending','cancelled']) assert.equal(noticePaid({status,events:[]}),false,status);
  assert.equal(noticePaid({status:'cancelled',events:[{to_status:'paid'}]}),true);
  for(const stage of ['step1','step2','step3','step4','step4-review','step5','step6','scan-pay']) assert.equal(noticeFinishedIntake.has(stage),true);
  assert.equal(noticeFinishedIntake.has('success'),false);
});
test('post-payment parents never point to intake and navigation preserves the case', () => {
  assert.equal(noticeParents.success,'/legal-notice/tracking');
  assert.equal(noticeParents.tracking,'/cases');
  for(const screen of ['delivery','chat','profile']) assert.equal(noticeParents[screen],'/legal-notice/tracking');
  assert.equal(noticeHref('/legal-notice/tracking?notice=1','case-id'),'/legal-notice/tracking?notice=1&caseId=case-id');
});
