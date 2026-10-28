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
The advocate account is named Adv. Arjun Sharma and the seed also upserts its
advocate_profiles row with design 437's drawn facts (8 years, Property Law,
D/1842/2016, 4.9 from 142 reviews, verified, photo_key advocate-05). Dev seed
data behind the same guards; architecture §9.1 lists it. bar_council_state is
not drawn anywhere and is left null. photo_key holds a bundled asset name now
and an S3 key once advocates upload portraits (migration 202610280001).
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

Documents — step 6 (API only)
-----------------------------
  POST   /api/v1/documents/presign  {case_id,kind,filename,mime}
  POST   /api/v1/documents/:id/complete  {}
  GET    /api/v1/documents/:id/url
  DELETE /api/v1/documents/:id

Uses the existing Dev Core bucket from AUTH_CONFIG_SECRET_ARN (bucketName).
DOCUMENT_BUCKET may explicitly override the bucket in a configured environment.
The AWS credential chain must allow S3 object read/write/version deletion and
bucket version listing plus use of the bucket's KMS key. Compute IAM has been
updated in source only; this step does not deploy any infrastructure.

Presign returns {document,upload:{url,fields,method,expires_in,max_bytes}}.
Send a multipart POST directly to upload.url: append every returned field, then
append the file LAST. Do not send file bytes through an API endpoint. S3 enforces
an exact key/type and 1..25,000,000 bytes in its signed policy. URLs last 300s.
Only application/pdf, image/jpeg and image/png are accepted. Client byte/page
counts, owner IDs and S3 keys are not accepted. Filenames cannot contain paths,
control characters, template expressions or full twelve-digit identity numbers.

The temporary key has a .pending- filename prefix under the case/document UUIDs.
Completion reads S3 HEAD metadata and internally reads that exact object version
for structural validation/page counting. This internal S3 read is required for
6b; client uploads and downloads remain direct to S3. Actual file signature/type
must match S3 Content-Type. Validated bytes are copied to the final key:
  cases/<caseId>/<documentId>/<filename>
Clients never receive a write URL for that final key. Reusing an upload URL
cannot replace already validated evidence. Completion is serialized/idempotent.
Invalid inspected versions are removed and remain unavailable for download.

PDF page trees are counted, including kind=id_proof. JPEG/PNG count as one page.
Malformed/encrypted PDFs that cannot be counted are rejected. Parsing runs in a
worker with a ten-second timeout and a 128 MB V8 old-generation heap limit;
parser diagnostics are discarded. No OCR, text extraction or identity-field
extraction is requested. This is format validation, not antivirus scanning.

Presign/complete/download require the case's client, assigned advocate or admin.
Only the uploader or admin can delete, and they must still have case access.
Delete tombstones metadata immediately and purges all S3 object versions and
delete markers; failures are retried by cleanup. Existing case-history foreign
keys remain intact. Case reads include only uploaded documents.

Every five minutes while the API runs, cleanup deletes pending rows older than
one hour only if neither temporary nor final object exists. Pending rows with
objects are retained: the specification supplies no retention period for those.
The sweep also removes old temporary versions of completed uploads and retries
physical deletion for tombstoned documents. For pending data, an S3 error is not
treated as absence. Multiple API processes coordinate with database row locks.
There is no cleanup execution while all API processes are stopped.

ID proof is case evidence, never a KYC record. Use kind=id_proof. Its API response
includes identity_notice with PAN/passport/driving licence/voter ID alternatives
and masked-Aadhaar-only guidance from section 6d. Do not require Aadhaar.
No content-based check can enforce masking here. The upload-screen wording and
alternatives must be wired in step 7; mobile files are untouched in step 6.
Per-flow accepted identity documents and stricter retention are still client
questions. Browser-to-S3 CORS also needs configuration with step 7's web origins.

Tests:
  pnpm --filter @legalitt/api test:local
The API suite uses local PostgreSQL 16 and isolated in-memory storage for tests.
Optional live check, from apps/api after building, with Dev AWS access:
  node --env-file=.env.local scripts/verify-documents-local.cjs
It uses seeded Cognito demo accounts, a synthetic local case and synthetic files
in the existing Dev bucket. It checks private/KMS storage, page counting, access,
URL replay protection, deletion, false MIME labels and the actual 25 MB S3 limit.
It removes its synthetic rows and object versions and does not print signed URLs
or tokens. It refuses non-dev settings and a non-local database. No AWS deploy.

Legal Notice end to end — step 7 (architecture v3.8)
----------------------------------------------------
Mobile DATA_SOURCE defaults to fixtures. Expo exposes this flag as
EXPO_PUBLIC_DATA_SOURCE; it must equal api to enable the real-data path. Leave
it unset on Vercel. No deployed frontend settings have been changed.

Local API mode:
  Keep Docker Desktop and the PostgreSQL 16 container running.
  pnpm --filter @legalitt/api start
  EXPO_PUBLIC_DATA_SOURCE=api EXPO_PUBLIC_API_URL=http://localhost:3001 pnpm --filter @legalitt/mobile web
Use http://localhost:8081 (not 127.0.0.1 for browser-to-S3 uploads).
The authorized Dev Core CORS update allows that exact origin only. Compute
and production remain undeployed/untouched. API still runs locally.
To return to the deployed fixture behaviour, unset EXPO_PUBLIC_DATA_SOURCE.
Expo embeds these variables at build time; changing one requires restarting
Metro or rebuilding the export, not just refreshing the page.

