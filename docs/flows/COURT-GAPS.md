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

## Visual gaps — 14 November 2026 polish pass

Reviewed the 151 existing comparison captures. Several source pairings were wrong (request review versus pre-filing review, and DC advocate numbering); those must be corrected along with the captures. The following is the per-screen audit, not a claim that fresh validation is complete. Confirmed workflow overrides remain: no calls or phone sharing, manual verification only, ten stages, advance/balance payments, hearing-only earnings and admin completion confirmation.

| Screen | Observed structural gap / required treatment |
|---|---|
| `dc-admin-chat-reopen` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-classify-0` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-classify-1` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-completion` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-courier-booking` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-hearing-settings` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-partial-refund` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-queue` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-rate-not-set` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-review-unlock` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-third-change-task` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-admin-verification` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `dc-advocate-add-hearing-0` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `dc-advocate-add-hearing-1` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `dc-advocate-checklist` | Add matter context and next-step guidance; retain manual required/optional document selection. |
| `dc-advocate-completion` | Add matter context above final-order action; retain admin confirmation and hearing-only earnings policy. |
| `dc-advocate-confirm-documents` | Preserve file type cards; human document labels and side-by-side outline actions. |
| `dc-advocate-court-fee` | Use shared checkout for client; add case context above advocate fee form. |
| `dc-advocate-decline` | Use current-stage context and dated timeline; keep historical details collapsed. |
| `dc-advocate-documents` | Preserve file type cards; human document labels and side-by-side outline actions. |
| `dc-advocate-fee-receipt` | Prioritize current receipt, with historical cards behind details and dated progress. |
| `dc-advocate-filing` | Add case context before filing fields; keep offline-filing explanation and manual confirmation. |
| `dc-advocate-hearing-draft-0` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `dc-advocate-hearing-draft-1` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `dc-advocate-hearing-preview-0` | Correct reference pairing: request review differs from pre-filing review. Add request summary/context and review guidance. |
| `dc-advocate-hearing-preview-1` | Correct reference pairing: request review differs from pre-filing review. Add request summary/context and review guidance. |
| `dc-advocate-hearing-ready-0` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `dc-advocate-hearing-ready-1` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `dc-advocate-missing` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `dc-advocate-prefiling-revised` | Add case context before filing fields; keep offline-filing explanation and manual confirmation. |
| `dc-advocate-prefiling-send` | Add case context before filing fields; keep offline-filing explanation and manual confirmation. |
| `dc-advocate-preparation` | Add matter context and dated progress while keeping task controls and private notes separate. |
| `dc-advocate-private-note` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `dc-advocate-process-fee` | Use shared checkout for client; add case context above advocate fee form. |
| `dc-advocate-process-receipt` | Prioritize current receipt, with historical cards behind details and dated progress. |
| `dc-advocate-request` | Split client/matter/narrative context into readable cards; retain honest hearing-payments description. |
| `dc-advocate-summary` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `dc-advocate-waiting` | Add case context and dated progress; remove inappropriate call-design reference. |
| `dc-advocate-wallet` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `dc-client-accepted` | Use real advocate profile; keep current next-step card prominent and old events in details. |
| `dc-client-assistance` | Restore benefit tiles and support structure; retain chat/callback outline actions. |
| `dc-client-balance` | Use shared payment methods, summary with advance deduction and test-payment note. |
| `dc-client-cancel-filed-blocked` | Add case/current advocate context and Keep My Request action; preserve cancellation rules. |
| `dc-client-cancel-paid` | Add case/current advocate context and Keep My Request action; preserve cancellation rules. |
| `dc-client-cancel-unpaid` | Add case/current advocate context and Keep My Request action; preserve cancellation rules. |
| `dc-client-case-type` | Keep two-column illustrated case-type cards; replace old captures that still show plain radio rows. |
| `dc-client-chat-closed` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `dc-client-chat-reopened` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `dc-client-checklist` | Add matter context and next-step guidance; retain manual required/optional document selection. |
| `dc-client-completed` | Remove expanded historical fee/shipment cards from the primary view; retain final order and timeline. |
| `dc-client-court-fee` | Use shared checkout for client; add case context above advocate fee form. |
| `dc-client-decision` | Move acceptance below real advocate profile, conversation and case cards; add remaining free changes and before-choose note. |
| `dc-client-deposit` | Use shared payment methods and test-payment note, with advance separately identified. |
| `dc-client-details` | Preserve confirmed intake fields; retain section cards, visible labels and date picker. |
| `dc-client-documents` | Preserve file type cards; human document labels and side-by-side outline actions. |
| `dc-client-filed` | Use current-stage context and dated timeline; keep historical details collapsed. |
| `dc-client-final-viewer` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `dc-client-free-change` | Add current advocate and case cards before change reasons, confirmation and explanation. |
| `dc-client-hearing-0` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `dc-client-hearing-1` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `dc-client-information` | Make information its own structured page rather than appending prose to the landing page. |
| `dc-client-landing` | Restore benefit tiles, information/support cards and side-by-side service speed choices. |
| `dc-client-path` | Use two explanatory case-path cards and a support note. |
| `dc-client-pending-case-type` | Keep two-column illustrated case-type cards; replace old captures that still show plain radio rows. |
| `dc-client-pending-details` | Preserve confirmed intake fields; retain section cards, visible labels and date picker. |
| `dc-client-pending-documents` | Preserve file type cards; human document labels and side-by-side outline actions. |
| `dc-client-pending-path` | Use two explanatory case-path cards and a support note. |
| `dc-client-pending-pricing` | Service cards: large base price, three benefits, turnaround; move fee breakdown into request summary; add difference, before-submit and support cards. |
| `dc-client-pending-review` | Correct reference pairing: request review differs from pre-filing review. Add request summary/context and review guidance. |
| `dc-client-pickup-details` | Preserve confirmed intake fields; retain section cards, visible labels and date picker. |
| `dc-client-pickup-payment` | Use shared payment methods, purpose-specific summary and test-payment note. |
| `dc-client-pickup-tracking` | Separate current shipment from historical tracking cards; add case context to delivery form. |
| `dc-client-prefiling-approval` | Add case context before filing fields; keep offline-filing explanation and manual confirmation. |
| `dc-client-prefiling-correction` | Add case context before filing fields; keep offline-filing explanation and manual confirmation. |
| `dc-client-pricing` | Service cards: large base price, three benefits, turnaround; move fee breakdown into request summary; add difference, before-submit and support cards. |
| `dc-client-process-fee` | Use shared checkout for client; add case context above advocate fee form. |
| `dc-client-process-receipt` | Prioritize current receipt, with historical cards behind details and dated progress. |
| `dc-client-rating` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `dc-client-review-limit-support` | Correct reference pairing: request review differs from pre-filing review. Add request summary/context and review guidance. |
| `dc-client-review` | Correct reference pairing: request review differs from pre-filing review. Add request summary/context and review guidance. |
| `dc-client-success` | Add case summary and next-step information below payment confirmation. |
| `dc-client-terms-unavailable` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `dc-client-third-free-change` | Add current advocate and case cards before change reasons, confirmation and explanation. |
| `dc-client-type-examples` | Shared examples overlay; current case-type design remains visible underneath. |
| `dc-client-under-review` | Correct reference pairing: request review differs from pre-filing review. Add request summary/context and review guidance. |
| `hc-admin-change-approved` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `hc-admin-change-rejected` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `hc-admin-chat-reopen` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `hc-admin-classify-0` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `hc-admin-completion` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `hc-admin-hearing-settings` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `hc-admin-pending-verification` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `hc-admin-queue` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `hc-admin-rate-not-set` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `hc-admin-verification` | No court Figma supplied; retain existing admin panel style and verify one primary action per active form. |
| `hc-advocate-add-hearing-0` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `hc-advocate-checklist` | Add matter context and next-step guidance; retain manual required/optional document selection. |
| `hc-advocate-completion` | Add matter context above final-order action; retain admin confirmation and hearing-only earnings policy. |
| `hc-advocate-confirm-documents` | Preserve file type cards; human document labels and side-by-side outline actions. |
| `hc-advocate-court-fee` | Use shared checkout for client; add case context above advocate fee form. |
| `hc-advocate-fee-receipt` | Prioritize current receipt, with historical cards behind details and dated progress. |
| `hc-advocate-filing` | Add case context before filing fields; keep offline-filing explanation and manual confirmation. |
| `hc-advocate-handover` | Add matter context; retain NOC requirement and historical hearing earnings. |
| `hc-advocate-hearing-draft-0` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `hc-advocate-hearing-preview-0` | Correct reference pairing: request review differs from pre-filing review. Add request summary/context and review guidance. |
| `hc-advocate-hearing-ready-0` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `hc-advocate-prefiling-send` | Add case context before filing fields; keep offline-filing explanation and manual confirmation. |
| `hc-advocate-preparation` | Add matter context and dated progress while keeping task controls and private notes separate. |
| `hc-advocate-request` | Split client/matter/narrative context into readable cards; retain honest hearing-payments description. |
| `hc-advocate-waiting` | Add case context and dated progress; remove inappropriate call-design reference. |
| `hc-advocate-wallet` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `hc-client-accepted` | Use real advocate profile; keep current next-step card prominent and old events in details. |
| `hc-client-assistance` | Restore benefit tiles and support structure; retain chat/callback outline actions. |
| `hc-client-balance` | Use shared payment methods, summary with advance deduction and test-payment note. |
| `hc-client-cancel-filed-blocked` | Add case/current advocate context and Keep My Request action; preserve cancellation rules. |
| `hc-client-case-type` | Keep two-column illustrated case-type cards; replace old captures that still show plain radio rows. |
| `hc-client-change-payment-approved` | Use shared payment methods, purpose-specific summary and test-payment note. |
| `hc-client-change-payment-rejected` | Use shared payment methods, purpose-specific summary and test-payment note. |
| `hc-client-chat-closed` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `hc-client-chat-reopened` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `hc-client-checklist` | Add matter context and next-step guidance; retain manual required/optional document selection. |
| `hc-client-completed` | Remove expanded historical fee/shipment cards from the primary view; retain final order and timeline. |
| `hc-client-court-fee` | Use shared checkout for client; add case context above advocate fee form. |
| `hc-client-decision` | Move acceptance below real advocate profile, conversation and case cards; add remaining free changes and before-choose note. |
| `hc-client-deposit` | Use shared payment methods and test-payment note, with advance separately identified. |
| `hc-client-details` | Preserve confirmed intake fields; retain section cards, visible labels and date picker. |
| `hc-client-documents` | Preserve file type cards; human document labels and side-by-side outline actions. |
| `hc-client-filed` | Use current-stage context and dated timeline; keep historical details collapsed. |
| `hc-client-final-viewer` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `hc-client-hearing-0` | Add matter context and readiness/preview guidance; preserve real stored dates and manual readiness. |
| `hc-client-information-reply` | Keep undesigned clarification form in existing style, with inline error and case reference. |
| `hc-client-information` | Make information its own structured page rather than appending prose to the landing page. |
| `hc-client-landing` | Restore benefit tiles, information/support cards and side-by-side service speed choices. |
| `hc-client-paid-change-approved` | Add current advocate and case cards before change reasons, confirmation and explanation. |
| `hc-client-paid-change-rejected` | Add current advocate and case cards before change reasons, confirmation and explanation. |
| `hc-client-path` | Use two explanatory case-path cards and a support note. |
| `hc-client-pending-case-type` | Keep two-column illustrated case-type cards; replace old captures that still show plain radio rows. |
| `hc-client-pending-details` | Preserve confirmed intake fields; retain section cards, visible labels and date picker. |
| `hc-client-pending-documents` | Preserve file type cards; human document labels and side-by-side outline actions. |
| `hc-client-pending-path` | Use two explanatory case-path cards and a support note. |
| `hc-client-pending-pricing` | Service cards: large base price, three benefits, turnaround; move fee breakdown into request summary; add difference, before-submit and support cards. |
| `hc-client-pending-review` | Correct reference pairing: request review differs from pre-filing review. Add request summary/context and review guidance. |
| `hc-client-prefiling-approval` | Add case context before filing fields; keep offline-filing explanation and manual confirmation. |
| `hc-client-pricing` | Service cards: large base price, three benefits, turnaround; move fee breakdown into request summary; add difference, before-submit and support cards. |
| `hc-client-rating` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `hc-client-reassigned-no-second-balance` | Use shared payment methods, summary with advance deduction and test-payment note. |
| `hc-client-review` | Correct reference pairing: request review differs from pre-filing review. Add request summary/context and review guidance. |
| `hc-client-success` | Add case summary and next-step information below payment confirmation. |
| `hc-client-terms-unavailable` | Shared or undesigned screen; preserve existing component and honest unavailable/empty states. Remove unrelated court reference pairing. |
| `hc-client-type-examples` | Shared examples overlay; current case-type design remains visible underneath. |
| `hc-client-under-review` | Correct reference pairing: request review differs from pre-filing review. Add request summary/context and review guidance. |

Validation status: layout changes and local browser journeys complete; 151 comparisons regenerated. Full API 235/235, shared 30/30, infrastructure 12/12 and routes 349/349 pass. App builds/typechecks pass. Release results are recorded in [the polish report](../../reports/court-polish-20261114/README.md).
