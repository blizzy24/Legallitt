// Q114 (docs/flows/ISHAAN-ANSWERS-2026-11-12.md): FIR collects no Aadhaar / PAN or any
// other identity document. New identity uploads are refused, nothing requires one, and
// identity files stored on older cases stay stored but are shown only to the admin.
const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {DocumentPresignSchema,assembleFirDraft,firDraftProblems,firPdfSections}=require('@legalitt/shared');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {DocumentService}=require('../dist/src/documents/document.service'),{CaseStateMachine}=require('../dist/src/cases/case-state-machine');
const {CaseRepository}=require('../dist/src/cases/case-repository'),{AdminCaseDetailRepository}=require('../dist/src/admin-cases/admin-case-detail');
const {FirService}=require('../dist/src/cases/fir.service');
const {renderFirPdf}=require('../dist/src/documents/fir-pdf'),{readPdfText}=require('./helpers/pdf-text.cjs');
const fixture=require('./helpers/fir.cjs');
const REFUSED=/Identity documents aren’t collected for FIR Draft/;

test('upload metadata still refuses full identity numbers',()=>{
 const input={case_id:randomUUID(),kind:'fir_primary',filename:'TEST 1234 5678 9012.pdf',mime:'application/pdf'};
 assert.equal(DocumentPresignSchema.safeParse(input).success,false);
});
test('a complete FIR draft needs no identity document; the PDF has no identity row and never lists an identity file',async()=>{
 const i=fixture.intake(),editable=fixture.editable(i),identity=randomUUID(),evidence=randomUUID();
 const none=assembleFirDraft(randomUUID(),i,'a'.repeat(64),new Date().toISOString(),editable,[]);
 assert.deepEqual(firDraftProblems(none),[],'nothing asks for an identity document');
 // An older draft selected and attached an identity file: it is neither printed nor listed.
 const old=assembleFirDraft(randomUUID(),i,'a'.repeat(64),new Date().toISOString(),{...editable,identity_document_id:identity,attachment_ids:[identity,evidence]},
  [{document_id:identity,filename:'Identity-proof-old.pdf',mime_type:'application/pdf'},{document_id:evidence,filename:'TEST-evidence.pdf',mime_type:'application/pdf'}]);
 const lines=firPdfSections(old).flatMap(s=>s.lines);
 assert.equal(lines.some(l=>/identity/i.test(l.label)||/identity/i.test(l.value)),false);
 assert.deepEqual(firPdfSections(old).find(s=>s.title==='8. Attached Documents').lines,[{label:'Attachment 1',value:'TEST-evidence.pdf'}]);
 const {text}=await readPdfText(await renderFirPdf('TEST',old));
 for(const gone of ['Identity document','Official ID','Identity proof','Identity-proof-old.pdf'])assert.equal(text.includes(gone),false,gone);
 assert.ok(text.includes('TEST-evidence.pdf'));
 assert.ok((await readPdfText(await renderFirPdf('TEST',none))).text.includes('Attachments: None included'));
});

