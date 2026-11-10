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

Deployment and reference-service regression results are recorded below when complete.
