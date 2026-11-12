# Legal Notice flow rebuild — gap analysis

Compared on 2026-11-12 against local main `6911cfc`. Implementation branch:
`legal-notice-flow-20261112`. Local verification only; deployment is not authorised
for this chunk. Existing unrelated changes and verification artifacts are preserved.

## Authority and evidence

`ISHAAN-ANSWERS-2026-11-12.md` overrides `LEGAL-NOTICE-FLOW.md` and
`SHARED-FLOWS.md`. The current exports were supplied during this task under
`design/figma-2026-11-12/`: `Legal-Notice-Client-Side`,
`Legal-Notice-Advocate-Side`, `Document-Viewer`, and `Legal-Notice-Changes`.
Use the flow's filename mapping: the three `Documents Forensic 16/17/30` images
inside the Legal Notice client folder are its payment screens. Ishaan's written
notes and two annotated screenshots override the drawn relationships/offences and
old advocate-dispatch actions. Older numbered exports are not authoritative here.

## Verified gaps

| Area | Existing implementation inspected | Required change | Verification |
| --- | --- | --- | --- |
| Lifecycle | `cases/case-state-machine.ts` approves directly into advocate-owned dispatch; `shipment.service.ts` permits advocate booking | Client approval hands off to admin; address check, notice check/return, test e-sign, per-method dispatch, delivery/proof, completion | All three local cases; return/revision and stale-action tests |
| Existing cases | Old approved/dispatching/dispatched cases have courier shipments and final documents | Additive migration maps these into admin workflow, retaining documents, historical payments, tracking and completion ability | Migration fixtures at every legacy dispatch state |
| Shared status | Role-specific notice screens derive their own labels/actions | One shared projection from status/sub-status for client, advocate and admin | Exhaustive status projection tests and screenshots |
| Intake | `shared/legal-notice.ts` requires all noticee contacts and a relationship; old wizard has a separate demand step | Six-step flow, no noticee relationship; select courier/email/WhatsApp, require only selected contact fields; client personal facts; cheque details | Courier-only, email-only, all-methods/cheque-bounce intake and resumption |
| Uploads/review | Existing notice upload/review routes predate new slot and viewer requirements | Matter-specific slots, cheque copy/return memo, optional named slots, actual files/page counts, real review values | Missing/partial/upload-error paths, viewing and replacement |
| Pricing | `payments/price-quotes.ts` adds the policy's delivery tariff unconditionally and fingerprints documents alone | Courier charge only when selected; preserve old captured quotes; selected methods participate in new quote identity | Itemised quotes for all three combinations, stale quote prevention |
| Draft editing | `shared/notice-draft.ts` makes only facts/offences editable; PDF service substitutes intake values for other sections | Six editable sections all reach the PDF; no Offences section/sentence in new drafts/PDFs; stale base-version protection | Text extraction from PDFs, draft round trips, concurrent-save tests |
| Chat | `cases/notice-messages.ts` checks ownership but has no stage window | Open from acceptance until first admin handoff, then readable but not writable; no session timer | Send/read checks before/after approval and during admin return |
| Advocate acceptance | Generic decline allows absent reason and retains assignment | Required reason, admin reassignment, correct new advocate visibility | Reject/reassign/accept walkthrough and isolation |
| Advocate review | Existing route needs current-design comparison | Actual case summary above uploaded files; shared viewer; no unsupported AI-summary claims | Visual comparison and empty/partial/error states |
| Delivery | Courier-centric advocate dispatch; no selected-method admin orchestration | SES email adapter; explicitly manual WhatsApp; explicitly test e-sign; admin failed-delivery recovery and proof | Adapter tests, local simulated external delivery, failure/new-address walkthrough |
| Wallet | `wallet.service.ts` reads entitlement from captured payment snapshots | Completing advocate credited once; new-flow advocate share follows confirmed flow; historical entitlements retained | Before/after ledger and repeated-completion tests |
| Document viewer | `advocate/documents/viewer.tsx` is a fixture with inert toolbar | Shared real-document viewer, authorised download, paging/zoom where supported, loading/failure/retry and report-problem context | Actual generated PDF opened by each authorised role; foreign-file denied |
| Stepper | Existing `WizardShell` distributes circles and connectors within individual flex items | Even circle spacing, continuous connecting line | Current-design side-by-side screenshots |
| Admin screens | Existing actions implement old dispatch ownership | Existing admin visual language for approval checks, return, test e-sign, dispatch, tracking/proof and failure recovery | Admin browser walkthrough; record undesigned screens in §9.2 |
| Cancellation/deadlines | Shared cancellation/support exist; notice-specific integration requires verification | Before-acceptance full simulated refund; later admin review; no cancellation after dispatch; deadline/reminder/idle-review visibility | Cancellation walkthrough, deadline/reminder tests |
| Routing regression | Baseline shared suite: 21 passed, 1 failed; `tests/case-spine.cjs` assumes `service=` on every dedicated route and ignores FIR's state-aware destination | Assert actual dedicated-route contract and state-aware destinations; retain `service=` on generic fallback | Entire shared suite |

