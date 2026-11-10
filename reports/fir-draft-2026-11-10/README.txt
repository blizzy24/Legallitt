FIR personal facts, structured draft and police proforma — 10 November 2026

Before implementation, the deployed paid-case audit found one paid FIR, already
completed and matched to the previous synthetic walkthrough. Zero unfinished
paid FIRs; zero unverified cases. No mutation/reset and no completion action.
The audit JSON records its timestamp and exact case reference.

Implementation: five complainant personal facts in client intake/case_parties,
explicit provided/unknown/not-applicable answers, read-only server snapshots,
optional ID proof, eight typed draft sections, repeatable accused/witnesses,
ordered attachment manifest, optimistic base-version token, and police PDF using
shared Noto typography. No AI, rejection/reassignment policy, or schema migration.
Architecture section 9.2 records the authorised design substitutions.

Local verification:
- API: 115 tests passed, zero failures or skips; includes notice PDF regression.
- Mobile/admin typechecks and web exports passed.
- Browser: client intake/autosave/reload and payment, advocate manual draft,
  visible loading/empty/partial/error/ideal states, failed-save retry, stale tab
  409 with retained text, PDF preview and admin approval, client exact PDF.
- No ID uploaded or required. Two supporting PDFs total 26 pages; the existing
  quote showed INR 1498.53 including INR 25 page overage before simulated payment.
- Actual PDF text contains personal facts, edited narrative, Hindi, repeatable
  people, legal sections and selected attachments in chosen order.
- Preview, submission and released PDF are byte-identical.
- Second submission 409; client approval 403; unapproved client PDF 404;
  cross-client case reads 404 in both directions.

The first browser harness attempts needed sheet/route waits, checkbox selectors
and an explicit wait for Done to finish saving before reload. These were harness
fixes, not application navigation timers. Successful evidence is under local/.

Deployment:
- API image 9b428dd, running task definition legalitt-dev-api:15, healthy ARM64.
  Digest: sha256:80f5f4d572386212d1192fd8f380f601cc87680dea2aff1d83edc4729e829ad4.
- Image pushed first; dev-ops-task.sh migrate 9b428dd ran in Git Bash, exit 0:
  15 migrations found, no pending migrations. Then the reviewed Compute update
  changed only ApiService, Task and OpsTask. Stack finished UPDATE_COMPLETE.
- Main 8425285 includes the implementation plus a client-facing wording cleanup:
  internal Q15 reasoning stays in architecture, not in the client's upload copy.
  Both Vercel deployments succeeded; public bundle markers/hashes are recorded.

Deployed walkthrough passed on legalitt-5.vercel.app and
legalitt-admin-panel.vercel.app against the updated API. Synthetic case
FIR_DRAFT-2026-0005 (7ac3567f-0d42-49ad-bbe9-557f155243e4), approved version 2,
completed. No identity document was uploaded. All local checks listed above
also passed live, with zero browser errors. Preview/submitted/released PDF SHA256:
fa00843d4648dee9636b653dae4fc24192bb688495f49c279c25a7d16d05bae4.

The original completed demo FIR_DRAFT-2026-0001 remains completed with the same
document ID and original PDF SHA256:
c7c0a0d085bb5b2e667faddd0d338c2a2b7e88ac7e9fd4f8d7b3272eeedd56c7.
The walkthrough's approval object captures submission; final-audit.json captures
the persisted approval timestamp and the admin approval/client release events.
These checks exercised deployed web browsers; native-device testing was not run.
