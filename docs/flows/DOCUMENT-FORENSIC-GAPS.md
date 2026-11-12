# Document Forensic — flow comparison and acceptance

Comparison started 12 November 2026 against `f3a16b0`. **Local acceptance passed. Deployment authorised; rollout evidence follows separately.**
Precedence: owner instruction → Ishaan's 12 November answers → current Forensic
flow/shared flows → `design/figma-2026-11-12/Document-Forensic-*`. The designer's
text note explicitly sends Changes Needed back to Waiting for Specialist Report.

## Observed gaps

| Surface | Current implementation inspected | Required change | Status |
|---|---|---|---|
| Landing / speed | Generic report layout; fixed 24–48h / 12–24h estimates | Supplied hero, radio cards/icons; settings-backed Ordinary 3–5 working days / Urgent 24–48h; exact tariff prices | Implemented; local checks below |
| Upload | One questioned file enforced; no analysis field; reference required for all analyses; instructions max 2000 | Multiple files for the same questioned document, per-file focus, seven current document choices, five analysis choices, conditional reference/no-reference warning, instructions max 1000 | Implemented; local checks below |
| Review/payment/success | Generic checkout captures directly; no shared scan flow | Drawn review, shared quote/QR/success; Start Tracking/Home, real paid amount, no rounding/raw filenames | Implemented; local checks below |
| Client timeline | Generic lifecycle rather than corrected six stages | Payment → Upload → Expert → Analysis → Quality Review → Report Ready, date/detail for completed steps | Implemented; local checks below |
| More information | No report-service task model; paid uploads frozen | Assigned advocate request before/after acceptance, client Upload/Reply, deadline pause, 48h admin follow-up visibility | Implemented; local checks below |
| Advocate screens | Request/documents/waiting collapse into generic preparation | Request → advocate-ticked file checklist → Waiting → four-section report → affidavit → review/submit | Implemented; local checks below |
| Report summary | Four report text sections exist; no overall status/risk/authenticity fields | Advocate-authored summary shown only from released version, in PDF and client result | Implemented; local checks below |
| Affidavit | Drawn vector mark supported; typed signature absent | Drawn or typed mark bound to the exact content/version, re-sign on edit, PDF rendering; no digital-signature/notarisation claim | Implemented; local checks below |
| Admin correction | Exact-version submission/review exists; generic screen does not implement designed return navigation | Required action items → Waiting for Specialist Report → corrected version → rechecked affidavit → admin; one pending submission and stale-action protection | Implemented; local checks below |
| Admin release | Existing approval releases files and completes | Explicit report/affidavit review checklist, exact version, client summary + both files, one wallet credit | Implemented; local checks below |
| Chat | Existing case thread lacks delivery+7-day expiry/reopen | Policy-pinned chat window, readable closure explanation and audited admin reopening | Implemented; local checks below |
| Presentation | Raw filenames/tier/status and generic dates/actions | One filled main action, human labels, minute-only IST dates, drawn icons/radios, five states | Implemented; local checks below |
| Legacy cases | Existing drafts lack summary/checklist/typed mark metadata | Additive migration, do not invent findings or signature attestations; preserve released files/prices; make completion requirements explicit for unfinished cases | Implemented; local checks below |

Retain: case membership/release isolation, version tokens, real document/PDF
pipeline and bundled fonts, drawn signature support, exact-version admin review,
notifications, pricing snapshots, wallet and cancellation machinery.

## Applied defaults and boundaries

- The assigned advocate is responsible for examination and the signed report.
  “Waiting for Specialist Report” is a work stage, not an external assignment.
- Scans only; do not introduce original-document courier collection.
- Ordinary 3–5 working days; Urgent 24–48 hours, versioned settings. Working days
  initially mean Monday–Friday, IST; no holiday list has been provided.
- Reference required only for Signature/Handwriting unless the client explicitly
  declares no sample and sees the warning. Never claim a sample is verified genuine.
- Drawn/typed signature is a recorded author mark, not Aadhaar e-sign or a
  digital-certificate signature. Formal execution of the affidavit remains offline.
- Internal admin corrections remain private. Client sees preparation/review progress
  and only the summary/files of the exact approved version.
- Existing provisional tariffs remain; no invented specialist charge or rounded total.

## Required acceptance gate

One case with reference + one without; more-information loop; real checklist;
report + affidavit (both signature modes); submit → admin changes → Waiting →
new version → resubmit → approval; client summary/view/download of both files;
exactly-once wallet credit; cancellation before acceptance; every new endpoint's
isolation; stale actions, legacy mapping and chat expiry/reopen; five states and
comparisons in `df-screens/`. Full API/shared suites, workspace type checks and
mobile route smoke must pass before deployment.

## Local verification — 13 November 2026

- Full API suite: **213 passed, 0 failed, 0 skipped**, including Legal Notice, FIR, consultations, report release/isolation, legacy migration, stale actions, overdue reassignment and chat expiry/reopening. [Log](../../reports/report-flows-20261113/api-suite-final.log).
- Shared package: **30 passed**, including service-qualified routing and report stage/timeline rules. [Log](../../reports/report-flows-20261113/shared-tests.log).
- API compilation, mobile/admin type checks and web exports passed.
- Initial real-browser acceptance passed all requested report, correction, payment, PDF viewing/download, wallet and cancellation paths. Drawn signature rendering is covered by the API suite; initial browser runs used typed signatures.
- Loading, empty/partial intake, injected failure and Retry recovery passed for both services. Browser fault injection is deliberate test evidence, not a claim that the API failed.
- [Design comparisons](df-screens/README.md). These are actual synthetic-data browser captures next to the supplied drawings. Admin/extra states without a design are identified.

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