## Implemented lifecycle contract

Reuse shared case statuses. Service sub-statuses distinguish admin address check,
notice check, advocate correction, test e-sign and ready-to-dispatch. Client views
admin correction as finalisation, not a new approval request. A corrected admin-returned
draft goes back to admin. The first client approval permanently closes the ordinary
notice chat; an internal correction must not reopen it accidentally.

Pin the exact submitted draft/version and PDF for each review. Every admin mutation
must check the current revision; an old browser tab cannot approve or dispatch a newer
submission. Preserve history when returning a draft or retrying delivery. Delivery
attempts are separate per selected method. Completion requires the selected delivery
methods to finish successfully, including courier proof; failures stay admin-actionable.
This all-methods completion interpretation must be recorded as an assumption because
the supplied text does not specify partial-delivery completion.

Legacy final PDFs and captured amounts are immutable. The migration must not require
old clients to repay, re-enter intake or approve an already-approved notice. No existing
file is deleted or regenerated by migration.

## Acceptance evidence — local only

- [x] Shared tests, API suite and type checks pass with output inspected.
- [x] Every new case/document mutation/read endpoint has foreign-client, wrong-advocate
      and role-boundary checks appropriate to its permissions.
- [x] Three local client cases: courier only, email only, all three; one cheque bounce.
- [x] Advocate decline → reassignment → acceptance → draft → send.
- [x] Client changes → revised draft → approval → admin; chat read-only.
- [x] Admin address and notice checks; one return → revised → recheck; test e-sign.
- [x] Dispatch each selected method → tracking → delivered/proof → advocate credit.
- [x] Failed delivery followed by corrected address and retry.
- [x] Cancellation before acceptance, simulated refund, no real money movement.
- [x] Existing cases at old advocate-dispatch stages open and finish.
- [x] All five screen states; side-by-side screenshots under `docs/flows/ln-screens/`.
- [x] SES, manual WhatsApp, test e-sign in architecture §9.1; admin screens in §9.2.

External email/payment/courier effects in local automated tests must use explicit test
adapters and be reported as simulated. This is not evidence of a live SES delivery or
a provider-backed digital signature. No deployment is part of this task.

## Results and review links

The local API, Expo web and admin panel ran together against
`legalitt_notice_local`. Tests used separate `legalitt_notice_test_*` databases;
the final full run used a freshly migrated/base-seeded `legalitt_notice_test_final`.
No existing application/test database was reset. All walkthrough files and facts
are explicitly synthetic. Existing demo credentials were read, never changed.

| Check | Result |
|---|---|
| Complete API suite, including FIR, consultations and report-service regressions | **208 passed, 0 failed, 0 skipped** |
| Shared schemas, status projections and routing (`service=` regression) | **26 passed** |
| Infrastructure synthesis tests, including opt-in sender-scoped SES permission | **12 passed**; no deployment |
| Final focused concurrency/isolation/expiry/redelivery check | **3 passed**; exactly one concurrent send publishes its PDF |
| API build and mobile/admin TypeScript checks | Passed |
| Mobile web and admin production builds | Passed locally; neither published |
| Offline native PDF HTML | Two Devanagari pages render; paging/zoom work; zero external requests |

