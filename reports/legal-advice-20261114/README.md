# Legal Advice rebuild — work in progress

Branch: `legal-advice-rebuild-20261114`, based on deployed main `93b0743`.

## Completed

- Read the request, source answers, flow and current consultation implementation.
- Extracted and verified the supplied archive: **85 PNGs**, not the stated 89.
  Legal Advice has 57 screens; Profile/Messages remain deferred.
- Added the [gap audit](../../docs/flows/LEGAL-ADVICE-GAPS.md), current design
  override and decisions LA-R2-01 through LA-R2-07.
- Added a separate typed Legal Advice policy contract and seed-input manifest.
  It requires complete tier/mode rows, explicit NOT SET prices, valid experience
  ranges and scheduling bounds. No runtime handler is switched to this contract.
- Shared package build/tests: **33 passed**, zero failures, including new policy
  completeness, boundary and invalid-admin-configuration checks.

## Not completed / not deployed

The runtime rebuild remains open: additive persistence/migrations, seed command,
pricing snapshots, invitations/atomic acceptance, scheduling/time proposals,
session adapter/timers, no-shows/reschedules, summary/wallet release, AI,
written advice PDF, follow-ups, client/advocate/admin screens and endpoint tests.
The policy manifest has not been inserted into any database.

Full API/regression suites, all-app builds, browser journeys, visual comparisons
and release gates have not run for this rebuild. Design inventory contact sheets
are **reference thumbnails**, not screenshots or evidence of implemented screens.
No image build, migration, seed, main merge or deployment was performed. Existing
real cases, credentials and payments were untouched. The previous version is live.
