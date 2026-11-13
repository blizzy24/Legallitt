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

---

## 13. Decisions taken during the 11 November build (D-44 onward)

Recorded by the builder of each item, with the §9.1/§9.2 entries that belong to it.

### P0-1/P0-2 — trust claims and Court Marriage (D-44..D-47)

#### New decisions

**D-44. Storage encryption is the only security claim the client app makes.**
Documents live in S3 with SSE-KMS (§2.3), so "Stored encrypted" is true and is
the wording D-01 itself uses. Every other claim is replaced with who can see the
data: "Visible only to you, your advocate and Legalitt's team". "256-bit",
"end-to-end", "Bar Council compliant", "BNSS compliant", "certified", "official"
and "secure payment" claims are removed wherever they appear, including fixture
screens that only render in design-preview mode.

**D-45. "Verified advocate" stays, because it is data.** Only advocates with
`advocate_profiles.verification = 'approved'` can be assigned or booked, so the
marketing line "Verified Advocates" and the badge driven by `verification` are
true. Ratings are shown only when `rating_count > 0` (D-02); experience only when
`years_experience` is set.

**D-46. The Legal Notice identity checkpoint is hidden in API mode (D-40).** The
simulated DigiLocker/Video KYC flow advanced on a timer and ended in "Identity
verified", which is both a false verification and timer navigation (§2.12). In
API mode the step-5 card is not rendered and Continue goes straight to the next
step. Fixture previews keep the drawn flow.

**D-47. Chat headers show no presence or typing by default (D-01).** The shared
chat component defaulted `online`, `typing` and `verified` to true, so the
consultation and report chats showed a green dot and a typing indicator. The
defaults are now false; a caller must pass real data.

#### §9.2 substitutions (exact strings)

| Design / screen | Original | Replacement |
|---|---|---|
| 40 FIR landing footer | 256-bit Encrypted • Confidential Legal Assistance | Private to you, your advocate and Legalitt's team |
| 42 FIR step 1 | Your details are encrypted and shared only with authorized legal drafting counsel. | Your details are stored encrypted and shared only with your assigned advocate and Legalitt's team. |
| 47 FIR submitted | Your information is encrypted • Bar Council Compliant | Stored encrypted • Visible to your advocate and Legalitt's team |
| 48 FIR status | 256-BIT ENCRYPTED FOLIO · Bar Council Compliant | STORED ENCRYPTED · VISIBLE ONLY TO YOUR CASE TEAM |
| 49 FIR ready | compiled and certified … / BNSS Compliant / 256-Bit Encrypted • Bar Council Compliant • Confidential | prepared by your advocate and approved by Legalitt … / Approved draft / Stored encrypted • Visible to you, your advocate and Legalitt's team |
| 22/23 Legal Notice landing/detail | IN COMPLIANCE WITH BAR COUNCIL OF INDIA STANDARDS; "safe/secure and confidential" | Line removed; "Visible only to you, your advocate and Legalitt's team." |
| 28/434 payment | Fast & Secure | Removed |
| 440 Notice Delivery | Statutory Evidence Guarantee — digitally stamped certificate of service with physical recipient sign-off | Proof of Delivery — Legalitt records the proof of delivery and it appears in your case file |
| 101–103 Legal Advice | Secure & Confidential | Private Consultations — Your chat is visible only to you, your advocate and Legalitt's team |
| WizardShell (LN intake) | Secure & Confidence / Your information is safe and confidential | Private & Confidential / Visible only to you, your advocate and Legalitt's team |
| 134 login | Login to your verified Legalitt client account | Login to your Legalitt account |
| 125/130 onboarding | Find Verified Advocates Nearby; "Chat, call…"; Title Verification Certificate | Find Verified Advocates; chat consultations; Property Search Report |
| OTP screen | END-TO-END ENCRYPTED SESSION | ONE-TIME CODE SIGN-IN |
| 206–212 PSR (fixture data) | Escrow Secured/Protected, Held securely in Legalitt Escrow… released automatically, Digitally Signed, Verified Identity, Encrypted Vault, certified documents, registry search | Payment recorded; Paid to your bank account by Legalitt after the report is delivered. You'll see the UTR here once sent; size only; omitted; Case documents; documents; search at the registry office |
| 90 DF report (fixture) | Verified by Forensic AI & Counsel / certified report | Prepared by your advocate / report |
| 314 court fee (fixture) | 100% Secure Government Court Payment • Verified by Legalitt | Court fee paid through Legalitt • Receipt uploaded by your advocate |
| 326 hearing (fixture) | Official Registry / Court listing verified | Added by your advocate |
| 359/257 wallet (fixture, gated) | RBI-compliant clearing network … zero custody of escrowed client retainers; RBI Regulated Payout Gateway | Paid to your bank account by Legalitt. You'll see the UTR here once sent.; Manual payouts |
| 92–100 KYC (unreachable in API mode) | 256-bit encryption … Official legal compliance; Encrypted Session; encrypted end-to-end | Identity verification is not available yet; Not available yet |
| Advocate fixture data (consultation, notice fee, drafting, settings) | Escrow Guaranteed/Cleared/Funded, End-to-End Encrypted, Chamber 256-bit HSM, Bar Council two-factor, encrypted per BCI norms | Recorded payment / Payment recorded, omitted, Saved to this case, honest sign-in and storage text |

#### Not changed here (owned by other builders)

Designs 56/57/58/59/142/143/64/54 (documents, viewer, payments, messages,
security, request details) are rebuilt by builders C, D and E, who apply D-01
on those screens. Their fixture screens still carry the drawn claims.

#### §9.1

No new simulated capability.

#### D-03

`apps/mobile/copy/support.ts` exports `supportHours` (hours, ticket, callback,
chat response text) as the single configurable source.

