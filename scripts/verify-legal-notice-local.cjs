// Browser acceptance. Defaults to isolated local adapters; --live explicitly uses deployed sites and existing demo accounts. Never deploys or changes credentials.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist'),{PDFDocument,StandardFonts}=require('../apps/api/node_modules/pdf-lib');
const kit=require('./helpers/fir-walk-kit.cjs'),{click,fill,text,noText,has,at,dump,shot,chooseFile,go,delay}=kit;
process.loadEnvFile('apps/api/.env.local');
const live=process.argv.includes('--live');
const base=live?'https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com':'http://127.0.0.1:3003',mobile=live?'https://legalitt-5.vercel.app':'http://localhost:8083',adminWeb=live?'https://legalitt-admin-panel.vercel.app':'http://localhost:5174';
const out=path.resolve(live?'reports/notice-polish-20261112/live':'reports/notice-flow-20261112/local'),shots=path.resolve(live?'reports/notice-polish-20261112/live/screens':'docs/flows/ln-screens/built');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(shots,{recursive:true});
const stateFile=path.join(out,'state.json'),state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{cases:[],results:[]};
const save=()=>fs.writeFileSync(stateFile,JSON.stringify(state,null,2)+'\n');
const pass=name=>{state.results.push({name,at:new Date().toISOString()});save();console.log('PASS',name);};
const arg=name=>process.argv.find(v=>v.startsWith('--'+name+'='))?.slice(name.length+3);
async function pdf(name,pages=1){const doc=await PDFDocument.create(),font=await doc.embedFont(StandardFonts.Helvetica);for(let i=0;i<pages;i++)doc.addPage([595,842]).drawText('TEST ONLY - '+name+' - page '+(i+1),{x:50,y:750,font,size:15});const file=path.join(out,name+'.pdf');fs.writeFileSync(file,await doc.save());return file;}
async function main(){
 let browser;const errors=[],pages={};
 try{
   const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),api={},users={};
   for(const role of ['client','advocate','advocate-2','admin']){const response=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(response.status,201,role+' local sign-in');const session=await response.json();users[role]=session.user;api[role]=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens});}
   if(!live){const url=new URL(process.env.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));url.pathname='/legalitt_notice_local';
   const {PrismaClient}=require('../apps/api/dist/src/generated/prisma/client'),{PrismaPg}=require('../apps/api/node_modules/@prisma/adapter-pg'),db=new PrismaClient({adapter:new PrismaPg({connectionString:url.href})});
   try{for(const role of ['advocate','advocate-2'])await db.advocateProfile.upsert({where:{user_id:users[role].id},create:{user_id:users[role].id,verification:'approved',city:'Indore'},update:{verification:'approved',city:'Indore'}});await require('../apps/api/dist/prisma/seed-pricing').seedConfirmedPricing(db);}finally{await db.$disconnect();}}
   browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,protocolTimeout:120000});
   const page=async role=>{if(pages[role])return pages[role];const p=await kit.signIn(browser,null,{role,email:`demo-${role}@legalitt.invalid`,password,mobile,adminWeb,errors});pages[role]=p;
     p.on('requestfailed',r=>{if(r.url().startsWith(base+'/api/v1/'))console.log('NETWORK',role,r.method(),new URL(r.url()).pathname,r.failure()?.errorText);});
     p.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base+'/api/v1/'))console.log('HTTP',role,r.status(),r.request().method(),new URL(r.url()).pathname);});return p;};
   const snap=async(p,name)=>shot(p,path.join(shots,name+'.png'),{width:p.url().startsWith(adminWeb)?1440:430});
   const explore=arg('explore');if(explore){const [role,...rest]=explore.split(':'),p=await page(role);await go(p,(role==='admin'?adminWeb:mobile)+rest.join(':'));await dump(p,'Explore');await snap(p,'explore-'+role);return;}
   const stages=[];const stage=(name,run)=>stages.push({name,run});
   stage('intakes',async()=>{
     state.prior_cases=[...(state.prior_cases??[]),...state.cases];state.cases=[];save();
     const p=await page('client'),idFile=await pdf('synthetic-identity-no-number'),support=await pdf('supporting-evidence'),cheque=await pdf('synthetic-cheque'),memo=await pdf('synthetic-return-memo');
     for(const methods of live?[['courier']]:[['courier'],['email'],['courier','email','whatsapp']]){
       const tag=methods.join('-');await go(p,mobile+'/legal-notice');await text(p,'Choose Your Service');if(methods.length===1&&methods[0]==='courier')await snap(p,'client-landing');
       await click(p,'Get Started');await at(p,'/legal-notice/step1');const id=new URL(p.url()).searchParams.get('caseId');assert.ok(id);state.cases.push({id,methods,tag});save();
       await fill(p,'Full Name','TEST Notice Client');await fill(p,'Father’s / Husband’s name','TEST Parent');await fill(p,'Age','32');await fill(p,'Full Address','TEST ONLY, Client Street, Indore');await snap(p,'client-step1-'+tag);await click(p,'Continue');await at(p,'step2');
       await fill(p,'Noticee Full Name','TEST Notice Recipient');for(const method of methods)await click(p,{courier:'Courier to postal address',email:'Email',whatsapp:'WhatsApp'}[method]);
       if(methods.includes('courier')){await fill(p,'Noticee Full Address','TEST ONLY, Recipient Street, Indore');await fill(p,'PIN','452001');}
       if(methods.includes('email'))await fill(p,'Email Id of Noticee','recipient@example.invalid');
       if(methods.includes('whatsapp'))await fill(p,'WhatsApp Mobile Number of Noticee','9876543210');
       assert.equal(await p.$('input[aria-label="Noticee Full Address"],textarea[aria-label="Noticee Full Address"]')!==null,methods.includes('courier'));await snap(p,'client-methods-'+tag);await click(p,'Continue');await at(p,'step3');
       await click(p,methods.length===3?'Cheque Bounce':'Money Recovery');await fill(p,'Briefly describe the issue','TEST ONLY: the recipient has not returned the agreed payment. The uploaded documents explain the transaction.');
       if(methods.length===3){await fill(p,'Cheque number','123456');await fill(p,'Cheque date (YYYY-MM-DD)','2026-11-01');await fill(p,'Cheque amount (₹)','5000');await fill(p,'Bank','TEST Bank');await fill(p,'Date returned (YYYY-MM-DD)','2026-11-02');}
       await snap(p,'client-issue-'+tag);await click(p,'Continue');await at(p,'step4');await click(p,'PAN');await chooseFile(p,'Upload PAN',idFile);await text(p,'ID uploaded');
       await chooseFile(p,methods.length===3?'Upload Cheque copy *':'Upload Invoice / bill',methods.length===3?cheque:support);
       if(methods.length===3)await chooseFile(p,'Upload Bank return memo *',memo);
       await snap(p,'client-uploads-'+tag);await click(p,'Continue');await at(p,'step4-review');await text(p,'Review Your Documents');await snap(p,'client-review-files-'+tag);await click(p,'Continue');await at(p,'step5');await text(p,'TEST Notice Recipient');await snap(p,'client-summary-'+tag);await click(p,'Submit & Proceed to Pay');await at(p,'step6');await text(p,'Total Payable');
       const quote=await api.client.paymentQuote(id);assert.equal(quote.status,'ready');assert.equal(quote.breakdown.delivery_fee_paise,methods.includes('courier')?'17900':'0');state.cases.at(-1).total=quote.breakdown.total_paise;save();
       await snap(p,'client-payment-'+tag);await click(p,'Pay →');await at(p,'scan-pay');await text(p,'Test QR only');await snap(p,'client-scan-'+tag);await click(p,'Simulate successful payment');await at(p,'success');await snap(p,'client-success-'+tag);await click(p,'Start Tracking →');await at(p,'tracking');pass('Client intake/payment '+tag);
     }
   });
   const getFlow=id=>api.admin.request(`/notices/${id}/flow`);
   const assign=async(id,role)=>{const p=await page('admin');await go(p,adminWeb+'/legal-notices/'+id);await click(p,'+ Assign');await click(p,'Assign to '+users[role].name);await text(p,'Assigned');};
   const draft=async(c,role,revision)=>{
     const p=await page(role);await go(p,mobile+`/advocate/notice/${c.id}/draft`);await text(p,'Document Editor');
     const values={'Sender Details':'TEST Notice Client, aged 32, TEST Parent, Client Street, Indore','Recipient Details':'TEST Notice Recipient, '+(c.methods.includes('courier')?'Recipient Street, Indore 452001': 'recipient@example.invalid'),'Subject':c.methods.length===3?'Demand for payment of dishonoured cheque':'Demand for repayment','Background & Facts':'TEST ONLY: Payment of INR 5000 remains due under the documented transaction.'+(revision?' '+revision:''),'Legal Demand':'Repay INR 5000 to the client within the stated response period.','Response Time & Closing':'Respond in writing to the advocate within the compliance period. This notice is issued on the client’s instructions.'};
     for(const [title,value]of Object.entries(values)){await click(p,'Edit '+title);await fill(p,title,value);}
     await noText(p,'Offences');await snap(p,'advocate-editor-'+c.tag+(revision?'-revised':''));await click(p,'Continue to Review');await text(p,'Check before sending');await p.waitForSelector('canvas',{timeout:45000});await snap(p,'advocate-preview-'+c.tag);
     for(const check of ['Names and addresses are correct','Amount is correct','Demand and response days are correct'])await click(p,check);
     const f=await getFlow(c.id);await click(p,f.handed_to_admin_at?'Return corrected draft to Legalitt':'Send to Client for Review');await at(p,'/review');
   };
   stage('drafts',async()=>{
     for(const [i,c]of state.cases.entries()){
       let r=await api.client.case(c.id);const role=i===0?'advocate-2':'advocate';c.advocate=role;save();
       if(['paid','assigning','advocate_declined'].includes(r.status)){
         if(i===0&&!c.declined){await assign(c.id,'advocate');const a=await page('advocate');await go(a,mobile+`/advocate/notice/${c.id}/fee`);await click(a,'Decline Request');await fill(a,'Decline reason','TEST ONLY: unavailable for this deadline.');await snap(a,'advocate-decline');await click(a,'Confirm decline');await at(a,'/matters');c.declined=true;save();}
         await assign(c.id,role);
       }
       r=await api.client.case(c.id);const a=await page(role),p=await page('client');
       if(r.status==='assigned'){await go(a,mobile+`/advocate/notice/${c.id}/fee`);await snap(a,'advocate-fee-'+c.tag);await click(a,'Accept Request');await at(a,'/documents');await text(a,'CASE SUMMARY');await snap(a,'advocate-documents-'+c.tag);await click(a,'Continue to Draft');await snap(a,'advocate-drafting-method');await click(a,'Create Draft Manually');await click(a,'Continue with manual draft');}
       r=await api.client.case(c.id);if(['advocate_accepted','in_progress','changes_requested'].includes(r.status))await draft(c,role,c.client_changed?'Client correction included.':'');
       await go(p,mobile+'/legal-notice/tracking?caseId='+c.id);await text(p,'Your Legal Notice Draft is Ready');await snap(p,'client-draft-ready-'+c.tag);
       if(i===0&&!c.client_changed){await click(p,'Review Draft →');await at(p,'document-viewer');await p.waitForSelector('canvas',{timeout:45000});await snap(p,'client-document-viewer');await go(p,mobile+'/legal-notice/tracking?caseId='+c.id);await click(p,'Request Changes');await click(p,'Facts');await fill(p,'Describe requested changes','Please clarify that this is the agreed repayment, not a new loan.');await snap(p,'client-request-changes');await click(p,'Submit requested changes');await noText(p,'Submit requested changes');c.client_changed=true;save();await draft(c,role,'This is the agreed repayment, not a new loan.');await go(p,mobile+'/legal-notice/tracking?caseId='+c.id);await text(p,'Your Legal Notice Draft is Ready');}
       await click(p,'Approve & Proceed');await text(p,'Approve this notice?');await click(p,'Approve & Proceed');await text(p,'Your notice is being finalised');assert.equal((await getFlow(c.id)).chat.writable,false);await snap(p,'client-admin-handoff-'+c.tag);
       await click(p,'View case chat');await at(p,'/chat/advocate');await text(p,'read-only');await snap(p,'client-chat-readonly-'+c.tag);pass('Advocate draft/client approval '+c.tag);
     }
   });
   stage('admin',async()=>{
     const p=await page('admin');
     for(const [i,c]of state.cases.entries()){
       await go(p,adminWeb+'/legal-notices/'+c.id);let f=await getFlow(c.id);
       if(f.sub_status==='notice_admin_address_check'){await snap(p,'admin-address-check-'+c.tag);await click(p,'Mark delivery contacts verified');await text(p,'Notice verification');}
       if(i===0&&!c.admin_returned){await fill(p,'Admin correction reason','TEST: make the repayment basis explicit in the facts paragraph.');await snap(p,'admin-return');await click(p,'Return notice for correction');await text(p,'Returned to advocate');c.admin_returned=true;save();await draft(c,c.advocate,'The repayment basis is the written agreement supplied by the client.');await go(p,adminWeb+'/legal-notices/'+c.id);f=await getFlow(c.id);if(f.sub_status==='notice_admin_address_check'){await click(p,'Mark delivery contacts verified');await text(p,'Notice verification');}}
       f=await getFlow(c.id);if(f.sub_status==='notice_admin_notice_check'){await click(p,'Open the approved notice PDF');await p.waitForSelector('iframe[title="Notice PDF preview"]');await p.$$eval('.notice-flow input[type=checkbox]',els=>els.forEach(e=>e.click()));await snap(p,'admin-notice-check-'+c.tag);await click(p,'Approve notice for test e-sign');await text(p,'Awaiting advocate’s test e-sign');}
       f=await getFlow(c.id);if(f.sub_status==='notice_admin_awaiting_test_esign'){const a=await page(c.advocate);await go(a,mobile+`/advocate/notice/${c.id}/review`);await text(a,'Aadhaar e-Sign · TEST STEP');await snap(a,'advocate-test-esign-'+c.tag);await click(a,'Complete test e-sign');await text(a,'Test e-sign step completed');}
       await go(p,adminWeb+'/legal-notices/'+c.id);await snap(p,'admin-dispatch-ready-'+c.tag);pass('Admin verification/test e-sign '+c.tag);
     }
   });
   const methodArticle=async(p,method)=>{const h=await p.evaluateHandle(m=>[...document.querySelectorAll('.notice-delivery-method')].find(e=>e.querySelector('h3')?.textContent.startsWith(m)),{courier:'Courier',email:'Email',whatsapp:'WhatsApp'}[method]);assert.ok(h.asElement(),method+' panel');return h.asElement();};
   const labeled=async(root,label)=>{const h=await root.evaluateHandle((el,label)=>[...el.querySelectorAll('label')].find(e=>[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim()===label)?.querySelector('input,textarea,select'),label);assert.ok(h.asElement(),'Field '+label);return h.asElement();};
   const enter=async(root,label,value)=>{const h=await labeled(root,label);await h.click({clickCount:3});await h.press('Backspace');await h.type(value);await h.dispose();};
   const button=async(root,label)=>{const h=await root.evaluateHandle((el,label)=>[...el.querySelectorAll('button')].find(e=>e.textContent===label),label);assert.ok(h.asElement(),'Button '+label);await h.asElement().click();await h.dispose();await delay(700);};
   stage('delivery',async()=>{
     const p=await page('admin'),clientPage=await page('client'),proof=await pdf('TEST-delivery-proof');
     for(const [index,c]of state.cases.entries()){
       for(const method of c.methods){
         await go(p,adminWeb+'/legal-notices/'+c.id);let f=await getFlow(c.id),latest=f.attempts.filter(a=>a.method===method).at(-1);if(latest?.status==='delivered')continue;
         if(!latest||latest.status==='failed'&&c.recovered){
           const article=await methodArticle(p,method);
           if(method==='courier'){await enter(article,'Courier name','TEST Courier');await enter(article,'Waybill number','TEST-'+c.tag+(c.failed?'-retry':''));await button(article,'Record courier dispatch');}
           else if(method==='whatsapp'){await (await article.$('input[type=checkbox]')).click();await button(article,'Mark WhatsApp sent manually');}
           else await button(article,'Send email through SES');await text(p,'Attempt');await delay(600);
         }
         f=await getFlow(c.id);latest=f.attempts.filter(a=>a.method===method).at(-1);assert.ok(['sent','failed'].includes(latest?.status));await snap(p,'admin-sent-'+c.tag+'-'+method);
         if(index===0&&method==='courier'&&!c.recovered){
           if(!c.failed){const article=await methodArticle(p,method);await enter(article,'Failed delivery reason','TEST: address could not be located.');await button(article,'Mark delivery failed and notify client');c.failed=true;save();await text(p,'Failed delivery · action required');await snap(p,'admin-failed-delivery');}
           f=await getFlow(c.id);let task=f.tasks.find(t=>t.kind==='contact'&&t.method==='courier');assert.ok(task,'Failure requests contact correction');
           if(task.status==='requested'){await go(clientPage,mobile+'/legal-notice/tracking?caseId='+c.id);await text(clientPage,'Update delivery contact');await fill(clientPage,'New postal address','TEST ONLY, Corrected Recipient Street, Indore');await fill(clientPage,'PIN','452001');await snap(clientPage,'client-address-correction');await click(clientPage,'Send update to Legalitt');await text(clientPage,'Your update is waiting for Legalitt’s check.');}
           f=await getFlow(c.id);task=f.tasks.find(t=>t.id===task.id);if(task.status==='responded'){await go(p,adminWeb+'/legal-notices/'+c.id);await click(p,'Verify client’s update');}await go(clientPage,mobile+'/legal-notice/tracking?caseId='+c.id);await click(clientPage,'Pay ₹179 for courier redelivery (test)');await delay(800);
           await go(p,adminWeb+'/legal-notices/'+c.id);const article=await methodArticle(p,method);await enter(article,'Courier name','TEST Courier');await enter(article,'Waybill number','TEST-RETRY');await button(article,'Record courier dispatch');f=await getFlow(c.id);assert.equal(f.attempts.filter(a=>a.method==='courier').length,2);assert.equal(f.attempts.at(-1).recipient.address,'TEST ONLY, Corrected Recipient Street, Indore');c.recovered=true;save();await snap(p,'admin-retry');
         }
         let article=await methodArticle(p,method);
         if(method==='courier'){await enter(article,'Place','TEST Indore hub');await enter(article,'Status update','TEST courier update: out for delivery');await button(article,'Add tracking update');await text(p,'out for delivery');article=await methodArticle(p,method);await enter(article,'Received by','TEST Recipient');const input=await labeled(article,'Proof of delivery (required)');await input.uploadFile(proof);await text(p,'Delivery proof uploaded.');await snap(p,'admin-tracking-proof-'+c.tag);}
         await button(await methodArticle(p,method),'Confirm '+{courier:'Courier',email:'Email',whatsapp:'WhatsApp'}[method]+' delivered');await delay(600);assert.equal((await getFlow(c.id)).attempts.filter(a=>a.method===method).at(-1).status,'delivered');
       }
       assert.equal((await getFlow(c.id)).status,'completed');await snap(p,'admin-completed-'+c.tag);await go(clientPage,mobile+'/legal-notice/delivery?caseId='+c.id);await text(clientPage,'Notice Delivery · Completed');await snap(clientPage,'client-delivered-'+c.tag);
       const a=await page(c.advocate);await go(a,mobile+`/advocate/notice/${c.id}/tracking`);await text(a,'added to your wallet');await snap(a,'advocate-credit-'+c.tag);pass('Dispatch, delivery and advocate credit '+c.tag);
     }
   });
   stage('cancellation',async()=>{
     const c=state.prior_cases.find(c=>c.id==='149e6bbc-3ef2-46a2-a6ff-b495023fc0ba');assert.ok(c,'Retained initial local intake for cancellation');state.cancellation_case_id=c.id;save();const p=await page('client');let r=await api.client.case(c.id);
     if(r.status==='draft'){await go(p,mobile+'/legal-notice/step4?caseId='+c.id);await chooseFile(p,'Upload Invoice / bill',await pdf('cancellation-support'));await click(p,'Continue');await at(p,'step4-review');await click(p,'Continue');await at(p,'step5');await click(p,'Submit & Proceed to Pay');await at(p,'step6');}
     r=await api.client.case(c.id);if(r.status==='payment_pending'){await go(p,mobile+'/legal-notice/step6?caseId='+c.id);await click(p,'Pay →');await at(p,'scan-pay');await click(p,'Simulate successful payment');await at(p,'success');}
     await go(p,mobile+'/cases/cancel?caseId='+c.id);await text(p,'Before You Cancel');await fill(p,'Tell us why you want to cancel','TEST ONLY: cancellation before an advocate accepts.');await click(p,'I understand that this will cancel my request.',{contains:true});await snap(p,'client-cancel-before-acceptance');await click(p,'Cancel Request');await text(p,'Cancel this request?');await click(p,'Cancel Request');await text(p,'This request is cancelled');await snap(p,'client-cancelled-refund');const result=await api.client.caseCancellation(c.id);assert.equal(result.status,'refunded');assert.equal(result.refunds.reduce((sum,x)=>sum+BigInt(x.amount_paise),0n),165253n);pass('Cancellation before acceptance with full simulated refund');
   });
   stage('states',async()=>{
     const c=state.cases[0],f=await getFlow(c.id),p=await page('client'),a=await page(c.advocate),admin=await page('admin');
     const screens=[...['step1','step2','step3','step4','step4-review','step5','step6','tracking','delivery','success'].map(screen=>[p,'/legal-notice/'+screen+'?caseId='+c.id,'client-'+screen]),[p,'/document-viewer?documentId='+f.document_id,'document-viewer'],...['fee','documents','drafting','draft','review','tracking'].map(screen=>[a,`/advocate/notice/${c.id}/${screen}`,'advocate-'+screen]),[admin,'/legal-notices/'+c.id,'admin-workflow']];
     for(const [page,route,name]of screens){
       for(const mode of ['loading','error']){
         const waiting=[];await page.setRequestInterception(true);const intercept=req=>{if(req.url().startsWith(base+'/api/v1/')&&(/\/(cases|notices|documents)\//.test(req.url()))){if(mode==='loading')waiting.push(req);else void req.respond({status:503,contentType:'application/json',body:JSON.stringify({message:'Local verification: unable to load this request. Please retry.'})});}else void req.continue();};page.on('request',intercept);
         try{await page.goto((page===admin?adminWeb:mobile)+route,{waitUntil:'domcontentloaded'});await delay(mode==='loading'?350:1200);if(mode==='error')await page.waitForFunction(()=>/retry|try again/i.test(document.body.innerText),{timeout:20000});await snap(page,'state-'+name+'-'+mode);}
         finally{page.off('request',intercept);for(const req of waiting)if(!req.isInterceptResolutionHandled())await req.continue().catch(()=>{});await page.setRequestInterception(false);}
       }
     }
     await go(p,mobile+'/legal-notice/step1');await text(p,'Start a Legal Notice request');await snap(p,'state-intake-empty');await go(p,mobile+'/document-viewer');await text(p,'No document available');await snap(p,'state-viewer-empty');await go(p,mobile+'/legal-notice/tracking');await text(p,'Select a Legal Notice');await snap(p,'state-tracking-empty');
     const partial=await api.client.createCase({service_code:'legal_notice',tier:'ordinary'});state.partial_case_id=partial.id;save();await api.client.request(`/notices/${partial.id}/filing`,{intake_version:2,client:{fullName:'TEST partial filing'},noticee:{methods:[]}},'PUT');await go(p,mobile+'/legal-notice/step1?caseId='+partial.id);await text(p,'TEST partial filing').catch(()=>{});await snap(p,'state-intake-partial');await click(p,'Continue');await text(p,'Complete this client detail');await snap(p,'state-intake-validation');
     // Reopen completed documents on the final frontend candidate after restart.
     await go(a,mobile+`/advocate/notice/${c.id}/documents`);await snap(a,'advocate-documents-final');await go(p,mobile+'/document-viewer?documentId='+f.document_id);await p.waitForSelector('canvas',{timeout:45000});await snap(p,'client-document-viewer-final');pass('Loading/error/empty/partial screen states and final viewer');
   });
   stage('evidence',async()=>{
     const p=await page('client'),a=await page('advocate-2'),completed=state.cases[0];
     for(const [route,expected,name]of [['/legal-notice/step1','Start a Legal Notice request','state-intake-empty'],['/document-viewer','No document available','state-viewer-empty'],['/legal-notice/tracking','Select a Legal Notice','state-tracking-empty']]){await go(p,mobile+route);await text(p,expected);await snap(p,name);}
     let partial=state.partial_case_id?await api.client.case(state.partial_case_id):await api.client.createCase({service_code:'legal_notice',tier:'ordinary'});state.partial_case_id=partial.id;save();await api.client.request(`/notices/${partial.id}/filing`,{intake_version:2,client:{fullName:'TEST partial filing'},noticee:{methods:[]}},'PUT');await go(p,mobile+'/legal-notice/step1?caseId='+partial.id);await snap(p,'state-intake-partial');await click(p,'Continue');await text(p,'Complete this client detail');await snap(p,'state-intake-validation');
     await go(a,mobile+`/advocate/notice/${completed.id}/documents`);await snap(a,'advocate-documents-final');const final=await getFlow(completed.id);await go(p,mobile+'/document-viewer?documentId='+final.document_id);await p.waitForSelector('canvas');await snap(p,'client-document-viewer-final');
     for(const role of ['advocate','advocate-2']){const wallet=await api[role].wallet('all');for(const c of state.cases.filter(c=>c.advocate===role)){const entries=wallet.entries.filter(e=>e.case_id===c.id);assert.equal(entries.length,1);assert.equal(entries[0].share_paise,'99900');}const page=await (role==='advocate'?pageForAdvocate():Promise.resolve(a));await go(page,mobile+'/earnings');await snap(page,'advocate-wallet-'+role);}
     async function pageForAdvocate(){return page('advocate');}
     // Additional synthetic fixture uses the real upload/payment handlers to
     // exercise the final editor candidate and the AI choice, without rebuilding
     // any of the three completed acceptance cases.
     let c=state.editor_case_id?await api.client.case(state.editor_case_id):await api.client.createCase({service_code:'legal_notice',tier:'urgent'});state.editor_case_id=c.id;save();
     if(c.status==='draft'){
       const source=await api.client.case(completed.id);await api.client.request(`/notices/${c.id}/filing`,source.details,'PUT');
       for(const kind of ['id_proof','notice_support_invoice']){const file=await pdf('TEST-editor-'+kind),ticket=await api.client.presign({case_id:c.id,kind,filename:kind+'.pdf',mime:'application/pdf'});await api.client.upload(ticket,new File([fs.readFileSync(file)],kind+'.pdf',{type:'application/pdf'}));}await api.client.submit(c.id);
     }
     c=await api.client.case(c.id);if(c.status==='payment_pending'){await go(p,mobile+'/legal-notice/step6?caseId='+c.id);await text(p,'Test payment only');await snap(p,'client-payment-final');await click(p,'Pay →');await at(p,'scan-pay');await click(p,'Simulate successful payment');await at(p,'success');}
     c=await api.client.case(c.id);if(['paid','assigning'].includes(c.status))await assign(c.id,'advocate-2');
     c=await api.client.case(c.id);await go(a,mobile+`/advocate/notice/${c.id}/fee`);await snap(a,'advocate-fee-final');if(c.status==='assigned'){await click(a,'Accept Request');await at(a,'documents');await snap(a,'advocate-documents-final');await click(a,'Continue to Draft');await snap(a,'advocate-drafting-method');await click(a,'Continue to AI-assisted editor');await text(a,'TEST AI suggestion');await snap(a,'advocate-ai-test-suggestion');await click(a,'Keep my draft');}
     await go(a,mobile+`/advocate/notice/${c.id}/draft`);await text(a,'Document Editor');await snap(a,'advocate-editor-final');pass('Final candidate: partial/empty recovery, PDF viewer, wallet entries and AI draft choice');
   });
   stage('final-smoke',async()=>{
     const p=await page('client'),id=state.partial_case_id;assert.ok(id);await go(p,mobile+'/legal-notice/step1?caseId='+id);await fill(p,'Full Name','TEST resumable filing');await fill(p,'Father’s / Husband’s name','TEST Parent');await fill(p,'Age','35');await fill(p,'Full Address','TEST resume address, Indore');await click(p,'Continue');await at(p,'step2');await click(p,'Back');await at(p,'step1');assert.equal(await p.$eval('input[aria-label="Full Name"]',e=>e.value),'TEST resumable filing');await p.reload({waitUntil:'networkidle2'});assert.equal(await p.$eval('input[aria-label="Full Name"]',e=>e.value),'TEST resumable filing');assert.equal((await api.client.case(id)).details.client.age,35);await snap(p,'client-resumed-final');
     await draft({id:state.editor_case_id,tag:'final',methods:['courier']},'advocate-2','Final candidate local verification.');
     const expected=['client-step1','client-step2','client-step3','client-step4','client-step4-review','client-step5','client-step6','client-tracking','client-delivery','client-success','document-viewer','advocate-fee','advocate-documents','advocate-drafting','advocate-draft','advocate-review','advocate-tracking','admin-workflow'];for(const name of expected)for(const mode of ['loading','error'])assert.ok(fs.existsSync(path.join(shots,'state-'+name+'-'+mode+'.png')));
     pass('Final candidate resumes saved intake and sends the six-section PDF; 36 loading/error captures checked');
   });
   stage('checkout-states',async()=>{
     const p=await page('client'),c=await api.client.case(state.editor_case_id),event=c.events.find(e=>e.type==='payment_checkout_created');assert.ok(event);
     for(const mode of ['loading','error']){const waiting=[];await p.setRequestInterception(true);const intercept=req=>{if(req.url().startsWith(base+'/api/v1/payments/checkouts/')){if(mode==='loading')waiting.push(req);else void req.respond({status:503,contentType:'application/json',body:JSON.stringify({message:'Local checkout failure; retry'})});}else void req.continue();};p.on('request',intercept);try{await p.goto(mobile+'/legal-notice/scan-pay?caseId='+c.id+'&checkoutId='+event.id,{waitUntil:'domcontentloaded'});await delay(900);await text(p,mode==='loading'?'Loading payment session':'Retry');await snap(p,'state-scan-pay-'+mode);}finally{p.off('request',intercept);for(const req of waiting)if(!req.isInterceptResolutionHandled())await req.continue().catch(()=>{});await p.setRequestInterception(false);}}
     await go(p,mobile+'/legal-notice/scan-pay');await text(p,'Open Complete Payment');await snap(p,'state-scan-pay-empty');await go(p,mobile+'/legal-notice/scan-pay?caseId='+c.id+'&checkoutId='+event.id);await text(p,'Payment received');await snap(p,'state-scan-pay-recovered');pass('Checkout loading/error/empty and captured-payment recovery');
   });
   stage('blocked-payment',async()=>{
     const p=await page('client');let c=state.blocked_case_id?await api.client.case(state.blocked_case_id):await api.client.createCase({service_code:'legal_notice',tier:'urgent'});state.blocked_case_id=c.id;save();
     if(c.status==='draft'){await api.client.request(`/notices/${c.id}/filing`,(await api.client.case(state.cases[0].id)).details,'PUT');for(const kind of ['id_proof','notice_support_invoice']){const file=await pdf('TEST-quote-'+kind),ticket=await api.client.presign({case_id:c.id,kind,filename:kind+'.pdf',mime:'application/pdf'});await api.client.upload(ticket,new File([fs.readFileSync(file)],kind+'.pdf',{type:'application/pdf'}));}await api.client.submit(c.id);}
     await api.client.presign({case_id:c.id,kind:'notice_support_pending',filename:'TEST unfinished upload.pdf',mime:'application/pdf'});assert.equal((await api.client.paymentQuote(c.id)).status,'blocked');await go(p,mobile+'/legal-notice/step6?caseId='+c.id);await text(p,'No payment has been taken');await snap(p,'client-quote-blocked');await click(p,'Open Documents');await text(p,'This upload did not finish');await text(p,'Its details are read-only');await snap(p,'client-unfinished-upload');await click(p,'Remove unfinished upload');await text(p,'Remove this document?');await click(p,'Remove document');await noText(p,'This upload did not finish');await click(p,'Return to payment');await at(p,'step6');await text(p,'Total Payable');assert.equal((await api.client.paymentQuote(c.id)).status,'ready');await snap(p,'client-quote-recovered');pass('Unfinished upload blocks payment explicitly; removal restores the quote without charging');
   });
   stage('polish',async()=>{
     const client=await page('client'),c=state.cases[0],adv=await page(c.advocate??'advocate-2');
     const wallet=await api[c.advocate??'advocate-2'].wallet('all'),credits=wallet.entries.filter(e=>e.case_id===c.id);
     assert.equal(credits.length,1,'Completed case credited exactly once');assert.equal(credits[0].share_paise,'99900','Urgent advocate share');
     pass('Completed case has exactly one advocate ledger credit of ₹999');
     await go(client,mobile+'/legal-notice');await text(client,'Choose Your Service');await client.waitForSelector('img[src*=notice-hero]');
     assert.ok(await client.$eval('img[src*=notice-hero]',e=>e.complete&&e.naturalWidth>0),'Supplied hero loaded');
     await snap(client,'client-landing');
     const original=client.url();for(const title of ['Assistance Service','Quick Submission']){await client.$$eval('[role=radio]',(els,title)=>{const card=els.find(e=>e.textContent.includes(title));if(!card)throw Error('Missing option card');card.click();},title);assert.equal(client.url(),original);}
     if(!live){
       let filing=state.visual_case_id?await api.client.case(state.visual_case_id):await api.client.createCase({service_code:'legal_notice',tier:'urgent'});
       state.visual_case_id=filing.id;save();
       await api.client.request(`/notices/${filing.id}/filing`,(await api.client.case(c.id)).details,'PUT');
       for(const kind of ['id_proof','notice_support_invoice'])if(!filing.documents?.some(d=>d.kind===kind)){
         const file=await pdf('TEST-polish-'+kind),ticket=await api.client.presign({case_id:filing.id,kind,filename:'test-evidence.pdf',mime:'application/pdf'});
         await api.client.upload(ticket,new File([fs.readFileSync(file)],'test-evidence.pdf',{type:'application/pdf'}));
       }
       for(const [route,name]of [['step4','client-uploads-polished'],['step4-review','client-review-files-polished']]){await go(client,mobile+'/legal-notice/'+route+'?caseId='+filing.id);await text(client,route==='step4'?'ID uploaded':'Review Your Documents');await snap(client,name);}
     }
     for(const [p,url,name]of [[client,'/legal-notice/tracking?caseId='+c.id,'client-tracking-polished'],[client,'/legal-notice/delivery?caseId='+c.id,'client-delivered-courier'],[adv,'/advocate/notice/'+c.id+'/documents','advocate-documents-final'],[adv,'/advocate/notice/'+c.id+'/tracking','advocate-credit-courier']]){
       await go(p,mobile+url);await text(p,url.includes('documents')?'UPLOADED FILES':url.includes('tracking?')?'REQUEST STATUS':'Notice');
       const body=await p.evaluate(()=>document.body.innerText);assert.ok(!/Identity-proof-[0-9a-f-]{36}/i.test(body));assert.ok(!/\d{1,2}:\d{2}:\d{2}/.test(body),'No seconds in displayed dates');
       const primary=await p.$$eval('[role=button],button',els=>els.filter(e=>e.getClientRects().length&&['rgb(176, 156, 130)'].includes(getComputedStyle(e).backgroundColor)).map(e=>e.textContent));assert.ok(primary.length<=1,'At most one primary action: '+primary.join(', '));
       if(url.includes('/documents'))await text(p,'Identity proof (Aadhaar / PAN)');
       if(url.includes('tracking?')){assert.match(body,/\d{1,2} [A-Z][a-z]{2} 2026, \d{1,2}:\d{2} [AP]M/);await text(p,'Your legal notice request has been received.');}
       await snap(p,name);
     }
     const flow=await getFlow(c.id);await go(client,mobile+'/document-viewer?documentId='+flow.document_id);await client.waitForSelector('canvas',{timeout:45000});await text(client,'Legal Notice PDF');await snap(client,'client-document-viewer-final');
     pass('Polish: hero, selectable cards, button hierarchy, safe document labels, timeline dates/details and PDF viewer');
   });
   const from=arg('from'),only=arg('only');let started=!from;for(const stage of stages){if(stage.name===from)started=true;if(!started||only&&stage.name!==only)continue;console.log('STAGE',stage.name);await stage.run();}
   fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({checked_at:new Date().toISOString(),environment:live?'deployed dev':'local',simulated:live?['payments','test e-sign','synthetic courier records; no parcel sent']:['payments','object storage','AI','external email'],cases:state.cases,results:state.results,page_errors:errors},null,2)+'\n');assert.deepEqual(errors,[],'No uncaught browser errors');
 }catch(error){for(const [role,p]of Object.entries(pages)){await dump(p,role+' failure').catch(()=>{});await p.screenshot({path:path.join(out,'failure-'+role+'.png')}).catch(()=>{});}throw error;}finally{await browser?.close();}
}
main().catch(error=>{console.error('FAIL',error.message);process.exitCode=1;});
