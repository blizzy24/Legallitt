# Consultation services verification — 10 November 2026

Implementation: `e22cbfb` (including `b956dfa`, `03ab50b`, `9b751ff`, and the
previously approved FIR admin rejection work in `62c3d76`). Branch:
`services-consultation`. Rebased on freshly fetched `origin/main` before release.

## Scope

Legal Advice: saved/resumable intake, approved advocate selection, weekly hours,
30-minute slot reservation, ₹600 base / ₹885 total before page overage, simulated
payment, admin assignment, actual two-way case chat, advocate brief, exact PDF
approval and client release.

District Court and High Court: their own consultation tariffs and attribution,
then a versioned scope/exclusions/base-fee quote, informed acceptance and a separate
simulated payment. Advocate records offline court progress, hearing details and
selected documents; admin approves the final summary before completion.

## Checks before deployment

- API on `e22cbfb`: **133 tests passed**, zero failed; see `local-api-tests.txt`.
- Mobile and admin TypeScript checks passed; both production builds passed.
- All three complete client/advocate/admin browser journeys passed, including
  narrative persistence after an idle autosave and reload. Supporting uploads,
  real stored PDFs, pricing, chat and admin release used the real application APIs.
  See `local/verification.json` and the screenshots/PDFs beside it.
- Each service's foreign-client case and consultation reads returned **404 in both
  directions**. Unapproved PDFs were unavailable to the client; private advocate
  notes were absent from client responses and generated PDFs.
- Legal Notice passed the full client Request Changes round trip, corrected
  draft, approval, dispatch, admin delivery proof and client proof download.
  See `legal-notice-local/verification.json`.
- FIR passed intake, payment, mixed draft/identity return, replacement, second
  rejection, reassignment, both notifications and exact-version completion.
  See `fir-regression/local/verification.json`.

Local browser uploads use a verification-only relay to the actual signed S3 URL
where needed because local browser origins are not in bucket CORS. This does not
change browser security, bucket policy or the application upload/validation path.
The consultation/FIR local driver also uses Node uploads through that same API.

## Deployment

Image tag `03ab50b`; registry digest
`sha256:5666954429488ef5f232e5e82c8d4703d4f659e8fab9538cb1551c40517d5eb6`.

The image was pushed first. `dev-ops-task.sh migrate 03ab50b`, run in Git Bash,
exited 0 and applied `202611100004_fir_admin_rejection`,
`202611100006_consultation_services` and `202611100007_court_hearing_details`.
Only then was the reviewed `LegalittDev-Compute-DevelopmentOnly` change set
executed. Its only changes were the API service task reference and the API/ops
task definitions. Running task definition: `legalitt-dev-api:17`; healthy image
digest verified. Core, credentials and resource capacity were not changed.

Main was pushed after API health verification to trigger both existing Vercel
production integrations. Frontend follow-up `9b751ff` refreshes the session state
alongside chat messages, so both parties see start/end without leaving chat. Its
three local browser journeys and mobile type check passed. Vercel's GitHub success
status can precede production alias promotion: verification therefore checked the
actual production JavaScript for the session-state marker before the live walks.

The final API follow-up is image `e22cbfb`, registry digest
`sha256:f8cb9777d659f97fe1d0eb7b02f6cbd0132f2b64d98b0a6769f17592854e07f1`.
Its Git Bash migration task exited 0 with all 19 migrations present and none
pending. The reviewed change set again changes only API/ops image task references.
The original release's deployment evidence is preserved in `release-03ab50b/`;
root deployment files describe this final follow-up.
Final stack status: **UPDATE_COMPLETE**. Task definition **legalitt-dev-api:18**
is RUNNING and HEALTHY on the verified `e22cbfb` digest. See `stack-final.json`
and `running-task.json`.

## Deployed consultation walkthroughs