#### D-05

Court Marriage removed from `ALL_SERVICE_IDS` (it was never on Home). Backend,
admin handling, existing cases and `/court-marriage` deep links remain.

### P0-6 — cancellations and refunds (D-50..D-55)

#### New decisions (for docs/DECISIONS.md)

**D-50. Cancellation stages are lifecycle statuses, the same for every service.**
`draft`/`submitted`/`payment_pending` → cancel, nothing to refund. `paid`/`assigning`/
`assigned`/`advocate_declined` → client self-serve, immediate, full refund (no
advocate has accepted). `advocate_accepted`/`in_progress`/`client_review`/
`changes_requested`/`approved` (including FIR, report and consultation sub-states)
→ client request to the admin queue. `dispatching`/`dispatched`/`completed` → no
cancellation, Contact Support. One open request per case (database-enforced).

**D-51. Refunds are rows, not payment-status changes.** A refund row records the
amount against a captured client payment (oldest payment first when a case has
several, e.g. consultation then quote). `payments.status` stays `captured`, so
receipts and price snapshots stay readable. Courier payments made by advocates are
never refunded through this flow.

**D-52. Case outcome by refund size.** Full refund of everything still refundable →
`cancelled` then `refunded` (two `case_events`, the second `source=simulated`).
Partial or zero refund → stays `cancelled`; the partial refund is visible on the
case. Declining a request leaves the case where it was and tells the client why.

**D-53. The advocate learns the case ended, not why.** The advocate gets an in-app
"A case assigned to you was cancelled" notification. Reasons, notes and refund
amounts are client/admin-only: `GET /cases/:id/cancellation` returns 404 to every
advocate, including the assigned one. The case leaves the advocate's active work
because its status is closed; `advocate_id` is kept for history (D-14).

**D-54. Legacy `POST /cases/:id/cancel` for clients now follows D-50.** Previously a
client could cancel `assigning`/`assigned` (paid) cases without any refund record.
Client calls are routed through the refund-aware service; admin calls keep the
existing transition.

**D-55. Advocate entitlement on partial refunds** is recorded only if the admin
enters one (stored on the request; the API accepts it, the admin form omits it for
now — none is the default per D-14).

#### §9.1 register — simulated capabilities

| Capability | Flag | Standing in because | Clears when |
|---|---|---|---|
| Refunds | follows `PAYMENTS_MODE=simulated` | No Razorpay keys; payments themselves are simulated | Razorpay integration: each refund row becomes a Razorpay refund against the original payment |

Every refund row has `simulated=true`; the `refund_recorded` event has `source=simulated`.
Admin panel shows "Simulated refunds — no money moved"; client screen shows "Demo
payment: this refund is recorded but no real money moved."

#### §9.2 — built without a design / substitutions

- **Admin Cancellations & refunds queue** (`/cancellations`, D-12/D-13/D-42) — built
  without a design from the panel's table, counters, stall banner and detail panel.
  Oldest-first with live waiting time; Review → decision with refund amount and the
  reason shown to the client; confirmation stating the outcome cannot be undone.
- **Admin case detail "Cancellation & refunds" panel** — built without a design.
- **Client Cancel Request** reuses design 349 for every service at `/cases/cancel?caseId=`.
  Changes from 349: case-type/court/parties cells shown only where the case holds them
  (service, speed, status); "Verified Advocate" badge omitted (D-01/D-02); "No penalty
  or fees apply for cancelling at the review stage" replaced by the API's stage-specific
  message (full refund / Legalitt decides / not cancellable); added the request-pending,
  declined, approved and cancelled states, and a demo-refund line. The checkbox
  wording changes to "…sends a cancellation request" when admin review applies.
- Entry points added: "Cancel request" on the report-service and consultation client
  tracking screens. Request Details (builder D) links to the same route.

### P0-4/P0-5 — messages and support (D-56..D-61)

Branch `p0-messages`. For the integrator to merge into `docs/DECISIONS.md` and
the architecture document.

#### New decisions

- **D-56. One Messages inbox, conversations are case threads plus support requests.**
  Each case with an assigned advocate is one conversation (the existing
  `client_advocate` thread, created on first open). Each support request
  (contact form, callback, support chat) is its own conversation under the
  Support filter, titled "Legalitt Support" with the request subject. Search
  runs on the server and matches the counterpart's name, case reference,
  matter title/type and the text of every message (not only the preview).
  Advocates see the same inbox for cases assigned to them (filter "Clients");
  admins use the panel's Support inbox instead.
- **D-57. Contact Support subject list.** profile-21 draws only "Select an
  issue". Options: Payment or refund question; Question about my case
  progress; Documents or uploads; My advocate; Account or sign-in; Something
  isn’t working in the app; Something else. A linked case must be one the
  requester can already see (404 otherwise).
- **D-58. Support attachments are "Not available yet".** Documents are stored
  per case (`documents.case_id`, case-membership access rules); a support
  attachment would need a separate owner-scoped storage and admin-only read
  path. The drawn upload box is shown disabled with an honest explanation.
- **D-59. Callback requests de-duplicate while open.** A second callback
  request while one is open returns the existing request. Support chat keeps
  one open thread per person; a closed chat starts a new one.
- **D-60. Admin closing a request is final for that request.** The requester
  sees "This request is closed" with a link to start a new chat; the close is
  recorded in `admin_actions` (`close_support_request`), with a confirmation
  step in the panel.
- **D-61. Support inbox ordering.** Unanswered requests first, oldest
  unanswered message first (`waiting_since` = oldest requester message after
  the last support reply); answered/open requests follow, oldest first.
  The list refreshes every 30 s.

