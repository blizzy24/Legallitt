// Local real-API browser verification. Synthetic documents only; no credentials in reports.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const {createServer} = require('node:http');
const puppeteer = require('puppeteer-core');
const {ApiClient} = require('../packages/shared/dist');
const {PDFDocument, StandardFonts} = require('../apps/api/node_modules/pdf-lib');
process.loadEnvFile('apps/api/.env.local');
const base = 'http://127.0.0.1:3003', web = 'http://localhost:8083';
const out = path.resolve('reports/pricing-2026-11-09');
fs.mkdirSync(out,{recursive:true});
const delay = ms => new Promise(r=>setTimeout(r,ms));
const json = (file,data) => fs.writeFileSync(path.join(out,file),JSON.stringify(data,null,2)+'\n');
async function click(p, text) {
  await p.waitForFunction(text=>[...document.querySelectorAll('[role="button"],button,a')].some(e=>e.getClientRects().length&&e.textContent.trim()===text&&e.getAttribute('aria-disabled')!=='true'),{timeout:60000},text);
  const handle=await p.evaluateHandle(text=>[...document.querySelectorAll('[role="button"],button,a')].find(e=>e.getClientRects().length&&e.textContent.trim()===text&&e.getAttribute('aria-disabled')!=='true'),text);
  await handle.asElement().evaluate(e=>e.scrollIntoView({block:'center'})); await handle.asElement().click(); await handle.dispose();
}
async function main() {
  const dburl = new URL(process.env.DATABASE_URL);
  assert.ok(['localhost','127.0.0.1'].includes(dburl.hostname),'Local database required');
  assert.ok(!process.env.DATABASE_SECRET_ARN,'Local walkthrough must not connect to RDS');
  const db = await require('../apps/api/dist/src/database').createDatabaseClient();
  try { await require('../apps/api/dist/prisma/seed-pricing').seedConfirmedPricing(db); }
  finally { await db.$disconnect(); }
  const apiProcess=spawn(process.execPath,['dist/src/main.js'],{cwd:path.resolve('apps/api'),env:{...process.env,PORT:'3003',CORS_ORIGINS:web,AI_MODE:'simulated'},stdio:['ignore','ignore','pipe'],windowsHide:true});
  let startupError='';apiProcess.stderr.on('data',d=>{startupError+=d.toString();});
  const root=path.resolve(process.env.PRICING_WEB_ROOT??'apps/mobile/dist');
  const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.ttf':'font/ttf','.json':'application/json'};
  const server=createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,web).pathname);
    let file=path.resolve(root,'.'+pathname);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())file=path.join(root,'index.html');
    res.setHeader('Content-Type',mime[path.extname(file)]??'application/octet-stream');res.end(fs.readFileSync(file));
  });
  let browser;
  let page;
  const sessionFiles=[];
  try {
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8083,'127.0.0.1',resolve);});
    for(let n=0;n<90;n++){if(apiProcess.exitCode!==null)throw new Error('Local API exited before startup');try{if((await fetch(base+'/health')).ok)break;}catch{}await delay(1000);}
    assert.equal((await fetch(base+'/health')).status,200);
    const password=await require('../apps/api/dist/src/auth/demo').demoPassword();
    const sessions={};
    for(const role of ['client','advocate']) {
      const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});
      assert.equal(r.status,201); sessions[role]=await r.json();
    }
    if(process.env.PRICING_SMOKE_ONLY!=='1') {
    const api=new ApiClient({baseUrl:base,getTokens:async()=>sessions.client.tokens});
    const c=await api.createCase({service_code:'legal_notice',tier:'urgent'});
    const details={client:{fullName:'TEST ONLY Pricing Sender',mobile:'2025550101',address:'Synthetic address Mumbai'},
      noticee:{fullName:'TEST ONLY Pricing Recipient',mobile:'2025550102',email:'recipient@example.invalid',address:'Synthetic address Mumbai'},issueType:'money-recovery'};
    await api.saveIntake(c.id,{details,matter_type:'money_recovery',subject_matter:'TEST ONLY pricing verification. No actual dispute.',legal_demand:{selected:[],custom:'Synthetic verification only.'}});
    await api.generateNoticeSubject(c.id);
    for(const pages of [18,12]) {
      const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica);
      for(let i=0;i<pages;i++)pdf.addPage().drawText(`TEST ONLY PRICING ${i+1}/${pages}`,{x:40,y:740,size:14,font});
      const bytes=await pdf.save();
      const ticket=await api.presign({case_id:c.id,kind:'supporting_document',filename:`TEST-pricing-${pages}-pages.pdf`,mime:'application/pdf'});
      await api.upload(ticket,new File([bytes],`TEST-pricing-${pages}-pages.pdf`,{type:'application/pdf'}));
    }
    const pending=await api.presign({case_id:c.id,kind:'supporting_document',filename:'TEST-unfinished.pdf',mime:'application/pdf'});
    await api.submit(c.id);
    browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
    page=await browser.newPage();await page.setViewport({width:430,height:1100});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(web+'/login',{waitUntil:'networkidle0'});
    await page.waitForSelector('input[placeholder="Email / Mobile No"]');
    await page.type('input[placeholder="Email / Mobile No"]','demo-client@legalitt.invalid');
    await page.type('input[aria-label="Password"]',password);await click(page,'Continue');
    await page.waitForFunction(()=>location.pathname.endsWith('/home'),{timeout:60000});
    await page.goto(web+'/legal-notice/step6?caseId='+c.id,{waitUntil:'networkidle0'});
    await page.waitForFunction(()=>document.body.innerText.includes('TEST-unfinished.pdf'));
    const blockedText=await page.evaluate(()=>document.body.innerText);
    assert.match(blockedText,/Payment is blocked/);assert.match(blockedText,/finish or remove/);
    await page.screenshot({path:path.join(out,'blocked-quote.png'),fullPage:true});
    await click(page,'Remove upload: TEST-unfinished.pdf');
    await page.waitForFunction(()=>document.body.innerText.includes('₹1,777.53'),{timeout:60000});
    const quote=await api.paymentQuote(c.id);assert.equal(quote.status,'ready');assert.equal(quote.breakdown.total_pages,30);
    const readyText=await page.evaluate(()=>document.body.innerText);
    for(const text of ['₹249.75','₹224.78','₹179.00','₹125.00','30 PDF pages'])assert.ok(readyText.includes(text),text);
    await page.screenshot({path:path.join(out,'ready-quote.png'),fullPage:true});
    console.log('Verified ready quote; opening Documents to check recovery');
    // Uploaded-document recovery must return to payment without editing paid intake.
    await page.goto(web+'/legal-notice/step4-review?caseId='+c.id,{waitUntil:'networkidle0'});
    await click(page,'Continue');await page.waitForFunction(()=>location.pathname.endsWith('/step6'));
    await page.waitForFunction(()=>document.body.innerText.includes('₹1,777.53'));
    await click(page,'Pay');await page.waitForFunction(()=>location.pathname.endsWith('/scan-pay'));
    await page.waitForFunction(()=>document.body.innerText.includes('₹1,777.53'));
    await click(page,'Pay using UPI App');await page.waitForFunction(()=>location.pathname.endsWith('/success'),{timeout:60000});
    await page.waitForFunction(()=>document.body.innerText.includes('₹1,777.53'));
    await page.screenshot({path:path.join(out,'payment-success.png'),fullPage:true});
    const paid=await api.case(c.id);assert.equal(paid.client_fees.total_paise,'177753');assert.equal(paid.advocate_payout.net_paise,'117800');
    assert.deepEqual(errors,[]);
    json('browser-verification.json',{case_id:c.id,reference:c.reference,blocked_document:pending.document.id,
      quote,receipt:paid.client_fees,advocate_payout:paid.advocate_payout,browser_errors:errors});
    console.log('PASS browser blocked quote, actionable removal, aggregate 30-page quote, payment and captured receipt');
    await browser.close();browser=undefined;
    }
    if(process.env.PRICING_SMOKE==='1') {
      const env={...process.env,CHROME_PATH:'C:/Program Files/Google/Chrome/Application/chrome.exe',SMOKE_BASE_URL:web};
      for(const role of ['client','advocate']) {
        const file=path.resolve(`apps/api/.env.pricing-${role}.local`);sessionFiles.push(file);fs.writeFileSync(file,JSON.stringify(sessions[role]));env[`SMOKE_${role.toUpperCase()}_SESSION`]=file;
      }
      const smoke=spawn(process.execPath,['scripts/mobile-smoke.mjs'],{env,stdio:'inherit',windowsHide:true});
      const code=await new Promise(resolve=>smoke.once('exit',resolve));assert.equal(code,0,'322-route browser smoke');
    }
  } catch (error) {
    if(page && !page.isClosed()) {
      console.log('Browser stopped at:',new URL(page.url()).pathname);
      await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});
      fs.writeFileSync(path.join(out,'failure.txt'),await page.evaluate(()=>document.body.innerText));
    }
    throw error;
  } finally {
    await browser?.close();server.close();apiProcess.kill();
    for(const file of sessionFiles)fs.unlinkSync(file);
  }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