[Screenshot comparison index](ln-screens/README.md) contains the current designs
beside real browser captures. [Machine-readable browser evidence](../../reports/notice-flow-20261112/local/browser-results.json)
lists the cases and successful stages. Logs and detailed checks are in
[the verification report](../../reports/notice-flow-20261112/README.md).

| Required case | Local ID | Result |
|---|---|---|
| Courier only | `bd7e6b5e-5571-4d72-aa7e-fdfc4a013bb8` | Decline → reassign → accept; client changes → revision → approval; admin return → revision → recheck; test e-sign; failed courier → corrected address → ₹179 test retry → tracking/POD → completed |
| Email only | `32fd67f8-fcdb-4220-b6f7-7333a183ebe0` | Intake/payment → draft/client approval → admin checks/test e-sign → local email adapter → admin delivery confirmation → completed |
| All three, cheque bounce | `ec6fe18b-629c-4fdb-aebe-50b1fc377727` | Cheque/return-memo requirements; each selected method dispatched and confirmed; courier POD; completion after all three |
| Cancellation before acceptance | `149e6bbc-3ef2-46a2-a6ff-b495023fc0ba` | Full ₹1,652.53 simulated refund; no real money movement |

Each completed case contributes exactly one ₹999 advocate wallet entry. Courier
retry is a separate captured payment and does not add another advocate credit.
The client-facing urgent totals are **₹1,652.53 with courier** and **₹1,473.53
without courier**, following this flow's ₹179 charge. Captured legacy amounts are
unchanged. The actual migration SQL was tested for approved, dispatching,
dispatched and completed legacy rows, including final document IDs, old ₹1,625
payments, original approval times and courier milestones. The legacy API notice
walkthrough also passes under the new admin-owned workflow.

## Scope and operational limits

- Nothing was deployed. No Docker image was built, so no Docker build cache/image
  pruning was needed.
- Payment and local AI adapters are simulated and labelled. Local storage uses
  synthetic bytes through the real upload inspection/document/PDF handlers.
- Email uses the real SES adapter in application composition; local acceptance
  replaces it with a test adapter. A verified sender, its exact identity ARN and
  permission are still required before enabling real delivery. Dev Compute's
  optional parameters default to disabled. No SES identity/account or permission
  was changed in AWS.
- WhatsApp is explicitly recorded manually. Test e-sign records an acknowledgement
  only: it does not collect Aadhaar details or modify/sign PDF bytes.
- Delivery/POD confirmations are admin actions. Provider acceptance of email is
  only “Sent”; an uncertain outcome requires reconciliation before another attempt.
- Native PDF HTML was exercised in Chromium and typechecked against Expo/WebView.
  A physical Android/iOS device was not available; no physical-device result is claimed.
- The all-selected-methods completion rule and courier fee recipient are recorded
  in the architecture decision log. Contact corrections change the delivery
  destination; they do not silently rewrite a previously approved PDF.

## Visual polish follow-up — 12 November 2026

The owner approved the lifecycle and subsequently authorised deployment after visual polish.
Secondary actions now use outlines or links; primary actions remain stage-specific.
The landing uses the supplied hero illustration, visible radio circles and icon support buttons.
Document kinds and delivery methods have human labels; timestamps use IST with minutes,
without seconds. Completed timeline entries use recorded event times and detail lines;
cancellation is a small bottom link. Missing historical timestamps are not invented.

The follow-up verification and deployment record is in
[`reports/notice-polish-20261112`](../../reports/notice-polish-20261112/).
The original local-only results above describe the earlier acceptance pass.

The authorised follow-up is deployed: API `733af89`, both Vercel sites rebuilt.
The live check found and fixed production's missing CORS `PUT` method; local
acceptance now uses the same CORS configuration and an HTTP regression covers it.
The live courier walkthrough, failed-delivery correction, exactly-once advocate
credit, PDF viewer and visual assertions passed. Both client-isolation directions
returned 404, and three existing dispatch/completed cases opened successfully.
SES remains explicitly blocked until a verified sender is configured; no live
email-delivery success is claimed. See the linked rollout record for logs and screenshots.
