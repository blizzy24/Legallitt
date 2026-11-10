FIR admin approval — 10 November 2026

Approved rule
Advocate drafts -> admin approves -> client receives exact reviewed PDF -> completed.
No client approval or changes request. No inferred rejection/return path.
Uses shared in_progress with sub_status awaiting_admin_approval, then approved
and completed events in one release transaction. No new enum/schema migration.

Second submissions are blocked
Save and send both refuse while one submitted version awaits approval. A case lock
serialises simultaneous sends; one wins, one receives 409. The submitted version,
PDF and supporting evidence are frozen. Approvals bind that version/PDF, are
admin-only and idempotent. Unapproved PDF URLs are denied to clients, not merely
hidden in the UI. Generic cancellation cannot bypass the waiting state.

Visible stalls
FIR Drafts navigation opens a paginated, oldest-first approval queue. Waiting
paid cases count as Open and show submission timestamp, live elapsed waiting
time, and 'Only action: approve. No rejection path.' No invented timeout/SLA or
automatic approval. Admin detail repeats the restriction next to the PDF/action.
The screen uses the existing admin visual language and is recorded in architecture
section 9.2 as an owner-authorised screen without a supplied design.

Connected workflow
FIR intake now saves real data through the five existing steps. Payment uses
the existing confirmed tariff and case-wide PDF overage quote. The advocate
accepts, manually drafts, saves versions and sends for admin review. No AI output
or police filing is claimed. Approved copy substitutions live in the established
mobile copy register. Client receives the final PDF and an in-app notification.
Simulated payment and external notification delivery remain existing dev adapters.

Validation
- Full Node 22 API suite: 102 passed, zero failures/skips (api-tests.txt).
- FIR tests exercise ownership, duplicate/concurrent sends, frozen writes,
  stale version rejection, absent client review, no cancellation bypass, direct
  PDF refusal before approval, bidirectional client isolation, oldest-first
  pagination and three-day waiting age, exact PDF release and duplicate approval.
- Workspace typecheck, fixture flow/rounding and case-spine navigation passed.
- Browser route smoke: all 322 routes passed with no failures (mobile-smoke.txt).
- Local browser: client enters intake, uploads 25 supporting pages plus one
  synthetic ID-proof page across two PDFs, sees/pays 1498.53
  (999 base + 249.75 platform + 224.78 GST + 25 overage, zero delivery), admin
  assigns, advocate accepts/saves/submits, admin previews and approves, client
  receives byte-identical PDF. All three roles were exercised through browsers.
  Submission without the required ID-proof attachment is refused; attaching it
  does not claim identity verification. All 26 pages count together for overage.
  Second send returned 409, client approval 403, unapproved PDF 404, both other
  client case reads 404. Screenshots/JSON/PDF are in local/.
- Local authentication sync had no approved advocate profile. The verification
  script temporarily supplies a local fixture and restores it in finally; it
  never changes credentials or deployed profiles. Early failed synthetic local
  attempts remain local; no real cases were altered or deleted.

Development deployment
- Source/image tag: 131e1f6 (pushed to origin/main).
- Image index: sha256:dcf7b204b200a936d16fea9e6035131b4c32efa620070b71347bc0a569ccba53.
- Sequence: image pushed, dev-ops-task.sh migrate 131e1f6 exited 0 with no
  pending migrations, reviewed image-only change set, then Compute rollout.
- LegalittDev-Compute-DevelopmentOnly: UPDATE_COMPLETE. API health is ok and
  the running task is HEALTHY on the verified image. No seed, credential, Core,
  database, network or capacity change was needed.
- Docker Hub DNS and the first GitHub backup push timed out; retries succeeded.
- Both Vercel production builds succeeded. Public bundle checks confirmed the
  FIR controls at legalitt-5.vercel.app and legalitt-admin-panel.vercel.app.

Deployed walkthrough
- FIR_DRAFT-2026-0001 / ef4db04e-bfe8-4bfc-86c3-47d7f75b1866 completed.
- Client entered intake, attached two synthetic PDFs (25 + 1 pages), saw the
  1498.53 quote and paid through the existing development simulator.
- Admin assigned; advocate accepted, saved and submitted v2. Admin saw the
  frozen PDF, intake, documents and explicit wait/approve-only restriction,
  confirmed review and approved. Client and advocate then saw completion.
- Client received the exact admin-reviewed PDF. SHA-256:
  c7c0a0d085bb5b2e667faddd0d338c2a2b7e88ac7e9fd4f8d7b3272eeedd56c7.
- Second advocate submission: 409. Client attempting admin approval: 403.
  Client accessing the unapproved PDF by document ID: 404.
- Other client -> this case: 404. Original client -> other client's case
  11ec1256-5dca-4870-8e3b-9415e2f8aad7: 404. Both are direct API case reads.
- No browser errors. Screenshots, PDF and assertions are in deployed/.
  verification.json contains the approval snapshot taken while pending;
  final-audit.json records the persisted approved timestamp and release events.
- Rejection/return remains an explicit open client decision. No such action,
  automatic approval or hidden exit was added. The queued case stays visible.

No credentials, tokens, signed URLs or real client documents belong in this report.
