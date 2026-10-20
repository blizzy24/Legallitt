const assert = require("node:assert/strict");
const test = require("node:test");
const { PrismaClient } = require("../dist/src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { seed, seedManifest } = require("../dist/prisma/seed-records");

// Opt-in: point only at an isolated test database with the migration applied.
test(
  "database seed is idempotent and ledger rejects non-positive amounts",
  {
    skip: !process.env.LEGALITT_TEST_DATABASE_URL,
  },
  async () => {
    const db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.LEGALITT_TEST_DATABASE_URL,
      }),
    });
    try {
      const [server] = await db.$queryRaw`
        SELECT current_setting('server_version_num')::integer AS version
      `;
      assert.equal(Math.floor(server.version / 10000), 16,
        "Database integration tests must run on PostgreSQL 16, matching RDS");
      await seed(db);
      const before = await db.servicePricing.findMany({
        orderBy: { id: "asc" },
      });
      await seed(db);
      assert.deepEqual(
        await db.servicePricing.findMany({ orderBy: { id: "asc" } }),
        before,
      );
      assert.equal(await db.service.count(), 9);
      assert.equal(before.length, seedManifest.prices.length);
      assert.equal(
        await db.commissionRate.count(),
        seedManifest.commissions.length,
      );
      assert.equal(
        await db.servicePricing.count({ where: { confirmed: true } }),
        0,
      );
      await assert.rejects(
        db.ledgerEntry.create({
          data: { account: "escrow", direction: "debit", amount_paise: 0n },
        }),
      );
      // Exercise BIGINT above JavaScript's safe integer limit without float loss.
      const exact = 9007199254740993n;
      const entry = await db.ledgerEntry.create({
        data: { account: "escrow", direction: "debit", amount_paise: exact },
      });
      assert.equal(entry.amount_paise, exact);
      await db.ledgerEntry.delete({ where: { id: entry.id } });
    } finally {
      await db.$disconnect();
    }
  },
);
