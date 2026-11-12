# Legal Notice — local verification, 12 November 2026

Branch: `legal-notice-flow-20261112`, based on `6911cfc`. No deployment or push
was performed. Existing unrelated working-tree changes were preserved.

## Results

| Verification | Result | Evidence |
|---|---|---|
| Full API suite, fresh isolated database | 208 passed; zero failures/skips | [API output](api-tests.txt) |
| Shared package, including routing regression | 26 passed | [Shared output](shared-tests.txt) |
| Infrastructure synthesis/permissions | 12 passed | [Infra output](infra-tests.txt) |
| Final send-race, expiry, redelivery and role/isolation checks | 3 passed | [Focused output](concurrency-isolation-tests.txt) |
| Mobile/admin typechecks | Passed | [Mobile](mobile-types.txt), [admin](admin-types.txt) |
| API/mobile/admin builds | Passed | [API](api-build.txt), [mobile](mobile-build.txt), [admin](admin-build.txt) |
| Offline native PDF HTML | Two Devanagari pages, paging/zoom, no external requests | [Result](local/native-pdf-results.json) |
| Browser walkthrough | All three methods/cases, client changes, admin return, failure/retry, cancellation and wallet credit | [Stage results](local/browser-results.json) |
| QR checkout recovery | Loading/error/empty and already-captured recovery | [Output](checkout-states.txt) |
| Unfinished upload recovery | Explicit quote block; remove unfinished upload and recalculate without charging | [Output](blocked-payment.txt) |

The [gap analysis](../../docs/flows/LEGAL-NOTICE-GAPS.md) records each implementation
area, scenario and local case ID. [Side-by-side comparisons](../../docs/flows/ln-screens/README.md)
show the original supplied exports beside actual local browser captures.

## What the walkthrough proves

- Courier-only, email-only and all-three-method/cheque-bounce filings persisted
  their actual fields and documents, charged the selected delivery fee, and
  reached completion through real client, advocate and admin screens.
- An advocate declined with a reason; admin reassigned; the replacement accepted.
  The client requested changes and approved the revision. Chat became read-only.
- Admin returned one notice; its correction went back to admin, with the same
  client approval retained. Admin checked the pinned PDF and requested test e-sign.
- Dispatch recorded each selected method. Courier tracking and POD were uploaded.
  Failed courier delivery retained its history, requested a new address, required
  admin verification and a separate ₹179 test payment, then completed successfully.
- Each completed case appears exactly once in the completing advocate's real
  wallet API and screen, at ₹999. Courier retry creates no extra advocate credit.
- Cancellation before acceptance recorded a full simulated ₹1,652.53 refund.
- Saved intake resumed after navigation/reload. All six advocate sections reached
  the generated PDF. AI suggestions remained labelled test output and unsaved
  until the advocate chose to apply/save them.
- Loading/error captures cover the intake, review, payment, tracking/delivery,
  advocate and admin workflow. Empty/partial/validation and quote-blocked recovery
  are captured separately. The checkout has its own failure/loading/empty checks.

## Boundaries

The local harness runs actual Nest handlers, PostgreSQL, authentication, upload
inspection and PDF generation. Storage, payments, AI and external email are test
adapters; courier and WhatsApp records are entered manually. No real money moved,
no SES/WhatsApp message was delivered, and no digital signature was applied.

The real SES adapter and optional sender-scoped Dev Compute configuration are
implemented. Enabling them still needs an already verified sender/identity and a
separate authorised deployment. SES acceptance alone does not mark a notice delivered.

The native viewer's exact offline HTML was tested in Chromium. Android/iOS
hardware was not exercised. No Docker build was used.

## Reproduction

Use Git Bash and Node 22. Local AWS authentication uses the existing configured
demo secret; do not rotate credentials. The scripts refuse a non-loopback database.

1. Build shared/API; migrate and base-seed a fresh `legalitt_notice_test_*` using
   `scripts/notice-local-database.cjs` (`NOTICE_TEST_DATABASE` selects the test DB).
2. Run `scripts/notice-local-tests.cjs`; named API test files may be passed.
3. Build mobile web into `apps/mobile/dist/notice-verification` with API URL
   `http://127.0.0.1:3003`, data source `api`; build admin into its matching directory
   with the same API base URL.
4. Start `scripts/notice-local-server.cjs`. It serves API `3003`, mobile `8083`,
   admin `5174` and isolated synthetic file storage. It sends no external email.
5. Run `scripts/verify-legal-notice-local.cjs` by stage (`--only=intakes`, `drafts`,
   `admin`, `delivery`, `cancellation`, `evidence`, `final-smoke`, `checkout-states`,
   `blocked-payment`). `local/state.json` is an evidence ledger, not a database reset;
   completed stages need not be replayed against already-completed cases.
6. Run `scripts/notice-screen-comparisons.cjs` to render comparison PNGs/HTML.

The existing cancellation fixture and case IDs in this evidence ledger are local
to this run. On a different database, create a separate paid synthetic notice for
cancellation; do not reuse IDs from this report or modify an existing client's case.
