const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PDFDocument}=require('pdf-lib');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine'),{CaseRepository}=require('../dist/src/cases/case-repository');
const {ConsultationService}=require('../dist/src/consultations/consultation.service'),{ConsultationPayments}=require('../dist/src/consultations/consultation-payments'),{ConsultationReports}=require('../dist/src/consultations/consultation-reports');
const {DocumentService}=require('../dist/src/documents/document.service'),{stagingKey}=require('../dist/src/documents/document-storage');
const {NoticeMessages}=require('../dist/src/cases/notice-messages');
const {ConsultationIntakeSchema,WeeklyAvailabilitySchema,INDIA_JURISDICTIONS}=require('@legalitt/shared');
const stringify=v=>JSON.stringify(v,(_,x)=>typeof x==='bigint'?x.toString():x);
test('availability rejects overlapping, overnight and off-grid hours',()=>{
 for(const intervals of [[{day:1,start:'12:00',end:'11:00'}],[{day:1,start:'12:15',end:'13:00'}],[{day:1,start:'12:00',end:'14:00'},{day:1,start:'13:00',end:'15:00'}]])assert.equal(WeeklyAvailabilitySchema.safeParse({expected_version:0,intervals}).success,false);
});
test('three consultation services: booking contention, immutable prices, real chat, private briefs, admin correction and court representation',
{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
 const users=['client','client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST consultation '+role}));
 const [client,other,advocate,outsider,admin]=users,ids=[],inbox=[];
 const notifications={send:async(tx,n)=>{inbox.push(n);return {id:randomUUID(),simulated:true};}};
 const state=new CaseStateMachine(prisma,notifications),repo=new CaseRepository(prisma),service=new ConsultationService(prisma,notifications),chat=new NoticeMessages(prisma);
 const objects=new Map(),originalFetch=global.fetch;
 const storage={upload:async key=>({url:'https://consultation-storage.invalid',fields:{key:stagingKey(key)}}),head:async key=>objects.has(key)?{size:objects.get(key).length,mime:'application/pdf'}:null,
  read:async key=>objects.get(key),promote:async key=>objects.set(key,objects.get(stagingKey(key))),remove:async key=>objects.delete(key),discard:async key=>objects.delete(key),download:async key=>'https://consultation-storage.invalid/'+key};
 global.fetch=async(url,options)=>url==='https://consultation-storage.invalid'?(objects.set(options.body.get('key'),new Uint8Array(await options.body.get('file').arrayBuffer())),new Response(null,{status:204})):originalFetch(url,options);
 const docs=new DocumentService(prisma,storage,{inspect:async bytes=>({mime:'application/pdf',pageCount:(await PDFDocument.load(bytes)).getPageCount()})});
 const reports=new ConsultationReports(prisma,docs,notifications);let captures=0;
 const before={};for(const table of ['servicePricing','commissionRate','feePolicy','pageOveragePolicy'])before[table]=await db[table].findMany({select:{id:true}});
 const payments=new ConsultationPayments(prisma,{capture:async()=>{captures++;return {paymentId:randomUUID(),simulated:true,source:'simulated'};}},notifications);
 const revision=async(id,actor=advocate)=>({expected_revision:(await service.read(actor,id)).revision});
 const intake=ConsultationIntakeSchema.parse({full_name:'TEST Client',phone:'9999999999',email:'consultation@example.invalid',description:'An existing civil dispute needs advice and a plan.',title:'TEST Client v Other Party',other_party:'TEST Other Party',matter_type:'Civil',state:INDIA_JURISDICTIONS[0].name,district:INDIA_JURISDICTIONS[0].districts[0].name,bench_unknown:true,consent:true});
 const create=async(code,owner=client)=>{const c=await state.create(owner,{service_code:code});ids.push(c.id);await service.intake(owner,c.id,{expected_updated_at:c.updated_at.toISOString(),intake});return c;};
 const at=offset=>{const d=new Date(Date.now()+86400_000+offset*3600_000);d.setUTCMinutes(0,0,0);return d.toISOString();};
 const content={key_points:'We discussed the client’s concern and available documents.',next_steps:'Collect the relevant correspondence and preserve originals.',outcome:'Client understands the available options.',attachment_ids:[]};
 const reviewBrief=async(id,kind,correction=false)=>{
  await reports.notes(advocate,id,{...await revision(id),notes:'PRIVATE ADVOCATE NOTES — must never reach client or PDF'});
  let r=await reports.save(advocate,id,{...await revision(id),kind,content});
  await reports.submit(advocate,id,r.id,await revision(id));
  const pending=await service.read(admin,id),document=pending.reports[0].document_id;
  await assert.rejects(docs.url(client,document),{status:404});
  await assert.rejects(chat.send(advocate,(await chat.thread(advocate,id)).id,{document_id:document}),{status:400});
  assert.equal((await repo.read(client,id)).documents.some(d=>d.id===document),false);
  assert.equal((await service.read(client,id)).reports.some(r=>r.id===pending.reports[0].id),false);
  assert.doesNotMatch(stringify(await service.read(client,id)),/PRIVATE ADVOCATE/);
  await assert.rejects(reports.save(advocate,id,{...await revision(id),kind,content}),{status:409});
  await assert.rejects(reports.review(client,id,{...await revision(id,client),report_id:r.id,decision:'approved'}),{status:403});
  if(correction){
   const token=await revision(id,admin);await reports.review(admin,id,{...token,report_id:r.id,decision:'returned',reason:'PRIVATE REASON — clarify the next steps'});
   await assert.rejects(reports.review(admin,id,{...token,report_id:r.id,decision:'approved'}),{status:409});
   assert.equal((await service.read(client,id)).case.status,'changes_requested');
   assert.doesNotMatch(stringify(await service.read(client,id)),/PRIVATE REASON/);
   r=await reports.save(advocate,id,{...await revision(id),kind,content:{...content,next_steps:'Preserve correspondence and obtain certified records.'}});
   await reports.submit(advocate,id,r.id,await revision(id));
  }
  const final=await reports.review(admin,id,{...await revision(id,admin),report_id:r.id,decision:'approved'});
  assert.ok((await docs.url(client,final.document_id)).url);await assert.rejects(docs.url(other,final.document_id),{status:404});
  const doc=await db.document.findUniqueOrThrow({where:{id:final.document_id}});assert.ok((await PDFDocument.load(objects.get(doc.s3_key))).getPageCount()>0);
  await assert.rejects(docs.delete(advocate,final.document_id),{status:409});return final;
 };
 try{
  await db.user.createMany({data:users});for(const a of [advocate,outsider])await db.advocateProfile.create({data:{user_id:a.id,verification:'approved',city:'Mumbai'}});
  await require('../dist/prisma/seed-pricing').seedConfirmedPricing(db);
  await service.availability(advocate,{expected_version:0,intervals:Array.from({length:7},(_,day)=>({day,start:'00:00',end:'24:00'}))});
  await assert.rejects(service.availability(advocate,{expected_version:0,intervals:[]}),{status:409});
  assert.equal((await service.advocates(client,{service:'legal_advice'})).items.find(a=>a.id===advocate.id).has_availability,true);
  const one=await create('legal_advice'),two=await create('legal_advice',other);
  const race=await Promise.allSettled([service.reserve(client,one.id,{advocate_id:advocate.id,scheduled_at:at(0)}),service.reserve(other,two.id,{advocate_id:advocate.id,scheduled_at:at(0)})]);
  assert.equal(race.filter(r=>r.status==='fulfilled').length,1);
  await db.consultation.updateMany({where:{case_id:{in:[one.id,two.id]}},data:{reserved_until:new Date(0)}});
  for(const [index,code]of ['legal_advice','district_court','high_court'].entries())await t.test(code,async()=>{
   const c=await create(code);await assert.rejects(service.read(other,c.id),{status:404});await assert.rejects(service.read(outsider,c.id),{status:404});
   const document=await db.document.create({data:{case_id:c.id,owner_id:client.id,kind:'supporting_document',filename:'TEST-26-pages.pdf',mime_type:'application/pdf',size_bytes:100n,page_count:26,status:'uploaded',s3_key:randomUUID()}});
   await service.reserve(client,c.id,{advocate_id:advocate.id,scheduled_at:at(index+2)});await service.submit(client,c.id);
   const q=await payments.quote(client,c.id,{purpose:'service_fee'});assert.equal(q.status,'ready');assert.equal(q.breakdown.total_paise,'91000');
   const key=randomUUID(),p=await payments.pay(client,c.id,{purpose:'service_fee',quote_id:q.id},key);
   assert.equal((await payments.pay(client,c.id,{purpose:'service_fee',quote_id:q.id},key)).id,p.id);
   await assert.rejects(payments.pay(client,c.id,{purpose:'service_fee',quote_id:q.id},randomUUID()),{status:409});
   await assert.rejects(state.assign(admin,c.id,{advocate_id:outsider.id}),{status:409});await state.assign(admin,c.id,{advocate_id:advocate.id});
   const original=(await service.read(client,c.id)).session.scheduled_at;
   await service.reschedule(client,c.id,{...await revision(c.id,client),scheduled_at:at(index+9)});
   assert.notEqual((await service.read(client,c.id)).session.scheduled_at.toISOString(),original.toISOString());
   await assert.rejects(service.sessionAction(advocate,c.id,'start',await revision(c.id)),{status:409});
   await service.sessionAction(client,c.id,'join',await revision(c.id,client));await service.sessionAction(advocate,c.id,'start',await revision(c.id));
   await assert.rejects(service.sessionAction(advocate,c.id,'end',await revision(c.id)),{status:409});
   const thread=await chat.thread(client,c.id);await chat.send(client,thread.id,{body:'Please advise on this case.'});await chat.send(advocate,thread.id,{body:'Let us review the facts and discuss the options.'});
   await assert.rejects(chat.list(other,thread.id),{status:404});await service.sessionAction(advocate,c.id,'end',await revision(c.id));
   await reviewBrief(c.id,'consultation',index===0);
   if(code==='legal_advice'){assert.equal((await service.read(client,c.id)).case.status,'completed');assert.equal((await db.payout.findFirst({where:{case_id:c.id}})).net_paise,60000n);}
   else{
    const first=await payments.offer(advocate,c.id,{...await revision(c.id),base_amount_paise:'100000',scope:'Prepare and represent the client in the stated matter.',exclusions:'Court filing fees and out-of-pocket expenses are separate.'});
    const firstQ=await payments.quote(client,c.id,{purpose:'representation',court_quote_id:first.id});
    const second=await payments.offer(advocate,c.id,{...await revision(c.id),base_amount_paise:'200000',scope:'Prepare filings and represent the client through the first hearing.',exclusions:'Court fees are paid separately outside this app.'});
    await assert.rejects(payments.pay(client,c.id,{purpose:'representation',quote_id:firstQ.id,court_quote_id:first.id},randomUUID()),{status:409});
    await db.document.update({where:{id:document.id},data:{page_count:28}});
    const quoted=await payments.quote(client,c.id,{purpose:'representation',court_quote_id:second.id});assert.equal(quoted.breakdown.charged_pages,2);assert.equal(quoted.breakdown.total_paise,'300000');
    await payments.pay(client,c.id,{purpose:'representation',quote_id:quoted.id,court_quote_id:second.id},randomUUID());
    await assert.rejects(payments.offer(advocate,c.id,{...await revision(c.id),base_amount_paise:'100000',scope:'Changed representation offer',exclusions:'None'}),{status:409});
    for(const stage of ['preparation','filed','hearing','decision'])await reports.progress(advocate,c.id,{...await revision(c.id),stage,update:`TEST offline court ${stage} recorded by advocate.`,document_ids:[document.id],...(stage==='hearing'?{hearing_at:'2026-11-10T05:30:00Z',court_room:'TEST Room 3',next_steps:'TEST preserve the order.',next_hearing:'2026-12-10T05:30:00Z'}:{})});
    const hearing=(await service.read(client,c.id)).progress.find(p=>p.stage==='hearing');assert.equal(hearing.court_room,'TEST Room 3');assert.equal(hearing.next_steps,'TEST preserve the order.');assert.equal(hearing.hearing_at.toISOString(),'2026-11-10T05:30:00.000Z');assert.deepEqual(hearing.document_ids,[document.id]);
    await reviewBrief(c.id,'completion');assert.equal((await service.read(client,c.id)).case.status,'completed');
    assert.equal((await db.payout.findMany({where:{case_id:c.id}})).reduce((s,p)=>s+p.net_paise,0n),260000n);
   }
   await reports.rate(client,c.id,{rating:5,review:'TEST completed chat session'});
  });
  assert.equal(captures,5);assert.ok(inbox.some(n=>n.kind==='consultation_report_ready'));
 }finally{
  global.fetch=originalFetch;
  const where={case_id:{in:ids}};
  await db.consultationWorkspace.deleteMany({where});await db.payout.deleteMany({where});await db.courtQuote.updateMany({where,data:{supersedes_id:null,payment_id:null}});await db.payment.deleteMany({where});await db.casePriceQuote.deleteMany({where});await db.courtQuote.deleteMany({where});
  await db.consultationReport.updateMany({where,data:{supersedes_id:null}});await db.consultationReport.deleteMany({where});await db.courtProgress.deleteMany({where});
  const threads=await db.messageThread.findMany({where});await db.message.deleteMany({where:{thread_id:{in:threads.map(t=>t.id)}}});await db.messageThread.deleteMany({where});
  for(const table of ['consultation','document','caseEvent','caseParty'])await db[table].deleteMany({where});
  await db.adminAction.deleteMany({where:{subject_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});
  await db.advocateAvailability.deleteMany({where:{advocate_id:{in:users.map(u=>u.id)}}});await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
  await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)},fee_policy_id:{not:null}}});await db.feePolicy.deleteMany({where:{id:{notIn:before.feePolicy.map(x=>x.id)}}});await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)}}});await db.commissionRate.deleteMany({where:{id:{notIn:before.commissionRate.map(x=>x.id)}}});await db.pageOveragePolicy.deleteMany({where:{id:{notIn:before.pageOveragePolicy.map(x=>x.id)}}});await db.$disconnect();
 }
});
