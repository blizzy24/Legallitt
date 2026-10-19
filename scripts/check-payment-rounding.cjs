const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText, filename);
const {gst18, withGst18} = require('../apps/mobile/data/tax.ts');
const {invoiceLines, invoiceTotal} = require('../apps/mobile/data/legalNotice.ts');
const {psInvoiceLines, psInvoiceTotal} = require('../apps/mobile/data/propertySearch.ts');
const {dfInvoiceLines, dfInvoiceTotal} = require('../apps/mobile/data/documentForensic.ts');
const {hcServicePay} = require('../apps/mobile/data/courtFees.ts');
// Both sides of the half-rupee boundary, plus exactly 50 paise.
assert.equal(gst18(24), 4);
assert.equal(gst18(25), 5);
assert.equal(gst18(26), 5);
assert.equal(withGst18(250), 295);
for (const [name, linesFor, totalFor, expected] of [
  ['Legal Notice', invoiceLines, tier => invoiceTotal(invoiceLines(tier)), {ordinary:1271, urgent:1625}],
  ['Property Search', psInvoiceLines, psInvoiceTotal, {ordinary:788, urgent:1378}],
  ['Document Forensic', dfInvoiceLines, dfInvoiceTotal, {ordinary:1968, urgent:3738}],
]) {
  for (const [tier, amount] of Object.entries(expected)) {
    const lines = linesFor(tier);
    assert.ok(lines.every(line => Number.isInteger(line.amount)), `${name} ${tier}: no paise`);
    assert.equal(totalFor(tier), amount);
    assert.equal(lines.reduce((sum, line) => sum + line.amount, 0), amount);
  }
}
for (const [tier, expected] of [['ordinary',29499], ['urgent',41299]]) {
  const pay = hcServicePay(tier);
  assert.equal(pay.amount, expected);
  assert.equal(pay.total, '₹' + expected.toLocaleString('en-IN'));
  assert.equal(pay.lines.reduce((sum, line) => sum + Number(line.value.replace(/[^\d.]/g, '')), 0), expected);
}
console.log('PASS all eight rounded totals, balanced invoices, rounding boundaries and unchanged courier total');
