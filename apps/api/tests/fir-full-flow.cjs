// docs/flows/FIR-DRAFT-FLOW.md end to end: advocate reject → admin reassigns,
// admin return, client Request Changes (sections + attachment), client approval,
// police submission with receipt, wallet share, the police setting off, support
// requests tagged with the service, and isolation on every new endpoint.
const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine'),{CaseRepository}=require('../dist/src/cases/case-repository');
const {FirService}=require('../dist/src/cases/fir.service'),{FirAdminService}=require('../dist/src/cases/fir-admin.service'),{FirFlowService}=require('../dist/src/cases/fir-flow.service');
const {DocumentService}=require('../dist/src/documents/document.service'),{stagingKey}=require('../dist/src/documents/document-storage');
const {PaymentsService}=require('../dist/src/payments/payments.service'),{seedConfirmedPricing}=require('../dist/prisma/seed-pricing');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications'),{SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');
const {SupportService}=require('../dist/src/support/support.service'),{WalletService}=require('../dist/src/wallet/wallet.service'),{AdvocateCompletionService}=require('../dist/src/completion/advocate-completion');
const {firStage,adminBucketFor,firDateInFuture,firIntakeErrors}=require('@legalitt/shared'),fixture=require('./helpers/fir.cjs');

test('C10 mapping gives client, advocate and admin one state for every FIR status',()=>{
  const cases=[['paid',null,2,null],['assigned',null,2,'Review Request'],['advocate_accepted',null,2,'Review Documents'],['in_progress',null,3,'Continue Draft'],
    ['in_progress','awaiting_admin_approval',3,'View Status'],['changes_requested','advocate_revision_required',3,'Continue Draft'],['client_review',null,4,'View Status'],
    ['changes_requested','client_changes_requested',3,'Continue Draft'],['approved','awaiting_police_submission',5,'Mark Submitted'],['completed',null,5,'View']];
  for(const [status,sub,stage,action]of cases){const v=firStage({status,sub_status:sub});assert.equal(v.client.stage,stage,status);assert.equal(v.advocate.action,action,status);assert.ok(v.admin.label);}
  assert.equal(firStage({status:'changes_requested',sub_status:'client_changes_requested'}).client.note,'Advocate is updating your draft');
  assert.equal(firStage({status:'assigned',sub_status:null}).client.stage,2);assert.equal(firStage({status:'assigned',sub_status:'advocate_revision_required'}).client.stage,3,'a reassigned case never moves the client backwards');
  assert.equal(firStage({status:'advocate_accepted',sub_status:'client_changes_requested'}).client.note,'Advocate is updating your draft');
  assert.equal(firStage({status:'client_review'}).client.decision_due,true);assert.equal(firStage({status:'completed'}).client.done,true);
  assert.equal(adminBucketFor('changes_requested','fir_draft','client_changes_requested'),'in_progress');assert.equal(adminBucketFor('client_review','fir_draft',null),'pending');
});
test('intake: place of incident, future dates and at least one accused',()=>{
  const v=fixture.intake();assert.deepEqual(firIntakeErrors(v),{});
  assert.ok(firIntakeErrors({...v,place:undefined}).placeAddress);assert.ok(firIntakeErrors({...v,place:{...v.place,pin:'12'}}).placePin);
  assert.equal(firDateInFuture('2099-01-01'),true);assert.equal(firDateInFuture('01/01/2020'),false);assert.ok(firIntakeErrors({...v,incident:{...v.incident,date:'2099-01-01'}}).date);
  assert.ok(firIntakeErrors({...v,people:v.people.filter(p=>p.kind!=='accused')}).accused);
});

