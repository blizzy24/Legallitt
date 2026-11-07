const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const test = require("node:test");
const { PrismaClient } = require("../dist/src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { CaseRepository } = require("../dist/src/cases/case-repository");

test(
  "case data access isolates clients, assigned advocates, other services and event cursors",
  {
    skip: !process.env.LEGALITT_TEST_DATABASE_URL,
  },
  async () => {
    const db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.LEGALITT_TEST_DATABASE_URL,
      }),
    });
    const repository = new CaseRepository({ getClient: async () => db });
    const actors = ["client", "client", "advocate", "advocate", "admin"].map(
      (role) => ({ id: randomUUID(), role }),
    );
    const [a, b, advocate, otherAdvocate, admin] = actors;
    const caseIds = Array.from({ length: 3 }, () => randomUUID());
    try {
      await db.service.upsert({
        where: { code: "legal_notice" },
        create: { code: "legal_notice", name: "Legal Notice" },
        update: {},
      });
      await db.service.upsert({
        where: { code: "fir_draft" },
        create: { code: "fir_draft", name: "FIR Draft" },
        update: {},
      });
      for (const actor of actors)
        await db.user.create({
          data: {
            ...actor,
            cognito_sub: `test-${actor.id}`,
            full_name: "Test identity",
          },
        });
      // Fixtures only; production status writes will belong to the state machine.
      for (const [index, client] of [a, b, a].entries()) {
        await db.case.create({
          data: {
            id: caseIds[index],
            reference: `TEST-${caseIds[index]}`,
            service_code: index === 2 ? "fir_draft" : "legal_notice",
            client_id: client.id,
            advocate_id: index === 0 ? advocate.id : null,
          },
        });
        await db.caseEvent.create({
          data: {
            case_id: caseIds[index],
            type: "test_fixture",
            to_status: "draft",
            actor_id: client.id,
            actor_role: client.role,
          },
        });
      }
      assert.equal((await repository.read(a, caseIds[0])).client_id, a.id);
      await assert.rejects(repository.read(a, caseIds[1]), { status: 404 });
      await assert.rejects(repository.read(b, caseIds[0]), { status: 404 });
      await assert.rejects(repository.events(a, caseIds[1], {}), {
        status: 404,
      });
      assert.equal(
        (await repository.read(advocate, caseIds[0])).advocate_id,
        advocate.id,
      );
      await assert.rejects(repository.read(otherAdvocate, caseIds[0]), {
        status: 404,
      });
      await assert.rejects(repository.read(advocate, caseIds[1]), {
        status: 404,
      });
      assert.equal((await repository.read(admin, caseIds[1])).client_id, b.id);
      // Services no longer restrict access; ownership and assignment still do.
      assert.equal((await repository.read(admin, caseIds[2])).service_code, 'fir_draft');
      assert.equal((await repository.read(a, caseIds[2])).client_id, a.id);
      await assert.rejects(repository.read(b, caseIds[2]), {status:404});
      await assert.rejects(repository.read(advocate, caseIds[2]), {status:404});
      assert.deepEqual(
        (await repository.list(a, {})).items.map((c) => c.id),
        [caseIds[0], caseIds[2]],
      );
      assert.deepEqual(
        (await repository.list(advocate, {})).items.map((c) => c.id),
        [caseIds[0]],
      );
      assert.deepEqual((await repository.list(a, { role: "admin" })).items, []);
      assert.deepEqual((await repository.list(a, {})).items[0].advocate, {id: advocate.id, full_name: "Test identity"});
      assert.equal((await repository.list(b, {})).items[0].advocate, null);
      const first = await repository.list(admin, { limit: 1 });
      assert.equal(first.items.length, 1);
      assert.ok(first.next_cursor);
      const next = await repository.list(admin, {
        limit: 1,
        cursor: first.next_cursor,
      });
      assert.equal(next.items.length, 1);
      assert.notEqual(next.items[0].id, first.items[0].id);
      const events = await repository.events(a, caseIds[0], { limit: 1 });
      assert.equal(events.items.length, 1);
      assert.equal(events.items[0].actor_id, a.id);
      assert.deepEqual(
        (
          await repository.events(a, caseIds[0], {
            cursor: events.items[0].id.toString(),
          })
        ).items,
        [],
      );
      await assert.rejects(repository.list(a, { cursor: "broken" }), {
        status: 400,
      });
      await assert.rejects(repository.list(a, { client_id: b.id }), {
        status: 400,
      });
      await assert.rejects(
        repository.events(a, caseIds[0], { cursor: "9223372036854775808" }),
        { status: 400 },
      );
    } finally {
      await db.caseEvent.deleteMany({ where: { case_id: { in: caseIds } } });
      await db.case.deleteMany({ where: { id: { in: caseIds } } });
      await db.user.deleteMany({
        where: { id: { in: actors.map((a) => a.id) } },
      });
      await db.$disconnect();
    }
  },
);
