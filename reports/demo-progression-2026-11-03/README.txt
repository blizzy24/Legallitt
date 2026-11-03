Demo progression step switches — 3 November 2026

Implemented and verified locally. Not yet published or deployed; the preceding
approval was for the friendly-error commit f8f946b only.

Defaults while DEMO_PROGRESSION is on:
  DEMO_ASSIGNMENT=off
  DEMO_DRAFT_START=off
  DEMO_DRAFT_SUBMIT=off
  DEMO_DISPATCH=off
  DEMO_SHIPMENT_MILESTONES=on
  DEMO_DELIVERY_CONFIRMATION=off

The existing master switch and dev-only guard remain. Individual switches accept
on|off; invalid values fail startup. Disabled steps need no interval. With all
steps disabled there is no timer. Only simulated delivery confirmation requires
ADMIN_UI_MODE=simulated; milestone-only progression works with a live admin UI.

Milestones use the existing real endpoint and source=simulated provenance. They
advance through Pickup Booked, Picked Up, In Transit and Out for Delivery, then
stop. The next step is the real admin upload/confirmation, unless explicitly
enabled as a separate simulated step. The current shipment is rechecked just
before acting so a stale poll cannot cross into delivery confirmation. Real
assignment, draft, dispatch and delivery handlers are unchanged.

Checks:
- 12 API tests pass, 0 skipped: defaults, each independently enabled action,
  master off, no authentication for disabled actions, courier boundary and stale
  shipment read, plus the existing real-DB assignment and delivery race checks.
- 11 infrastructure tests pass.
- All workspace typechecks pass (6 tasks).
- linux/arm64 image built: legalitt-api:demo-step-switches-20261103.
- Image execution confirms only shipmentStepMs=5000; all human-action delays
  are null (disabled). See image-defaults.json.
- No mobile source changes; no UI layout or mobile configuration changes.

CDK diff: only six environment entries on the Dev API task. No resources added,
no permission changes. Core, production and every other template field compare
equal with the previous build; see template-comparison.json. A future rollout
also supplies ApiImageTag=demo-step-switches-20261103 for the API/ops revisions.
Neither that image nor the new settings are deployed yet.

Documentation: architecture sections 2.12 and 9.1 now record the owner-approved
defaults; apps/api/README.txt lists switches and intervals. The legacy fully
unattended deployed-demo check now explicitly requires VERIFY_ALL_DEMO_STEPS=1
and documents that all six target switches must be on. It is not the normal
human-driven test flow.