test('FIR full flow',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async t=>{
  const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
  const users=['client','advocate','advocate','admin','client','advocate'].map(role=>({id:randomUUID(),role,cognito_sub:randomUUID(),full_name:'TEST full flow '+role})),[client,first,advocate,admin,other,stranger]=users;
  const objects=new Map(),originalFetch=global.fetch,ids=[];
  const storage={upload:async key=>({url:'https://fir-flow.invalid',fields:{key:stagingKey(key)}}),head:async key=>objects.has(key)?{size:objects.get(key).length,mime:'application/pdf'}:null,read:async key=>objects.get(key),promote:async key=>objects.set(key,objects.get(stagingKey(key))),remove:async key=>objects.delete(key),discard:async()=>{},download:async key=>'https://fir-flow.invalid/'+key};
  global.fetch=async(url,options)=>url==='https://fir-flow.invalid'?(objects.set(options.body.get('key'),new Uint8Array(await options.body.get('file').arrayBuffer())),new Response(null,{status:204})):originalFetch(url,options);
  const inbox=new InAppNotifications(new SimulatedNotifications()),state=new CaseStateMachine(prisma,inbox),docs=new DocumentService(prisma,storage,{inspect:async()=>({mime:'application/pdf',pageCount:1})});
  const fir=new FirService(prisma,docs,inbox),review=new FirAdminService(prisma,docs,inbox),flow=new FirFlowService(prisma,inbox),repo=new CaseRepository(prisma),support=new SupportService(prisma,inbox),wallet=new WalletService(prisma,inbox),completion=new AdvocateCompletionService(prisma);
  const json=value=>JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v);
  const HIDDEN=['fir_admin_returned','fir_identity_reviewed','fir_advocate_reassigned','fir_draft_saved','fir_draft_submitted','fir_draft_approved','fir_advocate_rejected','fir_client_reminded'];
  const pay=new PaymentsService(prisma,state,{capture:async()=>({paymentId:randomUUID(),simulated:true,source:'simulated'})},inbox);
  const before={};for(const model of ['servicePricing','commissionRate','feePolicy','pageOveragePolicy'])before[model]=await db[model].findMany({select:{id:true}});
  const settingsBefore=await db.firSettings.findUnique({where:{id:1}});
  const upload=async(actor,id,kind,extra={})=>{const ticket=await docs.presign(actor,{case_id:id,kind,filename:'TEST file.pdf',mime:'application/pdf',...extra});objects.set(stagingKey(ticket.document.s3_key),Buffer.from('TEST synthetic file'));return docs.complete(actor,ticket.document.id);};
  const token=async id=>{const v=await review.read(admin,id);return {revision:v.revision,submission_id:v.current_submission_id};};
  const draftAndSend=async(actor,id)=>{const identity=await db.document.findFirst({where:{case_id:id,kind:'id_proof',status:'uploaded'}}),context=await fir.context(actor,id),content=fixture.editable(context.intake);
    content.identity_document_id=identity.id;content.attachment_ids=[identity.id];const draft=await fir.save(actor,id,{base_draft_id:context.latest_draft_id,filing_hash:context.filing_hash,content});await fir.send(actor,id,draft.id);return draft;};
  const adminApprove=async(id,draftId)=>{const life=await review.read(admin,id),sub=life.submissions.find(s=>s.id===life.current_submission_id);
    if(!sub.identity_checked_at)await review.identityReview(admin,id,{...await token(id),document_id:sub.identity_document_id,decision:'accepted'});return fir.approve(admin,id,draftId,await token(id));};
  const paidCase=async()=>{const c=await state.create(client,{service_code:'fir_draft'});ids.push(c.id);await fir.intake(client,c.id,fixture.intake());
    await upload(client,c.id,'id_proof',{identity_last4:'4812',identity:{document_type:'passport',masked_copy:false}});await fixture.primary(db,c.id,client.id);
    await state.submitForPayment(client,c.id);const q=await pay.quote(client,{case_id:c.id});await pay.intent(client,{case_id:c.id,purpose:'service_fee',quote_id:q.id},randomUUID());return c;};
  try{
    await db.user.createMany({data:users});await db.advocateProfile.createMany({data:[first,advocate,stranger].map(u=>({user_id:u.id,verification:'approved',city:'Indore'}))});await seedConfirmedPricing(db);
    await db.firSettings.upsert({where:{id:1},create:{id:1,police_submission_by_advocate:true},update:{police_submission_by_advocate:true}});
    const c=await paidCase();let draft,changed;
    const elsewhere=await state.create(client,{service_code:'fir_draft'});ids.push(elsewhere.id);
    const strayDoc=(owner,kind)=>db.document.create({data:{case_id:elsewhere.id,owner_id:owner.id,kind,filename:'TEST-other-case.pdf',mime_type:'application/pdf',size_bytes:100n,page_count:1,status:'uploaded',s3_key:randomUUID()}});

    await t.test('upload slots: file types, sizes and counts are enforced on the server',async()=>{
      await assert.rejects(docs.presign(client,{case_id:elsewhere.id,kind:'fir_primary',filename:'x.mp4',mime:'video/mp4'}),{status:400});
      await assert.rejects(docs.presign(client,{case_id:elsewhere.id,kind:'fir_scene',filename:'x.pdf',mime:'application/pdf'}),{status:400});
      await assert.rejects(docs.presign(client,{case_id:elsewhere.id,kind:'supporting_document',filename:'x.mp4',mime:'video/mp4'}),{status:400});
      assert.equal((await docs.presign(client,{case_id:elsewhere.id,kind:'fir_scene',filename:'clip.mp4',mime:'video/mp4'})).upload.max_bytes,50_000_000);
      assert.equal((await docs.presign(client,{case_id:elsewhere.id,kind:'fir_scene',filename:'photo.png',mime:'image/png'})).upload.max_bytes,50_000_000);
      assert.equal((await docs.presign(client,{case_id:elsewhere.id,kind:'fir_primary',filename:'a.pdf',mime:'application/pdf'})).upload.max_bytes,25_000_000);
      assert.equal((await docs.presign(client,{case_id:elsewhere.id,kind:'fir_other',filename:'call.mp3',mime:'audio/mpeg'})).upload.max_bytes,25_000_000);
      await db.document.createMany({data:Array.from({length:5},()=>({case_id:elsewhere.id,owner_id:client.id,kind:'fir_scene',filename:'TEST-scene.png',mime_type:'image/png',size_bytes:100n,status:'uploaded',s3_key:randomUUID()}))});
      await assert.rejects(docs.presign(client,{case_id:elsewhere.id,kind:'fir_scene',filename:'x.png',mime:'image/png'}),{status:400},'Scene Photos & Video holds five files');
      await assert.rejects(docs.presign(client,{case_id:elsewhere.id,kind:'fir_custom',filename:'x.pdf',mime:'application/pdf'}),{status:400});
      assert.equal((await docs.presign(client,{case_id:elsewhere.id,kind:'fir_custom',filename:'x.pdf',mime:'application/pdf',slot_label:'Medical bills'})).document.slot_label,'Medical bills');
    });

    await t.test('identity upload stores only the last four digits, shown masked',async()=>{
      const id=await db.document.findFirst({where:{case_id:c.id,kind:'id_proof'}});assert.equal(id.identity_last4,'4812');
      await assert.rejects(docs.presign(client,{case_id:c.id,kind:'id_proof',filename:'x.pdf',mime:'application/pdf',identity:{document_type:'passport',masked_copy:false}}),e=>[400,409].includes(e.status));
    });
    await t.test('advocate rejects with a reason; the case returns to admin, who assigns another advocate',async()=>{
      await state.assign(admin,c.id,{advocate_id:first.id});
      await assert.rejects(state.decline(first,c.id,{}),{status:409});
      await assert.rejects(flow.advocateReject(first,c.id,{reason:' '}),{status:400});
      await assert.rejects(flow.advocateReject(stranger,c.id,{reason:'TEST'}),{status:404});
      await assert.rejects(flow.advocateReject(client,c.id,{reason:'TEST'}),{status:403});
      await flow.advocateReject(first,c.id,{reason:'TEST conflict of interest'});
      const row=await db.case.findUnique({where:{id:c.id}});assert.equal(row.status,'advocate_declined');assert.equal(row.advocate_id,null);
      await assert.rejects(flow.view(first,c.id),{status:404});
      const adminView=await flow.view(admin,c.id);assert.ok(adminView.events.some(e=>e.label.includes('TEST conflict of interest')));assert.equal(adminView.stage.admin.label,'Advocate rejected · reassign');
      assert.equal((await flow.view(client,c.id)).events.some(e=>e.label.includes('conflict')),false);
      await state.assign(admin,c.id,{advocate_id:advocate.id});await state.transition(advocate,c.id,'advocate_accepted');
      assert.equal((await flow.view(client,c.id)).stage.client.note,'Drafting team assigned');
      assert.equal(json(await flow.view(advocate,c.id)).includes('TEST conflict of interest'),false,'the next advocate never sees why the first left');
      assert.equal(json(await repo.read(advocate,c.id)).includes('TEST conflict of interest'),false);assert.equal(json(await repo.events(advocate,c.id,{})).includes('TEST conflict of interest'),false);
      await assert.rejects(repo.read(first,c.id),{status:404});
      const rows=await db.caseAssignment.findMany({where:{case_id:c.id},orderBy:{assigned_at:'asc'}});assert.equal(rows.length,2);assert.equal(rows[0].end_reason,'advocate_rejected');
      assert.equal(rows[1].assigned_by,admin.id);assert.ok(rows[1].assigned_at>=rows[0].ended_at,'the new assignment is recorded now, not back-dated');
    });
    await t.test('admin returns, advocate fixes and resends, admin approves → sent to client',async()=>{
      draft=await draftAndSend(advocate,c.id);
      const life=await review.read(admin,c.id),sub=life.submissions.find(s=>s.id===life.current_submission_id);
      await review.identityReview(admin,c.id,{...await token(c.id),document_id:sub.identity_document_id,decision:'accepted'});
      await review.reject(admin,c.id,{...await token(c.id),draft_reason:'TEST add the BNS section'});
      assert.equal((await flow.view(advocate,c.id)).reviews.at(-1).comment,'TEST add the BNS section');
      assert.equal((await flow.view(client,c.id)).reviews.length,0,'client never sees the admin step');
      draft=await draftAndSend(advocate,c.id);
      assert.equal((await repo.read(client,c.id)).drafts.length,0,'an unapproved version never reaches the client');assert.equal((await flow.view(client,c.id)).draft,null);
      await adminApprove(c.id,draft.id);assert.equal((await review.read(admin,c.id)).entitlement,null,'entitlement is reported once the case completes');
      const seen=[...(await repo.read(client,c.id)).events,...(await repo.events(client,c.id,{})).items];
      assert.equal(seen.some(e=>HIDDEN.includes(e.type)),false,'client never sees the admin step');assert.ok(seen.every(e=>Object.keys(e.payload).length===0));
      assert.deepEqual((await repo.read(client,c.id)).drafts.map(d=>d.id),[draft.id]);
      const v=await flow.view(client,c.id);assert.equal(v.status,'client_review');assert.equal(v.stage.client.stage,4);assert.equal(v.draft.draft_id,draft.id);
      assert.ok((await docs.url(client,v.draft.document.id)).url);await assert.rejects(docs.url(other,v.draft.document.id),{status:404});
    });
    await t.test('remind client: once per 24 hours, advocate only',async()=>{
      await assert.rejects(flow.remindClient(client,c.id),{status:403});await assert.rejects(flow.remindClient(stranger,c.id),{status:404});
      const v=await flow.remindClient(advocate,c.id);assert.equal(v.remind.allowed,false);assert.ok(v.remind.next_at);
      await assert.rejects(flow.remindClient(advocate,c.id),{status:409});
      assert.ok(await db.notification.findFirst({where:{user_id:client.id,kind:'fir_review_reminder'}}));
    });
    await t.test('client requests changes with two sections and an attachment',async()=>{
      await assert.rejects(docs.presign(other,{case_id:c.id,kind:'fir_change_attachment',filename:'x.pdf',mime:'application/pdf'}),{status:404});
      const attachment=await upload(client,c.id,'fir_change_attachment');
      const body={draft_id:draft.id,sections:['complainant','date_time_place'],comment:'TEST correct my father’s name and the time',attachment_document_id:attachment.id};
      await assert.rejects(flow.clientChanges(other,c.id,body),{status:404});await assert.rejects(flow.clientChanges(advocate,c.id,body),{status:403});
      await assert.rejects(flow.clientChanges(client,c.id,{...body,attachment_document_id:(await strayDoc(client,'fir_change_attachment')).id}),{status:400},'an attachment from another case is refused');
      const evidence=await db.document.findFirst({where:{case_id:c.id,kind:'fir_primary'}});await assert.rejects(docs.delete(client,evidence.id),{status:409},'evidence is frozen once the admin approved');
      await assert.rejects(flow.clientChanges(client,c.id,{...body,sections:[]}),{status:400});await assert.rejects(flow.clientChanges(client,c.id,{...body,comment:'x'.repeat(601)}),{status:400});
      changed=await flow.clientChanges(client,c.id,body);
      assert.equal(changed.status,'changes_requested');assert.equal(changed.sub_status,'client_changes_requested');assert.equal(changed.stage.client.note,'Advocate is updating your draft');
      const adv=await flow.view(advocate,c.id),r=adv.reviews.at(-1);assert.equal(r.role,'client');assert.deepEqual(r.sections,['complainant','date_time_place']);assert.equal(r.attachment.id,attachment.id);
      assert.ok((await docs.url(advocate,attachment.id)).url);
      await assert.rejects(docs.delete(client,attachment.id),{status:409});
    });
    await t.test('advocate revises; the revision goes to admin again, then to the client',async()=>{
      draft=await draftAndSend(advocate,c.id);assert.equal((await flow.view(client,c.id)).stage.client.stage,3);
      assert.equal((await db.case.findUnique({where:{id:c.id}})).sub_status,'awaiting_admin_approval');
      await adminApprove(c.id,draft.id);assert.equal((await flow.view(client,c.id)).draft.version,draft.version);
    });
    await t.test('client approves; with the setting on, the advocate submits to police with a receipt',async()=>{
      await assert.rejects(flow.clientApprove(other,c.id,{draft_id:draft.id}),{status:404});await assert.rejects(flow.clientApprove(advocate,c.id,{draft_id:draft.id}),{status:403});
      const v=await flow.clientApprove(client,c.id,{draft_id:draft.id});assert.equal(v.status,'approved');assert.equal(v.sub_status,'awaiting_police_submission');
      assert.equal((await flow.view(advocate,c.id)).stage.advocate.action,'Mark Submitted');
      await assert.rejects(docs.presign(client,{case_id:c.id,kind:'fir_police_receipt',filename:'x.pdf',mime:'application/pdf'}),{status:409});
      await assert.rejects(docs.presign(stranger,{case_id:c.id,kind:'fir_police_receipt',filename:'x.pdf',mime:'application/pdf'}),{status:404});
      const receipt=await upload(advocate,c.id,'fir_police_receipt'),spare=await upload(advocate,c.id,'fir_police_receipt');
      await assert.rejects(docs.url(client,receipt.id),{status:404},'receipt is visible to the client only once recorded');
      const today=new Date(Date.now()+330*60000).toISOString().slice(0,10);
      await assert.rejects(flow.policeSubmitted(stranger,c.id,{submitted_on:today,receipt_document_id:receipt.id}),{status:404});
      await assert.rejects(flow.policeSubmitted(client,c.id,{submitted_on:today,receipt_document_id:receipt.id}),{status:403});
      await assert.rejects(flow.policeSubmitted(advocate,c.id,{submitted_on:'2099-01-01',receipt_document_id:receipt.id}),{status:400});
      await assert.rejects(flow.policeSubmitted(advocate,c.id,{submitted_on:today,receipt_document_id:(await strayDoc(advocate,'fir_police_receipt')).id}),{status:400},'a receipt from another case is refused');
      const done=await flow.policeSubmitted(advocate,c.id,{submitted_on:today,receipt_document_id:receipt.id});
      assert.equal(done.status,'completed');assert.equal(done.police.receipt.id,receipt.id);assert.ok((await docs.url(client,receipt.id)).url);
      assert.equal((await flow.view(client,c.id)).stage.client.done,true);
      const listed=(await repo.read(client,c.id)).documents.map(d=>d.id);assert.ok(listed.includes(receipt.id));assert.equal(listed.includes(spare.id),false,'only the recorded receipt is listed for the client');
      await assert.rejects(docs.url(client,spare.id),{status:404});
      assert.deepEqual((await completion.completion(advocate,c.id)).documents.map(d=>d.label).sort(),['Approved FIR draft','Police receipt']);
      assert.equal((await review.read(admin,c.id)).entitlement.amount_paise,done.share_paise);
      const entries=await wallet.wallet(advocate,{period:'all'}),entry=entries.entries.find(e=>e.case_id===c.id);
      assert.ok(entry,'completed FIR appears in the advocate wallet');assert.equal(entry.share_paise,done.share_paise);
      assert.equal((await wallet.wallet(first,{period:'all'})).entries.some(e=>e.case_id===c.id),false,'the advocate who rejected is not paid');
    });
    await t.test('setting off: client approval completes the case and the client submits to police',async()=>{
      await assert.rejects(flow.updateSettings(advocate,{police_submission_by_advocate:false}),{status:403});
      await assert.rejects(flow.updateSettings(client,{police_submission_by_advocate:false}),{status:403});
      assert.equal((await flow.updateSettings(admin,{police_submission_by_advocate:false})).police_submission_by_advocate,false);assert.equal((await flow.settings()).police_submission_by_advocate,false);
      const d=await paidCase();await state.assign(admin,d.id,{advocate_id:advocate.id});await state.transition(advocate,d.id,'advocate_accepted');
      const sent=await draftAndSend(advocate,d.id);await adminApprove(d.id,sent.id);
      const v=await flow.clientApprove(client,d.id,{draft_id:sent.id});assert.equal(v.status,'completed');
      assert.deepEqual((await completion.completion(advocate,d.id)).documents.map(x=>x.label),['Approved FIR draft']);assert.ok((await wallet.wallet(advocate,{period:'all'})).entries.some(e=>e.case_id===d.id));assert.equal(v.settings.police_submission_by_advocate,false);
      await assert.rejects(flow.policeSubmitted(advocate,d.id,{submitted_on:'2026-11-01',receipt_document_id:randomUUID()}),{status:409});
    });
    await t.test('view isolation: another client, an unassigned advocate and a former advocate get 404',async()=>{
      await assert.rejects(flow.view(other,c.id),{status:404});await assert.rejects(flow.view(stranger,c.id),{status:404});await assert.rejects(flow.view(first,c.id),{status:404});
      assert.equal((await flow.view(admin,c.id)).client.name,'TEST Complainant Rao');assert.equal((await flow.view(client,c.id)).client,null);
    });
    await t.test('Request Chat and Request Callback from FIR reach the admin inbox tagged FIR Draft',async()=>{
      const call=await support.requestCallback(client,{name:'TEST Client',phone:'+91 90000 00000',service_code:'fir_draft'});assert.equal(call.service_code,'fir_draft');
      const chat=await support.chat(client,{body:'TEST ONLY what documents do I need?',service_code:'fir_draft'});assert.equal(chat.service_code,'fir_draft');
      const list=await support.adminList(admin,{status:'open'});
      for(const id of [call.id,chat.id])assert.equal(list.items.find(i=>i.id===id).service_code,'fir_draft');
      await assert.rejects(support.adminList(client,{status:'open'}),{status:403});
      await db.supportMessage.deleteMany({where:{ticket_id:{in:[call.id,chat.id]}}});await db.supportTicket.deleteMany({where:{id:{in:[call.id,chat.id]}}});
    });
  }finally{
    global.fetch=originalFetch;
    await db.firSettings.update({where:{id:1},data:{police_submission_by_advocate:settingsBefore?.police_submission_by_advocate??true,updated_by:settingsBefore?.updated_by??null}});
    await db.firPoliceSubmission.deleteMany({where:{case_id:{in:ids}}});
    await db.notification.deleteMany({where:{OR:[{case_id:{in:ids}},{user_id:{in:users.map(u=>u.id)}}]}});await db.draftReview.deleteMany({where:{draft_id_relation:{case_id:{in:ids}}}});
    await db.firSubmission.deleteMany({where:{case_id:{in:ids}}});await db.firIdentityReturn.deleteMany({where:{case_id:{in:ids}}});await db.firLifecycle.deleteMany({where:{case_id:{in:ids}}});await db.caseAssignment.deleteMany({where:{case_id:{in:ids}}});
    await db.draft.deleteMany({where:{case_id:{in:ids}}});await db.payment.deleteMany({where:{case_id:{in:ids}}});await db.casePriceQuote.deleteMany({where:{case_id:{in:ids}}}).catch(()=>{});await db.caseEvent.deleteMany({where:{case_id:{in:ids}}});
    await db.adminAction.deleteMany({where:{admin_id:admin.id}});await db.document.deleteMany({where:{case_id:{in:ids}}});await db.caseParty.deleteMany({where:{case_id:{in:ids}}});await db.case.deleteMany({where:{id:{in:ids}}});
    await db.advocateProfile.deleteMany({where:{user_id:{in:users.map(u=>u.id)}}});await db.user.deleteMany({where:{id:{in:users.map(u=>u.id)}}});
    await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)},fee_policy_id:{not:null}}});await db.feePolicy.deleteMany({where:{id:{notIn:before.feePolicy.map(x=>x.id)}}});await db.servicePricing.deleteMany({where:{id:{notIn:before.servicePricing.map(x=>x.id)}}});await db.commissionRate.deleteMany({where:{id:{notIn:before.commissionRate.map(x=>x.id)}}});await db.pageOveragePolicy.deleteMany({where:{id:{notIn:before.pageOveragePolicy.map(x=>x.id)}}});
    await db.$disconnect();
  }
});
