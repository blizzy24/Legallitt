const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine'),{CaseRepository}=require('../dist/src/cases/case-repository');
const {FirService}=require('../dist/src/cases/fir.service'),{FirAdminService}=require('../dist/src/cases/fir-admin.service');
const {DocumentService}=require('../dist/src/documents/document.service'),{stagingKey}=require('../dist/src/documents/document-storage');
const {PaymentsService}=require('../dist/src/payments/payments.service'),{seedConfirmedPricing}=require('../dist/prisma/seed-pricing');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications'),{SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');
const {NotificationRepository}=require('../dist/src/notifications/notifications.controller');
const {firTurnaround,adminBucketFor}=require('@legalitt/shared'),fixture=require('./helpers/fir.cjs');
test('FIR turnaround warnings use captured payment and service-specific changes_requested buckets',()=>{
 const life={paid_at:'2026-11-01T00:00:00Z',warning_hours:24,overdue_hours:48};
 assert.equal(firTurnaround(life,Date.parse('2026-11-02T00:00:00Z')).level,'warning');assert.equal(firTurnaround(life,Date.parse('2026-11-03T00:00:00Z')).level,'overdue');
 assert.equal(adminBucketFor('changes_requested','legal_notice'),'pending');assert.equal(adminBucketFor('changes_requested','fir_draft','advocate_revision_required'),'in_progress');assert.equal(adminBucketFor('changes_requested','fir_draft','identity_review_pending'),'open');
});
test('FIR admin rejection: mixed returns, purge retry, replacement, two draft rejections, reassignment and exact approved beneficiary',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
 const users=['client','advocate','advocate','admin','client'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST admin rejection '+role})),[client,advocate,next,admin,other]=users;
 const objects=new Map(),removed=[],originalFetch=global.fetch;let failPurge=false,id;
 const storage={upload:async key=>({url:'https://fir-review.invalid',fields:{key:stagingKey(key)}}),head:async key=>objects.has(key)?{size:objects.get(key).length,mime:'application/pdf'}:null,read:async key=>objects.get(key),promote:async key=>objects.set(key,objects.get(stagingKey(key))),remove:async key=>{if(failPurge)throw Error('TEST storage outage');removed.push(key);objects.delete(key);},discard:async()=>{},download:async key=>'https://fir-review.invalid/'+key};
 global.fetch=async(url,options)=>url==='https://fir-review.invalid'?(objects.set(options.body.get('key'),new Uint8Array(await options.body.get('file').arrayBuffer())),new Response(null,{status:204})):originalFetch(url,options);
 const inbox=new InAppNotifications(new SimulatedNotifications()),state=new CaseStateMachine(prisma,inbox),docs=new DocumentService(prisma,storage,{inspect:async()=>({mime:'application/pdf',pageCount:1})}),fir=new FirService(prisma,docs,inbox),review=new FirAdminService(prisma,docs,inbox),repo=new CaseRepository(prisma),notifications=new NotificationRepository(prisma);
 const pay=new PaymentsService(prisma,state,{capture:async()=>({paymentId:randomUUID(),simulated:true,source:'simulated'})},inbox);
 const before={};for(const model of ['servicePricing','commissionRate','feePolicy','pageOveragePolicy'])before[model]=await db[model].findMany({select:{id:true}});
 const token=async()=>{const v=await review.read(admin,id);return {revision:v.revision,submission_id:v.current_submission_id};};
 const upload=async()=>{const ticket=await docs.presign(client,{case_id:id,kind:'id_proof',filename:'TEST identity.pdf',mime:'application/pdf',identity:{document_type:'passport',masked_copy:false}});objects.set(stagingKey(ticket.document.s3_key),Buffer.from('TEST synthetic structural fixture'));return docs.complete(client,ticket.document.id);};
 const save=async(actor,identity)=>{const context=await fir.context(actor,id),content=fixture.editable(context.intake);content.identity_document_id=identity.id;content.attachment_ids=[identity.id];return fir.save(actor,id,{base_draft_id:context.latest_draft_id,filing_hash:context.filing_hash,content});};
 try{
  await db.user.createMany({data:users});await db.advocateProfile.createMany({data:[advocate,next].map(u=>({user_id:u.id,verification:'approved',city:'Mumbai'}))});await seedConfirmedPricing(db);
  id=(await state.create(client,{service_code:'fir_draft'})).id;await fir.intake(client,id,fixture.intake());const firstIdentity=await upload();await state.submitForPayment(client,id);const quote=await pay.quote(client,{case_id:id});await pay.intent(client,{case_id:id,purpose:'service_fee',quote_id:quote.id},randomUUID());await state.assign(admin,id,{advocate_id:advocate.id});await state.transition(advocate,id,'advocate_accepted');
  const first=await save(advocate,firstIdentity);await fir.send(advocate,id,first.id);const originalToken=await token(),originalLife=await review.read(admin,id);
  await t.test('manual identity acceptance is required; one concurrent return wins and no client feedback leaks',async()=>{
   await assert.rejects(fir.approve(admin,id,first.id,originalToken),{status:409});await assert.rejects(review.reject(admin,id,{...originalToken,draft_reason:' '}),{status:400});
   failPurge=true;const input={...originalToken,draft_reason:'TEST clarify the incident chronology',identity_document_id:firstIdentity.id};
   const race=await Promise.allSettled([review.reject(admin,id,input),review.reject(admin,id,input)]);assert.equal(race.filter(r=>r.status==='fulfilled').length,1);assert.equal(race.find(r=>r.status==='rejected').reason.status,409);
   assert.equal((await review.read(admin,id)).rejection_count,1);assert.equal((await db.case.findUnique({where:{id}})).sub_status,'multiple_corrections_required');
   await assert.rejects(docs.url(client,firstIdentity.id),{status:404});assert.equal((await db.firIdentityReturn.findUnique({where:{document_id:firstIdentity.id}})).purge_status,'failed');
   const json=value=>JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v);
   const visible=json(await repo.read(client,id));assert.ok(!visible.includes('clarify the incident'));assert.ok(!json(await repo.events(client,id,{})).includes('clarify the incident'));
   await assert.rejects(review.reassign(admin,id,{...await token(),advocate_id:next.id}),{status:409});
  });
  let replacement;
  await t.test('replacement is limited to identity evidence; repeated ID rejection never increments the draft counter',async()=>{
   await assert.rejects(docs.presign(client,{case_id:id,kind:'supporting_document',filename:'test.pdf',mime:'application/pdf'}),{status:409});
   failPurge=false;await docs.purgeRejectedIdentity(firstIdentity.id);assert.ok(removed.includes(firstIdentity.s3_key));assert.ok(removed.includes(stagingKey(firstIdentity.s3_key)));
   await db.firIdentityReturn.update({where:{document_id:firstIdentity.id},data:{purge_after:new Date(0)}});await docs.purgeRejectedIdentity(firstIdentity.id);assert.equal((await db.firIdentityReturn.findUnique({where:{document_id:firstIdentity.id}})).purge_status,'complete');
   for(const decision of ['unmasked_aadhaar','accepted']){
    replacement=await upload();let life=await review.read(client,id);const request=life.identity_returns.find(r=>r.state==='replacement_required');await review.replaceIdentity(client,id,{revision:life.revision,return_id:request.id,document_id:replacement.id});
    await assert.rejects(review.identityReview(admin,id,{...originalToken,document_id:replacement.id,decision}),{status:409});
    await review.identityReview(admin,id,{...await token(),document_id:replacement.id,decision});
   }
   assert.equal((await review.read(admin,id)).rejection_count,1);
  });
  await t.test('second draft rejection enables reassignment; history and payment age survive; former advocate is notified',async()=>{
   const second=await save(advocate,replacement);await fir.send(advocate,id,second.id);await review.reject(admin,id,{...await token(),draft_reason:'TEST explain the applicable section'});
   const old=await token();await review.reassign(admin,id,{...old,advocate_id:next.id});const life=await review.read(admin,id);
   assert.equal(life.rejection_count,0);assert.equal(life.assignments.length,2);assert.equal(life.assignments[0].rejections,2);assert.ok(life.assignments[0].ended_at);assert.equal(life.paid_at,originalLife.paid_at);
   await assert.rejects(repo.read(advocate,id),{status:404});await assert.rejects(docs.url(advocate,replacement.id),{status:404});await assert.rejects(fir.approve(admin,id,second.id,old),{status:409});
   const inbox=await notifications.list(advocate,{}),notice=inbox.items.find(n=>n.kind==='fir_reassigned_away');assert.ok(notice);assert.equal(notice.case_id,null);await notifications.read(advocate,notice.id);
   const clientInbox=await notifications.list(client,{});assert.ok(clientInbox.items.some(n=>n.body==='We’ve assigned a new advocate to your case to make sure your draft meets our standards'));
   assert.ok((await review.read(next,id)).submissions.some(s=>s.draft_reason==='TEST explain the applicable section'));
  });
  await t.test('new advocate must create a new version; only that current reviewed package can complete and receive the full entitlement',async()=>{
   await state.transition(next,id,'advocate_accepted');await assert.rejects(fir.preview(next,id,first.id),{status:409});
   const finalDraft=await save(next,replacement);await fir.send(next,id,finalDraft.id);const pending=await review.read(admin,id),sub=pending.submissions.find(s=>s.id===pending.current_submission_id);
   await review.identityReview(admin,id,{...await token(),document_id:replacement.id,decision:'accepted'});const approvedToken=await token();await Promise.all([fir.approve(admin,id,finalDraft.id,approvedToken),fir.approve(admin,id,finalDraft.id,approvedToken)]);
   const done=await review.read(admin,id),clientCase=await repo.read(client,id);assert.equal(clientCase.status,'completed');assert.deepEqual(clientCase.drafts.map(d=>d.id),[finalDraft.id]);assert.equal(done.entitlement.amount_paise,quote.breakdown.advocate_entitlement_paise);assert.equal(done.entitlement.assignment_id,done.assignments[1].id);
   assert.equal(await db.firSubmission.count({where:{case_id:id,state:'approved'}}),1);assert.equal(await db.draftReview.count({where:{draft_id:finalDraft.id,decision:'approved'}}),1);
   assert.ok((await docs.url(client,sub.document_id)).url);await assert.rejects(docs.url(other,sub.document_id),{status:404});await assert.rejects(review.reject(admin,id,{...approvedToken,draft_reason:'Late return'}),{status:409});
  });
 }finally{global.fetch=originalFetch;if(id){await db.notification.deleteMany({where:{OR:[{case_id:id},{user_id:{in:users.map(u=>u.id)}}]}});await db.draftReview.deleteMany({where:{draft_id_relation:{case_id:id}}});await db.draft.deleteMany({where:{case_id:id}});await db.payment.deleteMany({where:{case_id:id}});await db.caseEvent.deleteMany({where:{case_id:id}});await db.adminAction.deleteMany({where:{subject_id:id}});await db.document.deleteMany({where:{case_id:id}});await db.caseParty.deleteMany({where:{case_id:id}});await db.case.delete({where:{id}});}await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)},fee_policy_id:{not:null}}});await db.feePolicy.deleteMany({where:{id:{notIn:before.feePolicy.map(x=>x.id)}}});await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)}}});await db.commissionRate.deleteMany({where:{id:{notIn:before.commissionRate.map(x=>x.id)}}});await db.pageOveragePolicy.deleteMany({where:{id:{notIn:before.pageOveragePolicy.map(x=>x.id)}}});await db.$disconnect();}
});