D-03 copy: support response promises live in
`apps/mobile/copy/supportContact.ts` (`supportContactCopy`):
"typically responds within 2 business hours" (profile-21, current) and
"contact you in 24 hours" (design 36). If builder A added a `supportHours`
constant, fold these into it.

#### §9.2 — built without a design

| Screen | Decision | Notes |
|---|---|---|
| Admin **Support inbox** list and request detail (`/support`, `/support/:id`) | D-42, D-61 | Existing dark/orange counters, table, detail panels; waiting age reuses FIR `WaitingAge` |
| Support conversation screen (`/messages/support?ticketId=`) and Support Chat (`/support-chat`) | D-26, D-56 | Same bubble layout as messages-2; design 35's scripted transcript not used |
| Contact Support / Callback submitted states | D-26 | profile-21's "Submitted State" toggle shows only a state name; built as a confirmation card with "View in Messages" |

#### §9.2 — substitutions (D-01)

| Design | Drawn | Replacement |
|---|---|---|
| 142, messages-1 | "End-to-end encrypted lawyer-client privileged chat" | "Messages are private to you, your advocate and Legalitt support." |
| 143, messages-2 | Online dot, "Online · Indore", "is typing…" | Omitted |
| messages-1/2 | "Verified" badge on every advocate | Shown only when the advocate's verification is `approved` (D-02) |
| profile-21 | Upload document box | Disabled, "Not available yet" (D-58) |
| 35 | Scripted support transcript | Real messages only |

#### Schema (architecture §4 needs these two tables)

`apps/api/tests/foundations.cjs` asserts that every `CREATE TABLE` in the
migrations also appears in the architecture document and that the total is 37.
It fails until the integrator adds the SQL below to §4.3 and raises the count
(39 with these two tables, plus any other builders' tables):

```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id),
  kind TEXT NOT NULL,            -- ticket | callback | chat
  status TEXT NOT NULL,          -- open | closed
  subject TEXT, related_to TEXT, description TEXT, contact_method TEXT,
  contact_name TEXT, contact_phone TEXT, case_id UUID REFERENCES cases(id),
  created_at TIMESTAMPTZ NOT NULL, updated_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ, closed_by UUID REFERENCES users(id)
);
CREATE TABLE support_messages (
  id UUID PRIMARY KEY, ticket_id UUID NOT NULL REFERENCES support_tickets(id),
  sender_id UUID NOT NULL REFERENCES users(id), sender_role TEXT NOT NULL,
  body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL, read_at TIMESTAMPTZ
);
```

#### Routes

Mobile: `(tabs)/messages` (API inbox), `messages/thread?caseId=`,
`messages/support?ticketId=`, `support`, `callback`, `support-chat`.
`messages/[id]` stays gated (fixture design route). `help` untouched.
`scripts/mobile-smoke.mjs` route count raised 329 → 331.

Admin: `/support`, `/support/:id`, nav "Support inbox".

API: `GET /messages/inbox?q=`, `POST/GET /support/tickets`,
`GET /support/tickets/:id`, `POST /support/tickets/:id/messages`,
`POST /support/tickets/:id/read`, `POST /support/callbacks`,
`GET/POST /support/chat`, `GET /admin/support?status=`,
`GET /admin/support/:id`, `POST /admin/support/:id/messages`,
`POST /admin/support/:id/close`. `GET /threads/:id/messages` now includes
attachment metadata (`document`) for document cards.

### P0-3 part B — account settings (D-68..D-75)

Branch `p0-account-b`. Covers D-20, D-21, D-22, D-23, D-24, D-25, D-27, D-29, D-30.

#### New decisions (D-68 – D-75)

- **D-68. "Sign Out of All Devices" signs out this device too.** Cognito's global
  sign-out revokes every refresh and access token for the user, including the
  current one; it can't spare one device without device tracking (D-21 already
  omits per-device sign-out). The row reads "Sign out everywhere, including this
  device", the confirmation says so, and the app returns to sign-in afterwards.
  Design 15's "except this phone" wording is not used because it would be false.
- **D-69. Seeded demo accounts can't change their password in the app.** Any
  account on `@legalitt.invalid` shows "Demo account — managed by Legalitt" and the
  API refuses with 409. The demo password is a shared credential in Secrets Manager
  (AGENTS.md: never change it on its own); letting a demo viewer change it would lock
  everyone else out.
- **D-70. Notification preferences quiet, they never hide.** Turning off an in-app
  category (Case updates, Consultations, Payments) still files every notification in
  the inbox, but it arrives already read, so it raises no unread badge. Nothing a
  client needs is lost. Category rule is one shared function
  (`notificationCategory`) used by the inbox filters and the adapter.
- **D-71. Active Sessions shows sign-in method and time; device only when recorded.**
  `auth_events` doesn't capture the user agent for current sign-in paths, so the
  device label appears only on rows that recorded one ("Web browser", "Android
  device", "iPhone or iPad"); otherwise the row says "Signed in with password / one-
  time code". Recording the user agent at sign-in is a small follow-up in AuthService.
- **D-72. Change Password: no in-app reset.** The design's "Forgot your password?
  Reset Password" link has no built reset flow; the screen says reset isn't available
  in the app yet and points to Legalitt Support.
- **D-73. Download My Data is a JSON file** of the caller's own profile (no Cognito
  identifiers), preferences, cases they own, their payments, messages in their case
  threads and saved advocates. On web it downloads; on native it opens the share sheet.
- **D-74. Deletion requests deactivate immediately and are idempotent per user.** One
  pending request per user (partial unique index). `users.status='deactivated'` makes
  every authenticated request fail at `AuthService.identity`. Blocked while a case is
  in any paid, uncompleted state (paid → dispatched, including advocate_declined).
  Retention after deletion stays an open client question (§12 Q5).
