Demo progression step switches — 3 November 2026

Implemented in 2f2e00b and pushed with ce51ce7 under the project owner's explicit
approval. Published demo-step-switches-20261103 and deployed only
LegalittDev-Compute-DevelopmentOnly on 3 November 2026. CloudFormation reports
UPDATE_COMPLETE and ECS reports COMPLETED, one healthy API task, revision 5.
Running image digest: sha256:3394c022f22194360b6e73cff493df41ae1df337b7d5570de6a39edb8cfd8ac8.
Health returns {"status":"ok"}. See deployed-task-settings.json and running-image.json.

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
- The progression implementation changed no mobile source or configuration.
  Deployed verification then exposed the separate timeline binding bug below.

CDK diff: only six environment entries on the Dev API task. No resources added,
no permission changes. Core, production and every other template field compare
equal with the previous build; see template-comparison.json. The approved rollout
also supplied ApiImageTag=demo-step-switches-20261103 for the API/ops revisions.
Readback confirms all six step settings are deployed as documented above.

Documentation: architecture sections 2.12 and 9.1 now record the owner-approved
defaults; apps/api/README.txt lists switches and intervals. The legacy fully
unattended deployed-demo check now explicitly requires VERIFY_ALL_DEMO_STEPS=1
and documents that all six target switches must be on. It is not the normal
human-driven test flow.


Deployed verification — real signed-in screens, three browser profiles

Case LN-2026-0012 (65ca3bca-229d-4dc6-9d4a-c89ea420dcce), visibly labelled
TEST ONLY in its sender and noticee fields. Existing draft from the isolated
AI-error checks was reused. No actual dispute, payment collection or delivery.

- The client uploaded a real synthetic PDF through S3 and paid through the
  deployed UI. Status stayed paid with advocate_id=null for 80+ seconds (the old
  assignment delay is 30 seconds), with no assignment event. paid-hold.json.
- Admin assigned Arjun; advocate accepted, drafted and shared; client approved;
  advocate saved courier details and confirmed dispatch. All these lifecycle
  events have source=real and the correct signed-in actor.
- The timer advanced pickup_booked -> picked_up -> in_transit -> out_for_delivery.
  All four shipment events have source=simulated, null human actor columns and
  payload.actor=system. The case stayed dispatched. milestones.json.
- Held Out for Delivery for 40+ seconds of explicit polling, then several more
  minutes during screenshot review. No POD, no simulated document, no completion
  event. Existing three documents were unchanged. waiting-ready.json and
  out-for-delivery-hold.json record the explicit checks.
- Admin then uploaded manual-verification.pdf through the actual Confirm Delivery
  dialog, entered the labelled test recipient, and confirmed. Only then did the
  case become completed. Event 107 has source=real, actor_role=admin. The POD and
  delivered shipment have simulated=false. This was a manually uploaded test
  file, not a generated simulated POD or a claim of actual delivery.
- Client screen 441 showed the entered recipient and working View Proof. The
  downloaded bytes exactly matched the admin's upload. A duplicate confirmation
  returned HTTP 409. After another 15 seconds there was still only one completion
  event and the same proof. completed-audit.json, verification.json.
- All three roles received the relevant notifications without reloading their
  observer tabs. No browser page errors. Three UI sign-ins, no session shortcuts
  for any mutation. Observer-only tabs used the same role's authenticated tokens.

Screenshots in deployed/:
  admin-open-awaiting-assignment.png; client-paid-waiting.png
  advocate-dispatch.png
  client-out-for-delivery-top.png; client-out-for-delivery-progress.png
  confirm-delivery.png; admin-case-completed.png; client-delivered-441.png

Client waiting-state defect discovered in the deployed walk

The public timeline highlights the FIRST UNFINISHED row. At out_for_delivery
that incorrectly reads Delivered ACTIVE. The screen is responsive, but the
highlight misstates its current stage. Screenshot client-out-for-delivery-progress.png.
Design 440 highlights the CURRENT milestone, so the prepared mobile correction
uses the last reached milestone, excludes it from completed checkmarks, and
clears the active highlight once delivered. No new copy, layout or tokens.

Verified a locally built fixed export in an isolated browser at the deployed
origin, reading this real deployed case. Only static files were intercepted;
this does not publish the fix. Out for Delivery is active, Delivered pending,
no confirmation link before delivery. After real admin confirmation, all steps
complete and the link to 441 appears. Both checks have zero browser errors.
  client-out-for-delivery-fixed-local.png
  client-delivered-timeline-fixed-local.png
  timeline-waiting-check.json; timeline-completed-check.json
The public Vercel frontend is unchanged; this correction needs a separate rollout
from the approved Compute-only deployment.

Retained test data / cleanup

The labelled test case is now completed and intentionally remains as an audit
example, with its simulated service payment, real manual workflow events, four
simulated courier milestones, generated draft/final PDFs, client upload and
admin-uploaded test POD. Normal login/notification records and CloudWatch logs
also remain. No test task/service/timer is left running beyond the intended API
service. No operational cleanup is required; deleting audit evidence was not
requested. Earlier isolated-AI verification report describes the same case at
its then-draft state; this walk advanced it later.

Timeline correction checks: all six workspace typechecks pass; fixture and API
exports pass; full mobile smoke passes at 322 routes with zero failures and no
fixture case/document API calls. See timeline-typecheck.txt, timeline-smoke.txt,
and timeline-browser.txt.
