const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {WalletService}=require('../dist/src/wallet/wallet.service');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');

test('Wallet: snapshot entitlements, masked bank account, payout requests, admin-only UTR, isolation (D-36, D-37, D-42)',
 {skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
  const users=['client','advocate','advocate','admin'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST WALLET '+role}));
  const [client,advocate,other,admin]=users,cases=[];
  const wallet=new WalletService(prisma,new InAppNotifications(new SimulatedNotifications()));
  const caseWith=async(status,entitlement)=>{
    const pricing=await db.servicePricing.findFirstOrThrow({where:{service_code:'legal_notice'}});
    const c=await db.case.create({data:{reference:'TEST-W-'+randomUUID().slice(0,8),service_code:'legal_notice',client_id:client.id,advocate_id:advocate.id,status,completed_at:status==='completed'?new Date():null}});
    cases.push(c.id);
    const breakdown={service_fee_paise:'99900',platform_fee_paise:'24975',delivery_fee_paise:'17900',taxable_subtotal_paise:'124875',gst_paise:'22478',page_overage_paise:'0',page_overage_gst_paise:'0',total_pages:0,included_pages:25,charged_pages:0,page_unit_paise:'2500',total_paise:'165253',advocate_entitlement_paise:entitlement,platform_revenue_paise:'24975'};
    const q=await db.casePriceQuote.create({data:{case_id:c.id,pricing_id:pricing.id,document_fingerprint:'x',snapshot:{breakdown}}});
    await db.payment.create({data:{case_id:c.id,payer_id:client.id,purpose:'service_fee',quote_id:q.id,base_amount_paise:142775n,gst_paise:22478n,total_paise:165253n,status:'captured',idempotency_key:randomUUID(),simulated:true,captured_at:new Date()}});
    return c;
  };
  try{
    await db.user.createMany({data:users});
    await caseWith('completed','117800');
    // D-82: a consultation's court-representation payment carries its own entitlement.
    const rc=await caseWith('completed','117800');
    const rb={service_fee_paise:'40000',platform_fee_paise:'10000',delivery_fee_paise:'0',taxable_subtotal_paise:'50000',gst_paise:'9000',page_overage_paise:'0',page_overage_gst_paise:'0',total_pages:0,included_pages:0,charged_pages:0,page_unit_paise:'0',total_paise:'59000',advocate_entitlement_paise:'40000',platform_revenue_paise:'10000'};
    const rq=await db.casePriceQuote.create({data:{case_id:rc.id,purpose:'representation',document_fingerprint:'x',snapshot:{breakdown:rb}}});
    await db.payment.create({data:{case_id:rc.id,payer_id:client.id,purpose:'representation',quote_id:rq.id,base_amount_paise:50000n,gst_paise:9000n,total_paise:59000n,status:'captured',idempotency_key:randomUUID(),simulated:true,captured_at:new Date()}});
    await caseWith('in_progress','117800');await caseWith('refunded','117800');await caseWith('completed',null);
    await t.test('entitlements come only from completed cases with a recorded snapshot',async()=>{
      const w=await wallet.wallet(advocate,{period:'all'});
      assert.equal(w.earned_paise,'275600');assert.equal(w.ready_paise,'275600');assert.equal(w.entries.length,2);
      const plain=w.entries.find(e=>e.case_id!==rc.id),both=w.entries.find(e=>e.case_id===rc.id);
      assert.equal(plain.client_paid_paise,'165253');assert.equal(plain.platform_fee_paise,'24975');
      assert.equal(both.share_paise,'157800');assert.equal(both.client_paid_paise,'224253');
      assert.equal((await wallet.wallet(other,{})).earned_paise,'0');
    });
    await t.test('roles and isolation',async()=>{
      await assert.rejects(wallet.wallet(client,{}),{status:403});await assert.rejects(wallet.wallet(admin,{}),{status:403});
      await assert.rejects(wallet.adminList(advocate,{}),{status:403});await assert.rejects(wallet.adminList(client,{}),{status:403});
    });
    await t.test('bank account is stored for payment but always returned masked and unverified',async()=>{
      await assert.rejects(wallet.requestPayout(advocate,{amount_paise:'100000'}),{status:409});
      await assert.rejects(wallet.saveBank(advocate,{holder_name:'TEST',bank_name:'TEST Bank',ifsc:'bad',account_number:'123456789012'}),{status:400});
      const saved=await wallet.saveBank(advocate,{holder_name:'TEST Holder',bank_name:'TEST Bank',ifsc:'sbin0001234',account_number:'123456789012',account_type:'savings'});
      assert.equal(saved.bank.account_last4,'9012');assert.equal(saved.bank.verified,false);assert.equal(JSON.stringify(saved).includes('123456789012'),false);
      assert.equal((await wallet.bank(other)).bank,null);
    });
    let request;
    await t.test('payout requests: minimum, balance, concurrency',async()=>{
      await assert.rejects(wallet.requestPayout(advocate,{amount_paise:'99999'}),{status:400});
      await assert.rejects(wallet.requestPayout(advocate,{amount_paise:'275601'}),{status:409});
      const race=await Promise.allSettled([wallet.requestPayout(advocate,{amount_paise:'200000'}),wallet.requestPayout(advocate,{amount_paise:'200000'})]);
      assert.equal(race.filter(r=>r.status==='fulfilled').length,1);
      request=race.find(r=>r.status==='fulfilled').value;
      const w=await wallet.wallet(advocate,{});assert.equal(w.ready_paise,'75600');assert.equal(w.requested_paise,'200000');
      assert.equal(JSON.stringify(w).includes('123456789012'),false);
      await assert.rejects(wallet.payoutRequest(other,request.id),{status:404});
    });
    await t.test('only an admin records the UTR; the admin sees full bank details',async()=>{
      const list=await wallet.adminList(admin,{});const row=list.items.find(i=>i.id===request.id);
      assert.equal(row.bank.account_number,'123456789012');assert.equal(row.status,'pending');
      await assert.rejects(wallet.markPaid(advocate,request.id,{utr:'UTR123456'}),{status:403});
      await assert.rejects(wallet.markPaid(admin,request.id,{utr:'x'}),{status:400});
      const paid=await wallet.markPaid(admin,request.id,{utr:'UTR123456',paid_on:'2026-11-11'});assert.equal(paid.status,'paid');
      assert.equal((await wallet.markPaid(admin,request.id,{utr:'UTR123456'})).utr,'UTR123456');
      await assert.rejects(wallet.markPaid(admin,request.id,{utr:'OTHER12345'}),{status:409});
      const w=await wallet.wallet(advocate,{period:'all'});assert.equal(w.paid_paise,'200000');assert.equal(w.requests[0].utr,'UTR123456');
      assert.ok(await db.adminAction.findFirst({where:{subject_id:request.id,action:'record_payout_paid'}}));
    });
  }finally{
    await db.payoutRequest.deleteMany({where:{advocate_id:{in:users.map(u=>u.id)}}});
    await db.advocateBankAccount.deleteMany({where:{advocate_id:{in:users.map(u=>u.id)}}});
    await db.adminAction.deleteMany({where:{admin_id:admin.id}});
    await db.payment.deleteMany({where:{case_id:{in:cases}}});await db.casePriceQuote.deleteMany({where:{case_id:{in:cases}}});
    await db.case.deleteMany({where:{id:{in:cases}}});
    await db.notification.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});
    await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});await db.$disconnect();
  }
});
