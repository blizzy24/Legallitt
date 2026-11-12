# FIR Draft: gaps between the flow and what's built

Compared on 12 November 2026: [`FIR-DRAFT-FLOW.md`](FIR-DRAFT-FLOW.md) against the code at `2b21a8a`.
Each [DECIDE] item uses the proposal written in the flow, and section 5 items 3–13 use their defaults. Each [REMOVE] item stays out.
Police submission (C14) is built in the "advocate submits" version, behind one setting that is on by default.

## Read this first

1. **The designed screens only appear with fixture data.** With `EXPO_PUBLIC_DATA_SOURCE=api`:
   - Six client routes render one undesigned component, `features/fir/FirClient.tsx`, instead of their designs: `/fir`, `/fir/info`, `/fir/payment`, `/fir/submitted`, `/fir/status` and `/fir/ready`.
   - All seven advocate routes render one undesigned component, `features/fir/FirAdvocate.tsx`.
   - The designed screens run only on fixture data from `data/fir.ts` and `data/advocateFir.ts`. Only client Steps 1–5 are designed screens backed by the API.
2. **The client never approves the FIR draft.** When the admin approves, the case goes straight to `completed` (`apps/api/src/cases/fir-admin.service.ts:111-118`). There is no client-review status, no Approve or Request Changes endpoint, and no police submission. The client copy even says "No client approval is needed" (`apps/mobile/copy/substitutions.ts:14`).
3. **An advocate rejection leaves the case stuck.**
   - "Decline Assignment" has no reason field and keeps `advocate_id`.
   - The admin's assign action then refuses: "Case already has an advocate" (`case-state-machine.ts:417-419`).
   - The FIR reassign endpoint only accepts drafts the admin has already returned.
4. **Statuses don't agree across the three apps.**
   - The advocate list shows generic labels and ignores `sub_status` (`features/cases/case-list.ts:23-28`).
   - The client sees a raw event log.
   - Nothing implements the C10 mapping.

## Data (flow section 4)

| Group | Built | Change |
|---|---|---|
| Request | Case row, `fir_lifecycles` (paid time, policy, entitlement), price-quote snapshot. Turnaround comes from `fir_policies` (24 h / 48 h) | Use the policy values as the single turnaround everywhere ("24–48 hours") |
| Basic (Step 1) | `contact` and `jurisdiction`; the police station is free text | Add `police_station_id` from a seeded station list, with free text where no list exists |
| Place of incident | Not stored | Add `place {address, city, pin, coords?}` to the intake |
| Incident (Step 2) | `incident {type, date, time, location, description ≤2000, additional}`. The date isn't checked against the future | Pre-fill from `place`; reject future dates |
| Complainant | `case_parties.details.personal_details`: father's name, age, gender, occupation, present address | Keep. Make the Step 3 sheet require each value |
| Accused | Stored in `case_parties` with name or unknown, phone, alias, primary. No address | Add address (stored in `residence`). Require at least one accused |
| Witnesses | Stored in `case_parties` with role, when present, note. No key flag | Add `is_key` |
| Documents | `documents.kind` = `fir_primary`, `fir_scene`, `fir_communications`, `fir_other`, `id_proof`. No custom slot name. Identity is never shown masked because no digits are recorded | Add `documents.slot_label` for custom slots and `documents.identity_last4`. The client enters only the last four digits, and the app shows `XXXX-XXXX-1234`; a full number is still refused |
| Draft versions | `drafts` (`fir_proforma`) plus `fir_submissions`, with PDF, created by and version | Keep. Add `ai_used` (always false until D-08) |
| Reviews | `draft_reviews` stores decision and comment only, and only admin reviews exist | Add `reviewer_role`, `sections text[]` and `attachment_document_id`. Store client approvals and change requests too |
| Police submission | Not built | New table `fir_police_submissions`: case, submitted on (date), receipt document, marked by, created at |
| Support requests | `support_tickets` has no service field. Callback and chat can't say "FIR Draft" | Add `support_tickets.service_code` and show it in the admin inbox |
| Events | `case_events` | Keep. Every new action writes an event |
| Setting | None | New single-row `fir_settings` table with `police_submission_by_advocate` (default true) and an admin toggle |

