# Round 2 implementation — 13 November 2026

Authority: `ISHAAN-ANSWERS-2026-11-13.md` A/B/C/E/F/H and the owner's attached
“ROUND 2 ANSWERS — APPLY TO BUILT SERVICES” instruction. Baseline `0e58efa`.
Court, Legal Advice and KYC workflow changes are outside this release. Common
privacy protections apply to shared cross-role surfaces. Existing filings and
captured price snapshots remain intact; verification uses new synthetic cases.

## Work and verification checklist

- [x] Versioned confirmed PS/DF tariffs and admin editing; configurable turnaround.
- [x] Versioned support hours/callback promise and public/admin screens.
- [x] Permanent client/advocate phone privacy across APIs, UI, notifications and generated PDFs (known text; no OCR of evidence).
- [x] PS exact-version admin approval/return, Quality Review timeline and no-records note.
- [x] DF external-examination attribution and original-document request/acknowledge/sent/receipt pause.
- [x] LN sender/noticee/issues/type-specific document intake and age-free rendering.
- [x] LN reminders/admin queues/revision alert/payment-based deadlines and admin remedies.
- [x] LN advocate signature profile, exact approved-version signing/submission and return.
- [x] LN reply uploads, failed courier paid retry/free electronic retry and cancellation rules.
- [x] FIR consultation-copy/route audit.
- [x] Additive migrations and backward-compatibility tests; full API/shared/routes/build gates.
- [x] Synthetic browser journeys and updated design comparisons.
- [ ] Image → migrate → dev stack → both frontends; activate new tariffs safely; live checks, push and prune.

## Interpretation awaiting confirmation

Local verification completed 14 November 2026: API 224/224, shared 30/30,
authenticated routes 348/348; both frontend typechecks/builds passed. All required
synthetic journeys passed, including the remaining LN cancellation, company,
cheque-bounce validation, signature/return, reminders and extension checks.
See [the item-by-item audit](../../reports/round2-20261113/AUDIT.md) and the
[LN](ln-screens/README.md), [PS](ps-screens/README.md), and
[DF](df-screens/README.md) comparison indexes. Deployment is recorded separately
after the release gates complete.

DF Urgent uses 3–4 **calendar days**, following the literal “days” rather than
“working days” used for the other three windows. The versioned setting exposes the
unit so it can be changed without a migration. Working-day windows use the existing
configured weekdays; no unprovided public-holiday calendar is invented.

For original documents, the advocate supplies the destination/instructions; no
postage charge or external courier integration is invented. The client acknowledges
and marks Sent with a note. Waiting ends when advocate/admin records receipt, keeping
the due date paused while the physical document is still in transit.

Legal Notice wallet credit stays at delivery/completion pending the answer to round
2 question I.5. New courier retry fees are platform revenue and never advocate credit.

## Observations before changes

- Current PS config releases directly; DF already has version-bound admin review.
- Current report policies understand hours/working days; calendar-day support is needed.
- Current PS/DF accepted case view exposes client contact; this is superseded by round 2.
- Existing LN reminder worker, deadlines, returns and per-method dispatch provide reusable
  mechanics; current policy thresholds and approval-to-admin transition need review.
- New round-2 source files and unrelated historical evidence/FIR-flow edits existed in
  the working directory before this task. Preserve them while staging task-owned changes.
