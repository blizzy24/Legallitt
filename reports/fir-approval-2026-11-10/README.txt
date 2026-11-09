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

Deployment and deployed verification will be recorded after rollout.
No credentials, tokens, signed URLs or real client documents belong in this report.
