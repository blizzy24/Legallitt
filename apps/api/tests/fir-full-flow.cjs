// docs/flows/FIR-DRAFT-FLOW.md end to end, as changed by Ishaan sir's answers of
// 12 Nov 2026 (Q114, Q119, Q120): advocate reject → admin reassigns, admin return,
// client Request Changes (sections + attachment), client approval completes the case
// and credits the advocate, no identity document anywhere, no police step (old routes
// gone), the migration that completes police-pending cases, support requests tagged
// with the service, and isolation on every remaining endpoint.
const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseStateMachine}=require('../dist/src/cases/case-state-machine'),{CaseRepository}=require('../dist/src/cases/case-repository');
const {FirService}=require('../dist/src/cases/fir.service'),{FirAdminService}=require('../dist/src/cases/fir-admin.service'),{FirFlowService}=require('../dist/src/cases/fir-flow.service');
const {FIR_EVENT_LABELS}=require('../dist/src/cases/fir-event-labels');
const {DocumentService}=require('../dist/src/documents/document.service'),{stagingKey}=require('../dist/src/documents/document-storage');
const {PaymentsService}=require('../dist/src/payments/payments.service'),{seedConfirmedPricing}=require('../dist/prisma/seed-pricing');
const {InAppNotifications}=require('../dist/src/notifications/in-app-notifications'),{SimulatedNotifications}=require('../dist/src/notifications/simulated-notifications');
const {SupportService}=require('../dist/src/support/support.service'),{WalletService}=require('../dist/src/wallet/wallet.service'),{AdvocateCompletionService}=require('../dist/src/completion/advocate-completion');
const {firStage,adminBucketFor,firDateInFuture,firIntakeErrors,ApiClient}=require('@legalitt/shared'),fixture=require('./helpers/fir.cjs');
const {readPdfText}=require('./helpers/pdf-text.cjs');
const MIGRATION=path.join(__dirname,'..','prisma','migrations','202611130010_fir_police_step_removed','migration.sql');

