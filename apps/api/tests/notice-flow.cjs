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
    try {
      for (const a of actors)
        await db.user.create({
          data: {
            ...a,
            cognito_sub: "notice-test-" + a.id,
            full_name: "Test identity",
          },
        });
      await db.advocateProfile.create({data:{user_id:advocate.id,verification:"approved"}});
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
      const {SimulatedNotifications} = require('../dist/src/notifications/simulated-notifications');
      const payments = new PaymentsService(prisma, state, new SimulatedPayments(), inbox());
      await assert.rejects(payments.intent(other, {case_id: c.id, purpose: 'service_fee'}, randomUUID()), {status: 404});
      const key = randomUUID();
      const payment = await payments.intent(client, {case_id: c.id, purpose: 'service_fee'}, key);
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
      const declinedCase = await db.case.create({data: {reference:'TEST-DECLINE-'+randomUUID(), service_code:'legal_notice', client_id:client.id, advocate_id:advocate.id, status:'assigned'}});
      ids.push(declinedCase.id);
      await state.decline(advocate, declinedCase.id, {});
      const declineEvent = await db.caseEvent.findFirst({where:{case_id:declinedCase.id,to_status:'advocate_declined'}});
      assert.equal(declineEvent.payload.reason, null);
      assert.equal(declineEvent.actor_id, advocate.id);
      assert.equal(declineEvent.actor_role, 'advocate');
      // Beginning drafting is the advocate's own action; repeating it is harmless.
      await assert.rejects(state.startDrafting(client, c.id), {status: 403});
      await assert.rejects(state.startDrafting(otherAdvocate, c.id), {status: 404});
      assert.equal((await state.startDrafting(advocate, c.id)).status, 'in_progress');
      assert.equal((await state.startDrafting(advocate, c.id)).status, 'in_progress');
      const draft1 = await state.saveNoticeDraft(advocate, c.id, {
        kind: "legal_notice",
        content,
        generated_by: "manual",
      });
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
        { comment: "Test revision request" },
      );
      const draft2 = await state.saveNoticeDraft(advocate, c.id, {
        kind: "legal_notice",
        content: { ...content, facts: "Revised test facts" },
        generated_by: "manual",
      });
      assert.equal(draft2.version, 2);
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
      await state.reviewNoticeDraft(client, c.id, draft2.id, "approved", {});
      await assert.rejects(payments.intent(client, {case_id: c.id, purpose: 'courier'}, randomUUID()), {status: 403});
      const courierKey = randomUUID();
      const [courier1, courier2] = await Promise.all([1,2].map(() => payments.intent(advocate, {case_id: c.id, purpose: 'courier'}, courierKey)));
      assert.equal(courier1.id, courier2.id);
      assert.equal(courier1.payer_id, advocate.id);
      assert.equal(courier1.total_paise, 29500n);
      assert.equal((await repo.read(client, c.id)).status, 'approved');
      const simulatedEvents = await db.caseEvent.findMany({where: {case_id: c.id, source: 'simulated'}});
      assert.deepEqual(simulatedEvents.map(e => e.type).sort(), ['courier_payment_captured','payment_captured','subject_generated']);
      assert.equal(await db.notification.count({where: {case_id: c.id, simulated: true}}), 0);
      await assert.rejects(
        state.saveNoticeDraft(advocate, c.id, {
          kind: "legal_notice",
          content,
          generated_by: "manual",
        }),
        { status: 409 },
      );
      await assert.rejects(shipmentService.save(otherAdvocate, c.id, {carrier: 'Forbidden'}), {status: 404});
      await assert.rejects(state.dispatch(admin, c.id, {}), {status: 403});
      await assert.rejects(state.dispatch(advocate, c.id, {}), {status: 400});
      const saved = await shipmentService.save(advocate, c.id, {carrier: 'Test carrier'});
      assert.equal(saved.status, 'draft');
      assert.equal((await repo.read(client, c.id)).status, 'approved');
      assert.equal((await repo.read(advocate, c.id)).shipments.find(s=>s.direction==='to_recipient').carrier, 'Test carrier');
      await assert.rejects(shipmentService.save(advocate, c.id, {}, true), {status: 400});
      await assert.rejects(shipmentService.save(advocate, c.id, {receipt_document_id: randomUUID()}), {status: 400});
      const completeShipment = await shipmentService.save(advocate, c.id, {
        waybill: 'Test waybill', dispatch_date: '2020-01-02', courier_office: 'Test office',
        courier_phone: '2025550101', tracking_url: 'https://example.invalid/typed-exactly?q=1', expected_delivery: '2030-12-31',
      }, true);
      assert.equal(completeShipment.id, saved.id);
      assert.equal(completeShipment.status, 'booked');
      assert.equal(completeShipment.booked_at.getTime(), saved.booked_at.getTime());
      assert.equal(completeShipment.dispatch_date.toISOString().slice(0,10), '2020-01-02');
      assert.equal(completeShipment.expected_delivery.toISOString().slice(0,10), '2030-12-31');
      assert.equal(completeShipment.tracking_url, 'https://example.invalid/typed-exactly?q=1');
      assert.equal(completeShipment.pod_document_id, null);
      assert.equal(completeShipment.dispatched_at, null);
      assert.equal((await repo.read(client, c.id)).status, 'approved');
      await state.dispatch(advocate, c.id, {});
      const dispatched = await db.shipment.findUnique({where: {id: saved.id}});
      assert.ok(dispatched.dispatched_at);
      assert.equal(dispatched.status, 'dispatched');
      // Courier milestones (design 440): admin only, one step at a time, case unchanged.
      await assert.rejects(shipmentService.advance(advocate, c.id, {status: 'pickup_booked'}), {status: 403});
      await assert.rejects(shipmentService.advance(admin, c.id, {status: 'picked_up'}), {status: 409});
      await assert.rejects(shipmentService.advance(admin, c.id, {status: 'delivered'}), {status: 400});
      assert.equal((await shipmentService.advance(admin, c.id, {status: 'pickup_booked'})).status, 'pickup_booked');
      assert.equal((await shipmentService.advance(admin, c.id, {status: 'picked_up'})).status, 'picked_up');
      await assert.rejects(shipmentService.advance(admin, c.id, {status: 'picked_up'}), {status: 409});
      const milestone = await db.caseEvent.findFirst({where: {case_id: c.id, type: 'shipment_status_changed'}, orderBy: {id: 'desc'}});
      assert.deepEqual([milestone.payload.from, milestone.payload.to, milestone.from_status, milestone.to_status], ['pickup_booked', 'picked_up', 'dispatched', 'dispatched']);
      assert.equal(await db.adminAction.count({where: {subject_id: c.id, action: 'shipment_status'}}), 2);
      await assert.rejects(shipmentService.save(advocate, c.id, {carrier: 'Changed'}), {status: 409});
      await assert.rejects(
        state.deliver(advocate, c.id, { pod_document_id: randomUUID() }),
        { status: 403 },
      );
      await assert.rejects(
        state.deliver(admin, c.id, { pod_document_id: randomUUID() }),
        { status: 400 },
      );
      assert.equal((await repo.read(client, c.id)).status, "dispatched");
      const otherCase = await state.create(other, {
        service_code: "legal_notice",
      });
      ids.push(otherCase.id);
      const proof = await db.document.create({
        data: {
          case_id: otherCase.id,
          owner_id: admin.id,
          kind: "delivery_proof",
          filename: "test-proof.pdf",
          s3_key: "test-only",
          mime_type: "application/pdf",
          size_bytes: 10n,
          page_count: 1,
          status: "uploaded",
        },
      });
      await assert.rejects(
        state.deliver(admin, c.id, { pod_document_id: proof.id }),
        { status: 400 },
      );
      await db.document.update({
        where: { id: proof.id },
        data: { case_id: c.id, status: "pending" },
      });
      await assert.rejects(
        state.deliver(admin, c.id, { pod_document_id: proof.id }),
        { status: 400 },
      );
      await db.document.update({
        where: { id: proof.id },
        data: { status: "uploaded", simulated: true },
      });
      const automaticAdmin = {...admin, trigger: 'system', source: 'simulated'};
      await assert.rejects(state.deliver(automaticAdmin, c.id, {pod_document_id: randomUUID()}), {status: 400});
      await state.deliver(automaticAdmin, c.id, { pod_document_id: proof.id });
      const deliveredEvent = await db.caseEvent.findFirst({where: {case_id: c.id, to_status: 'completed'}});
      assert.equal(deliveredEvent.actor_id, null);
      assert.equal(deliveredEvent.actor_role, null);
      assert.equal(deliveredEvent.payload.actor, 'system');
      assert.equal(deliveredEvent.source, 'simulated');
      const complete = await repo.read(client, c.id);
      assert.equal(complete.status, "completed");
      assert.ok(complete.completed_at);
      assert.equal(complete.shipments.find(s=>s.direction==='to_recipient').pod_document_id, proof.id);
      const events = await db.caseEvent.findMany({
        where: { case_id: c.id },
        orderBy: { id: "asc" },
      });
      assert.deepEqual(
        events.filter(e => !['subject_generated','notification_created','courier_payment_captured','shipment_details_saved','shipment_booked','shipment_status_changed','documents_received'].includes(e.type)).map((e) =>
          e.type === "draft_saved" ? "draft_saved" : e.to_status,
        ),
        [
          "draft",
          "submitted",
          "payment_pending",
          "paid",
          "assigning",
          "assigned",
          "advocate_accepted",
          "in_progress",
          "draft_saved",
          "client_review",
          "changes_requested",
          "in_progress",
          "draft_saved",
          "client_review",
          "approved",
          "dispatching",
          "dispatched",
          "completed",
        ],
      );
      assert.equal(
        await db.draftReview.count({
          where: { draft_id: { in: [draft1.id, draft2.id] } },
        }),
        2,
      );
      assert.equal(await db.payment.count({ where: { case_id: c.id } }), 2);
      assert.equal(await db.ledgerEntry.count({ where: { case_id: c.id } }), 0);
      await assert.rejects(
        state.deliver(admin, c.id, { pod_document_id: proof.id }),
        { status: 409 },
      );
    } finally {
      if (oldEnv === undefined) delete process.env.ENVIRONMENT;
      else process.env.ENVIRONMENT = oldEnv;
      if (oldNode === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = oldNode;
      await db.shipment.deleteMany({ where: { case_id: { in: ids } } });
      await db.draftReview.deleteMany({
        where: { draft_id_relation: { case_id: { in: ids } } },
      });
      await db.draft.deleteMany({ where: { case_id: { in: ids } } });
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
      await db.$disconnect();
    }
  },
);