test('FIR identity uploads are refused at every stage; old stored identity files are shown only to the admin',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
 const users=['client','advocate','admin','advocate'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST no identity '+role})),[client,advocate,admin,stranger]=users,ids=[];
 const storage={upload:async key=>({url:'https://storage.invalid',fields:{key}}),download:async key=>'https://storage.invalid/'+key};
 const docs=new DocumentService(prisma,storage,{inspect:async()=>({mime:'application/pdf',pageCount:1})}),state=new CaseStateMachine(prisma,{send:async()=>{}});
 const repo=new CaseRepository(prisma),detail=new AdminCaseDetailRepository(prisma),fir=new FirService(prisma,docs,{send:async()=>{}});
 const before={};for(const model of ['servicePricing','commissionRate','feePolicy','pageOveragePolicy'])before[model]=await db[model].findMany({select:{id:true}});
 const identity={identity_last4:'4812',identity:{document_type:'passport',masked_copy:false}};
 try{
  await db.user.createMany({data:users});await require('../dist/prisma/seed-pricing').seedConfirmedPricing(db);
  const draft=await state.create(client,{service_code:'fir_draft'});ids.push(draft.id);await fir.intake(client,draft.id,fixture.intake());
  await t.test('the client cannot upload an identity document, with or without identity details, and no row is created',async()=>{
   for(const extra of [{},identity,{identity_last4:'4812'}])
    await assert.rejects(docs.presign(client,{case_id:draft.id,kind:'id_proof',filename:'TEST.pdf',mime:'application/pdf',...extra}),e=>e.status===400&&REFUSED.test(e.message));
   assert.equal(await db.document.count({where:{case_id:draft.id}}),0);
  });
  await t.test('identity details on any other upload are refused too',async()=>{
   for(const extra of [identity,{identity_last4:'4812'},{identity:identity.identity}])
    await assert.rejects(docs.presign(client,{case_id:draft.id,kind:'fir_primary',filename:'TEST.pdf',mime:'application/pdf',...extra}),{status:400});
   assert.equal(await db.document.count({where:{case_id:draft.id}}),0);
  });
  await t.test('submission needs a primary document and no identity document',async()=>{
   await assert.rejects(state.submitForPayment(client,draft.id),e=>e.status===400&&/primary document/.test(e.message));
   await fixture.primary(db,draft.id,client.id);assert.equal((await state.submitForPayment(client,draft.id)).status,'payment_pending');
  });
  // An older case, as it was stored before Q114: the client's identity file is still there.
  const old=randomUUID();ids.push(old);
  await db.case.create({data:{id:old,service_code:'fir_draft',client_id:client.id,advocate_id:advocate.id,reference:'TEST-OLD-IDENTITY-'+old.slice(0,8),status:'in_progress',details:{}}});
  const stored=await db.document.create({data:{case_id:old,owner_id:client.id,kind:'id_proof',filename:`Identity-proof-${randomUUID()}.pdf`,mime_type:'application/pdf',size_bytes:100n,page_count:1,status:'uploaded',s3_key:randomUUID(),identity_last4:'4812',identity_evidence:{document_type:'passport',masked_copy:false,policy_version:1,declared_at:new Date().toISOString()}}});
  const evidence=await fixture.primary(db,old,client.id);
  await t.test('an old identity file stays stored but is listed only for the admin',async()=>{
   for(const actor of [client,advocate]){const listed=(await repo.read(actor,old)).documents.map(d=>d.id);assert.ok(listed.includes(evidence.id),actor.role);assert.equal(listed.includes(stored.id),false,actor.role);}
   assert.ok((await repo.read(admin,old)).documents.some(d=>d.id===stored.id));
   assert.ok((await detail.get(admin,old)).documents.some(d=>d.id===stored.id),'the admin case document list is unchanged');
   assert.equal((await db.document.findUniqueOrThrow({where:{id:stored.id}})).status,'uploaded','never deleted');
  });
  await t.test('the advocate cannot open it; the admin can',async()=>{
   await assert.rejects(docs.url(advocate,stored.id),{status:404});await assert.rejects(docs.url(stranger,stored.id),{status:404});
   assert.ok((await docs.url(admin,stored.id)).url);assert.ok((await docs.url(advocate,evidence.id)).url);
  });
  await t.test('nobody can add an identity document to an older case either',async()=>{
   await assert.rejects(docs.presign(advocate,{case_id:old,kind:'id_proof',filename:'TEST.pdf',mime:'application/pdf'}),e=>e.status===400&&REFUSED.test(e.message));
   await assert.rejects(docs.presign(client,{case_id:old,kind:'id_proof',filename:'TEST.pdf',mime:'application/pdf',...identity}),e=>e.status===400&&REFUSED.test(e.message));
   await assert.rejects(docs.presign(stranger,{case_id:old,kind:'id_proof',filename:'TEST.pdf',mime:'application/pdf'}),{status:404});
   assert.equal(await db.document.count({where:{case_id:old,kind:'id_proof'}}),1);
  });
 }finally{
  await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});await db.document.deleteMany({where:{case_id:{in:ids}}});await db.caseParty.deleteMany({where:{case_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
  await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)},fee_policy_id:{not:null}}});await db.feePolicy.deleteMany({where:{id:{notIn:before.feePolicy.map(x=>x.id)}}});await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)}}});await db.commissionRate.deleteMany({where:{id:{notIn:before.commissionRate.map(x=>x.id)}}});await db.pageOveragePolicy.deleteMany({where:{id:{notIn:before.pageOveragePolicy.map(x=>x.id)}}});
  await db.$disconnect();
 }
});
