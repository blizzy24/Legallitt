# District Court and High Court Representation: complete flow

> **Read `ISHAAN-ANSWERS-2026-11-12.md` first. It overrides this file where they differ.**

> Court cases: chat closes 7 days after completion (not 'whole case'). The advocate marks completion and the admin confirms. Cancellation after acceptance goes to the admin.


**Sources:** Figma `District-Court-Representaion-Client-Side` (51 screens), `District-Court-Representation-Advocate-Side` (34), `High-Court-Representation-Client-Side` (49), `High-Court-Representation-Advocate-Side` (34).
The two services **share one flow**. High Court differences are in section 5. Many screens are literally the same file in both folders.
Tags: **[DESIGN]** · **[DECIDE]** (proposal; questions in `QUESTIONS-ALL-SERVICES.md`) · **[REMOVE]** (D-01).

---

## 0. The whole journey (10 stages, as the designs number them)

```
 1 Request Submitted      client: case type → details → documents → speed & price → review → submit
 2 Under Review           admin checks jurisdiction / details        (client can cancel free)
 3 Advocate Assigned      admin assigns → advocate accepts / declines
 4 Talk to Advocate       client and advocate chat / call before deciding
 5 Client Decision        client: Accept advocate (→ PAY) / Request new advocate / Cancel
 6 Documents              advocate sends checklist → client uploads + sends originals
                          (Legalitt Delivery ₹249 or Send Yourself) → advocate confirms receipt
 7 Case Preparation       advocate tasks → court fee request (client pays, pass-through)
                          → pre-filing review by client (max 3 rounds) → approved
 8 Court Filing           advocate files offline → enters filing details (+ receipt)
                          → process fee request (pass-through) → receipt
 9 Hearings               first hearing added → hearing update (what happened, direction, order)
                          → next hearing … repeat
10 Case Completed         advocate marks complete → wallet

Any time after acceptance: client may request Change of Advocate (₹2,000 fee) → admin approves
→ old advocate uploads NOC → new advocate assigned → client accepts → case continues.
Pending (already-in-court) case: separate entry with case number + NOC → "Case Verification".
```

**[DECIDE] When does the client pay the service fee?** The designs contradict each other:
- Step-4 service screen: "Proceed to Pay", with the payment screen "High Court Representative ₹34,999 + GST = ₹40,680"
- Review and Submitted screens: "**No payment is taken right now.** Fees payable only upon advocate confirmation."
- Advocate request: "Paid by client · Held safely by Legalitt until representation begins"
- Advocate assigned (client): "Details and payment completed"

**Proposal: pay when the client taps "Accept Advocate" (stage 5).** It matches the clearest wording ("payable only upon advocate confirmation"), and nobody pays before they've talked to their advocate. The Step-4 button becomes **"Review Request →"**, not "Proceed to Pay".

---

## 1. Client side

