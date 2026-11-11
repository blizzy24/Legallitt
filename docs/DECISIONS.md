# Legalitt — Product decisions

11 November 2026. This file records the decisions that fill the gaps between the
client's designs and a finished product. It was written after reading all 463
designs in `design/`, the client profile and messages screens supplied today
(`design/supplied-2026-11-11/`, cited below as `profile-N` and `messages-N`),
and the state of `main` at `f5647c5`.

**How to use it.** Every decision has an ID (`D-01`, `D-02`…). Code, commit
messages and §9.2 entries should cite the ID. Where a decision is provisional
and needs the client's confirmation, it says so and appears again in §12.

**Order of precedence** when sources disagree: a client answer in writing >
this file > the designs > the architecture document's older text. This file
never overrides a client answer.

---

## 1. Ground rules carried forward

These are already in `AGENTS.md`. Restated because every decision below
depends on them.

- **The designs are the specification**, read for intent, not pixels (§1a.1).
- **Keep it fake till we make it** (§2.11): what isn't built is simulated
  behind the real API and labelled honestly. Never skipped, never bypassed.
- **Every screen has five states**: ideal, empty, partial, loading, error.
- **Navigation follows the tap, never the clock.**
- **No fixture data on an API-backed screen.**
- **Client and advocate never see each other's internal information** —
  enforced in API responses and notifications, not only on screens.
- **ID numbers are never extracted or stored** from identity documents.

---

## 2. Trust and integrity — the most important section

**D-01. No screen may claim a protection, verification or guarantee the
product does not actually provide.**

The designs supplied today, and several earlier ones, contain security and
legal assurances that are not true of this system. On a legal product these
are not cosmetic. A client who reads "end-to-end encrypted privileged chat" or
"protected by RBI-regulated escrow" relies on it, and it is false. Every one is
removed or replaced with an accurate statement.

| Design | Drawn claim | Why it's false | Replace with |
|---|---|---|---|
| 142, `messages-1` | "End-to-end encrypted lawyer-client privileged chat" | Messages are stored server-side and readable by the system. Privilege is a legal status we can't confer | "Messages are private to you, your advocate and Legalitt support." |
| 143, `messages-2` | Green online dot, "Online · Indore", "is typing…" | No presence or typing system exists | Omit. Show advocate name, verification and matter only |
| 56, `profile-7` | "Encrypted and restricted to assigned counsel under Indian Evidence Act confidentiality norms" | Admin can also access; the Evidence Act claim is a legal assertion we can't make | "Stored encrypted. Visible only to you, your assigned advocate and Legalitt's team." |
| 57, `profile-8` | "Digital Signatures Verified (Aadhaar e-Sign)", "Verified Vault", "Security & Vault ID" | No e-signing exists; "vault" is a label on an S3 object | Omit all three. Show file name, type, size, upload date, case |
| 58, `profile-9` | "Protected by RBI-regulated Escrow Bank Partners. Advocate fee held securely until consultation completion" | There is no escrow. Payments are simulated | Omit |
| 59, `profile-10` | "Full settlement confirmed by Bank Escrow", "Secured via Legalitt Client Escrow. Funds are released based on court filing confirmation" | Same | "Payment received." No release-condition claim |
| 359 | "Transferred via RBI-compliant clearing network. Legalitt retains zero custody of escrowed client retainers" | Same; payouts are manual | "Paid to your bank account by Legalitt. You'll see the UTR here once sent." |
| 314 | "100% Secure Government Court Payment — Verified by Legalitt" | We don't verify court payments | See D-31 |
| 326 | "Official Registry", "Court listing verified" | We don't integrate with any court system | "Added by your advocate" |
| 92 | "256-bit encryption protects all your records · Official legal compliance" | Unverified compliance claim | Omit (and see D-40) |
| 64, `profile-15` | "2FA Active", "Login Alerts" | Neither is built | Omit until built (D-21) |
| 54, `profile-5` | "You will be notified immediately via push & SMS" | SMS isn't live (DLT pending); push isn't built | "You'll be notified in the app." |
| 52, `profile-3` | "Verified by Advocate" on documents | No verification action exists | Show only after D-27's "Mark reviewed" is built; otherwise omit |

**D-02. Advocate facts come from data or don't appear.** Ratings, review
counts, "120+ client briefs", years of experience, "Verified" badges and
availability lines are shown only when the database holds them. A rating with
no reviews behind it is omitted, not shown as 4.8.

**D-03. Support hours and response times are the client's operational
promise.** Designs 20 and 21 state "Monday–Saturday, 9 AM–7 PM IST" and
"responds within 2 business days". Kept as drawn, stored as configurable text,
and listed in §12 for confirmation.

