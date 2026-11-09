# Admin panel — Legal Notice slice

1 November 2026 · build spec

**Their look, our logic.** The existing panel at `legalitt.vercel.app` is the
visual reference. It is **not** a feature list. Features come from our
lifecycle and our designs. See `ADMIN-PANEL-SURVEY.md` for what is there.

**Approved extension, 10 November 2026: FIR draft approval.** The client confirmed
an admin reviews the advocate's submitted draft before it reaches the client.
The owner authorised building this screen in the panel's existing visual
language without a supplied design; architecture §9.2 records the reason.
FIR Drafts navigation opens an oldest-first approval queue. The waiting sub-status
maps to Open, with submitted timestamp, elapsed waiting time and an explicit
statement that approve is the only action; rejection/return policy is unresolved.
Review shows the exact frozen PDF/version/author alongside intake, evidence,
payment and history. `Approve and send to client` records the admin decision,
releases that PDF and completes the case atomically. No admin editing, rejection
or client approval. A second advocate submission is blocked while waiting.
This extension supersedes the Legal-Notice-only scope and two-action restriction
below for this specific FIR action; it does not authorise other service screens.

---

## 1. Where it lives

`apps/admin` in the monorepo. **Vite + React + React Router**, TypeScript,
importing types from `packages/shared`. No SSR — it is a private internal tool
with no SEO and no public pages, so a framework's weight buys nothing.

Deploys as a static SPA to **its own Vercel project**, never the client app's.

Auth is Cognito, same pool, **`admin` role only**. A client or advocate token
must be refused at the door.

---

## 2. Take from their design, not their decisions

**Take:** the dark surface with the orange accent, the dense table, the counter
strip above the list, the search field, the left navigation drawer, the general
density and weight of an operations tool.

**Do not take:**
- their eighteen sections as a scope
- their five statuses as our model
- their single-blob ISSUE field
- their free-text advocate names
- their `₹1,199`
- their `LN-E8BBE5` reference format — ours is `LN-2026-0001`

---

## 3. Status mapping

The admin needs buckets that answer "what needs me?", not our seventeen
statuses. One exhaustive mapping function, compile-time checked, beside
`bucketFor()` in `packages/shared`:

| Admin bucket | Case statuses | Means |
|---|---|---|
| **Open** | `paid`, `assigning`, `advocate_declined` | **An admin must act now** |
| **Pending** | `client_review`, `changes_requested` | Waiting on the client |
| **In Progress** | `assigned`, `advocate_accepted`, `in_progress`, `approved`, `dispatching`, `dispatched` | The advocate is working or it is in transit |
| **Completed** | `completed` | Done |
| **Closed** | `cancelled`, `refunded` | Ended without completing |

`draft`, `submitted` and `payment_pending` are **unpaid and do not appear** in
the admin list at all.

---

## 4. The four screens

### 4.1 Legal Notices list

The counter strip (Open · Pending · In Progress · Completed · Closed), total
count, and a search across client name, reference and matter type.

Columns: `CASE # · CLIENT · MATTER · ADVOCATE · DOCUMENTS · STATUS · AMOUNT ·
CREATED · ACTIONS`.

Differences from theirs, all deliberate:
- **MATTER** is `matter_type` plus the parties as separate fields, not a blob
- **ADVOCATE** is a real user, with `+ Assign` where none is set
- **AMOUNT** comes from `service_pricing`, not a constant
- **DOCUMENTS** counts by origin — client, advocate, admin, generated — because our
  `documents` table knows which is which

### 4.2 Case detail

Intake fields, parties, the full `case_events` timeline, documents with
previews, the current draft and the generated PDF, payments, and the shipment
with its milestones. Read-mostly: the only actions are the two below.

### 4.3 Assign advocate

The `+ Assign` action. Choose from real advocates (`role = 'advocate'`,
`verification = 'approved'`), showing name, practice areas, city and current
load. Calls the real assign endpoint, writes the real event.

**This is what `DEMO_PROGRESSION`'s assignment step stands in for.**

### 4.4 Confirm delivery

Upload proof of delivery, record who received it and when, move the case to
`completed`. The endpoint already exists and is real — only the screen is
missing.

**This is what `ADMIN_UI_MODE` stands in for.**

---

## 5. What it must not do

- No field, column or status that our data model does not already hold
- No writing to a case outside the two actions above
- The empty rule applies here too: a missing value takes its label with it
- No deleting anything

---

## 6. When this lands

`DEMO_PROGRESSION`'s assignment step and `ADMIN_UI_MODE` come off the §9.1
register. The drafting steps stay simulated until the advocate side is
finished, since a real advocate still has to sit down and write.

---

## 7. Out of scope, and worth naming to the client

Dashboard · Consultations & Chats · Calendar · the other six services ·
Client Users · Advocate Network & Approvals · Admin Team · Payments & Revenue ·
Payment History · Transaction Ledger · Payouts · Support Desk · Coupons ·
Ads · Reports & Analytics.

Fourteen of their eighteen sections. The client has seen a panel that had all
of them, so he may assume they are coming. Say what this phase includes before
he assumes otherwise.
