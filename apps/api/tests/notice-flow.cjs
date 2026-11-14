const inbox = () => new (require('../dist/src/notifications/in-app-notifications').InAppNotifications)(new (require('../dist/src/notifications/simulated-notifications').SimulatedNotifications)());
const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { PrismaClient } = require("../dist/src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { CaseStateMachine } = require("../dist/src/cases/case-state-machine");
const { CaseRepository } = require("../dist/src/cases/case-repository");
const content = {
  sender: "Test sender",
  recipient: "Test recipient",
  subject: "Test subject",
  facts: "Test facts",
  demand: "Test demand",
  closing: "Test closing",
};
const details = {
  client: {
    fullName: "Test client",
    mobile: "2025550101",
    address: "Test address",
  },
  noticee: {
    fullName: "Test noticee",
    mobile: "2025550102",
    email: "noticee@example.invalid",
    address: "Test address",
  },
  issueType: "property-dispute",
};
test(
  "Legal Notice full lifecycle, draft privacy/versioning, role boundaries and delivery proof",
  { skip: !process.env.LEGALITT_TEST_DATABASE_URL },
  async () => {
    const db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.LEGALITT_TEST_DATABASE_URL,
      }),
    });
    const prisma = { getClient: async () => db };
    const {ShipmentService} = require('../dist/src/cases/shipment.service');
    const shipmentService = new ShipmentService(prisma, {simulated:true}, inbox());
    const state = new CaseStateMachine(prisma, inbox()),
      repo = new CaseRepository(prisma);
    const [client, other, advocate, otherAdvocate, admin] = [
      "client",
      "client",
      "advocate",
      "advocate",
      "admin",
    ].map((role) => ({ id: randomUUID(), role }));
    const actors = [client, other, advocate, otherAdvocate, admin];
    const ids = [];
    const oldEnv = process.env.ENVIRONMENT,
      oldNode = process.env.NODE_ENV;
    const serviceBefore=await db.service.findUniqueOrThrow({where:{code:'legal_notice'}});
    try {
      // This journey exercises the current no-Offences workflow. Older local
      // databases can retain an explicitly configured historical closing policy;
      // install this test's policy and restore it rather than relying on seed age.
      await db.service.update({where:{code:'legal_notice'},data:{config:{...serviceBefore.config,notice_policy:{...serviceBefore.config.notice_policy,criminal_clause:'omit'}}}});
      for (const a of actors)
        await db.user.create({
          data: {
            ...a,
            cognito_sub: "notice-test-" + a.id,
            full_name: "Test identity",
          },
        });
      await db.advocateProfile.create({data:{user_id:advocate.id,verification:"approved",city:"Indore"}});
      const c = await state.create(client, {
        service_code: "legal_notice",
        tier: "ordinary",
        details,
      });
      ids.push(c.id);
      await state.updateDraft(client,c.id,{subject_matter:'Test dispute',legal_demand:{selected:['Test demand'],custom:''}});
      await state.recordIntakeAi(client,c.id,{matter_type:'property_dispute',subject_matter:'Test dispute'},
        {task:'subject',text:'Test subject',simulated:true});
      assert.equal(
        (await state.submitForPayment(client, c.id)).status,
        "payment_pending",
      );
      const {PaymentsService} = require('../dist/src/payments/payments.service');
      const {SimulatedPayments} = require('../dist/src/payments/simulated-payments');
      const payments = new PaymentsService(prisma, state, new SimulatedPayments(), inbox());
      await assert.rejects(payments.intent(other, {case_id: c.id, purpose: 'service_fee'}, randomUUID()), {status: 404});
      const key = randomUUID();
      const quote=await payments.quote(client,{case_id:c.id});assert.equal(quote.status,'ready');
      const payment = await payments.intent(client, {case_id: c.id, purpose: 'service_fee',quote_id:quote.id}, key);
      assert.equal(payment.simulated, true);
      assert.equal(payment.payer_id, client.id);
      assert.equal((await payments.intent(client, {case_id: c.id, purpose: 'service_fee'}, key)).id, payment.id);
      await assert.rejects(
        state.assign(client, c.id, { advocate_id: advocate.id }),
        { status: 403 },
      );
      await state.assign(admin, c.id, { advocate_id: advocate.id });
      await assert.rejects(
        state.transition(otherAdvocate, c.id, "advocate_accepted"),
        { status: 404 },
      );
      await state.transition(advocate, c.id, "advocate_accepted");
      await assert.rejects(
        state.saveNoticeDraft(client, c.id, {
          kind: "legal_notice",
          content,
          generated_by: "manual",
        }),
        { status: 403 },
      );
      await assert.rejects(
        state.saveNoticeDraft(advocate, c.id, {
          kind: "legal_notice",
          content,
          generated_by: "ai",
        }),
        { status: 400 },
      );
      // Receipt is the inbound recipient's evidence, not an outbound admin POD.
      const inbound = await db.shipment.create({data:{case_id:c.id,direction:'to_advocate',status:'dispatched',booked_at:new Date()}});
      const beforeReceipt = (await repo.read(advocate,c.id)).status;
      await assert.rejects(shipmentService.receive(client,c.id), {status:403});
      const receipt = await shipmentService.receive(advocate,c.id);
      assert.equal(receipt.status,'delivered');
      assert.ok(receipt.delivered_at);
      assert.equal(receipt.pod_document_id,null);
      assert.equal((await repo.read(advocate,c.id)).status,beforeReceipt);
      const receiptEvent = await db.caseEvent.findFirst({where:{case_id:c.id,type:'documents_received'}});
      assert.equal(receiptEvent.actor_id,advocate.id);
      assert.equal(receiptEvent.payload.confirmation_source,'advocate');
      assert.equal(receiptEvent.payload.shipment_id,inbound.id);
      await shipmentService.receive(advocate,c.id);
      assert.equal(await db.caseEvent.count({where:{case_id:c.id,type:'documents_received'}}),1);
      const receiptNotifications = await db.notification.findMany({where:{case_id:c.id,kind:'documents_received'}});
      assert.equal(receiptNotifications.length,1);
      assert.equal(receiptNotifications[0].user_id,advocate.id);
      assert.equal(receiptNotifications[0].simulated,false);
      const declinedCase = await db.case.create({data: {reference:'TEST-DECLINE-'+randomUUID(), service_code:'legal_notice', client_id:client.id, advocate_id:advocate.id, status:'assigned'}});
      ids.push(declinedCase.id);
      await assert.rejects(state.decline(advocate,declinedCase.id,{}),{status:400});
      await state.decline(advocate,declinedCase.id,{reason:'TEST unavailability'});
      const declineEvent = await db.caseEvent.findFirst({where:{case_id:declinedCase.id,to_status:'advocate_declined'}});
      assert.equal(declineEvent.payload.reason,'TEST unavailability');
      assert.equal(declineEvent.actor_id, advocate.id);
      assert.equal(declineEvent.actor_role, 'advocate');
      // Beginning drafting is the advocate's own action; repeating it is harmless.
      await assert.rejects(state.startDrafting(client, c.id), {status: 403});
      await assert.rejects(state.startDrafting(otherAdvocate, c.id), {status: 404});
      assert.equal((await state.startDrafting(advocate, c.id)).status, 'in_progress');
      assert.equal((await state.startDrafting(advocate, c.id)).status, 'in_progress');
      for (const days of [0,-1,1.5,'15']) await assert.rejects(state.saveNoticeDraft(advocate,c.id,{
        kind:'legal_notice',content,generated_by:'manual',compliance_period_days:days}), {status:400});
      assert.equal((await repo.read(advocate,c.id)).compliance_period_days,null);
      const draft1 = await state.saveNoticeDraft(advocate, c.id, {
        kind: "legal_notice",
        content,
        generated_by: "manual",
      });
      assert.equal(draft1.compliance_period_days,15);
      assert.equal(draft1.closing_policy.criminal_clause,'omit');
      assert.equal((await repo.read(advocate,c.id)).compliance_period_days,15);
      const periodEvent=await db.caseEvent.findFirst({where:{case_id:c.id,type:'draft_saved'}});
      assert.equal(periodEvent.payload.compliance_period_days,15);
      assert.equal(periodEvent.payload.previous_compliance_period_days,null);
      assert.equal((await repo.read(client, c.id)).drafts.length, 0);
      await assert.rejects(state.sendNoticeDraft(admin, c.id, draft1.id), {
        status: 403,
      });
      await state.sendNoticeDraft(advocate, c.id, draft1.id);
      assert.equal((await repo.read(client, c.id)).drafts[0].id, draft1.id);
      await assert.rejects(
        state.reviewNoticeDraft(other, c.id, draft1.id, "approved", {}),
        { status: 404 },
      );
      await state.reviewNoticeDraft(
        client,
        c.id,
        draft1.id,
        "changes_requested",
        { comment: "Test revision request",sections:["facts"] },
      );
      const draft2 = await state.saveNoticeDraft(advocate, c.id, {
        kind: "legal_notice",
        content: { ...content, facts: "Revised test facts" },
        base_version:draft1.version,
        compliance_period_days: 7,
        generated_by: "manual",
      });
      assert.equal(draft2.version, 2);
      assert.equal(draft2.compliance_period_days,7);
      assert.equal((await repo.read(advocate,c.id)).compliance_period_days,7);
      assert.equal((await db.draft.findUnique({where:{id:draft1.id}})).compliance_period_days,15);
      assert.equal((await repo.read(client,c.id)).drafts.at(-1).compliance_period_days,15);
      assert.deepEqual(
        (await repo.read(client, c.id)).drafts.map((d) => d.id),
        [draft1.id],
      );
      await assert.rejects(state.sendNoticeDraft(advocate, c.id, draft1.id), {
        status: 409,
      });
      await state.sendNoticeDraft(advocate, c.id, draft2.id);
      await assert.rejects(
        state.reviewNoticeDraft(client, c.id, draft1.id, "approved", {}),
        { status: 409 },
      );
      const final=await db.document.create({data:{case_id:c.id,owner_id:advocate.id,kind:'legal_notice',filename:'test-final.pdf',s3_key:'test-only-final',mime_type:'application/pdf',size_bytes:4n,status:'uploaded',page_count:1}});
      await db.draft.update({where:{id:draft2.id},data:{document_id:final.id}});
      await state.reviewNoticeDraft(client,c.id,draft2.id,'approved',{}, {noticeDocumentId:final.id,approvedAt:new Date()});
      await assert.rejects(payments.intent(advocate,{case_id:c.id,purpose:'courier'},randomUUID()),{status:409});
      await assert.rejects(state.dispatch(advocate,c.id,{}),{status:409});
      await assert.rejects(shipmentService.save(advocate,c.id,{carrier:'Retired route'}),{status:409});
      const {NoticeFlowService}=require('../dist/src/cases/notice-flow.service'),flow=new NoticeFlowService(prisma,{}, {},inbox());
      const {NoticeSigning}=require('../dist/src/cases/notice-signing');
      const signing=new NoticeSigning(prisma,{}, {signed:async()=>final,discard:async()=>{}},inbox());
      let view=await flow.view(admin,c.id);
      const signature=await signing.sign(advocate,c.id,{revision:view.revision,draft_id:draft2.id,mode:'test',confirmed:true});view=await flow.view(admin,c.id);
      await signing.submit(advocate,c.id,{revision:view.revision,draft_id:draft2.id,signature_id:signature.signature_id});view=await flow.view(admin,c.id);
      // Legacy clients need not repay or re-enter the entire filing. A missing
      // postal PIN is corrected through the scoped delivery-contact task.
      await flow.requestTask(admin,c.id,{revision:view.revision,kind:'contact',method:'courier',reason:'Please add the postal PIN'});view=await flow.view(client,c.id);
      await flow.replyTask(client,c.id,{revision:view.revision,task_id:view.tasks[0].id,contact:{address:'Test address',pin:'452001'}});view=await flow.view(admin,c.id);
      await flow.resolveTask(admin,c.id,{revision:view.revision,task_id:view.tasks[0].id,confirmed:true});view=await flow.view(admin,c.id);
      await flow.check(admin,c.id,'address',{revision:view.revision,confirmed:true});view=await flow.view(admin,c.id);
      await flow.check(admin,c.id,'notice',{revision:view.revision,confirmed:true});view=await flow.view(admin,c.id);
      assert.equal(view.sub_status,'notice_admin_ready_for_dispatch');
      await flow.dispatch(admin,c.id,{revision:view.revision,method:'courier',carrier:'Test carrier',waybill:'Test waybill',dispatch_date:'2026-11-12'});view=await flow.view(admin,c.id);
      const proof=await db.document.create({data:{case_id:c.id,owner_id:admin.id,kind:'notice_delivery_proof',filename:'test-proof.pdf',s3_key:'test-proof',mime_type:'application/pdf',size_bytes:4n,status:'uploaded',page_count:1}});
      await flow.result(admin,c.id,{revision:view.revision,attempt_id:view.attempts[0].id,result:'delivered',occurred_at:new Date().toISOString(),proof_document_id:proof.id,received_by:'Test recipient'});
      assert.equal((await repo.read(client,c.id)).status,'completed');
      assert.equal(await db.payment.count({where:{case_id:c.id}}),1,'legacy captured service payment retained; no advocate courier charge');
      assert.equal(await db.draftReview.count({where:{draft_id:{in:[draft1.id,draft2.id]}}}),2);
    } finally {
      if (oldEnv === undefined) delete process.env.ENVIRONMENT;
      else process.env.ENVIRONMENT = oldEnv;
      if (oldNode === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = oldNode;
      await db.noticeSignature.deleteMany({where:{case_id:{in:ids}}});
      await db.noticeDeliveryEvent.deleteMany({where:{delivery:{case_id:{in:ids}}}});
      await db.noticeDelivery.deleteMany({where:{case_id:{in:ids}}});
      await db.noticeLifecycle.deleteMany({where:{case_id:{in:ids}}});
      await db.shipment.deleteMany({ where: { case_id: { in: ids } } });
      await db.draftReview.deleteMany({
        where: { draft_id_relation: { case_id: { in: ids } } },
      });
      await db.draft.deleteMany({ where: { case_id: { in: ids } } });
      await db.case.updateMany({where:{id:{in:ids}},data:{notice_document_id:null}});
      await db.document.deleteMany({ where: { case_id: { in: ids } } });
      await db.notification.deleteMany({where: {case_id: {in: ids}}});
      await db.payment.deleteMany({where: {case_id: {in: ids}}});
      await db.caseEvent.deleteMany({ where: { case_id: { in: ids } } });
      await db.adminAction.deleteMany({ where: { admin_id: admin.id } });
      await db.case.deleteMany({ where: { id: { in: ids } } });
      await db.advocateProfile.deleteMany({where:{user_id:advocate.id}});
      await db.user.deleteMany({
        where: { id: { in: actors.map((a) => a.id) } },
      });
      await db.service.update({where:{code:'legal_notice'},data:{config:serviceBefore.config}});
      await db.$disconnect();
    }
  },
);
