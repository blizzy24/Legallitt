# Legalitt — Backend & Cloud Architecture

Version 3.6 · 20 October 2026
Status: steps 0–5 complete. Step 6 is executable as written; §10 governs how.

This document is the specification for the backend phase. It is written to be
handed to a coding agent as the source of truth. Where something is undecided,
it says so explicitly rather than guessing — an agent that guesses here will
produce schema that has to be migrated later.

---

## 1. Context

The mobile app is built: Expo SDK 57, React Native 0.86, TypeScript, Expo
Router, 322 routes covering nine services across three roles. All data is
currently local fixtures. This phase replaces those fixtures with a real
backend.

**Roles**

| Role | Has UI today | Notes |
|---|---|---|
| Client | yes | Requests services, pays, reviews drafts, tracks |
| Advocate | yes | Accepts work, drafts, files, gets paid |
| Admin | **no** | Assigns advocates, releases escrow — designs pending |

**Services**

Legal Notice · FIR Draft · Legal Advice · Property Search Report ·
Document Forensic · High Court Representation · District Court Representation ·
Court Marriage · Courier (cross-cutting, used by three of the above)

---

## 2. Decisions

### 2.1 AWS-native, conventional API

The client owns and pays for the AWS account. Everything lives there from day
one. Handover is removing an IAM user, not transferring third-party accounts in
someone else's name.

Rejected: Supabase. Faster to build on, but it puts a load-bearing service
outside the client's AWS, billed to an account someone has to own personally.
With no hard deadline and robustness stated as the priority, that trade is not
worth taking.

### 2.2 Region: ap-south-1 (Mumbai)

Data residency for DPDP, and latency for an India-only user base. Bedrock is
available in-region.

### 2.3 Stack

| Concern | Choice | Why |
|---|---|---|
| API | Node 22 + TypeScript, **NestJS** | Shared types with the Expo app; structure suits a long-lived codebase |
| Compute | **ECS Fargate**, one service, behind an ALB | AI calls are long-running; one container keeps local dev honest. No Lambda cold starts, no 15-minute ceiling |
| Database | **RDS Postgres 16** | Single-AZ in dev, Multi-AZ before launch |
| ORM | **Prisma** | Migration tooling and generated types |
| Auth | **Cognito** user pool | Email/password native; phone OTP via custom auth flow |
| SMS | **MSG91 / Kaleyra / Gupshup** | Indian providers handle DLT properly. SNS does not, in practice |
| Files | **S3**, private, SSE-KMS, presigned URLs | Nothing public except marketing assets |
| CDN | **CloudFront** | Public assets only |
| Async | **SQS** + **EventBridge** | AI generation, notifications, courier polling, scheduled jobs |
| Secrets | **Secrets Manager** | No secrets in env files or the repo |
| AI | **Bedrock** | Client's AWS bill, in-region, no separate API key |
| Push | **Expo Push** | The app is Expo; simplest path that works |
| Observability | CloudWatch + **Sentry** | |
| IaC | **AWS CDK (TypeScript)** | Reproducible infra in the repo is most of what clean handover means |

### 2.4 Chat: no WebSockets in v1

Two low-volume threads (client↔advocate, support). REST plus polling on an
interval is robust and costs nothing to build. Revisit with API Gateway
WebSockets only if polling proves inadequate in practice.

### 2.5 Money is integer paise

Every amount is `BIGINT` paise. No floats anywhere. Display rounding to whole
rupees happens in the app, never in the database.

### 2.6 One AWS account, two stages

Confirmed: a single account. Environments are separated by VPC, resource
naming and separate RDS instances, defined as CDK stages `LegalittDev` and
`LegalittProd`.

This gives up blast-radius isolation, so compensate with IAM permission
boundaries preventing dev roles from touching prod resources, and tag every
resource with its environment from the first deploy.

### 2.7 Monorepo

```
apps/
  mobile/      the existing Expo app, moved unchanged
  api/         NestJS
packages/
  shared/      types, enums, Zod schemas — imported by both
infra/         CDK
docs/          this document
```

pnpm workspaces + Turborepo. The reason is `packages/shared`: both sides are
TypeScript, so a change to the case lifecycle cannot silently break a screen.

The restructure happens **before** any backend code exists. Moving the Expo app
later touches `app.json` paths, EAS config and the Vercel build settings, and
gets worse the longer it waits.

### 2.8 AI: Claude on Bedrock

Sonnet-tier for FIR and legal notice drafting, where instruction-following and
long context matter. Haiku-tier for case summaries and chat.

**Verify in the Bedrock console which Claude models are enabled in ap-south-1
before committing.** If the preferred model is not available in-region, Bedrock
routes through a cross-region inference profile and case data leaves India.
For an app holding legal matters and identity documents that is a DPDP
decision, not a convenience — prefer an in-region model even one tier down.

**Human approval is a state machine rule, not a UI rule.** AI output is written
to `drafts` with `generated_by = 'ai'` and is never sent anywhere by the system.
A case moves to `client_review` only through an explicit advocate action. The
designs already mandate this: 446 generates, 447 is the editable proforma the
advocate corrects, and 446's own copy states the AI never invents facts and
that the advocate must review before sending.

### 2.9 Phone OTP is simulated until DLT clears

