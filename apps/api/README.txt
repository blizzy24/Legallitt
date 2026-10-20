Legalitt API — architecture v3.2, through step 4b

Node 22 and pnpm. Run from the repository root:
  pnpm --filter @legalitt/shared build
  pnpm --filter @legalitt/api build
  pnpm --filter @legalitt/api start

The start script loads an optional ignored apps/api/.env.local. Supply:
  PORT                         chosen local port
  DATABASE_URL                 local PostgreSQL connection (Postgres 16 target)
  AUTH_CONFIG_SECRET_ARN       Dev Core app-config secret name or ARN
  ENVIRONMENT                  dev for local Dev-Core integration
  NODE_ENV                     development locally
  PHONE_AUTH_MODE              demo locally; live is not implemented
  DEMO_AUTH_SECRET_ARN          Dev Core demo-auth secret name or ARN
  CORS_ORIGINS                 comma-separated allowed web origins

Use the normal AWS credential chain; do not put AWS keys in configuration files.
The app-config secret supplies pool/client identifiers. AWS database deployments
use DATABASE_SECRET_ARN instead of a local DATABASE_URL. Supply RDS CA trust before
Compute is ever deployed. No Compute stack has been deployed in this phase.

Mobile: set EXPO_PUBLIC_API_URL in ignored apps/mobile/.env.local to the locally
running API's reachable base URL (without /api/v1). For a physical device, use the
laptop's reachable address. A Vercel web build cannot use a hosted API until one
exists; the current implementation is deliberately tested with the API locally.
Native stores only a refresh token in Expo SecureStore; web uses sessionStorage.
Roles are obtained from /me, not restored from a client-written role value.

Endpoints:
  GET   /health                 liveness only
  POST  /api/v1/auth/register    email, password, name, client/advocate role,
                                optional E.164 phone
  POST  /api/v1/auth/confirm     email, six-digit email code
  POST  /api/v1/auth/resend      email
  POST  /api/v1/auth/login       email, password
  POST  /api/v1/auth/refresh     refreshToken
  POST  /api/v1/auth/otp/request phone
  POST  /api/v1/auth/otp/verify  phone, code, role (client/advocate)
  GET   /api/v1/me               Bearer Cognito ID token
  PATCH /api/v1/me               Bearer token; name only

Confirm/resend complete the required email-verification path. The API verifies
Cognito ID-token signature, issuer, audience, token_use and expiry, then reads
custom:role. ID tokens carry that immutable custom attribute. Public signup cannot
create admin identities. PATCH /me rejects role/identity changes. Account status
and stored role are checked against the validated identity. No case or payment
endpoints have been added.

Demo phone sign-in requires ENVIRONMENT=dev, NODE_ENV other than production,
and PHONE_AUTH_MODE=demo. Missing flags and live mode fail closed. The number is
ignored, not queried or stored. Code 123456 selects a fixed account from the role
picker and performs normal Cognito password authentication. No custom challenge,
SMS, account provisioning or second session type exists in request handlers.

After deploying Dev Core, provision the two accounts explicitly:
  pnpm --filter @legalitt/api db:seed-demo
This uses admin credentials, rejects non-dev pools, suppresses messages, marks
emails verified, assigns immutable roles, and seeds corresponding local DB rows.
Repeating it preserves identities and uses the current password from Secrets
Manager. The generated demo-only password is shared by these two test accounts;
it is never returned by the API, embedded in mobile, logged or committed.
Emails: demo-client@legalitt.invalid and demo-advocate@legalitt.invalid.
Normal email/password login works with the same accounts. Operators can retrieve
the password from the Dev Core demo-auth secret through their AWS access.

Database:
  pnpm --filter @legalitt/api db:validate
  pnpm --filter @legalitt/api db:migrate
  pnpm --filter @legalitt/api db:seed

The initial migration preserves the DDL's CHECK, CITEXT and array NOT NULL
constraints that Prisma cannot fully generate. The seed is versioned/idempotent:
nine services, 65 unconfirmed price observations and six unconfirmed commission
observations. It does not choose a tariff. See prisma/seed-data.json for sources
and unresolved pricing. Money remains BIGINT paise.

Checks:
  pnpm typecheck
  pnpm --filter @legalitt/api test
Set LEGALITT_TEST_DATABASE_URL to an isolated migrated database for integration
coverage. Never point test commands at a shared/production database.

  pnpm --filter @legalitt/mobile build
  node scripts/mobile-smoke.mjs
The smoke requires SMOKE_CLIENT_SESSION and SMOKE_ADVOCATE_SESSION: paths to
private JSON auth responses from real dev identities. SMOKE_BASE_URL optionally
selects an already-served build; otherwise SMOKE_PORT can select the local port.
CORS_ORIGINS must allow that origin. No token or test password belongs in the repo.

  node scripts/mobile-auth-check.cjs