| Service | Case | Final state | Captured simulated payments |
| --- | --- | --- | --- |
| Legal Advice | `LEGAL_ADVICE-2026-0001` | Completed, exact approved brief received | ₹885 consultation |
| District Court | `DISTRICT_COURT-2026-0001` | Completed, exact approved final summary received | ₹885 consultation + ₹1,475 representation |
| High Court | `HIGH_COURT-2026-0001` | Completed, exact approved final summary received | ₹885 consultation + ₹1,475 representation |

The ₹1,000 representation base in each court walkthrough is an explicitly
synthetic advocate quote, not a fixed tariff. Each walkthrough used all three
roles, actual chat messages and stored supporting documents. Court progress
included hearing details and published orders; the test does not claim that a
real filing or hearing occurred. See `deployed/verification.json`, screenshots
and PDF files. The driver reported no browser errors.

Nine separate direct-URL browser checks cover both client directions and an
unassigned advocate for all three services. Every case and consultation read
returned **404**, and every screen displayed **Case not found**. See
`deployed/browser-isolation.json` and the nine foreign-case screenshots.

## Payment-error privacy regression

A targeted test showed that an unfinished unpublished advocate upload could
expose its filename and document ID in a blocked payment quote. `e22cbfb` filters
those errors through the existing publication rules. Client-owned files retain
actionable filenames; private uploads produce a generic instruction to contact
the advocate through case chat, without a filename or ID. The new regression test
failed before the fix and passes after it for both court services.

The targeted live check also passed on `e22cbfb`, using the existing isolation
client's synthetic Legal Advice case. A private review-team upload produced no
filename or document ID in the client error, and its direct download returned
404. The client's own unfinished upload remained identifiable and actionable.
After both uploads completed, checkout returned ₹885. **No payment was captured.**
See `deployed/private-upload-errors.json`. Test files were completed through the
real upload pipeline and retained; no application data was deleted for cleanup.

One full-suite run encountered a transient database read timeout before FIR test
setup. The FIR-only retry passed all eight tests, then the entire final suite
passed all 133. The final successful output is retained in `local-api-tests.txt`.

## Deployed reference regressions

- **FIR_DRAFT-2026-0009**, `e5c43d20-4cbb-4ff7-81bb-d143c32ba1e0`:
  completed after mixed return, masked replacement, second draft rejection and
  reassignment. The client received v4 exactly; former advocate case/PDF reads and
  old client PDF reads returned 404; stale approval and missing manual ID acceptance
  returned 409. Both required notifications were visible. Original payment time
  was preserved, rejection count reset, and entitlement is ₹999 for the completing
  assignment, zero for the replaced advocate. This records entitlement, not money
  transferred. The earlier approved FIR PDF retained its original hash.
- The rejected ID was checked after the signed-URL grace period: **zero S3 versions
  and delete markers remain**, and its audit row is complete without ID content.
  See `fir-regression/deployed/verification.json` and `final-audit.json`.
- **LN-2026-0024**, `1725be10-eaa4-4bcb-a8b4-6a9c2e8bc5de`: completed through
  client Request Changes, advocate correction and resubmission, client approval,
  dispatch, admin proof upload and delivery confirmation. The client downloaded
  the exact uploaded proof. See `legal-notice-deployed/verification.json`.

The first live FIR automation attempt checked the rejection count before the
reassignment response completed; its wait was corrected and the same case resumed.
The first consultation attempt exposed the chat session refresh issue fixed in
`9b751ff`. Neither test failure is counted as a successful complete walkthrough.

## Simulations and assumptions

Payment capture and external notification delivery use the existing simulated
adapters. Inbox notifications, booking, chat, stored documents and PDF approval
are real. No voice/video, bank settlement, escrow, court integration or AI summary
is presented as working. Court actions in verification are explicitly synthetic.

All implementation assumptions awaiting client confirmation are in
[`docs/CONSULTATION-IMPLEMENTATION.md`](../../docs/CONSULTATION-IMPLEMENTATION.md)
and linked from architecture §4.6 / §9. They include booking horizons/holds,
rescheduling, early chat start, admin review, quote validity, incremental page
charges, manual court stages, completion entitlement, optional ID and reviews.
