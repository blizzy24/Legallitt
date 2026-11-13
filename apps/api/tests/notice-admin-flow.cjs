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
 const alerts=[],prisma={getClient:async()=>db},notifications={send:async(_tx,value)=>{alerts.push(value);return {};}},email=new TestNoticeEmail();
 const storage={head:async()=>({size:4,mime:'application/pdf'}),read:async()=>Buffer.from('%PDF'),download:async()=> 'http://127.0.0.1/test-only.pdf'};
 const flow=new NoticeFlowService(prisma,storage,email,notifications),machine=new CaseStateMachine(prisma,notifications),repo=new CaseRepository(prisma),messages=new NoticeMessages(prisma);
 const {NoticeSigning}=require('../dist/src/cases/notice-signing');
 const signing=new NoticeSigning(prisma,storage,{signed:async(actor,id)=>document(id,'legal_notice',actor),discard:async()=>{}},notifications);
 const signAndSubmit=async(actor,id,draft)=>{const view=await flow.view(actor,id);const mark=await signing.sign(actor,id,{revision:view.revision,draft_id:draft.id,mode:'test',confirmed:true});const signed=await flow.view(actor,id);await signing.submit(actor,id,{revision:signed.revision,draft_id:draft.id,signature_id:mark.signature_id});};
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
   const filing={intake_version:2,identity_kind:'pan',client:{fullName:'TEST Client',fatherName:'TEST Father',motherName:'TEST Mother',address:'TEST client address'},noticee:{fullName:'TEST Recipient',methods,
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
   if(index===0){
    const {CancellationsService}=require('../dist/src/cancellations/cancellations.service'),cancellations=new CancellationsService(prisma,notifications);
    const paid=await db.payment.findFirstOrThrow({where:{case_id:id,purpose:'service_fee',status:'captured'}}),life=await db.noticeLifecycle.findUniqueOrThrow({where:{case_id:id}});
    assert.equal(life.deadline_at.getTime(),paid.captured_at.getTime()+5*86400000,'deadline starts at captured payment');
    await db.noticeLifecycle.update({where:{case_id:id},data:{deadline_at:new Date(Date.now()-3600000)}});
    let v=await flow.view(admin,id);const input={revision:v.revision,amount_paise:'10000',reason:'TEST overdue partial refund'};
    for(const a of [client,other,who])await assert.rejects(flow.partialRefund(a,id,input),{status:403});
    await assert.rejects(flow.partialRefund(admin,id,{...input,amount_paise:'99999999'}),{status:400});
    const result=await flow.partialRefund(admin,id,input);assert.equal(result.simulated,true);assert.equal(result.case_continues,true);
    assert.equal((await db.case.findUniqueOrThrow({where:{id}})).status,'advocate_accepted');
    assert.equal((await db.refund.findFirstOrThrow({where:{case_id:id}})).amount_paise,10000n);
    await assert.rejects(flow.partialRefund(admin,id,input),{status:409});
    assert.ok(alerts.some(a=>a.case_id===id&&a.user_id===client.id&&a.body?.includes('No money was transferred')));
    v=await flow.view(admin,id);await flow.extendDeadline(admin,id,{revision:v.revision,deadline_at:new Date(Date.now()+86400000).toISOString(),reason:'TEST client informed of extension'});
    assert.equal((await flow.view(admin,id)).overdue,false);assert.ok(alerts.some(a=>a.case_id===id&&a.kind==='notice_deadline_extended'));
    assert.equal((await cancellations.read(client,id)).mode,'request');
   }
   const thread=await messages.thread(client,id);await messages.send(client,thread.id,{body:'TEST clarification'});
   let draft=await pdfDraft(id,who);
   if(index===0){
    const secondPdf=await document(id,'legal_notice',who),checks={base_version:draft.version,review_checks:{names:true,amount:true,demand_days:true}};
    const results=await Promise.allSettled([draft.document_id,secondPdf.id].map(doc=>machine.sendNoticeDraft(who,id,draft.id,checks,doc)));
    assert.equal(results.filter(r=>r.status==='fulfilled').length,1,'only one concurrent send may publish');
    const winner=results[0].status==='fulfilled'?draft.document_id:secondPdf.id;
    assert.equal((await db.draft.findUnique({where:{id:draft.id}})).document_id,winner,'published draft remains attached to the winning PDF');
   }else await machine.sendNoticeDraft(who,id,draft.id);
   if(index===0){
    const {NoticeReminders}=require('../dist/src/cases/notice-reminders'),{AdminCasesRepository}=require('../dist/src/admin-cases/admin-cases.repository');
    const sent=await db.caseEvent.findFirstOrThrow({where:{case_id:id,to_status:'client_review',from_status:{not:'client_review'}},orderBy:{id:'desc'}}),start=new Date(Date.now()-8*86400000);
    await db.caseEvent.update({where:{id:sent.id},data:{created_at:start}});
    const scoped={getClient:async()=>({noticeLifecycle:{findMany:async()=>[{case_id:id}]},$transaction:db.$transaction.bind(db)})},worker=new NoticeReminders(scoped,notifications);
    const count=()=>alerts.filter(a=>a.case_id===id&&a.kind==='notice_reminder'&&a.user_id===client.id).length;
    await worker.tick(new Date(start.getTime()+23*3600000));assert.equal(count(),0);
    await worker.tick(new Date(start.getTime()+24*3600000));assert.equal(count(),1);
    await worker.tick(new Date(start.getTime()+72*3600000));assert.equal(count(),2);
    await worker.tick(new Date());await worker.tick(new Date());assert.equal(count(),2,'reminder thresholds are idempotent');
    assert.equal((await db.case.findUniqueOrThrow({where:{id}})).status,'client_review','never auto-approved');
    const queue=new AdminCasesRepository(prisma);for(const a of [client,other,who])await assert.rejects(queue.list(a,{service:'legal_notice',queue:'pending_client_response'}),{status:403});
    const page=await queue.list(admin,{service:'legal_notice',queue:'pending_client_response',search:(await db.case.findUniqueOrThrow({where:{id}})).reference});assert.ok(page.items.some(c=>c.id===id));
   }
   await machine.reviewNoticeDraft(client,id,draft.id,'changes_requested',{sections:['facts'],comment:'TEST revise facts'});
   draft=await pdfDraft(id,who,draft.version);await machine.sendNoticeDraft(who,id,draft.id);
   if(index===0){
    for(let round=2;round<=4;round++){await machine.reviewNoticeDraft(client,id,draft.id,'changes_requested',{sections:['facts'],comment:'TEST revision round '+round});draft=await pdfDraft(id,who,draft.version);await machine.sendNoticeDraft(who,id,draft.id);}
    const {NoticeReminders}=require('../dist/src/cases/notice-reminders');await new NoticeReminders({getClient:async()=>({noticeLifecycle:{findMany:async()=>[{case_id:id}]},$transaction:db.$transaction.bind(db)})},notifications).tick();
    assert.ok(alerts.some(a=>a.case_id===id&&a.title==='Repeated Legal Notice changes'));assert.equal((await db.case.findUniqueOrThrow({where:{id}})).status,'client_review');
   }
   const final=await document(id,'legal_notice',client);
   await machine.reviewNoticeDraft(client,id,draft.id,'approved',{}, {approvedAt:new Date(),noticeDocumentId:final.id});
   let view=await flow.view(admin,id);assert.equal(view.stage.stage,4);assert.equal(view.chat.writable,true,'client approval alone does not close chat');await signAndSubmit(who,id,draft);view=await flow.view(admin,id);assert.equal(view.stage.stage,5);
   await assert.rejects(messages.send(client,thread.id,{body:'Too late'}),{status:409});assert.equal((await messages.list(client,thread.id)).items.length,1);
   await flow.check(admin,id,'address',{revision:view.revision,confirmed:true});view=await flow.view(admin,id);
   if(index===0){
    await flow.returnDraft(admin,id,{revision:view.revision,reason:'TEST internal correction'});
    await assert.rejects(flow.check(admin,id,'notice',{revision:view.revision,confirmed:true}),{status:409});
    assert.equal((await flow.view(client,id)).reviews.some(r=>r.comment==='TEST internal correction'),false);
    draft=await pdfDraft(id,who,draft.version);await machine.sendNoticeDraft(who,id,draft.id);await signAndSubmit(who,id,draft);
    assert.equal((await db.case.findUnique({where:{id}})).status,'approved');
    await assert.rejects(messages.send(who,thread.id,{body:'Still closed'}),{status:409});
    view=await flow.view(admin,id);
   }
   await flow.check(admin,id,'notice',{revision:view.revision,confirmed:true});view=await flow.view(admin,id);
   assert.equal(view.sub_status,'notice_admin_ready_for_dispatch','previous signing is bound to this exact version');
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
    if(index===1&&method==='email'){
     const before=await db.payment.count({where:{case_id:id}});
     await flow.result(admin,id,{revision:view.revision,attempt_id:attempt.id,result:'failed',occurred_at:new Date().toISOString(),reason:'TEST address bounced'});view=await flow.view(admin,id);
     const task=view.tasks.find(t=>t.kind==='contact'&&t.method==='email');assert.ok(task);
     await flow.replyTask(client,id,{revision:view.revision,task_id:task.id,contact:{email:'corrected@example.invalid'}});view=await flow.view(admin,id);
     await flow.resolveTask(admin,id,{revision:view.revision,task_id:task.id,confirmed:true});view=await flow.view(admin,id);
     await flow.dispatch(admin,id,{revision:view.revision,method:'email'});view=await flow.view(admin,id);attempt=view.attempts.filter(a=>a.method==='email').at(-1);
     assert.equal(await db.payment.count({where:{case_id:id}}),before,'email retry is free');assert.equal(attempt.retry_payment_id,null);
    }
    const {CancellationsService}=require('../dist/src/cancellations/cancellations.service');assert.equal((await new CancellationsService(prisma,notifications).read(client,id)).mode,'closed');
    await assert.rejects(new CancellationsService(prisma,notifications).cancel(client,id,{confirm:true}),{status:409});
    if(method==='courier'){await flow.tracking(admin,id,{revision:view.revision,attempt_id:attempt.id,occurred_at:new Date().toISOString(),place:'TEST location',text:'TEST manually entered tracking'});view=await flow.view(admin,id);}
    const proof=method==='courier'?await document(id,'notice_delivery_proof',admin):null;
    await flow.result(admin,id,{revision:view.revision,attempt_id:attempt.id,result:'delivered',occurred_at:new Date().toISOString(),...(proof?{proof_document_id:proof.id,received_by:'TEST recipient'}:{})});view=await flow.view(admin,id);
   }
   for(const uploader of [client,admin]){const reply=await document(id,'notice_reply',uploader);view=await flow.view(admin,id);await flow.replyReceived(uploader,id,{revision:view.revision,document_id:reply.id});}
   assert.equal(await db.caseEvent.count({where:{case_id:id,type:'notice_reply_received'}}),2);assert.ok(alerts.some(a=>a.case_id===id&&a.user_id===who.id&&a.kind==='notice_reply_received'));
   assert.equal(view.status,'completed');assert.ok((await walletEntries(db,who.id)).some(e=>e.case_id===id&&e.share_paise==='99900'));
   await assert.rejects(flow.result(admin,id,{revision:view.revision,attempt_id:view.attempts[0].id,result:'delivered',occurred_at:new Date().toISOString()}),{status:409});
  }
  assert.equal(email.sent.length,3);assert.ok(email.sent.some(s=>s.to==='corrected@example.invalid'));
  await t.test('every new HTTP endpoint enforces its role and case scope',async()=>{
   require('reflect-metadata');const {Module}=require('@nestjs/common'),{NestFactory}=require('@nestjs/core');
   const {AuthGuard}=require('../dist/src/auth/auth.controller'),{AuthService}=require('../dist/src/auth/auth.service');
   const {NoticeFlowController}=require('../dist/src/cases/notice-flow.controller');
   const {NoticeSigningController}=require('../dist/src/cases/notice-signing');
   const {NoticeDraftAiController}=require('../dist/src/cases/notice-draft-ai'),{PrismaService}=require('../dist/src/prisma.service'),{AI}=require('../dist/src/ai/ai.port');
   const {PaymentsController}=require('../dist/src/payments/payments.controller'),{DocumentController}=require('../dist/src/documents/document.controller'),{DocumentService}=require('../dist/src/documents/document.service');
   const documents=new DocumentService(prisma,storage,{}),hidden=await document(cases[0],'legal_notice',replacement);
   let identity=other;class BoundaryModule{};Module({controllers:[NoticeSigningController,NoticeFlowController,NoticeDraftAiController,PaymentsController,DocumentController],providers:[{provide:NoticeSigning,useValue:signing},AuthGuard,{provide:AuthService,useValue:{identity:async()=>identity}},{provide:NoticeFlowService,useValue:flow},{provide:PaymentsService,useValue:payments},{provide:PrismaService,useValue:prisma},{provide:DocumentService,useValue:documents},{provide:AI,useValue:{generate:()=>{throw Error('Foreign case must never reach AI');}}}]})(BoundaryModule);
   const app=await NestFactory.create(BoundaryModule,{logger:false});try{
    await app.listen(0,'127.0.0.1');const base=await app.getUrl();
    const request=(suffix,method,body)=>fetch(`${base}/api/v1/notices/${cases[0]}/${suffix}`,{method,headers:{Authorization:'Bearer local-test','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    assert.equal((await request('flow','GET')).status,404);
    assert.equal((await request('filing','PUT',{intake_version:2})).status,404);
    for(const path of ['address-check','notice-check','return','dispatch','tracking','delivery-result','tasks','tasks/resolve','deadline','partial-refund','reassign','ai-draft'])assert.equal((await request(path,'POST',{})).status,403,path);
    assert.equal((await request('tasks/reply','POST',{revision:0,task_id:'1',contact:{email:'test@example.invalid'}})).status,404);
    assert.equal((await request('reply-received','POST',{revision:0,document_id:hidden.id})).status,404);
    assert.equal((await request('test-esign','POST',{})).status,403);for(const path of ['sign','submit-admin'])assert.equal((await request(path,'POST',{})).status,403,path+' client role');
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
    assert.equal((await request('sign','POST',{revision:0,draft_id:randomUUID(),mode:'test',confirmed:true})).status,404);
    assert.equal((await request('submit-admin','POST',{revision:0,draft_id:randomUUID(),signature_id:randomUUID()})).status,404);
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
