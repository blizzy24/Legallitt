# Round 2 resumption audit — 14 November 2026

Branch `round2-built-services-20261113`, base `0e58efa`; implementation commit
`7bc60d0`. Unrelated FIR-flow edits and older reports are excluded from the release.
This audit describes local verification; deployment evidence is recorded separately.

| Requirement | Implementation inspected | Evidence already passed |
|---|---|---|
| Confirmed PS ₹499/999; DF ₹1499/2999, exact totals | `seed-round2.ts`, manifest, `report-tariffs.ts`; insert-only rows and optimistic admin edits | `round2-settings.cjs`, four browser payment journeys |
| Same PS price for every search duration | Tariff keyed by service/tier, variant null; intake duration does not select a price | Pricing/API tests |
| Editable turnaround | Versioned workflow settings, working/calendar-day calculation; pinned case policies | Settings tests and request/delivery screenshots |
| Permanent counterpart phone privacy | Output interceptor, case projection, notification sanitisation, generated PDF inputs, private legacy generated-PDF copies | HTTP privacy, FIR, signature/PDF and isolation tests |
| Support hours/callback | Versioned `support_policies`, authenticated read/admin update, mobile support and admin editor | `admin-walk.log`, settings role/stale tests |
| PS quality review | Shared stage list, exact submitted version, admin approve/return, retained old releases | `report-property.log` |
| PS no records | Office-note-only or additional-note submission; approval sends chat and notification; no refund | `report-no-records.log` |
| DF external examination | Optional name/organisation reaches report PDF; advocate signs affidavit | `report-forensic.log`, API report tests |
| DF original request | Reason/instructions, acknowledge, sent note, receipt; paused until receipt; receipt remains visible | `report-original.log`, workflow isolation tests |
| LN family details/no age | Separate optional fields, strict API schema, historical data retained but projected out, renderer strips old age | Intake/shared/PDF tests; `notice-intakes.log` |
| Company and cheque bounce | Optional designation, required cheque fields and two required document kinds, 2000-character narrative, type slots | Company/email and cheque/all-method browser cases; schema/API validation |
| Reminders/revisions | 24h/72h idempotent reminders, 7-day queue; unlimited changes, alert at three | `admin-walk.log`, `notice-admin-flow.cjs` |
| Deadlines/admin remedies | Payment-derived 5/10-day deadline; dashboard, admin extend/reassign/partial simulated refund and audit | Overdue/extension browser checks; API role and refund tests |
| Signature/submission | Versioned own-profile image or labelled test e-sign; fixed PDF placement; exact-version submission; chat locks | `notice-drafts.log`, `round2-signatures.cjs` |
| Admin return | Corrected version requires re-sign and resubmit, without new client approval | `notice-admin.log` |
| AI summary | Honest placeholder card; no fabricated result | Advocate document captures |
| Replies | Client/admin upload, assigned advocate visibility, notification and timeline | `notice-replies.log` |
| Retry fees/wallet | Courier ₹179 platform-only; electronic retry free; wallet still credited at delivery | `notice-delivery.log`, wallet assertion in API lifecycle test |
| Cancellation | Full simulated refund before acceptance; admin decision after acceptance; blocked after dispatch, including late approval of pending cancellation | `notice-cancellation.log`, `report-cancellations.log`, API cancellation tests |
| FIR scope | No consultation/slot UI in FIR routes/features; only a shared-picker comment mentions consultation | Source search and FIR full-flow regression |

## Remaining release gates

- Local gates passed: API **224/224**, shared **30/30**, authenticated routes
  **348/348**, both frontend typechecks/builds, final screen states and journeys.
- Comparisons: PS **68**, DF **88**, LN **168**, including retained unchanged
  screens for context. Only the Round 2 implementation and evidence are staged.
- Push image; run the two additive migrations; deploy dev stack and both Vercel
  projects; activate `seed-round2` only after compatible code serves.
- Verify live deployment and new synthetic checks, push final evidence, prune Docker.

## Explicit limits

The privacy projection removes known counterpart phone text from API/notification
outputs and app-generated PDFs, including supported old generated PDFs. It does
not OCR arbitrary uploaded/scanned evidence or identity images. Original evidence
objects remain intact. This is not a claim that all incidental personal information
inside an uploaded image can be detected automatically.

DF urgent means calendar days pending confirmation; original-document destination
comes from advocate instructions and no postage fee is invented. Partial-refund
cases remain open. LN wallet timing stays at delivery pending I.5. Test payments,
refunds, test e-sign and manually recorded courier/WhatsApp events remain labelled.
