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

Deployment evidence and deployed walkthrough results are recorded alongside
this file once the authorised dev rollout completes.
