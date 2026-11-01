Legalitt admin — chunks A–D (local only)

Node 22.22+ is required by React Router 8; the repo's Node 22.23.3 works.
From the repository root:
  pnpm install --frozen-lockfile
  pnpm --filter @legalitt/shared build
  pnpm --filter @legalitt/api build

Start the existing API using apps/api/.env.local and local Postgres 16:
  pnpm --filter @legalitt/api start
Then:
  pnpm --filter @legalitt/admin dev
Open http://127.0.0.1:5173

The local Vite proxy defaults to the API at http://127.0.0.1:3001. To use a
separate local API instance:
  ADMIN_API_TARGET=http://127.0.0.1:3006 pnpm --filter @legalitt/admin dev
No Cognito secrets or AWS credentials go into the frontend. Sign-in and token
refresh use the existing API and Cognito pool. Tokens are held in this tab's
sessionStorage, separately from the mobile app. There is no fixture auth.

The existing explicit seed command already creates demo-admin@legalitt.invalid
alongside the client and advocate accounts:
  pnpm --filter @legalitt/api db:seed-demo
It requires ENVIRONMENT=dev, non-production NODE_ENV, a dev-tagged Cognito
pool, and the configured Secrets Manager password. Never put that password in
a VITE_* variable, README, screenshot, or source file. Existing accounts need
no reseeding. Public registration cannot create an admin.

Build/typecheck:
  pnpm --filter @legalitt/admin build
  pnpm typecheck

Legal Notices, case detail, sign-in and initial advocate assignment are
available, together with delivery confirmation. Reassignment remains out of scope.
The existing progression and delivery simulators remain unchanged.

Admin API: GET /api/v1/admin/cases
  service=legal_notice, optional bucket, search, cursor, limit (1–100)
  Buckets: open, pending, in_progress, completed, closed.
  List and counters omit draft, submitted, payment_pending.
  Search matches client name, reference, or matter type (spaces accepted).
  Counts/total respect service + search; filtered_total also respects bucket.
  Cursor pagination is newest first, stable by created_at/id, tied to filters.
  Other services remain excluded by the existing Legal Notice data scope.
  AMOUNT is the base_amount_paise of the case's saved pricing_id; if absent,
  it remains blank. No current price is substituted into a historical case.

Assignment: GET /api/v1/admin/advocates lists active, approved advocates.
The picker shows practice areas, city and assigned open-case load (including
client review and transit; excluding declined and terminal cases). It calls
POST /api/v1/admin/cases/:id/assign. Eligibility is checked again on write.
An existing advocate cannot be replaced, including on a declined case.
Real assignment records the admin actor; stale timer requests cannot overwrite it.

Muted demo tags use documents.simulated and case_events.source = simulated.
Mixed-origin counts show how many documents are simulated. A case tag means
it has a simulated event, including payment, not necessarily simulated delivery.

Browser assignment check (creates one development case through real endpoints):
  node --env-file=apps/api/.env.local scripts/admin-assignment-smoke.cjs
Screenshots go to reports/admin-chunk-b.

No admin deployment configuration is supplied; the panel remains local only.

Document origins (project-owner decision, 1 Nov 2026): Client, Advocate,
Admin, Generated. Generated means the PDFs linked from drafts/document_id or
cases/notice_document_id; remaining uploaded documents are grouped by the
producer's role. Thus an admin-owned POD stays an Admin document even when
a simulator triggered it, and a courier receipt uploaded by an advocate is
an Advocate document. Pending/deleted uploads are not counted.

Repeatable browser checks (with local API 3006 and admin 5173 running):
  node --env-file=apps/api/.env.local scripts/admin-smoke.cjs
This reads the existing dev password from Secrets Manager in memory, signs in
through the UI, tests real role refusals, and writes screenshots to
reports/admin-chunk-a. It does not print or save passwords or tokens.

Case detail (chunk C): /legal-notices/:id, linked from each reference.
GET /api/v1/admin/cases/:id returns a Legal Notice only, admin role required.
It includes the full newest-first timeline, account and intake contacts,
origin-grouped documents, draft versions, payments by payer/purpose and shipment
milestones. Price is the saved pricing row; unconfirmed fees are labelled.
No absent value gets a label or empty evidence section. Assign and dispatched-case
delivery confirmation are the available writes.

Document preview uses GET /api/v1/admin/cases/documents/:id/preview, guarded as
admin and by existing case membership. Only PDF/PNG/JPEG get inline disposition;
other types download. All signed links expire; object keys stay server-side.
The ordinary document download endpoint is unchanged.

The guarded demo seed also creates Asha (Mumbai, Consumer Law, 0 cases), Kabir
(Jaipur, Family/Civil Law, 1), Meera (Pune, Property/Tenancy, 3), plus an awaiting
assignment and a sparse sample. Names/accounts are explicitly demo data. Loads
are actual case counts, not display constants. Cases are idempotently seeded
and have simulated events; repeat seeding never resets an operator's changes.

Run the detail browser check:
  node --env-file=apps/api/.env.local scripts/admin-detail-smoke.cjs
Screenshots/evidence: reports/admin-chunk-c. It signs in, follows a list link,
checks four advocate choices, waiting/drafting/delivered/sparse states, opens
real S3 files, refuses client tokens and asserts the detail UI performs no writes.

Delivery (chunk D): dispatched cases show Confirm delivery. The form uploads a
PDF/JPEG/PNG through presign -> S3 -> document completion, then calls the existing
POST /admin/cases/:id/deliver. Received by is optional (blank remains NULL);
delivery time is entered in the browser's local time zone and sent as ISO UTC.
The server locks the case and rejects duplicate/stale confirmations with 409.
Real confirmation records a real event and shipment; earlier demo history stays.
The human POD is not simulated. The timer and its mode flags are unchanged.

Apply the delivery receiver migration to the local API database before running.
The approved Dev Core CORS change permits direct browser uploads from exactly
http://127.0.0.1:5173 alongside http://localhost:8081. Production has no new CORS.

The header's Service fee comes from the case's saved pricing_id; Charged before
GST, GST paid and Total paid come from its captured service_fee payment. Additional
fees show the positive difference between that payment base and the saved fee.
No historical amount is replaced by the current price or recalculated GST.

Run the delivery browser check (creates a labelled development test case):
  node --env-file=apps/api/.env.local scripts/admin-delivery-smoke.cjs
Screenshots/evidence: reports/admin-chunk-d. Admin assignment, upload and delivery
confirmation use the UI; drafting/approval/dispatch use authenticated role APIs.
The manual PDF explicitly states it is a development test, not actual delivery.