- **D-75. Saved Advocates shows only active, approved advocates**, labelled "Approved
  by Legalitt" (a fact from `advocate_profiles.verification`), with availability from
  their published weekly hours ("Hours today" / weekday list / "No hours published"),
  and the consultation total computed from the confirmed Legal Advice tariff (₹885).
  "Book Consultation" preselects the advocate in the Legal Advice booking step; it's
  disabled, with the reason, if the advocate has no published hours. No ratings,
  presence dots or "Available Today/Tomorrow" claims (D-02). The heart appears on each
  advocate in the Legal Advice booking list (advocate profile pages remain gated
  outside case context).

#### §9.2 entries

- **Privacy & Security hub (profile-13)** — built as drawn minus the "2FA Active"
  badge and "Verification enabled" line (D-01, D-21).
- **Login & Security (profile-15)** — Two-Step Verification and Login Alerts omitted;
  Google shows "Not available yet"; mobile number masked; Sign Out of All Devices
  wording per D-68.
- **Active Sessions (profile-16)** — location and per-device sign-out omitted (D-21,
  D-71).
- **Privacy Settings (profile-17)** — drawn toggles replaced by a who-sees-what summary
  (D-23). Built from existing card/row components.
- **Privacy Policy** — built without a design: placeholder "Being finalised" with
  Contact Support (D-43).
- **Data & Documents (profile-18)** — "protected under Legalitt client privacy" footer
  omitted (D-01); "Delete Uploaded Documents" row replaced by My Documents (builder D's
  delete rules apply there).
- **Delete Account (profile-19)** — request flow, blockers listed with links to each
  case, irreversible-action confirmation (D-24, D-74).
- **Notification Preferences** — built without a design from existing rows/switches
  (D-20, D-70); SMS and WhatsApp "Not available yet".
- **Language (profile-12)** — other languages disabled "Coming soon" (D-22).
- **Help Center (profile-20)** — answers rewritten from built behaviour (D-25); the
  "Confidential Legal Assistance" footer omitted (D-01). Support hours in one constant
  `SUPPORT_HOURS` in `apps/mobile/features/account/faq.ts` (D-03).
- **Saved Advocates (profile-6)** — D-75.
- **Home search (11/12)** — live filtering of services; carousel stays omitted (D-30).

#### §9.1 register

Nothing new is simulated. Password change and global sign-out are real Cognito calls.

#### Notes for the integrator

- The Profile hub (builder D) hides the Language row in API mode
  (`shownPreferences`). Language is now live at `/language`; the hub should show it.
- `scripts/mobile-smoke.mjs` route count changed 329 → 337 for this branch's eight new
  routes; recompute after merging all branches.
- New routes: `/account/password`, `/account/security`, `/account/sessions`,
  `/account/privacy-settings`, `/account/data`, `/account/delete`,
  `/notification-preferences`, `/privacy-policy`. Ungated: `/privacy`, `/language`,
  `/help`, `/advocates`.

#### Required architecture-doc addition (makes `tests/foundations.cjs` pass)

`foundations.cjs` asserts every `CREATE TABLE` in the migrations also appears in
`docs/LEGALITT-BACKEND-ARCHITECTURE.md` (table count now 40 on this branch). Add to §4.3:

```sql
-- ---------- account settings (D-20, D-22, D-24, D-27) ----------
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  language TEXT NOT NULL DEFAULT 'en',          -- D-22: stored for when translations exist
  notifications JSONB NOT NULL DEFAULT '{}',    -- D-20/D-70: quieted in-app categories
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE saved_advocates (
  user_id UUID NOT NULL REFERENCES users(id),
  advocate_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, advocate_id)
);
CREATE TABLE account_deletion_requests (      -- D-24/D-74: completed by an admin
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

If other branches add tables, the count in `foundations.cjs` must be the merged total.

### P0-3 part A — profile, requests, documents, payments (D-62..D-67)

Branch `p0-account-a`. To be merged into `docs/DECISIONS.md` and architecture §9.1/§9.2 by the integrator.

#### New decisions

- **D-62. Profile fields live in `client_profiles`** (date of birth, gender, city, state, country), keyed by user. Email and mobile stay on `users` and are **read-only** on Edit Profile: they are bound to the Cognito sign-in, and changing them needs a verification flow that isn't built. "Verified" appears only from the stored verified flags. Preferred language shows **English** and links to the Language screen (D-22) — no second language store is created here.
- **D-63. Edit Profile omits photo upload.** The drawn "Change Profile Photo" camera is replaced by "Profile photos are not available yet" (no image storage for avatars exists). Consultation preferences show Chat selected and available; Voice and Video show "Not available yet" and are not selectable (D-09).
- **D-64. My Requests groups every case the client has**, newest first: **Pending** = no advocate has accepted yet (draft, submitted, payment pending, paid, assigning, assigned, advocate declined); **Accepted** = an advocate accepted and the work is under way; **Completed** = completed. Cancelled and refunded cases appear under **All** only, labelled as such. "Forum / location" is shown only where the service records one (court, or the jurisdiction district/state the client entered); otherwise the row is omitted.
- **D-65. Request Details timeline** is the case's real lifecycle moves from `case_events` (no projected/future steps, no invented "evaluating docket files" copy). The advocate card shows only stored facts (D-02): name, "Verified by Legalitt" only when `advocate_profiles.verification = approved`, experience, practice areas and city when present. "Cancel Request" opens builder B's `/cases/cancel?caseId=` and is hidden once the case is completed, cancelled or refunded; a completed case points to Contact Support. The drawn "notified via push & SMS" line reads "You'll be notified in the app when your request is updated." (D-01).
- **D-66. Document categories are by origin** — Uploaded by you / From your advocate / From Legalitt (admin or system-generated). Visibility uses each service's existing case-read rule, so unreleased FIR drafts, report-service files and advocate drafts never appear. A client may remove only their own upload on a case that is still a draft or awaiting payment; otherwise "Remove" explains why (submitted request → contact support; shared file → only the person who added it). The server's existing delete guards still apply.
- **D-67. Payment receipt PDF** (D-19) is generated on request from the captured payment and its price snapshot: receipt number, date, payer, service, request reference, gateway reference, line items, total. It states "This is a payment receipt, not a tax invoice" and, for simulated payments, "Demo payment (simulated) — no money moved". Receipts exist only for captured payments. Payments lists only payments the client made on their own cases (advocate courier payments are not shown).

#### §9.2 — design substitutions / built without a design

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

#### §9.1 register

No new simulated capability. Receipts of simulated payments say so on their face.

#### Routes and API

- API: `GET/PATCH /api/v1/account/profile`, `GET /api/v1/account/documents[?case_id=]`, `GET /api/v1/account/payments`, `GET /api/v1/account/payments/:id`, `GET /api/v1/account/payments/:id/receipt` — client role only (advocate/admin 403); another client's ids return 404. Test: `apps/api/tests/account.cjs`.
- Mobile: `/(tabs)/profile` (real active count), `/profile/edit`, `/requests`, `/requests/[id]`, `/documents`, `/documents/case?caseId=`, `/documents/[id]`, `/payments`, `/payments/[id]`.
- Migration: `202611110030_profile_fields` (new table only).

#### Integrator action — architecture §4 table list

`apps/api/tests/foundations.cjs` requires every migrated table to appear as a
`CREATE TABLE` in the architecture document. This branch raises the count to 38;
add this to §4.3 (it is the only missing table, so the test passes once added):

```sql
-- D-15: Edit Profile fields; email and mobile stay on users (Cognito-bound).
CREATE TABLE client_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id),
  date_of_birth DATE,
  gender        TEXT,          -- female | male | other | prefer_not_to_say
  city          TEXT,
  state         TEXT,
  country       TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### P1-3 — advocate completion view, deletion queue, follow-up booking (D-88..D-92)