All of these are additive: new tables, plus new nullable columns or columns with defaults. The running image can keep serving after the migration.

## Statuses (C10 is the single source of truth)

One shared function maps (status, sub-status) to the client stage, the advocate label and button, and the admin label. All three apps use it.

| Backend status / sub-status | Client (C10) | Advocate (A1 chip → button) | Admin |
|---|---|---|---|
| `paid` / `assigning` / `advocate_declined` | 2 Information Review (active) | — | New request: assign |
| `assigned` | 2, "Drafting team assigned" | New Request → Review Request (A2) | Assigned |
| `advocate_accepted` | 2, "Drafting team assigned" | Accepted → Review Documents (A3) | Accepted |
| `in_progress` | 3 Draft Preparation | Draft Preparation → Continue Draft (A5) | Drafting |
| `in_progress` / `awaiting_admin_approval` | 3 Draft Preparation | Sent to Admin → View Status (A6) | Approval queue |
| `changes_requested` / `advocate_revision_required` | 3 Draft Preparation | Admin Returned → Continue Draft (A5) | Returned to advocate |
| `client_review` | 4 Awaiting Your Approval → opens C11 | Waiting for Client → View Status (A6) | Sent to client |
| `changes_requested` / `client_changes_requested` | 3, "Advocate is updating your draft" | Client Changes → Continue Draft (A5) | Client asked for changes |
| `approved` / `awaiting_police_submission` (setting on) | 5 Draft Ready; F9 shows "Police Station Submission" as next | Client Approved → Mark Submitted (A6) | Awaiting police submission |
| `completed` | 5 Draft Ready (done) | Completed → View (A7) | Completed |

Transitions: admin approve → `client_review`. Client approve → `approved` (setting on) or `completed` (setting off). Client changes → `changes_requested` / `client_changes_requested`, then the advocate revises and sends to admin again. Advocate marks submitted to police → `completed`. Advocate reject → `advocate_declined` with the advocate cleared, so the admin can assign again.

## Client

