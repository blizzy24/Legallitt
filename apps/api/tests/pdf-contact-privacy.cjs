const test=require('node:test'),assert=require('node:assert/strict'),{createHash}=require('node:crypto');
const {renderNoticePdf}=require('../dist/src/documents/notice-pdf'),{privateGeneratedPdf}=require('../dist/src/documents/pdf-contact-privacy'),{readPdfText}=require('./helpers/pdf-text.cjs');
test('privacy copy removes underlying phone glyphs across PDF runs; preserves original bytes, other facts and page layout',async()=>{
 const input={reference:'TEST-PRIVACY',date:new Date('2026-11-13T10:00:00Z'),place:'Mumbai',advocate:{name:'TEST Advocate'},serviceFeePaise:99900n,compliancePeriodDays:7,content:{sender:'TEST Client\nTEST address',recipient:'TEST Recipient\nTEST address',subject:'TEST privacy',facts:'Legacy contact +91 91234 56781. Second contact 9123456782. Unrelated amount 91234 and witness 2025550103.\nLegacy Age 41 years.',demand:'TEST demand',closing:'TEST closing'}};
 const original=await renderNoticePdf(input),hash=createHash('sha256').update(original).digest('hex'),before=await readPdfText(original);
 assert.ok(before.text.includes('91234 56781'));const bytes=await privateGeneratedPdf(original,['+919123456781','+919123456782'],true);assert.ok(bytes);
 const after=await readPdfText(bytes);assert.equal(after.pages.length,before.pages.length);for(const value of ['91234 56781','9123456782','Age 41'])assert.ok(!after.text.includes(value),value);for(const value of ['TEST Client','Unrelated amount 91234','2025550103','TEST closing'])assert.ok(after.text.includes(value),value);
 assert.equal(createHash('sha256').update(original).digest('hex'),hash);assert.equal(await privateGeneratedPdf(bytes,['+919123456781','+919123456782'],true),null,'second projection needs no further change');
});
