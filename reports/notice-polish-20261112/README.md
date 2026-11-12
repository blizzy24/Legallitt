# Legal Notice polish and rollout — 12 November 2026

Deployed API source image: `733af89`. Frontend implementation: `c803019`,
rebuilt successfully at `733af89` with identical frontend source.

## Deployment

- Pushed the ARM64 API image to ECR; digest
  `sha256:34737ccc298887b0c8b179d817e9fb1e367ea349fc0c21936a256e56ea27baab`.
- Ran `dev-ops-task.sh migrate 94d8836` from Git Bash before updating the stack.
  Both `202611130020_notice_admin_dispatch` and
  `202611130021_notice_deadline_backfill` applied successfully.
- Updated `LegalittDev-Compute-DevelopmentOnly` through changeset
  `notice-94d8836`. ECS reports the expected image running and healthy.
- Pushed `main` to GitHub at `c803019`; both existing Vercel integrations
  successfully deployed that frontend revision. See `vercel-c803019.json`.
- Corrected the live preflight omission with image `733af89`, digest
  `sha256:b00cf5874656be16e4ef8710e5350cd2bb096d898828b2a02000d7600fc2c7c5`.
  Ran migrations with that image (exit 0; no pending migrations), then applied
  changeset `notice-733af89`. Stack update completed and ECS is healthy on the
  expected image. Live preflight now returns `PUT` for the configured client
  origin. Both Vercel deployments succeeded for `733af89` too.

The visual refinement commits through `c803019` leave API/shared image inputs
unchanged from `94d8836`. The subsequent `733af89` fix adds `PUT` to the existing
configured-origin CORS contract and shares that configuration with local browser
acceptance. No Core or production stack was changed.

## Live-check correction

The first live intake exposed an omitted `PUT` in production's CORS methods.
Local acceptance had used Nest's default method list, hiding the mismatch.
The browser correctly displayed a connection error, but could not save filing
details. The failed preflight is retained in `preflight-before.txt`; the failed
browser runs are retained in `live-intakes*.txt`. The fix does not broaden the
origin list or change authentication, ownership or role checks. A Nest HTTP
regression test proves the filing preflight works for the configured site and
does not admit an untrusted origin. Production and local acceptance now share
the same CORS factory. Build and regression logs are `preflight-api-build.txt`
and `preflight-tests.txt`.

## Visual changes

- One main filled action per actionable screen; secondary navigation, messaging,
  support, preview and downloads use outline buttons or links.
- Landing hero extracted from the supplied design, radio option cards, and icon
  buttons for Request Chat and Request Callback.
- Human delivery/document labels, no internal identity filenames, and IST dates
  such as `17 Nov 2026, 8:11 PM`.
- Timeline details and timestamps come from real recorded events. Cancellation
  is a small bottom link when the case is still eligible for a request.

The [23 side-by-side comparisons](../../docs/flows/ln-screens/README.md) and
[gap report](../../docs/flows/LEGAL-NOTICE-GAPS.md) include the implementation evidence.

## Local verification

| Check | Result |
|---|---|
| Full API suite | 208 passed, 0 failed, 0 skipped; isolated `legalitt_notice_test_polish` |
| Browser preflight regression | 1 passed; configured origin permits filing PUT, untrusted origin not admitted |
| Shared package, including service route queries | 26 passed |
| Infrastructure | 12 passed; CDK synthesis passed |
| Mobile route smoke | 347 routes, no failures; real local API sessions |
| Client/advocate/admin builds and type checks | Passed |
| Browser walkthrough | Courier, email, all three methods; cheque bounce; decline/reassign; client changes; admin return; test e-sign; failed address, retry, tracking, proof and once-only advocate credit passed |
| Visual assertions | Hero loaded; cards select without navigating; at most one filled primary action; safe ID labels; timestamp/detail timeline; real PDF viewer passed |

Logs are in `reports/notice-flow-20261112/polish-*.txt`. The local browser report
is `reports/notice-flow-20261112/local/browser-results.json`. Original cancellation,
isolation and five-state acceptance evidence remains in that report directory.
Local storage/email are explicit test adapters. Payments and e-sign are simulated;
no parcel or external message was sent during these checks.

## Live verification — passed

Verified on `legalitt-5.vercel.app` and `legalitt-admin-panel.vercel.app` against
API image `733af89`. The [synthetic courier case](https://legalitt-5.vercel.app/legal-notice/tracking?caseId=8d7a1854-330b-466c-bef1-4d6f4d2b9b2d)
completed the following browser walkthrough:

- Client filing, real uploads/review, ₹1,652.53 test payment and tracking.
- Advocate decline → admin reassignment → acceptance → manual draft/PDF.
- Client Request Changes → revised PDF → approval → admin handoff; chat read-only.
- Admin contact check → return to advocate → corrected version → notice check →
  labelled test e-sign → dispatch.
- Failed courier delivery → client corrects address → admin verifies → ₹179 test
  redelivery payment → tracking → uploaded proof → delivery confirmation.
- Exactly one ₹999 advocate ledger credit; no real bank payout.
- Hero image, selectable radio cards, button hierarchy, safe document labels,
  minute-only dates, completed timeline detail lines and shared PDF viewer passed.
- Both clients received **404** for the other's case and notice-flow endpoints;
  direct browser URLs exposed neither the foreign reference nor case details.
  The replaced advocate also received **404**. Three existing dispatch/completed
  cases opened through the migrated flow. No uncaught browser errors.

Evidence: [browser results](live/browser-results.json), [isolation results](live/isolation.json),
[live screenshots](live/screens/), and the `live-*.txt` logs. In particular:
[landing](live/screens/client-landing.png), [tracking](live/screens/client-tracking-polished.png),
[PDF viewer](live/screens/client-document-viewer-final.png),
[admin proof check](live/screens/admin-tracking-proof-courier.png), and
[advocate credit](live/screens/advocate-credit-courier.png).

The three delivery-method combinations and cancellation were exercised locally;
the live end-to-end case is courier-only. Email delivery is not claimed as passed
on the live site because SES lacks a verified sender. Payments, e-sign and courier
records are explicitly test/synthetic; no money moved and no parcel was sent.

## Integration limitation

SES has no verified identity in `ap-south-1` (read-only check on 12 November).
Deployed email dispatch must report the missing sender and send nothing. This
rollout does not create a sender, change credentials or claim successful email delivery.
WhatsApp stays manually recorded; e-sign remains a labelled test step.

## Build recovery

Docker Desktop timed out fetching Docker Hub and public ECR blobs. The host-side
helper fetched the same official ARM64 Node image and verified the manifest,
compressed layer hashes and uncompressed layer hashes before `docker load`.
No TLS verification was disabled and the Dockerfile/base-image selection was unchanged.
Both requested Docker prune commands ran after each completed image build. The
temporary dependency proxy was stopped and its 584,230,787-byte generated download
cache was removed. A final post-verification prune is recorded in `final-prune.txt`.