Branch `p1-complete`. No migration (`account_deletion_requests.status` is free text; new values below).

#### New decisions

- **D-88. One completion view for every service.** `GET /advocate/cases/:id/completion`
  (assigned advocate or admin; clients 403, other advocates 404) returns the
  completion date, Legal Notice delivery facts (delivered at, received by,
  courier/waybill), the final documents (final notice and POD; approved FIR
  draft; released report files; approved consultation brief) and the advocate's
  entitlement = sum of `advocate_entitlement_paise` over the client's captured
  payments' price snapshots. If a captured payment has no snapshot the sum is
  flagged incomplete; with none recorded the card says so. Wording is
  service-specific ("Delivered — case complete" only for Legal Notice; "Draft
  approved and released", "Report released", "Brief approved — consultation
  complete"). It never says a payout has been released: "Legalitt pays advocates
  manually; this is not a payout confirmation." A cancelled or refunded case
  shows only "Cancelled — no further work" and the reference — never the
  client's reason, the refund amount or an entitlement (D-53). Advocate Legal
  Notice cases in `cancelled`/`refunded` now open this read-only view (they
  previously had no destination).
- **D-89. Completing a deletion request does not erase data.** Admin "Complete"
  sets the request to `completed_pending_purge` and keeps the account
  deactivated; no rows, documents or Cognito user are deleted, because the
  retention period is an open question (DECISIONS §12). The panel says the
  personal-data purge runs once the retention period is confirmed. The purge
  itself is a later, separately approved step. Completion is refused while the
  person has a paid case in progress.
- **D-90. Admin may reactivate instead.** "Reactivate" closes the request as
  `declined`, restores `users.status='active'` and sends the person an in-app
  notification with the admin's note.
- **D-91. Follow-up booking reuses the saved-advocate handoff.** A completed
  Legal Advice case shows "Book Follow-up Consultation" (design 116), which
  preselects that advocate in the normal Legal Advice booking (new case, normal
  price and payment). No discounted follow-up price is invented.
- **D-92. Deletion requests have a "reviewed" step.** Statuses:
  `pending` → `reviewed` (optional; stays in the open queue, oldest first) →
  `completed_pending_purge` or `declined`. Every action needs a note and a
  confirmation and is recorded in `admin_actions`
  (`review_account_deletion` / `complete_account_deletion` /
  `reactivate_account`, payload `from_status`, `to_status`, `erased:false`).
  The client's duplicate-request check treats `reviewed` as still open.

#### §9.1 — nothing simulated

No new simulator. The personal-data purge is not simulated either: it is not
built, and the panel says so.

#### §9.2 — built without a design

| Screen | Decision | Notes |
|---|---|---|
| Advocate completion / cancelled card (Legal Notice `advocate/notice/[id]/report` in API mode; FIR, report-service and consultation advocate screens when completed, cancelled or refunded) | D-07, D-88, D-53 | Existing advocate card/button styles. In API mode the Legal Notice route no longer reuses design 203 (another service's payout confirmation) |
| Admin **Account deletions** queue (`/account-deletions`) | D-24, D-42, D-89, D-90, D-92 | Existing counters, table, stall banner, detail panel and confirm block, as the Cancellations queue |
| "Book Follow-up Consultation" button (design 116 label) on completed Legal Advice tracking | D-10, D-91 | Existing consultation button style. Design 116 draws the follow-up with payment on the same screen and a ₹100 written-advice offer; neither is built — the button preselects the same advocate in the normal booking and payment flow |

#### Routes

API: `GET /api/v1/advocate/cases/:id/completion`, `GET /api/v1/admin/account-deletions?status=open|decided`,
`POST /api/v1/admin/account-deletions/:id/decide` `{decision: review|complete|reactivate, note}`.
Admin: `/account-deletions` (nav "Account deletions"). Mobile: no new routes.

### P1-1 — advocate verification and approvals (D-76..D-79)

#### New decisions

- **D-76. One submission row per advocate; status stays on the profile.**
  `advocate_verifications` holds what the advocate entered (`details`, as
  entered, Bar Council number unaltered) plus the last decision and reason.
  `advocate_profiles.verification` remains the single status
  (`not_started → in_review → approved | needs_update | rejected`). Editing and
  uploads are allowed only in `not_started`, `needs_update` and `rejected`;
  `in_review` and `approved` are frozen (changing verified details goes through
  Support).
- **D-77. Verification documents are owner-scoped, not case documents.** Stored
  as `documents` rows with `case_id = NULL`, kinds `verification_identity`,
  `verification_enrolment`, `verification_practice`, S3 keys under
  `advocates/<user>/<doc>/`. The generic `/documents/*` endpoints join through
  `cases`, so they can never serve these files; only the verification endpoints
  do — to the owning advocate, and to admins. Identity filenames are replaced
  with generated names so an ID number in a filename is never stored; no content
  is extracted (§6d). The newest upload of each kind is the one reviewed.
- **D-78. Approval publishes the verified facts.** On approval the submitted
  Bar Council state/number/year, practice areas, city/state, years of practice,
  education, courts, languages and bio are copied to `advocate_profiles`, which
  every other screen already reads (D-02). Assignment and consultation booking
  already require `verification = 'approved'`; unchanged and covered by a test.
- **D-79. Decisions need a reason except approval.** "Request update" and
  "Reject" require a reason, shown to the advocate on the verification hub
  (243). Each decision has a confirmation step, writes `admin_actions`
  (`advocate_verification_<decision>`) and an in-app notification. Rejected
  advocates may correct and resubmit (no permanent ban is invented).

#### §9.2 — built without a design

| Screen | Decision | Notes |
|---|---|---|
| Admin **Advocate approvals** list and detail (`/advocate-approvals`, `/advocate-approvals/:id`) | D-42, D-79 | Existing dark/orange counters, table, detail panels; waiting age reuses FIR `WaitingAge` |
| Advocate dashboard verification banner | D-35 | Existing card style; links to the verification hub; hidden once approved |
| Verification steps 234–239 in API mode | D-35, D-76 | One API-backed flow in the account-area cream/brown components; drawn sample values not used; the drawn 241 "incomplete" screen is the same hub as 233 |

#### §9.2 — substitutions (D-01)

| Design | Drawn | Replacement |
|---|---|---|
| 238/239 | "BCI Compliance & Data Privacy: Information submitted is encrypted and strictly maintained…" | "Who sees this: Your details and documents are visible only to you and Legalitt’s review team." |
| 241 | "All uploaded documentation remains encrypted." | "Uploaded documents stay saved with your draft." |
| 236 | Drawn signature pad / e-sign hints | Not used; no signing is claimed |

#### Schema

`advocate_verifications` (migration `202611110050_advocate_verification`),
DDL added to architecture §4.3a; `foundations.cjs` count 45 → 46.

#### Routes

Mobile (API mode): `/advocate/verify/{intro,personal,professional,bar-council,practice,documents,review,submitted,incomplete,needs-update,complete}` all render the one flow; ungated.
Admin: `/advocate-approvals`, `/advocate-approvals/:id`, nav "Advocate approvals".
API: `GET/PATCH /advocate/verification`, `POST /advocate/verification/submit`,
`POST /advocate/verification/documents/presign`, `POST /advocate/verification/documents/:id/complete`,
`DELETE /advocate/verification/documents/:id`, `GET /advocate/verification/documents/:id/url`,
`GET /admin/advocate-approvals?status=waiting|decided`, `GET /admin/advocate-approvals/:id`,
`GET /admin/advocate-approvals/documents/:id/url`, `POST /admin/advocate-approvals/:id/decide`.

### P1-2 — advocate wallet and manual payouts (D-82..D-87)

Branch `p1-wallet`. Migration `202611110060_advocate_payouts`. For the integrator
to merge into `docs/DECISIONS.md` §13 and the architecture document.

#### New decisions

- **D-82. Entitlements are read live from captured price snapshots.** The wallet
  sums `advocate_entitlement_paise` from each captured payment's quote snapshot
  (`case_price_quotes.snapshot.breakdown`) — the `service_fee` payment for every
  service, plus the `representation` payment for a consultation's court quote —
  for cases in `completed` whose `advocate_id` is the signed-in advocate (the
  completing advocate; a replaced advocate gets nothing, per the 10 Nov
  payout-on-reassignment decision). Refunded and cancelled cases carry no
  entitlement, except where an admin cancellation decision set
  `advocate_entitlement_paise` (D-14/D-55). Payments whose snapshot has no
  recorded entitlement (legacy) are left out, not shown as zero (§2.5a). The
  existing `payouts` table (one row per case and payment, shaped for Razorpay
  Route transfers) is not used for manual withdrawals.
- **D-83. A withdrawal is a request for an amount, not an allocation of cases.**
  New `payout_requests` table. Ready to withdraw = lifetime entitlements −
  requested − paid. Minimum ₹1,000 (design 359). One advocate's requests are
  serialised with an advisory lock so two taps cannot spend the same balance. A
  request can't be withdrawn once sent (the admin pays it).
- **D-84. The bank account is stored in full, shown masked.** `advocate_bank_accounts`
  keeps the full account number because Legalitt pays manually and the admin
  needs it; every advocate-facing response returns only the last four digits.
  `verified` is always false (no penny-drop): advocate screens say "Unverified",
  the admin queue says so beside the account. Each payout request snapshots the
  bank details it was requested against. A bank account is required before a
  withdrawal can be requested.
- **D-85. Recording a payout is an admin statement of an outside transfer.** The
  admin enters the bank UTR (6–30 letters/digits) and payment date after a
  confirmation step; recorded in `admin_actions` (`record_payout_paid`,
  `money_moved_in_app: false`). Re-recording with the same UTR is idempotent; a
  different UTR is refused. The advocate is notified in-app and sees the status
  and UTR on design 361.
- **D-86. Wallet fee display uses the confirmed structure (D-37), never the drawn
  10% example.** Per case: client paid, platform fee (25% of base), GST on both,
  and the advocate's share (= base), all read from the snapshot. Period views
  This Month / Last Month / This Year use IST calendar boundaries on the
  completion (or cancellation-decision) date.
- **D-87. Payout copy follows D-01.** The withdraw and status screens say "Paid to
  your bank account by Legalitt. You'll see the UTR here once sent." No claim of
  escrow, instant settlement, clearing networks or verified accounts.

#### §9.1 — register

| Capability | Flag | Standing in because | Clears when |
|---|---|---|---|
| Advocate payouts (D-36, D-85) | No flag — manual by design | Razorpay Route not configured. Payouts are manual: Legalitt pays the advocate by bank transfer outside the app and an admin records it with the UTR. No money moves through the app | Route linked accounts and transfers are integrated |
| Bank account verification (D-36, D-84) | No flag | No penny-drop provider; accounts are stored as entered and marked "Unverified" | A verification provider is integrated |

#### §9.2 — built without a design / substitutions

| Screen | Decision | Notes |
|---|---|---|
| Admin **Payouts** queue (`/payouts`) | D-42, D-85 | Existing counters/table/detail-panel style; oldest first; waiting age reuses `WaitingAge` |
| Wallet 356–358 | D-37, D-86 | Drawn "₹3,500 gross / ₹350 fee (10%)" replaced by our structure per case: client paid, platform fee (25% of base), GST, your share. Period tabs This Month / Last Month / This Year from real completion dates. Drawn TDS, settlement window and recent-transfer figures omitted unless a real transfer exists |
| Withdraw 359 | D-01, D-87 | "RBI-compliant clearing network… zero custody" replaced by "Paid to your bank account by Legalitt. You'll see the UTR here once sent." The drawn header "Edit Clause" is replaced by "Withdraw Money" |
| UTR details 361 | D-85 | Shows only the real amount, account, dates and UTR; drawn download receipt / advocate desk actions omitted |
| Bank account 257–260, 360 | D-36, D-84 | One real form (holder, bank, IFSC, account number twice, type); drawn "Matched"/verified states and OTP verification replaced by "Unverified" |
| Payout settings 256 | D-36 | Payout account and an accurate description of manual payouts; schedules shown as not available |

## 14. FIR Draft rebuild — 12 November 2026 (D-100 onward)

The flow (`docs/flows/FIR-DRAFT-FLOW.md`) settles every [DECIDE] item with its own
proposal, and section 5 items 3–13 use their defaults. These are the builder's
decisions on points the flow leaves open. Numbering starts at D-100 to stay clear of
earlier ranges.

**D-100. Police stations: Indore and Bhopal seeded, free text everywhere.** The list
in `packages/shared/src/fir-police-stations.ts` uses commonly published station names;
it has not been checked against MP Police's official list (§9.1). "Type police station
name" is always offered.

**D-101. Identity Proof keeps only the last four digits.** The client types them at
upload; they are stored in `documents.identity_last4` and shown as XXXX-XXXX-1234
everywhere. A full number is still refused, and no number is read from the file.

**D-102. FIR requests are numbered FIR-YYYY-NNNN** (flow §4). The sequence continues,
so earlier FIR_DRAFT-… references stay valid and unique. Draft PDFs are named
`FIR_Draft_<ID>_v<N>.pdf`.

**D-103. Primary Documents is enforced on the server.** Submission needs at least one
uploaded Primary Document and an accepted identity document. Each upload slot also
enforces its drawn file types and count (Scene Photos & Video: JPEG/PNG/MP4, five files,
50 MB each; Ancillary: adds MP3). Video and audio are accepted only in those FIR slots.

**D-104. Admin approval sends the draft to the client; completion follows the client.**
Approve → `client_review`. The client approves (→ `approved` / awaiting police
submission when the advocate submits, else `completed`) or requests changes
(→ `changes_requested` / `client_changes_requested`), which goes back to the advocate
and then to the admin again. The advocate's share is reported, and credited to the
wallet, only when the case completes.

**D-105. An advocate's rejection returns the case to admin with no advocate.** The
reason is required and is visible to admins only; the next advocate never sees why the
previous one left. FIR declines recorded before this change can also be reassigned.

**D-106. Remind Client is in-app only, once every 24 hours** (flow A6), and is logged.

**D-107. Settings change through PATCH.** The API's cross-origin policy allows GET,
POST, PATCH and DELETE; `PATCH /fir/settings` is admin-only and logged.

**D-108. Step 1's City list is the LGD district list.** There is no city list; district
names (with their state) stand in, plus "Use '<typed>'". Choosing a listed city fills
State and District when both are empty.

**D-109. A1 cards show ORDINARY when the case has no tier.** FIR Draft has one service
level, so an untiered request is the ordinary one (design 214's tag). The advocate's
fee and latest note come with the list response (`fir_card`), advocates only.

**D-110. The advocate can edit the filed values in proforma sections 1–3** (flow A5:
"all editable"). Edits are stored as overrides beside the client's filing, which stays
untouched and hash-protected; the PDF prints the override. FIR Number and Report
Received stay blank for the police, and the identity document stays masked.

**D-111. Send for Review checks the flow's required fields only:** complainant name,
police station, a valid incident date and time, place, at least one complete legal
section, the statement, the identity document, and the personal details the client had
to give. Distance, vehicle, motive and witness details are optional and print only when
filled. The Statement of Facts is seeded letter-style around the client's own words.

**D-112. Auto-save updates the advocate's own unsent version in place** about 30
seconds after the last edit; Save Draft creates a new version. A send is refused if an
auto-save changed the draft after its PDF was rendered.

**D-113. "Client viewed the draft" is recorded once per version** when the client opens
the PDF during review. It appears in the advocate's and admin's audit logs only.

**D-114. The client's mobile and email are masked for the assigned advocate until they
accept** (owner, 12 Nov 2026). A2 shows "+91 90••••••00" and "de••••@domain"; every API
response the advocate receives before acceptance masks them, the drafting context is
refused and earlier draft PDFs (which print them) are withheld. Admin always sees them.

## 15. Hotfix from Ishaan sir's answers — 12 November 2026 (`docs/flows/ISHAAN-ANSWERS-2026-11-12.md` §A)

**D-115. FIR has no police-submission step** (Q119, Q120). The advocate's job ends at
preparing and delivering the draft. The FIR completes when the client approves, and
the advocate is credited then. "Mark as submitted to police", its receipt upload and
the admin switch are removed (D-101's setting and the C14 "advocate submits" variant
are retired). F9 always says "Download your approved draft · Submit it at <police
station>", with no "within 24 hours". Cases that were waiting for a police receipt are
completed by migration, with an event recording why. The dormant tables stay.

**D-116. FIR collects no identity document** (Q114, supersedes D-101 and flow C6's slot
5). Step 4 has no Identity Proof slot, the API refuses new FIR identity uploads and never
requires one, and the proforma/PDF have no "Official ID Document" row. Old stored files
stay stored but are not shown to client or advocate.

**D-117. Court Marriage is not offered** (Q79, Q113). Hidden from clients, advocate
filters, the admin sidebar and lists, and pricing, through one shared switch; the API
refuses new Court Marriage cases. Code and data are kept dormant.

**D-118. Every payment-success screen has Start Tracking and Home** (Q3); nothing moves
on by itself.

## 16. Court representation overnight run — 14 November 2026

These decisions implement the owner's overnight instructions and await client
confirmation where explicitly marked. They supersede the earlier court
consultation/quote proposal for **new representation requests only**.

- **Deposit assumption:** ₹2,000 is an advance against the final tax-inclusive
  total, deducted once from the balance. It is not an extra fee. The completed
  payment breakdown records the full tariff, tax and the advance deduction.
- **Unassigned closure assumption:** if no advocate can be assigned, admin may
  refund the deposit, with a recorded reason. No automatic refund is invented.
- **Court price interpretation:** the pairs mean Ordinary/Urgent, as directed:
  DC ₹25,000/₹35,000 and HC ₹24,999/₹34,999 advocate base. Their first-action
  windows are 5–7/2–3 working days. These are not promised court listing dates.
- **Hearing pay assumption:** new representation cases earn only the admin-
  classified hearing amounts; completion creates no lump-sum entitlement. Each
  hearing snapshots its actual assigned advocate and the applicable rate version.
  Previously earned hearing credits remain attached to that advocate after a
  reassignment. Unset rates block credit rather than becoming zero.
- **Compatibility:** old court consultation cases, bookings, quotes, prices and
  files retain their old engine. An explicit representation workflow record
  distinguishes new cases; no real existing case is converted or reset.
- **Change fees:** ₹2,000 is the total non-refundable processing charge shown
  before checkout, including on rejection. It is outside hearing compensation.
  Tax treatment of this fixed charge awaits confirmation; do not invent GST.
- **Pickup:** ₹249 is the quoted flat total, booked and tracked manually by admin.
  No courier provider or automatic physical-custody verification is claimed.
- **Reviews:** the third submitted pre-filing round is the normal limit; a fourth
  needs an explicit admin unlock. Approving the third remains possible.
- **Identity:** use the flow's masked Aadhaar, passport or voter ID upload choices;
  no number is extracted. An upload is not identity verification. NOC may follow
  later on a pending case; after a paid replacement is approved, arrange handover
  before switching the assignment so former advocates do not retain case access.
- **Privacy:** all court endpoints retain the current owner/current-assignee/admin
  scope. Internal notes are advocate-private. Calling is hidden; chat is available
  after advocate acceptance, until completion plus seven days unless admin reopens.
- **Working days assumption:** Monday–Saturday, excluding Sunday; no official
  court holiday calendar is asserted. Admin can version the working-day policy for new requests.

Implementation, verification and deployment status are tracked in
`flows/COURT-GAPS.md` and `../reports/court-20261114/README.md`; this decision entry
does not claim that the new workflow has shipped.

Additional implementation assumptions awaiting confirmation:

- Pending cases use the same saved intake and deposit-paid verification queue as
  new cases, with their existing case number, court, status and prior-advocate NOC.
  They retain a DC-/HC- reference rather than creating a second, disconnected
  verification case. This reconciles the older separate verification screens with
  the confirmed submission-payment timing.
- Court feedback is recorded once on the completed case. It is not silently added
  to a public advocate rating aggregate without a confirmed moderation policy.
- Terms and Privacy links open the existing style of legal-policy placeholder.
  Final client-supplied legal copy is still outstanding; no legal terms are invented.
- Payment uses the existing explicitly labelled test adapter. It does not draw a
  payable QR, claim a bank transfer, or automatically navigate after a timer.
- Additional hearing dates are entered through the same full hearing form, so
  time, room and bench are saved together rather than accepting a date-only
  promise in the client update. Hearing details are always notified in-app.