Real SMS in India needs DLT registration, which has not been started. The
client needs the full sign-in flow working for demos in the meantime.

- **Email and password is the only real sign-in path.** Cognito handles it.
  Registration, verification and role assignment all happen here.
- **The phone OTP screens stay exactly as designed**, so the flow demos
  correctly. No SMS is sent and `123456` is accepted.
- **Phone sign-in creates nothing and looks nothing up.** The phone number
  entered is ignored. Verifying the fake code signs the user into a seeded
  demo account, so no role has to be inferred from a number.

**The demo accounts are real accounts.** `/auth/otp/verify` still returns real
Cognito tokens, exactly as §5 describes — it simply signs in a known user
instead of the one matching the phone number. There is no second kind of
session, and no screen behaves differently afterwards. A local-only session
would work today, while the app uses fixtures, and break on every screen once
those screens call the API.

**Two demo accounts are seeded**, because the client demos both sides:

| Account | Role | Email |
|---|---|---|
| Demo client | `client` | `demo-client@legalitt.invalid` |
| Demo advocate | `advocate` | `demo-advocate@legalitt.invalid` |

Create them with the Cognito admin API, email pre-verified, so no mail is sent.
The role picker already in onboarding chooses which one the demo path signs
into. Both also have passwords, so they double as test accounts for the normal
email path.
- A single flag, `PHONE_AUTH_MODE`, controls this: `demo` or `live`. Only
  `demo` is implemented now. `live` is built when DLT registration clears, and
  that is when sign-up by phone — including how the role is chosen — gets
  designed properly.
- `demo` must be **impossible to reach in production**. Gate it on the
  environment as well as the flag.

Google and other social sign-in are **out of scope**. Cognito supports them,
but the designs draw no such button, and adding one changes a screen the
client has already reviewed.

### 2.10 Deploy cheap services early, expensive ones late

AWS costs split sharply:

| Service | Cost at this size | When to deploy |
|---|---|---|
| Cognito | Free under 50k monthly users | Now |
| S3 | Negligible | Now |
| Secrets Manager | Cents | Now |
| RDS | Runs 24/7 | When the app needs a real backend |
| ALB | ~₹1,400/month idle | Same |
| ECS Fargate | Runs 24/7 | Same |

So the CDK is split into **two stacks per stage**:

- **Core** — Cognito, S3, Secrets Manager. Deployed early.
- **Compute** — VPC, RDS, ECS, ALB, SQS. Deployed only when the mobile app
  stops using fixtures and starts calling a hosted API.

Until then the API and Postgres run locally. All schema, queries and business
logic are built and tested on a laptop.

---

## 3. Architecture

```
Expo app (iOS / Android / web)
        │  HTTPS, JWT from Cognito
        ▼
      ALB  ──►  ECS Fargate: NestJS API  ──►  RDS Postgres
                        │
                        ├──►  S3 (documents, KMS)
                        ├──►  SQS ──► worker tasks (AI, notifications, courier)
                        ├──►  Bedrock (drafting, summaries, chat)
                        ├──►  Razorpay (orders, Route transfers, webhooks)
                        ├──►  DigiLocker / KYC provider
                        └──►  SMS provider, Expo Push
```

Two environments: `dev` and `prod`, separate accounts or at minimum separate
VPCs. Both defined in CDK.

---

## 4. Data model

### 4.1 The spine

Every screen in the app is a projection of two tables: **`cases`** (current
state) and **`case_events`** (how it got there). The timelines on the FIR
review, notice tracking, court screens and courier shipment are all the same
shape rendered differently.

Get these two right and the remaining tables are detail.

### 4.2 Shared lifecycle

One enum for all services, with per-service detail held elsewhere. Nine
separate state machines would become unmaintainable, and the flows are
genuinely the same shape.

```
draft
  → submitted
  → payment_pending
  → paid
  → assigning            (admin)
  → assigned
  → advocate_accepted | advocate_declined → assigning
  → in_progress
  → client_review
  → changes_requested → in_progress
  → approved
  → dispatching
  → dispatched
  → completed
  → cancelled | refunded
```

`cases.sub_status` (text, nullable) carries service-specific position — e.g.
`awaiting_court_fee`, `hearing_scheduled`, `sample_received`. Validated per
service in application code, not by a database constraint.

**Lifecycle status is not the same as the UI bucket.** The mobile app already
has `'active' | 'pending' | 'closed'`, which drives tabs, filters and counts.
That is a display grouping, not a state. Both exist, under different names:

- `CaseStatus` — the lifecycle enum above. Canonical. Lives in
  `packages/shared`, mirrored by the Prisma enum.
- `CaseBucket` — `'active' | 'pending' | 'closed'`, for display only. Also in
  `packages/shared`.

One function in `packages/shared` converts between them, and it is the only
place the rule is written:

```ts
export function bucketFor(status: CaseStatus): CaseBucket {
  // pending  — nothing is being worked on; someone owes the next action:
  //            draft, submitted, payment_pending, assigning, assigned,
  //            advocate_declined, client_review
  // active   — work is under way: paid, advocate_accepted, in_progress,
  //            changes_requested, approved, dispatching, dispatched
  // closed   — finished: completed, cancelled, refunded
}
```