---

## 3. Services in scope

**D-04. The client app offers the seven services the client drew** on the
home screen (`profile-23`) and All Services (13): Legal Notice, FIR Draft, Legal
Advice, Property Search, Document Forensic, High Court Representation,
District Court Representation.

**D-05. Court Marriage is hidden from client entry points.** It has no client
design, doesn't appear on either drawn service list, and was built on
assumption. Its backend, admin handling and data stay; it's removed from the
home screen, All Services, and search until the client confirms it's in scope.
Listed in §12.

---

## 4. Service workflows

Each service below is described end to end for all three roles. "Built" means
working on `main` today; "Add" means a gap this file decides to fill.

### 4.1 Legal Notice — complete

Client: 7-step intake with AI subject and demands → documents → pay →
tracking → review draft → approve or request changes → delivery tracking →
delivered. Advocate: accept → draft → send for client review → book courier →
dispatch. Admin: assign → confirm delivery with POD. Courier milestones are
simulated.

- **Add D-06 — cancellation** per §5.
- **Add D-07 — advocate completion view.** No design exists. After admin
  confirms delivery, the advocate's case shows "Delivered — case complete",
  the proof of delivery, completion date, and the entitlement recorded for
  them (from the captured price snapshot). Built in the existing advocate case
  layout. Logged in §9.2.

### 4.2 FIR Draft — complete except AI

Client: 5-step intake including personal details and one of four accepted IDs
→ pay → receive the approved draft. Advocate: accept → structured 8-section
proforma → send for admin approval. Admin: approve, return with reason, reject
an unmasked Aadhaar, or reassign after a second rejection.

- **Add D-06 — cancellation** per §5.
- **Add D-08 — AI draft generation** (designs 217, 446). Uses the existing AI
  port with a new `fir_draft` task producing the structured content schema.
  Advocate-facing only; the advocate reviews and edits before sending; labelled
  "AI-generated draft — review before use". Never fabricates facts not in the
  intake. Identity files are excluded from AI input. **Priority 2.**

### 4.3 Legal Advice — built, gaps in follow-through

Client: choose advocate and slot → pay ₹885 → join chat consultation →
receive the advocate's brief → review. Advocate: availability, consultation,
brief. Admin: approves the brief.

- **D-09 — consultations are chat only.** Voice and video (113, 114, 122,
  123, 173, 174) need a call provider and aren't built. The mode picker shows
  them as "Not available yet". Not using a public meeting service, because
  legal consultations shouldn't pass through a third-party server nobody has
  vetted.
- **Add D-10 — follow-up booking** (116): from a completed consultation, "Book
  follow-up" opens the booking flow with the same advocate preselected.
- **Add D-11 — no-show handling.** If the advocate hasn't joined within 15
  minutes of the slot start, the client sees "Your advocate hasn't joined" with
  two choices: reschedule free with the same advocate, or request a refund
  (goes to the admin refund queue, §5). The no-show is recorded against the
  advocate.

### 4.4 District Court and High Court Representation — built as
consultation → quote → payment → manual stages; the designs draw much more

The designs (289–355 client, 362–432 advocate) draw a full litigation
lifecycle. The current build collapses it into manual status updates. These
add the drawn stages as real, structured steps:

1. Consultation (₹885) → advocate quote → client accepts and pays — **built**.
2. **Documents needed** (303, 350, 374–376, 410–412): advocate lists required
   documents → client uploads, or sends physical copies via the existing
   self-courier details form → advocate confirms receipt.
3. **Case preparation** (313, 377, 413): advocate posts preparation status.
4. **D-31 — Court fee** (314–317, 380–381, 416–417).
5. **D-32 — Pre-filing review** (318, 382–383, 418–419).
6. **Court filing** (320, 378–379, 384, 414–415, 420): advocate records filing
   date, case number and uploads the filed copy.
7. **D-31 — Process fee** (321–325, 385–386, 421–422).
8. **D-33 — Hearings** (326, 328, 387–392, 423–427).
9. **Case completed** (335, 395, 432): advocate records the outcome and
   uploads the final order → admin final approval → closed.

- **D-34 — client-initiated change of advocate** (329, 347–348, 393–394,
  428–430).
- **D-06 — cancellation** (349), per §5.

### 4.5 Property Search — complete

Client intake → pay → advocate report delivered directly to the client (211;
no admin approval). Add **D-06 — cancellation**.

### 4.6 Document Forensic — complete