Requires SMOKE_BASE_URL and AUTH_TEST_FIXTURES, a private JSON file containing a
fixtures array with role/email/password for dev client and advocate users.
This verifies login, role redirects, actual URL access and simulated phone login.

Email delivery/confirmation with a real inbox still needs a supplied test address
or manual verification. Live tests use the seeded demo accounts provisioned without
sending messages. Native device testing remains separate from the web smoke.

Local PostgreSQL 16 (Docker Desktop)
-----------------------------------
Run these commands from the repository root. Start Docker Desktop first:
  open -a Docker
  docker compose --env-file infra/local/.env.local -f infra/local/compose.yaml up -d --wait

The container binds only to 127.0.0.1:55432. Its named Docker volume persists data
across restarts. The application database is legalitt; integration tests use the
separate legalitt_test database. Existing Homebrew PostgreSQL 14 is untouched.
The official postgres:16 image stays on major version 16.

Local credentials are already configured in ignored files with mode 0600:
  infra/local/.env.local: POSTGRES_PASSWORD
  apps/api/.env.local: DATABASE_URL and LEGALITT_TEST_DATABASE_URL
For a new machine, generate a password and configure the two URLs as:
  postgresql://legalitt:<URL-encoded-password>@127.0.0.1:55432/legalitt
  postgresql://legalitt:<URL-encoded-password>@127.0.0.1:55432/legalitt_test
Use the same password in the Compose environment file. Never commit these files.

Apply migrations to BOTH local databases, seed application data, and test:
  pnpm --filter @legalitt/api db:local:migrate
  pnpm --filter @legalitt/api db:local:seed
  pnpm --filter @legalitt/api test:local
The integration test seeds its isolated database and checks seed idempotence,
ledger constraints and exact BIGINT handling. It now asserts server major 16.
To restore the demo accounts into a fresh application database, with AWS access:
  pnpm --filter @legalitt/api db:seed-demo
Start the API separately:
  pnpm --filter @legalitt/api start

Docker Desktop and the postgres container must stay running while using the API
or running database tests. The API process is not needed for the test suite.
Stop only this local database when finished:
  docker compose --env-file infra/local/.env.local -f infra/local/compose.yaml stop
The up command starts it again. Do not use down -v unless intentionally deleting
all local PostgreSQL 16 data. PostgreSQL 14 does not need to run for this project.

Legal Notice cases — step 5 (API only)
-------------------------------------
All routes below require a real Cognito ID token in Authorization: Bearer <token>.
  POST  /api/v1/cases             { service_code: "legal_notice", tier?, details? }
  GET   /api/v1/cases             ?status=&role=&cursor=&limit=
  GET   /api/v1/cases/:id          case plus events, documents and drafts
  PATCH /api/v1/cases/:id          { tier?, details? }, client-owned draft only
  POST  /api/v1/cases/:id/submit   empty body
  GET   /api/v1/cases/:id/events   ?cursor=&limit=
  POST  /api/v1/cases/:id/cancel   empty body

Create only accepts Legal Notice and derives client identity from authentication.
Draft details may be partial; PATCH merges nested client and noticee fields.
The shared LegalNoticeSubmissionSchema requires the fields marked required by
screens 24–26; submit also requires the selected ordinary/urgent tier. Documents
and KYC are not intake JSON. Unknown fields and caller-supplied status, reference,
client/advocate/pricing identifiers are rejected. No sample values are inserted.

All reads, lists, events and mutations apply the same database-level visibility:
client owns the case, advocate is assigned, admin sees every Legal Notice case.
An inaccessible ID returns the same 404 as a missing ID. The role query parameter
is only a view filter; it cannot grant a caller another role's visibility.

Case lists sort by created_at then UUID, ascending. Limit defaults to 20 (max 100).
Responses use {items,next_cursor}. Events sort by monotonic event ID, use a
separate cursor, and are append-only. Event IDs and document byte counts are
serialized as decimal strings to avoid bigint precision loss in JSON.

CaseStateMachine is the only case writer. Every initial draft and status change
has an event in the same transaction. Row locks serialize edits and transitions.
The production-source ownership test catches case/event writes elsewhere.
References use LN-<UTC year>-<sequence>, at least four sequence digits. Allocation
is atomic, globally increasing across years, and may have gaps after rollback.
Run db:local:migrate to apply the reference sequence migration to both databases.

Cancellation follows the confirmed §4.2 rules, including admin-only cancellation
once work/payment has progressed and no cancellation from dispatching onwards.
Refund is an internal admin-only transition from cancelled/completed; it writes
an event only. No HTTP refund/payment action, assignment endpoint, drafting
endpoint, money movement or other service implementation is added in step 5.
The mobile app remains on fixtures until step 7.
