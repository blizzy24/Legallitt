import { defineConfig } from "prisma/config";

// No credential file and no invented database URL. CLI migrations may receive a
// transient local DATABASE_URL; production runtime retrieves Secrets Manager.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "node dist/prisma/seed.js" },
  ...(process.env.DATABASE_URL
    ? { datasource: { url: process.env.DATABASE_URL } }
    : {}),
});
