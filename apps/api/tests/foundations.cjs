const assert = require("node:assert/strict");
const test = require("node:test");
const { readFileSync, readdirSync } = require("node:fs");
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
  const sql = readdirSync('prisma/migrations', {withFileTypes: true}).filter(e => e.isDirectory()).map(e => readFileSync(`prisma/migrations/${e.name}/migration.sql`, 'utf8')).join('\n');
  const names = (text) =>
    [...text.matchAll(/CREATE TABLE "?(\w+)"? \(/g)].map((m) => m[1]).sort();
  assert.equal(names(sql).length, 31);
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
          if (!store.has(key)) store.set(key, name==='service'?{config:{},...create}:create);
        },
      },
    ]),
  );
  tx.service.findUniqueOrThrow=async({where})=>stores.service.get(where.code);
  tx.service.update=async({where,data})=>{const row=stores.service.get(where.code);Object.assign(row,data);return row;};
  const client = { $transaction: (fn) => fn(tx) };
  await seed(client);
  const first = structuredClone(stores);
  await seed(client);
  assert.deepEqual(stores, first);
  assert.equal(stores.service.size, 9);
  assert.equal(stores.servicePricing.size, seedManifest.prices.length);
  for (const row of stores.servicePricing.values())
    assert.equal(typeof row.base_amount_paise, "bigint");
  const fir=stores.service.get('fir_draft');
  assert.equal(fir.config.fir_identity_policy.accepted_documents.length,4);
  fir.config.fir_identity_policy={...fir.config.fir_identity_policy,version:2,accepted_documents:fir.config.fir_identity_policy.accepted_documents.slice(1)};
  const configured=structuredClone(fir.config);await seed(client);
  assert.deepEqual(fir.config,configured,'seed preserves operator identity configuration');
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
