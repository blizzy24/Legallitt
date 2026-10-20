const { spawnSync } = require("node:child_process");
const path = require("node:path");

const urls = ["DATABASE_URL", "LEGALITT_TEST_DATABASE_URL"].map((name) => {
  if (!process.env[name]) throw new Error(`${name} is required in .env.local`);
  const url = new URL(process.env[name]);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(url.hostname))
    throw new Error(`${name} must point to a local database`);
  return url;
});
if (urls[0].pathname === urls[1].pathname)
  throw new Error("Use separate application and test databases");
for (const url of urls) {
  const result = spawnSync(
    process.execPath,
    [path.resolve(__dirname, "../node_modules/prisma/build/index.js"), "migrate", "deploy"],
    { stdio: "inherit", env: { ...process.env, DATABASE_URL: url.href } },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
