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
    const state = new CaseStateMachine(prisma),
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
      const c = await state.create(client, {
        service_code: "legal_notice",
        tier: "ordinary",
        details,
      });
      ids.push(c.id);
      assert.equal(
        (await state.submitForPayment(client, c.id)).status,
        "payment_pending",
      );
      const {PaymentsService} = require('../dist/src/payments/payments.service');
      const {SimulatedPayments} = require('../dist/src/payments/simulated-payments');
      const {SimulatedNotifications} = require('../dist/src/notifications/simulated-notifications');
      const payments = new PaymentsService(prisma, state, new SimulatedPayments(), new SimulatedNotifications());
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
      assert.deepEqual(simulatedEvents.map(e => e.type).sort(), ['courier_payment_captured','notification_created','notification_created','payment_captured']);
      assert.equal(await db.notification.count({where: {case_id: c.id, simulated: true}}), 2);
      await assert.rejects(
        state.saveNoticeDraft(advocate, c.id, {
          kind: "legal_notice",
          content,
          generated_by: "manual",
        }),
        { status: 409 },
      );
      await assert.rejects(
        state.dispatch(admin, c.id, {
          carrier: "Test carrier",
          waybill: "Test waybill",
        }),
        { status: 403 },
      );
      await state.dispatch(advocate, c.id, {
        carrier: "Test carrier",
        waybill: "Test waybill",
      });
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
        data: { status: "uploaded" },
      });
      await state.deliver(admin, c.id, { pod_document_id: proof.id });
      const complete = await repo.read(client, c.id);
      assert.equal(complete.status, "completed");
      assert.ok(complete.completed_at);
      assert.equal(complete.shipments[0].pod_document_id, proof.id);
      const events = await db.caseEvent.findMany({
        where: { case_id: c.id },
        orderBy: { id: "asc" },
      });
      assert.deepEqual(
        events.filter(e => !['notification_created','courier_payment_captured'].includes(e.type)).map((e) =>
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
      await db.user.deleteMany({
        where: { id: { in: actors.map((a) => a.id) } },
      });
      await db.$disconnect();
    }
  },
);
