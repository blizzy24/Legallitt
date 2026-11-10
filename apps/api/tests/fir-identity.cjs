const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {FirIdentityPolicySchema,DocumentPresignSchema,acceptedFirIdentity,assembleFirDraft,firDraftProblems}=require('@legalitt/shared');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {DocumentService}=require('../dist/src/documents/document.service'),{FileInspector}=require('../dist/src/documents/file-inspector');
const {firIdentityPolicy,requireFirIdentity}=require('../dist/src/documents/fir-identity');
const fixture=require('./helpers/fir.cjs'),configured=require('../prisma/fir-identity-policy.json');
const {renderFirPdf}=require('../dist/src/documents/fir-pdf');
test('FIR policy accepts the four confirmed types and refuses full Aadhaar configuration or ID-number metadata',()=>{
 const policy=FirIdentityPolicySchema.parse(configured);assert.deepEqual(policy.accepted_documents.map(d=>d.code),['masked_aadhaar','passport','voter_id','driving_licence']);
 for(const type of policy.accepted_documents){const doc={kind:'id_proof',status:'uploaded',identity_evidence:{document_type:type.code,masked_copy:type.requires_masking,policy_version:policy.version,declared_at:new Date().toISOString()}};assert.ok(acceptedFirIdentity(policy,doc));assert.equal(acceptedFirIdentity(policy,{...doc,status:'pending'}),false);}
 assert.equal(FirIdentityPolicySchema.safeParse({...policy,accepted_documents:[{code:'full_aadhaar',label:'Aadhaar',requires_masking:false}]}).success,false);
 const input={case_id:randomUUID(),kind:'id_proof',filename:'Identity-proof.pdf',mime:'application/pdf',identity:{document_type:'passport',masked_copy:false,id_number:'TEST-NOT-A-REAL-NUMBER'}};
 assert.equal(DocumentPresignSchema.safeParse(input).success,false);
});
test('FIR PDF refuses a missing identity selection even with otherwise complete draft facts',async()=>{
 const i=fixture.intake(),draft=assembleFirDraft(randomUUID(),i,'a'.repeat(64),new Date().toISOString(),fixture.editable(i),[]);
 assert.ok(firDraftProblems(draft).some(p=>p.field==='Identity document'));await assert.rejects(renderFirPdf('TEST',draft),/Select one accepted identity document/);
});
test('FIR identity uploads use database policy, neutral filenames and structural inspection only',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
 const user={id:randomUUID(),role:'client',cognito_sub:randomUUID(),full_name:'TEST identity privacy'},caseId=randomUUID(),old=await db.service.findUniqueOrThrow({where:{code:'fir_draft'}});
 const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4AWP4DwQACfsD/c8LaHIAAAAASUVORK5CYII=','base64');let inspections=0;
 const storage={upload:async key=>({url:'https://storage.invalid',fields:{key}}),head:async()=>({mime:'image/png',size:bytes.length}),read:async()=>bytes,promote:async()=>{},discard:async()=>{}};
 const inspector=new FileInspector(),docs=new DocumentService(prisma,storage,{inspect:async data=>{inspections++;const result=await inspector.inspect(data);assert.deepEqual(Object.keys(result).sort(),['mime','pageCount']);return result;}});
 const input={case_id:caseId,kind:'id_proof',filename:'TEST-PASSPORT-NUMBER-IN-ORIGINAL-NAME.png',mime:'image/png'};
 try{
  await db.user.create({data:user});await db.case.create({data:{id:caseId,service_code:'fir_draft',client_id:user.id,reference:'TEST-IDENTITY-'+randomUUID(),status:'draft',details:{}}});
  await t.test('missing type, unknown type and unmasked Aadhaar are blocked before storage is allocated',async()=>{
   for(const identity of [undefined,{document_type:'pan',masked_copy:false},{document_type:'full_aadhaar',masked_copy:true},{document_type:'masked_aadhaar',masked_copy:false}])await assert.rejects(docs.presign(user,{...input,...(identity?{identity}:{})}),{status:400});
   assert.equal(await db.document.count({where:{case_id:caseId}}),0);
  });
  let first;
  await t.test('each accepted type completes without reading or storing any identity number',async()=>{
   for(const type of configured.accepted_documents){const ticket=await docs.presign(user,{...input,identity:{document_type:type.code,masked_copy:type.requires_masking}});
    assert.ok(!JSON.stringify(ticket).includes('PASSPORT-NUMBER'));assert.match(ticket.document.filename,/^Identity-proof-/);assert.equal(ticket.document.identity_evidence.document_type,type.code);
    await assert.rejects(requireFirIdentity(db,caseId,ticket.document.id),{status:400});
    const doc=await docs.complete(user,ticket.document.id);assert.equal(doc.page_count,1);assert.equal(doc.identity_evidence.policy_version,1);assert.ok(acceptedFirIdentity(configured,doc));await requireFirIdentity(db,caseId,doc.id);first??=doc;
    const stored=await db.document.findUnique({where:{id:doc.id}});assert.equal(stored.filename.includes('PASSPORT-NUMBER'),false);assert.deepEqual(Object.keys(stored.identity_evidence).sort(),['declared_at','document_type','masked_copy','policy_version']);
   }assert.equal(inspections,4);
  });
  await t.test('operator configuration changes take effect without code or migration, and missing config fails closed',async()=>{
   const policy={...configured,version:2,accepted_documents:[{code:'synthetic_test_id',label:'Synthetic test ID',requires_masking:false}]};
   await db.service.update({where:{code:'fir_draft'},data:{config:{...old.config,fir_identity_policy:policy}}});
   await assert.rejects(requireFirIdentity(db,caseId,first.id),{status:400});
   const ticket=await docs.presign(user,{...input,identity:{document_type:'synthetic_test_id',masked_copy:false}});assert.equal(ticket.document.identity_evidence.policy_version,2);
   await db.service.update({where:{code:'fir_draft'},data:{config:{}}});await assert.rejects(firIdentityPolicy(db),{status:503});await assert.rejects(docs.presign(user,{...input,identity:{document_type:'passport',masked_copy:false}}),{status:503});
  });
 }finally{await db.service.update({where:{code:'fir_draft'},data:{config:old.config}});await db.document.deleteMany({where:{case_id:caseId}});await db.case.delete({where:{id:caseId}});await db.user.delete({where:{id:user.id}});await db.$disconnect();}
});
