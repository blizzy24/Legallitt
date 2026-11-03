Public verification after the timeline fix — 3 November 2026

Approved fix dbbeb62 was pushed to main and deployed by the existing legalitt
Vercel project (apps/mobile, Node 22, pnpm build, output dist). Build logs confirm
Commit: dbbeb62. Deployment dpl_ERbbmuqyko7vEzowdnAMMnsXvNr1 is READY and serves
https://legalitt-5.vercel.app. No project or environment settings changed.
No AWS resources, credentials or pricing were changed in this follow-up.

Readback confirms legalitt-dev-api:5 is the sole running healthy deployment and:
  DEMO_PROGRESSION=on
  DEMO_ASSIGNMENT=off
  DEMO_DRAFT_START=off
  DEMO_DRAFT_SUBMIT=off
  DEMO_DISPATCH=off
  DEMO_SHIPMENT_MILESTONES=on
  DEMO_DELIVERY_CONFIRMATION=off
These are the defaults from the approved configuration, not runtime overrides.

Fresh case LN-2026-0013 / 8d6ebcd9-02b3-469c-bdac-1f95a8ebe33d

Three separate role profiles signed in through the public client/admin screens.
The client created the notice, generated subject/demands, entered clearly labelled
TEST ONLY parties, uploaded a real synthetic PDF through the document pipeline,
and paid through the UI. For 80+ seconds the case remained paid with no advocate
and no assignment event. Then the real admin picker assigned Arjun Sharma.

The advocate accepted, entered the six draft sections, generated the PDF and
shared it; the client approved; the advocate entered courier details and
confirmed dispatch. Those lifecycle actions are source=real with the respective
signed-in actor. The four timer-driven shipment milestones are source=simulated
with payload.actor=system. The case remains dispatched; shipment is now
out_for_delivery. No completion event, no POD and no simulated document exist.

A separate read-only client observer loaded the normal public page immediately
after dispatch. Without any reload or request interception, it saw the ACTIVE
row change: Shipment Created -> Pickup Booked -> Picked Up -> In Transit ->
Out for Delivery. At that boundary it held correctly. Delivered is dimmed;
there is no premature delivery-confirmation link. No browser page errors.
The main walk separately held and polled Out for Delivery for 40+ seconds.

The case is intentionally left awaiting the admin's real Confirm Delivery
upload/action. The admin panel displays that action. It was not completed by
this verification, and no placeholder proof was generated. Earlier case 0012
already verified manual delivery and matching proof bytes on client screen 441.
All relevant notification observers updated without reload.

Links for a signed-in demo client/admin:
https://legalitt-5.vercel.app/legal-notice/delivery?caseId=8d6ebcd9-02b3-469c-bdac-1f95a8ebe33d
https://legalitt-admin-panel.vercel.app/legal-notices/8d6ebcd9-02b3-469c-bdac-1f95a8ebe33d

Evidence:
  switches.json; api-service.json; vercel-readback.json; vercel-build.txt
  paid-hold.json; milestones.json; out-for-delivery-hold.json; waiting-ready.json
  client-live-polling.json; verification.json
  client-paid-waiting.png; admin-open-awaiting-assignment.png
  client-out-for-delivery-progress.png; client-live-polling-out-for-delivery.png
  admin-awaiting-delivery-confirmation.png

The code's gates passed before deployment: all six workspace typechecks and
322/322 mobile smoke routes; see the parent report's timeline-* logs. This
follow-up changes only verification scripts and the owner's standing approval
record in architecture section 10. The standing approval is scoped exactly to
already-approved changes on the named Dev Compute and two Vercel projects.

Retained data: this clearly labelled test case, its payment record, draft/final
PDFs, client upload, real workflow/audit rows, four simulated shipment milestones,
and normal auth/notification logs. No operational cleanup is required. It stays
open so the owner can inspect the waiting state. No data was deleted.
