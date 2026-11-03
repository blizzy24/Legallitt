# Legalitt — Backend & Cloud Architecture

Version 6.6 · 1 November 2026
Status: steps 0–7 complete for Legal Notice. The screen-rework (§1a) is in
flight. §2.11 now governs every capability that is not yet real.

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

## 1a. The designs are the specification

The frontend is the structure of this application. The client designed it
deliberately, screen by screen, and the flows encode how he intends the
business to work. It is not decoration laid over a backend — it is the
specification the backend serves.

Consequences, which apply to every step in this document:

- **Never build a second version of a screen.** If a screen needs real data,
  the same screen takes real data. Two implementations of one screen is a
  defect, not a strategy, however it is justified.
- **The backend adapts to the designs**, not the reverse. If the data model
  makes a drawn screen awkward, change the model.
- **Where this document and the designs disagree, the designs win** — report
  the conflict rather than resolving it silently.
- **Do not invent screens, fields, labels, prices or copy.** If something is
  needed and not drawn, stop and ask.

A change the client can see is a change the client must have asked for.

### 1a.1 Precedence, and reading intent

The Figma files were drawn with a view of what the product does and what
belongs in it. **They outrank every other source**, including the admin panel
the previous team built (`ADMIN-PANEL-SURVEY.md`). Where the old panel and the
designs disagree, the designs win — the old panel reflects a different vision
of the product and is a visual reference only.

Read the designs for **what they mean, not only what they show**. A drawn
screen expresses an intent about how the business works; serve that intent.
Design 22 drawing ₹999 urgent and ₹699 ordinary is not a label to copy, it is
a decision about how Legal Notice is priced and tiered.

This does not loosen the last rule above. Reading intent means inferring from
what *is* drawn; it is never licence to invent what is not. Where the intent is
genuinely unclear, still stop and ask.

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

### 2.8 AI: task-specific models behind one port

Sonnet-tier for FIR and legal notice drafting, where instruction-following and
long context matter. Haiku-tier for case summaries and chat.

The AI port exposes subject lines, demand options and notice drafting. The
project owner's 2 November 2026 decision configures all three Bedrock tasks to
`in.anthropic.claude-haiku-4-5-20251001-v1:0`. Each remains independently
configurable through `BEDROCK_SUBJECT_MODEL_ID`, `BEDROCK_DEMANDS_MODEL_ID` and
`BEDROCK_NOTICE_MODEL_ID`. Once access is granted, notice drafting can switch to
`in.anthropic.claude-sonnet-5` by configuration alone. Summary/chat models and
other services are outside this chunk.

**The requirement is India residency, not single-region inference.** The API
calls the Mumbai runtime endpoint. Direct foundation IDs and the three audited
India-only Claude profiles (Haiku 4.5, Sonnet 5, Opus 5) are allowed; APAC/global,
unreviewed profiles and profile ARNs are rejected. GetInferenceProfile confirms
these profiles route only to Mumbai and Hyderabad. No automatic model/provider
fallback occurs. The earlier no-profile constraint is superseded.

A real Mumbai invocation of Haiku 4.5 succeeded on 2 November 2026. Sonnet 5
returned AccessDeniedException: unavailable for this account, with instructions
to contact AWS Sales at https://aws.amazon.com/contact-us/sales-support/.
The client/account owner must request access; the agent does not accept model
agreements or change account access. Bedrock stays Haiku-only until that is
granted and verified. `AI_MODE` still defaults to `simulated`; Gemini remains
the development-only real provider. Evidence: `reports/bedrock-india-invocations-2026-11-02/`.

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

**Sign-in order.** Nobody is forced to sign in before seeing the app:

```
onboarding → role selection → guest home → banner → sign in or sign up
```

- Role is chosen **before** the guest home, and decides which guest home is
  shown and which app the user lands in afterwards.
- The guest home is browsable without an account. The banner at the top is
  the only prompt to sign in.
- Sign-in and sign-up are reached from that banner, never forced earlier.

The single "email or phone" field decides the path: an `@` means email and
password, anything else means phone and OTP. Keep that behaviour — it is how
the screen is drawn.

An **empty** field must be rejected before either path starts.

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

**Development-scale Compute (3 November 2026).** The production shape (NAT
gateway, ALB, Elastic IPs: about ₹11,000/month incl. GST) was rejected for the
development stage. Dev now runs `LegalittDev-Compute-DevelopmentOnly`, tagged
`purpose=development-only`, at about **₹3,100/month incl. 18% GST**, fixed
charges only:

| Item | USD/month |
|---|---|
| RDS PostgreSQL db.t4g.micro, single-AZ | 15.33 |
| RDS gp3, 20 GB | 2.62 |
| Fargate ARM64, 0.25 vCPU / 0.5 GB, one task | 5.30 |
| Public IPv4 on the task | 3.65 |
| Cloud Map instance + Route 53 private zone | 0.60 |
| ECR (≤10 images), logs (14-day retention) | ~0.23 |
| **Total** | **≈27.73 → ₹2,631 + GST = ₹3,105** |

Prices from the AWS Pricing API (Mumbai), at ₹94.8755/USD. Variable on top: HTTP
API requests at $1.05 per million (throttled to 10 rps, burst 20), data out. Core
adds about ₹246 (KMS key, three secrets). No start/stop scheduling.