The shared ApiClient owns API transport, Cognito token attachment/refresh,
timeouts and visible error messages. Mutation timeouts are not automatically
retried. Intake stays in local component state on failure; Continue retries the
save. Saved intake and a case UUID in the route survive reloads. My Cases/My
Matters list real permitted cases in API mode. No API failure falls back to
sample data. Session restoration retains credentials on connection failure and
offers Retry. An in-flight refresh cannot restore credentials after sign-out.
Native uses SecureStore; web session storage remains scoped to the browser tab.

Additional routes:
  GET  /api/v1/services
  GET  /api/v1/services/:code          current effective price versions
  GET  /api/v1/advocate/requests       assigned requests
  POST /api/v1/cases/:id/accept        {}
  POST /api/v1/cases/:id/decline       {reason}
  POST /api/v1/cases/:id/drafts        {kind:"legal_notice",content,generated_by:"manual"}
  GET  /api/v1/cases/:id/drafts
  POST /api/v1/cases/:id/drafts/:draftId/send             {}
  POST /api/v1/cases/:id/drafts/:draftId/approve          {}
  POST /api/v1/cases/:id/drafts/:draftId/request-changes  {comment}
  POST /api/v1/admin/cases/:id/assign  {advocate_id}
  POST /api/v1/cases/:id/dispatch      {carrier,waybill}
  POST /api/v1/admin/cases/:id/deliver {pod_document_id}
  POST /api/v1/dev/cases/:id/pay       {} DEVELOPMENT ONLY

Submit now atomically records submitted then payment_pending. The dev payment
route requires ENVIRONMENT=dev AND NODE_ENV=development/test, plus the owning
client. It returns 404 outside those environments. It creates no payment,
ledger or payout row and charges no money. Pricing calculations and Razorpay
remain step 8; API mode displays seeded base tier prices, never fixture totals.

Sending a draft for review renders it to Legal_Notice_Draft_v{version}.pdf and
approval renders Legal_Notice_Final.pdf with the recorded approval ("Signed by
Client", the approving client's name, the timestamp); both are filed through
the real documents pipeline as the acting user (kind legal_notice), so the page
count comes from the file. drafts.document_id and cases.notice_document_id link
them (migration 202610280002). The PDF is filed before the lifecycle moves and
discarded if the move is refused. Layout: architecture §8, question 23. The
approval is not printed in the letter (it is posted to the other party); the
app's "Signed by Client" descriptor comes from the approval record. Text is set
in bundled Noto Sans and Noto Sans Devanagari (assets/fonts, OFL), shaped by
fontkit, so what the advocate typed is what prints.

Draft content has the six structured editor fields drawn on 188:
  sender, recipient, subject, facts, demand, closing
Every save creates a numbered version and a draft_saved event. Only the
assigned advocate may save/send. AI drafting remains unimplemented (step 11).
Client reads hide each draft version until its advocate send event exists.
Reviews only accept the latest version in client_review. Draft saves, reviews,
assignment and courier actions lock the case and write their related records
and events atomically through CaseStateMachine. Unsent revisions cannot replace
an approved draft. No general HTTP status setter is exposed.

The advocate supplies carrier and waybill and records dispatching/dispatched.
Admin completion requires an uploaded document on the same case, attaches it to
the shipment as proof of delivery, records delivered/completed and an admin
Action. It does not release funds; actual money movement is a later step.
Admin has API endpoints, no invented admin screens or permanent new accounts.

Export API and fixture modes sequentially. The mobile build clears Metro
transforms to avoid reusing a previous mode's inlined environment values.

Demo progression — architecture §2.12
-------------------------------------
DEMO_PROGRESSION=on|off. Unset means on only when ENVIRONMENT=dev and
NODE_ENV=development; anything else is off. On outside dev, or in production,
fails startup. When on, all four intervals are required in .env.local (whole
milliseconds; there are no built-in defaults):
  DEMO_ASSIGN_DELAY_MS=30000        paid -> seeded admin assigns the seeded advocate
  DEMO_DRAFT_START_DELAY_MS=30000   assigned -> seeded advocate accepts and starts
                                    (also: accepted, or changes requested, -> starts)
  DEMO_DRAFT_DONE_DELAY_MS=30000    in progress -> seeded advocate submits the draft
  DEMO_DISPATCH_DELAY_MS=30000      approved -> seeded advocate books a labelled
                                    SIMULATED COURIER shipment and confirms dispatch
  DEMO_SHIPMENT_STEP_MS=5000        dispatched -> seeded admin advances one courier
                                    milestone; after Out for Delivery, confirms
                                    delivery with a labelled SIMULATED proof
Client approval is never timed.
Each step signs in as demo-admin@ or demo-advocate@legalitt.invalid and calls
the real endpoint with a provenance ticket limited to that case and route; its
events record source=simulated. The timer reads cases and writes nothing. If no
advocate wrote a draft, the seeded advocate submits a placeholder marked
SIMULATED DRAFT. The progression acts on EVERY eligible case in DATABASE_URL.

Additional routes:
  POST /api/v1/cases/:id/start                     {} advocate begins drafting
  POST /api/v1/admin/cases/:id/shipment/status     {status} one step of
       pickup_booked -> picked_up -> in_transit -> out_for_delivery
Delivery confirmation (admin/cases/:id/deliver) accepts any in-flight milestone.
