const test = require('node:test'), assert = require('node:assert/strict');
const { PDFDocument } = require('pdf-lib');
const { renderNoticePdf, unsupportedCharacters } = require('../dist/src/documents/notice-pdf');
const {readPdfText} = require('./helpers/pdf-text.cjs');
const content = { sender: 'Adv. Test Sender\nChamber 1, Test Road', recipient: 'Test Recipient\n2 Recipient Lane', subject: 'Test subject',
  facts: 'First fact.\nSecond fact.', demand: 'Unused working demand.', closing: 'Unused working closing.', offences: 'Specified offences' };
const input = {reference: 'LN-2026-0001', date: new Date('2026-11-02T10:00:00Z'), place: 'Indore',
  advocate: {name: 'Adv. Test Advocate', qualifications: 'LL.B., LL.M.', enrolment: 'MP/1234/2020'},
  sender: {name: 'Sender Name', father: 'Father Name', age: 41, address: 'Sender Road, Indore'},
  recipient: {name: 'Noticee Name', address: 'Noticee Road, Mumbai'}, subject: 'Intake subject',
  demands: ['Pay ₹1,00,000.', 'Confirm payment in writing.', 'Preserve the account records.'], serviceFeePaise: 69900n, content};
test('the supplied letterhead contains selectable case fields, all demands, exact boilerplate and no working-section headings', async () => {
  const draft = await renderNoticePdf(input);
  assert.equal(Buffer.from(draft.subarray(0, 5)).toString(), '%PDF-');
  const {pages, text} = await readPdfText(draft);
  assert.equal(pages.length, 1);
  for (const value of ['LEGAL NOTICE', 'Reference Id LN-2026-0001', 'Noticee Name', 'Intake subject',
    'S/o Shri Father Name, Age 41', '1.First fact.', '2.Second fact.', 'A.Pay ₹1,00,000.',
    'C.Preserve the account records.', 'offences of Specified offences', 'pay ₹699 as the cost',
    'has been preserved in my office', 'Place : Indore', 'INT LegalConsultants Pvt. Ltd.',
    'INT LegalConsultant Pvt. Ltd.', 'automated document preparation platform']) assert.ok(text.includes(value), value);
  for (const value of ['Unused working demand', 'Unused working closing', 'Test subject', 'BACKGROUND & FACTS'])
    assert.ok(!text.includes(value), value);
  assert.ok(pages[0].runs.some(r => r.font.includes('Bold') && r.glyphText.includes('civil')));
});
test('numbered facts grow past five and paginate without losing content or colliding with the footer', async () => {
  const facts = Array.from({length: 35}, (_, i) => `Fact-${i + 1} ${'Evidence and chronology. '.repeat(8)}`).join('\n');
  const long = await readPdfText(await renderNoticePdf({...input, content: {...content, facts}}));
  assert.ok(long.pages.length >= 3);
  for (let i = 1; i <= 35; i++) assert.ok(long.text.includes(`Fact-${i} `), `fact ${i} retained`);
  assert.ok(long.text.includes('35.Fact-35'));
  for (const page of long.pages) {
    assert.equal(page.width, 595.28); assert.equal(page.height, 841.89);
    assert.ok(page.text.includes('automated document preparation platform'));
    for (const run of page.runs) {
      assert.ok(run.x >= 0 && run.x < page.width, `text starts within paper: ${run.text}`);
      assert.ok(run.x + run.width <= page.width + 0.1, `text ends within paper: ${run.text}`);
      if (run.size > 6) assert.ok(run.y > 65, `body text stays above footer: ${run.text}`);
    }
  }
});
test('long names, long words and sparse fields stay printable without fabricated case values', async () => {
  const longName = 'Advocate ' + 'Long Name '.repeat(12);
  const long = await readPdfText(await renderNoticePdf({...input, advocate: {...input.advocate, name: longName},
    sender: {...input.sender, name: 'Very long sender name '.repeat(20)}, subject: 'X'.repeat(400)}));
  assert.ok(long.text.includes('Long Name'));
  assert.equal((long.text.match(/X/g) ?? []).length, 400);
  for (const page of long.pages) for (const run of page.runs)
    assert.ok(run.x + run.width <= page.width + 0.1, `long value stays within paper: ${run.text}`);
  const sparse = await readPdfText(await renderNoticePdf({reference: 'LN-2026-SPARSE', date: input.date,
    content: {...content, facts: '', offences: ''}}));
  assert.equal(sparse.pages.length, 1);
  assert.ok(!sparse.text.includes('Test Recipient'));
  assert.ok(!sparse.text.includes('Test subject'));
  assert.ok(!sparse.text.includes('₹699'));
});
test('what the advocate typed is printable: rupee sign, typographic quotes and dashes, Devanagari', async () => {
  const typed = 'Mr. राम कुमार — “funds insufficient” – ₹2,50,000 ‘ok’ … यह केवल परीक्षण के लिए है।';
  assert.deepEqual(unsupportedCharacters(typed), []);
  const bytes = await renderNoticePdf({ ...input, recipient: {name: typed}, content: { ...content, facts: typed } });
  assert.equal((await PDFDocument.load(bytes)).getPageCount(), 1);
  const result = await readPdfText(bytes);
  assert.ok(result.text.includes('₹2,50,000'));
  assert.ok(result.text.includes('राम कुमार'));
  assert.ok(result.text.includes('यह केवल परीक्षण के लिए है।'));
  assert.equal(result.text.split('यह केवल परीक्षण के लिए है।').length - 1, 2);
  assert.ok(result.pages[0].runs.some(r => r.font.includes('Devanagari')));
  assert.ok(!result.text.includes('\uFFFD'));
});
