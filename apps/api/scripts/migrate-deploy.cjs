// One-off ops task: `prisma migrate deploy` against the stage database, from
// inside the VPC. The URL is built from the database secret at run time and never
// printed; TLS verifies the RDS certificate against the bundled CA.
const { spawnSync } = require("node:child_process");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
(async () => {
  const arn = process.env.DATABASE_SECRET_ARN;
  if (!arn) throw new Error("DATABASE_SECRET_ARN is required");
  const client = new SecretsManagerClient({ region: "ap-south-1" });
  const { SecretString } = await client.send(new GetSecretValueCommand({ SecretId: arn }));
  client.destroy();
  const s = JSON.parse(SecretString ?? "{}");
  const dbname = s.dbname ?? process.env.DATABASE_NAME;
  if (!s.host || !s.port || !dbname || !s.username || !s.password) throw new Error("Database secret is missing connection fields");
  // A single-certificate file: the schema engine reads only the first certificate.
  const ca = process.env.PRISMA_RDS_CA;
  const url = `postgresql://${encodeURIComponent(s.username)}:${encodeURIComponent(s.password)}@${s.host}:${s.port}/${encodeURIComponent(dbname)}` +
    `?sslmode=require&sslaccept=strict${ca ? `&sslcert=${encodeURIComponent(ca)}` : ""}`;
  // The runtime image has no pnpm; the Prisma CLI is installed alongside the app.
  const prisma = require("node:path").join(__dirname, "..", "node_modules", ".bin", "prisma");
  const result = spawnSync(prisma, ["migrate", "deploy"], { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
  if (result.error) console.error(`Migration failed to start: ${result.error.code ?? result.error.message}`);
  process.exit(result.status ?? 1);
})().catch(error => { console.error(`Migration failed: ${error instanceof Error ? error.message : "unknown error"}`); process.exit(1); });
