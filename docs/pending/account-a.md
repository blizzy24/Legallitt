# Builder D — client account area, part A (D-15, D-16, D-17, D-18, D-19)

Branch `p0-account-a`. To be merged into `docs/DECISIONS.md` and architecture §9.1/§9.2 by the integrator.

## New decisions

- **D-62. Profile fields live in `client_profiles`** (date of birth, gender, city, state, country), keyed by user. Email and mobile stay on `users` and are **read-only** on Edit Profile: they are bound to the Cognito sign-in, and changing them needs a verification flow that isn't built. "Verified" appears only from the stored verified flags. Preferred language shows **English** and links to the Language screen (D-22) — no second language store is created here.
- **D-63. Edit Profile omits photo upload.** The drawn "Change Profile Photo" camera is replaced by "Profile photos are not available yet" (no image storage for avatars exists). Consultation preferences show Chat selected and available; Voice and Video show "Not available yet" and are not selectable (D-09).
- **D-64. My Requests groups every case the client has**, newest first: **Pending** = no advocate has accepted yet (draft, submitted, payment pending, paid, assigning, assigned, advocate declined); **Accepted** = an advocate accepted and the work is under way; **Completed** = completed. Cancelled and refunded cases appear under **All** only, labelled as such. "Forum / location" is shown only where the service records one (court, or the jurisdiction district/state the client entered); otherwise the row is omitted.
- **D-65. Request Details timeline** is the case's real lifecycle moves from `case_events` (no projected/future steps, no invented "evaluating docket files" copy). The advocate card shows only stored facts (D-02): name, "Verified by Legalitt" only when `advocate_profiles.verification = approved`, experience, practice areas and city when present. "Cancel Request" opens builder B's `/cases/cancel?caseId=` and is hidden once the case is completed, cancelled or refunded; a completed case points to Contact Support. The drawn "notified via push & SMS" line reads "You'll be notified in the app when your request is updated." (D-01).
- **D-66. Document categories are by origin** — Uploaded by you / From your advocate / From Legalitt (admin or system-generated). Visibility uses each service's existing case-read rule, so unreleased FIR drafts, report-service files and advocate drafts never appear. A client may remove only their own upload on a case that is still a draft or awaiting payment; otherwise "Remove" explains why (submitted request → contact support; shared file → only the person who added it). The server's existing delete guards still apply.
- **D-67. Payment receipt PDF** (D-19) is generated on request from the captured payment and its price snapshot: receipt number, date, payer, service, request reference, gateway reference, line items, total. It states "This is a payment receipt, not a tax invoice" and, for simulated payments, "Demo payment (simulated) — no money moved". Receipts exist only for captured payments. Payments lists only payments the client made on their own cases (advocate courier payments are not shown).

## §9.2 — design substitutions / built without a design

| Design | What changed | Decision |
|---|---|---|
| profile-2 (51) | Email and mobile read-only; photo upload replaced by "Profile photos are not available yet"; Voice/Video "Not available yet"; gender picker (no open state drawn) uses the existing bottom-sheet style; date of birth entered as YYYY-MM-DD | D-62, D-63 |
| profile-4 (53) | "Consultation Mode" row omitted (no mode stored per case); "Forum" only when recorded; footer about 24–48 hour responses omitted (no such commitment configured) | D-64 |
| profile-5 (54) | Rating, "120+ client briefs", presence dot, Bar ID omitted unless stored; projected timeline steps replaced by real events; "Add Document" omitted here (uploads stay in each service flow); push & SMS line replaced | D-65, D-01, D-02 |
| profile-3, profile-7 (52, 56) | Categories by origin; "Encrypted… Evidence Act" line replaced with "Stored encrypted. Visible only to you, your assigned advocate and Legalitt's team."; search across file name and request | D-66, D-01 |
| profile-8 (57) | No Share, no e-sign/vault/security ID; web shows the PDF inline in the browser's viewer (page navigation and zoom) or the image with zoom controls; Download opens the short-lived file link | D-17, D-01 |
| profile-9 (58) | "This Month / Pending due in 5 days" replaced by real totals (no pending dues exist); escrow line removed; "Need GST invoices?" says tax invoices come once Legalitt's GST details are added | D-18, D-19, D-01 |
| profile-10 (59) | "Confirmed by Bank Escrow", "Authorization Code", "Verified VPA", "Invoice Ready" and escrow footer removed; breakdown from the captured price snapshot; Download Receipt generates the D-67 receipt | D-18, D-19, D-01 |
| Payment Details route | New route `/payments/[id]` (route count 329 → 330) | D-18 |

## §9.1 register

No new simulated capability. Receipts of simulated payments say so on their face.

## Routes and API

- API: `GET/PATCH /api/v1/account/profile`, `GET /api/v1/account/documents[?case_id=]`, `GET /api/v1/account/payments`, `GET /api/v1/account/payments/:id`, `GET /api/v1/account/payments/:id/receipt` — client role only (advocate/admin 403); another client's ids return 404. Test: `apps/api/tests/account.cjs`.
- Mobile: `/(tabs)/profile` (real active count), `/profile/edit`, `/requests`, `/requests/[id]`, `/documents`, `/documents/case?caseId=`, `/documents/[id]`, `/payments`, `/payments/[id]`.
- Migration: `202611110030_profile_fields` (new table only).
