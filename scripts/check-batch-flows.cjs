// Focused regressions for the exact-route bug and authorised notice invoice.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, filename);
const {nextRoute} = require('../data/flowMap.ts');
const {invoiceLines,invoiceTotal} = require('../data/legalNotice.ts');
assert.equal(nextRoute('/cases/all'), '/cases/1');
assert.equal(nextRoute('/advocates'), '/advocates/1');
assert.equal(nextRoute('/advocate/fir/review'), '/advocate/fir/review-compact');
assert.equal(nextRoute('/advocate/fir/review-compact'), '/advocate/fir/completed');
assert.equal(nextRoute('/advocate/fir/completed'), undefined);
assert.equal(nextRoute('/advocate/fir/fir-2026-1048'), '/advocate/fir/documents');
assert.equal(nextRoute('/legal-notice/tracking'), '/legal-notice/request-submitted');
assert.equal(nextRoute('/legal-notice/delivery'), '/legal-notice/delivered');
assert.equal(nextRoute('/advocate/notice/case-123/scan-pay'), '/advocate/notice/case-123/paid');
for(const [tier,base,gst,total] of [['urgent',999,248,1625],['ordinary',699,194,1271]]) {
  const lines=invoiceLines(tier);
  assert.deepEqual(lines.map(line=>line.amount),[base,179,gst,199]);
  assert.equal(invoiceTotal(lines),total);
}
console.log('PASS exact/static/dynamic/terminal flow routing and both notice invoices');
