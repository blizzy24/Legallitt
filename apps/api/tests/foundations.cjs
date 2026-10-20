const assert = require("node:assert/strict");
const test = require("node:test");
const { readFileSync } = require("node:fs");
const { CaseStatus, SERVICE_CODES } = require("@legalitt/shared");
const {
  CaseStatus: PrismaCaseStatus,
} = require("../dist/src/generated/prisma/enums");
const { seed, seedId, seedManifest } = require("../dist/prisma/seed-records");

test("Prisma lifecycle exactly mirrors canonical shared lifecycle", () => {
  assert.deepEqual(Object.values(PrismaCaseStatus), Object.values(CaseStatus));
});

test("migration includes every authoritative table and SQL-only constraints", () => {
  const doc = readFileSync(
    "../../docs/LEGALITT-BACKEND-ARCHITECTURE.md",
    "utf8",
  );
  const sql = readFileSync(
    "prisma/migrations/20261020000000_initial/migration.sql",
    "utf8",
  );
  const names = (text) =>
    [...text.matchAll(/CREATE TABLE "?(\w+)"? \(/g)].map((m) => m[1]).sort();
  assert.equal(names(sql).length, 22);
  assert.deepEqual(names(sql), names(doc));
  assert.match(sql, /CREATE EXTENSION IF NOT EXISTS citext/);
  assert.match(sql, /CHECK \("amount_paise" > 0\)/);
  for (const column of ["practice_areas", "languages", "courts", "channels"]) {
    assert.match(sql, new RegExp(`"${column}" TEXT\\[\\] NOT NULL`));
  }
});

test("seed uses integer paise, source citations and unconfirmed observations", () => {
  const ids = new Set();
  for (const row of seedManifest.prices) {
    assert.match(row.base_amount_paise, /^\d+$/);
    assert.equal(row.confirmed, false);
    assert.equal(row.gst_bps, 1800);
    assert.ok(SERVICE_CODES.includes(row.service_code));
    assert.match(row.source_note, /design\//);
    const id = seedId("service_pricing", row);
    assert.ok(!ids.has(id));
    ids.add(id);
    assert.notEqual(id, seedId("service_pricing", { ...row, confirmed: true }));
  }
  for (const row of seedManifest.commissions) {
    assert.equal(row.confirmed, false);
    assert.ok(Number.isInteger(row.rate_bps));
    assert.match(row.source_note, /design\//);
  }
});

test("seed reruns never update existing price versions", async () => {
  const stores = {
    service: new Map(),
    servicePricing: new Map(),
    commissionRate: new Map(),
  };
  const tx = Object.fromEntries(
    Object.entries(stores).map(([name, store]) => [
      name,
      {
        async upsert({ where, create, update }) {
          assert.deepEqual(update, {});
          const key = where.id ?? where.code;
          if (!store.has(key)) store.set(key, create);
        },
      },
    ]),
  );
  const client = { $transaction: (fn) => fn(tx) };
  await seed(client);
  const first = structuredClone(stores);
  await seed(client);
  assert.deepEqual(stores, first);
  assert.equal(stores.service.size, 9);
  assert.equal(stores.servicePricing.size, seedManifest.prices.length);
  for (const row of stores.servicePricing.values())
    assert.equal(typeof row.base_amount_paise, "bigint");
});

test("/health answers HTTP without AWS/database configuration", async () => {
  require("reflect-metadata");
  const { NestFactory } = require("@nestjs/core");
  const { AppModule } = require("../dist/src/app.module");
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    await app.listen(0, "127.0.0.1");
    const url = await app.getUrl();
    const response = await fetch(`${url}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
    assert.equal((await fetch(`${url}/api/v1/cases`)).status, 401);
  } finally {
    await app.close();
  }
});