All 17 lifecycle values are covered above. The function must be exhaustive —
add a compile-time check so a future status cannot be added without being
given a bucket.

### Cancellation and refunds

The dividing line is whether an advocate has started work.

**Client may cancel, on their own:**
`draft`, `submitted`, `payment_pending`, `assigning`, `assigned`,
`advocate_declined`

Nothing has been done for them yet, so there is nothing to dispute.

**Admin only may cancel:**
`paid`, `advocate_accepted`, `in_progress`, `client_review`,
`changes_requested`, `approved`

An advocate has done work and money has usually moved. If the client wants out
here, they raise it through support and admin decides. Do not add a
"cancellation requested" status — it is not in the enum, and this is a
conversation, not a state.

**Nobody may cancel:**
`dispatching`, `dispatched`, `completed`, `cancelled`, `refunded`

The notice has been sent, the FIR filed, the matter listed. It cannot be
unsent.

**Refunds are admin-only, and only from:**
- `cancelled` — the normal path, when money had already been taken
- `completed` — a dispute resolved in the client's favour after the fact

There is no direct route from a working state to `refunded`. Cancel first,
then refund, so both the decision and the money are recorded separately.

Cancelling a case that was paid leaves money held with nothing delivered.
That is deliberate: the refund is a separate, explicit admin act. Step 9's
reconciliation reports cases sitting in `cancelled` with a captured payment
and no refund.

In step 5 these transitions only change status and write events. The actual
money movement arrives with payments in step 8.

The mapping is one-way. A bucket cannot be turned back into a lifecycle
status, because several statuses share a bucket.

Existing fixtures keep their bucket values for now. They gain real lifecycle
values in step 5, when cases come from the database rather than from fixtures.
Do not rewrite the fixtures during step 1.

### 4.3 Tables

