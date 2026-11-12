# Property Search — flow comparison and acceptance

Comparison started 12 November 2026 against `f3a16b0`. **Local acceptance passed. Deployment authorised; rollout evidence follows separately.**
Precedence: owner instruction → Ishaan's 12 November answers → current Property
Search flow/shared flows → `design/figma-2026-11-12/Property-Search-Report-*`.
Older numbered designs and earlier §4.7 assumptions are superseded where they conflict.

## Observed gaps

| Surface | Current implementation inspected | Required change | Status |
|---|---|---|---|
| Landing / speed | Generic `reports/ClientScreen.tsx`; estimates are constants in `service-reports.ts` | Supplied illustration, radio method/speed cards, icon support actions; exact tariff amounts and configurable Ordinary/Urgent delivery windows | Implemented; local checks below |
| Intake | Address exists; purpose is conflated with free-form requirement; owner names and Other detail absent | Distinct required address/purpose, optional owner names and what-to-check, Other detail, LGD selectors, optional documents; explicit Continue; resumable saves | Implemented; local checks below |
| Review/payment/success | Generic report checkout directly captures a demo payment; raw tier and filenames reach views | Designed review and shared checkout/QR/success; Start Tracking and Home; exact paise; human labels | Implemented; local checks below |
| Admin verification | Assignment exists; no sufficiency check or client correction task | Verification stage, reasoned “We need more details”, client Edit/reply, verify before assignment; overdue display | Implemented; local checks below |
| Client tracking | Generic lifecycle summary rather than six designed stages | Submitted → Paid → Verification → Assigned → Preparation → Delivered, event timestamps/details and policy deadline | Implemented; local checks below |
| Advocate request | Accept/decline exists in generic screen | Designed details, payout only, masked contact before acceptance, explicit decline/reassignment | Implemented; local checks below |
| Document requests | Paid client files are unconditionally frozen in `report-access.ts` | Scoped request/reply uploads in chat, preserve original evidence, pause/resume deadline | Implemented; local checks below |
| Editor | Eight-section research model exists; client/property sections read-only and owner/findings flattened | Current eight-section design, all authored fields rendered, structured checked-records/findings, explicit personal sign-off and wording-only AI suggestions | Implemented; local checks below |
| Delivery | `submit()` rejects editor output and requires a second final upload | Either editor PDF or uploaded PDF; shared viewer/preview; note; direct release without admin review; one wallet credit; correction version without second credit | Implemented; local checks below |
| Chat | Existing case thread has no report delivery+7-day policy/reopen control | Acceptance through delivery+7 days, visible read-only reason, audited admin reopening | Implemented; local checks below |
| Presentation | Generic dates include seconds; raw document filenames/status/tier values; multiple filled actions | One main action, outlined/text secondary actions, human labels and IST minute dates, all five states | Implemented; local checks below |
| Existing cases | No mapping to the newly required verification/deadline stages | Additive policy/state migration; retain prices/files/versions and safely open/finish old paid and completed cases | Implemented; local checks below |

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
**Local gate passed; deployment is not yet claimed.**
Native camera permission/device capture needs a physical-device check; browser Files
upload and PDF display/download use the real local document pipeline. No real money
moved: payments/refunds, storage, email and AI are labelled local test adapters;
wallet entries are entitlements, not bank transfers.