| Screen | Design file | What the flow says | What's built | What to change |
|---|---|---|---|---|
| C1 Landing | F0a-landing-v2 | Hero, 4 cards, Learn more, two radio cards (DO IT YOURSELF / GET EXPERT HELP), disclaimer, footer without "256-bit" | API mode: a FirClient "Start FIR Request" card with copy nobody wrote (`FirClient.tsx:25`). The old design 40 appears only in fixture mode, with no radio cards or tags (`app/fir/index.tsx:79-93`) | Build F0a live. Tapping a card selects it and doesn't navigate |
| C1 | F0a | Continue with Quick Submission → Step 1 (sign in first, then return) | Fixture pushes `/fir/step1` with no case | Create or resume the draft case, then go to `step1?caseId=` |
| C1 | F0a | Request Chat → F2 (Regarding: FIR Draft); Request Callback → F1 (service = FIR Draft) | One "Get Assistance" button → `/callback`, no service (`index.tsx:86-93`); no chat entry | Two buttons, each passing `service=fir_draft` |
| C1a Callback | F1-request-callback | Name and mobile pre-filled; ticket with service FIR Draft; hours from the support-hours setting; Back → C1 | `RequestCallback` pre-fills, sends no service (`features/messages/Support.tsx:153`), hard-codes "24 hours" (`copy/supportContact.ts:6`) | Send `service_code`; take the hours from the support-hours constant; match the F1 layout |
| C1b Support Chat | F2-support-chat | Header "Legal Support · Legalitt Support Team"; bar "Regarding: FIR Draft Service · Non-Advocate Chat"; welcome message; 4 quick chips; attachment; no presence; mic only if speech-to-text works | `SupportChat` header "Support Chat / Legalitt Support" (`Support.tsx:39-42`); no Regarding bar, chips or attachment | Add the header, Regarding bar, welcome message, chips that send their text, and attachment; leave out presence and mic |
| C2 Why FIR | 41-fir-info | 5 cards, steps 1–4, turnaround from settings (24–48 h), Send a FIR Draft → Step 1 | API mode: FirClient. Fixture hard-codes "12–24 Hours" (`info.tsx:131`) | Build 41 live with the policy turnaround; Send creates or resumes the case |
| C3 Step 1 | F0b-step1-v2 | Place of Incident card: Address (required), Use current location, City (required), PIN (optional) | Not built (`step1.tsx:29-100`) | Add the card, geolocation and its failure message, plus the data fields |
| C3 | F0b | Police Station dropdown filtered by District, free text where there's no list | Free text (`step1.tsx:98`) | Seed MP stations; dropdown with "Type police station name" fallback |
| C3 | F0b | Name, mobile and email pre-filled from the profile | Blank (`context/fir.tsx:11-12`) | Pre-fill from the session |
| C3 | F0b | Footer "shared only with your assigned advocate and Legalitt admin"; no "encrypted" | "stored encrypted…" (`step1.tsx:117`) | Use the flow's wording |
| C3 | F0b | Back with typed data: "Save as draft and leave?" Save draft / Discard / Stay | Saves silently, then goes back (`FirShell.tsx:31-35`) | Add the three-option dialog |
| C4 Step 2 | 43 | Location and police station pre-filled from Step 1 | Location blank (`step2.tsx:40-46`) | Pre-fill both |
| C4 | 43 | Date can't be in the future | Format check only (`shared/src/fir.ts:34-39`) | Add the check in shared validation |
| C4 | 43 | Dictate statement only where speech-to-text works | Always shown; only shows a toast (`step2.tsx:74`) | Use browser speech recognition when available, otherwise hide |
| C4 | 43 | (?) → Help Center, FIR section | No handler (`FirShell.tsx:47-51`) | Wire it |
| C5 Step 3 | 44 | Complainant Edit sheet: name, father's/husband's name, age, gender, occupation, address, all required | Inline panel with Unknown / N/A radios (`AnswerField.tsx:19`); gender is free text | Bottom sheet with six required fields; gender as choices |
| C5 | 44 | At least one accused ("Unknown" counts) | Not validated | Add the rule and an inline error |
| C5 | 44 | Accused sheet adds Address | No address (`step3.tsx:24-30`) | Add it |
| C5 | 44 | Remove asks "Remove this person?" | Removes immediately (`step3.tsx:41`) | Confirm first |
| C5 | 44 | Witness: name, Key Witness tag, relation, phone, note. Empty "No witnesses added. Add anyone who saw the incident." | Role / when present / note; no key flag; empty text is shorter (`step3.tsx:44`) | Use the flow's fields and copy |
| C6 Step 4 | 45 | Slots 1–4, custom slot, and 5 Identity Proof (required). Primary Documents required. Delete confirms | ID sits inside slot 1; only ID enforced (`step4.tsx:51,66`); delete immediate; custom slot shows a "not available" toast (`step4.tsx:64`) | Separate ID slot 5; enforce Primary and ID with the reason next to each slot; confirm delete; build custom slot |
| C6 | 45 | Scene: max 5, JPEG/PNG/MP4 ≤50 MB; Other accepts audio | PDF/PNG/JPEG only (`features/fir/shared.tsx:27`) | Accept MP4 and audio where the upload service allows them; enforce 5 files |
| C6 | 45 | ID shown masked (XXXX-XXXX-1234) | No digits recorded (`IdentityEvidence.tsx:20`) | Collect only the last four digits and show them masked everywhere |
| C6 | 45 | No VERIFIED / SHA-256 / AES / chain-of-custody; summary shows only file count and size | Summary also states a "custody" heading | Show file count and total size only |
| C7 Step 5 | 46 | People card shows counts; Edit → step → Continue returns to Review | Lists every person in full (`step5.tsx:53`); Continue walks through every step (`context/fir.tsx:92`) | Show counts; add `returnTo=review` |
| C7 | 46 | Proceed To Pay → F3 | Goes to `/fir/payment`, which renders FirClient | Go to the new F3 |
| C8 Payment | F3-complete-payment | Service card + Ref ID; Service fee, Platform fee, GST 18%, Extra pages (only above 25), Total Payable; UPI App / Scan QR / Cards / Net Banking; "Test payment, no money is charged"; Back → Step 5 | Plain cards with a ₹0 extra-pages row; one button; no method choice (`FirClient.tsx:27-31`) | Build F3 on `CompletePaymentScreen`/`PaymentMethods` with a selection callback |
| C8 | F3 | Failure: "Payment didn't go through. You haven't been charged." + Try again | Server message + Retry | Use the drawn copy |
| C8a Scan & Pay | F4-scan-pay | Real 10:00 countdown, "FIR Draft", Simulate successful payment button (never on a timer), "QR expired" + Generate new QR, Back → F3 | Not built live; fixture timer can auto-advance (`ScanPayScreen.tsx:83-87`) | Build live F4; nothing advances on its own |
| C8b Payment Success | F5-payment-success | Real FIR ID + Copy; "Your FIR draft request has been submitted."; Start Tracking → C9; Back → Home | Not built live | Build F5 |
| C9 Submitted | 47-fir-submitted | Real ID, Submitted badge, real time, turnaround; Track → C10; Home; Back arrow → Home; no encryption footer | FirClient; fixture back arrow can return to payment (`FirResultHeader.tsx:29`) | Build 47 live; Back arrow replaces to Home |
| C10 Status | 48-fir-status | Request Details rows, 5-stage timeline from the C10 mapping, "Stage N of 5", Contact Support pre-filled, Share | Raw event log, Refresh / My Cases buttons (`FirClient.tsx:32`, `Lifecycle.tsx:12-22`) | Build 48 live from the shared mapping; wire Share and Contact Support |
| C11 Draft Ready | F6-draft-ready-decision | PDF card with real name and size, View, Download; Stage 4 of 4; Statutory Notice; Approve → (confirm) and Request For Changes | Not built (no client-review state) | Build F6 for `client_review`; design 49 after approval or during changes |
| C12 Request Changes | F7-request-changes | Section chips (multi), text ≤600 with counter, one optional attachment ≤10 MB, Submit / Cancel & Return with discard confirm | Not built | New screen and endpoint |
| C13 Changes Submitted | F8-change-request-submitted | Selected sections, real time, 3-step next, Back to FIR Request → C10, Go to Home, Contact Support; Back → C10 | Not built | New screen |
| C14 Approved | F9-draft-approved | Advocate card with Chat; Approved badge, ID, PDF, recorded time; next steps incl. Police Station Submission (setting); Statutory Notice; Back to Home | Not built | New screen; with the setting off, the last rows read "Download your approved draft" / "Submit it at <police station>" |

