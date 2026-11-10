// Reads LGD's public cascading dropdowns; does not request a CAPTCHA-protected report.
// Writes a candidate snapshot for review, never silently replaces the checked-in data.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
async function main(){
 const destination=process.argv[2];if(!destination)throw new Error('Usage: node scripts/fetch-lgd-districts.cjs <candidate.json>');
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();
  await page.goto('https://lgdirectory.gov.in/',{waitUntil:'domcontentloaded',timeout:60000});
  const url=await page.$eval('a[href^="downloadDirectory.do"]',a=>a.href);
  await page.goto(url,{waitUntil:'networkidle2',timeout:60000});
  await page.click('#DFDOption');
  await page.select('#rptFileName','subDistrictofSpecificDistrict@state#district');
  await page.waitForFunction(()=>document.querySelector('#state').options.length>30);
  console.log('Official state selector loaded');
  const options=selector=>page.$$eval(selector+' option',options=>options.filter(o=>/^\d+$/.test(o.value)&&Number(o.value)>0).map(o=>({code:o.value,name:o.textContent.trim()})));
  const states=await options('#state');assert.equal(states.length,36,'Review changed state/UT coverage before importing');
  for(const state of states){
   const previous=(await options('#district'))[0]?.code;
   await page.select('#state',state.code);
   await page.waitForFunction(previous=>{
    const first=[...document.querySelector('#district').options].find(o=>/^\d+$/.test(o.value)&&Number(o.value)>0);
    return first&&first.value!==previous;
   },{timeout:30000},previous);
   state.districts=await options('#district');assert.ok(state.districts.length>0,'No districts for '+state.name);
   console.log(state.code+' '+state.name+': '+state.districts.length);
  }
  const codes=states.flatMap(s=>s.districts.map(d=>d.code));assert.equal(new Set(codes).size,codes.length,'Duplicate district codes');
  const snapshot={source:'https://lgdirectory.gov.in/downloadDirectory.do',publisher:'Ministry of Panchayati Raj, Government of India; hosted by NIC',retrieved_at:new Date().toISOString(),method:'Public Download Directory state and district dropdowns',state_count:states.length,district_count:codes.length,states};
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,JSON.stringify(snapshot,null,2)+'\n');
  console.log('Candidate saved: '+states.length+' states/UTs; '+codes.length+' districts');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
