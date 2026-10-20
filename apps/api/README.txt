Legalitt API — architecture v3.0, through step 4b

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
  SMS_ENABLED                  false while SMS is simulated
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
  POST  /api/v1/auth/otp/verify  phone, code
  GET   /api/v1/me               Bearer Cognito ID token
  PATCH /api/v1/me               Bearer token; name only

Confirm/resend complete the required email-verification path. The API verifies
Cognito ID-token signature, issuer, audience, token_use and expiry, then reads
custom:role. ID tokens carry that immutable custom attribute. Public signup cannot
create admin identities. PATCH /me rejects role/identity changes. Account status
and stored role are checked against the validated identity. No case or payment
endpoints have been added.

Phone simulation works only for registered identities in dev, with SMS_ENABLED
false and NODE_ENV not production. The deployed triggers independently enforce
the dev-only rule. Unknown phone provisioning/role assignment is unresolved and
not implemented. SMS_ENABLED=true fails closed pending a chosen provider/DLT.
Challenges live in the local API process, expire after five minutes, permit three
attempts, and allow resend after the design's 28-second timer. Restarting the API
invalidates pending challenges. Shared challenge storage needs a decision before
running multiple API tasks. No phone is marked genuinely verified by simulation.

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
fixtures array with role/email/password/phone for dev client and advocate users.
This verifies login, role redirects, actual URL access and simulated phone login.

Email delivery/confirmation with a real inbox still needs a supplied test address
or manual verification. Live tests used temporary accounts provisioned without
sending messages. Native device testing remains separate from the web smoke.
