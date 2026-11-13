# Property Search — flow comparison and acceptance

## Round 2 — 14 November 2026

The 13 November answers supersede conflicting earlier conclusions below. Confirmed versioned ₹499/₹999 bases and 4–6/2–3 working-day windows; permanent phone privacy; exact-version admin approve/return and Quality Review; office-note-only records-unavailable outcome with chat/notification and no refund. Browser journeys passed for editor return/resubmit, uploaded PDF, office note, downloads, wallet and cancellation.

[Requirement audit](../../reports/round2-20261113/AUDIT.md) · [Round 2 record](ROUND2-BUILT-SERVICES.md). Deployment status is recorded there; earlier deployment sections refer to the previous release.

## Visual polish — 13 November 2026

Baseline: `f7f090a` (API `1bff6f2`). Presentation-only changes, apart from
additive preview metadata and accepted-advocate contact fields. No tariff,
workflow, migration or existing-case data changes. New synthetic cases only.

| Surface | Polish applied |
|---|---|
| Tracking | Request/status card, Stage X of 6, checked/current/pending timeline with dated details, one expected date, outline Chat/Support row, cancellation in the menu, collapsed request details |
| Delivered | Success badge, Report Ready, View Report primary, Download/Share file actions, optional note, chat closing date and collapsed timeline/details |
| Advocate request | Client avatar/contact privacy, property tiles, owner/scope cards, document metadata, advocate amount only, Decline/Accept footer and required-reason sheet |
| Advocate work | Header status/menu, focus/pull refresh, outline save/preview actions, upload metadata, human labels, sent confirmation |
| Intake / admin | Chosen-speed summary with Change; dated admin progress and review information; refresh on focus/pull |

Current-pass results and deployment evidence: [polish report](../../reports/report-polish-20261113/README.md).
Updated comparisons: [screen index](ps-screens/README.md).

Polish acceptance passed: API 213/213, shared 30/30, routes 347/347, and all 42
live browser/API assertion groups. API `3a7631d` and frontend `3b42e97` deployed.
All 20 pre-existing PS/DF cases retained their statuses and update timestamps.

## Original flow rebuild acceptance

Comparison started 12 November 2026 against `f3a16b0`. **Local and live acceptance passed. Dev API and both Vercel sites deployed.**
Precedence: owner instruction → Ishaan's 12 November answers → current Property
Search flow/shared flows → `design/figma-2026-11-12/Property-Search-Report-*`.
Older numbered designs and earlier §4.7 assumptions are superseded where they conflict.

## Observed gaps

| Surface | Current implementation inspected | Required change | Status |
|---|---|---|---|
| Landing / speed | Generic `reports/ClientScreen.tsx`; estimates are constants in `service-reports.ts` | Supplied illustration, radio method/speed cards, icon support actions; exact tariff amounts and configurable Ordinary/Urgent delivery windows | Implemented; local/live checks below |
| Intake | Address exists; purpose is conflated with free-form requirement; owner names and Other detail absent | Distinct required address/purpose, optional owner names and what-to-check, Other detail, LGD selectors, optional documents; explicit Continue; resumable saves | Implemented; local/live checks below |
| Review/payment/success | Generic report checkout directly captures a demo payment; raw tier and filenames reach views | Designed review and shared checkout/QR/success; Start Tracking and Home; exact paise; human labels | Implemented; local/live checks below |
| Admin verification | Assignment exists; no sufficiency check or client correction task | Verification stage, reasoned “We need more details”, client Edit/reply, verify before assignment; overdue display | Implemented; local/live checks below |
| Client tracking | Generic lifecycle summary rather than six designed stages | Submitted → Paid → Verification → Assigned → Preparation → Delivered, event timestamps/details and policy deadline | Implemented; local/live checks below |
| Advocate request | Accept/decline exists in generic screen | Designed details, payout only, masked contact before acceptance, explicit decline/reassignment | Implemented; local/live checks below |
| Document requests | Paid client files are unconditionally frozen in `report-access.ts` | Scoped request/reply uploads in chat, preserve original evidence, pause/resume deadline | Implemented; local/live checks below |
| Editor | Eight-section research model exists; client/property sections read-only and owner/findings flattened | Current eight-section design, all authored fields rendered, structured checked-records/findings, explicit personal sign-off and wording-only AI suggestions | Implemented; local/live checks below |
| Delivery | `submit()` rejects editor output and requires a second final upload | Either editor PDF or uploaded PDF; shared viewer/preview; note; direct release without admin review; one wallet credit; correction version without second credit | Implemented; local/live checks below |
| Chat | Existing case thread has no report delivery+7-day policy/reopen control | Acceptance through delivery+7 days, visible read-only reason, audited admin reopening | Implemented; local/live checks below |
| Presentation | Generic dates include seconds; raw document filenames/status/tier values; multiple filled actions | One main action, outlined/text secondary actions, human labels and IST minute dates, all five states | Implemented; local/live checks below |
| Existing cases | No mapping to the newly required verification/deadline stages | Additive policy/state migration; retain prices/files/versions and safely open/finish old paid and completed cases | Implemented; local/live checks below |

