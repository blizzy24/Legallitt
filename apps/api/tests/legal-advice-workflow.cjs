const {test}=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {LegalAdviceWorkflow}=require('../dist/src/consultations/legal-advice.service'),{LegalAdvicePayments}=require('../dist/src/consultations/legal-advice-payments'),{LegalAdviceInvitations}=require('../dist/src/consultations/legal-advice-invitations');
const {LegalAdviceWritten,renderAdvicePdf}=require('../dist/src/consultations/legal-advice-written');
const {walletEntries}=require('../dist/src/wallet/wallet.service');
const {AdviceIntakeSchema,legalAdviceRequestedSlots}=require('@legalitt/shared');
const manifest=require('../prisma/legal-advice-rebuild.json');
test('Legal Advice written PDF supports real headings, all sections and pagination',async()=>{const bytes=await renderAdvicePdf('TEST LA',{name:'TEST Advocate',enrolment:'TEST/123',city:'Indore'},{title:'TEST Opinion',background:'TEST client facts '.repeat(30),opinion:'TEST legal analysis '.repeat(500),action_plan:'TEST recommended steps '.repeat(30)});const {PDFDocument}=require('pdf-lib'),pdf=await PDFDocument.load(bytes);assert.ok(pdf.getPageCount()>1);});
test('Legal Advice rebuilt workflow: snapshots, proposals, no-shows, session/summary/wallet and isolation',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
 const url=new URL(process.env.LEGALITT_TEST_DATABASE_URL);assert.ok(['localhost','127.0.0.1'].includes(url.hostname));assert.match(url.pathname,/test$/);
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:url.href})}),prisma={getClient:async()=>db},sent=[],notifications={send:async(tx,n)=>{sent.push(n);return {id:randomUUID(),simulated:true};}};
 const users=['client','client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST Advice '+role})),[client,other,a,b,admin]=users,ids=[],priceIds=new Set();let policy;
 const flow=new LegalAdviceWorkflow(prisma,notifications,{generate:async()=>({text:'TEST AI preliminary summary and action plan',simulated:true})},new (require('../dist/src/consultations/call-provider').TestCallProvider)()),payments=new LegalAdvicePayments(prisma,{capture:async()=>({paymentId:randomUUID(),simulated:true,source:'simulated'})},notifications),invites=new LegalAdviceInvitations(prisma,notifications);
 const uploads=new Map();let fileServer,uploadBase;
 const documents={presign:async(actor,input)=>{const doc=await db.document.create({data:{case_id:input.case_id,owner_id:actor.id,kind:input.kind,filename:input.filename,mime_type:input.mime,size_bytes:0n,status:'pending',s3_key:'TEST/'+randomUUID()}});return {document:doc,upload:{url:uploadBase+'/'+doc.id,fields:{}}};},complete:async(actor,id)=>{const bytes=uploads.get(id);assert.ok(bytes);const pdf=await require('pdf-lib').PDFDocument.load(bytes);return db.document.update({where:{id},data:{status:'uploaded',size_bytes:BigInt(bytes.length),page_count:pdf.getPageCount()}});}};
 const writtenService=new LegalAdviceWritten(prisma,documents,notifications);
 let slotIndex=0;const slots=[];for(let day=1;day<12;day++)slots.push(...legalAdviceRequestedSlots(new Date(Date.now()+day*86400000).toISOString().slice(0,10),manifest,Date.now()));
 const view=(id,actor=client)=>flow.read(actor,id),act=async(id,actor,name,body={})=>flow.action(actor,id,name,{expected_revision:(await view(id,actor)).booking.revision,...body});
 const create=async(mode='chat',extra={})=>{const c=await flow.create(client,{mode,advocate_id:a.id,scheduled_at:slots[slotIndex++],...extra});ids.push(c.id);priceIds.add((await db.case.findUnique({where:{id:c.id}})).pricing_id);return c.id;};
 const submit=async id=>{await act(id,client,'intake',{intake:AdviceIntakeSchema.parse({full_name:'TEST Client',phone:'9000012345',email:'synthetic@legalitt.invalid',description:'TEST concern for synthetic Legal Advice only.',consent:true})});await act(id,client,'submit');};
 const pay=async(id,purpose='service_fee')=>{const q=await payments.quote(client,id,{purpose});assert.equal(q.status,'ready');priceIds.add((await db.casePriceQuote.findUnique({where:{id:q.id}})).pricing_id);const body={quote_id:q.id,idempotency_key:randomUUID(),confirmed_test:true},p=await payments.pay(client,id,body);assert.equal((await payments.pay(client,id,body)).id,p.id);return q;};
 const ready=async(mode='chat')=>{const id=await create(mode);await submit(id);await pay(id);const i=await db.legalAdviceInvitation.findFirst({where:{case_id:id,advocate_id:a.id,state:'pending'}});await invites.decide(a,i.id,{decision:'accept'});return id;};
 const near=async(id,minutes=0)=>{await db.legalAdviceBooking.update({where:{case_id:id},data:{confirmed_at:new Date(Date.now()-minutes*60000)}});};
 const summary={summary:'TEST consultation reviewed summary.',key_points:'TEST key points discussed.',next_steps:'TEST recommended next steps.',attachment_ids:[]};
 try{
  fileServer=require('node:http').createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const request=new Request('http://test/upload',{method:'POST',headers:{'content-type':req.headers['content-type']},body:Buffer.concat(chunks)}),form=await request.formData();uploads.set(req.url.slice(1),new Uint8Array(await form.get('file').arrayBuffer()));res.writeHead(204).end();}catch{res.writeHead(400).end();}});await new Promise(resolve=>fileServer.listen(0,'127.0.0.1',resolve));uploadBase='http://127.0.0.1:'+fileServer.address().port;
  await db.user.createMany({data:users});for(const who of [a,b])await db.advocateProfile.create({data:{user_id:who.id,verification:'approved',years_experience:3,practice_areas:['General Consultation']}});
  const latest=await db.legalAdvicePolicy.findFirst({orderBy:{version:'desc'}}),version=(latest?.version??0)+1;policy=await db.legalAdvicePolicy.create({data:{version,config:{...manifest,version},reason:'TEST rebuilt workflow',created_by:admin.id}});
  await t.test('tier mode prices are exact; unpriced tiers and unknown profiles cannot book',async()=>{
   const list=await flow.advocates(client,'video');assert.equal(list.tiers.find(x=>x.code==='emerging').base_paise,'99900');assert.ok(list.tiers.filter(x=>x.code!=='emerging').every(x=>x.base_paise===null));
   await db.advocateProfile.update({where:{user_id:b.id},data:{years_experience:8}});await assert.rejects(flow.create(client,{mode:'chat',advocate_id:b.id,scheduled_at:slots[0]}),{status:409});await db.advocateProfile.update({where:{user_id:b.id},data:{years_experience:3}});
   const id=await create();await submit(id);const q=await pay(id);assert.equal(q.breakdown.service_fee_paise,'49900');assert.equal(q.breakdown.platform_fee_paise,'12475');assert.equal(q.breakdown.gst_paise,'11228');assert.equal(q.breakdown.total_paise,'73603');assert.equal(q.breakdown.delivery_fee_paise,'0');
   assert.equal((await db.legalAdviceBooking.findUnique({where:{case_id:id}})).phase,'pending_acceptance');
   for(const actor of [other,b]){await assert.rejects(view(id,actor),{status:404});await assert.rejects(flow.action(actor,id,'rating',{expected_revision:0,content:{rating:5}}),{status:404});}
   for(const name of ['booking','selection','intake','submit','reschedule','exception-reschedule','propose-time','time-response','join','pause','resume','end','no-show','summary-draft','summary','private-notes','rating','chat-reopen','cancel','cancel-decision','dispute','resolve-dispute'])await assert.rejects(flow.action(other,id,name,{expected_revision:0}),{status:404},name);
   await assert.rejects(payments.quote(other,id,{purpose:'service_fee'}),{status:404});await assert.rejects(payments.pay(other,id,{quote_id:q.id,idempotency_key:randomUUID(),confirmed_test:true}),{status:404});
   await assert.rejects(flow.create(a,{mode:'chat',advocate_id:a.id,scheduled_at:slots[0]}),{status:403});
   await assert.rejects(flow.list({...other,role:'support'}),{status:403});
  });
  await t.test('the last declined invitation immediately returns the request to admin',async()=>{
   const id=await create();await submit(id);await pay(id);const i=await db.legalAdviceInvitation.findFirst({where:{case_id:id,state:'pending'}});await invites.decide(a,i.id,{decision:'decline',reason:'TEST unable to take this slot'});assert.equal((await view(id)).booking.phase,'awaiting_admin');assert.equal(sent.filter(n=>n.case_id===id&&n.user_id===admin.id&&n.kind==='legal_advice_assignment_needed').length,1);
  });
  await t.test('page overage combines all PDFs, excludes GST and rejects a stale document quote',async()=>{
   const id=await create();await submit(id);const docs=[];
   for(const pages of [16,12])docs.push(await db.document.create({data:{case_id:id,owner_id:client.id,kind:'supporting_document',filename:'TEST.pdf',mime_type:'application/pdf',size_bytes:1000n,page_count:pages,status:'uploaded',s3_key:'TEST/'+randomUUID()}}));
   const q=await payments.quote(client,id,{purpose:'service_fee'});assert.equal(q.status,'ready');priceIds.add((await db.casePriceQuote.findUnique({where:{id:q.id}})).pricing_id);assert.equal(q.breakdown.page_overage_paise,'7500');assert.equal(q.breakdown.page_overage_gst_paise,'0');assert.equal(q.breakdown.total_paise,'81103');
   await db.document.update({where:{id:docs[1].id},data:{page_count:13}});
   await assert.rejects(payments.pay(client,id,{quote_id:q.id,idempotency_key:randomUUID(),confirmed_test:true}),{status:409});
   await db.document.update({where:{id:docs[0].id},data:{page_count:null}});assert.equal((await payments.quote(client,id,{purpose:'service_fee'})).status,'blocked');
  });
  await t.test('Chat completion holds wallet until mandatory summary; rating and follow-up retain price',async()=>{
   const id=await ready();await near(id);await act(id,client,'join');await act(id,a,'join');await act(id,client,'end');
   assert.equal((await view(id)).booking.phase,'completed');assert.equal((await walletEntries(db,a.id)).filter(e=>e.case_id===id).length,0);
   await act(id,a,'summary-draft',{content:{...summary,summary:''}});assert.equal((await view(id,a)).private_notes.summary_draft.summary,'');assert.equal((await view(id)).private_notes,undefined);
   await assert.rejects(act(id,client,'summary',{content:summary}),{status:403});await act(id,a,'summary',{content:summary});
   const credits=(await walletEntries(db,a.id)).filter(e=>e.case_id===id);assert.equal(credits.length,1);assert.equal(credits[0].share_paise,'49900');
   await assert.rejects(act(id,a,'summary',{content:summary}),{status:409});assert.equal((await walletEntries(db,a.id)).filter(e=>e.case_id===id).length,1);
   await act(id,client,'rating',{content:{rating:5,review:'TEST review'}});await assert.rejects(act(id,client,'rating',{content:{rating:4}}),{status:409});
   await act(id,client,'dispute',{reason:'TEST private complaint for Legalitt only'});assert.equal((await view(id,a)).dispute,undefined);assert.match((await view(id,admin)).dispute.reason,/private complaint/);await assert.rejects(act(id,a,'resolve-dispute',{reason:'TEST'}),{status:403});await act(id,admin,'resolve-dispute',{reason:'TEST client contacted and issue resolved'});assert.equal((await view(id)).dispute.status,'resolved');
   const follow=await create('chat',{follow_up_of:id});await submit(follow);const q=await pay(follow);assert.equal(q.breakdown.service_fee_paise,'49900');assert.equal((await view(follow)).booking.follow_up_of,id);
   const written=await payments.quote(client,id,{purpose:'written_advice'});assert.equal(written.breakdown.total_paise,'14750');await pay(id,'written_advice');assert.equal((await view(id)).data.written.status,'pending');
   const content={title:'TEST Written Opinion',background:'TEST client facts reviewed.',opinion:'TEST professional opinion reviewed by the advocate.',action_plan:'TEST recommended next actions.'};
   await assert.rejects(writtenService.save(client,id,{expected_revision:0,content}),{status:403});await assert.rejects(writtenService.save(b,id,{expected_revision:0,content}),{status:404});await assert.rejects(writtenService.deliver(b,id,{expected_revision:0}),{status:404});
   await writtenService.save(a,id,{expected_revision:(await view(id,a)).booking.revision,content});
   const delivered=await writtenService.deliver(a,id,{expected_revision:(await view(id,a)).booking.revision});assert.equal((await view(id)).data.written.document_id,delivered.document_id);
   const text=await require('../dist/src/consultations/advice-extract').extractAdvicePdf(uploads.get(delivered.document_id));for(const value of Object.values(content))assert.ok(text.includes(value),'Each editable opinion section reaches the PDF');
   assert.equal((await walletEntries(db,a.id)).filter(e=>e.case_id===id).reduce((n,e)=>n+BigInt(e.share_paise),0n),59900n);
   await assert.rejects(writtenService.deliver(a,id,{expected_revision:(await view(id,a)).booking.revision}),{status:409});
  });
  await t.test('shared QR checkout owns expiry, status and duplicate capture for consultations',async()=>{
   const {PaymentsService}=require('../dist/src/payments/payments.service'),shared=new PaymentsService(prisma,{}, {},notifications,payments),oldEnv=process.env.ENVIRONMENT,oldMode=process.env.PAYMENTS_MODE;
   process.env.ENVIRONMENT='dev';process.env.PAYMENTS_MODE='simulated';try{
    const id=await create();await submit(id);const q=await payments.quote(client,id,{purpose:'service_fee'}),session=await shared.checkout(client,{case_id:id,quote_id:q.id});
    assert.equal((await shared.checkoutStatus(client,String(session.id))).status,'waiting');await assert.rejects(shared.checkoutStatus(other,String(session.id)),{status:404});
    const event=await db.caseEvent.findUnique({where:{id:session.id}});await db.caseEvent.update({where:{id:session.id},data:{payload:{...event.payload,expires_at:new Date(Date.now()-1).toISOString()}}});
    await assert.rejects(shared.simulateCheckout(client,String(session.id)),{status:409});assert.equal(await db.payment.count({where:{case_id:id}}),0);
    const retry=await shared.checkout(client,{case_id:id,quote_id:q.id});assert.notEqual(String(retry.id),String(session.id));const p=await shared.simulateCheckout(client,String(retry.id));assert.equal((await shared.simulateCheckout(client,String(retry.id))).id,p.id);assert.equal((await shared.checkoutStatus(client,String(retry.id))).status,'captured');assert.equal(await db.payment.count({where:{case_id:id}}),1);
   }finally{if(oldEnv===undefined)delete process.env.ENVIRONMENT;else process.env.ENVIRONMENT=oldEnv;if(oldMode===undefined)delete process.env.PAYMENTS_MODE;else process.env.PAYMENTS_MODE=oldMode;}
  });
  await t.test('Video proposal, 12-hour alert, pause/resume, auto-end and 24-hour summary alert',async()=>{
   const id=await create('video');await submit(id);await pay(id);const inv=await db.legalAdviceInvitation.findFirst({where:{case_id:id,state:'pending'}});await invites.decide(a,inv.id,{decision:'accept',proposed_at:slots[slotIndex++],reason:'TEST alternative'});
   let v=await view(id);assert.equal(v.booking.phase,'time_proposed');let d=v.data;d.proposal.created_at=new Date(Date.now()-13*3600000).toISOString();await db.legalAdviceBooking.update({where:{case_id:id},data:{session:d}});await flow.reconcile(id);assert.ok((await view(id,admin)).data.alerts.some(x=>x.startsWith('proposal:')));
   await act(id,client,'time-response',{decision:'accept'});await near(id);await act(id,client,'join');await act(id,a,'join');await act(id,a,'pause');assert.equal((await view(id)).data.room.state,'paused');await act(id,a,'resume');await assert.rejects(act(id,a,'end'),{status:403});
   v=await view(id);d=v.data;d.room.resumed_at=new Date(Date.now()-26*3600000).toISOString();await db.legalAdviceBooking.update({where:{case_id:id},data:{session:d}});await flow.reconcile(id);v=await view(id);assert.equal(v.booking.phase,'completed');assert.ok(v.data.alerts.includes('summary_overdue'));
   await act(id,a,'summary',{content:summary});assert.equal((await walletEntries(db,a.id)).find(e=>e.case_id===id).share_paise,'99900');
   await flow.generateAi(a,id);assert.equal((await view(id)).data.ai.simulated,true);await assert.rejects(flow.generateAi(other,id),{status:404});
  });
  await t.test('both no-shows; free advocate-fault reschedule and full refund; ordinary reschedule limit',async()=>{
   let id=await ready('audio');await near(id,11);await view(id);await view(id);assert.equal(sent.filter(n=>n.case_id===id&&n.user_id===client.id&&n.kind==='legal_advice_advocate_missing').length,1,'The waiting client is notified exactly once');await act(id,client,'no-show',{remedy:'reschedule',scheduled_at:slots[slotIndex++]});assert.equal((await view(id)).booking.reschedule_count,0);await act(id,a,'time-response',{decision:'accept'});
   id=await ready('audio');await near(id,11);await act(id,client,'no-show',{remedy:'cancel'});assert.equal((await view(id)).booking.phase,'refunded');assert.equal((await db.refund.findMany({where:{case_id:id}})).reduce((n,r)=>n+r.amount_paise,0n),103103n);
   id=await ready();await near(id,11);await act(id,a,'no-show');assert.equal((await view(id)).booking.phase,'client_no_show');assert.equal(await db.refund.count({where:{case_id:id}}),0);
   id=await ready();for(let n=0;n<2;n++){await act(id,client,'reschedule',{scheduled_at:slots[slotIndex++],reason:'TEST change'});await act(id,a,'time-response',{decision:'accept'});}await assert.rejects(act(id,client,'reschedule',{scheduled_at:slots[slotIndex++]}),{status:409});
  });
  await t.test('a proposed replacement time cannot overlap a legacy appointment',async()=>{
   const legacy=await create(),when=slots[slotIndex++];await db.consultation.create({data:{case_id:legacy,client_id:client.id,advocate_id:a.id,scheduled_at:new Date(when),mode:'chat',duration_min:30,status:'scheduled'}});
   const id=await ready();await act(id,client,'reschedule',{scheduled_at:when});await assert.rejects(act(id,a,'time-response',{decision:'accept'}),{status:409});assert.equal((await view(id)).booking.phase,'reschedule_pending');
  });
  await t.test('cancellation before acceptance refunds; after acceptance admin decides; admin lists stay private',async()=>{
   let id=await create();await submit(id);await pay(id);await act(id,client,'cancel',{reason:'TEST cancellation'});assert.equal((await view(id)).booking.phase,'refunded');
   id=await ready();await act(id,client,'cancel',{reason:'TEST after acceptance'});assert.equal((await view(id)).booking.phase,'cancel_requested');await assert.rejects(act(id,client,'cancel-decision',{approve:true,amount_paise:'73603',reason:'TEST'}),{status:403});await act(id,admin,'cancel-decision',{approve:true,amount_paise:'73603',reason:'TEST approved'});assert.equal((await view(id)).booking.phase,'refunded');
   assert.equal((await flow.list(other)).items.some(x=>ids.includes(x.id)),false);assert.ok((await flow.list(admin)).items.some(x=>ids.includes(x.id)));
   await assert.rejects(flow.candidates(client,id),{status:403});assert.ok(Array.isArray((await flow.candidates(admin,id)).items));
  });
 }finally{
  for(const row of await db.casePriceQuote.findMany({where:{case_id:{in:ids}}}))if(row.pricing_id)priceIds.add(row.pricing_id);
  if(fileServer)await new Promise(resolve=>fileServer.close(resolve));await db.adminAction.deleteMany({where:{admin_id:admin.id}});await db.consultation.deleteMany({where:{case_id:{in:ids}}});await db.document.deleteMany({where:{case_id:{in:ids}}});await db.refund.deleteMany({where:{case_id:{in:ids}}});await db.payment.deleteMany({where:{case_id:{in:ids}}});await db.casePriceQuote.deleteMany({where:{case_id:{in:ids}}});await db.legalAdviceEvent.deleteMany({where:{case_id:{in:ids}}});await db.legalAdviceInvitation.deleteMany({where:{case_id:{in:ids}}});
  await db.legalAdviceBooking.updateMany({where:{case_id:{in:ids}},data:{follow_up_of:null}});await db.legalAdviceBooking.deleteMany({where:{case_id:{in:ids}}});await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});await db.servicePricing.deleteMany({where:{id:{in:[...priceIds].filter(Boolean)}}});if(policy)await db.legalAdvicePolicy.delete({where:{id:policy.id}});await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(x=>x.id)}}});await db.user.deleteMany({where:{id:{in:users.map(x=>x.id)}}});await db.$disconnect();
 }
});