test('C10 mapping gives client, advocate and admin one state for every FIR status',()=>{
  const cases=[['paid',null,2,null],['assigned',null,2,'Review Request'],['advocate_accepted',null,2,'Review Documents'],['in_progress',null,3,'Continue Draft'],
    ['in_progress','awaiting_admin_approval',3,'View Status'],['changes_requested','advocate_revision_required',3,'Continue Draft'],['client_review',null,4,'View Status'],
    ['changes_requested','client_changes_requested',3,'Continue Draft'],['approved','awaiting_police_submission',5,'View'],['completed',null,5,'View'],
    // Q114: older identity-return sub-statuses block nothing; the advocate continues the draft.
    ['changes_requested','identity_replacement_required',3,'Continue Draft'],['changes_requested','identity_review_pending',3,'Continue Draft'],['changes_requested','multiple_corrections_required',3,'Continue Draft']];
  for(const [status,sub,stage,action]of cases){const v=firStage({status,sub_status:sub});assert.equal(v.client.stage,stage,status);assert.equal(v.advocate.action,action,status);assert.ok(v.admin.label);
    assert.equal(/police|Mark Submitted|identity/i.test(JSON.stringify(v)),false,`${status}/${sub}: no police step and no identity`);}
  // Q119, Q120: 'approved' is no longer produced; any such case reads exactly as completed.
  assert.deepEqual(firStage({status:'approved',sub_status:'awaiting_police_submission'}),firStage({status:'completed'}));
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
  const HIDDEN=['fir_admin_returned','fir_identity_reviewed','fir_advocate_reassigned','fir_draft_saved','fir_draft_submitted','fir_draft_approved','fir_advocate_rejected','fir_client_reminded','fir_client_viewed'];
  const pay=new PaymentsService(prisma,state,{capture:async()=>({paymentId:randomUUID(),simulated:true,source:'simulated'})},inbox);
  const before={};for(const model of ['servicePricing','commissionRate','feePolicy','pageOveragePolicy'])before[model]=await db[model].findMany({select:{id:true}});
  const upload=async(actor,id,kind,extra={})=>{const ticket=await docs.presign(actor,{case_id:id,kind,filename:'TEST file.pdf',mime:'application/pdf',...extra});objects.set(stagingKey(ticket.document.s3_key),Buffer.from('TEST synthetic file'));return docs.complete(actor,ticket.document.id);};
  const token=async id=>{const v=await review.read(admin,id);return {revision:v.revision,submission_id:v.current_submission_id};};
  const draftAndSend=async(actor,id)=>{const evidence=await db.document.findFirst({where:{case_id:id,kind:'fir_primary',status:'uploaded'}}),context=await fir.context(actor,id),content=fixture.editable(context.intake);
    content.attachment_ids=[evidence.id];const draft=await fir.save(actor,id,{base_draft_id:context.latest_draft_id,filing_hash:context.filing_hash,content});await fir.send(actor,id,draft.id);return draft;};
  // Q114: approval needs no identity check.
  const adminApprove=async(id,draftId)=>fir.approve(admin,id,draftId,await token(id));
  // Q114: intake, one primary document, submission and payment; no identity document.
  const paidCase=async()=>{const c=await state.create(client,{service_code:'fir_draft'});ids.push(c.id);await fir.intake(client,c.id,fixture.intake());
    await fixture.primary(db,c.id,client.id);
    await state.submitForPayment(client,c.id);const q=await pay.quote(client,{case_id:c.id});await pay.intent(client,{case_id:c.id,purpose:'service_fee',quote_id:q.id},randomUUID());return c;};
  try{
    await db.user.createMany({data:users});await db.advocateProfile.createMany({data:[first,advocate,stranger].map(u=>({user_id:u.id,verification:'approved',city:'Indore'}))});await seedConfirmedPricing(db);
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

    await t.test('Q114: no identity document is collected; the paid case has none and new ones are refused',async()=>{
      assert.equal(await db.document.count({where:{case_id:c.id,kind:'id_proof'}}),0);
      await assert.rejects(docs.presign(client,{case_id:elsewhere.id,kind:'id_proof',filename:'x.pdf',mime:'application/pdf'}),e=>e.status===400&&/aren’t collected for FIR Draft/.test(e.message));
      await assert.rejects(docs.presign(client,{case_id:elsewhere.id,kind:'id_proof',filename:'x.pdf',mime:'application/pdf',identity_last4:'4812',identity:{document_type:'passport',masked_copy:false}}),{status:400});
      await assert.rejects(docs.presign(client,{case_id:c.id,kind:'id_proof',filename:'x.pdf',mime:'application/pdf'}),{status:400});
    });
    await t.test('advocate rejects with a reason; the case returns to admin, who assigns another advocate',async()=>{
      await state.assign(admin,c.id,{advocate_id:first.id});
      // A2: before accepting, the advocate never receives the client's mobile or email unmasked.
      const MOBILE='2025550100',EMAIL='fir-test@example.invalid',leaks=v=>{const s=json(v);return s.includes(MOBILE)||s.includes(EMAIL);};
      const masked=await flow.view(first,c.id);assert.equal(masked.client.mobile,null);assert.equal(masked.client.email,'fi••••@example.invalid');assert.equal(leaks(masked),false,'flow view');
      assert.equal(leaks(await repo.read(first,c.id)),false,'case detail');assert.equal(leaks((await repo.list(first,{})).items.find(i=>i.id===c.id)),false,'case list');
      assert.equal(leaks(await repo.events(first,c.id,{})),false,'case events');await assert.rejects(fir.context(first,c.id),{status:409},'drafting context opens after acceptance');
      assert.ok(leaks(await flow.view(admin,c.id)),'admin still sees the contact');
      await assert.rejects(state.decline(first,c.id,{}),{status:409});
      await assert.rejects(flow.advocateReject(first,c.id,{reason:' '}),{status:400});
      await assert.rejects(flow.advocateReject(stranger,c.id,{reason:'TEST'}),{status:404});
      await assert.rejects(flow.advocateReject(client,c.id,{reason:'TEST'}),{status:403});
      await flow.advocateReject(first,c.id,{reason:'TEST conflict of interest'});
      const row=await db.case.findUnique({where:{id:c.id}});assert.equal(row.status,'advocate_declined');assert.equal(row.advocate_id,null);
      await assert.rejects(flow.view(first,c.id),{status:404});
      const adminView=await flow.view(admin,c.id);assert.ok(adminView.events.some(e=>e.label.includes('TEST conflict of interest')));assert.equal(adminView.stage.admin.label,'Advocate rejected · reassign');
      assert.equal((await flow.view(client,c.id)).events.some(e=>e.label.includes('conflict')),false);
      await state.assign(admin,c.id,{advocate_id:advocate.id});assert.equal((await flow.view(advocate,c.id)).client.mobile,null);
      await state.transition(advocate,c.id,'advocate_accepted');
      // Round 2: phone remains private after acceptance; email follows the existing rule.
      const accepted=await flow.view(advocate,c.id);assert.equal(accepted.client.mobile,null);assert.equal(accepted.client.email,'fir-test@example.invalid');
      assert.doesNotMatch(json(await repo.read(advocate,c.id)),/2025550100/);
      assert.equal((await flow.view(client,c.id)).stage.client.note,'Drafting team assigned');
      assert.equal(json(await flow.view(advocate,c.id)).includes('TEST conflict of interest'),false,'the next advocate never sees why the first left');
      assert.equal(json(await repo.read(advocate,c.id)).includes('TEST conflict of interest'),false);assert.equal(json(await repo.events(advocate,c.id,{})).includes('TEST conflict of interest'),false);
      await assert.rejects(repo.read(first,c.id),{status:404});
      const rows=await db.caseAssignment.findMany({where:{case_id:c.id},orderBy:{assigned_at:'asc'}});assert.equal(rows.length,2);assert.equal(rows[0].end_reason,'advocate_rejected');
      assert.equal(rows[1].assigned_by,admin.id);assert.ok(rows[1].assigned_at>=rows[0].ended_at,'the new assignment is recorded now, not back-dated');
    });
    await t.test('admin returns, advocate fixes and resends, admin approves → sent to client',async()=>{
      // The police receipt is dormant: nobody can upload one, not even while drafting.
      await assert.rejects(docs.presign(advocate,{case_id:c.id,kind:'fir_police_receipt',filename:'x.pdf',mime:'application/pdf'}),{status:409});
      draft=await draftAndSend(advocate,c.id);
      const life=await review.read(admin,c.id);assert.equal(life.submissions.find(s=>s.id===life.current_submission_id).identity_document_id,null);
      await review.reject(admin,c.id,{...await token(c.id),draft_reason:'TEST add the BNS section'});
      assert.equal((await flow.view(advocate,c.id)).reviews.at(-1).comment,'TEST add the BNS section');
      assert.equal((await flow.view(client,c.id)).reviews.length,0,'client never sees the admin step');
      draft=await draftAndSend(advocate,c.id);
      assert.equal((await repo.read(client,c.id)).drafts.length,0,'an unapproved version never reaches the client');assert.equal((await flow.view(client,c.id)).draft,null);
      await adminApprove(c.id,draft.id);assert.equal((await review.read(admin,c.id)).entitlement,null,'entitlement is reported once the case completes');
      const seen=[...(await repo.read(client,c.id)).events,...(await repo.events(client,c.id,{})).items];
      assert.equal(seen.some(e=>HIDDEN.includes(e.type)),false,'client never sees the admin step');assert.ok(seen.every(e=>Object.keys(e.payload).length===0));
      assert.deepEqual((await repo.read(client,c.id)).drafts.map(d=>d.id),[draft.id]);
      const v=await flow.view(client,c.id);assert.equal(v.status,'client_review');
      // Q114: the PDF has no identity row; flow A5: incident type as its label.
      const pdfDoc=await db.document.findUniqueOrThrow({where:{id:v.draft.document.id}}),{text:pdfText}=await readPdfText(objects.get(pdfDoc.s3_key));
      for(const gone of ['Identity document','Official ID','Identity proof','XXXX-XXXX'])assert.equal(pdfText.includes(gone),false,'PDF has no '+gone);
      assert.ok(pdfText.includes('Attachment 1: TEST-primary-receipt.pdf'));
      assert.ok(pdfText.includes('FIR DRAFT — prepared for submission at'));assert.ok(pdfText.includes('Incident type: Theft'));assert.equal(v.stage.client.stage,4);assert.equal(v.draft.draft_id,draft.id);
      assert.ok((await docs.url(client,v.draft.document.id)).url);await assert.rejects(docs.url(other,v.draft.document.id),{status:404});
    });
    await t.test('A6 audit log: the client opening the draft PDF is logged once per version, for the team only',async()=>{
      const v=await flow.view(client,c.id);
      // Opened once above; twice more by the client and once by the advocate (who is not logged).
      await docs.url(client,v.draft.document.id);await docs.url(client,v.draft.document.id);await docs.url(advocate,v.draft.document.id);
      const viewed=(await flow.view(advocate,c.id)).events.filter(e=>e.type==='fir_client_viewed');
      assert.equal(viewed.length,1,'exactly one event however often the client opens the PDF');
      assert.equal(viewed[0].label,`Client viewed the draft (v${v.draft.version})`);assert.equal(viewed[0].actor,'client');
      assert.equal((await flow.view(admin,c.id)).events.filter(e=>e.type==='fir_client_viewed').length,1);
      const rows=await db.caseEvent.findMany({where:{case_id:c.id,type:'fir_client_viewed'}});
      assert.equal(rows.length,1);assert.deepEqual(rows[0].payload,{version:v.draft.version,draft_id:v.draft.draft_id});
      assert.ok((await repo.read(advocate,c.id)).events.some(e=>e.type==='fir_client_viewed'));
      assert.equal((await flow.view(client,c.id)).events.some(e=>e.type==='fir_client_viewed'),false,'the client timeline leaves it out');
      assert.equal((await repo.read(client,c.id)).events.some(e=>e.type==='fir_client_viewed'),false,'GET /cases/:id hides it from the client');
      assert.equal((await repo.events(client,c.id,{})).items.some(e=>e.type==='fir_client_viewed'),false);
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
      await adminApprove(c.id,draft.id);const sent=await flow.view(client,c.id);assert.equal(sent.draft.version,draft.version);
      await docs.url(client,sent.draft.document.id);
      const viewed=(await flow.view(advocate,c.id)).events.filter(e=>e.type==='fir_client_viewed').map(e=>e.label);
      assert.equal(viewed.length,2,'a new version gets its own "client viewed" event');assert.equal(viewed[1],`Client viewed the draft (v${draft.version})`);
    });
    await t.test('Q119, Q120: client approval completes the case and the advocate’s wallet shows the share',async()=>{
      await assert.rejects(flow.clientApprove(other,c.id,{draft_id:draft.id}),{status:404});await assert.rejects(flow.clientApprove(advocate,c.id,{draft_id:draft.id}),{status:403});
      const done=await flow.clientApprove(client,c.id,{draft_id:draft.id});
      assert.equal(done.status,'completed');assert.equal(done.sub_status,null);assert.ok(done.completed_at);assert.equal('police' in done,false);assert.deepEqual(Object.keys(done.settings),['turnaround']);
      assert.equal(done.stage.client.done,true);assert.equal(done.stage.client.label,'Draft Ready');
      const forAdvocate=await flow.view(advocate,c.id);assert.equal(forAdvocate.stage.advocate.chip,'Completed');assert.equal(forAdvocate.stage.advocate.action,'View');
      assert.equal((await flow.view(admin,c.id)).stage.admin.label,'Completed');
      assert.equal((await flow.view(client,c.id)).events.at(-1).label,'You approved the draft');
      await assert.rejects(flow.clientApprove(client,c.id,{draft_id:draft.id}),{status:409},'approving twice changes nothing');
      // The advocate is told the case is complete; nobody is asked to submit to the police.
      const told=await db.notification.findFirst({where:{user_id:advocate.id,case_id:c.id,kind:'fir_client_approved'}});assert.equal(told.body,`${c.reference} is complete.`);
      assert.equal(await db.notification.count({where:{case_id:c.id,OR:[{kind:'fir_police_submitted'},{body:{contains:'police'}}]}}),0);
      assert.deepEqual((await completion.completion(advocate,c.id)).documents.map(d=>d.label),['Approved FIR draft']);
      const share=(await flow.view(admin,c.id)).share_paise;assert.ok(share);assert.equal(done.share_paise,null,'the client never sees the advocate share');
      assert.equal((await review.read(admin,c.id)).entitlement.amount_paise,share,'credited to the completing advocate on client approval');
      const card=(await repo.list(advocate,{})).items.find(i=>i.id===c.id).fir_card;assert.equal(card.share_paise,share,'A1 card fee comes with the list');assert.equal(card.note,'Client approved');
      assert.equal((await repo.list(client,{})).items.find(i=>i.id===c.id).fir_card,undefined,'the client list carries no advocate share');
      const entries=await wallet.wallet(advocate,{period:'all'}),entry=entries.entries.find(e=>e.case_id===c.id);
      assert.ok(entry,'completed FIR appears in the advocate wallet');assert.equal(entry.share_paise,share);
      assert.equal((await wallet.wallet(first,{period:'all'})).entries.some(e=>e.case_id===c.id),false,'the advocate who rejected is not paid');
      // Completed: no upload of any kind, including the dormant police receipt.
      await assert.rejects(docs.presign(advocate,{case_id:c.id,kind:'fir_police_receipt',filename:'x.pdf',mime:'application/pdf'}),{status:409});
    });
    await t.test('the police step is gone: old routes return 404, settings is read-only, an old recorded receipt stays hidden from the client',async()=>{
      assert.equal(typeof flow.policeSubmitted,'undefined');assert.equal(typeof flow.updateSettings,'undefined');
      assert.deepEqual(Object.keys(await flow.settings()),['turnaround']);
      require('reflect-metadata');
      const {NestFactory}=require('@nestjs/core'),{AppModule}=require('../dist/src/app.module'),{PrismaService}=require('../dist/src/prisma.service'),{AuthService}=require('../dist/src/auth/auth.service');
      const app=await NestFactory.create(AppModule,{logger:false});
      try{
        app.get(PrismaService).getClient=async()=>db;app.get(AuthService).identity=async token=>users.find(u=>u.id===token);
        await app.listen(0,'127.0.0.1');
        const as=actor=>new ApiClient({baseUrl:`http://127.0.0.1:${app.getHttpServer().address().port}`,getTokens:async()=>({idToken:actor.id,accessToken:'test',expiresIn:3600})});
        // C2 "Why FIR" reads the promised turnaround before any case exists; it carries no police field.
        for(const actor of [client,advocate,admin]){const s=await as(actor).firSettings();assert.deepEqual(Object.keys(s),['turnaround'],actor.role);assert.ok(s.turnaround.min_hours>0&&s.turnaround.max_hours>=s.turnaround.min_hours);}
        for(const actor of [admin,advocate,client])await assert.rejects(as(actor).request('/fir/settings',{police_submission_by_advocate:false},'PATCH'),{status:404},'the police switch is gone');
        for(const actor of [advocate,client,admin])await assert.rejects(as(actor).request(`/fir/${c.id}/police-submission`,{submitted_on:'2026-11-01',receipt_document_id:randomUUID()}),{status:404},'Mark Submitted is gone');
        assert.equal(typeof as(client).updateFirSettings,'undefined');assert.equal(typeof as(client).firPoliceSubmission,'undefined');
        // The remaining endpoints keep their isolation over HTTP.
        assert.equal((await as(client).firFlow(c.id)).status,'completed');
        for(const actor of [other,stranger,first])await assert.rejects(as(actor).firFlow(c.id),{status:404},actor.full_name);
        await assert.rejects(as(other).firClientApprove(c.id,draft.id),{status:404});await assert.rejects(as(stranger).firRemindClient(c.id),{status:404});
      }finally{await app.close();}
      // A receipt recorded before the step was removed is kept (dormant tables) but never shown to the client or listed as a completion document.
      const receipt=await db.document.create({data:{case_id:c.id,owner_id:advocate.id,kind:'fir_police_receipt',filename:'TEST-old-receipt.pdf',mime_type:'application/pdf',size_bytes:100n,page_count:1,status:'uploaded',s3_key:randomUUID()}});
      await db.firPoliceSubmission.create({data:{case_id:c.id,submitted_on:new Date('2026-11-11T00:00:00Z'),receipt_document_id:receipt.id,marked_by:advocate.id}});
      await db.caseEvent.create({data:{case_id:c.id,type:'fir_police_submitted',actor_id:advocate.id,actor_role:'advocate',from_status:'approved',to_status:'completed',payload:{submitted_on:'2026-11-11',receipt_document_id:receipt.id}}});
      assert.equal((await repo.read(client,c.id)).documents.some(d=>d.id===receipt.id),false);await assert.rejects(docs.url(client,receipt.id),{status:404});
      assert.deepEqual((await completion.completion(advocate,c.id)).documents.map(d=>d.label),['Approved FIR draft']);
      assert.equal('police' in await flow.view(client,c.id),false);
    });
    await t.test('migration 202611130010 completes FIR cases left waiting for a police receipt, with one event each',async()=>{
      const sql=fs.readFileSync(MIGRATION,'utf8'),seed=async(service_code,status,sub_status,extra={})=>{const id=randomUUID();ids.push(id);
        await db.case.create({data:{id,service_code,client_id:client.id,advocate_id:advocate.id,reference:'TEST-MIGRATION-'+id.slice(0,8),status,sub_status,details:{},updated_at:new Date('2026-01-01T00:00:00Z'),...extra}});return id;};
      const waiting=await seed('fir_draft','approved','awaiting_police_submission'),kept=new Date('2026-01-01T05:00:00Z'),waitingDone=await seed('fir_draft','approved','awaiting_police_submission',{completed_at:kept});
      const reviewing=await seed('fir_draft','client_review',null),notice=await seed('legal_notice','approved','awaiting_police_submission');
      const ROLLBACK='TEST rollback of the migration check';let checked=false;
      await db.$transaction(async tx=>{
        await tx.$executeRawUnsafe(sql);
        const rows=await tx.case.findMany({where:{id:{in:[waiting,waitingDone,reviewing,notice]}}}),row=id=>rows.find(r=>r.id===id);
        for(const id of [waiting,waitingDone]){assert.equal(row(id).status,'completed');assert.equal(row(id).sub_status,null);assert.ok(row(id).completed_at);assert.ok(row(id).updated_at>new Date('2026-01-01T00:00:00Z'));}
        assert.equal(row(waitingDone).completed_at.toISOString(),kept.toISOString(),'an existing completion time is kept');
        assert.equal(row(reviewing).status,'client_review');assert.equal(row(notice).status,'approved','only FIR cases move');
        const events=await tx.caseEvent.findMany({where:{case_id:{in:[waiting,waitingDone,reviewing,notice]}}});
        assert.equal(events.length,2);
        for(const id of [waiting,waitingDone]){const e=events.find(x=>x.case_id===id);assert.equal(e.type,'fir_completed_on_client_approval');assert.equal(e.actor_id,null);assert.equal(e.actor_role,null);
          assert.equal(e.from_status,'approved');assert.equal(e.to_status,'completed');assert.deepEqual(e.payload,{reason:'police submission step removed (Q119, Q120)'});}
        checked=true;throw new Error(ROLLBACK);
      },{timeout:20_000}).catch(e=>{if(e?.message!==ROLLBACK)throw e;});
      assert.ok(checked);assert.equal((await db.case.findUnique({where:{id:waiting}})).status,'approved','the check ran in a rolled-back transaction');
      assert.equal(FIR_EVENT_LABELS.fir_completed_on_client_approval,'Completed on client approval');
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
