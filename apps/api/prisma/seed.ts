import { createDatabaseClient } from "../src/database";
import { seed, seedManifest } from "./seed-records";

async function main() {
  const client = await createDatabaseClient();
  try {
    await seed(client);
    console.log(
      `Seeded nine services, ${seedManifest.prices.length} price observations and ${seedManifest.commissions.length} commission observations.`,
    );
    for (const note of seedManifest.unresolved)
      console.log(`Unresolved: ${note}`);
  } finally {
    await client.$disconnect();
  }
}

void main().catch(() => {
  // Database driver errors may include connection information. Do not log them.
  console.error("Seed failed; check database access and the migration state.");
  process.exitCode = 1;
});
