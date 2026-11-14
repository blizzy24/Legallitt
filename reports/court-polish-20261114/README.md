# Court design polish — 14 November 2026

Implementation: `5691149` on `overnight-court-20261114`.

This pass changes frontend presentation and the existing Terms route registration.
It does not change court prices, policies, statuses, API handlers or schema.
The API artifact for release remains `a10fde9`; its previously unshipped court
migration must run before the stack update.

## Screens

- Client: landing/information, new/pending path, service selection and request
  summary, advance/balance/pickup/change/court/process checkout, advocate decision,
  cancellation/change requests, checklist/review context, current-stage tracking,
  completion and payment confirmation.
- Advocate: request and client-filing cards, matter context on action forms,
  dated case progress and screen-specific headings.
- Shared: checkout method controls reused by court and existing service checkout;
  Terms added to the authenticated route registry. No case-data visibility rule changed.
- Admin: existing court panel retained; journey screenshots recaptured. No new
  admin design was invented in this pass.

The [visual audit](../../docs/flows/COURT-GAPS.md#visual-gaps--14-november-2026-polish-pass)
lists all 151 comparisons. The [comparison index](../../docs/flows/court-screens/README.md)
has been regenerated, including corrected Figma pairings for request review,
under-review, advocate checklist and other incorrectly matched captures.

## Local verification

All browser checks use new synthetic cases in `legalitt_report_local`.
API tests use the separate `legalitt_report_test` database.

- Full API: 235 passed in the isolated final run. Focused court: 11 passed.
  Shared: 30 passed.
  Infrastructure: 12 passed. Routes: 349 passed.
- Mobile and admin builds/typechecks passed.
- DC Ordinary and HC Urgent: intake, saved data/uploads, advance, assignment,
  client acceptance and exact balance payments passed.
- Free reassignment, paid-change rejection/approval and NOC handover passed.
- Checklist, upload, pickup payment/manual booking, physical receipt, preparation,
  client corrections/revised review, court/process fees and receipts, filing passed.
- Hearing drafts stay private; published updates, effective/passive credits,
  final order/admin confirmation, client viewing/download and feedback passed.
- Unpaid/paid cancellation, partial test refund, third free-change task, review
  limit/unlock, decline/reassignment and filed-case cancellation block passed.
- Pending-case NOC-later and admin request-for-information/verification passed.
- Final PDFs are valid; another client receives 404. Wallet totals are exact,
  hearing-only, with no completion credit. PNG downloads retain bytes/extension.
- Completion plus seven days closes chat; admin reopening passed.

The first full API run found the missing Terms registry entry (fixed). A later
run hit the existing 5-second transaction timeout under concurrent browser/build
load (5,035 ms). No API timeout was changed. The final isolated run passed all 235.

## Release

Not deployed yet. API build and focused court verification passed; release is next.
Live checks will create only new labelled synthetic DC/HC cases through the
test advance payment and verify both admin views and NOT SET hearing rates.