Existing capabilities retained: real case ownership, LGD provenance, uploads and
page counting, immutable price quotes, draft conflict checks, PDFs, in-app
notifications, direct-release events and the wallet/cancellation machinery.

## Applied defaults and boundaries

- Ordinary 3–5 working days; Urgent 1–2 working days, stored in versioned settings.
  Working days initially mean Monday–Friday, IST; holidays are not supplied.
- Full Record has the same tariff as 15/30 years. Existing provisional tariff rows
  remain unchanged; drawn prices are samples, not authority to replace them.
- Unavailable records are described honestly in the report; any partial refund
  is an admin decision, never automatic. No registry integration or fabricated search.
- Delivery is availability of the exact report in the client's app plus an in-app
  notification. No real bank transfer. Optional email cannot claim a send without
  a configured provider/sender; the live SES sender remains unconfigured.
- Corrections after delivery use the permitted chat window and a new report version;
  historical released files and the first wallet credit remain immutable.

## Required acceptance gate

Ordinary + Urgent; admin more-details loop; decline/reassign/accept; chat document
request; one editor delivery + one uploaded PDF; client view/download; exactly-once
wallet credit; cancellation before acceptance; endpoint isolation (foreign client,
unassigned/replaced advocate and wrong role); legacy mapping; chat expiry/reopen;
five-state screens and design comparisons in `ps-screens/`. Run the full API/shared
suites, workspace type checks and mobile route smoke. No deployment unless all pass.

## Local verification — 13 November 2026

- Full API suite: **213 passed, 0 failed, 0 skipped**, including Legal Notice, FIR, consultations, report release/isolation, legacy migration, stale actions, overdue reassignment and chat expiry/reopening. [Log](../../reports/report-flows-20261113/api-suite-final.log).
- Shared package: **30 passed**, including service-qualified routing and report stage/timeline rules. [Log](../../reports/report-flows-20261113/shared-tests.log).
- API compilation, mobile/admin type checks and web exports passed.
- Initial real-browser acceptance passed all requested report, correction, payment, PDF viewing/download, wallet and cancellation paths. Drawn signature rendering is covered by the API suite; initial browser runs used typed signatures.
- Loading, empty/partial intake, injected failure and Retry recovery passed for both services. Browser fault injection is deliberate test evidence, not a claim that the API failed.
- [Design comparisons](ps-screens/README.md). These are actual synthetic-data browser captures next to the supplied drawings. Admin/extra states without a design are identified.

The fresh-case browser run passed all requested journeys, both cancellations,
wallet/isolation checks and error recovery. [Walk log](../../reports/report-flows-20261113/walk-final.log).
The authenticated mobile route smoke passed **347 routes, zero failures**.
Final completion labels, Gallery/image viewer and versioned admin upload settings
also passed their browser checks. The 25 MB default is enforced in upload tickets
and completion; existing cases retain their configured policy.
**Local gate passed. Deployment and full live acceptance also passed; see below.**
Saved payment-pending tracking links also pass the shared checkout/QR path;
foreign-client direct URLs and every workflow endpoint were checked again in the
browser/API isolation run. [Additional checks](../../reports/report-flows-20261113/README.md).
Native camera permission/device capture needs a physical-device check; browser Files
upload and PDF display/download use the real local document pipeline. No real money
moved: payments/refunds, storage, email and AI are labelled local test adapters;
wallet entries are entitlements, not bank transfers.

## Deployment and live acceptance — 13 November 2026

Image `1bff6f2` was pushed, the additive migration completed, and the dev stack
rolled out healthy before publishing both Vercel sites. Frontend `75eac72` fixes
the upload-refresh race found by the first live run. The corrected live run passed
all requested journeys, both cancellations, PDF viewing/download, exact wallet
credits, endpoint/direct-URL isolation, error recovery and delayed-upload saves.
All seven pre-existing cases retain their statuses and released files.

[Deployment and test results](../../reports/report-flows-20261113/README.md) ·
[Live screenshots](../../reports/report-flows-20261113/live/README.md).

Docker builder and unused-image pruning completed after the build/push. No real
money moved, and no credentials or existing client filings were changed.
