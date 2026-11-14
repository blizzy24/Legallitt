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
- Shared package build/tests: **34 passed**, zero failures, including new policy
  completeness, boundary and invalid-admin-configuration checks.

## Backend foundation added on continuation

- Additive migration introduces versioned policies, new-workflow bookings,
  invitation history and public/internal events. It was applied only to the
  local application/test databases. No deployed migration or seed was run.
- Settings GET/PATCH and requested-slot GET endpoints are mounted behind auth.
  Writes require admin role, a reason and the next policy version. Requested IST
  slots use editable hours/days/intervals/notice/horizon and are not confirmations.
- Invitation inbox, admin assignment and advocate decision endpoints are mounted.
  The case and user locks, plus a unique accepted-invitation index, enforce one
  winner and prevent overlapping accepted appointments. Declines/history remain.
  Losing invitees receive a neutral notification without an inaccessible case link.
- The test CallProvider explicitly transmits no media. The pure session engine
  implements two-party joining, preserved elapsed time, client-only end,
  advocate-only pause/resume, exact auto-end and interrupted pause expiry.
  It is not yet integrated with persisted session actions or the browser.
- `seed-legal-advice` is available in the ops script. It inserts initial config
  only if no policy exists and preserves operator configuration. Tariff insertion
  into `service_pricing` and runtime quote integration remain pending.
- Focused Legal Advice tests: **7 passed**, including a real concurrent database
  acceptance race, foreign-invitation protection, role checks, HTTP auth/routes,
  stale settings edits and timer boundaries. Full API: **242/242 passed** in
  `api-suite-final.log`; API build and shared tests passed.

The first regression run failed four checks: schema inventory needed the four
new tables, two new tests ran against stale build output, and the Legal Notice
fixture inherited the local database's old explicit closing policy. The final
run followed a complete rebuild; the inventory now matches the architecture,
and the notice fixture installs/restores its own current policy. No Legal Notice
runtime behaviour was changed.

## Not completed / not deployed

The integrated runtime rebuild remains open: actual tier tariff activation and
pricing snapshots, booking/payment-triggered invitations, complete invitation
eligibility and expiry alerts, scheduling/time proposals,
session adapter/timers, no-shows/reschedules, summary/wallet release, AI,
written advice PDF, follow-ups, client/advocate/admin screens and endpoint tests.
Only local tests inserted policy fixtures; no deployed policy was activated.

All-app builds, browser journeys, visual comparisons and complete release gates
have not run for this rebuild. Design inventory contact sheets
are **reference thumbnails**, not screenshots or evidence of implemented screens.
No image build, deployed migration/seed, main merge or deployment was performed. Existing
real cases, credentials and payments were untouched. The previous version is live.
