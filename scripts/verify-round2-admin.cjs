// Local-only reminder/deadline verification. Changes timestamps only on this
// script's own new, tagged synthetic case. Does not mutate other cases/settings.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),puppeteer=require('puppeteer-core');
const {ApiClient}=require('../packages/shared/dist'),kit=require('./helpers/fir-walk-kit.cjs');
process.loadEnvFile('apps/api/.env.local');
const out='reports/round2-20261113/admin-local';fs.mkdirSync(out,{recursive:true});
const stateFile=path.join(out,'state.json'),state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile)):{};
const save=()=>fs.writeFileSync(stateFile,JSON.stringify(state,null,2)+'\n');
(async()=>{const url=new URL(process.env.DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));url.pathname='/legalitt_report_local';
 const {PrismaClient}=require('../apps/api/dist/src/generated/prisma/client'),{PrismaPg}=require('../apps/api/node_modules/@prisma/adapter-pg'),db=new PrismaClient({adapter:new PrismaPg({connectionString:url.href})});
 let browser;try{
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),api={},users={},base='http://127.0.0.1:3004',mobile='http://localhost:8084',adminWeb='http://localhost:5175';
 for(const role of ['client','advocate','admin']){const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});assert.equal(r.status,201);const session=await r.json();users[role]=session.user;api[role]=new ApiClient({baseUrl:base,getTokens:async()=>session.tokens});}
 const sourceId=JSON.parse(fs.readFileSync('reports/round2-20261113/notice/local/state.json')).cases[0].id;
 if(!state.id){const original=await api.client.case(sourceId);assert.ok(original.details.client.fullName.startsWith('TEST'));const c=await api.client.createCase({service_code:'legal_notice',tier:'urgent'});state.id=c.id;save();await api.client.request('/notices/'+c.id+'/filing',{...original.details,narrative:'TEST ROUND2 REMINDER CASE — fictional payment due; no real dispute.'},'PUT');
  const bytes=fs.readFileSync('reports/round2-20261113/notice/local/supporting-evidence.pdf');for(const kind of ['id_proof','notice_support_invoice']){const ticket=await api.client.presign({case_id:c.id,kind,filename:'TEST-only.pdf',mime:'application/pdf'});await api.client.upload(ticket,new Blob([bytes],{type:'application/pdf'}));}
  await api.client.submit(c.id);const q=await api.client.paymentQuote(c.id);assert.equal(q.simulated,true);const checkout=await api.client.request('/payments/checkouts',{case_id:c.id,quote_id:q.id});assert.ok(checkout.simulated&&checkout.test_actions);await api.client.request('/payments/checkouts/'+checkout.id+'/simulate',{});await api.admin.assign(c.id,users.advocate.id);await api.advocate.accept(c.id);await api.advocate.start(c.id);
  const content={sender:'TEST Notice Client\nTEST Client Street, Indore',recipient:'TEST Recipient\nTEST Street, Indore',subject:'TEST reminder verification',facts:'TEST ONLY fictional payment remains due.',demand:'TEST ONLY repayment demand.',closing:'TEST ONLY respond in writing. Not an actual legal notice.'};const d=await api.advocate.saveDraft(c.id,content,7,0);await api.advocate.request('/cases/'+c.id+'/drafts/'+d.id+'/send',{base_version:d.version,review_checks:{names:true,amount:true,demand_days:true}});
 }
 const c=await db.case.findUniqueOrThrow({where:{id:state.id}});assert.equal(c.client_id,users.client.id);assert.match(c.details.narrative,/TEST ROUND2 REMINDER CASE/);assert.equal(c.status,'client_review');
 const event=await db.caseEvent.findFirstOrThrow({where:{case_id:c.id,to_status:'client_review',from_status:{not:'client_review'}},orderBy:{id:'desc'}}),start=new Date(Date.now()-8*86400000);await db.caseEvent.update({where:{id:event.id},data:{created_at:start}});
 const {NoticeReminders}=require('../apps/api/dist/src/cases/notice-reminders'),{InAppNotifications}=require('../apps/api/dist/src/notifications/in-app-notifications');
 const worker=new NoticeReminders({getClient:async()=>({noticeLifecycle:{findMany:async()=>[{case_id:c.id}]},$transaction:db.$transaction.bind(db)})},new InAppNotifications({send:async()=>({simulated:true})}));
 await worker.tick(new Date(start.getTime()+24*3600000));await worker.tick(new Date(start.getTime()+72*3600000));await worker.tick(new Date());await worker.tick(new Date());
 const reminders=await db.notification.findMany({where:{case_id:c.id,user_id:users.client.id,kind:'notice_reminder'}});assert.equal(reminders.length,2);assert.equal((await api.client.case(c.id)).status,'client_review');
 browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const errors=[],pages={};const page=async role=>pages[role]??(pages[role]=await kit.signIn(browser,null,{role,email:`demo-${role}@legalitt.invalid`,password,mobile,adminWeb,errors}));
 const snap=async(p,service,name)=>kit.shot(p,path.resolve('docs/flows/'+service+'-screens/built/'+name+'.png'),{width:p.url().startsWith(adminWeb)?1440:430});
 let p=await page('admin');await kit.go(p,adminWeb+'/legal-notices?queue=pending_client_response&search='+c.reference);await kit.text(p,c.reference);await snap(p,'ln','admin-pending-client-response');
 await db.noticeLifecycle.update({where:{case_id:c.id},data:{deadline_at:new Date(Date.now()-3600000)}});
 await kit.go(p,adminWeb+'/legal-notices/'+c.id);await kit.text(p,'Overdue');await snap(p,'ln','admin-overdue-actions');
 await p.evaluate(()=>[...document.querySelectorAll('summary')].find(e=>e.textContent==='Extend the case deadline').click());
 const next=new Date(Date.now()+3*86400000),local=new Date(next.getTime()-next.getTimezoneOffset()*60000).toISOString().slice(0,16);
 await p.$eval('input[type=datetime-local]',(e,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));},local);
 const dateInput=await p.$('input[type=datetime-local]');await dateInput.focus();await dateInput.press('ArrowUp');await dateInput.press('Tab');
 const reason=await p.evaluateHandle(()=>[...document.querySelectorAll('details')].find(e=>e.querySelector('summary')?.textContent==='Extend the case deadline').querySelector('textarea'));await reason.asElement().click();await reason.asElement().type('TEST ONLY extension explained to client.');await reason.dispose();
 await kit.dump(p,'Deadline extension form');
 await kit.click(p,'Extend and notify client');await kit.noText(p,'Overdue:');assert.ok(await db.notification.findFirst({where:{case_id:c.id,user_id:users.client.id,kind:'notice_deadline_extended'}}));await snap(p,'ln','admin-deadline-extended');
 const cp=await page('client');await kit.go(cp,mobile+'/notifications');await kit.text(cp,'waiting for review');await snap(cp,'ln','client-reminders');await kit.go(cp,mobile+'/support');await kit.text(cp,"We'll call you back within 24 hours");await snap(cp,'ln','client-support-hours');
 await kit.go(p,adminWeb+'/support');await p.evaluate(()=>[...document.querySelectorAll('summary')].find(e=>e.textContent==='Support hours & callback settings').click());await kit.text(p,'Opening time');await snap(p,'ln','admin-support-settings');
 const reports=JSON.parse(fs.readFileSync('reports/round2-20261113/reports/local/state.json'));for(const [service,folder]of [['property_search','ps'],['document_forensic','df']]){const r=reports.cases.find(c=>c.service===service);await kit.go(p,adminWeb+require('../packages/shared/dist').adminCaseListPath(service));await p.evaluate(()=>[...document.querySelectorAll('summary')].find(e=>e.textContent==='Service tariffs').click());await kit.text(p,'New base price');await snap(p,folder,'admin-tariff-settings');}
 assert.deepEqual(errors,[]);state.result={passed:true,reminders:2,auto_approved:false,deadline_extended:true,at:new Date().toISOString()};save();console.log('PASS reminder 24h/72h idempotence, 7-day queue, overdue extension/client notification, support and tariff settings screens');
 }finally{await browser?.close();await db.$disconnect();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
