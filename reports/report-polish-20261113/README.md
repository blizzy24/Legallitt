# Property Search and Document Forensic polish — 13 November 2026

Implementation: `3a7631d`, with a subsequent final action-row/evidence commit.
Baseline: frontend `f7f090a`, API `1bff6f2`.

## Scope

Client intake, payment headers, tracking and delivered reports; advocate request,
decline sheet, accepted case, editor/upload, affidavit, review/send and completion;
admin queue and review panels. Header status/menu, button hierarchy, dates,
document metadata, contact formatting, focus/pull refresh and five screen states
were checked. Report sharing supplies an actual PDF file and falls back to download.

Two additive API response fields were needed: generated preview page/byte counts,
and contact details for the assigned advocate after acceptance. Existing case
authorization still applies; the latter is null before acceptance and for other
roles. There are no new endpoints, migrations, price/status/business-rule changes,
credential changes or edits to existing deployed cases.

## Local validation

| Check | Result | Evidence |
|---|---|---|
| Full API suite | 213 passed, 0 failed | [Log](api-suite.log) |
| PS/DF regression subset | 10 passed, 0 failed | [Log](api-tests.log) |
| Shared package | 30 passed, 0 failed | [Log](shared-tests.log) |
| Authenticated mobile routes | 347 passed, 0 failed | [Log](routes-final.log) |
| API/mobile/admin TypeScript | Passed | Build/type logs in this folder |
| Six fresh primary synthetic cases | All requested journeys passed | [State and results](local/state-polish.json) |

PS Ordinary/editor and Urgent/PDF upload covered admin more-details, advocate
decline/reassignment/acceptance, chat document request, delivery, PDF view/download,
and exactly one wallet credit. DF with and without a reference sample covered
information requests, report/affidavit, admin corrections, resubmission and approval.
One cancellation before acceptance per service completed a simulated full refund.
Foreign-client direct URLs/files and unassigned-advocate actions remained denied.

Additional checks passed: file-sharing payload and fallback download, actual browser
pull gesture/focus refresh, affidavit Edit Text/Add Info/Save reaching the PDF,
typed/drawn Re-sign, metadata, delayed upload/save, payment resumption, image upload,
and loading/empty/partial/error recovery. Supplemental visual cases remain synthetic
drafts; they were not deleted or passed off as client work.

## Screenshots

142 comparisons, with untouched designs beside real local browser captures:
[PS index](../../docs/flows/ps-screens/README.md) and
[DF index](../../docs/flows/df-screens/README.md).
Screens without a separate design are labelled. The architecture §9.2 records the
admin presentation changes. [PS gaps](../../docs/flows/PROPERTY-SEARCH-GAPS.md) ·
[DF gaps](../../docs/flows/DOCUMENT-FORENSIC-GAPS.md).

## Deployment

Pending until the image, stack, both frontend deployments and live synthetic checks
are verified. No migration is required for this pass.

## Limits and simulations

Payments/refunds are explicitly simulated; wallet credits are recorded entitlements,
not bank transfers. Local storage/external services use test adapters. Affidavit
signature remains labelled “Not an e-sign or notarisation.” Browser sharing verifies
the PDF File payload with the OS-share call intercepted, plus a real fallback file
download. Native sharing and camera permission/capture still require a physical-device
check; native APIs compile, but no device walkthrough is claimed.
