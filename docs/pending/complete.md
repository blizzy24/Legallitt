# P1 complete — advocate completion view (D-07), account deletion queue (D-24, D-42), follow-up booking (D-10)

Branch `p1-complete`. No migration (`account_deletion_requests.status` is free text; new values below).

## New decisions

- **D-88. One completion view for every service.** `GET /advocate/cases/:id/completion`
  (assigned advocate or admin; clients 403, other advocates 404) returns the
  completion date, Legal Notice delivery facts (delivered at, received by,
  courier/waybill), the final documents (final notice and POD; approved FIR
  draft; released report files; approved consultation brief) and the advocate's
  entitlement = sum of `advocate_entitlement_paise` over the client's captured
  payments' price snapshots. If a captured payment has no snapshot the sum is
  flagged incomplete; with none recorded the card says so. Wording is
  service-specific ("Delivered — case complete" only for Legal Notice; "Draft
  approved and released", "Report released", "Brief approved — consultation
  complete"). It never says a payout has been released: "Legalitt pays advocates
  manually; this is not a payout confirmation." A cancelled or refunded case
  shows only "Cancelled — no further work" and the reference — never the
  client's reason, the refund amount or an entitlement (D-53). Advocate Legal
  Notice cases in `cancelled`/`refunded` now open this read-only view (they
  previously had no destination).
- **D-89. Completing a deletion request does not erase data.** Admin "Complete"
  sets the request to `completed_pending_purge` and keeps the account
  deactivated; no rows, documents or Cognito user are deleted, because the
  retention period is an open question (DECISIONS §12). The panel says the
  personal-data purge runs once the retention period is confirmed. The purge
  itself is a later, separately approved step. Completion is refused while the
  person has a paid case in progress.
- **D-90. Admin may reactivate instead.** "Reactivate" closes the request as
  `declined`, restores `users.status='active'` and sends the person an in-app
  notification with the admin's note.
- **D-91. Follow-up booking reuses the saved-advocate handoff.** A completed
  Legal Advice case shows "Book Follow-up Consultation" (design 116), which
  preselects that advocate in the normal Legal Advice booking (new case, normal
  price and payment). No discounted follow-up price is invented.
- **D-92. Deletion requests have a "reviewed" step.** Statuses:
  `pending` → `reviewed` (optional; stays in the open queue, oldest first) →
  `completed_pending_purge` or `declined`. Every action needs a note and a
  confirmation and is recorded in `admin_actions`
  (`review_account_deletion` / `complete_account_deletion` /
  `reactivate_account`, payload `from_status`, `to_status`, `erased:false`).
  The client's duplicate-request check treats `reviewed` as still open.

## §9.1 — nothing simulated

No new simulator. The personal-data purge is not simulated either: it is not
built, and the panel says so.

## §9.2 — built without a design

| Screen | Decision | Notes |
|---|---|---|
| Advocate completion / cancelled card (Legal Notice `advocate/notice/[id]/report` in API mode; FIR, report-service and consultation advocate screens when completed, cancelled or refunded) | D-07, D-88, D-53 | Existing advocate card/button styles. In API mode the Legal Notice route no longer reuses design 203 (another service's payout confirmation) |
| Admin **Account deletions** queue (`/account-deletions`) | D-24, D-42, D-89, D-90, D-92 | Existing counters, table, stall banner, detail panel and confirm block, as the Cancellations queue |
| "Book Follow-up Consultation" button (design 116 label) on completed Legal Advice tracking | D-10, D-91 | Existing consultation button style. Design 116 draws the follow-up with payment on the same screen and a ₹100 written-advice offer; neither is built — the button preselects the same advocate in the normal booking and payment flow |

## Routes

API: `GET /api/v1/advocate/cases/:id/completion`, `GET /api/v1/admin/account-deletions?status=open|decided`,
`POST /api/v1/admin/account-deletions/:id/decide` `{decision: review|complete|reactivate, note}`.
Admin: `/account-deletions` (nav "Account deletions"). Mobile: no new routes.
