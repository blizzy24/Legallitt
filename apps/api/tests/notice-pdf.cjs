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
test('long names and long words stay printable without fabricated case values', async () => {
  const longName = 'Advocate ' + 'Long Name '.repeat(12);
  const long = await readPdfText(await renderNoticePdf({...input, advocate: {...input.advocate, name: longName},
    sender: {...input.sender, name: 'Very long sender name '.repeat(20)}, subject: 'X'.repeat(400)}));
  assert.ok(long.text.includes('Long Name'));
  assert.equal((long.text.match(/X/g) ?? []).length, 400);
  for (const page of long.pages) for (const run of page.runs)
    assert.ok(run.x + run.width <= page.width + 0.1, `long value stays within paper: ${run.text}`);

});
test('what the advocate typed is printable: rupee sign, typographic quotes and dashes, Devanagari', async () => {
  const typed = 'Mr. राम कुमार — “funds insufficient” – ₹2,50,000 ‘ok’ … यह केवल परीक्षण के लिए है।';
  assert.deepEqual(unsupportedCharacters(typed), []);
  const bytes = await renderNoticePdf({ ...input, recipient: {...input.recipient, name: typed}, content: { ...content, facts: typed } });
  assert.equal((await PDFDocument.load(bytes)).getPageCount(), 1);
  const result = await readPdfText(bytes);
  assert.ok(result.text.includes('₹2,50,000'));
  assert.ok(result.text.includes('राम कुमार'));
  assert.ok(result.text.includes('यह केवल परीक्षण के लिए है।'));
  assert.equal(result.text.split('यह केवल परीक्षण के लिए है।').length - 1, 2);
  assert.ok(result.pages[0].runs.some(r => r.font.includes('Devanagari')));
  assert.ok(!result.text.includes('\uFFFD'));
});

test('the compliance sentence precedes consequences; criminal clause is conditional with no offence blank',async()=>{
  for(const offences of ['', ' \n ', 'TEST allegation supplied by advocate']){
    const {text}=await readPdfText(await renderNoticePdf({...input,compliancePeriodDays:7,content:{...content,offences}}));
    // The extractor concatenates PDF lines without inserting layout whitespace.
    const normalized=text.replace(/\s+/g,'');
    const contains=value=>normalized.includes(value.replace(/\s+/g,''));
    assert.ok(contains('within 7 days of receipt of this notice.'));
    assert.ok(normalized.indexOf('within7days')<normalized.indexOf('Failingwhich'));
    if(offences.trim())assert.ok(contains('criminal complaint / FIR against you before the police authorities for the offences of TEST allegation supplied by advocate'));
    else {
      assert.ok(contains('civil proceedings against you.'));
      assert.ok(!contains('criminal complaint'));
      assert.ok(!contains('for the offences of'));
    }
    assert.ok(!text.includes('____'),'complete intake leaves no underscore holes in either PDF');
  }
});


test('missing required fields reject together before any PDF is produced', async () => {
  await assert.rejects(renderNoticePdf({reference:'LN-TEST', date:input.date, content}), error => {
    assert.equal(error.code,'notice_fields_missing');
    assert.deepEqual(error.missing_fields,['subject','sender_name','sender_address','recipient_name','recipient_address','service_fee','place']);
    for (const label of ['Subject line','Sender name','Sender address','Recipient name','Recipient address','Service fee','Place']) assert.ok(error.message.includes(label));
    return true;
  });
});

test('optional father and age omit their phrases independently; no generated fill-in blanks', async () => {
  for (const [father,age] of [[null,null],['  ',null],['Father Name',null],[null,41]]) {
    const bytes=await renderNoticePdf({...input,sender:{...input.sender,father,age},serviceFeePaise:0n,content:{...content,offences:''}});
    const {text}=await readPdfText(bytes), normalized=text.replace(/\s/g,'');
    assert.equal(text.includes('S/o Shri'), Boolean(father?.trim()));
    assert.equal(text.includes('Age '), age!=null);
    assert.ok(normalized.includes('R/oSenderRoad,Indore'));
    assert.ok(text.includes('pay ₹0 as the cost'));
    assert.ok(!text.includes('____'));
  }
});
