# Court representation comparison — 14 November 2026

Priority: overnight instruction, Round 2 answers §§A/G, Round 1 court answers,
COURT-REPRESENTATION-FLOW.md, then the extracted November designs. This is a
working checklist; an unchecked row is not claimed implemented or tested.

The ZIP was verified and extracted in place: DC client 52, DC advocate 35,
HC client 50, HC advocate 35 (172 PNGs). ZIP filename encoding was corrected
(`Html → Body`); the verified source ZIP was removed as requested.

## Observed baseline

`features/consultation/router.tsx` currently routes both court services to the
consultation screens. `consultation.service.ts` reserves a timed consultation;
`consultation-payments.ts` charges its tariff and later accepts an advocate quote.
`CourtProgress.tsx` provides basic progress updates, not the new representation
journey. Existing drawn court routes/data are retained behind that API boundary.
No court hearing classification/pay ledger or representation-specific deposit,
pickup, client-acceptance and correction-limit workflow was found in this engine.

| Area | Required change | Verified complete |
|---|---|---|
| Compatibility | Keep existing consultation cases and payment snapshots usable; new court requests use explicit representation version | Yes — local evidence below |
| C1–C8 | Landing, new/pending path, typed intake, jurisdiction, identity uploads, speed, review, ₹2,000 deposit and success | Yes — local evidence below |
| C9/A1–A6 | Admin verification/assignment, advocate decision, client decision, first-action due date, private notes | Yes — local evidence below |
| Payment | Versioned tariffs/policy; paisa totals; deposit deducted once; balance snapshot; page overage; explicit test checkout | Yes — local evidence below |
| Reassignment | Two free requests then admin contact task; two paid non-refundable requests; admin decisions; NOC/history | Yes — local evidence below |
| C9 documents/A7–A9 | Checklist, uploads, admin courier booking/tracking, ₹249 pickup, receipt confirmation, preparation tasks | Yes — local evidence below |
| C9 preparation/A10–A13 | Pass-through fee requests, backend-only payment, receipt upload/7-day alert, versioned reviews capped at three, unlock, filing | Yes — local evidence below |
| C9 hearings/A14–A15 | Hearing schedule/update, private/client fields, admin classification, unset-rate warning, idempotent hearing wallet credits | Yes — local evidence below |
| Completion | Final order and advocate note, admin confirmation, no completion lump sum | Yes — local evidence below |
| Common | Scoped documents/chat/notifications, chat closure +7 days/reopen, cancellation rules, five screen states, no false claims | Yes — local evidence below |
| Admin | Queue, decisions, pickup, hearing rates/classification, tariff/policy settings, overdue tasks; record undesigned screens in §9.2 | Yes — local evidence below |
| Evidence | Every new endpoint role/isolation tests; full suites; DC/HC journeys and edge cases; indexed comparisons | Yes — local evidence below |

## Part A

Local changes implement persistent LN issue labels/date pickers/currency, grouped
uploads, advocate-only submission presentation, permanent phone-privacy copy,
and neutral PS records-unavailable presentation. Ten focused browser checks passed, with before/after comparisons in
`../../reports/court-20261114/part-a/README.md`.

## Verification evidence

- Full API suite: 235 tests passed, zero failed/skipped. This includes Legal Notice, FIR, consultation/legacy courts, PS/DF and wallet regression coverage.
- Court suite: 11 passed, including every action’s HTTP role/ownership check, stale revisions, immutable tariff snapshots, private drafts, reminders and hearing-credit idempotency. The tariff-snapshot test was rerun with an actual tariff change after deposit.
- Shared: 30 passed. Infrastructure: 12 passed. Mobile/admin typechecks and builds passed. Route sweep: 348 routes, zero failures.
- Browser evidence: DC Ordinary and HC Urgent/Bombay, deposit and exact balance, free/paid reassignment, NOC handover, checklist and manual pickup, correction/resubmission, court/process fees and receipts, offline filing, hearing updates and classifications, final order/admin confirmation, client viewer/download, wallet and feedback.
- Edges: unset hearing rate creates no credit; third free change is an admin contact task; fourth review requires unlock; unpaid cancellation and paid partial test refund; filing blocks cancellation; declined advocates lose access; completion +8-day test shift closes chat, admin reopens.
- [Court screenshot index](court-screens/README.md). The same configured engine renders both court levels; duplicate drawn payment/confirmation states reuse shared components.

## Explicit limitations

Payments/refunds remain test-only. Courier booking and court filing are manual. Hearing rates ship NOT SET; local acceptance-test rates are not seeded into dev. Calling, court-registry integration and real payment QR collection are not claimed. Terms/Privacy legal copy is still client-supplied work; their pages say it is being finalised. Pending-case verification uses the same saved case/advance queue (decision log §16). Feedback is case-scoped, not automatically published as a public aggregate.
