# Property Search, Document Forensic and Court Marriage — 11 November 2026

## Integration and review

Claude's `services-documents` commit `6b33341` was rebased onto main `d73f459`
as `0545947`, preserving the consultation services and FIR's version tokens.
Work continues on `services-consultation` in `D:\Legalitt\Legallitt`.
Both extra worktrees were confirmed clean before removal; their commits remain
on branches and ignored local settings were backed up. No databases were dropped.

The inherited API was reviewed and extended, rather than rebuilt. Changes close
client visibility through event pagination and chat attachments, prevent public
uploads of generated report kinds, keep only one pending submission, and require
a new version after admin corrections. State writes use the canonical case writer.
An interrupted upload is now visible to its owner so a blocked payment can be
recovered on screen. The full API suite was read, not just its exit code.

## Verified locally

- Full API suite: **139 passed, zero failed/skipped/cancelled**, Node 22.
- Shared/API/mobile/admin and infrastructure workspace type checks pass.
- All **329 mobile routes** render with real authenticated API sessions and zero
  failures. The final admin bundle and type check also pass.
- All three services pass actual browser intake, persisted resume, payment,
  admin assignment, advocate acceptance, chat, final document and client receipt.
- Property Search: 15 + 12 PDF pages on two files produce two chargeable pages,
  ₹50 outside GST, client total ₹3,736.03. An interrupted third upload blocks
  payment with an explanation and can be removed through the document screen.
- Every editable Property Search research section and all four Forensic sections
  were checked in the actual generated PDFs. Forensic includes a drawn signature
  in its affidavit proforma. Final uploaded/released files are hashed in the evidence.
- Document Forensic and Court Marriage each complete an admin return/correct/
  resubmit/approve cycle. Stale actions return 409. Earlier submitted files and
  internal corrections remain unavailable to the client, including through chat.
- Both directions of direct-URL client isolation return **404** for each service,
  through the API and the actual client screens. Browser errors: zero.
- Client download buttons request each released document through the authenticated
  API; the browser downloads match all four recorded file hashes. The rendered
  PDF pages were checked visually and for page bounds/missing glyphs.
- Legal Notice passed its complete client Request Changes round trip, corrected
  draft, approval, dispatch, admin delivery confirmation and client proof download:
  `LN-2026-0007` in `legal-notice-local/verification.json`.
- FIR passed intake, mixed identity/draft return, replacement, second rejection,
  reassignment, both notifications, count reset and exact-version approval:
  `FIR_DRAFT-2026-0028` in `fir-regression/local/verification.json`.
- Legal Advice, District Court and High Court all passed their full three-role
  browser journeys. Court services included consultation, representation quote,
  acceptance/payment, offline progress/document updates and final approval:
  `consultation-regression/local/verification.json`.

Case IDs, totals, document hashes and isolation case IDs are in
[`local/verification.json`](local/verification.json). All walkthrough data is
synthetic, payments use the simulated adapter, and no credentials are embedded
in evidence. Local advocate verification fixtures are restored after each run.
The browser upload assertion uses the server's sanitised identity filename,
not the original upload name.

## Scope and assumptions

Prices remain the requested provisional rows (`confirmed=false`), with a 25%
platform fee on the advocate's base and 18% GST on both. No delivery charge is
added. Pricing sources, retrieval date and comparison limits are recorded in
architecture §2.5b; all assumptions awaiting client confirmation are in §4.7.
New screens and drawn-copy substitutions are registered in §9.2.

Property Search releases directly from advocate to client (211). Forensic and
Court Marriage require admin approval of the exact submitted version. Court
Marriage delivers application preparation, not an actual marriage or registration.
External laboratory work, formal affidavit execution, property verification and
court/registrar attendance remain offline. AI, callbacks, external notification
delivery, bank payouts and escrow are not represented as working integrations.

## Deployment