## Advocate

| Screen | Design file | What the flow says | What's built | What to change |
|---|---|---|---|---|
| A1 Cases list | 213, 214 | Counters Active / Upcoming / Completed | REVIEW / PROGRESS / RESOLVED (`features/legal-notice/advocateList.ts:56-61`) | Use the drawn counters |
| A1 | 213, 214 | Chips All · Active · Upcoming · Waiting for Client; service chips always include FIR Draft | Different chips (`advocateList.ts:40`); service chips only from loaded records (`useNoticeLists.ts:23`) | Match the design |
| A1 | 214 | Card: FIR DRAFT tag, ORDINARY tier, client · incident type, ID · Fee ₹share, status chip, last note, Updated time, status button | Generic title, no fee or tier, empty note and footer, "Open Case" always (`features/cases/case-list.ts:7-37`) | FIR card from the C10 mapping, fee from the price snapshot |
| A1 | — | Empty: "No FIR requests yet. New requests assigned to you will appear here." | Generic empty copy | Use the flow's copy when the FIR filter is on |
| A2 Request | 215 | New Request badge, received time, ID, station; Client Details grid; Incident Overview; Statement; "You will receive ₹base"; Documents with size, type, View; ID as "Identity Proof (masked)"; no KYC, Escrow or "All Verified" | API mode: one plain card plus "View <file>" buttons (`FirAdvocate.tsx:65,85-87`) | Build 215 live |
| A2 | 215 | Accept → confirm → A3 | No confirm; reloads into the editor | Confirm, then A3 |
| A2 | 215 | Reject → required reason → back to admin → advocate to A1 | "Decline Assignment", no reason, case stuck (see "Read this first" item 3) | Required reason; end the assignment and clear the advocate; show the reason to admin; go to A1 |
| A3 Review Documents | 216 | Banner, client card, documents with real page count, Client Information, Client's Description; Continue → A4; Back → A1 | Not built live | Build 216 live |
| A4 Generator | 217 | Pre-filled summary; Generate with AI disabled ("AI drafting is coming soon. Use Create Manually."); Create Manually → A5; Back → A3 | Not built live | Build 217 live |
| A5 Proforma | 218 | Header "Workspace / Fir Draft" with outline, preview and save icons; "Auto-saved N min ago"; docket with ID and station | Different header, "My Cases" button, no autosave time (`FirAdvocate.tsx:58-71`) | Match 218 |
| A5 | 218 | Proforma header "FIR DRAFT — prepared for submission at <police station>" | "FIRST INFORMATION REPORT / FORM I" on screen and in the PDF (`DraftEditor.tsx:25`, `documents/fir-pdf.ts:28`) | Change both |
| A5 | 218 | FIR Number an empty box; ID masked | Explanatory text; ID file picker | Empty box; show masked ID |
| A5 | 218 | Legal sections as BNS chips with ×, + Add Legal Section from a search list | Free-text rows (`DraftEditor.tsx:36`) | Chips + BNS list |
| A5 | 218 | Save Draft; Send for Review → validate, PDF, awaiting admin → A6; Preview (eye) | "Send for Admin Approval" (`substitutions.ts:11`); stays on page; preview is two buttons | Rename; go to A6; eye icon preview |
| A5 | 218 | Back asks "Save changes?" if unsaved, then A1 | No prompt | Add the prompt |
| A6 Review status | 219, 449 | ID + badge + station; client card with Call; draft card (version, created by, sections, files, View, Share); Filing Timeline incl. Sent to Admin / Admin Approved / (Submitted to Police); status panel per state; audit log; Continue → A1 | Frozen-version text and a returned-versions list (`FirAdvocate.tsx:63,79`, `Lifecycle.tsx:23-31`) | Build 219/449 live |
| A6 | 219 | Waiting for client: Remind Client (in-app, once per 24 h) | No such state | Add the endpoint and button |
| A6 | 219 | Client requested changes: client's text + Edit Draft | Not built | Show the sections, text and attachment |
| A6 | — (§9.2) | Mark as submitted to police: receipt upload (required) + date → A7 | Not built | Build behind the setting |
| A7 Completed | 220 | Tick, "FIR Draft Completed — the client approved your draft."; case card; ₹share "added to your Legalitt wallet", payment date, wallet reference; completed steps; View Earnings, View FIR, × | Generic completion card, "not a payout confirmation" copy (`features/cases/AdvocateCompletion.tsx`) | Build 220 live; wallet reference = request ID (the wallet has no ledger row) |

