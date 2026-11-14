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

Implementation `5691149`; comparison/test evidence `3942464`. Both are on main.
The existing API image `a10fde9` was reused because API/shared runtime code is
unchanged. Migration task `dd7405dbddc049c2be2acc307d5dd351` exited 0 before
the stack update. Change set `court-a10fde9` updated only the API service and
API/ops task definitions. API task definition `legalitt-dev-api:29` is healthy
on the expected image digest.

Both production Vercel deployments succeeded:

- Client: [9zuesFQgJzkhnudRw6YdUzybiyjb](https://vercel.com/blizzard7/legalitt/9zuesFQgJzkhnudRw6YdUzybiyjb).
- Admin: [HfXfTFBunoARFU472jCSMi3iDkHy](https://vercel.com/blizzard7/legalitt-admin-panel/HfXfTFBunoARFU472jCSMi3iDkHy).

After both frontends were ready, `seed-courts a10fde9` completed with exit 0
(task `3b1efba13bec4c9bb0f24170b5e8542c`). The live check read both services'
hearing rates and confirmed effective/passive rates are still **NOT SET**.

Live production-alias browser checks passed for newly created synthetic requests:

- District Court Ordinary: `DC-2026-00001`, case
  `967ac2d0-ca00-47aa-9eac-754295084ae3`.
- High Court Urgent: `HC-2026-00001`, case
  `555ba606-d32f-4739-aac9-7ae87f53f325`.

Both passed intake, synthetic document upload, service pricing, shared checkout,
the ₹2,000 simulated advance, payment confirmation, tracking and admin case view.
The checks asserted simulated payment before paying; no real money moved.
Both cases remain under review for identification as release-check data. Existing
cases and credentials were untouched. [Live screenshots and results](live/)
and [execution log](../court-20261114/polish-live.log) record the checks.

The full lifecycle checks listed above ran locally; live checks deliberately
stopped after payment/admin verification as requested. No required work remains.

Both required Docker prune commands completed successfully (0 B reclaimable).
