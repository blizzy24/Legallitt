# FIR intake restoration — 10 November 2026

Approved scope: reconnect designs 42–46 to real saved cases. No new draft,
PDF-generation, AI or payment capability. The walkthrough stops at payment pending.

## Official reference data

The source and retrieval date were reported to the owner before committing:
Government of India Local Government Directory (Ministry of Panchayati Raj,
hosted by NIC), https://lgdirectory.gov.in/downloadDirectory.do, retrieved
2026-11-10T06:30:15.665Z. The snapshot has 36 states/UTs and 790 districts.
`apps/mobile/data/districtCourt.ts` has design fixtures, not a national catalogue.
The single shared snapshot and adjacent `PROVENANCE.txt` are under
`packages/shared/src/reference/`. Provenance includes checksum, public-selector
retrieval method and monthly/event-driven refresh instructions. District names
and LGD codes on saved cases are not rewritten when the reference list changes.
Police station is free text; no station dataset was sourced.

## Routing audit before replacement

The client FIR routes imported the compact `features/fir/FirClient.tsx` renderer.
The five intake routes now render their original layouts with a shared saved-case
provider. `FirClient` retains entry, draft resume, payment and post-submission
states. No URL was removed. `packages/shared/src/case-routing.ts` continues to
route client cases/notifications to `/fir/status?caseId=…` and advocates to
`/advocate/fir/draft?caseId=…`. Draft status offers an explicit Continue intake
action at the last saved step. Admin has its own service case URL and does not
import the mobile screen. `scripts/check-case-spine.cjs` passes; the existing
`scripts/verify-fir-approval.cjs` selectors were updated for the restored fields.

## Storage and behavior

Version 2 stores contact, jurisdiction, incident and last step in `cases.details`;
people are stable, ordered `case_parties` rows. Reads project the existing
`details.people` shape for downstream compatibility. Partial saves are allowed;
submission validates required fields, dates/times and identity evidence. Saves
replace only this case's FIR parties atomically, enforce ownership, and compare
the browser's saved revision to prevent overwriting another session.

The original cards, typography and progress layout remain. Empty and partial
sections explain missing entries; read/save/action errors explain recovery.
Conflicts retain local text until explicit reload confirmation. Unknown accused
need no invented name. Review shows actual input/files. False fixture identity,
verification and hash claims are removed and substitutions recorded in §9.2.
FIR navigation follows taps; autosave timing never navigates.

## Verification

- All 110 API tests pass, including new reference-data, partial-save, party-row,
  revision-concurrency, ownership, validation and submission coverage.
- Workspace typecheck and case-route checks pass; local mobile/admin bundles build.
- `scripts/verify-fir-intake.cjs` verifies partial autosave/reload, failed-save
  recovery, conflicting edits, real selectors, complainant, two accused (one
  unknown), witness, documents, actual review and resumption through the old URL.
- Loading is held deliberately; an inaccessible direct URL shows a recoverable
  error without case data. Both clients are denied access to the other's case.
- Local storage upload uses the real API from Node: the isolated test origin
  `localhost:8083` is outside the existing S3 CORS allowlist. Browser security and
  cloud settings are unchanged. The deployed run uses the actual upload button.

`local/verification.json` and screenshots record the successful local run.
Synthetic evidence is the project logo labelled TEST, not a person's identity.
No password/token is written to reports. Deployment and deployed verification
evidence are appended after rollout.
