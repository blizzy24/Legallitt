# Legal Notice polish and rollout — 12 November 2026

API source image: `94d8836`. Deployment is in progress; live results will be added here.

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
