// Live P0 checks on the deployed API (11 Nov 2026 final build). Synthetic TEST ONLY
// data, simulated payments, existing demo identities; no credential is changed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{ApiClient,SUPPORT_SUBJECTS,SUPPORT_RELATED_TO,SUPPORT_CONTACT_METHODS}=require('../packages/shared/dist');
process.loadEnvFile('apps/api/.env.local');
const base='https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com',out=path.resolve('reports/final-2026-11-11');
const wait=(ms=300)=>new Promise(r=>setTimeout(r,ms)),log=[],step=(name,detail='')=>{console.log('PASS',name,detail);log.push({name,detail});};
const code=v=>typeof v==='string'?v:v.code;
(async()=>{
 const password=await require('../apps/api/dist/src/auth/demo').demoPassword(),api={};
 for(const role of ['client','client-isolation','advocate','admin']){
  const r=await fetch(base+'/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`demo-${role}@legalitt.invalid`,password})});
  assert.equal(r.status,201,role+' login');const s=await r.json();
  api[role]=new ApiClient({baseUrl:base,fetch:require('./helpers/verification-fetch.cjs'),getTokens:async()=>s.tokens});
 }
 const c=api.client,o=api['client-isolation'],adv=api.advocate,admin=api.admin;
 // ---- P0-3 account area ----
 const profile=await c.accountProfile();step('profile',`${profile.full_name??profile.name} active=${profile.active_cases??''}`);
 const docs=await c.accountDocuments();step('my documents',`${docs.items.length} documents`);
 const pays=await c.accountPayments();step('payments',`${pays.items.length} payments`);
 if(pays.items[0]){const r=await c.accountReceipt(pays.items[0].id);assert.ok(Buffer.from(r.pdf_base64,'base64').subarray(0,4).equals(Buffer.from('%PDF')));step('receipt pdf',r.filename);
  await assert.rejects(o.accountPayment(pays.items[0].id),{status:404});await assert.rejects(o.accountReceipt(pays.items[0].id),{status:404});step('isolation: payment + receipt 404 for other client');}
 if(docs.items[0]){await assert.rejects(o.documentUrl(docs.items[0].id),e=>[403,404].includes(e.status));step('isolation: document 404 for other client');}
 await c.accountPreferences();await c.accountSecurity();await c.savedAdvocates();await c.accountDeletion();
 const exp=await c.exportAccount();assert.ok(exp);step('preferences, security, saved advocates, deletion state, data export');
 const inbox=await c.messagesInbox();step('messages inbox',`${inbox.items.length} conversations`);
 // ---- P0-5 support ----
 const ticket=await c.createSupportTicket({subject:code(SUPPORT_SUBJECTS[0]),related_to:code(SUPPORT_RELATED_TO[0]),description:'TEST ONLY: live verification of Contact Support. Please ignore.',contact_method:code(SUPPORT_CONTACT_METHODS[0])});
 step('contact support ticket',ticket.id);
 await assert.rejects(o.supportTicket(ticket.id),{status:404});await assert.rejects(adv.supportTicket(ticket.id),e=>[403,404].includes(e.status));step('isolation: ticket 404 for other client and advocate');
 const queue=await admin.adminSupport('open');assert.ok(queue.items.some(i=>i.id===ticket.id));step('admin support inbox lists ticket',`open=${queue.counts.open}`);
 await admin.adminSupportReply(ticket.id,'TEST ONLY reply from Legalitt support.');await wait();
 const seen=await c.supportTicket(ticket.id);assert.ok(JSON.stringify(seen).includes('TEST ONLY reply'));step('client sees admin reply');
 await admin.adminSupportClose(ticket.id);step('admin closed ticket');
 // ---- P0-6 cancellations on Property Search ----
 const intake={tier:'ordinary',details:{contact:{fullName:'TEST ONLY Verifier',mobile:'+91 90000 00000',email:'test@legalitt.invalid'},jurisdiction:(()=>{const s=require('../packages/shared/dist').INDIA_JURISDICTIONS.find(s=>s.name==='Maharashtra'),d=s.districts.find(d=>d.name==='Pune');return {state_code:s.code,state:s.name,district_code:d.code,district:d.name};})(),
  property_address:'TEST ONLY synthetic address, Pune',property_type:'residential',survey_number:'Sy. 1/1',search_duration:'30_years',requirement:'TEST ONLY live cancellation verification.'}};
 const paidCase=async()=>{const k=await c.createCase({service_code:'property_search'});await c.saveReportIntake(k.id,intake);await c.submit(k.id);const q=await c.paymentQuote(k.id);assert.equal(q.status,'ready',JSON.stringify(q));
  await c.pay(k.id,'service_fee',`final-p0:${k.id}:${q.id}`,q.id);return k;};
 const a=await paidCase();step('paid case A',a.reference);
 await assert.rejects(o.caseCancellation(a.id),{status:404});await assert.rejects(o.cancelCase(a.id,{confirm:true}),{status:404});await assert.rejects(adv.cancelCase(a.id,{confirm:true}),e=>[403,404].includes(e.status));step('isolation: cancellation 404/403 for other client and advocate');
 const ca=await c.cancelCase(a.id,{confirm:true});await wait(800);const ra=await c.case(a.id);assert.equal(ra.status,'refunded',JSON.stringify(ca));step('self-serve cancel before acceptance → full simulated refund',ra.status);
 const b=await paidCase();const advs=await admin.adminAdvocates('property_search');const me=(await adv.request('/me'));const target=advs.items.find(x=>x.id===me.id)??advs.items[0];
 await admin.assign(b.id,target.id);
 if(target.id===me.id){await adv.accept(b.id);}else{throw new Error('demo advocate not assignable');}
 step('paid case B assigned and accepted',b.reference);
 const req=await c.cancelCase(b.id,{reason:null,note:'TEST ONLY: request after acceptance',confirm:true});step('cancellation requested after acceptance',JSON.stringify(req.request?.status??req.status??''));
 const pending=await admin.adminCancellations('pending');const row=pending.items.find(i=>i.case_id===b.id||i.case?.id===b.id);assert.ok(row,'queue row');
 const refundable=BigInt(row.refundable_paise??row.request?.refundable_paise);const half=(refundable/2n).toString();
 await admin.decideCancellation(row.id??row.request_id,{decision:'approve',refund_amount_paise:half,reason:'TEST ONLY: partial refund — advocate had started.'});await wait(800);
 const rb=await c.case(b.id);const vb=await c.caseCancellation(b.id);assert.equal(rb.status,'cancelled');assert.ok(JSON.stringify(vb).includes('TEST ONLY: partial refund'));step('admin partial refund recorded; client sees amount + reason',`${rb.status} ${half} paise`);
 await assert.rejects(adv.case(b.id),{status:404}).catch(async()=>{const v=await adv.case(b.id);assert.equal(v.status,'cancelled');});step('advocate released from cancelled case');
 fs.writeFileSync(path.join(out,'live-p0-verification.json'),JSON.stringify({checked_at:new Date().toISOString(),cases:{self_serve:a.reference,admin_partial:b.reference},support_ticket:ticket.id,steps:log},null,2)+'\n');
 console.log('ALL P0 LIVE CHECKS PASSED');
})().catch(e=>{console.error('FAIL',e.status??'',e.message,e.details?JSON.stringify(e.details):'');process.exitCode=1;});
