const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID,createHash}=require('node:crypto'),fs=require('node:fs');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine'),{CaseRepository}=require('../dist/src/cases/case-repository'),{FirService}=require('../dist/src/cases/fir.service');
const {FirSubmissionSchema,validFirDate,INDIA_JURISDICTIONS}=require('@legalitt/shared');
const source=require('../../../packages/shared/src/reference/india-jurisdictions.json');
const state=INDIA_JURISDICTIONS.find(s=>s.name==='Maharashtra'),district=state.districts.find(d=>d.name==='Mumbai');
const intake=()=>({intake_version:2,intake_step:3,contact:{fullName:'TEST Intake',mobile:'2025550100',email:'',country_code:'IN',dial_code:'+91'},jurisdiction:{state:state.name,state_code:state.code,district:district.name,district_code:district.code,policeStation:'TEST free text station',source_retrieved_at:source.retrieved_at},place:{address:'TEST intake place',city:'Mumbai',pin:''},incident:{type:'theft',date:'10/11/2026',time:'09:30',location:'TEST location',description:'TEST ONLY intake; no police filing.',additional:'TEST additional information'},people:[{id:randomUUID(),kind:'complainant',name:'TEST Intake',phone:'+91 2025550100',residence:'TEST residence',details:'',personal_details:require('./helpers/fir.cjs').personal()},{id:randomUUID(),kind:'accused',name:'',unknown:true,alias:'TEST identifying description',primary:true,details:'TEST unknown suspect'},{id:randomUUID(),kind:'witness',name:'TEST witness',phone:'2025550101',role:'Passerby',presence:'At incident',details:'TEST statement'}]});
test('official jurisdiction snapshot has unique LGD codes and a reproducible checksum',()=>{
 assert.equal(source.source,'https://lgdirectory.gov.in/downloadDirectory.do');
 assert.equal(INDIA_JURISDICTIONS.length,36);const districts=INDIA_JURISDICTIONS.flatMap(s=>s.districts);
 assert.equal(districts.length,790);assert.equal(new Set(districts.map(d=>d.code)).size,790);
 assert.equal(new Set(INDIA_JURISDICTIONS.map(s=>s.code)).size,36);assert.ok(INDIA_JURISDICTIONS.every(s=>s.districts.length));
 const bytes=fs.readFileSync(require.resolve('../../../packages/shared/src/reference/india-jurisdictions.json'),'utf8').replace(/\r\n/g,'\n');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'578382a9a5f22008c6f94a0db5768599a46cc451a776fa0f2945d19488d4ee42');
});
test('FIR submission validates real dates, contact, complainant and known versus unknown suspects',()=>{
 const input=intake();assert.equal(FirSubmissionSchema.safeParse(input).success,true);
 for(const date of ['31/02/2026','29/02/2025','2026-13-01','yesterday'])assert.equal(validFirDate(date),false,date);
 assert.equal(validFirDate('29/02/2024'),true);
 for(const change of [v=>v.people[0].personal_details.age=null,v=>v.people[0].residence='',v=>v.people[1].unknown=false,v=>v.people[0].phone='',v=>v.contact.email='invalid',v=>v.incident.time='25:99',v=>v.incident.description='']){
  const v=intake();change(v);assert.equal(FirSubmissionSchema.safeParse(v).success,false);
 }
});
test('FIR intake persists partial cases and parties atomically, with ownership and revision protection',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
 const users=['client','client','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST intake '+role})),[client,other,admin]=users,ids=[];
 const sm=new CaseStateMachine(prisma,{send:async()=>{}}),repo=new CaseRepository(prisma),fir=new FirService(prisma,{},{});
 const before={};for(const model of ['servicePricing','commissionRate','feePolicy','pageOveragePolicy'])before[model]=await db[model].findMany({select:{id:true}});
 const create=async owner=>{const c=await sm.create(owner,{service_code:'fir_draft'});ids.push(c.id);return c;};
 try{
  await require('../dist/prisma/seed-pricing').seedConfirmedPricing(db);
  await db.user.createMany({data:users});const c=await create(client),foreign=await create(other);let saved;
  await t.test('partial save resumes with exact row IDs and all entered fields',async()=>{
   const partial=intake();partial.incident.description='';partial.contact.email='not finished';
   saved=await fir.intake(client,c.id,{...partial,expected_updated_at:c.updated_at.toISOString()});
   assert.equal(saved.details.incident.description,'');assert.equal(saved.details.contact.email,'not finished');
   assert.equal((await db.case.findUnique({where:{id:c.id}})).details.people,undefined);
   assert.equal(await db.caseParty.count({where:{case_id:c.id}}),3);
   const read=await repo.read(client,c.id);assert.deepEqual(read.details.people.map(p=>p.id),partial.people.map(p=>p.id));
   assert.deepEqual(read.details.people[0].personal_details,partial.people[0].personal_details);assert.equal(read.details.people[1].unknown,true);assert.equal(read.details.people[0].residence,'TEST residence');
   assert.equal(read.details.people[2].role,'Passerby');assert.equal(read.details.people[2].presence,'At incident');
  });
  await t.test('another client cannot read or write; foreign party IDs roll back all changes',async()=>{
   await assert.rejects(repo.read(other,c.id),{status:404});await assert.rejects(fir.intake(other,c.id,intake()),{status:404});await assert.rejects(fir.intake(admin,c.id,intake()),{status:403});
   const f=await fir.intake(other,foreign.id,intake()),v=intake();v.people[1].id=f.details.people[1].id;
   await assert.rejects(fir.intake(client,c.id,v),{status:400});assert.equal(await db.caseParty.count({where:{case_id:c.id}}),3);
   assert.equal((await repo.read(client,c.id)).details.contact.email,'not finished');
  });
  await t.test('simultaneous saves admit one revision; stale writes and v1 downgrade are blocked',async()=>{
   const a={...intake(),expected_updated_at:saved.updated_at.toISOString()},b={...a,incident:{...a.incident,additional:'Other session'}};
   const results=await Promise.allSettled([fir.intake(client,c.id,a),fir.intake(client,c.id,b)]);
   assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.status,409);
   saved=results.find(r=>r.status==='fulfilled').value;
   const legacy=intake();delete legacy.intake_version;await assert.rejects(fir.intake(client,c.id,legacy),{status:409});
  });
  await t.test('district parent validation is atomic; removed people disappear and remaining IDs survive',async()=>{
   const v={...saved.details};v.jurisdiction={...v.jurisdiction,state_code:'999999'};await assert.rejects(fir.intake(client,c.id,v),{status:400});
   const keep=saved.details.people.slice(0,2);saved=await fir.intake(client,c.id,{...saved.details,people:keep,expected_updated_at:saved.updated_at.toISOString()});
   assert.deepEqual((await repo.read(client,c.id)).details.people.map(p=>p.id),keep.map(p=>p.id));assert.equal(await db.caseParty.count({where:{case_id:c.id}}),2);
  });
  await t.test('submission requires a primary document, never an identity document (Q114), and locks further intake changes',async()=>{
   assert.equal(await db.document.count({where:{case_id:c.id}}),0);await assert.rejects(sm.submitForPayment(client,c.id),e=>e.status===400&&/primary document/.test(e.message));
   await require('./helpers/fir.cjs').primary(db,c.id,client.id);await sm.submitForPayment(client,c.id);assert.equal((await repo.read(client,c.id)).status,'payment_pending');
   assert.equal(await db.document.count({where:{case_id:c.id,kind:'id_proof'}}),0);await assert.rejects(fir.intake(client,c.id,intake()),{status:409});
  });
 }finally{
  await db.document.deleteMany({where:{case_id:{in:ids}}});await db.caseParty.deleteMany({where:{case_id:{in:ids}}});await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
  await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)},fee_policy_id:{not:null}}});await db.feePolicy.deleteMany({where:{id:{notIn:before.feePolicy.map(x=>x.id)}}});await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)}}});await db.commissionRate.deleteMany({where:{id:{notIn:before.commissionRate.map(x=>x.id)}}});await db.pageOveragePolicy.deleteMany({where:{id:{notIn:before.pageOveragePolicy.map(x=>x.id)}}});await db.$disconnect();
 }
});
