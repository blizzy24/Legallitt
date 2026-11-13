# Property Search and Document Forensic polish — 13 November 2026

Implementation: `3a7631d`; final action-row and local evidence: `3b42e97`.
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

API image `3a7631d` is pushed and deployed to
`LegalittDev-Compute-DevelopmentOnly` (`UPDATE_COMPLETE`). The running ARM64 image
is healthy and its digest matches
`sha256:a50d85e1fd4e1cf04bd00b91fe281e64ba2415dcfadde13221c4478e93879b54`.
No migration was required or run. The change set modified only ECS service/task
definitions. No settings or pricing seeds ran.

Commit `3b42e97` was pushed to `origin/main`, triggering the existing GitHub-linked
Vercel deployments. Both completed successfully: [client/advocate](https://vercel.com/blizzard7/legalitt/FLe2A2bzms1RRzDg47qjNUotJDtw)
and [admin](https://vercel.com/blizzard7/legalitt-admin-panel/J8NVA16C9Kmo9AQjdBD17ApcK6HH).
The full live run passed. Post-build/deploy pruning reclaimed 1.26 GB of builder cache and
397.6 MB of unused images; the local PostgreSQL container remains intact.

Public Debian mirror downloads stalled during the standard image build. The
deployment-specific [fallback Dockerfile](Dockerfile.runtime-reuse) rebuilds the
shared package and API inside the pinned, previously deployed `1bff6f2` runtime.
[Dependency guard](check-runtime-lock.cjs) verifies unchanged API/shared importers
and every existing lockfile resolution/snapshot. Only mobile dependencies were
added. No host-generated binaries or credentials enter the image.

## Live acceptance

The [complete live browser run](walk-live.log) passed on both deployed sites with
zero unhandled browser JavaScript errors. [Screenshots and case/assertion index](live/README.md).

- PS Ordinary/editor and Urgent/upload: more details, decline, reassignment,
  acceptance, chat/document exchange, direct delivery, viewing/download and one wallet credit.
- DF with and without reference sample: information request, checklist, report,
  affidavit, correction/re-sign/resubmission on the first case, approval and release.
- All four: file sharing/fallback, focus/pull refresh, collapsed details, wallet and
  foreign-client/unassigned-advocate isolation. One pre-acceptance cancellation per
  service completed its simulated refund.
- Upload/save races, checkout resumption, image viewing, empty/partial/loading/error
  recovery and affidavit text/signature/PDF metadata controls all passed.

The read-only before/after check confirms all **20 pre-existing PS/DF cases** retained
their statuses and update timestamps. [Preservation result](preservation.log).
Only new synthetic cases were exercised. No pricing/settings, real payments,
credentials or existing filings were changed. Docker pruning was repeated after
the live checks; no unused cache/images remained.

## Limits and simulations

Payments/refunds are explicitly simulated; wallet credits are recorded entitlements,
not bank transfers. Local storage/external services use test adapters. Affidavit
signature remains labelled “Not an e-sign or notarisation.” Browser sharing verifies
the PDF File payload with the OS-share call intercepted, plus a real fallback file
download. Native sharing and camera permission/capture still require a physical-device
check; native APIs compile, but no device walkthrough is claimed.
