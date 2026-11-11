# Builder H — P1-3: advocate completion view (D-07), account deletion queue (D-24, D-42), follow-up booking (D-10)

Branch `p1-complete`. No migration.

## New decisions

- **D-84. One completion view for every service.** `GET /advocate/cases/:id/completion`
  (assigned advocate or admin; clients 403, other advocates 404) returns the
  completion date, Legal Notice delivery facts (delivered at, received by,
  courier/waybill), the final documents (final notice and POD; approved FIR
  draft; released report files; approved consultation brief) and the advocate's
  entitlement = sum of `advocate_entitlement_paise` over the client's captured
  payments' price snapshots. If a captured payment has no snapshot the sum is
  flagged incomplete; with none recorded the card says so. Wording is
  service-specific ("Delivered — case complete" only for Legal Notice). It never
  says a payout has been released: "Legalitt pays advocates manually; this is
  not a payout confirmation."
- **D-85. Completing a deletion request does not erase data.** Admin "Complete"
  closes the request and keeps the account deactivated; no rows, documents or
  Cognito user are deleted, because the retention period is an open DPDP
  question (§12 Q5). Erasure is a later, separately approved step. Completion is
  refused while the person has a paid case in progress.
- **D-86. Admin may reactivate instead.** "Reactivate" closes the request as
  declined, restores `users.status='active'` and sends the person an in-app
  notification with the admin's note. Both decisions need a note, a
  confirmation, and are recorded in `admin_actions`
  (`complete_account_deletion` / `reactivate_account`, `erased:false`).
- **D-87. Follow-up booking reuses the saved-advocate handoff.** A completed
  Legal Advice case shows "Book follow-up with the same advocate", which
  preselects that advocate in the normal Legal Advice booking (new case, normal
  price and payment). No discounted follow-up price is invented.

## §9.2 — built without a design

| Screen | Decision | Notes |
|---|---|---|
| Advocate completion card (Legal Notice `advocate/notice/[id]/report` in API mode; FIR, report-service and consultation advocate screens when completed) | D-07, D-84 | Existing advocate card/button styles. In API mode the Legal Notice route no longer reuses design 203 (another service's payout confirmation) |
| Admin **Account deletions** queue (`/account-deletions`) | D-24, D-42, D-85, D-86 | Existing counters, table, stall banner, detail panel and confirm block, as the Cancellations queue |
| "Book follow-up with the same advocate" button on completed Legal Advice tracking | D-10, D-87 | Existing consultation button style; design 116's flow is otherwise the normal booking |

## Routes

API: `GET /api/v1/advocate/cases/:id/completion`, `GET /api/v1/admin/account-deletions?status=pending|decided`,
`POST /api/v1/admin/account-deletions/:id/decide` `{decision: complete|reactivate, note}`.
Admin: `/account-deletions` (nav "Account deletions"). Mobile: no new routes.
