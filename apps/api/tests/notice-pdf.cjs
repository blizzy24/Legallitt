const test=require('node:test'),assert=require('node:assert/strict');
const {renderNoticePdf,unsupportedCharacters}=require('../dist/src/documents/notice-pdf');
const {readPdfText}=require('./helpers/pdf-text.cjs');
const content={sender:'TEST Sender\nTEST sender address',recipient:'TEST Recipient\nrecipient@example.invalid',subject:'TEST advocate subject',facts:'First fact.\nSecond fact.',demand:'Pay ₹1,00,000.\nConfirm payment in writing.',closing:'Failing which, my client may pursue appropriate civil remedies.',offences:'RETIRED OFFENCES TEXT MUST NOT PRINT'};
const input={reference:'LN-2026-0001',date:new Date('2026-11-12T10:00:00Z'),place:'Indore',advocate:{name:'Adv. Test Advocate',qualifications:'LL.B.',enrolment:'MP/TEST/2020'},sender:{name:'OLD SENDER',address:'OLD ADDRESS'},recipient:{name:'OLD RECIPIENT',address:'OLD POSTAL ADDRESS'},subject:'OLD SUBJECT',demands:['OLD DEMAND'],serviceFeePaise:99900n,compliancePeriodDays:7,content};
const compact=value=>value.replace(/\s+/g,'');
test('all six authored sections reach the selectable letterhead; intake never overwrites edits and offences stay out',async()=>{
 const {pages,text}=await readPdfText(await renderNoticePdf(input));assert.ok(pages.length>=1);
 for(const value of ['TEST Sender','TEST sender address','TEST Recipient','recipient@example.invalid','TEST advocate subject','First fact.','Second fact.','Pay ₹1,00,000.','Confirm payment in writing.',content.closing,'within 7 days','pay ₹999 as the cost','Place : Indore','Reference Id LN-2026-0001'])assert.ok(compact(text).includes(compact(value)),value);
 for(const value of ['OLD SENDER','OLD ADDRESS','OLD RECIPIENT','OLD POSTAL ADDRESS','OLD SUBJECT','OLD DEMAND',content.offences,'criminal complaint','for the offences of','digitally signed','____'])assert.ok(!text.includes(value),value);
 assert.ok(compact(text).indexOf('within7days')<compact(text).indexOf('Failingwhich'));
});
test('long facts paginate without losing content or colliding with the footer',async()=>{
 const facts=Array.from({length:35},(_,i)=>`Fact-${i+1} ${'Evidence and chronology. '.repeat(8)}`).join('\n'),result=await readPdfText(await renderNoticePdf({...input,content:{...content,facts}}));
 assert.ok(result.pages.length>=3);for(let i=1;i<=35;i++)assert.ok(result.text.includes(`Fact-${i} `));
 for(const page of result.pages){assert.equal(page.width,595.28);assert.equal(page.height,841.89);assert.ok(page.text.includes('automated document preparation platform'));for(const run of page.runs){assert.ok(run.x>=0&&run.x<page.width);assert.ok(run.x+run.width<=page.width+.1,run.text);if(run.size>6)assert.ok(run.y>65,run.text);}}
});
test('long names and unbroken editable text stay within the page',async()=>{
 const result=await readPdfText(await renderNoticePdf({...input,advocate:{...input.advocate,name:'Advocate '+'Long Name '.repeat(12)},content:{...content,sender:'Long sender name '.repeat(20),subject:'X'.repeat(400)}}));
 assert.equal((result.text.match(/X/g)||[]).length,400);for(const page of result.pages)for(const run of page.runs)assert.ok(run.x+run.width<=page.width+.1,run.text);
});
test('editable recipient and facts preserve rupees, typographic punctuation and Devanagari',async()=>{
 const typed='राम कुमार — “funds insufficient” – ₹2,50,000 ‘ok’ … यह केवल परीक्षण के लिए है।';assert.deepEqual(unsupportedCharacters(typed),[]);
 const result=await readPdfText(await renderNoticePdf({...input,content:{...content,recipient:typed,facts:typed}}));
 assert.equal(result.text.split('यह केवल परीक्षण के लिए है।').length-1,2);assert.ok(result.pages.some(p=>p.runs.some(r=>r.font.includes('Devanagari'))));assert.ok(!result.text.includes('\uFFFD'));
});
test('incomplete authored sections block generation together; email-only recipient needs no invented address',async()=>{
 const empty=Object.fromEntries(Object.keys(content).map(key=>[key,'']));
 await assert.rejects(renderNoticePdf({reference:'TEST',date:input.date,content:empty}),error=>{assert.equal(error.code,'notice_fields_missing');assert.deepEqual(error.missing_fields,['subject','sender_name','sender_address','recipient_name','recipient_address','service_fee','place','facts','demand','closing']);return true;});
 const result=await readPdfText(await renderNoticePdf({...input,serviceFeePaise:0n,sender:null,recipient:null,content:{...content,sender:'TEST Client, Age 32\nClient street'}}));assert.ok(result.text.includes('recipient@example.invalid'));assert.ok(result.text.includes('pay ₹0 as the cost'));for(const guessed of ['S/o Shri','Mr. TEST','Mrs. TEST','____'])assert.ok(!result.text.includes(guessed));
});