## Admin (no designs: awaiting Figma admin designs)

| Capability | What the flow says | What's built | What to change |
|---|---|---|---|
| 1 New requests | Paid requests queue; assign | `/services/fir_draft/cases` with "+ Assign" (`apps/admin/src/case-detail.tsx:44,63`) | Keep; add a "New requests" filter |
| 2 Advocate rejected | Returns with the reason; admin reassigns | Dead end; no reason (`case-detail.tsx:45`) | Show the reason and the Assign button |
| 3 Approval | Approve → client; Return with a required reason → same advocate | Approve → `completed` (`fir-admin.service.ts:111-118`); Return works | Approve → `client_review`; keep Return |
| 4 Reassign after repeated failure | Reason shown in the timeline; only the final advocate is paid | Allowed after the policy count; no reason (`packages/shared/src/fir-lifecycle.ts:6`) | Add a required reason, stored in the event |
| Setting | One switch for who submits to police | None | Toggle on the FIR approval panel |
| Statuses | Same state as client and advocate | Generic buckets | Use the shared mapping label |

## Resolution (12 November 2026, not deployed)

Every gap above is closed in code except the items under "Still open". Each fix was checked locally, end to end, as client, advocate and admin: `scripts/verify-fir-full-flow.cjs`, 47 checks, all passing in one clean run. The built screens are beside their designs in [`fir-screens/`](fir-screens/README.md).