The shape: **API Gateway HTTP API** (HTTPS on its default
`*.execute-api.ap-south-1.amazonaws.com` domain, so no custom domain or
certificate) → **VPC link** → **Cloud Map** SRV record → **one Fargate task** in
a public subnet with a public IP, whose security group admits only the VPC link.
RDS sits in private subnets with no internet route, reachable only from the
task's security group. Migrations and seeds run as one-off ops tasks inside the
VPC (`infra/scripts/dev-ops-task.sh`).

Chosen over Lambda (a rewrite, needs paid VPC endpoints, and the API's
always-on timers — the demo progression, document cleanup — need a long-running
process), App Runner (closed to new customers) and EC2 with Caddy (needs a domain
for its certificate).

What it gives up against the production shape: no load balancer health-based
routing or multi-task spread (one task, one AZ at a time); the task has a public
IP, so egress is not through a single controlled NAT address; a 30-second
request ceiling and 10 MB payload limit from API Gateway; single-AZ RDS. **The
NAT gateway and load balancer return when there are real clients to protect** —
`LegalittProd` keeps that shape (`ComputeStack`) unchanged.

---

### 2.11 Nothing is left unbuilt — unbuilt parts are simulated behind the API

**"Keep it fake till we make it."**

The whole application must run end to end at every point in the build. A user
must be able to start a case, pay for it, have it assigned, watch it progress
and see it completed — today, before payments, SMS, courier tracking, KYC or AI
drafting are real.

Where the real capability does not exist yet, a **simulator** stands in for it.

**The rule that makes this safe:**

> A simulator is a *swap*, not a *shortcut*.
> It replaces an implementation, never an endpoint, never a screen.

Concretely, four conditions. All four, every time:

**1. The endpoint is real.** The app calls `POST /payments/intents` whether the
money is real or not. There is no "payment is not built yet" branch in the app,
no missing route, no disabled button. The contract in §5 is written once and
never changes when the simulator is replaced.

**2. The simulator is one named file behind an interface.** Each capability has
a port, a simulated adapter and one or more real adapters:

```
apps/api/src/payments/payments.port.ts          ← the interface
apps/api/src/payments/simulated-payments.ts     ← the fake
apps/api/src/payments/razorpay-payments.ts      ← the real one, later
```

Which adapter loads is decided once, at module registration, from an env flag.
Nothing downstream knows or asks. Replacing the fake is deleting one file and
flipping one flag — never a rewrite.

**3. The side effects are real even when the capability is not.** A simulated
payment still writes a `payments` row, still writes a `case_events` row, still
moves the case from `payment_pending` to `paid`, still fires the notification.
Only the call to Razorpay is absent. This is the point: the state machine, the
timeline, the ledger and the screens are all exercised for real, so when the
real adapter lands, nothing around it is untested.

**4. The simulator is honest internally and invisible externally.** Every
simulated response carries `"simulated": true` in the API payload and the
`case_events` row records `source: "simulated"`. The client's screens show
nothing unusual — a payment looks like a payment. But the database always knows
what was real, so demo data can be identified and cleared before launch.

**Flags.** One per capability, defaulting to `simulated` (phone auth also accepts
the existing `demo` alias). AI has two explicitly named real providers:

| Flag | `simulated` behaviour | Real adapter |
|---|---|---|
| `PAYMENTS_MODE` | 2s delay, always succeeds, fake `pay_` id | Razorpay |
| `PHONE_AUTH_MODE` | accepts `123456` only (§2.9) | SMS via DLT |
| `NOTIFY_MODE` | writes the `notifications` row, sends nothing | SNS / FCM |
| `AI_MODE` | fixed generic subject/demand suggestions; existing labelled simulated notice draft | `gemini` (development only) or `bedrock` |
| `COURIER_MODE` | waybill is whatever the advocate typed | carrier API |
| `KYC_MODE` | marks verified after a 3s delay | real provider |

A build with any flag on `live` must fail to start if its real credentials are
missing. Never silently fall back — a silent fallback is how a demo payment
reaches production.

**AI port.** `generate({ task, prompt })` is typed by task: `subject` and
`notice` return `{ text, simulated }`; `demands` returns
`{ options: string[], simulated }`. Callers never split prose into options.
Module registration selects `AI_MODE=simulated|gemini|bedrock` once, defaulting
to `simulated`; nothing consuming the port reads this flag. The simulator reuses
the existing fixed notice draft, and the demo timer is unchanged. The instructed
Legal Notice intake now consumes the port for subject lines and demand options.
Those two simulated tasks return fixed generic suggestions, with no invented
facts, names, amounts or offences. Successful calls record case events with the
real source column; only subject generation writes `cases.subject_line`.