Intake → pay → advocate report and affidavit → admin approval or changes
(231) → client. Add **D-06 — cancellation**.

---

## 5. Cancellations and refunds

No refund workflow exists today, so a paid case can only end by completing.
Design 349 draws client cancellation and states "no penalty or fees apply for
cancelling at the review stage". That's the starting point.

**D-12. Cancellation rules, applied to every service.**

| When | Who | What happens |
|---|---|---|
| Paid, no advocate accepted yet | Client, self-serve | Cancelled immediately, **full refund**, no reason required (optional reasons from 349) |
| Advocate accepted, work not delivered | Client requests | Goes to admin's **Cancellations & refunds** queue. Admin sets the refund amount (full or partial) with a reason shown to the client |
| Work delivered or case completed | — | No cancellation. Client is directed to Contact Support |
| Consultation no-show by advocate | Client | Reschedule free, or refund request to admin queue (D-11) |
| Court fee or process fee | Admin | Refundable only if the advocate hasn't yet paid it to the court |

**D-13. Refunds are simulated like payments.** A refund writes a refund
record against the original payment and moves the case to `refunded` or
`cancelled`. No money moves. Labelled honestly in the admin panel. When
Razorpay is integrated, the refund record becomes a real Razorpay refund.

**D-14. A cancelled case releases the advocate** — it leaves their active
work, and they're notified. Partial-refund cases record no advocate
entitlement unless the admin sets one.

---

## 6. The client's account area (designs 50–71 and `design/supplied-2026-11-11/`)

Several of these are gated "not available" today. All become real.

**D-15. Profile and Edit Profile** (50, 51; `profile-1`, `profile-2`): name, email, mobile,
date of birth, gender, city, state, country, preferred language. Mobile and
email show "Verified" only when Cognito says so. Consultation preferences
show Chat as available and Voice and Video as "Not available yet" (D-09).
"My Cases 3 Active" uses the real count.

**D-16. My Requests and Request Details** (53, 54; `profile-4`, `profile-5`): every case that
isn't complete, grouped All / Pending / Accepted / Completed, each with its
real advocate, forum, dates and timeline. Request Details offers **Contact
Legalitt Support** (D-23) and **Cancel Request** (D-12).

**D-17. Documents** (52, 56, 57; `profile-3`, `profile-7`, `profile-8`): **My Documents** lists every
document across the client's cases; **Case Documents** filters to one case.
Categories from document origin. Viewer: page navigation, zoom, download.
"Share" is omitted — no external sharing exists. A client may delete a
document only if it isn't attached to a submitted case; otherwise the delete
action explains why it can't be removed.

**D-18. Payments** (58, 59; `profile-9`, `profile-10`): history from real payment records,
filters, totals. Payment Details shows the real breakdown from the price
snapshot. **Download Receipt** generates a **payment receipt PDF**.

- **D-19. Not a tax invoice.** A GST tax invoice requires Legalitt's GSTIN,
  registered name and address, which we don't have. The "Need GST invoices?"
  card says tax invoices will be available once Legalitt's GST details are
  added. Listed in §12.

**D-20. Notifications** (60; `profile-11`): real inbox with All / Cases /
Consultations / Payments filters, Mark all as read. **Notification
Preferences** controls in-app categories. SMS and WhatsApp appear as "Not
available yet".

**D-21. Login & Security, Change Password, Active Sessions** (63–65;
`profile-14` to `profile-16`):
- Change Password works through Cognito for password accounts. Accounts that
  sign in by one-time code see "You sign in with a one-time code" instead.
- Email and mobile show their real verified state.
- Google sign-in shows "Not available yet" — not wired.
- **Two-Step Verification and Login Alerts are omitted** until built.
- Active Sessions lists recent sign-ins from `auth_events` with device type
  and time. **Location is omitted** — we'd be guessing from an IP address.
  "Sign Out of All Other Devices" calls Cognito global sign-out. Per-device
  sign-out is omitted; Cognito doesn't support it without device tracking.

**D-22. Language** (61; `profile-12`): English is the only language. Hindi,
Marathi, Gujarati, Bengali, Tamil and Telugu appear as drawn, disabled,
labelled "Coming soon". The preference is stored so it applies when
translations exist.

**D-23. Privacy Settings** (66; `profile-17`): most toggles control features that
don't exist — online status, read receipts, call privacy, message requests,
location access. They're omitted. The screen becomes a short, accurate summary
of who can see what (your advocate sees your case details; Legalitt's team
can access cases for support and quality review), with links to Data &
Documents and the Privacy Policy.

