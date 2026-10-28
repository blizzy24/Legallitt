const test = require('node:test'), assert = require('node:assert/strict');
const { PDFDocument } = require('pdf-lib');
const { renderNoticePdf, unsupportedCharacters } = require('../dist/src/documents/notice-pdf');
const content = { sender: 'Adv. Test Sender\nChamber 1, Test Road', recipient: 'Test Recipient\n2 Recipient Lane', subject: 'Test subject',
  facts: 'First fact.\nSecond fact.', demand: 'Pay \u20B91,00,000 within 15 days.', closing: 'Yours faithfully,\nAdv. Test Sender' };
test('the notice PDF paginates from its content and prints nothing but the typed sections', async () => {
  const draft = await renderNoticePdf({ reference: 'LN-2026-0001', date: new Date('2026-10-28T10:00:00Z'), place: 'Indore', content });
  assert.equal(Buffer.from(draft.subarray(0, 5)).toString(), '%PDF-');
  assert.equal((await PDFDocument.load(draft)).getPageCount(), 1);
  // A long body paginates; the count comes from the file, never from a constant.
  const long = await renderNoticePdf({ reference: 'LN-2026-0002', date: new Date(), content: { ...content, facts: Array.from({ length: 120 }, (_, i) => `Fact ${i + 1} ${'word '.repeat(20)}`).join('\n') } });
  assert.ok((await PDFDocument.load(long)).getPageCount() >= 3);
  // Empty sections leave no heading behind.
  const sparse = await renderNoticePdf({ reference: 'LN-2026-0003', date: new Date(), content: { ...content, facts: '', demand: '', closing: '' } });
  assert.equal((await PDFDocument.load(sparse)).getPageCount(), 1);
});
test('what the advocate typed is printable: rupee sign, typographic quotes and dashes, Devanagari', async () => {
  const typed = 'Mr. \u0930\u093E\u092E \u0915\u0941\u092E\u093E\u0930 \u2014 \u201Cfunds insufficient\u201D \u2013 \u20B92,50,000 \u2018ok\u2019 \u2026';
  assert.deepEqual(unsupportedCharacters(typed), []);
  const bytes = await renderNoticePdf({ reference: 'LN-2026-0004', date: new Date(), content: { ...content, recipient: typed, facts: typed } });
  assert.equal((await PDFDocument.load(bytes)).getPageCount(), 1);
});
