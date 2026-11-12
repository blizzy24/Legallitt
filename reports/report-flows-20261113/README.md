# Property Search / Document Forensic acceptance — 13 November 2026

Local gate passed. No deployment is claimed by this document yet.

| Check | Result | Evidence |
|---|---|---|
| Full API regression | 213 passed, no failures/skips | [API log](api-suite-final.log) |
| Shared contracts/routing | 30 passed | [Shared log](shared-tests.log) |
| Authenticated route smoke | 347 routes, no failures | [Smoke log](mobile-smoke.log) |
| Mobile/admin types and exports | Passed | [Mobile](mobile-typecheck.log), [admin](admin-typecheck.log), [exports](mobile-build.log) |
| Requested journeys | Four delivered cases; two pre-acceptance cancellations | [Fresh browser walk](walk-final.log), [case/result record](local/state-final.json) |
| Human completion labels | Passed all four cases | [Completion log](completion.log) |
| Gallery and image viewer | Real upload persisted; “1 image” displayed | [Gallery log](gallery.log) |
| Versioned upload limit | Admin UI changes new cases only; API rejects oversize | [Browser settings](settings.log), [API checks](upload-policy-tests.log) |
| Legacy inventory | Seven existing cases across draft, payment-pending, completed and cancelled/refunded states | [Read-only inventory](legacy-inventory.json) |
| Saved payment-pending tracking links | Both services resume shared checkout and Scan & Pay | [Legacy payment check](legacy-payment.log) |
| Endpoint and direct-URL isolation | Foreign client/unassigned advocate denied; admin settings denied to other roles | [Isolation check](isolation.log) |
| Browser JavaScript errors | None in final checks | [Errors](local/browser-errors.json) |

Property Search covered Ordinary/Urgent, admin more details, decline/reassignment,
requested-document chat, editor PDF and uploaded PDF, client viewer/download,
outsider isolation and one exact advocate-share wallet entry per case.

Forensic covered reference/no-reference, more information, manual file checks,
four report sections and summary, typed affidavit, admin return to Waiting,
new signed version, exact-version approval, both client files and one wallet entry.
Drawn marks and their PDF rendering are also covered by the API suite.

Both paid pre-acceptance cancellations produced one full **simulated** refund.
Empty/partial intake, loading, deliberately injected HTTP failure and Retry were
checked in the browser. No real client filing or money was used.

[Property comparisons](../../docs/flows/ps-screens/README.md) ·
[Forensic comparisons](../../docs/flows/df-screens/README.md)

The local environment uses `legalitt_report_local` and `legalitt_report_test`,
with real handlers/PDF rendering and test storage/payment/email/AI adapters.
Wallet credit is an entitlement, not a bank transfer. Device camera capture still
needs a physical-device check; browser Gallery/Files are verified. The local-only
unshipped policy seed was corrected from MiB to the specified 25,000,000-byte
default without deleting any cases or files.

Architecture §4.7a records defaults: Mon–Fri IST without public holidays; Full
Record at the existing tariff; admin decides unavailable-record refunds; no
retroactive extra charge for requested supplemental files; admin manually checks
advocate suitability. Property email remains unavailable until a sender is
configured. Forensic examination belongs to the advocate; the signature is an
author mark, not certificate signing/notarisation. Pricing remains provisional.

Earlier troubleshooting logs and failure captures left locally are not the final
acceptance result. The files linked above are the final evidence.