```sql
-- ---------- identity ----------

CREATE TYPE user_role AS ENUM ('client', 'advocate', 'admin');

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub     TEXT UNIQUE NOT NULL,
  role            user_role NOT NULL,
  full_name       TEXT NOT NULL,
  email           CITEXT UNIQUE,
  phone           TEXT UNIQUE,              -- E.164
  phone_verified  BOOLEAN NOT NULL DEFAULT false,
  email_verified  BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'active',  -- active | suspended | deleted
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE verification_status AS ENUM
  ('not_started','in_review','approved','rejected','needs_update');

CREATE TABLE advocate_profiles (
  user_id                   UUID PRIMARY KEY REFERENCES users(id),
  bar_council_state         TEXT,
  bar_council_number        TEXT,
  enrolment_year            INT,
  practice_areas            TEXT[] NOT NULL DEFAULT '{}',
  languages                 TEXT[] NOT NULL DEFAULT '{}',
  courts                    TEXT[] NOT NULL DEFAULT '{}',
  city                      TEXT,
  state                     TEXT,
  years_experience          INT,
  bio                       TEXT,
  consultation_fee_paise    BIGINT,
  verification              verification_status NOT NULL DEFAULT 'not_started',
  verified_at               TIMESTAMPTZ,
  rating_avg                NUMERIC(2,1),
  rating_count              INT NOT NULL DEFAULT 0,
  -- Razorpay Route: required before this advocate can be paid. See §7.2
  rzp_linked_account_id     TEXT,
  rzp_account_status        TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- services and pricing ----------

CREATE TABLE services (
  code        TEXT PRIMARY KEY,        -- 'legal_notice', 'fir_draft', ...
  name        TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  config      JSONB NOT NULL DEFAULT '{}'
);

-- Pricing is versioned and flagged, because several figures are still
-- unconfirmed by the client. New prices are inserted, never updated in place.
CREATE TABLE service_pricing (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code       TEXT NOT NULL REFERENCES services(code),
  tier               TEXT,                -- 'ordinary' | 'urgent' | NULL
  variant            TEXT,                -- e.g. 'chat' | 'audio' | 'video'
  base_amount_paise  BIGINT NOT NULL,
  gst_bps            INT NOT NULL DEFAULT 1800,     -- 18%, exclusive
  confirmed          BOOLEAN NOT NULL DEFAULT false, -- client has confirmed
  source_note        TEXT,                -- e.g. 'design/343'
  effective_from     TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to       TIMESTAMPTZ
);

-- Commission varies by service (client confirmed 2026-10-18).
CREATE TABLE commission_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_code    TEXT NOT NULL REFERENCES services(code),
  rate_bps        INT NOT NULL,            -- 1000 = 10%
  confirmed       BOOLEAN NOT NULL DEFAULT false,
  effective_from  TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_to    TIMESTAMPTZ
);

-- ---------- the spine ----------

CREATE TYPE case_status AS ENUM (
  'draft','submitted','payment_pending','paid','assigning','assigned',
  'advocate_accepted','advocate_declined','in_progress','client_review',
  'changes_requested','approved','dispatching','dispatched','completed',
  'cancelled','refunded'
);

CREATE TABLE cases (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference      TEXT UNIQUE NOT NULL,     -- 'LN-2026-1048', 'DC-2026-1048'
  service_code   TEXT NOT NULL REFERENCES services(code),
  client_id      UUID NOT NULL REFERENCES users(id),
  advocate_id    UUID REFERENCES users(id),
  status         case_status NOT NULL DEFAULT 'draft',
  sub_status     TEXT,
  tier           TEXT,
  title          TEXT,
  details        JSONB NOT NULL DEFAULT '{}',   -- service-specific intake
  pricing_id     UUID REFERENCES service_pricing(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ
);

CREATE INDEX ON cases (client_id, status);
CREATE INDEX ON cases (advocate_id, status);
CREATE INDEX ON cases (service_code, status);

-- Append-only. Source of every timeline in the app, and the audit trail.
CREATE TABLE case_events (
  id           BIGSERIAL PRIMARY KEY,
  case_id      UUID NOT NULL REFERENCES cases(id),
  type         TEXT NOT NULL,          -- 'draft_created', 'sent_to_client', ...
  actor_id     UUID REFERENCES users(id),
  actor_role   user_role,
  from_status  case_status,
  to_status    case_status,
  payload      JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON case_events (case_id, created_at);

-- Other parties: FIR accused and witnesses, opposing party in court matters.
CREATE TABLE case_parties (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id   UUID NOT NULL REFERENCES cases(id),
  kind      TEXT NOT NULL,      -- 'accused' | 'witness' | 'opposing' | 'other'
  name      TEXT NOT NULL,
  details   JSONB NOT NULL DEFAULT '{}'
);

-- ---------- documents and drafts ----------

CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       UUID REFERENCES cases(id),
  owner_id      UUID NOT NULL REFERENCES users(id),
  kind          TEXT NOT NULL,     -- 'complaint','id_proof','court_order',...
  filename      TEXT NOT NULL,
  s3_key        TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    BIGINT NOT NULL,
  page_count    INT,               -- drives per-page charges
  status        TEXT NOT NULL DEFAULT 'uploaded',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Versioned. Design 447 draws 'v2.1', so versioning is a product requirement.
CREATE TABLE drafts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID NOT NULL REFERENCES cases(id),
  kind        TEXT NOT NULL,         -- 'fir_proforma' | 'legal_notice' | ...
  version     INT NOT NULL,
  content     JSONB NOT NULL,        -- structured, not a blob of HTML
  generated_by TEXT,                 -- 'ai' | 'manual'
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (case_id, kind, version)
);

CREATE TABLE draft_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id    UUID NOT NULL REFERENCES drafts(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  decision    TEXT NOT NULL,         -- 'approved' | 'changes_requested'
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- messaging ----------

CREATE TABLE message_threads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID REFERENCES cases(id),
  kind        TEXT NOT NULL,         -- 'client_advocate' | 'support'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id     UUID NOT NULL REFERENCES message_threads(id),
  sender_id     UUID NOT NULL REFERENCES users(id),
  body          TEXT,
  document_id   UUID REFERENCES documents(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at       TIMESTAMPTZ
);

CREATE INDEX ON messages (thread_id, created_at);

-- ---------- money ----------

CREATE TYPE payment_status AS ENUM
  ('created','pending','captured','failed','refunded');

CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id             UUID NOT NULL REFERENCES cases(id),
  purpose             TEXT NOT NULL,   -- 'service_fee','court_fee',
                                       -- 'process_fee','courier','follow_up'
  base_amount_paise   BIGINT NOT NULL,
  gst_paise           BIGINT NOT NULL,
  total_paise         BIGINT NOT NULL,
  status              payment_status NOT NULL DEFAULT 'created',
  rzp_order_id        TEXT UNIQUE,
  rzp_payment_id      TEXT UNIQUE,
  idempotency_key     TEXT UNIQUE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  captured_at         TIMESTAMPTZ
);

CREATE TYPE payout_status AS ENUM
  ('pending','released','processing','paid','failed','reversed');

CREATE TABLE payouts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id              UUID NOT NULL REFERENCES cases(id),
  advocate_id          UUID NOT NULL REFERENCES users(id),
  payment_id           UUID NOT NULL REFERENCES payments(id),
  gross_paise          BIGINT NOT NULL,
  commission_rate_bps  INT NOT NULL,
  commission_paise     BIGINT NOT NULL,
  net_paise            BIGINT NOT NULL,
  status               payout_status NOT NULL DEFAULT 'pending',
  rzp_transfer_id      TEXT,
  utr                  TEXT,
  released_by          UUID REFERENCES users(id),   -- admin
  released_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Double-entry ledger. Not optional: the client's model holds other people's
-- money, and "what is the balance and why" must be answerable from rows.
CREATE TABLE ledger_entries (
  id            BIGSERIAL PRIMARY KEY,
  account       TEXT NOT NULL,     -- 'escrow','platform_commission',
                                   -- 'advocate:<uuid>','gateway'
  case_id       UUID REFERENCES cases(id),
  payment_id    UUID REFERENCES payments(id),
  payout_id     UUID REFERENCES payouts(id),
  direction     TEXT NOT NULL,     -- 'debit' | 'credit'
  amount_paise  BIGINT NOT NULL CHECK (amount_paise > 0),
  memo          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- fulfilment ----------

CREATE TABLE shipments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES cases(id),
  direction       TEXT NOT NULL,     -- 'to_recipient' | 'to_advocate'
  carrier         TEXT,              -- 'Blue Dart'
  waybill         TEXT,
  status          TEXT NOT NULL DEFAULT 'booked',
  recipient       JSONB NOT NULL DEFAULT '{}',
  booked_at       TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  pod_document_id UUID REFERENCES documents(id)
);

CREATE TABLE hearings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       UUID NOT NULL REFERENCES cases(id),
  court         TEXT,
  scheduled_at  TIMESTAMPTZ,
  purpose       TEXT,
  outcome       TEXT,
  attendance    TEXT,
  next_date     TIMESTAMPTZ,
  notes         TEXT,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE consultations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id        UUID NOT NULL REFERENCES cases(id),
  mode           TEXT NOT NULL,      -- 'chat' | 'audio' | 'video'
  scheduled_at   TIMESTAMPTZ NOT NULL,
  duration_min   INT NOT NULL,
  room_id        TEXT,
  status         TEXT NOT NULL DEFAULT 'scheduled',
  rating         INT,
  review         TEXT
);

-- ---------- KYC. Read §7.1 before implementing. ----------

CREATE TABLE kyc_verifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  method            TEXT NOT NULL,   -- 'digilocker' | 'offline_xml'
  provider          TEXT,
  provider_ref      TEXT,
  verified_name     TEXT,
  verified_address  TEXT,
  id_last4          TEXT,            -- NEVER the full Aadhaar number
  verified_at       TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- notifications ----------

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  case_id     UUID REFERENCES cases(id),
  kind        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB NOT NULL DEFAULT '{}',
  channels    TEXT[] NOT NULL DEFAULT '{}',  -- 'push','sms','email','in_app'
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- admin ----------

CREATE TABLE admin_actions (
  id           BIGSERIAL PRIMARY KEY,
  admin_id     UUID NOT NULL REFERENCES users(id),
  action       TEXT NOT NULL,       -- 'assign_advocate','release_payout',...
  subject_type TEXT NOT NULL,
  subject_id   UUID NOT NULL,
  payload      JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4.4 Why pricing and commission are versioned tables

Several figures are still unconfirmed: District Court prices, the Legal Advice
tables, the FIR base fee, the repeated ₹34,999 screen, and design 279's ₹1,377.
Commission varies per service and the rates have not arrived.

Holding these as rows with `confirmed` and `effective_from` means the client's
answers land as inserts, not migrations, and a case keeps the price it was
quoted at even after rates change. **Do not hard-code any amount in
application code.**

---

## 5. API surface

Conventions: `/api/v1`, JWT bearer from Cognito, cursor pagination,
`Idempotency-Key` required on anything that moves money, all amounts in paise
as integers.

### Auth
```
POST   /auth/otp/request              { phone }        # demo: §2.9
POST   /auth/otp/verify               { phone, code } → tokens   # demo: §2.9
POST   /auth/register                 { email, password, name, role }
POST   /auth/login                    { email, password }
POST   /auth/refresh
GET    /me
PATCH  /me
```

### Services and pricing
```
GET    /services
GET    /services/:code                → includes current pricing tiers
```

### Cases — the bulk of the app
```
POST   /cases                         { service_code, tier, details }
GET    /cases                         ?role=client|advocate &status=
GET    /cases/:id                     → case + events + documents + drafts
PATCH  /cases/:id                     intake updates while in draft
POST   /cases/:id/submit
GET    /cases/:id/events              → the timeline
POST   /cases/:id/cancel
```

### Advocate actions
```
GET    /advocate/requests                    assigned, awaiting response
POST   /cases/:id/accept
POST   /cases/:id/decline                    { reason }
POST   /cases/:id/drafts                     { kind, content, generated_by }
GET    /cases/:id/drafts
POST   /cases/:id/drafts/:draftId/send       → status: client_review
POST   /cases/:id/hearings
PATCH  /cases/:id/hearings/:hearingId
```

### Client review
```
POST   /cases/:id/drafts/:draftId/approve
POST   /cases/:id/drafts/:draftId/request-changes   { comment }
```

### Documents
```
POST   /documents/presign             { case_id, kind, filename, mime }
POST   /documents/:id/complete
GET    /documents/:id/url             → short-lived presigned GET
DELETE /documents/:id
```

### Payments
```
POST   /payments                      { case_id, purpose }  → razorpay order
POST   /payments/webhook              razorpay → verify signature, idempotent
GET    /cases/:id/payments
```

### Payouts and wallet
```
GET    /advocate/wallet               balance, pending, lifetime
GET    /advocate/payouts
POST   /admin/payouts/:id/release     admin only
```

### Messaging
```
GET    /cases/:id/thread
GET    /threads/:id/messages          ?after=cursor     (polling)
POST   /threads/:id/messages
POST   /threads/:id/read
```

### AI (Bedrock)
```
POST   /ai/fir-draft                  { case_id }        → queued job
POST   /ai/case-summary               { case_id }
POST   /ai/chat                       { case_id, message }
GET    /ai/jobs/:id
```

### KYC
```
POST   /kyc/digilocker/start          → redirect URL
POST   /kyc/digilocker/callback
GET    /kyc/status
```

### Admin
```
GET    /admin/cases                   ?status=assigning
POST   /admin/cases/:id/assign        { advocate_id }
GET    /admin/advocates               ?verification=in_review
POST   /admin/advocates/:id/verify    { decision, reason }
GET    /admin/payouts                 ?status=pending
```

### Notifications
```
GET    /notifications
POST   /notifications/:id/read
POST   /devices                       register Expo push token
```

---

## 6. Build order

Each step ends with something demonstrable. Steps 0–3 are specified in full
below so they can be executed without further instruction. Steps 4 onwards are
summarised; each will be expanded before it is started.

### Step 0 — Monorepo restructure

Convert the repository to the layout in §2.7 using pnpm workspaces and
Turborepo.

- Move the existing Expo app to `apps/mobile` **unchanged**. Update `app.json`
  asset paths, EAS configuration, and anything else referencing the old root.
- Update the Vercel project's root directory and build command.
- Create `packages/shared`, `apps/api` and `infra` as empty workspaces with
  their own `package.json` and `tsconfig.json`.
- Root `tsconfig` with path aliases so `@legalitt/shared` resolves.

**Gate — all three must hold before step 1 begins:**

1. `apps/mobile` builds.
2. The Vercel deployment succeeds.
3. The mobile smoke test passes at 322 routes.

Report every file you had to change for the move. Commit:
`chore: convert to pnpm monorepo`

### Step 1 — Shared types

In `packages/shared`, define from §4:

- the case lifecycle enum (§4.2)
- service codes for the nine services (§1)
- Zod schemas for the core entities: user, advocate profile, case, case event,
  document, draft, payment, payout

Then change `apps/mobile` to import the lifecycle enum from
`@legalitt/shared` instead of declaring its own.

**`packages/shared` is canonical for the lifecycle enum.** The Prisma enum in
step 3 mirrors it, and a test asserts the two lists are identical — otherwise
they drift the first time a status is added.

Commit: `feat(shared): lifecycle enum, service codes, entity schemas`

### Step 2 — CDK skeleton

In `infra`, one account, two stages named `LegalittDev` and `LegalittProd`
(§2.6), in `ap-south-1`:

- VPC with public and private subnets
- RDS Postgres 16, single-AZ in dev
- ECS Fargate service behind an ALB
- S3 bucket, private, SSE-KMS
- Secrets Manager secret for database credentials
- SQS queue
- IAM permission boundary preventing dev roles touching prod resources
- Every resource tagged with its environment

**`cdk synth` only. Do not deploy.** Report the synth output summary.

Commit: `feat(infra): cdk skeleton, dev and prod stages`

### Step 3 — Schema and migrations

In `apps/api`: NestJS, Prisma, a `/health` endpoint.

- Transcribe the DDL in §4.3 into `schema.prisma`. The DDL is authoritative —
  if a Prisma limitation prevents an exact translation, say so rather than
  changing the shape.
- Generate the initial migration.
- Seed script loading the nine services, plus every price and commission rate
  currently known, each row flagged `confirmed = false` unless the client has
  confirmed it. Cite the design number in `source_note`.
- The enum parity test from step 1.

Commit: `feat(api): prisma schema, migrations, seed`

### Step 4 — Deploy Core, then build auth

Split into two halves. The first puts the cheap AWS services in the account;
the second builds sign-in against them.

**4a — Split the stacks and deploy Core to dev.**

Restructure `infra` into two stacks per stage, per §2.10:

- `LegalittDev-Core` — Cognito user pool and client, S3 bucket (private,
  SSE-KMS), Secrets Manager
- `LegalittDev-Compute` — VPC, RDS, ECS, ALB, SQS

The Cognito user pool needs:
- email and password sign-in, email verification on
- a `role` custom attribute: `client` | `advocate` | `admin`
- two seeded demo users per §2.9, created with the admin API and
  email pre-verified, one `client` and one `advocate`
- no phone number is stored on them and no SMS configuration is needed

Then `cdk deploy LegalittDev-Core` only. **Do not deploy Compute.**

Report the user pool id, client id and bucket name. Write them to Secrets
Manager or `.env`, never into the repo.

Commit: `feat(infra): split core and compute stacks`

**4b — Auth in the API and the app.**

- `apps/api`: Cognito JWT verification, a guard reading the `role` claim,
  `/auth/*` endpoints per §5, `/me`
- `apps/mobile`: replace the role picker with real sign-in. Email and password
  works for real; the OTP screens behave as designed and sign into the seeded demo account per §2.9
- Role drives which tab bar and screens load, as the designs already split
  client and advocate

The 322 routes must still work. A signed-in client must not be able to reach
advocate screens.

Commit: `feat(auth): cognito sign-in, role guards, app integration`

### Step 5 — Cases and events

API only. The mobile app still uses fixtures after this step; it is connected
in step 7.

Build against **Legal Notice only**. The other eight services reuse the same
shape and are added in step 9 — building them now would multiply any mistake
by nine.

**5a — The state machine.**

One service class owns every status change. Nothing else writes
`cases.status`, ever.

- It knows which transitions are legal (§4.2) and rejects the rest.
- **Every status change writes a `case_events` row in the same database
  transaction.** A status that changed without an event, or an event without
  the status change, is a bug. Enforce it in code, not by convention.
- The event records who did it, what changed, and when.

This matters because every timeline in the app is read from `case_events`. If
events can be missed, timelines silently go wrong and nothing fails loudly.

**5b — Case endpoints.**

Per §5: create, read one, list, update while in draft, submit, read events,
cancel.

- References follow the drawn format — `LN-2026-1048`. Generate them; do not
  accept them from the client.
- Service-specific intake goes in `cases.details` as JSON, validated against
  the Zod schema for that service from `packages/shared`.

**5c — Who can see what.** Get this right now; retrofitting it is painful.

- A client sees only cases where they are the client.
- An advocate sees only cases assigned to them.
- An admin sees all.
- Enforce it in the data layer, not in each endpoint. One missed check is a
  privacy breach involving other people's legal matters.
- Write a test that proves one client cannot read another client's case.

**5d — Tests.**

- Every legal transition, and a rejection for an illegal one.
- An event row exists for every status change.
- The authorisation tests above.

Commit: `feat(api): cases, events and state machine`

### Step 6 — Documents

Uploads and downloads through S3. API only; the app is connected in step 7.

Files never pass through the API. The app uploads straight to S3 using a
short-lived signed URL, and downloads the same way. The API only issues URLs
and records what exists.

**6a — Upload.**

1. `POST /documents/presign` — the app says which case, what kind of document,
   the filename and type. The API checks the caller is allowed to add a
   document to that case, creates a `documents` row with status `pending`, and
   returns a signed upload URL valid for a few minutes.
2. The app uploads the file directly to S3.
3. `POST /documents/:id/complete` — the API confirms with S3 that the object
   actually exists, reads its real size and type from S3, and sets the row to
   `uploaded`.

**Never trust what the app says about the file.** Size and type come from S3
after the upload, not from the request. A client that lies about either should
not be able to store a 2 GB file or an executable.

- S3 keys are `cases/<caseId>/<documentId>/<filename>`. The document id makes
  the key unique; the filename is kept only for display. Do not build keys
  from user input alone.
- Limits: 25 MB per file, and only the types the flows actually use — PDF,
  JPEG, PNG. Reject the rest.
- A `pending` row with no object after an hour is abandoned. Delete it on a
  schedule.

**6b — Page counting.**

Several flows charge per page above a free allowance — Legal Advice and FIR
both draw ₹25 per page beyond 25. Count pages for PDFs on completion and store
it in `documents.page_count`. Images count as one page.

This is needed before pricing can be calculated in step 8, so do it now rather
than retrofitting.

Page counting applies to **every** document, identity files included. Reading
how many pages a PDF has is reading its structure, not its content — it is not
the parsing that 6d forbids.

**6c — Download.**

`GET /documents/:id/url` returns a signed URL valid for a few minutes.

Authorisation is the same rule as cases in §5c: only the client who owns the
case, the advocate assigned to it, and admin. Test that an unrelated user gets
a refusal, not a URL.

**6d — Identity documents.**

Flows such as FIR require identity evidence attached to the case. §7.1 forbids
storing Aadhaar numbers, and an unmasked Aadhaar image contains the number, so
storing one would breach it.

The client's own design already points the right way: 447 draws
`Aadhaar Card (XXXX-XXXX-4812)` — a **masked** Aadhaar, which UIDAI provides
as a download for exactly this purpose.

Rules:

- **Do not require Aadhaar.** The ID proof upload accepts PAN, passport,
  driving licence or voter ID. Offer those first.
- **If Aadhaar is used, masked only.** The upload screen must say so. The
  system cannot enforce it technically, so the wording carries the weight.
- **Never extract content from an identity file** — no OCR, no text
  extraction, no reading fields. Structural metadata such as page count and
  file size is not content and is fine to read (see 6b).
- Mark these documents `kind = 'id_proof'` so stricter retention and access
  rules can be applied later.
- Identity *verification* is DigiLocker, never an uploaded image. An uploaded
  ID card is evidence on a case, not a KYC record.

**Client question:** which identity documents are acceptable for each flow is
the client's decision, not ours. Added to §8.

Commit: `feat(api): document upload, download and page counting`

### Steps 7 onwards — summary only

Each is expanded in this document before it starts.
5. **Cases and events** — create, submit, read, timeline. One service only.
6. **Documents** — presigned upload and download.
7. **Legal Notice end to end** — the most complete flow in the app. Intake →
   payment → assignment → draft → client review → approval → dispatch →
   delivered. When this works, the pattern is proven.
8. **Payments** — Razorpay orders, webhook, ledger entries. Test mode.
9. **Payouts** — Route transfers, commission, admin release, wallet.
10. **Remaining services** — each is now mostly intake shape plus sub-states.
11. **AI** — Bedrock for FIR drafting, case summaries, chat.
12. **Notifications** — push, then SMS once DLT clears.
13. **Admin API** — then the admin UI, as a separately priced phase.

---

## 7. Compliance — read before writing schema

### 7.1 Aadhaar: do not store the number

The app collects Aadhaar in seven places and design 447 displays
`Aadhaar Card (XXXX-XXXX-4812)`. Under the Aadhaar Act, storing Aadhaar numbers
is restricted to authorised entities; a legal services marketplace is not one.

This covers uploaded card images too: an unmasked Aadhaar image contains the
number, so storing one stores the number. See §6d for how identity documents
attached to a case are handled.

**Required approach:** DigiLocker or offline Aadhaar e-KYC. The provider
returns a signed XML with name, address, photo and a reference number — not the
Aadhaar number. Store that, plus the last four digits for display only. The
`kyc_verifications` table above is shaped for this.

Never store: full Aadhaar numbers, raw Aadhaar card images, Aadhaar in any
free-text or JSONB field. Add a CI check for twelve-digit patterns in document
metadata if practical.

### 7.2 Razorpay Route: advocates need linked accounts

Route pays out to *linked accounts*. Each advocate must complete Razorpay's own
KYC and provide bank details before any money can reach them.

**This flow does not exist in the designs.** The advocate verification screens
(233–260) collect bar council credentials for the platform, not banking details
for the gateway. It is on the critical path for paying anyone, and it needs
designs. Raised with the client; still open.

### 7.3 Escrow

Confirmed direction: Razorpay Route. The platform must not hold client funds in
its own account for payout to advocates — under RBI's Payment Aggregator rules
that is not permissible. Money sits with the gateway; the admin release
triggers a transfer, it does not move money the platform is holding.

The `ledger_entries` table records this as bookkeeping, not custody.

### 7.4 DPDP Act

Identity documents, case files and legal matters for Indian users. Engineering
side: ap-south-1, encryption at rest, presigned URLs with short expiry, a
retention policy, deletion on request. Policy side — consent text, retention
periods, breach process — is the client's decision and should be requested in
writing.

### 7.5 SMS and DLT

Transactional SMS in India requires DLT registration: entity, sender ID, and
every template pre-approved. One to two weeks, longer on rejection. Start it
before the backend needs it.

---

## 8. Open questions — blocked on the client

| # | Question | Blocks |
|---|---|---|
| 1 | Commission rate per service | Payouts, wallet, advocate screens |
| 2 | District Court prices (338 draws ₹XX,XXX; 343 draws ₹25,000/₹35,000) | Pricing seed |
| 3 | Legal Advice price table — two contradictory tables, plus an experience axis | Pricing seed |
| 4 | FIR base fee — nothing drawn; app shows a chosen ₹1,000 placeholder | Pricing seed |
| 5 | Design 279's ₹1,377 — template or real | Pricing seed |
| 6 | The ₹34,999 / ₹379 / ₹40,680 screen — template or real | Pricing seed |
| 7 | Advocate Route onboarding — designs needed | Payouts |
| 8 | Admin panel — scope, designs, price, timeline | Assignment, release |
| 9 | Whose profile is design 433 ("Adv. Rahul Sharma", the client's own name) | Profile screens |
| 10 | FIR Approved and Changes states — still not supplied | FIR review |
| 11 | Design 348 — the supplied file is a 1× copy of 381 | Token values |
| 12 | Heading font | Typography |
| 13 | DPDP consent text and retention periods | Compliance |
| 14 | Is any AI output client-facing without an advocate between? Check the AI chat screens (160–182, 170) | AI gating |
| 15 | Which identity documents are accepted for each flow? Aadhaar must be masked if used at all (§6d) | ID proof uploads |

Items 1 to 6 all touch `service_pricing` and `commission_rates`. The schema is
built so they can land as rows whenever they arrive, without migration.

---

## 9. Decisions taken

Recorded here so the document is the single source of truth and nothing below
is re-litigated mid-build.

| Decision | Resolution | Date |
|---|---|---|
| Scope and price for this phase | Agreed with the client | 2026-10-19 |
| AWS accounts | One account, two CDK stages (§2.6) | 2026-10-19 |
| Repo layout | Monorepo, pnpm + Turborepo (§2.7) | 2026-10-19 |
| Courier integration | **Manual in v1.** Admin enters carrier and waybill; the `shipments` table is unchanged when real integration lands later | 2026-10-19 |
| AI model | Claude on Bedrock, Sonnet-tier for drafting, Haiku-tier for summaries and chat, subject to in-region availability (§2.8) | 2026-10-19 |
| AI human approval | Enforced in the state machine, not the UI. Screens already exist — 446 → 447 → advocate review → client (§2.8) | 2026-10-19 |

The one thing still to check is item 14 in §8: whether any AI surface reaches a
client without an advocate in between. If one does, it needs either an advocate
gate or explicit framing that it is not legal advice.

---

## 10. Working agreement

This document is the only specification. Any prompt that starts work on it
should say which steps of §6 to execute and nothing more. If a prompt contains
instructions that contradict this document, **stop and report the
contradiction** — do not choose between them.

- **One commit per step**, with the message given in §6.
- **Gates are gates.** Where a step states a gate, do not begin the next step
  until every condition holds. Report the gate result explicitly.
- **Stop at the last step named in the prompt.** Do not continue into the next
  one because it looks small.
- **Do not deploy to AWS** until a prompt explicitly says to.
- **Do not invent values.** Prices, names, legal text, file names and message
  content come from the designs or from the client. Where something is
  unknown, leave it absent and list it, rather than filling it in.
- **`tsc` clean across every workspace** at the end of each step.
- **The mobile smoke test must still pass at 322 routes** after any step that
  touches `apps/mobile`.
- **Report, per step:** what you changed, what you had to decide that this
  document did not cover, and anything you left undone.
