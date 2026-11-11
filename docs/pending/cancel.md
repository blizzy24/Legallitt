# Pending entries from builder B — cancellations & refunds (P0-6)

## New decisions (for docs/DECISIONS.md)

**D-50. Cancellation stages are lifecycle statuses, the same for every service.**
`draft`/`submitted`/`payment_pending` → cancel, nothing to refund. `paid`/`assigning`/
`assigned`/`advocate_declined` → client self-serve, immediate, full refund (no
advocate has accepted). `advocate_accepted`/`in_progress`/`client_review`/
`changes_requested`/`approved` (including FIR, report and consultation sub-states)
→ client request to the admin queue. `dispatching`/`dispatched`/`completed` → no
cancellation, Contact Support. One open request per case (database-enforced).

**D-51. Refunds are rows, not payment-status changes.** A refund row records the
amount against a captured client payment (oldest payment first when a case has
several, e.g. consultation then quote). `payments.status` stays `captured`, so
receipts and price snapshots stay readable. Courier payments made by advocates are
never refunded through this flow.

**D-52. Case outcome by refund size.** Full refund of everything still refundable →
`cancelled` then `refunded` (two `case_events`, the second `source=simulated`).
Partial or zero refund → stays `cancelled`; the partial refund is visible on the
case. Declining a request leaves the case where it was and tells the client why.

**D-53. The advocate learns the case ended, not why.** The advocate gets an in-app
"A case assigned to you was cancelled" notification. Reasons, notes and refund
amounts are client/admin-only: `GET /cases/:id/cancellation` returns 404 to every
advocate, including the assigned one. The case leaves the advocate's active work
because its status is closed; `advocate_id` is kept for history (D-14).

**D-54. Legacy `POST /cases/:id/cancel` for clients now follows D-50.** Previously a
client could cancel `assigning`/`assigned` (paid) cases without any refund record.
Client calls are routed through the refund-aware service; admin calls keep the
existing transition.

**D-55. Advocate entitlement on partial refunds** is recorded only if the admin
enters one (stored on the request; the API accepts it, the admin form omits it for
now — none is the default per D-14).

## §9.1 register — simulated capabilities

| Capability | Flag | Standing in because | Clears when |
|---|---|---|---|
| Refunds | follows `PAYMENTS_MODE=simulated` | No Razorpay keys; payments themselves are simulated | Razorpay integration: each refund row becomes a Razorpay refund against the original payment |

Every refund row has `simulated=true`; the `refund_recorded` event has `source=simulated`.
Admin panel shows "Simulated refunds — no money moved"; client screen shows "Demo
payment: this refund is recorded but no real money moved."

## §9.2 — built without a design / substitutions

- **Admin Cancellations & refunds queue** (`/cancellations`, D-12/D-13/D-42) — built
  without a design from the panel's table, counters, stall banner and detail panel.
  Oldest-first with live waiting time; Review → decision with refund amount and the
  reason shown to the client; confirmation stating the outcome cannot be undone.
- **Admin case detail "Cancellation & refunds" panel** — built without a design.
- **Client Cancel Request** reuses design 349 for every service at `/cases/cancel?caseId=`.
  Changes from 349: case-type/court/parties cells shown only where the case holds them
  (service, speed, status); "Verified Advocate" badge omitted (D-01/D-02); "No penalty
  or fees apply for cancelling at the review stage" replaced by the API's stage-specific
  message (full refund / Legalitt decides / not cancellable); added the request-pending,
  declined, approved and cancelled states, and a demo-refund line. The checkbox
  wording changes to "…sends a cancellation request" when admin review applies.
- Entry points added: "Cancel request" on the report-service and consultation client
  tracking screens. Request Details (builder D) links to the same route.
