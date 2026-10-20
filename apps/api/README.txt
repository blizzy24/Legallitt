Legalitt API foundation — architecture v2.1, step 3 only

Node 22, pnpm workspace @legalitt/api. Run commands from the repository root.

  pnpm --filter @legalitt/shared build
  pnpm --filter @legalitt/api build
  PORT=<chosen-local-port> pnpm --filter @legalitt/api start

GET /health returns {"status":"ok"}. It is liveness, not database readiness.
There are no auth, case, pricing, payment or other business endpoints yet.

Database setup:
  Supply DATABASE_URL transiently for a disposable local PostgreSQL instance.
  pnpm --filter @legalitt/api db:validate
  pnpm --filter @legalitt/api db:migrate
  pnpm --filter @legalitt/api db:seed

Do not create credential files. The AWS runtime uses DATABASE_SECRET_ARN and
retrieves credentials from Secrets Manager in ap-south-1. The secret must have
host, numeric port, dbname, username and password (the CDK DB target attachment
supplies connection metadata). Supply the RDS CA via Node's trust store before
deployment. TLS certificate verification stays enabled.

For tests:
  pnpm --filter @legalitt/api test
  Set LEGALITT_TEST_DATABASE_URL to an isolated migrated database to also run
  the integration test. Do not point this variable at a shared/production DB.

Migration caveats:
  Prisma cannot declare the SQL CHECK or CITEXT extension installation.
  Its generated text-array columns also omit NOT NULL. The initial migration
  preserves all three requirements from the authoritative DDL.
  Prisma 7.10.1's migrate diff requires a datasource URL even for --from-empty;
  pass the local test URL explicitly. Do not mistake an empty output for success.

Seed caveats:
  seed-data.json holds versioned source observations, not a selected tariff.
  All 65 price observations and six commission observations are unconfirmed.
  Prices use decimal strings converted directly to BIGINT paise. GST is 1800 bps
  per the DDL; tax applicability on conflicting source figures remains pending.
  No backend checkout calculation or price-selection policy is implemented.
  Reruns insert missing records, never update existing price/commission versions.
  Content-derived UUIDs give changed source records new IDs.
  commission_rates has no source_note column in the specification: commission
  citations remain in this manifest. See its unresolved list for absent values.

No AWS deployment has been performed. Steps 4 onwards are intentionally absent.