`AI_MODE=gemini` requires `GEMINI_API_KEY`, `ENVIRONMENT=dev` and a non-production
`NODE_ENV`, otherwise API startup fails. It uses `GEMINI_MODEL` (default
`gemini-3.5-flash-lite`, verified against Google's current free-tier offering).
The free tier permits product-improvement use of prompts, so only synthetic dev
data may be sent. The earlier 2.5 Flash-Lite candidate was rejected for new users
by Google during verification; there is no runtime model fallback.
`AI_MODE=bedrock` requires resolvable AWS credentials at startup and the region
and per-task configuration in §2.8. Both real adapters return `simulated: false`.
Missing credentials, blocked/truncated/invalid responses and provider failures
are explicit errors, never simulated success.

**No bypasses in real handlers.** A simulator must satisfy the real validation,
not be excused from it. No handler may contain "skip this check when the caller
is the simulator" — such a branch is a live bypass sitting in production code,
and the validation it skips is then never exercised until the real feature
arrives.

Where a simulator needs an artefact it cannot legitimately produce (a proof of
delivery, a signed document, a KYC result), it supplies a **clearly-labelled
placeholder**, generated at runtime, that could not be mistaken for the real
thing: the words SIMULATED and "no real event occurred" on its face, and
`simulated = true` on its database row.

Fabricating something that *looks* genuine — a signed receipt, a realistic
invoice — is never acceptable, in either direction. The placeholder is honest
on its face; the bypass is invisible. Prefer the honest artefact.

**§9 of this document lists every capability still simulated.** Nothing ships
to a production stage while that list is non-empty without the client being
told, in writing, which items are on it.

---

### 2.12 The demo progression

A case cannot advance on its own. Two steps need a human who does not yet have
a screen — an **admin assigning an advocate**, and an **admin confirming
delivery** — and one needs an advocate who happens to be offline. Without help,
every case stops at `paid` and the flow after it can never be seen.

So under `DEMO_PROGRESSION=on` (default on locally, **off** everywhere else), a
timer advances a case through the steps nobody is present to perform.

**The rule that makes this legitimate:**

> The timer is a stand-in for a **person**, not for the **system**.
> It calls the same endpoint that person will call, with the same
> authorisation, and writes the same events. It contains no logic of its own.

So: the timer does not set a status, does not write to the database, and does
not tell the app to move on. It performs the real action and the app finds out
the way it always will — by reading the case.

| After | What happens | Which real endpoint runs | As whom |
|---|---|---|---|
| 30s from `paid` | advocate assigned | the admin assign endpoint | seeded admin |
| 30s later | drafting starts | the advocate accept + start endpoints | seeded advocate |
| 30s later | draft sent for review | the advocate submit-draft endpoint | seeded advocate |
| on client approval | dispatch begins | the real approval path | the client |
| on a change request | drafting restarts | the advocate start endpoint | seeded advocate |
| every 5s after dispatch | shipment advances one step | the shipment status endpoint | seeded admin |

Intervals are configurable (`DEMO_ASSIGN_DELAY_MS` and relatives), not
hard-coded, so a demo can be slowed down or sped up without a code change.

**The app never contains a timer that changes what it displays.** Screens poll
the case and render whatever state they find. A screen that animates its own
progress is lying, and it will keep lying after the simulators are gone.

**Navigation follows the tap, never the clock.** Moving someone to another
screen because *they* acted is the app responding. Moving them because someone
else acted, or because time passed, is the app deciding for them — and no
design asks for it. A screen may change what it shows when state changes; it
may not change which screen you are on.

**Nothing about the designed screens changes between demo and real.** If a
button appears at a given status with the timer running, it appears at that
same status without it.

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
  education                 TEXT,          -- 'LL.B., LL.M.' — design 433
  bio                       TEXT,
  photo_key                 TEXT,          -- bundled asset name now, S3 key later
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
  matter_type    TEXT,                     -- what KIND of matter, chosen by the
                                           -- client during intake. Legal Notice
                                           -- step 1 of 7 offers: property_dispute,
                                           -- money_recovery, tenant_issue,
                                           -- family_dispute, cheque_bounce,
                                           -- consumer_complaint, other.
                                           -- Other services have their own sets.
                                           -- Printed into screen headings and
                                           -- body copy — see §9.2.
  subject_matter TEXT,                     -- client description, required for new intake
  subject_line   TEXT,                     -- generated through the AI port
  legal_demand   JSONB,                    -- {selected: string[], custom: string}
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
  source       TEXT NOT NULL DEFAULT 'real',  -- 'real' | 'simulated' (§2.11)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON case_events (case_id, created_at);

-- Other parties: FIR accused and witnesses, opposing party in court matters.
CREATE TABLE case_parties (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id   UUID NOT NULL REFERENCES cases(id),
  kind      TEXT NOT NULL,      -- 'sender' | 'noticee' | 'accused' | 'witness' | 'opposing' | 'other'
  name      TEXT NOT NULL,
  age       INTEGER,                      -- sender, nullable for existing cases
  father_name TEXT,                       -- sender's S/o Shri value
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
  simulated     BOOLEAN NOT NULL DEFAULT false,   -- §2.11 placeholder artefact
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- owner_id is WHO PRODUCED the document, not who may read it.
-- Read access comes from membership of the case (client, assigned advocate,
-- admin) — never from owner_id. A client can read a proof of delivery an admin
-- uploaded; an advocate cannot read another advocate's case documents.
-- Setting owner_id to grant visibility is a bug, not a shortcut.

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
  payer_id            UUID NOT NULL REFERENCES users(id),
                                       -- usually the client; the ADVOCATE for
                                       -- purpose='courier' (designs 196–198)
  purpose             TEXT NOT NULL,   -- 'service_fee','court_fee',
                                       -- 'process_fee','courier','follow_up'
  base_amount_paise   BIGINT NOT NULL,
  gst_paise           BIGINT NOT NULL,
  total_paise         BIGINT NOT NULL,
  status              payment_status NOT NULL DEFAULT 'created',
  rzp_order_id        TEXT UNIQUE,
  rzp_payment_id      TEXT UNIQUE,
  idempotency_key     TEXT UNIQUE NOT NULL,
  simulated           BOOLEAN NOT NULL DEFAULT false,   -- §2.11
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

-- Every column below exists because design 286 draws an input for it.
-- The design is the specification (§1a); the schema adapts to it, never the
-- other way round. Do not drop a drawn input because the table lacked a column.

CREATE TABLE shipments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES cases(id),
  direction       TEXT NOT NULL,     -- 'to_recipient' | 'to_advocate'
  carrier         TEXT,              -- 'Blue Dart'
  waybill         TEXT,
  status          TEXT NOT NULL DEFAULT 'draft',
                                     -- draft | booked | dispatched | delivered
  recipient       JSONB NOT NULL DEFAULT '{}',

  -- entered by the advocate on design 286
  dispatch_date       DATE,          -- the date the advocate states, NOT booked_at
  courier_office      TEXT,
  courier_phone       TEXT,
  tracking_url        TEXT,
  expected_delivery   DATE,
  receipt_document_id UUID REFERENCES documents(id),  -- courier receipt slip

  simulated       BOOLEAN NOT NULL DEFAULT false,     -- §2.11
  booked_at       TIMESTAMPTZ,       -- system clock, when the row was saved
  dispatched_at   TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  received_by     TEXT,             -- admin-entered actual receiver; blank stays NULL
  pod_document_id UUID REFERENCES documents(id)       -- proof of delivery
);

-- dispatch_date and booked_at are NOT the same thing and must not be collapsed.
-- dispatch_date is a human statement that may be backdated or future-dated.
-- booked_at is when our system recorded it. Both are needed for a dispute.
--
-- receipt_document_id (booking) and pod_document_id (delivery) are likewise
-- two different documents at two different moments.

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
  simulated   BOOLEAN NOT NULL DEFAULT false,   -- §2.11: row written, nothing sent
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- auth audit ----------
-- Sign-in happens before any case exists, so it CANNOT go in case_events:
-- case_events.case_id is NOT NULL by design and stays that way (§4.1).
-- This table is the audit trail for authentication only.

CREATE TABLE auth_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES users(id),  -- NULL when the attempt matched nobody
  identifier  TEXT NOT NULL,              -- email or phone as entered
  event       TEXT NOT NULL,              -- 'otp_requested','otp_verified',
                                          -- 'otp_failed','password_login',
                                          -- 'login_failed','registered','logout'
  simulated   BOOLEAN NOT NULL DEFAULT false,   -- §2.11
  ip          INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON auth_events (identifier, created_at DESC);
CREATE INDEX ON auth_events (user_id, created_at DESC);

-- NEVER store the OTP itself, the password, or any token in this table.
-- DPDP: purge rows older than 180 days (§7).

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
POST   /cases/:id/subject             generate/persist subject from type and subject_matter
POST   /cases/:id/demand-options      generate selectable demands from the same inputs
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

### Step 7 — Legal Notice, end to end

The first flow where the app talks to the API instead of fixtures.

**7a — The deployed demo must not break.**

The API runs on a laptop. `legalitt-5.vercel.app` cannot reach it, and the
client demos from that URL.

So the app gets a flag, `DATA_SOURCE`:

- `fixtures` — current behaviour. **The default, and what deployed builds
  use.**
- `api` — calls the real API. Used in local development.

Both paths must work for the whole of step 7. The deployed demo keeps showing
fixtures and keeps working exactly as it does today. Nothing the client sees
changes in this step.

The switch to `api` in deployed builds happens when Compute is deployed, after
payments work (§2.10). Until then, never default to `api`.

**7b — API client.**

In `packages/shared`, a typed client generated from or matching §5. Both apps
use it; neither hand-writes a fetch call.

- Attaches the Cognito token; refreshes it when it expires.
- Turns API errors into something the UI can show. A failed request must
  surface as a visible message, not a blank screen.
- Offline and timeout handling: these are legal matters on Indian mobile
  networks. Assume the connection drops mid-flow.

**7c — Client side of Legal Notice.**

Intake (22–28) → submit → tracking (31) → draft ready decision (438) →
approve or request changes → delivery (440) → delivered (441).

Document uploads use step 6's presigned flow.

**Payment is not built yet.** The case reaches `payment_pending` and a
development-only endpoint moves it to `paid`. The real Razorpay flow is step
8. Mark that endpoint clearly and gate it on the environment.

**7d — Advocate side.**

Request appears → accept or decline → draft (188) → send for review (190) →
changes requested (191) → final (192) → dispatch.

The advocate marks dispatched and enters carrier and waybill. Admin marks
delivered and attaches proof of delivery — see §9.

Status changes go through the step 5 state machine. No endpoint writes
`cases.status` directly.

**7e — Walk it.**

One case, start to finish, across both roles, with real data in Postgres:

client creates → pays (dev endpoint) → admin assigns → advocate accepts →
advocate drafts → sends to client → client requests changes → advocate revises
→ client approves → dispatched → delivered.

Check `case_events` afterwards. Every step above should appear, in order. That
is the timeline the app draws, so if a row is missing the screens are wrong.

Report the event list.

Commit: `feat: legal notice end to end against the api`

### Steps 8 onwards — summary only

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
| ~~9~~ | ~~Whose profile is design 433~~ — **closed 29 Oct.** 433 is the advocate profile: its header, bar council enrolment, practice areas, availability and client reviews admit no other reading. "Rahul Sharma" is a placeholder name, as the High Court matter drawn on Send Documents is a placeholder matter | — |
| 24 | **Advocate availability** — design 433 draws an availability block (days, hours, "Slots open"). No data model exists for it | Advocate profile |
| ~~23~~ | ~~Legal Notice letterhead~~ — **closed 2 Nov.** The project owner identified the supplied Legal Notice Response template (189/267). Generated draft/final PDFs now use this measured letterhead; see the instructed addition below | — |
| 26 | **Registered company name** — the supplied letterhead says `INT LegalConsultants Pvt. Ltd.` in the header and `INT LegalConsultant Pvt. Ltd.` in the sign-off. Both remain exactly as drawn until the client confirms | Letterhead |
| 25 | **Client reviews** — design 433 draws reviews with names, stars and quotes; designs 264–265 draw the advocate's own reviews list. No data model exists | Advocate profile, ratings |
| 10 | FIR Approved and Changes states — still not supplied | FIR review |
| 11 | Design 348 — the supplied file is a 1× copy of 381 | Token values |
| 12 | Heading font | Typography |
| 13 | DPDP consent text and retention periods | Compliance |
| 14 | Is any AI output client-facing without an advocate between? Check the AI chat screens (160–182, 170) | AI gating |
| 15 | Which identity documents are accepted for each flow? Aadhaar must be masked if used at all (§6d) | ID proof uploads |
| 16 | The advocate pays the courier out of pocket (196–198). Is that cost reimbursed, deducted from the payout, or absorbed by the advocate? The schema records the payment either way; the **payout calculation** needs the answer | Payouts, advocate wallet |
| 17 | Designs 194–195 are drawn for client → advocate delivery, but Legal Notice dispatch is advocate → noticee. Approve the substituted wording in §9.2, or supply corrected screens | Dispatch screens |
| 18 | Design 185 lets an advocate decline a request without giving a reason. Built as drawn. Was that intended? Whoever reassigns the case sees no explanation, and repeated unexplained declines can't be spotted | Assignment, advocate quality |
| 19 | **No design shows "Your Decision" after the client approves.** The section has a drawn before-state (437) and nothing after. What does the client see between approving and dispatch starting? | Tracking screen 440 |
| 20 | **No design shows how Notice Delivered (441) is entered.** Checked My Cases (14–17), Home (12), Notifications (60), My Requests (53), My Documents (56) — 14 draws a Closed tab with nothing in it, and 56's served notice opens the viewer (57). A drawn destination with no drawn route. Where does the client tap to reach it? The fixture demo currently reaches it on a timer; was that the intent? | Delivery screens |
| 22 | The client supplied six advocate portraits, but **design 437 draws initials** on the tracking card, not a photo. The photos are drawn on the chat screen (439). Should the portraits also appear on the tracking card, or are initials intended there? Built as drawn — initials — until he says otherwise | Advocate card |
| 21 | **No design draws 440 after delivery completes.** Its headline reads "Physical Notice on the Way", which stops being true. The drawn route to 440 is withdrawn on completion, so this only affects a client already sitting on the page. Supply a delivered state, or confirm 440 is simply not the screen for a finished case | Tracking screen 440 |

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
| Courier integration | **Manual in v1.** No carrier API; the `shipments` table is unchanged when real integration lands later | 2026-10-19 |
| Who dispatches and delivers | **Advocate** marks dispatched and enters carrier and waybill — the designs put courier booking on the advocate side (197–199), so they hold the slip. **Admin** marks delivered and attaches proof of delivery, because delivery means the work is complete, and completion is what releases the advocate's payment | 2026-10-20 |
| AI model | Claude on Bedrock, Sonnet-tier for drafting, Haiku-tier for summaries and chat, subject to in-region availability (§2.8) | 2026-10-19 |
| AI human approval | Enforced in the state machine, not the UI. Screens already exist — 446 → 447 → advocate review → client (§2.8) | 2026-10-19 |
| Unbuilt capabilities | **Simulated behind the API, never skipped in the app** (§2.11). The whole flow runs end to end from the first build | 2026-10-26 |
| Auth audit trail | New `auth_events` table. `case_events.case_id` stays `NOT NULL` — sign-in has no case, and weakening the spine to fit one event type is the wrong trade | 2026-10-26 |
| Outbound dispatch flow | Courier payment → **design 286** courier-details form → back to the dispatch screen. Designs **199–202 are not reused** — they ask the advocate to confirm *receiving* documents, which is the client → advocate direction and contradicts admin-only delivery confirmation | 2026-10-27 |
| Delivery confirmation with no admin panel | The admin endpoint and state transition are **real now**. Only the screen is missing, so in simulated mode a dispatched case auto-confirms after a delay (§9.1). Nothing about the flow changes when the panel arrives | 2026-10-27 |
| Who owns a system-generated document | A **seeded admin user**, the same owner a real admin upload would have — not the client, and not an invented system account. `documents.owner_id` means who produced the document; read access comes from case membership | 2026-10-27 |
| Design 286's extra fields | **Schema adapts to the design** (§1a). `shipments` gains dispatch_date, courier_office, courier_phone, tracking_url, expected_delivery and receipt_document_id. A drawn input is never dropped because a table lacked a column | 2026-10-27 |
| Legal Notice pricing | **₹999 urgent (within 5 days), ₹699 ordinary (within 10 days)**, as design 22 draws. The old admin panel's flat ₹1,199 is superseded (§1a.1) | 2026-11-01 |
| Source precedence | The Figma files outrank the previous team's admin panel, which is a visual reference only (§1a.1) | 2026-11-01 |
| Inbound receipt (design 201) | "Confirm Received" writes a `documents_received` event **and** closes out the inbound shipment — `status='delivered'`, `delivered_at=now()`. The advocate's word is the proof for inbound; no POD is required, because the recipient is the one confirming. **`case_status` is unchanged.** Nobody else can ever confirm an inbound shipment, so not closing it would strand every one of them | 2026-10-28 |
| Advocate decline reason | **Optional.** Design 185 draws a Decline Request button and no reason input, so the API relaxes to match (§1a). `reason` is nullable; no dialog is invented. Flagged to the client as question 18 | 2026-10-27 |
| Advocate's courier payment (196–198) | A **payment**, not a lifecycle step. Writes `payments` with `purpose='courier'` and `payer_id` = the advocate, writes a `case_events` row, and **leaves `case_status` unchanged**. `payment_pending → paid` belongs to the service fee alone | 2026-10-26 |
| Admin panel | Built **after** the backend, because it consumes the API. Designs requested from the client | 2026-10-26 |

### 9.1 Register of simulated capabilities

Everything currently standing in for a real integration. This list must be
empty, or explicitly accepted in writing by the client, before production.

| Capability | Flag | Standing in because | Clears when |
|---|---|---|---|
| Payments | `PAYMENTS_MODE=simulated` | No Razorpay test keys yet | Client supplies test keys with Route enabled |
| Phone OTP | `PHONE_AUTH_MODE=demo` | DLT registration not started (1–2 week lead) | DLT template approved |
| Push, SMS and email | `NOTIFY_MODE=simulated` | No SNS/FCM/SMS/email integration yet; only outside delivery is simulated | Providers configured |
| AI subject lines and demand options | `AI_MODE=simulated` | Fixed labelled responses by default; Gemini is development-only. Bedrock is configured to the verified India-only Haiku 4.5 profile | Intake integration and client-approved activation |
| AI notice drafting | `AI_MODE=simulated` | Existing labelled draft reused; Gemini is development-only. Bedrock is Haiku 4.5 only until Sonnet 5 access is granted. Sonnet 5 requires an AWS Sales request on the client’s account; no automatic fallback | Step 11; client requests Sonnet 5 access through AWS Sales before an optional per-task config swap |
| Advocate assignment | `DEMO_PROGRESSION=on` | Admin assigns (§9), but no admin panel exists. **Without this every case stops at `paid` and nothing after it can be reached** | Admin panel built |
| Demo progression | `DEMO_PROGRESSION=on` | Stands in for people with no screen yet — see §2.12. Calls real endpoints only | Admin panel built |
| Delivery confirmation | `ADMIN_UI_MODE=simulated` | Admin marks delivered (§9), but no admin panel exists yet. The **endpoint is real**; only the screen is missing. The shipment advances one drawn milestone at a time (§2.12), and delivery with a simulated proof follows Out for Delivery | Admin panel built |
| Courier tracking | `COURIER_MODE=simulated` | Manual courier in v1 by decision, not by gap | Only if the client later buys a carrier API |
| KYC | `KYC_MODE=simulated` | No provider chosen | Provider chosen |

**In-app notifications are real (3 Nov 2026).** Each notification is a real row,
created in the same transaction as its case action. `NOTIFY_MODE` affects only
outside delivery, never inbox availability. New in-app rows are `simulated = false`
and their `notification_created` events have `source = real`; the case action's
own event independently retains its real/simulated provenance. Historical rows
remain readable. Client (60), advocate (150) and admin inboxes share a 10-second
polling feed. Unread counts come from `read_at`; opening marks read and navigates
with the case ID, resolving its current state. No polling changes routes.
GET `/notifications` is user-scoped and cursor-paginated; POST
`/notifications/:id/read` and `/notifications/read-all` only affect that user.
Case membership is rechecked. No push, SMS, email or preferences integration is
part of this chunk; design 60's Configure action retains the preview notice.

The one thing still to check is item 14 in §8: whether any AI surface reaches a
client without an advocate in between. If one does, it needs either an advocate
gate or explicit framing that it is not legal advice.

### 9.2 Register of design substitutions

§1a forbids inventing screens, labels or copy. Where a supplied design has been
**reused for a flow it was not drawn for**, it is listed here — every single
one, with the exact words changed.

**Implementation rule.** Every substituted string lives in one file,
`apps/mobile/copy/substitutions.ts`, keyed by design number. Nothing is
hard-coded into a screen. When corrected designs arrive, the fix is this one
file, not a hunt through components.

**Review rule.** This table is sent to the client for approval. Until he
approves a row, that row is provisional — it ships so the flow works, but it is
not treated as settled.

| Design | Drawn for | Reused for | What changed | Status |
|---|---|---|---|---|
| 286 | Client → advocate document hand-off | Advocate → noticee dispatch | Carrier and waybill inputs bound to the dispatch case; recipient is the case's noticee. **One string changed** — see below | Provisional |
| 194 | Client → advocate delivery | Advocate → noticee dispatch | Recipient wording — two strings. See below | Provisional |
| 195 | Client → advocate delivery | Advocate → noticee dispatch | Pickup and recipient cells bound to advocate and noticee. Wording follows 194 | Provisional |
| 31, 32, 437 | — | — | **No wording changed.** View Profile and Chat with Advocate had no drawn disabled state, so they borrow the disabled look drawn for View Draft. A reused visual state, not new copy | Provisional |

**Design 440 is NOT a substitution.** Its "Recovery" wording was almost
registered as one. It is not copy — it is the `matter_type` the client chose at
intake step 1 of 7, printed into the screen. Those strings are **bound to
data**, never replaced:

| Design 440 | Renders as |
|---|---|
| `Legal Notice for Recovery` | `Legal Notice for {matterTypeLabel}` |
| `Your official recovery notice is dispatched…` | `Your official {matterTypeLabel lowercased} notice is dispatched…` |

Fallback when `matter_type` is `other` or unset: `Legal Notice`, and
`Your official legal notice is dispatched…`. Never print the word "other".

**The lesson.** Before registering any substitution, check whether the wording
is a *value* rather than *copy*. Replacing a value with a fixed string silently
deletes a feature the client drew.

---

**Exact strings changed.** `<Party>` is whatever term the supplied Legal Notice
designs already use for the notice recipient — not a term invented here.

| Design | Original | Replacement |
|---|---|---|
| 189 / 267 (Approved — project owner, 3 Nov 2026) | `Reffrence Id` | `Reference Id` |
| 189 / 267 (Approved — project owner, 3 Nov 2026) | `has been preserve in my office` | `has been preserved in my office` |
| 194 | `to your advocate` | `to the <Party>` |
| 194 | `Your advocate needs the physical documents for the case` | `The signed notice must reach the <Party> by post.` |
| 286 | `Your advocate can use the tracking number to check the shipment.` | `You can use the tracking number to check the shipment.` |

The 286 change exists because the reader of that screen on the advocate side
**is** the advocate — the original sentence addresses the wrong person.

Layout, spacing, type and all measured tokens are unchanged in every row above.
Only the bound data and the listed strings differ.

---

### Instructed additions — Legal Notice intake (2 November 2026)

> **Approved — project owner, with the client's advocate.** This instruction
> supersedes the six-step order drawn in designs 24–28. No advocate editor or
> letterhead-template changes are part of this chunk.

| Step | Screen | Instruction |
|---|---|---|
| 1 | Type (26) | Notice type plus required **Subject matter in dispute**, free text |
| 2 | Noticee (25) | Noticee details |
| 3 | Sender (24) | Sender details, adding **Age** and **Father’s name (S/o Shri)** |
| 4 | Legal demand (new, instructed) | AI options, multiple selections allowed, plus custom prose |
| 5 | Documents | Existing upload, verification and file-review screens |
| 6 | Review (27) | Show the entered subject matter, generated subject, sender fields and chosen/custom demand |
| 7 | Payment (28) | Existing prices, calculation and Scan & Pay flow |

All seven steps use the existing wizard theme and a seven-step counter. The new
screen reuses the chat bubble, flat beige fields and primary button. Added copy
lives in `apps/mobile/copy/instructed.ts` under `legalNoticeIntake`; its prompts
are “Choose your legal demand”, “Select all that apply, or write your own.” and
“Write your own demand”. “Generate options” retries a failed suggestion request.
Generated options are data. They are never treated as approved legal advice.

Storage: the three new case columns and `case_parties.age` / `father_name` are
nullable, preserving existing records. `legal_demand` is a dedicated JSONB column
with `{selected: string[], custom: string}` so the form can reload both inputs
without guessing which prose was an option. The sender party uses kind `sender`;
its age/father's name are not duplicated inside `details`. Neither additional
sender field was specified as required; blank values remain NULL. New submission
requires type, subject matter, a generated subject and at least one selected or
custom demand, alongside the existing required party fields.

`POST /cases/:id/subject` and `POST /cases/:id/demand-options` are authenticated,
client-owned draft operations. They pass only persisted type/subject matter to
the AI port. A changed source clears the subject line; an in-flight response is
rejected if its source changed or the case is no longer draft. Errors stay inline.
Saving precedes navigation. Existing route paths are retained to preserve links;
the new step is `/legal-notice/demand`. Demo traversal follows the same new order.

| Supplier | Supplies |
|---|---|
| Client | Notice type, subject matter, both parties' details, legal demand |
| Advocate | Offences (“for the offences of ___”), place, date — next chunk |
| System | Reference ID |
| Pricing | “Cost of this legal notice” is the service fee: ₹999 urgent / ₹699 ordinary |

### Instructed addition — Legal Notice letterhead (2 November 2026)

> **Approved — project owner.** The supplied Legal Notice Response (189/267)
> is the generated notice template. This closes question 23 and supersedes the
> earlier invented plain PDF. The six editor sections remain the working surface.

The PDF is A4, measured from the paper crop (60,402,658,932) in design 189,
with selectable Noto Sans / Noto Sans Devanagari text. Header and footer bands,
company contacts, gold rules, title and signature area follow that crop. Body
fields wrap; facts have no fixed count and demands are lettered A, B, …, AA.
Continuation pages repeat the letterhead and disclaimer. The signature stays
blank for signing by hand. No image of a complete page is used as the document.

| Output | Source |
|---|---|
| Advocate / qualifications / Enrollment No | Assigned user's full_name; advocate_profiles.education / bar_council_number |
| Reference | cases.reference, with the drawn /20 year suffix |
| Recipient | Noticee name/address from the case intake |
| Subject | cases.subject_line |
| Client / S/o Shri / Age / R/o | Sender intake name/address; case_parties.father_name / age |
| Numbered facts | Saved draft's Background & Facts section |
| Lettered demands | cases.legal_demand.selected plus nonblank custom demand |
| Offences | Optional offences in versioned draft content, entered by the advocate |
| Notice cost | Case's own pricing_id base fee, excluding GST; current urgent ₹999 / ordinary ₹699 |
| Place / date | Assigned advocate's city; saved draft date (final: approval date), in India time |

| Editor addition | Approved copy | Storage |
|---|---|---|
| Offences input, following the six existing sections | `Offences` | drafts.content.offences, optional for legacy drafts; no sample allegation |

The addition's strings live in `apps/mobile/copy/instructed.ts`. Generate Draft
saves the current draft and calls the authenticated render-only
`POST /cases/:id/drafts/:draftId/pdf` before opening the response screen. Only the
assigned advocate can render the latest draft while in_progress. Rendering does
not send the draft or expose an unsent file to the client. Send and approval use
the same renderer and the existing real document/S3 pipeline. Missing intake or
profile values never fall back to another case or a fixture.

**Approved — project owner, 3 Nov 2026:** `Reffrence Id` becomes `Reference Id`;
`has been preserve in my office` becomes `has been preserved in my office`. The header's `INT LegalConsultants Pvt. Ltd.`
and sign-off's `INT LegalConsultant Pvt. Ltd.` also retain the drawn plural/singular
difference. No wording correction is assumed.

AI provider instructions now require ₹ and Indian grouping (₹5,000, ₹1,00,000)
for supplied monetary amounts. They must not invent or change amounts. Existing
saved client selections are not silently rewritten.

### Instructed addition — in-app notifications (3 Nov 2026)

> **Approved — project owner.** Surface real in-app rows for all three roles,
> with unread bell counts, mark-read and case navigation, polling without reload.
> The admin inbox uses the panel theme; mobile screens use designs 60 and 150.

Notification titles use the instructed event descriptions, with the real case
reference as the body, never fixture names or invented message content:

| Recipient | Events / titles |
|---|---|
| Client | Advocate assigned; Draft ready to review; Notice dispatched; Notice delivered |
| Advocate | A case assigned to you; Client approved; Client requested changes; Documents received |
| Admin | A paid case needs an advocate; An advocate declined; A case needs delivery confirmed |

The existing Payment Successful notification remains. Loading notifications…,
No notifications, Load more and Retry are the operational empty/loading/error
states. Mark all as read is drawn. The SMS/WhatsApp preferences control is drawn
but outside delivery remains out of scope. No notification can infer a case's
latest action from its old title; links resolve against the current lifecycle.

## 10. Working agreement

This document is the only specification for the backend. **§1a governs
everything in it:** the designs are the specification for the application, and
this document serves them.

Any prompt that starts work should say which steps of §6 to execute and
nothing more. If a prompt contains instructions that contradict this document,
**stop and report the contradiction** — do not choose between them.

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


### Admin chunk D — delivery recording (project-owner instruction, 2 November 2026)

The existing POST /cases/:id/delivered endpoint also accepts received_by (optional,
blank stored as NULL) and delivered_at (ISO timestamp; omitted callers retain the
recording-time default). Admin UI supplies the typed delivery time. Event creation
and cases.completed_at retain recording time; shipments.delivered_at is the actual
reported delivery time. This preserves both facts without inventing a new endpoint.
The POD must be an uploaded document for the same case; the admin form uploads it
with kind proof_of_delivery. Its
simulated flag must match the confirmation source. A real confirmation records a
real event and clears the shipment's simulated delivery flag; earlier simulated
events remain historical facts. Duplicate completion is rejected under the case lock.
ADMIN_UI_MODE and DEMO_PROGRESSION remain unchanged by this chunk.
