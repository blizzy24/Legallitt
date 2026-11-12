const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {NoticeFlowService}=require('../dist/src/cases/notice-flow.service');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {CaseRepository}=require('../dist/src/cases/case-repository');
const {NoticeMessages}=require('../dist/src/cases/notice-messages');
const {TestNoticeEmail}=require('../dist/src/cases/notice-email');
const {PaymentsService}=require('../dist/src/payments/payments.service');
const {walletEntries}=require('../dist/src/wallet/wallet.service');

test('admin-owned Legal Notice: method pricing, version return, chat lock, dispatch/proof and endpoint isolation', {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})});
 const prisma={getClient:async()=>db},notifications={send:async()=>({})},email=new TestNoticeEmail();
 const storage={head:async()=>({size:4,mime:'application/pdf'}),read:async()=>Buffer.from('%PDF'),download:async()=> 'http://127.0.0.1/test-only.pdf'};
 const flow=new NoticeFlowService(prisma,storage,email,notifications),machine=new CaseStateMachine(prisma,notifications),repo=new CaseRepository(prisma),messages=new NoticeMessages(prisma);
 const payments=new PaymentsService(prisma,machine,{capture:async({idempotencyKey})=>({paymentId:'test-'+idempotencyKey,simulated:true,source:'simulated'})},notifications);
 const actors=['client','client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role}));
 const [client,other,advocate,replacement,admin]=actors,cases=[],checkouts=[];
 const content={sender:'TEST client and address',recipient:'TEST recipient and contact',subject:'TEST subject',facts:'TEST facts',demand:'TEST demand',closing:'TEST response and closing'};
 async function document(id,kind,owner=client){return db.document.create({data:{case_id:id,owner_id:owner.id,kind,filename:'TEST-only.pdf',mime_type:'application/pdf',s3_key:'local-test/'+randomUUID(),size_bytes:4n,status:'uploaded',page_count:1,simulated:true}});}
 async function pdfDraft(id,who,base=0){const d=await machine.saveNoticeDraft(who,id,{kind:'legal_notice',content,generated_by:'manual',base_version:base});const doc=await document(id,'legal_notice',who);await db.draft.update({where:{id:d.id},data:{document_id:doc.id}});return {...d,document_id:doc.id};}
 try{
  await require('../dist/prisma/seed-pricing').seedConfirmedPricing(db);
  for(const a of actors)await db.user.create({data:{...a,cognito_sub:'notice-local-'+a.id,full_name:'TEST ONLY '+a.role}});
  for(const a of [advocate,replacement])await db.advocateProfile.create({data:{user_id:a.id,verification:'approved',city:'Indore'}});
  for(const methods of [['courier'],['email'],['courier','email','whatsapp']]){
   const c=await machine.create(client,{service_code:'legal_notice',tier:'urgent'});cases.push(c.id);
   const filing={intake_version:2,identity_kind:'pan',client:{fullName:'TEST Client',relativeName:'TEST Parent',age:32,address:'TEST client address'},noticee:{fullName:'TEST Recipient',methods,
    ...(methods.includes('courier')?{address:'TEST street',pin:'452001'}:{}),...(methods.includes('email')?{email:'recipient@example.invalid'}:{}),...(methods.includes('whatsapp')?{whatsapp:'+919876543210'}:{})},
    issueType:methods.length===3?'cheque-bounce':'money-recovery',narrative:'TEST ONLY local case',...(methods.length===3?{cheque:{number:'123456',date:'2026-11-01',amount_paise:'500000',bank:'TEST Bank',return_date:'2026-11-02'}}:{})};
   await flow.filing(client,c.id,filing);await document(c.id,'id_proof');await document(c.id,'notice_support');
   if(methods.length===3){await document(c.id,'notice_cheque');await document(c.id,'notice_return_memo');}
   await machine.submitForPayment(client,c.id);
   const quote=await payments.quote(client,{case_id:c.id});assert.equal(quote.status,'ready');
   assert.equal(quote.breakdown.delivery_fee_paise,methods.includes('courier')?'17900':'0');assert.equal(quote.breakdown.advocate_entitlement_paise,'99900');
   assert.equal(quote.breakdown.total_paise,methods.includes('courier')?'165253':'147353');
   let checkout=await payments.checkout(client,{case_id:c.id,quote_id:quote.id});
   if(methods.length===1&&methods[0]==='courier'){
    const expired=String(checkout.id),event=await db.caseEvent.findUniqueOrThrow({where:{id:BigInt(expired)}});
    await db.caseEvent.update({where:{id:event.id},data:{payload:{...event.payload,expires_at:new Date(Date.now()-1000).toISOString()}}});
    assert.equal((await payments.checkoutStatus(client,expired)).status,'expired');
    await assert.rejects(payments.simulateCheckout(client,expired),{status:409});
    assert.equal(await db.payment.count({where:{case_id:c.id}}),0,'expired QR cannot charge');
    checkout=await payments.checkout(client,{case_id:c.id,quote_id:quote.id});assert.notEqual(String(checkout.id),expired);
   }
   checkouts.push(String(checkout.id));
   assert.equal((await payments.checkout(client,{case_id:c.id,quote_id:quote.id})).id,checkout.id,'retry keeps the same unexpired checkout');
   assert.equal((await payments.checkoutStatus(client,String(checkout.id))).status,'waiting');
   await payments.simulateCheckout(client,String(checkout.id));
   const paid=await payments.simulateCheckout(client,String(checkout.id));assert.equal(paid.simulated,true);
   assert.equal((await payments.checkoutStatus(client,String(checkout.id))).status,'captured');
   assert.equal(await db.payment.count({where:{case_id:c.id,purpose:'service_fee'}}),1);
   await machine.assign(admin,c.id,{advocate_id:advocate.id});
  }
  await t.test('decline requires a reason, clears assignment, and lets admin assign a different advocate',async()=>{
   const id=cases[0];await assert.rejects(machine.decline(advocate,id,{}),{status:400});
   await machine.decline(advocate,id,{reason:'TEST scheduling conflict'});assert.equal((await db.case.findUnique({where:{id}})).advocate_id,null);
   await machine.assign(admin,id,{advocate_id:replacement.id});await assert.rejects(repo.read(advocate,id),{status:404});
  });
  for(const [index,id]of cases.entries()){
   const who=index===0?replacement:advocate;await machine.transition(who,id,'advocate_accepted');
   const thread=await messages.thread(client,id);await messages.send(client,thread.id,{body:'TEST clarification'});
   let draft=await pdfDraft(id,who);
   if(index===0){
    const secondPdf=await document(id,'legal_notice',who),checks={base_version:draft.version,review_checks:{names:true,amount:true,demand_days:true}};
    const results=await Promise.allSettled([draft.document_id,secondPdf.id].map(doc=>machine.sendNoticeDraft(who,id,draft.id,checks,doc)));
    assert.equal(results.filter(r=>r.status==='fulfilled').length,1,'only one concurrent send may publish');
    const winner=results[0].status==='fulfilled'?draft.document_id:secondPdf.id;
    assert.equal((await db.draft.findUnique({where:{id:draft.id}})).document_id,winner,'published draft remains attached to the winning PDF');
   }else await machine.sendNoticeDraft(who,id,draft.id);
   await machine.reviewNoticeDraft(client,id,draft.id,'changes_requested',{sections:['facts'],comment:'TEST revise facts'});
   draft=await pdfDraft(id,who,draft.version);await machine.sendNoticeDraft(who,id,draft.id);
   const final=await document(id,'legal_notice',client);
   await machine.reviewNoticeDraft(client,id,draft.id,'approved',{}, {approvedAt:new Date(),noticeDocumentId:final.id});
   let view=await flow.view(admin,id);assert.equal(view.stage.stage,5);
   await assert.rejects(messages.send(client,thread.id,{body:'Too late'}),{status:409});assert.equal((await messages.list(client,thread.id)).items.length,1);
   await flow.check(admin,id,'address',{revision:view.revision,confirmed:true});view=await flow.view(admin,id);
   if(index===0){
    await flow.returnDraft(admin,id,{revision:view.revision,reason:'TEST internal correction'});
    await assert.rejects(flow.check(admin,id,'notice',{revision:view.revision,confirmed:true}),{status:409});
    assert.equal((await flow.view(client,id)).reviews.some(r=>r.comment==='TEST internal correction'),false);
    draft=await pdfDraft(id,who,draft.version);await machine.sendNoticeDraft(who,id,draft.id);
    assert.equal((await db.case.findUnique({where:{id}})).status,'approved');
    await assert.rejects(messages.send(who,thread.id,{body:'Still closed'}),{status:409});
    view=await flow.view(admin,id);
   }
   await flow.check(admin,id,'notice',{revision:view.revision,confirmed:true});view=await flow.view(admin,id);
   await flow.testEsign(who,id,{revision:view.revision,confirmed:true});view=await flow.view(admin,id);
   for(const method of view.contacts.methods){
    await flow.dispatch(admin,id,{revision:view.revision,method,...(method==='courier'?{carrier:'TEST Courier',waybill:'TEST-'+index,dispatch_date:'2026-11-12'}:{}),...(method==='whatsapp'?{manual_confirmation:true}:{})});
    view=await flow.view(admin,id);let attempt=view.attempts.find(a=>a.method===method);
    if(index===0&&method==='courier'){
     const originalAddress=attempt.recipient.address;
     await flow.result(admin,id,{revision:view.revision,attempt_id:attempt.id,result:'failed',occurred_at:new Date().toISOString(),reason:'TEST address not located'});view=await flow.view(admin,id);
     const retry=()=>flow.dispatch(admin,id,{revision:view.revision,method:'courier',carrier:'TEST Courier',waybill:'TEST retry',dispatch_date:'2026-11-12'});
     await assert.rejects(retry(),{status:409});const task=view.tasks.find(t=>t.kind==='contact'&&t.method==='courier');assert.ok(task);
     await flow.replyTask(client,id,{revision:view.revision,task_id:task.id,contact:{address:'TEST corrected street',pin:'452001'}});view=await flow.view(admin,id);
     await flow.resolveTask(admin,id,{revision:view.revision,task_id:task.id,confirmed:true});view=await flow.view(admin,id);
     await assert.rejects(retry(),{status:409},'verified address alone cannot bypass retry payment');
     const payment=await payments.noticeCourierRetry(client,{case_id:id,attempt_id:attempt.id,revision:view.revision,confirmed:true});
     assert.equal(payment.total_paise,17900n);assert.equal(payment.gst_paise,0n);
     assert.equal((await payments.noticeCourierRetry(client,{case_id:id,attempt_id:attempt.id,revision:view.revision,confirmed:true})).id,payment.id,'retry payment is idempotent');
     view=await flow.view(admin,id);await retry();view=await flow.view(admin,id);assert.equal(view.attempts[0].recipient.address,originalAddress);attempt=view.attempts.filter(a=>a.method===method).at(-1);assert.equal(attempt.recipient.address,'TEST corrected street');assert.equal(attempt.retry_payment_id,payment.id);
    }
    if(method==='courier'){await flow.tracking(admin,id,{revision:view.revision,attempt_id:attempt.id,occurred_at:new Date().toISOString(),place:'TEST location',text:'TEST manually entered tracking'});view=await flow.view(admin,id);}
    const proof=method==='courier'?await document(id,'notice_delivery_proof',admin):null;
    await flow.result(admin,id,{revision:view.revision,attempt_id:attempt.id,result:'delivered',occurred_at:new Date().toISOString(),...(proof?{proof_document_id:proof.id,received_by:'TEST recipient'}:{})});view=await flow.view(admin,id);
   }
   assert.equal(view.status,'completed');assert.ok((await walletEntries(db,who.id)).some(e=>e.case_id===id&&e.share_paise==='99900'));
   await assert.rejects(flow.result(admin,id,{revision:view.revision,attempt_id:view.attempts[0].id,result:'delivered',occurred_at:new Date().toISOString()}),{status:409});
  }
  assert.equal(email.sent.length,2);assert.ok(email.sent.every(s=>s.to==='recipient@example.invalid'));
  await t.test('every new HTTP endpoint enforces its role and case scope',async()=>{
   require('reflect-metadata');const {Module}=require('@nestjs/common'),{NestFactory}=require('@nestjs/core');
   const {AuthGuard}=require('../dist/src/auth/auth.controller'),{AuthService}=require('../dist/src/auth/auth.service');
   const {NoticeFlowController}=require('../dist/src/cases/notice-flow.controller');
   const {NoticeDraftAiController}=require('../dist/src/cases/notice-draft-ai'),{PrismaService}=require('../dist/src/prisma.service'),{AI}=require('../dist/src/ai/ai.port');
   const {PaymentsController}=require('../dist/src/payments/payments.controller'),{DocumentController}=require('../dist/src/documents/document.controller'),{DocumentService}=require('../dist/src/documents/document.service');
   const documents=new DocumentService(prisma,storage,{}),hidden=await document(cases[0],'legal_notice',replacement);
   let identity=other;class BoundaryModule{};Module({controllers:[NoticeFlowController,NoticeDraftAiController,PaymentsController,DocumentController],providers:[AuthGuard,{provide:AuthService,useValue:{identity:async()=>identity}},{provide:NoticeFlowService,useValue:flow},{provide:PaymentsService,useValue:payments},{provide:PrismaService,useValue:prisma},{provide:DocumentService,useValue:documents},{provide:AI,useValue:{generate:()=>{throw Error('Foreign case must never reach AI');}}}]})(BoundaryModule);
   const app=await NestFactory.create(BoundaryModule,{logger:false});try{
    await app.listen(0,'127.0.0.1');const base=await app.getUrl();
    const request=(suffix,method,body)=>fetch(`${base}/api/v1/notices/${cases[0]}/${suffix}`,{method,headers:{Authorization:'Bearer local-test','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    assert.equal((await request('flow','GET')).status,404);
    assert.equal((await request('filing','PUT',{intake_version:2})).status,404);
    for(const path of ['address-check','notice-check','return','dispatch','tracking','delivery-result','tasks','tasks/resolve','deadline','reassign','ai-draft'])assert.equal((await request(path,'POST',{})).status,403,path);
    assert.equal((await request('tasks/reply','POST',{revision:0,task_id:'1',contact:{email:'test@example.invalid'}})).status,404);
    assert.equal((await request('reply-received','POST',{revision:0,document_id:hidden.id})).status,404);
    assert.equal((await request('test-esign','POST',{})).status,403);
    const raw=(path,method='GET',body)=>fetch(`${base}/api/v1${path}`,{method,headers:{Authorization:'Bearer local-test','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    for(const who of [other,advocate]){
      identity=who;
      assert.equal((await raw(`/documents/${hidden.id}/view`)).status,404);
      assert.equal((await raw(`/payments/checkouts/${checkouts[0]}`)).status,404);
      assert.equal((await raw(`/payments/checkouts/${checkouts[0]}/simulate`,'POST',{})).status,404);
      assert.equal((await raw('/payments/checkouts','POST',{case_id:cases[0],quote_id:randomUUID()})).status,404);
      assert.equal((await raw('/payments/notice-courier-retry','POST',{case_id:cases[0],attempt_id:randomUUID(),revision:0,confirmed:true})).status,404);
    }
    identity=advocate;assert.equal((await request('flow','GET')).status,404);
    assert.equal((await request('ai-draft','POST',{base_version:0})).status,404);
    assert.equal((await request('tasks','POST',{revision:0,kind:'documents',reason:'Foreign request'})).status,404);
    assert.equal((await request('test-esign','POST',{revision:0,confirmed:true})).status,404);
    assert.equal((await request('filing','PUT',{intake_version:2})).status,403);
    identity=client;assert.equal((await raw(`/documents/${hidden.id}/view`)).status,404,'unreleased draft cannot be opened by its case client');
    identity=replacement;assert.equal((await raw(`/documents/${hidden.id}/view`)).status,200);
    identity=admin;assert.equal((await raw(`/documents/${hidden.id}/view`)).status,200);
   }finally{await app.close();}
  });
 }finally{
  // Keep these tagged synthetic rows in the dedicated local test database as
  // evidence. Never reset or clean a shared/local application database here.
  await db.$disconnect();
 }
});
