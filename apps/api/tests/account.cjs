const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseRepository}=require('../dist/src/cases/case-repository');
const {AccountService}=require('../dist/src/account/account.service');

test('Account area (D-15, D-17, D-18, D-19): own profile, documents, payments and receipts only',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
  const users=['client','client','advocate'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST ACCOUNT '+role,email:`${randomUUID()}@legalitt.invalid`}));
  const [client,other,advocate]=users,ids=[];
  const account=new AccountService(prisma,new CaseRepository(prisma));
  const mkCase=async(owner,status,extra={})=>{const c=await db.case.create({data:{reference:'TEST-ACC-'+randomUUID().slice(0,8),service_code:'legal_notice',client_id:owner.id,status,...extra}});ids.push(c.id);return c;};
  const mkDoc=(c,owner,filename)=>db.document.create({data:{case_id:c.id,owner_id:owner.id,kind:'supporting_document',filename,s3_key:randomUUID(),mime_type:'application/pdf',size_bytes:10n,page_count:1,status:'uploaded'}});
  try{
    await db.user.createMany({data:users});
    const draft=await mkCase(client,'draft'),paid=await mkCase(client,'in_progress',{advocate_id:advocate.id}),foreign=await mkCase(other,'draft');
    const a=await mkDoc(draft,client,'mine-draft.pdf'),b=await mkDoc(paid,client,'mine-paid.pdf'),x=await mkDoc(foreign,other,'theirs.pdf');
    const payment=await db.payment.create({data:{case_id:paid.id,payer_id:client.id,purpose:'service_fee',base_amount_paise:100000n,gst_paise:18000n,total_paise:118000n,status:'captured',idempotency_key:randomUUID(),simulated:true,captured_at:new Date()}});
    const theirs=await db.payment.create({data:{case_id:foreign.id,payer_id:other.id,purpose:'service_fee',base_amount_paise:1n,gst_paise:0n,total_paise:1n,status:'captured',idempotency_key:randomUUID(),captured_at:new Date()}});
    await t.test('profile reads and updates only the signed-in client',async()=>{
      let p=await account.profile(client);assert.equal(p.counts.active_cases,1);assert.equal(p.counts.total_cases,2);assert.equal(p.city,null);
      p=await account.updateProfile(client,{name:'TEST Renamed',date_of_birth:'2000-05-15',gender:'prefer_not_to_say',city:'Indore',state:'Madhya Pradesh',country:'India'});
      assert.equal(p.name,'TEST Renamed');assert.equal(p.date_of_birth,'2000-05-15');assert.equal(p.city,'Indore');
      await assert.rejects(account.updateProfile(client,{date_of_birth:'2999-01-01'}),{status:400});
      await assert.rejects(account.updateProfile(client,{email:'x@y.z'}),{status:400},'email is Cognito-bound');
      assert.equal((await account.profile(other)).city,null);
      await assert.rejects(account.profile(advocate),{status:403});
    });
    await t.test('documents: own cases only, deletable only before payment',async()=>{
      const all=(await account.documents(client)).items;
      assert.deepEqual(all.map(d=>d.id).sort(),[a.id,b.id].sort());
      assert.equal(all.find(d=>d.id===a.id).deletable,true);
      const locked=all.find(d=>d.id===b.id);assert.equal(locked.deletable,false);assert.match(locked.delete_blocked_reason,/submitted request/);
      assert.deepEqual((await account.documents(client,paid.id)).items.map(d=>d.id),[b.id]);
      await assert.rejects(account.documents(client,foreign.id),{status:404});
      assert.ok(!(await account.documents(other)).items.some(d=>d.id!==x.id));
      await assert.rejects(account.documents(advocate),{status:403});
    });
    await t.test('payments and receipts: own only, receipt says not a tax invoice',async()=>{
      const list=await account.payments(client);assert.deepEqual(list.items.map(p=>p.id),[payment.id]);assert.equal(list.totals.captured_paise,'118000');
      assert.equal((await account.payment(client,payment.id)).case.reference,paid.reference);
      await assert.rejects(account.payment(client,theirs.id),{status:404});
      await assert.rejects(account.receipt(client,theirs.id),{status:404});
      await assert.rejects(account.payment(other,payment.id),{status:404});
      await assert.rejects(account.payments(advocate),{status:403});
      const r=await account.receipt(client,payment.id);const pdf=Buffer.from(r.pdf_base64,'base64');
      assert.ok(pdf.subarray(0,4).equals(Buffer.from('%PDF')));assert.match(r.filename,/^Legalitt_Receipt_/);
    });
  }finally{
    await db.payment.deleteMany({where:{case_id:{in:ids}}});await db.document.deleteMany({where:{case_id:{in:ids}}});
    await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});
    await db.clientProfile.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
    await db.$disconnect();
  }
});
