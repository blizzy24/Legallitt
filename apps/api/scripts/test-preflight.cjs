// Runs before the API suite (pnpm test, pnpm test:local). The suite assumes the
// Node version in engines and a test database that is fully migrated and has the
// base seed (prisma/seed.ts); without them tests fail with misleading errors
// (Node 24 runs `await t.test()` out of order; a missing seed shows up as a
// foreign-key violation on cases_service_code_fkey). Fail early and say why.
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../../..");
const fail = (message) => { console.error(`API test preflight: ${message}`); process.exit(1); };

const wanted = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).engines.node;
const major = wanted.match(/^(\d+)\.x$/)?.[1];
if (!major) fail(`cannot read engines.node "${wanted}"`);
if (process.versions.node.split(".")[0] !== major)
  fail(`running Node ${process.versions.node}, but engines requires ${wanted}. ` +
    "Run `fnm use` in the repository (it reads .nvmrc), or `fnm exec --using=.nvmrc pnpm test`.");

const url = process.env.LEGALITT_TEST_DATABASE_URL;
if (!url) {
  console.log("API test preflight: LEGALITT_TEST_DATABASE_URL is not set; database tests will be skipped.");
  process.exit(0);
}

(async () => {
  const { PrismaClient } = require("../dist/src/generated/prisma/client");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { SERVICE_CODES } = require("@legalitt/shared");
  const { seedId, seedManifest } = require("../dist/prisma/seed-records");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  try {
    const migrations = fs.readdirSync(path.join(__dirname, "../prisma/migrations"))
      .filter((name) => fs.statSync(path.join(__dirname, "../prisma/migrations", name)).isDirectory());
    let applied;
    try {
      applied = new Set((await db.$queryRaw`SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL`)
        .map((row) => row.migration_name));
    } catch {
      fail("the test database is not reachable or has never been migrated. Run `pnpm db:local:migrate`.");
    }
    const pending = migrations.filter((name) => !applied.has(name));
    if (pending.length) fail(`the test database is missing migrations ${pending.join(", ")}. Run \`pnpm db:local:migrate\`.`);
    const services = new Set((await db.service.findMany({ select: { code: true } })).map((s) => s.code));
    const prices = new Set((await db.servicePricing.findMany({ select: { id: true } })).map((p) => p.id));
    const missing = [
      ...SERVICE_CODES.filter((code) => !services.has(code)).map((code) => `service ${code}`),
      ...seedManifest.prices.filter((row) => !prices.has(seedId("service_pricing", row))).map((row) => `price ${row.service_code}/${row.tier ?? "-"}/${row.variant ?? "-"}`),
    ];
    if (missing.length)
      fail(`the test database lacks the base seed (prisma/seed.ts): ${missing.length} rows missing, e.g. ${missing.slice(0, 3).join("; ")}. ` +
        "Seed it with `DATABASE_URL=$LEGALITT_TEST_DATABASE_URL node dist/prisma/seed.js`.");
  } finally {
    await db.$disconnect();
  }
})().catch(() => fail("could not check the test database; check LEGALITT_TEST_DATABASE_URL."));