API image **`febdde6`**, ARM64 digest
`sha256:6bdb869fc99f4a3b6e9a9d5e65b85ec8d3238752c57c1faba5378b8ff46c9d56`,
is running healthy as `legalitt-dev-api:19`. Compute finished `UPDATE_COMPLETE`.
The image was pushed, its migration task exited 0 (19 migrations, none pending),
then the reviewed Compute changeset was executed. Only API/ops container images
and the ECS task-definition reference changed. Capacity, Core and credentials
were unchanged.

Both existing Vercel production sites serve the connected screens. Follow-up
frontend commit **`7acb8ad`** removes duplicate prototype implementations while
preserving all URLs; its 329-route check and mobile build/typecheck pass. GitHub
deployment statuses and actual production JavaScript hashes are recorded in
[`frontend-verification.json`](frontend-verification.json).

Pricing was activated **11 November 2026, 02:00 IST**, after the API and both
frontends were serving. The ops task exited 0. Read-back verifies all five exact
tariffs and `confirmed=false` in [`deployed-pricing.json`](deployed-pricing.json).
Historical rows and existing case quotes remain unchanged.

## Verified on the deployed sites

The client site is https://legalitt-5.vercel.app and the admin site is
https://legalitt-admin-panel.vercel.app. Every case below is synthetic demo data;
payments are simulated and no real money moved.

| Service | Deployed case | Result |
|---|---|---|
| Property Search | `PROPERTY_SEARCH-2026-0001` | Intake/resume, combined-page quote, payment, assignment, chat, eight-section PDF and direct release passed. |
| Document Forensic | `DOCUMENT_FORENSIC-2026-0001` | Report/affidavit, drawn signature, return v2, corrected approval v5, stale-action and private-file checks passed. |
| Court Marriage | `COURT_MARRIAGE-2026-0001` | Two-party intake, evidence, payment, assignment, chat, return v1 and release v2 passed. |
| Legal Notice | `LN-2026-0025` | Client Request Changes, corrected draft/approval, dispatch, delivery confirmation and browser proof download passed. |
| FIR | `FIR_DRAFT-2026-0011` | Identity replacement, two draft returns, reassignment/count reset, both notifications, full completing-advocate entitlement and exact approved v4 PDF passed. |
| Legal Advice | `LEGAL_ADVICE-2026-0003` | Booking, simulated consultation payment, real case chat and approved consultation brief passed. |
| District Court | `DISTRICT_COURT-2026-0003` | Consultation, representation quote/acceptance/payment, offline progress/document sharing and final approved summary passed. |
| High Court | `HIGH_COURT-2026-0003` | Consultation, representation quote/acceptance/payment, offline progress/document sharing and final approved summary passed. |

The three new services return **404 in both directions** for another client's
case. Earlier submitted files cannot be downloaded or shared to the client
through chat. All four released report files were downloaded through actual
client buttons and match the recorded hashes. See [`deployed/verification.json`](deployed/verification.json)
and [`deployed/client-downloads.json`](deployed/client-downloads.json).
After all walkthroughs, a separate read-only check verified **both directions
return 404 across all eight services**, using each client's own case in that
service: [`deployed-isolation.json`](deployed-isolation.json). The new-service
download buttons were checked again on the final `7acb8ad` frontend bundle;
all four browser downloads still match their released hashes.

The first Forensic browser attempt clicked before its signature screen finished
loading. The driver now waits for the visible pad and resumed the same case;
the interrupted attempt is retained as `deployed/attempt-1-*`.
Running FIR and consultation verification concurrently hit the development
gateway's existing 10-request/second limit. The scripts now pace/read-backoff and
run sequentially; no server limits or capacity were changed. FIR resumed its
saved v3 after accepted identity replacement and completed v4. Original and
resumed logs are retained, with interrupted screenshots labelled `attempt-1-*`.
Legal Advice resumed its already-started chat session; all three consultation
journeys then passed sequentially with zero browser errors.
The identity purge's pending follow-up records the
existing late-upload cleanup window; rejected identity API downloads return 404.