### C1. Landing (DC `Html → Body.png`, HC `Html → Body.png`)
- Hero, "Why Legalitt" (4 tiles), "Learn about District / High Court cases" → **C1a Information** (DC `Html → Body (1).png`: common matters, how it works in 8 steps, typical progression, documents, tracking, service options, Legalitt Service Support refund note, Important note. Keep these. They're honest.)
- **Choose a service path:** Quick Submission / Assistance Service (**Get Assistance** → Request Chat / Callback, service = DC / HC)
- **Service options:** Ordinary / Urgent with price. **[DECIDE] Prices conflict** (see QUESTIONS): DC landing shows "XXX,XXX" and the service screen ₹25,000 / ₹35,000 ("example price"). HC landing shows ₹18,500 / ₹28,500, and the HC service screen ₹24,999 / ₹34,999. Proposal: one `service_pricing` row per court × speed (admin-editable), seeded with the service-screen values until confirmed.
- **Start New Case →** → sign in → C2
- **[REMOVE]** "Verified Court Coverage", "Jurisdiction Verified", "HIGH COURT OF INDIA" (there's no such court), "Verified Advocates" (until D-35)

### C2. Choose: New Case or Pending Case (HC `Html → Body (2).png`, applies to both)
- **New Case · Fresh filing**: not in court yet → C3
- **Pending Case · In court**: hearings already going on → **C10 Pending Case** (separate path)
- Note "A No Objection Certificate (NOC) is only needed if you are replacing a previous lawyer."
- **[REMOVE]** "Average reply < 5 mins", "Bar Council Compliant", "256-bit Encrypted"

### C3. Step 1 of 4: Case Type (DC `Html → Body (2).png`)
- **District Court:** Civil · Criminal · Family · Divorce · Property · Money Recovery · Consumer · Other
- **High Court:** Writ · Civil · Bail · Appeal · Service · Property · Other
- "Not sure which one to choose? **View examples**" → bottom sheet with 2–3 examples per type
- **Continue** → C4 · Back → C2

### C4. Step 2 of 4: Case Details (DC `Html → Body (3).png`, HC `Html → Body (4).png`)
- **Case Title*** (e.g. "Rahul Sharma vs Amit Verma") · **Other Party Name***
- **Court location:** City* · District* · State* (DC) / **Court & Bench*** pre-selected "MP High Court – Indore Bench", with **"I don't know the exact bench"** (HC)
- **What Happened?*** (plain words, counter)
- **Important Date** (optional) + "What is this date about?". Note: "The advocate will add official court dates after filing."
- **Is this a new case?** Yes / No. **If No** (DC shows it inline): Case Number · Previous Advocate · Reason for changing · NOC (can be added later). **[DECIDE]** Since C2 already splits New / Pending, show this block only on the Pending path (C10) and drop the inline toggle. That avoids asking twice.
- More about your case: sub-category chips (by type) · property / dispute location · other details
- **Continue to Documents** → C5
- **[REMOVE]** "100% Secure & Confidential", "Your Information is Protected" box → keep one line "Used only to review your request and brief your advocate."

### C5. Step 3 of 4: Upload Documents (DC `Html → Body (4).png`, HC `Html → Body (5).png`)
- **Case Papers (Required)** · **ID Proof (Required:** Aadhaar / Passport / Voter ID, shown masked) · Previous Court Order (optional, "I don't have this") · Notice or Petition (optional, "I don't have this") · Other supporting files · **+ Add Another Document**
- Each file: View (viewer) / Replace / Remove · PDF / JPG / PNG up to 25 MB · 25-page rule
- "Can't upload a required document? You can still continue…" **[DECIDE]** Proposal: allow continuing **without Case Papers** (the advocate asks later), but **ID is required**.
- **[REMOVE]** "High-Assurance SSL", "strict end-to-end statutory encryption"
- **Continue to Submission** → C6

### C6. Step 4 of 4: Choose Service & Price (DC `Html → Body (5).png`, HC `Html → Body (6).png`)
- Ordinary (normal processing, HC: "5–7 working days") / Urgent (priority, HC: "2–3 working days"), each with what's included
- Fee summary (base, then our rule at payment: + platform 25% + GST). **[REMOVE]** "Inclusive of all filing fees & taxes" (court fees are separate and pass-through), "Zero Surprise Commitment" / "guaranteed fee", "Dedicated senior advocate review", "Urgent senior advocate assignment", "Express court listing" (we can't promise court listing).
- Keep "Legalitt Service Support" (may return part of the fee if the advocate doesn't attend).
- **Review Request →** (not "Proceed to Pay", per section 0) → C7

### C7. Review Request (DC `Html → Body (6).png`)
Sections with **Edit**: Case Type · Case Details · Existing Case (if any) · Documents (n) · Service. Request summary, total estimated. "No payment is taken right now. Fees payable only upon advocate confirmation." Two required tick-boxes (info correct; agree to submit + Terms & Privacy links → legal pages, D-43). **Submit Request** → C8.

### C8. Request Submitted (DC `Html → Body (7).png`)
Request ID (`DC-` / `HC-YYYY-NNNN`) · status Under Review · your request summary · estimated fee "payable later upon confirmation" · **What happens next, step 2 of 9** · View Request → C9 · Go to Home. **[REMOVE]** "Encrypted" next to the ID.

### C9. Case tracking: one screen whose content changes by stage
All the stage screens below share: the case header (title, type, court, ID, tier), advocate card (once assigned), **Chat & Call** (C17), the stage timeline, and Back → My Requests.

**Stage 2 · Under Review:** "Legalitt is reviewing your request." **Cancel Request** (free at this stage, `Html → Body (14).png` with reason + confirm tick, "No penalty or fees apply for cancelling at the review stage").

**Stage 3–4 · Advocate Assigned / Talk to Advocate** (`Html → Body (8).png`)
- Advocate card (real data, D-02), **View Advocate Profile**
- **Chat with Advocate** · **Call Advocate** ("Direct consultation before confirmation, no video call required")
- **[DECIDE] Calling:** a real in-app call needs a provider (same as Legal Advice). Proposal: until there is one, **Call** opens the phone dialler with a **masked relay number**. Or, if there's no relay either, hide Call and keep Chat. See QUESTIONS (privacy: should real numbers be exchanged before acceptance?).
- **Review Advocate →** → stage 5

**Stage 5 · Client Decision** (`Html → Body (10).png`, "Ready to Decide?")
- **Accept Advocate** → **PAY NOW** (proposal, section 0): the payment screen (service fee + platform + GST + pages) → success → `Html → Body (11).png` "Advocate Accepted" → stage 6
- **Request New Advocate** → `Html → Body (12).png`: reason (I want a different advocate / different practice area / another location / not comfortable after talking / other) + note + confirm tick → **Send Request** → `Html → Body (13).png` "Request Sent" (admin reviews. "A new advocate is not assigned automatically.") → admin reassigns → back to stage 3. **[DECIDE]** Max 2 free re-assignments before acceptance, then admin contacts the client.
- **Cancel Request** → `Html → Body (14).png` (free before payment)
- **[REMOVE]** "You will get an app notification **and SMS**" (no SMS), "Verified Advocate" (until D-35)

**Stage 6 · Documents**
- Waiting: "Your advocate will send the list of documents needed." (`Html → Body (11).png`)
- **Recommended Documents** (`Html → Body (15).png`): advocate's message · checklist progress (required x/y, optional) · each item with description, Upload / View / Replace, status Uploaded / Not added · "Physical Documents" note · **Continue to Delivery →**
- **Send Documents** (`Html → Body (17).png`): **Legalitt Delivery** (powered by courier) or **Send Yourself**
  - **Legalitt Delivery:** Confirm Delivery Details (`(18)`: pickup name / phone / address, Use my address; receiver = advocate chamber address from their profile, masked phone; pickup date and slot; instructions; confirm tick) → Book Delivery (`(19)`: summary, **fee ₹249**, confirm) → **payment ₹249** (`Documents Forensic 51/52`, "Legal document delivery") → Shipment Created (`(20)`: delivery ID, courier, AWB, pickup scheduled) → Delivery Tracking (`(21)`: timeline). **[DECIDE]** There's no courier API, so the admin books the pickup and enters the AWB and status updates (same as Legal Notice dispatch). Until the admin enters the AWB, the client sees "Booking your pickup. We'll add the tracking number soon."
  - **Send Yourself:** (from the older designs 284–287) instructions with the advocate's chamber address, then the client enters courier name and tracking no. (optional receipt photo) → "Sent"
- **Documents Received** (`(22)`): appears when the advocate confirms receipt (A8). **[REMOVE]** "Chain of Custody Confirmed", "Advocate Verified", "Verified physical count" → "Your advocate confirmed receiving 5 documents on <date>."

**Stage 7 · Case Preparation** (`(23)`): "Your advocate is preparing your case." Latest advocate update (text + time). "No action required from you right now."
- **Court Fee Required** (`(24)`): appears when the advocate sends a court-fee request (A10). Shows the amount, "goes directly to the court registry", case info, Chat & Call, what happens next. **Pay Court Fee (₹3,500)** → payment (**pass-through: no platform fee, no GST**, labelled "Court fee, paid to the court via your advocate") → receipt status "Your advocate will upload the court receipt" → when uploaded: View / Download. **[REMOVE]** "100% Secure Government Court Payment · Verified by Legalitt" (D-01).
- **Review Before Filing** (`(25)`): "Review Round 1 of 3". Documents for review (Petition, Affidavit, Supporting Papers): **View Document** (viewer) / **Add Comment** (page number + note, edit / remove). "Anything else?" (≤ 300). Confirm tick "I have reviewed the documents and want my advocate to continue with filing." → **Approve Documents** / **Request Changes** (sends all comments → advocate, round +1). After 3 rounds: **[DECIDE]** "Contact Support" appears instead of Request Changes.
- **Change Request Tracking** (`Mobile Frame (390 x 852).png`): your request text, then a 5-step timeline (sent → advocate reviewing → documents being updated → new documents sent → client review again)

**Stage 8 · Court Filing** (`(26)`): "Case Filed". Filing date, filing number, case number, status, court, **first hearing (only when the advocate adds it)**, filed documents (View). **[REMOVE]** "Official Registry" badge, "Details verified".
- **Process Fee** (`(27)`): advocate request (heading, description, amount, e.g. ₹850 "Bhatta" for court notice) → **Pay Process Fee** (pass-through) → receipt uploaded by the advocate → View / Download

**Stage 9 · Hearings**
- **First Hearing** (`(28)`): date, time, court room, bench, judge (if given), case number (copy), advocate, "Before the hearing" note, Chat & Call. **[REMOVE]** "added directly from the court registry", "Court listing verified". It's advocate-entered: "Added by your advocate."
- **Hearing Update / Case Overview** (`(29)`): hearing completed, details, **What happened?** (advocate's words), **Court direction**, court order file (View), **Next step**, upcoming date
- **Next Hearing** (`(30)`): date / time / room / bench, next step, advocate note, **Change Advocate?** link → C11
- Repeats for every hearing. The full list is under "Hearings" in the case.

**Stage 10 · Case Completed** (`(34)`): milestone journey, case, final status, final update text + date, Case Documents (all files), Case History (all hearings and events), service summary, **Contact Support**, **Rate your advocate** [DECIDE: same review component as Legal Advice].

### C10. Pending Case path (HC `(29)`/`(32)`/`(35)`, `(33)`/`(36)`, applies to DC too)
- "Pending Case Details": Case Number* · Court Name* · Case Type* · Current Advocate (optional) · Case Status (dropdown: Admission / Notice / Evidence / Arguments pending / Orders reserved / Other) · **NOC from previous advocate** (upload or "upload later") · other court documents are collected next
- **[REMOVE]** "We will safely read and verify your case history **directly from court servers**" (we don't), "Bank-Grade Privacy · 256-bit", "eIDAS session" (an EU standard, irrelevant here)
- **Submit Case Verification** → "Case Sent for Verification" (`(33)`): ID `…-VER-…`, case information, NOC uploaded, verification status (Details submitted · NOC submitted · Legalitt review · Verification complete). **[DECIDE]** "Usually takes 2–4 hours" → "We'll update you after review." **[REMOVE]** "SMS".
- After admin verification → continues at **C5 documents** and **C6 speed & price**, then the normal flow from stage 2

### C11. Change Advocate, ongoing case (`(31)` DC, HC `(28)`)
- "Eligible to change · Ongoing case", current advocate card, current stage (first hearing done / next hearing date)
- Reason (radio) + note
- **Change advocate fee ₹2,000** ("one-time processing", shown before confirming)
- How it works: current advocate not removed immediately → admin reviews → you can chat / call the new advocate → documents stay
- **Continue** → pay ₹2,000 → request goes to admin
- **[DECIDE]** Is the ₹2,000 refunded if admin rejects? Proposal: yes, automatically.
- Then: admin approves → **old advocate uploads NOC** (A16) → admin assigns new advocate → client sees stage 3–5 again for the new advocate (talk → accept, **no second service fee**) → the case continues at the current stage with full history
- **[REMOVE]** "verified, experienced advocate", "transfer cleanly", "Verified Legalitt Process"

### C12. Cancellation after acceptance (no design. D-12)
After payment and before filing: request cancellation → admin decides the refund (minus work done). After filing: no cancellation, Change Advocate or Contact Support. **[DECIDE]** QUESTIONS (refund rules for court cases).

### C17. Chat & Call (DC `(9)`)
Case chat with the advocate, document-checklist cards inside chat ("Advocate Recommended · Documents You Need · View List"). **[REMOVE]** "256-bit encrypted", "Online".

---

## 2. Advocate side

### A1. Cases list (`85.png`)
DC / HC cards: client vs party, ID, court, status (New / Waiting for client / Documents / Preparation / Filing / Active / Completed), **Next Hearing: date (purpose)**, court room. Legalitt AI (`91/92.png`) hidden until D-41.

### A2. Request Details: new (`Html → Body.png`)
- Request received, client (name, petitioner, phone / email **masked until the client accepts** [DECIDE]), city
- Case type, court, matter, important date, what happened (verbatim), client documents (View all)
- "No AI findings yet. Review original files." (keep. The AI summary is hidden until D-41.)
- **Payment:** design shows "Client Fee ₹25,000 − Legalitt Fee ₹5,000 = Your Amount ₹20,000 · Held safely by Legalitt until representation begins". **Proposal:** "You receive ₹<base> once the client accepts and pays." **[REMOVE]** "held safely".
- **Decline Request** (reason → admin) · **Accept Request** → A3

### A3. Client Documents (`(1)`)
Uploaded files (View each), **+ Request Document** (opens the checklist builder, A7), **Private note** (only for you), **Continue to Case Summary** → A4. **[REMOVE]** "All verified".

### A4. AI Case Summary (`(2)`)
**[DECIDE]** D-41, not built. Proposal: replace it with a plain **Case Summary** (client's facts, type, court, dates, documents list) plus **Call Client** / **Chat with Client**. (The design's sample content is from Legal Advice, a copy-paste.)

### A5. Talk to client (`(3)` chat, `(4)` call)
Chat with View Case / View Documents. The call screen (same calling-provider decision). **Add Note** during the call → private notes.

### A6. Waiting for Client (`(5)`), then Client Accepted (`(6)`/`(7)`) or Client Declined (`(8)`)
- Waiting: "The client is deciding whether to continue with you."
- Accepted: client details now unmasked, **Recommend Documents →** (A7). This is when the client's payment is captured (proposal).
- Declined: reason and note, "You are no longer assigned", **Back to Dashboard**

### A7. Recommend Documents (`(9)`)
Checklist builder: items with Required / Optional, a description each, edit / delete, **+ Add Document**. "AI suggestions" hidden (D-41). Message to client. **Send to Client** → client stage 6.

### A8. Confirm physical documents (`(10)`), then Documents Received (`(11)`)
Delivery details (courier, AWB, delivered at, as entered by admin / client). **Tick each document received.** "Courier delivery alone does not mean legal custody. You must confirm you have the papers in hand." Confirm tick → **Confirm** → client notified → "Start Case Preparation". **Report Missing** → message to client + admin. **[REMOVE]** "Secure Audit", "Verified by Adv. …" (keep "Confirmed by you at <time>").

### A9. Case Preparation (`(12)`)
Documents received (View). **Preparation tasks** (tick off): Review case · Review documents · Prepare court papers · Check filing details · Prepare for hearing. **My notes** (private). Buttons:
- **Request Court Fee** → A10 (fresh cases)
- **Send for Client Review** → A11 (upload Petition / Affidavit / Supporting papers PDFs)
- **Go to Court Filing** (locked until the client approves the pre-filing review)

### A10. Court Fee request (`(15)` create, `(16)` sent)
- Pre-filled case details (read-only)
- **Heading*** (client sees) · **Description*** · **Amount (₹)*** · optional challan / receipt upload · live client preview
- **Send Court Fee Request** → client stage 7 card
- Sent view: payment tracking (created → sent → waiting → **paid**, updated by the backend only: "Advocate cannot manually mark as paid"), receipt upload / replace
- **[REMOVE]** "via SMS"

### A11. Pre-Filing Review (`(17)` changes requested, `(18)` client approved)
Status cycle: Ready to send → Waiting review → Changes requested → Approved. Round counter (max 3). Client feedback (per page + general). Final documents (View, mark "Needs re-send"). **Send Revised Documents** / **Update / Replace Documents**. When approved: "Proceed with the actual court filing. Court filing is completed offline." **Go to Court Filing** → A12.

### A12. Court Filing (`(13)` not filed, `(14)` add details, `(19)` filed)
- **Mark as Filed** → form: Filing Date* · Filing Number* · Case Number (if assigned) · Filing Status* · Note · Filing Receipt (optional) · confirm tick → **Save Filing Details** → client stage 8
- First hearing locked until filed. Then **+ Add First Hearing** → A14.
- **Request Process Fee** → A13

### A13. Process Fee (`(20)` request, `(21)` completed)
Same as the court fee: heading, description, amount → **Send** → client pays (backend marks it paid) → **upload receipt** (required, to complete the 3-step lifecycle).

### A14. First Hearing (`(22)` add, `(23)` hearing day)
- Add: Date* · Time* · Court Room* · Bench* · Judge (optional) · Note · "Send hearing details to client" (default on) → **Save First Hearing** → client stage 9, and a reminder for the advocate (in-app, the day before) [DECIDE: in-app only]
- Hearing day: case and hearing info, **readiness checklist** (court papers / documents / advocate ready, ticks), **Start Hearing** ("tap when the matter is called"). **[DECIDE]** Proposal: "Start Hearing" just records the time. There's no "live hearing mode" for clients (drop "Preview Live Hearing Mode").

### A15. Hearing Update (`(24)` quick, `(25)` full "Review Client Update"), then Next Hearing (`(28)`)
- Attendance: advocate attended / **client present?** Yes / No / Not required
- **Hearing status:** Hearing completed · Matter adjourned · Order passed · Matter not taken up · Other
- **What happened?** (client sees) · **Court direction / order** (client sees) · **Court order document** (upload, client sees) · **Next step** (client sees) · **Next hearing** (date, time, room, bench) · documents needed next (items) · **Private note (never shown to client)**
- **Preview Client View** (read-only, exactly what the client sees) → **Save & Send Update** / **Save Draft**
- Next Hearing form = the same fields as A14 + "what needs to be done next" + documents needed
- **Case Dashboard** (`(30)`): next hearing, latest update, quick actions (Documents / Hearings / Updates / Messages), progress, payment status
- **Mark Case Completed** (missing from the design, add it): final update text + date + final order upload → confirm → client stage 10 → wallet credit (`(31)` "Case Completed · ₹… added to your wallet")
- **[REMOVE]** "Encrypted and strictly hidden" (just "Only you can see this"), "Details verified from court roster", "Automatically adds to client calendar"

### A16. Client Changed Advocate: handover (`(29)`)
"Client requested a new advocate", case details, change request (approved by admin, reason, date). **Upload NOC / consent*** → View / Replace → **Send NOC to Client** (and admin) → milestone "Handover" → after the new advocate accepts, this case moves to the old advocate's Completed list as "Transferred". **[DECIDE]** Payout for the outgoing advocate: you told me the client confirmed *"We'll only pay the advocate that does the final job."* Applying that here means **the outgoing advocate gets nothing**. That needs confirming for court cases, where months of work may be done (QUESTIONS).

---

## 3. Admin side (no designs)
1. **New requests (stage 2):** check jurisdiction / court / type → **Accept & assign advocate** (approved, practising in that court) or **Ask client for details** or **Reject** (reason; nothing paid yet)
2. **Pending-case verifications (C10):** check the case number, court, NOC → Verified / Ask for more
3. **Advocate declined / client requested new advocate (pre-acceptance)** → reassign
4. **Change of advocate (ongoing):** approve / reject (refund ₹2,000 if rejected) → wait for NOC → assign new advocate → watch client acceptance
5. **Document delivery bookings (₹249):** book the pickup, enter AWB, update tracking, mark delivered
6. **Court / process fee payments:** see requested and paid pass-through fees per case, and whether the advocate uploaded the receipt (alert if no receipt within 7 days of payment)
7. **Stalled cases:** no update for 30 days, hearing date passed without a hearing update (48 h)
8. **Service-support refunds** ("advocate didn't attend") and cancellations

---

## 4. Data
- **Case:** court level (district / high), court & bench, case type + sub-category, new / pending, title, other party, what happened, important date (+ about), city / district / state, speed, status / stage, advocate (current + history), price snapshot
- **Pending-case info:** case number, court name, case type, case status, previous advocate, NOC file, verification status
- **Assignments:** advocate, assigned at, advocate decision, client decision (accept / new / cancel + reason / note)
- **Documents:** client uploads (slot, required flag), advocate checklist items (status), physical delivery (method, booking, AWB, tracking lines, delivered at, advocate receipt confirmation per item)
- **Preparation tasks;** **pre-filing reviews** (round, files, comments per page + general, decision)
- **Fee requests** (type court / process / other, heading, description, amount, status, payment, receipt file)
- **Filing** (date, number, case number, status, note, receipt)
- **Hearings** (date, time, room, bench, judge, note, attendance, client present, status, what happened, direction, order file, next step, documents needed, private note, sent to client at)
- **Change-of-advocate requests** (reason, note, fee payment, admin decision, NOC, new advocate, completed at)
- **Events**

---

## 5. High Court differences
| Item | District Court | High Court |
|---|---|---|
| Case types | Civil, Criminal, Family, Divorce, Property, Money Recovery, Consumer, Other | **Writ, Civil, Bail, Appeal, Service, Property, Other** |
| Location field | City, District, State | **Court & Bench** (pre-selected MP HC Indore Bench) + "I don't know the bench" |
| Speeds (design text) | Normal / Faster processing | Ordinary 5–7 working days · Urgent 2–3 working days |
| Prices (design) | ₹25,000 / ₹35,000 ("example") | ₹18,500 / ₹28,500 (landing) vs ₹24,999 / ₹34,999 (service screen) |
| Court fee | Fresh civil cases (court-fee screen) | Same screens. Writs have their own fee scale, entered by the advocate. |
| Everything else | same | same (the HC folder reuses most DC screens; some HC screens still say "District Court", fix the labels) |
