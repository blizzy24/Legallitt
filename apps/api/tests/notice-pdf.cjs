const test = require('node:test'), assert = require('node:assert/strict');
const { PDFDocument } = require('pdf-lib');
const { renderNoticePdf } = require('../dist/src/documents/notice-pdf');
const content = { sender: 'Adv. Test Sender\nChamber 1, Test Road', recipient: 'Test Recipient\n2 Recipient Lane', subject: 'Test subject',
  facts: 'First fact.\nSecond fact.', demand: 'Pay ₹1,00,000 within 15 days.', closing: 'Yours faithfully,\nAdv. Test Sender' };
test('the notice PDF is a real multi-page-capable document with the drawn approval record only on the final', async () => {
  const draft = await renderNoticePdf({ reference: 'LN-2026-0001', date: new Date('2026-10-28T10:00:00Z'), place: 'Indore', content });
  const final = await renderNoticePdf({ reference: 'LN-2026-0001', date: new Date('2026-10-28T10:00:00Z'), place: 'Indore', content,
    approval: { clientName: 'Test Client', approvedAt: new Date('2026-10-28T11:20:00Z') } });
  assert.equal(Buffer.from(draft.subarray(0, 5)).toString(), '%PDF-');
  assert.equal((await PDFDocument.load(draft)).getPageCount(), 1);
  assert.ok(final.length > draft.length, 'the approval record adds content');
  // A long body paginates; the count comes from the file, never from a constant.
  const long = await renderNoticePdf({ reference: 'LN-2026-0002', date: new Date(), content: { ...content, facts: Array.from({ length: 120 }, (_, i) => `Fact ${i + 1} ${'word '.repeat(20)}`).join('\n') } });
  assert.ok((await PDFDocument.load(long)).getPageCount() >= 3);
  // Empty sections leave no heading behind.
  const sparse = await renderNoticePdf({ reference: 'LN-2026-0003', date: new Date(), content: { ...content, facts: '', demand: '', closing: '' } });
  assert.equal((await PDFDocument.load(sparse)).getPageCount(), 1);
});
