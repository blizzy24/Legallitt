# Builder C — Messages inbox (D-28) and Support (D-26, D-42)

Branch `p0-messages`. For the integrator to merge into `docs/DECISIONS.md` and
the architecture document.

## New decisions

- **D-56. One Messages inbox, conversations are case threads plus support requests.**
  Each case with an assigned advocate is one conversation (the existing
  `client_advocate` thread, created on first open). Each support request
  (contact form, callback, support chat) is its own conversation under the
  Support filter, titled "Legalitt Support" with the request subject. Search
  runs on the server and matches the counterpart's name, case reference,
  matter title/type and the text of every message (not only the preview).
  Advocates see the same inbox for cases assigned to them (filter "Clients");
  admins use the panel's Support inbox instead.
- **D-57. Contact Support subject list.** profile-21 draws only "Select an
  issue". Options: Payment or refund question; Question about my case
  progress; Documents or uploads; My advocate; Account or sign-in; Something
  isn’t working in the app; Something else. A linked case must be one the
  requester can already see (404 otherwise).
- **D-58. Support attachments are "Not available yet".** Documents are stored
  per case (`documents.case_id`, case-membership access rules); a support
  attachment would need a separate owner-scoped storage and admin-only read
  path. The drawn upload box is shown disabled with an honest explanation.
- **D-59. Callback requests de-duplicate while open.** A second callback
  request while one is open returns the existing request. Support chat keeps
  one open thread per person; a closed chat starts a new one.
- **D-60. Admin closing a request is final for that request.** The requester
  sees "This request is closed" with a link to start a new chat; the close is
  recorded in `admin_actions` (`close_support_request`), with a confirmation
  step in the panel.
- **D-61. Support inbox ordering.** Unanswered requests first, oldest
  unanswered message first (`waiting_since` = oldest requester message after
  the last support reply); answered/open requests follow, oldest first.
  The list refreshes every 30 s.

D-03 copy: support response promises live in
`apps/mobile/copy/supportContact.ts` (`supportContactCopy`):
"typically responds within 2 business hours" (profile-21, current) and
"contact you in 24 hours" (design 36). If builder A added a `supportHours`
constant, fold these into it.

## §9.2 — built without a design

| Screen | Decision | Notes |
|---|---|---|
| Admin **Support inbox** list and request detail (`/support`, `/support/:id`) | D-42, D-61 | Existing dark/orange counters, table, detail panels; waiting age reuses FIR `WaitingAge` |
| Support conversation screen (`/messages/support?ticketId=`) and Support Chat (`/support-chat`) | D-26, D-56 | Same bubble layout as messages-2; design 35's scripted transcript not used |
| Contact Support / Callback submitted states | D-26 | profile-21's "Submitted State" toggle shows only a state name; built as a confirmation card with "View in Messages" |

## §9.2 — substitutions (D-01)

| Design | Drawn | Replacement |
|---|---|---|
| 142, messages-1 | "End-to-end encrypted lawyer-client privileged chat" | "Messages are private to you, your advocate and Legalitt support." |
| 143, messages-2 | Online dot, "Online · Indore", "is typing…" | Omitted |
| messages-1/2 | "Verified" badge on every advocate | Shown only when the advocate's verification is `approved` (D-02) |
| profile-21 | Upload document box | Disabled, "Not available yet" (D-58) |
| 35 | Scripted support transcript | Real messages only |

## Schema (architecture §4 needs these two tables)

`apps/api/tests/foundations.cjs` asserts that every `CREATE TABLE` in the
migrations also appears in the architecture document and that the total is 37.
It fails until the integrator adds the SQL below to §4.3 and raises the count
(39 with these two tables, plus any other builders' tables):

```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL,            -- ticket | callback | chat
  status TEXT NOT NULL,          -- open | closed
  subject TEXT, related_to TEXT, description TEXT, contact_method TEXT,
  contact_name TEXT, contact_phone TEXT, case_id UUID REFERENCES cases(id),
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ, closed_by UUID REFERENCES users(id)
);
CREATE TABLE support_messages (
  id UUID PRIMARY KEY, ticket_id UUID NOT NULL REFERENCES support_tickets(id),
  sender_id UUID NOT NULL REFERENCES users(id), sender_role TEXT NOT NULL,
  body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL, read_at TIMESTAMPTZ
);
```

## Routes

Mobile: `(tabs)/messages` (API inbox), `messages/thread?caseId=`,
`messages/support?ticketId=`, `support`, `callback`, `support-chat`.
`messages/[id]` stays gated (fixture design route). `help` untouched.
`scripts/mobile-smoke.mjs` route count raised 329 → 331.

Admin: `/support`, `/support/:id`, nav "Support inbox".

API: `GET /messages/inbox?q=`, `POST/GET /support/tickets`,
`GET /support/tickets/:id`, `POST /support/tickets/:id/messages`,
`POST /support/tickets/:id/read`, `POST /support/callbacks`,
`GET/POST /support/chat`, `GET /admin/support?status=`,
`GET /admin/support/:id`, `POST /admin/support/:id/messages`,
`POST /admin/support/:id/close`. `GET /threads/:id/messages` now includes
attachment metadata (`document`) for document cards.
