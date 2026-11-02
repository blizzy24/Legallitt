// Synthetic local-only verification of the owner-instructed seven-step intake.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const puppeteer = require('puppeteer-core');
const {ApiClient} = require('../packages/shared/dist');
const {PDFDocument} = require('../apps/api/node_modules/pdf-lib');
(async () => {
  const mode = process.env.INTAKE_VERIFY_MODE;
  assert.ok(['simulated','gemini'].includes(mode));
  const out = path.resolve('reports/notice-intake-2026-11-02', mode); fs.mkdirSync(out,{recursive:true});
  const auth = await fetch('http://127.0.0.1:3001/api/v1/auth/otp/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:'2025550101',code:'123456',role:'client'})});
  const session = await auth.json(); assert.equal(auth.status,201,JSON.stringify(session.message));
  const api = new ApiClient({baseUrl:'http://127.0.0.1:3001',getTokens:async()=>session.tokens});
  const browser = await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  let p, caseId; const errors=[], generated=[];
  try {
    p = await browser.newPage(); await p.setViewport({width:390,height:900,isMobile:true});
    p.on('pageerror',e=>errors.push(e.message));
    p.on('response',async r=>{if(/\/(subject|demand-options)$/.test(r.url()) && r.request().method()==='POST') generated.push({url:r.url(),status:r.status(),body:await r.json()});});
    await p.evaluateOnNewDocument(tokens=>sessionStorage.setItem('legalitt.auth.tokens',JSON.stringify(tokens)),session.tokens);
    
    async function click(label,role='button') {
      await p.waitForFunction((label,role)=>[...document.querySelectorAll(`[role="${role}"],button`)].some(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.getClientRects().length&&(e.getAttribute('aria-label')===label||e.textContent.trim()===label)&&e.getAttribute('aria-disabled')!=='true'),{timeout:90000},label,role);
      const el = await p.evaluateHandle((label,role)=>[...document.querySelectorAll(`[role="${role}"],button`)].filter(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.getClientRects().length&&(e.getAttribute('aria-label')===label||e.textContent.trim()===label)&&e.getAttribute('aria-disabled')!=='true').at(-1),label,role);
      await el.asElement().click(); await el.dispose();
    }
    async function fill(label,value){
      const sel=`input[aria-label=${JSON.stringify(label)}],textarea[aria-label=${JSON.stringify(label)}]`;
      await p.waitForSelector(sel);
      const els=await p.$$(sel);let el;
      for(const e of els) if(await e.evaluate(e=>!e.closest('[aria-hidden="true"],[inert]'))) el=e;
      assert.ok(el,label);await el.click({clickCount:3});await el.press('Backspace');await el.type(value,{delay:5});
    }
    async function route(s){await p.waitForFunction(s=>location.pathname===s,{timeout:90000},s);console.log(s);}
    async function shot(n){await p.evaluate(()=>document.activeElement?.blur());await new Promise(r=>setTimeout(r,600));await p.screenshot({path:path.join(out,n+'.png')});}
    await p.goto('http://localhost:8081/legal-notice',{waitUntil:'networkidle0',timeout:120000});
    await click('Get Started');await route('/legal-notice/step3');caseId=new URL(p.url()).searchParams.get('caseId');assert.ok(caseId,'API mode creates a case');
    await click('Continue');await p.waitForFunction(()=>document.body.innerText.includes('enter the subject matter'));
    await click('Money Recovery');
    const matter = 'Synthetic test: an agreed invoice of Rs 5000 remains unpaid after the stated due date.';
    await fill('Subject matter in dispute',matter);await shot('01-type');
    await click('Continue');await route('/legal-notice/step2');
    for(const [k,v] of Object.entries({'Noticee Full Name':'Noticee Test','Mobile Number of Noticee':'2025550102','Email Id of Noticee':'noticee@example.invalid','Relationship':'Customer','Full Address':'Synthetic noticee address, Mumbai'}))await fill(k,v);
    await shot('02-noticee');await click('Continue');await route('/legal-notice/step1');
    for(const [k,v] of Object.entries({'Full Name':'Sender Test','Age':'41','Father’s name (S/o Shri)':'Father Test','Mobile Number':'2025550101','Email Address':'sender@example.invalid','Full Address':'Synthetic sender address, Mumbai'}))await fill(k,v);
    await shot('03-sender');await click('Continue');await route('/legal-notice/demand');
    await p.waitForFunction(()=>[...document.querySelectorAll('[role="checkbox"]')].filter(e=>!e.closest('[aria-hidden="true"],[inert]')).length>=2,{timeout:90000});
    const options = await p.$$eval('[role="checkbox"]',els=>els.filter(e=>!e.closest('[aria-hidden="true"],[inert]')).map(e=>e.textContent.trim()));
    await click(options[0],'checkbox');await click(options[1],'checkbox');
    await fill('Write your own demand','Please confirm the outstanding balance in writing.');
    await shot('04-demand');
    await click('Back');await route('/legal-notice/step1');
    assert.equal(await p.$eval('input[aria-label="Age"]',el=>el.value),'41');
    await click('Continue');await route('/legal-notice/demand');
    await p.waitForFunction(()=>[...document.querySelectorAll('textarea[aria-label="Write your own demand"]')].some(e=>!e.closest('[aria-hidden="true"],[inert]')&&e.value==='Please confirm the outstanding balance in writing.'));
    assert.equal(await p.$$eval('[role="checkbox"][aria-checked="true"]',els=>els.filter(e=>!e.closest('[aria-hidden="true"],[inert]')).length),2);
    console.log('restored demands',JSON.stringify((await api.case(caseId)).legal_demand));
    await click('Continue');await route('/legal-notice/step4');
    const pdf=await PDFDocument.create();pdf.addPage().drawText('Synthetic intake verification document.');
    const file='/private/tmp/legalitt-intake-verification.pdf';fs.writeFileSync(file,await pdf.save());
    const [chooser]=await Promise.all([p.waitForFileChooser(),click('Upload Agreement')]);await chooser.accept([file]);
    // Wait for the real upload to be completed before leaving the screen.
    for(let n=0;n<60;n++){if((await api.case(caseId)).documents.length)break;await new Promise(r=>setTimeout(r,500));}
    assert.equal((await api.case(caseId)).documents.length,1);
    await click('Verify identity');await route('/kyc/choose');await click('Continue');await route('/kyc/digilocker/connect');
    await click('Continue to DigiLocker');await route('/kyc/digilocker/verified');await click('Continue');await route('/legal-notice/step4');
    await shot('05-documents');await click('Continue');await route('/legal-notice/step4-review');await shot('05-document-review');await click('Continue');await route('/legal-notice/step5');
    await shot('06-review');await click('Submit & Proceed to Pay');await route('/legal-notice/step6');await shot('07-payment');
    const beforePay=await api.case(caseId);assert.equal(beforePay.status,'payment_pending');
    assert.equal(beforePay.subject_matter,matter);assert.ok(beforePay.subject_line);assert.deepEqual(beforePay.legal_demand,{selected:options.slice(0,2),custom:'Please confirm the outstanding balance in writing.'});
    assert.equal(beforePay.parties.find(x=>x.kind==='sender').age,41);assert.equal(beforePay.parties.find(x=>x.kind==='sender').father_name,'Father Test');
    await click('Pay');await route('/legal-notice/scan-pay');await click('Pay using UPI App');await route('/legal-notice/success');await shot('08-success');
    const paid=await api.case(caseId);assert.ok(paid.events.some(e=>e.to_status==='paid'));
    assert.ok(generated.length>=2);assert.ok(generated.every(r=>r.status===201&&r.body.simulated===(mode==='simulated')));
    assert.deepEqual(errors,[]);
    const report={mode,id:caseId,reference:paid.reference,subject_matter:paid.subject_matter,subject_line:paid.subject_line,legal_demand:paid.legal_demand,
      sender:paid.parties.find(x=>x.kind==='sender'),noticee:paid.details.noticee,events:paid.events.filter(e=>e.type.includes('generated')).map(({type,source})=>({type,source})),generated,paid:true,screenshots:fs.readdirSync(out).filter(x=>x.endsWith('.png'))};
    for(const name of ['failure.png','failure.txt']) fs.rmSync(path.join(out,name),{force:true});
    report.screenshots=fs.readdirSync(out).filter(x=>x.endsWith('.png'));
    fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({mode,caseId,reference:paid.reference,paid:true,screenshots:report.screenshots.length}));
  }catch(e){if(p){await p.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});fs.writeFileSync(path.join(out,'failure.txt'),String(e)+'\n'+await p.evaluate(()=>document.body.innerText).catch(()=>''));}throw e;}
  finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