**D-24. Data & Documents and Delete Account** (67, 68; `profile-18`, `profile-19`):
- **Download My Data** generates an export of profile, cases, payments and
  messages — the client's right under the DPDP Act.
- **Delete Account** creates a deletion request. The account is deactivated
  immediately (signed out everywhere, can't sign in). An admin completes the
  deletion. **Blocked while a paid case is active**, with the reason shown and
  a link to cancel or wait for completion. Retention period is an open DPDP
  question (§12).

**D-25. Help Center** (69; `profile-20`): searchable FAQs by category. **Answers
describe what the app actually does** — written from the built behaviour, not
from the design's placeholder text. No invented policies.

**D-26. Contact Support, Request a Callback, Support Chat** (35, 36, 70;
`profile-21`): all three create records in a new admin **Support inbox**.
- Contact Support: subject, related to, description, optional attachment
  (PDF/JPG/PNG up to 10 MB as drawn), preferred contact method. Submitted
  state as drawn in 21's preview toggle.
- Request a Callback: name and mobile, prefilled from the profile.
- Support Chat: a support thread visible in the Messages inbox under the
  Support filter. Admin replies from the panel.

**D-27. Saved Advocates** (55; `profile-6`): heart toggle on advocate profile and
cards. Saved list shows real practice areas, location, availability from
weekly hours, and **₹885 per consultation** (flat, per the confirmed pricing,
not the ₹1,500 / ₹1,800 drawn). **Book Consultation** opens Legal Advice with
the advocate preselected. Empty state as drawn.

**D-28. Messages inbox** (142, 143; `messages-1`, `messages-2`): every case thread plus the
support thread, filters All / Unread / Advocates / Support, search across
advocate, matter and message text, real unread counts. Thread: matter banner,
attachments as document cards, failed-send with Retry. No presence or typing
(D-01).

**D-29. Logout** (71; `profile-22` to `profile-26`): confirmation modal, clears the session.

**D-30. Home screen.** "Search legal services" filters the service list. The
video carousel (145, 146) is omitted until the client supplies the video.

---

## 7. Court representation details

**D-31. Court fee and process fee.** The advocate creates a fee request with
the amount and purpose. The client pays in-app (simulated). These are
**statutory pass-through amounts**: no platform fee, no GST, outside the
80/20 split. After paying, the case shows "Awaiting court receipt" until the
advocate uploads the court's receipt, which the client can then view. That
replaces the drawn "Verified by Legalitt" claim with something true.

**D-32. Pre-filing review.** The advocate shares the documents to be filed.
The client approves, or requests changes with a comment, which returns them to
the advocate. Filing can't be recorded until the client has approved.

**D-33. Hearings.** A structured hearing record: date, time, court, room,
bench, presiding officer (optional), status (scheduled, held, adjourned). The
advocate adds and updates hearings and posts an update after each one. The
client sees a hearings list and details (15, 19, 20, 326, 328). Labelled
"Added by your advocate". Hearings also appear on the advocate's calendar.

**D-34. Client-initiated change of advocate.** The client requests a change
with a reason (329). It goes to the admin, who assigns a new advocate. For
court matters, the previous advocate's NOC is uploaded and recorded. The
drawn ₹1,500 processing fee is seeded as **provisional** (`confirmed=false`).
The completing advocate receives the full 80% (already decided). The previous
advocate is notified and loses access.

---

## 8. The advocate side

**D-35. Advocate verification** (233–244). An advocate who signs up as a
lawyer (133) completes personal details, professional details, Bar Council
details, practice areas and city, and documents (identity, enrolment
certificate, certificate of practice) → review and submit → **admin
approves, requests an update (243), or rejects**. Only approved advocates are
assignable or bookable. Bar Council enrolment numbers are stored as entered
(a public professional identifier). Identity documents follow the
no-extraction rule. The drawn "BCI Compliance & Data Privacy: encrypted and
strictly maintained" line is replaced per D-01.

**D-36. Wallet and payouts** (356–361, 256–260):
- The wallet shows real entitlements from captured price snapshots — the
  completing advocate's 80% of base plus delivery where applicable.
- **D-37. The drawn fee example is not our model.** Design 356 shows
  ₹3,500 gross / ₹350 fee (10%). Our confirmed structure is base = advocate
  share, platform fee 25% of base. Display follows the confirmed structure.
- **Ready to withdraw** = entitlements on completed cases not yet paid.
- **Withdraw** (359) creates a payout request (minimum ₹1,000, as drawn) →
  admin **Payouts** queue → admin pays outside the app and records the UTR →
  the advocate sees it (361). No money moves through the app.
- **Bank account** (257–260): stored, displayed masked to the last four
  digits, marked "Unverified" — penny-drop verification isn't built.

**D-38. Advocate workspace from real data:**
- **Clients** (151–159): clients from the advocate's own cases. Each client's
  page shows only cases, documents, messages and payments that involve this
  advocate.
- **Calendar** (271–274): consultations and hearings from real data; add a
  hearing from here.
- **Analytics** (268–270): cases by status, earnings by month, completion
  rate — from real data only. No invented benchmarks or rankings.
- **Reviews** (264–265): real reviews from completed consultations.

**D-39. Advocate settings** (245–255): edit profile, change password, manage
documents, login and security, language, payout settings, data and documents
— same rules as the client equivalents. App Permissions (252) and
Authorised Devices (253) beyond "sign out of all devices" are omitted.

**D-40. Client identity verification — DigiLocker and Video KYC** (92–100)
— **not built.** Both need a provider (DigiLocker requires empanelment).
Services that need ID collect it by upload, as FIR does. The KYC entry points
are hidden.

**D-41. AI tools for advocates** (170, 171, 178, 182, 364, 366, 400, 402,
407) — **Priority 2.** An AI case summary for the advocate, through the
existing AI port, advocate-only, labelled AI-generated, never shown to the
client. The free-form AI chat panel is not built.

---

## 9. Admin panel additions

**D-42.** In the existing dark/orange visual language, as the rest of the
panel:

| Queue | Feeds from |
|---|---|
| Advocate approvals | D-35 |
| Support inbox — tickets, callbacks, support chat | D-26 |
| Cancellations & refunds | D-12, D-11 |
| Payouts — mark paid with UTR | D-36 |
| Change-of-advocate requests | D-34 |
| Account deletion requests | D-24 |

Each queue sorts oldest first and shows how long each item has waited.

**D-43. Legal pages.** Sign-up requires agreeing to the Terms & Conditions and
Privacy Policy, and those pages don't exist. We can't write legal policy text.
The links open pages that say plainly the documents are being finalised, with
a support contact. **This is a launch blocker, not a demo blocker** — see
§12.

---

## 10. Priorities for the deadline

| Priority | Work |
|---|---|
| **P0 — demo-critical** | D-01 trust claims · D-05 hide Court Marriage · D-15–D-30 client account area and messages · D-12–D-14 cancellations and refunds · admin Support and Refunds queues · clear test data |
| **P1** | D-35 advocate verification · D-36 wallet and payouts · D-31–D-34 court representation stages · D-38 advocate workspace · D-07 advocate completion view · D-10, D-11 · remaining admin queues |
| **P2** | D-08 FIR AI · D-41 AI summary · and everything in §11 |

---

## 11. Not built — honest list

| Capability | Why | Labelled as |
|---|---|---|
| Real payments and refunds | Razorpay keys with Route not supplied | Simulated |
| Real advocate payouts | Needs Razorpay Route | Manual, with UTR |
| SMS, WhatsApp, push | DLT registration pending; push not built | "Not available yet" |
| Voice and video consultations | Needs a vetted call provider | "Not available yet" |
| DigiLocker and Video KYC | Needs provider empanelment | Hidden |
| Languages other than English | Translations not produced | "Coming soon" |
| Two-step verification, login alerts | Not built | Omitted |
| Google sign-in | Not wired | "Not available yet" |
| GST tax invoices | Needs Legalitt's GSTIN | Receipt only |
| Court system integration | No such integration exists | Advocate-entered |
| Bank account verification | Penny-drop not built | "Unverified" |

---

## 12. Open questions for the client

1. **Court Marriage** — is it a Legalitt service? There's no design for it and
   it isn't on the drawn service lists. (D-05)
2. **Provisional prices** — Property Search, Document Forensic, Court
   Marriage, and the ₹1,500 change-of-advocate fee. All `confirmed=false`.
3. **Support hours and response times** — "Monday–Saturday 9 AM–7 PM IST",
   "within 2 business days", "within 24 hours" for callbacks. (D-03)
4. **GST details** — GSTIN, registered name and address, for tax invoices.
   (D-19)
5. **Terms & Conditions and Privacy Policy text**, including the DPDP consent
   wording and how long data is retained after account deletion. **Required
   before real users sign up.** (D-24, D-43)
6. **Refund policy** — confirm the rules in D-12, especially partial refunds
   once an advocate has started.
7. **Advocate no-show** — 15 minutes before the client can reschedule or
   request a refund. (D-11)
8. **Home screen video** — supply the video for the drawn carousel. (D-30)