- **Data (§4):**
  - Additive migration `202611120010_fir_full_flow`.
  - Place of incident, police station id, key witness and identity last four digits.
  - Custom upload slots, `ai_used` on drafts, and client reviews with sections and an attachment.
  - Police submission with receipt, `fir_settings`, and support requests tagged with the service.
- **Statuses:** `firStage()` in `packages/shared/src/fir-flow.ts` is the single C10 mapping. The client timeline, the advocate chip and button, and the admin label all use it.
- **Client C1–C14:**
  - Every route renders its designed screen on real data.
  - Request Chat and Request Callback reach the admin Support inbox tagged "FIR Draft".
  - Request Changes stores the chosen sections and an attachment, and the revision goes back to the admin before the client sees it.
- **Advocate A1–A7:**
  - Designed screens on real data.
  - Reject takes a required reason and returns the case to admin.
  - Generate with AI is disabled with "coming soon".
  - "Send for Review" sends the draft to the admin.
  - Remind Client can be used once every 24 hours.
  - "Mark as submitted to police" requires a receipt.
  - The advocate's share is credited when the case completes.
- **Admin §3:**
  - New requests and assignment.
  - The rejection reason is shown, and the case can be reassigned.
  - Approve sends the draft to the client; Return requires a reason.
  - Reassigning after repeated failures needs a reason, which appears in the timeline.
  - The police-submission switch.
  - All of this is marked "awaiting Figma admin designs".
- **Police submission:** controlled by the switch, default on. Switching it off gives the client-submits version with no code change; checked locally.
- **Tests:**
  - API suite 190/190, including a new `fir-full-flow.cjs` with an isolation check for every new endpoint.
  - The mobile and admin typechecks have no new errors.

- **A2 contact masking (approved 12 Nov):** until the advocate accepts, the client's mobile and email are masked ("+91 90••••••00") in every API response the advocate receives, the drafting context is refused and earlier draft PDFs are withheld; in full after acceptance. Isolation-tested.
- **Old scripts:** `verify-fir-draft.cjs`, `verify-fir-admin-rejection.cjs` and `helpers/fir-admin-return-walk.cjs` were deleted; `verify-fir-full-flow.cjs` replaces them (`FIR_DEPLOYED=1` runs it on the live sites).

**Still open**

- The police-station list is unverified (D-100, §9.1).
- "Use current location" attaches coordinates only; there is no geocoding.
- The Help Center has no FIR section.
- The A1 "Upcoming" counter is always 0.

## Hotfix after Ishaan sir's answers (12 November 2026)

[`ISHAAN-ANSWERS-2026-11-12.md`](ISHAAN-ANSWERS-2026-11-12.md) §A overrides the flow on two FIR points:

- **No police step (Q119, Q120).** The client's approval completes the case and credits the advocate. "Mark as submitted to police", its receipt upload and the admin switch are gone, and F9 uses the client-submits wording.
- **No identity document (Q114).** The Identity Proof slot, the ID-digits requirement and the "Official ID Document" row are gone.

The built screens in `fir-screens/` were recaptured after the hotfix.
