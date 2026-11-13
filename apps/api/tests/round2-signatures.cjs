const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {AdvocateSignatures,AdvocateSignatureController}=require('../dist/src/account/advocate-signature');
const {NoticeSigning}=require('../dist/src/cases/notice-signing'),{NoticePdfService}=require('../dist/src/cases/notice-pdf.service');
const {DocumentService}=require('../dist/src/documents/document.service'),{FileInspector}=require('../dist/src/documents/file-inspector'),{stagingKey}=require('../dist/src/documents/document-storage');
const {ensureNoticeLifecycle}=require('../dist/src/cases/notice-lifecycle');
const {readPdfText}=require('./helpers/pdf-text.cjs');
const {DEFAULT_NOTICE_POLICY}=require('@legalitt/shared');

test('Round 2 uploaded signature: private profile versions, real PDF pipeline, fixed placement and exact-version submit',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
 const actors=['client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role})),[client,advocate,other,admin]=actors,objects=new Map(),originalFetch=global.fetch;
 const advocatePhone='9'+require('node:crypto').randomInt(100000000,999999999);
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lX8AAAAASUVORK5CYII=','base64');
 const storage={upload:async(key,mime)=>({url:'http://signature-upload.invalid',fields:{key:stagingKey(key),mime}}),head:async key=>{const o=objects.get(key);return o?{size:o.bytes.length,mime:o.mime,etag:'test-only'}:null;},read:async key=>objects.get(key).bytes,promote:async key=>objects.set(key,objects.get(stagingKey(key))),download:async key=>'http://signature-read.invalid/'+key,delete:async()=>{},purge:async()=>{}};
 global.fetch=async(url,options)=>{if(String(url)==='http://signature-upload.invalid'){const f=options.body;objects.set(f.get('key'),{bytes:Buffer.from(await f.get('file').arrayBuffer()),mime:f.get('mime')});return new Response(null,{status:204});}return originalFetch(url,options);};
 const inspector=new FileInspector(),profiles=new AdvocateSignatures(prisma,storage,inspector),documents=new DocumentService(prisma,storage,inspector),pdf=new NoticePdfService(prisma,documents),signing=new NoticeSigning(prisma,storage,pdf,{send:async()=>({})});
 try{
  await db.user.createMany({data:actors.map((a,i)=>({...a,cognito_sub:'round2-signature-'+a.id,full_name:'TEST Signature '+a.role,phone:i===1?'+91'+advocatePhone:null}))});
  await db.advocateProfile.create({data:{user_id:advocate.id,verification:'approved',city:'Mumbai'}});
  let identity=client;require('reflect-metadata');const {Module}=require('@nestjs/common'),{NestFactory}=require('@nestjs/core'),{AuthGuard}=require('../dist/src/auth/auth.controller'),{AuthService}=require('../dist/src/auth/auth.service');
  class Boundary{};Module({controllers:[AdvocateSignatureController],providers:[AuthGuard,{provide:AuthService,useValue:{identity:async()=>identity}},{provide:AdvocateSignatures,useValue:profiles}]})(Boundary);
  const app=await NestFactory.create(Boundary,{logger:false});let saved;
  try{await app.listen(0,'127.0.0.1');const base=await app.getUrl(),request=(p,body)=>fetch(base+'/api/v1/account/signature'+p,{method:body?'POST':'GET',headers:{Authorization:'Bearer test','Content-Type':'application/json'},...body?{body:JSON.stringify(body)}:{}});
   await t.test('all profile endpoints enforce role, ownership, image validation and stale-version protection',async()=>{
    for(const actor of [client,admin]){identity=actor;for(const [p,b]of [['',null],['/upload',{mime:'image/png'}],['/complete',{document_id:randomUUID(),base_signature_id:null}]])assert.equal((await request(p,b)).status,403);}
    identity=advocate;assert.deepEqual(await (await request('')).json(),{signature:null});
    const upload=await (await request('/upload',{mime:'image/png'})).json();objects.set(upload.upload.fields.key,{bytes:png,mime:'image/png'});
    identity=other;assert.equal((await request('/complete',{document_id:upload.document.id,base_signature_id:null})).status,400);assert.deepEqual(await(await request('')).json(),{signature:null});
    identity=advocate;const response=await request('/complete',{document_id:upload.document.id,base_signature_id:null});assert.equal(response.status,201);saved=await response.json();
    const current=await(await request('')).json();assert.equal(current.signature.id,saved.id);assert.ok(current.signature.url.includes(advocate.id));
    const next=await profiles.presign(advocate,{mime:'image/png'});objects.set(next.upload.fields.key,{bytes:Buffer.from('invalid image'),mime:'image/png'});
    await assert.rejects(profiles.complete(advocate,{document_id:next.document.id,base_signature_id:null}),{status:409});
    await assert.rejects(profiles.complete(advocate,{document_id:next.document.id,base_signature_id:saved.id}),{status:400});
    assert.equal(await db.advocateSignature.count({where:{advocate_id:advocate.id}}),1);
   });
  }finally{await app.close();}
  const pricing=await db.servicePricing.findFirstOrThrow({where:{service_code:'legal_notice',tier:'urgent'}});
  const c=await db.case.create({data:{reference:'TEST-R2-SIGN-'+randomUUID(),service_code:'legal_notice',client_id:client.id,advocate_id:advocate.id,status:'approved',sub_status:'notice_advocate_signature',tier:'urgent',pricing_id:pricing.id,details:{client:{fullName:'TEST Client',mobile:'+919123456781',fatherName:'TEST Father',address:'TEST Address'},noticee:{fullName:'TEST Company',entityType:'company',methods:['email'],email:'recipient@example.invalid'}}}});
  const content={sender:'TEST Client, Age 41\nTEST Address\nFather: TEST Father',recipient:'TEST Company\nrecipient@example.invalid',subject:'TEST approved notice',facts:'TEST facts, contact +91 91234 56781',demand:'TEST demand',closing:'TEST closing, phone '+advocatePhone};
  const d=await db.draft.create({data:{case_id:c.id,kind:'legal_notice',version:1,created_by:advocate.id,generated_by:'manual',content,closing_policy:DEFAULT_NOTICE_POLICY,compliance_period_days:7}});
  await db.$transaction(async tx=>{await ensureNoticeLifecycle(tx,c);await tx.noticeLifecycle.update({where:{case_id:c.id},data:{approved_draft_id:d.id}});});
  const body={revision:0,draft_id:d.id,mode:'uploaded',profile_signature_id:saved.id,confirmed:true};
  await t.test('signing renders and files the approved text with the saved image; no age or private phones in PDF',async()=>{
   await assert.rejects(signing.sign(other,c.id,body),{status:404});for(const a of [client,admin])await assert.rejects(signing.sign(a,c.id,body),{status:403});
   await assert.rejects(signing.sign(advocate,c.id,{...body,profile_signature_id:randomUUID()}),{status:409});
   const mark=await signing.sign(advocate,c.id,body),doc=await db.document.findUniqueOrThrow({where:{id:mark.document_id}});assert.equal(doc.status,'uploaded');assert.ok(doc.page_count>0);
   const result=await readPdfText(objects.get(doc.s3_key).bytes);for(const value of ['TEST approved notice','TEST Father','TEST closing'])assert.ok(result.text.includes(value),value);
   for(const value of ['Age 41','9123456781','91234 56781',advocatePhone,'digitally signed'])assert.ok(!result.text.includes(value),value);
   const {PDFName}=require('pdf-lib');const images=result.pdf.getPages().flatMap(p=>[...p.node.Resources().lookup(PDFName.of('XObject')).entries()]);assert.ok(images.length>=2,'wordmark and saved signature image embedded');
   const row=await db.noticeSignature.findUniqueOrThrow({where:{id:mark.signature_id}});assert.equal(row.draft_id,d.id);assert.equal(row.profile_signature_id,saved.id);assert.equal(row.document_id,doc.id);
   await assert.rejects(signing.sign(advocate,c.id,body),{status:409});
   const life=await db.noticeLifecycle.findUniqueOrThrow({where:{case_id:c.id}});assert.equal(life.handed_to_admin_at,null);
   await assert.rejects(signing.submit(advocate,c.id,{revision:life.revision,draft_id:d.id,signature_id:randomUUID()}),{status:409});
   await signing.submit(advocate,c.id,{revision:life.revision,draft_id:d.id,signature_id:mark.signature_id});
   assert.ok((await db.noticeLifecycle.findUniqueOrThrow({where:{case_id:c.id}})).handed_to_admin_at);
   await assert.rejects(signing.submit(advocate,c.id,{revision:life.revision,draft_id:d.id,signature_id:mark.signature_id}),{status:409});
  });
 }finally{global.fetch=originalFetch;await db.$disconnect();}
});
