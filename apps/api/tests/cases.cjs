const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { CaseStatus } = require("@legalitt/shared");
const { PrismaClient } = require("../dist/src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const {
  CaseStateMachine,
  transitions,
  clientCancellationStates,
  adminCancellationStates,
} = require("../dist/src/cases/case-state-machine");
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
const enabled = !!process.env.LEGALITT_TEST_DATABASE_URL;

test(
  "Legal Notice state machine, transactions, permissions, concurrency and HTTP endpoints",
  { skip: !enabled },
  async (t) => {
    const db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.LEGALITT_TEST_DATABASE_URL,
      }),
    });
    const prisma = { getClient: async () => db };
    const machine = new CaseStateMachine(prisma);
    const client = { id: randomUUID(), role: "client" },
      other = { id: randomUUID(), role: "client" },
      advocate = { id: randomUUID(), role: "advocate" },
      admin = { id: randomUUID(), role: "admin" };
    const actors = [client, other, advocate, admin];
    const ids = [];
    const create = async (status = "draft") => {
      const id = randomUUID();
      ids.push(id);
      return db.case.create({
        data: {
          id,
          reference: `TEST-${id}`,
          service_code: "legal_notice",
          client_id: client.id,
          advocate_id: advocate.id,
          status,
          tier: "ordinary",
          details,
        },
      });
    };
    const actorFor = (to) =>
      [
        "submitted",
        "payment_pending",
        "approved",
        "changes_requested",
      ].includes(to)
        ? client
        : [
              "advocate_accepted",
              "advocate_declined",
              "in_progress",
              "client_review",
              "dispatching",
              "dispatched",
            ].includes(to)
          ? advocate
          : admin;
    try {
      await db.service.upsert({
        where: { code: "legal_notice" },
        create: { code: "legal_notice", name: "Legal Notice" },
        update: {},
      });
      for (const a of actors)
        await db.user.create({
          data: {
            ...a,
            cognito_sub: `test-${a.id}`,
            full_name: "Test identity",
          },
        });
      await t.test(
        "every allowed edge writes exactly one attributed event; every other edge is rejected",
        async () => {
          // Independent expected graph, rather than iterating only the implementation.
          const expected = {
            draft: ["submitted", "cancelled"],
            submitted: ["payment_pending", "cancelled"],
            payment_pending: ["paid", "cancelled"],
            paid: ["assigning", "cancelled"],
            assigning: ["assigned", "cancelled"],
            assigned: ["advocate_accepted", "advocate_declined", "cancelled"],
            advocate_accepted: ["in_progress", "cancelled"],
            advocate_declined: ["assigning", "cancelled"],
            in_progress: ["client_review", "cancelled"],
            client_review: ["changes_requested", "approved", "cancelled"],
            changes_requested: ["in_progress", "cancelled"],
            approved: ["dispatching", "cancelled"],
            dispatching: ["dispatched"],
            dispatched: ["completed"],
            completed: ["refunded"],
            cancelled: ["refunded"],
            refunded: [],
          };
          assert.deepEqual(transitions, expected);
          for (const from of Object.values(CaseStatus))
            for (const to of Object.values(CaseStatus)) {
              const row = await create(from);
              const actor = actorFor(to);
              if (expected[from].includes(to)) {
                const result = await machine.transition(actor, row.id, to);
                assert.equal(result.status, to);
                const events = await db.caseEvent.findMany({
                  where: { case_id: row.id },
                });
                assert.equal(events.length, 1);
                assert.equal(events[0].from_status, from);
                assert.equal(events[0].to_status, to);
                assert.equal(events[0].actor_id, actor.id);
                assert.equal(events[0].actor_role, actor.role);
                assert.ok(events[0].created_at instanceof Date);
                if (to === "completed")
                  assert.ok(result.completed_at instanceof Date);
              } else {
                await assert.rejects(machine.transition(actor, row.id, to), {
                  status: 409,
                });
                assert.equal(
                  (await db.case.findUnique({ where: { id: row.id } })).status,
                  from,
                );
                assert.equal(
                  await db.caseEvent.count({ where: { case_id: row.id } }),
                  0,
                );
              }
            }
        },
      );
      await t.test(
        "cancellation/refund roles, terminal states and human review gate",
        async () => {
          for (const from of Object.values(CaseStatus))
            for (const actor of [client, advocate, admin]) {
              const row = await create(from);
              const permitted =
                actor.role === "admin"
                  ? adminCancellationStates.includes(from)
                  : actor.role === "client" &&
                    clientCancellationStates.includes(from);
              if (permitted)
                assert.equal(
                  (
                    await machine.transition(
                      actor,
                      row.id,
                      CaseStatus.cancelled,
                    )
                  ).status,
                  "cancelled",
                );
              else
                await assert.rejects(
                  machine.transition(actor, row.id, CaseStatus.cancelled),
                );
            }
          for (const from of ["cancelled", "completed"])
            for (const actor of [client, advocate]) {
              const row = await create(from);
              await assert.rejects(
                machine.transition(actor, row.id, CaseStatus.refunded),
                { status: 403 },
              );
            }
          const row = await create("in_progress");
          for (const actor of [client, admin])
            await assert.rejects(
              machine.transition(actor, row.id, CaseStatus.client_review),
              { status: 403 },
            );
          await assert.rejects(
            machine.transition(other, row.id, CaseStatus.cancelled),
            { status: 404 },
          );
          await machine.transition(admin, row.id, CaseStatus.cancelled);
          await machine.transition(admin, row.id, CaseStatus.refunded);
          assert.deepEqual(
            (
              await db.caseEvent.findMany({
                where: { case_id: row.id },
                orderBy: { id: "asc" },
              })
            ).map((e) => [e.from_status, e.to_status]),
            [
              ["in_progress", "cancelled"],
              ["cancelled", "refunded"],
            ],
          );
          assert.equal(
            await db.payment.count({ where: { case_id: row.id } }),
            0,
          );
          assert.equal(
            await db.ledgerEntry.count({ where: { case_id: row.id } }),
            0,
          );
        },
      );
      await t.test(
        "creation reference allocation, incremental drafts, submission and status injection",
        async () => {
          const rows = await Promise.all(
            Array.from({ length: 8 }, () =>
              machine.create(client, { service_code: "legal_notice" }),
            ),
          );
          ids.push(...rows.map((r) => r.id));
          assert.equal(new Set(rows.map((r) => r.reference)).size, 8);
          for (const r of rows) {
            assert.match(r.reference, /^LN-\d{4}-\d{4,}$/);
            assert.equal(
              await db.caseEvent.count({
                where: { case_id: r.id, to_status: "draft", from_status: null },
              }),
              1,
            );
          }
          const row = rows[0];
          await assert.rejects(
            machine.transition(client, row.id, CaseStatus.submitted),
            { status: 400 },
          );
          await machine.updateDraft(client, row.id, {
            details: { client: details.client },
          });
          const updated = await machine.updateDraft(client, row.id, {
            tier: "ordinary",
            details: { noticee: details.noticee, issueType: details.issueType },
          });
          assert.deepEqual(updated.details, details);
          await assert.rejects(
            machine.updateDraft(client, row.id, { status: "paid" }),
            { status: 400 },
          );
          await assert.rejects(
            machine.updateDraft(other, row.id, { tier: "urgent" }),
            { status: 404 },
          );
          for (const actor of [advocate, admin])
            await assert.rejects(
              machine.updateDraft(actor, row.id, { tier: "urgent" }),
            );
          await machine.transition(client, row.id, CaseStatus.submitted);
          await assert.rejects(
            machine.updateDraft(client, row.id, { tier: "urgent" }),
            { status: 409 },
          );
          for (const body of [
            { service_code: "fir_draft" },
            { service_code: "legal_notice", reference: "LN-2026-1048" },
            { service_code: "legal_notice", client_id: other.id },
            {
              service_code: "legal_notice",
              details: { aadhaar: "123456789012" },
            },
          ])
            await assert.rejects(machine.create(client, body), { status: 400 });
          await assert.rejects(
            machine.create(advocate, { service_code: "legal_notice" }),
            { status: 403 },
          );
        },
      );
      await t.test(
        "event failure rolls back both status updates and case creation",
        async () => {
          const row = await create();
          const failing = new CaseStateMachine({
            getClient: async () => ({
              $transaction: (fn) =>
                db.$transaction((tx) =>
                  fn(
                    new Proxy(tx, {
                      get(target, key) {
                        if (key === "caseEvent")
                          return {
                            create: async () => {
                              throw new Error("Injected event failure");
                            },
                          };
                        return target[key];
                      },
                    }),
                  ),
                ),
            }),
          });
          await assert.rejects(
            failing.transition(client, row.id, CaseStatus.submitted),
            /Injected event failure/,
          );
          assert.equal(
            (await db.case.findUnique({ where: { id: row.id } })).status,
            "draft",
          );
          assert.equal(
            await db.caseEvent.count({ where: { case_id: row.id } }),
            0,
          );
          const before = await db.case.count({
            where: { client_id: client.id },
          });
          await assert.rejects(
            failing.create(client, { service_code: "legal_notice" }),
            /Injected event failure/,
          );
          assert.equal(
            await db.case.count({ where: { client_id: client.id } }),
            before,
          );
        },
      );
      await t.test(
        "concurrent submissions produce one status change and one event",
        async () => {
          const row = await create();
          const results = await Promise.allSettled([
            machine.transition(client, row.id, CaseStatus.submitted),
            machine.transition(client, row.id, CaseStatus.submitted),
          ]);
          assert.equal(
            results.filter((r) => r.status === "fulfilled").length,
            1,
          );
          assert.equal(
            results.find((r) => r.status === "rejected").reason.status,
            409,
          );
          assert.equal(
            await db.caseEvent.count({ where: { case_id: row.id } }),
            1,
          );
        },
      );
      await t.test(
        "HTTP create/list/read/patch/submit/events/cancel use authentication and scoped data",
        async () => {
          require("reflect-metadata");
          const { NestFactory } = require("@nestjs/core");
          const { AppModule } = require("../dist/src/app.module");
          const { PrismaService } = require("../dist/src/prisma.service");
          const { AuthService } = require("../dist/src/auth/auth.service");
          const app = await NestFactory.create(AppModule, { logger: false });
          app.get(PrismaService).getClient = async () => db;
          app.get(AuthService).identity = async (token) => {
            const actor = actors.find((a) => a.id === token);
            if (!actor)
              throw new (require("@nestjs/common").UnauthorizedException)();
            return actor;
          };
          try {
            await app.listen(0, "127.0.0.1");
            const url = await app.getUrl();
            const call = async (method, path, actor, body) => {
              const r = await fetch(url + "/api/v1/cases" + path, {
                method,
                headers: {
                  ...(actor ? { Authorization: "Bearer " + actor.id } : {}),
                  "Content-Type": "application/json",
                },
                ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
              });
              return { status: r.status, body: await r.json() };
            };
            assert.equal((await call("GET", "", null)).status, 401);
            const created = await call("POST", "", client, {
              service_code: "legal_notice",
              tier: "urgent",
              details,
            });
            assert.equal(created.status, 201);
            ids.push(created.body.id);
            const path = "/" + created.body.id;
            assert.equal((await call("GET", path, other)).status, 404);
            assert.equal(
              (await call("GET", path + "/events", other)).status,
              404,
            );
            assert.equal(
              (await call("PATCH", path, other, { tier: "ordinary" })).status,
              404,
            );
            assert.equal(
              (await call("POST", path + "/submit", other, {})).status,
              404,
            );
            assert.equal(
              (await call("POST", path + "/cancel", other, {})).status,
              404,
            );
            const read = await call("GET", path, client);
            assert.equal(read.status, 200);
            assert.equal(read.body.events.length, 1);
            assert.equal(typeof read.body.events[0].id, "string");
            assert.deepEqual(read.body.documents, []);
            assert.deepEqual(read.body.drafts, []);
            assert.equal(
              (await call("PATCH", path, client, { tier: "ordinary" })).status,
              200,
            );
            assert.equal(
              (await call("POST", path + "/submit", client, {})).status,
              201,
            );
            assert.equal(
              (await call("POST", path + "/cancel", client, {})).body.status,
              "cancelled",
            );
            assert.equal(
              (await call("GET", path + "/events", client)).body.items.length,
              4,
            );
            assert.equal(
              (await call("GET", "?role=admin", client)).body.items.length,
              0,
            );
            assert.equal(
              (await call("GET", "/not-a-uuid", client)).status,
              400,
            );
            assert.equal(
              (await call("PATCH", path, client, { status: "refunded" }))
                .status,
              400,
            );
            assert.equal(
              (await call("POST", path + "/refund", admin, {})).status,
              404,
            );
          } finally {
            await app.close();
          }
        },
      );
    } finally {
      await db.caseEvent.deleteMany({ where: { case_id: { in: ids } } });
      await db.case.deleteMany({ where: { id: { in: ids } } });
      await db.user.deleteMany({
        where: { id: { in: actors.map((a) => a.id) } },
      });
      await db.$disconnect();
    }
  },
);
