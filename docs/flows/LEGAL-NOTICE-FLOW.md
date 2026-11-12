# Legal Notice: complete flow

**Read `ISHAAN-ANSWERS-2026-11-12.md` first. It overrides this file where they differ.** For Legal Notice: chat closes when the notice goes to admin (no 1-hour session), email goes through AWS SES, WhatsApp through a provider (manual until the account is ready), e-sign is a test step until a provider is chosen, and failed delivery is handled by admin (pending question C3).

**Sources:** Figma exports `Legal-Notice-Client-Side` (19 screens), `Legal-Notice-Advocate-Side` (14 screens) and `Document-Viewer` (3 screens), plus **Ishaan sir's review** (`Legal-Notice-Changes`: 5 written changes and 2 screenshot notes).
**Figma wins over the older `design/` numbers wherever they differ.**

Tags used:
- **[DESIGN]**: taken from the design.
- **[ISHAAN]**: Ishaan sir's change. Overrides the design.
- **[DECIDE]**: not covered. My proposal is written next to it, and the open questions are in `QUESTIONS-ALL-SERVICES.md`.
- **[REMOVE]**: a false claim. Leave it out (D-01).

---

## 0. Ishaan sir's changes, applied throughout

| # | His words (short) | What it means for the build |
|---|---|---|
| 1 | Once the client approves, the notice goes **straight to the admin panel**, and the advocate does nothing more. If the client suggests changes, it goes to the advocate, and only after the client confirms the revised notice does it reach admin. The admin sends the notice, **authenticated by the advocate's Aadhaar-based e-signature.** | The advocate's job ends at "client approved". The admin owns verification, e-signing and dispatch. There is no advocate dispatch screen anymore (the old 193–203 and 275–287 are retired for Legal Notice). E-sign is a new step (section 3, admin). |
| 2 | The client **must give at least one way to serve the notice**: noticee's postal address, email or WhatsApp number. The steps change depending on the option chosen. | Step 2 asks **how to send the notice** (one or more of Courier, Email, WhatsApp), and only the fields for the chosen methods appear and become required. The ₹179 delivery fee applies only if Courier is chosen. |
| 3 | Relationship details are irrelevant. | Remove "Relationship (Optional)" from Step 2 and from the summary (design 08 shows "Brother"). |
| 4 | Uploaded PDFs don't show properly in the client flow. | Every uploaded file opens in the **Document Viewer** (Figma `Document-Viewer` 147–149): PDFs render page by page, images show full-size, and there's a proper error state and download. |
| 5 | The 1–6 step indicator has a huge gap between steps 1 and 2, and the connecting line is missing. | One shared stepper component: 6 evenly spaced circles joined by a continuous line, filled up to the current step. Used on every Legal Notice step. |
| S1 | (Screenshot) The case summary should appear **above the documents** on the advocate's Review Documents page. | A6 shows a "Case Summary" card (client, noticee, notice type, issue, amount, dates) above "Uploaded Files". |
| S2 | (Screenshot) **No Offences section** in the draft. | Remove the "Offences" box from the draft editor, **and** remove the sentence "…lodge a criminal complaint / FIR … for the offences of ___" from the notice template and PDF, since there's nothing to fill it with. |

---

## 1. The whole journey

```
CLIENT                                  ADVOCATE                           ADMIN
Landing (choose method + tier)
  ├─ Assistance: Request Chat / Request Callback ─────────────────────────► Support inbox
  └─ Quick Submission
     Step 1 Your details
     Step 2 Noticee + how to send (Courier / Email / WhatsApp)
     Step 3 Notice type + issue
     Step 4 Identity + documents → Review documents
     Step 5 Case summary
     Step 6 Payment → Scan & Pay → Success
     Tracking ──────────────────────────────────────────────────────────► New paid request → assign advocate
                                         Cases list → Fee & Earnings
                                         Decline ───────────────────────► reassign
                                         Accept → Review Documents
                                         Choose drafting method → Draft editor → Preview
     Draft ready ◄────────────────────── Send to client
       Request Changes ─────────────────► Client Review: changes → revise → resend
       Approve & Proceed ───────────────────────────────────────────────► Approval queue
                                         (sees "Submitted to Admin" + status, read-only)
                                                                           Address check → Notice check
                                                                           Advocate e-sign (Aadhaar)
                                                                           Dispatch: Courier / Email / WhatsApp
                                                                           Tracking updates → Delivered + proof
     Notice Delivery (tracking) ◄───────────────────────────────────────── updates
     Notice Delivered ◄─────────────────────────────────────────────────── delivered
```

---

## 2. Client side

### C1. Legal Notice landing (Figma `Html → Body.png`)
**On screen [DESIGN]**
- Header "Legal Notice Detail" and a profile icon
- Hero: "FORMAL LEGAL ACTION", "Send a Legal Notice — Legally drafted. Professionally reviewed. Hassle-free."
- "Why send a Legal Notice?" with 4 bullets, plus links "Is a legal notice always required? / What should it contain? / Learn more ›"
- **[REMOVE]** "Drafted & reviewed by Verified Advocates • SECURE". Replace with "Drafted & reviewed by advocates on Legalitt" until D-35 verification is live.
- "Why choose Legalitt?": Preview Before You Send · Track Postal Acknowledgment · Get Reply Update. **[DECIDE]** "Get Reply Update": we have no way to receive the noticee's reply. Proposal: change it to "Upload the reply you receive", so the client can add a reply document to the case later (see C14).
- **Choose how you'd like to proceed** (radio cards):
  - DO IT YOURSELF · Quick Submission. **Fix the design's text:** it says "submit your forensic review request". It should say "submit your legal notice request". Link: **Continue with Quick Submission →**
  - GET EXPERT HELP · Assistance Service, "Get guidance from our team…" (the design says "document review process", fix to "legal notice process"). Buttons: **Request Chat**, **Request Callback**
- **Choose Your Service:** two tier cards
  - **URGENT ₹999 · Within 5 days · Priority advocate assign** (default selected)
  - **ORDINARY ₹699 · Within 10 days · Standard advocate assign**
- Summary bar: "Selected: Urgent Assignment (5 Days) ₹999"
- **Get Started →**
- Footer "Your information stays secure and confidential." **[REMOVE]** "IN COMPLIANCE WITH BAR COUNCIL OF INDIA STANDARDS"

| Tap | Result |
|---|---|
| Back | Where the user came from |
| Learn more / the two question links | C1a info page (design `02.png`: what a notice is, why it matters, when it's mandatory, how Legalitt helps) → **Send a Legal Notice →** returns here with Quick Submission selected |
| Tier card | Selects the tier and updates the summary bar. Prices come from `service_pricing` (Legal Notice · urgent / ordinary). |
| Get Started / Continue with Quick Submission | Needs Quick Submission selected and a tier picked → sign in if needed → C2 Step 1. The tier is saved on the request. |
| Request Chat | Support Chat (`132.png`), "Regarding: Legal Notice Service", thread in the admin Support inbox and the client's Messages → Support |
| Request Callback | Request a Callback (`131.png`), service = Legal Notice → Support inbox |

**Pricing shown later at payment:** base = tier price (the advocate's share). Platform fee = 25% of base. GST 18% on (base + platform). **Delivery fee ₹179 only if Courier is chosen in Step 2.** Extra pages above 25 × ₹25 (no GST).

### C2. Step 1 of 6: Your details (`04.png`, chat style)
**Stepper fix [ISHAAN 5]:** evenly spaced 1–6 with a continuous line. Header "Legal Notice" · **[REMOVE]** the "Secure & Confidence" subtitle (it's also a typo). Proposal: just "Legal Notice".
- Bot bubble "Please provide your details!"
- Fields: **Full Name***, Mobile Number (Optional), Email Address (Optional), **Full Address***. Pre-fill from the profile.
- **[DECIDE]** The notice must carry the sender's identity. Proposal: add **Father's/Husband's name** (the notice template says "Mr. ___ S/o Shri ___ Age ___ R/o ___") and **Age**, both required. Otherwise the advocate has to ask every time.
- **Continue** → validate → save the draft → C3. **Back** → "Save as draft and leave?" (Save / Discard / Stay) → C1.

### C3. Step 2 of 6: Who should receive the notice, and how (`156.png`, changed per ISHAAN 2 & 3)
- Info card "Don't know the noticee's address? Share whatever details you hold…" (keep)
- Bot bubble "Who would you like to send the notice to?"
- **Noticee Full Name*** (person or company). **[DECIDE]** Add "Noticee type: Person / Company". If Company, add "through (designation)", e.g. Director or HR Head, because the notice is addressed that way.
- **"How should we send the notice?"** (new, [ISHAAN 2]): three tick-boxes, **at least one required**:
  - ☐ **Courier to postal address** → shows **Full Address*** (with PIN*). Adds the ₹179 delivery fee.
  - ☐ **Email** → shows **Email Id of Noticee*** (validated format)
  - ☐ **WhatsApp** → shows **WhatsApp Mobile Number of Noticee*** (+91, 10 digits)
- **Relationship field: removed** [ISHAAN 3]
- Error if none is ticked: "Choose at least one way to send the notice."
- **Continue** → C4 · **Back** → C2

### C4. Step 3 of 6: What's the notice about (`142.png`)
- Bot bubble "Quick Actions". Notice type chips, **one required**: Property Dispute · Money Recovery · Tenant Issue · Family Dispute · Cheque Bounce · Consumer Complaint · Any other
- **[DECIDE]** The design has no box for the story, but Step 5 shows "Issue Summary" and the advocate needs facts. Proposal: after the chip, show **"Briefly describe the issue"*** (max 2,000 characters, counter), plus **Amount involved (₹, optional)** and **Key date (optional)**. If **Cheque Bounce** is picked, also ask: cheque number, cheque date, amount, bank, date the cheque was returned (needed for the 30-day legal limit), all required.
- **Continue** → C5 · **Back** → C3

### C5. Step 4 of 6: Identity and documents (`133.png`)
- **Identity Verification card** "KYC REQUIRED · Primary Aadhaar / PAN · Required before notice attestation" with **Complete KYC →**. **[DECIDE]** Same as FIR: no DigiLocker or Video KYC (D-40). Proposal: **Complete KYC** opens an upload sheet for Aadhaar or PAN (front, plus back for Aadhaar). It's saved as an Identity document, and the number is always shown masked. The card then reads "ID uploaded". Never "KYC verified".
- **Document slots: [DECIDE] these should depend on the notice type from Step 3.** The design shows Property Papers / Agreement / Screenshots, which only fits property.
  - Property Dispute: Property papers (sale deed, khata) · Agreement · Screenshots
  - Money Recovery: Invoice / bill · Agreement · Payment proof / ledger · Screenshots
  - Cheque Bounce: **Cheque copy*** · **Bank return memo*** · Invoice / agreement · Screenshots
  - Tenant Issue: Rent agreement · Rent receipts · Screenshots
  - Family / Consumer / Other: Any supporting document · Screenshots
- **+ Add More Documents (Optional):** user names the slot
- Each slot shows a cloud icon → upload (PDF, JPG, PNG). After upload: file name, pages, a **View** eye (opens the Document Viewer, [ISHAAN 4]) and a **Delete** bin (with confirmation).
- **Continue** needs the ID plus at least one document (and the starred slots for Cheque Bounce) → C5a · **Back** → C4

### C5a. Review your documents (`Html → Body (1).png`)
- Stepper, "Review Your Documents", green bar "Documents uploaded successfully · N documents added"
- Each slot listed with its files, plus **View** (Document Viewer), **Replace**, **Delete**
- **[ISHAAN 4]** Thumbnails and the viewer must actually show the PDF: first-page preview, page count, open full-screen.
- Page counter: "N pages total". If over 25: "Pages above 25 are charged ₹25 each. You'll see this at payment."
- **Continue** → C6 · **Back** → C5

### C6. Step 5 of 6: Preview your case summary (`08.png`)
- Rows: Client Name · Notice Type · Noticee (name, **no relationship**, city/state, plus the chosen send methods with their address / email / WhatsApp) · Issue Summary · Uploaded Documents ("N documents", tap → C5a) · Tier (Urgent 5 days / Ordinary 10 days)
- Each row has an **Edit** link back to its step. After editing, Continue returns straight here.
- **Submit & Proceed to Pay** → C7 · **Back** → C5a

### C7. Step 6 of 6: Payment (`Documents Forensic 16/17/30.png`)
Same component as FIR. Rows from our pricing rule:
- Service fee (tier base)
- **Legal Notice Delivery Fee ₹179 (only if Courier chosen)**
- Platform fee
- GST 18% on (base + platform)
- Extra pages
- Total

Methods: UPI app / Scan QR / Cards / Net Banking, simulated and labelled "Test payment".
- Scan & Pay: real 10:00 countdown, "Legal Notice", and a "Simulate successful payment" test button (never automatic). Expired → **Generate new QR**.
- Success: real request ID (`LN-YYYY-NNNN`). **Fix:** the design says "forensic analysis request". It should say "legal notice request". **Start Tracking →** → C8.
- Failure: "Payment didn't go through. You haven't been charged." with **Try again**. Back from payment → C6 (draft kept).

### C8. Legal Notice Tracking (`Html → Body (2).png`)
**On screen [DESIGN]**
- Status chip (e.g. "Drafting in Progress") and tier label
- Title and subtitle, which change with the status
- Request ID with Copy
- **Notice Details:** Notice Type (show the real type, e.g. "Cheque Bounce", not just "Legal Notice") · Service (URGENT / ORDINARY + days) · Submitted On · Current Status
- **Assigned Advocate** card (appears once one is assigned): initials or photo, name, real practice areas and experience **only if in their profile** (D-02), bar registration, rating **only if real reviews exist**. **View Profile** → Advocate Profile (`Html → Body@2x.png`, same D-02 rules). **Chat with Advocate** → the case chat (C13).
  - **[REMOVE]** "Verified Advocate" badges unless D-35 approved.
  - Before assignment: "We're assigning an advocate. Urgent: within <N> hours."
- **Request Status timeline [DECIDE: extended for admin dispatch]:**
  1. Request Submitted
  2. Payment Confirmed (amount + method)
  3. Advocate Assigned
  4. Drafting in Progress (EST. date = submitted + tier days − buffer)
  5. Awaiting Your Approval
  6. **Being prepared for dispatch** (admin checks and e-sign; the client doesn't see the detail)
  7. Notice Dispatched (per method)
  8. Delivery Confirmed
- **Legal Notice Draft** card (only when a draft has been sent): `Legal_Notice_Draft_v<N>.pdf`, "Prepared by Adv. …", **Review Draft →** (Document Viewer) and **Download PDF**
- **Your Decision** (only while status = awaiting client): **Approve & Proceed** and **Request Changes**

| Tap | Result |
|---|---|
| Approve & Proceed | Confirm "Approve this notice? It will be sent to the noticee after Legalitt's checks. You can't change it after this." → status `client_approved` → **goes straight to the admin approval queue [ISHAAN 1]** → the tracking timeline moves to step 6 |
| Request Changes | C9 |
| Back | Where the user came from (My Requests, Home, notification) |

**Edge cases**
- **Client doesn't respond to a draft:** reminder notifications at 24 h and 72 h. **[DECIDE]** After 7 days with no response, admin sees it in an "Awaiting client too long" list and can call. It never auto-approves.
- **Advocate misses the tier deadline:** admin gets an overdue alert at deadline − 12 h and can reassign. The client sees "Your advocate needs a little more time" plus a support link. Refund rules are a question (QUESTIONS).
- **Cancellation (D-12):** before an advocate accepts → client cancels, full refund. After acceptance and before dispatch → request, admin decides the amount. After dispatch → no cancel, Contact Support.

### C9. Request Changes (`Html → Body (3).png` shows the entry. Form: reuse the FIR F7 component)
- Same as FIR: pick sections (Sender details · Noticee details · Facts · Demand · Amount/dates · Other), describe (≤ 600), optional attachment
- **Submit** → status `client_changes_requested` → the advocate sees it in A9 → tracking shows "Your advocate is updating the draft"
- **[DECIDE]** Limit on change rounds? Proposal: unlimited, but after 3 rounds the admin is alerted.

### C10. Notice Delivery: in transit (`Html → Body (4).png`), Courier method
- Status "IN TRANSIT · In 1–2 days" · "Physical Notice on the Way"
- Courier name and **real waybill no.** (entered by the admin) with copy
- Notice Recipient: name, address, phone
- Latest courier update: **entered or updated by the admin**. **[DECIDE]** There's no courier API yet, so it's manual. The design's live hub updates come from the admin's entries.
- `Legal_Notice_Final.pdf` · Preview
- Delivery Progress: Notice Approved · Notice Prepared · Shipment Created · Pickup Booked · Picked Up · In Transit · Out for Delivery · Delivered, each ticked when the admin records it
- **[REMOVE]** "Tamper-Proof Chamber Seal Intact", "Statutory Evidence Guarantee", "digitally stamped certificate of service… automatically". Replace with: "Once delivered, the proof of delivery will appear here."
- **View Notice Document** → viewer · **View Case Details** → C8

**Email / WhatsApp methods** (no design, [DECIDE]): the same card pattern with "Sent by email to a***@domain.com on <time>" or "Sent on WhatsApp to +91 98***10 on <time>", plus the delivery status the admin records (Sent / Delivered / Read / Failed). If several methods are chosen, show one card per method.

### C11. Notice Delivered (`Html → Body (5).png`)
- "Notice Delivered", delivery details: courier, waybill, delivered on / at, received by (as recorded by the admin), address
- **Delivery Proof:** POD file uploaded by the admin, with **View Proof** and **Download**
- Your Legal Notice: final PDF with View
- Case Status: Notice Delivery · Completed
- Important Note (keep): delivery confirms physical delivery only…
- **[REMOVE]** "BLUE DART CONFIRMED", "Signature On File" (unless the POD shows it), "Signed Copy"
- **View Case** → C8

### C12. Failed delivery (no design, [DECIDE])
If the admin marks a method **Failed** (courier returned, email bounced, WhatsApp undelivered): the client sees "We couldn't deliver by <method>. Reason: <admin note>" and two options:
- **Add another address / contact** (opens the Step 2 fields; a new courier address may cost ₹179 again, see QUESTIONS)
- **Contact Support**

### C13. Chat with the advocate (`144.png`, advocate side `63.png`)
- Case chat, with a document upload button
- **When it's open (DECIDED, Ishaan sir Q95 and Q99):** from advocate acceptance **until the notice goes to admin** (that is, when the client approves). After that, the chat is **read-only for both**, the advocate's part of the case is closed, and the client follows progress on Tracking only. **No 1-hour live session.** Remove the "Chat valid up to 1 hour · 00:59" timer from the advocate screen.
- **[REMOVE]** online / typing indicators (D-28)

### C14. After delivery (no design, [DECIDE])
- **Upload reply received:** the client can attach the noticee's reply to the case. It's visible to the advocate and admin, and the case gets the note "Reply received".
- **Next steps** card: "Need help with the reply? Book Legal Advice" → Legal Advice landing

### Document Viewer (Figma `Document-Viewer` 147 viewer · 148 error · 149 empty) [ISHAAN 4]
- Opens any document from any service: PDF page-by-page with page counter and zoom, images fit-to-width, download
- **Error state (148):** "Couldn't open this file" with **Retry** and **Download instead**
- **Empty state (149):** "No documents yet" with what will appear here
- Signed URL fetched when opening. Expired → refetch silently.

---

## 3. Advocate side

### A1. Cases list (`68.png`)
As FIR A1, with filter chip Legal Notice. Card: "LEGAL NOTICE" · tier tag (URGENT / ORDINARY) · "Client → Noticee" · ID · Fee: ₹ advocate share · status chip · last note · updated time · action button (Review Request / Continue Draft / View Status / View). **[REMOVE]** "Secured In-App Call" wording on other cards.

### A2. Fee & Earnings, before acceptance (`64.png`)
- "Pre-Acceptance", LEGAL NOTICE, Ref, client name, matter (notice type), **deadline (tier)**
- **[DECIDE]** The design shows "Consultation Slot 24 Sep · 5:30 PM", but Legal Notice has no slot. Proposal: show "**Draft due by <date>** (Urgent 5 days / Ordinary 10 days from payment)".
- **Fee:** design shows Client fee ₹3,500 − Platform − GST & gateway = Net ₹3,087. **Proposal: show only "You receive ₹<base>"** (our platform fee is added on top for the client, not deducted). The courier fee isn't relevant here anymore, since the admin dispatches. See QUESTIONS on who keeps the ₹179.
- Payout info: bank ****1234 (masked, from payout settings) · "Released after completion, paid manually by Legalitt" (D-36/37).
- **[REMOVE]** "paid in escrow", "securely pre-authorized in Legalitt Escrow", "Transfer occurs automatically", "Client Verified".
- **Decline Request** → reason required → back to admin for reassignment → A1. **Accept & Schedule** → rename to **Accept Request** → A3.

### A3. Review Documents (`61.png` + **[ISHAAN S1]**)
- Header "Review Documents · Review documents before preparing notice"
- **Case Summary card, ABOVE the documents [ISHAAN S1]:** Client (name, address) · Noticee (name, send methods + details) · Notice type · Issue description (full) · Amount · Key dates (cheque details if Cheque Bounce) · Tier and deadline
- Counter: "N Documents · N Pages"
- **AI Document Summary** (design): bullet facts from the uploaded documents, with "View Full Summary" and "View Source". **[DECIDE]** AI summary is D-41, not built. Proposal: hide this card until it's built, since the Case Summary above covers what the advocate needs.
- Uploaded files: name, pages, size, **View** (viewer) and **Download**
- **Additional Documents?** text box + **Send**: sends a request to the client in the case chat ("Please upload: …"). The client sees it in Messages and on tracking as "Advocate requested more documents", plus an upload button.
- **Continue to Draft** → A4 · Back → A1

### A4. Choose Drafting Method (`67.png`)
- Docket LN-…
- **AI Generate Draft (Recommended):** **[DECIDE]** AI drafting exists for Legal Notice (the AI port is live with Gemini). Proposal: keep it working as built. It fills the editor from the case facts only.
- **Create Draft Manually:** blank template with the facts pre-filled into fields
- **[REMOVE]** "Secured Workflow", "strictly confidential within your firm's encrypted workspace"
- Back → A3

### A5. Draft editor (`62.png` + **[ISHAAN S2]**)
- "Draft Legal Notice · Step 3 of 5 · Document Editor", "Client vs Noticee", AI Assist
- Sections (editable, each with a tick when filled): **1 Sender Details · 2 Recipient Details · 3 Subject · 4 Background & Facts · 5 Legal Demand · 6 Response Time & Closing** (compliance period in days, default 15, fixed closing text)
- **No "Offences" section [ISHAAN S2]**, and the template sentence about offences is removed
- Legalitt AI box: "What would you like to change?" with chips Make more Formal / Fix Grammar / **Generate Draft**
- **Save Draft** · **Preview** (the PDF exactly as the client will see it, on letterhead) · **Continue to Review** → A6
- **Letterhead rule (§1a.1):** blank lines on the printed letterhead (reference number, date, enrollment no.) stay as empty space for handwriting, never `________`.

### A6. Review before sending (Step 4 of 5, no separate design. Uses the Preview)
- PDF preview, plus a checklist the advocate ticks: names and addresses correct · amount correct · demand and days correct
- **Send to Client for Review** → status `sent_to_client` → A7

### A7. Client Review (`65.png` waiting / `66.png` changes requested)
- "AWAITING CLIENT REVIEW · Draft Sent for Review", LN id, Client · Against, Filing type · Status
- Review Progress: Draft Prepared ✓ · Draft Sent to Client ✓ · Client Review (Active) · **Final Approval → change text to "Sent to Legalitt for dispatch"** [ISHAAN 1]
- Draft Sent card: file, size, View Draft
- Message sent to client (editable before sending, default "Please review the draft and let us know if any changes are required.")
- **[REMOVE]** "Delivered via App & Email" (unless email really goes out), "Ready for dispatch"
- **When the client approves:** the design's button "Client Approved → Continue to Final Dispatch" **is removed [ISHAAN 1]**. The screen changes by itself on next open to "Client approved. Sent to Legalitt for dispatch" and links to A8.
- **When the client requests changes (66):** "Changes Requested → Review Client Notes" opens the client's sections, text and attachment, plus **Edit Draft** → A5. Resend → back to A7 (version +1).
- **View Draft** · **Message Client** (case chat) · **Back to Request**

### A8. Submitted to Admin and dispatch status, read-only (`Notice Submitted to Admin.png`, `Notice Dispatch Status.png`, `Dispatch Details.png`, `Html → Body.png "Final Notice Ready"`)
**[ISHAAN 1]** The advocate only watches. No actions except Message Client and Contact Admin Support.
- Summary: client, recipient, notice type, submission time, assigned advocate, final PDF (View)
- **Dispatch Lifecycle** (real, from admin actions): Client Approved · Submitted to Admin · Address Verification · Notice Verification · **Advocate e-Sign** (added) · Ready for Dispatch · Dispatched · Tracking Updated · Delivered
- **E-sign task [ISHAAN 1, DECIDE]:** when the admin reaches "Advocate e-Sign", the advocate gets a notification and a card **"Sign the final notice with Aadhaar e-Sign"**. Tapping it opens the e-sign provider's flow (simulated until integrated: a clearly labelled test step) → back to A8 with "Signed ✓".
- Dispatch details (when dispatched): courier and waybill, or email / WhatsApp sent times, "read-only record"
- **The old "Final Notice Ready → Download, print, Continue to Send via Blue Dart" (`Html → Body.png`) is not used [ISHAAN 1]**, since the advocate no longer prints or posts.
- **[REMOVE]** "Digitally Sealed", "Tamper-sealed", "Secure Protocol", "Client Digital Signature Recorded" (the client approves in-app, which isn't a digital signature), "cross-verified against postal registry", "Verified Courier Dispatch".
- **Back to My Cases** → A1

### A9. Earnings
Once **Delivered**, the advocate's share is credited to the wallet (D-36) as pending payout. Completion view (D-07): "Notice delivered · ₹ added to wallet" → View Earnings.

### A10. Legal Notice Response (`55.png`) [DECIDE]
A letterhead editor titled "Legal Notice Response · Prepare Response". This is for **replying to a notice the client received**, a different job from sending one. **No client screens exist for "reply to a notice".** Proposal: don't build it now. List it as a possible new service (QUESTIONS).

---

## 4. Admin side (no designs. Build in the admin panel style, record in §9.2)
1. **New requests:** paid Legal Notice requests, sorted by deadline, Urgent first. **Assign advocate** (only approved advocates, D-35). The deadline countdown is shown.
2. **Declined by advocate:** the reason is shown → reassign.
3. **Overdue:** cases past deadline − 12 h without "sent to client" → call, extend (with reason, client notified) or reassign.
4. **Approval & dispatch queue [ISHAAN 1]:** client-approved notices. For each one:
   1. **Address / contact verification:** check the address has a PIN, the email format, the WhatsApp number. Mark Verified, or **Ask client to fix** (the client sees a task on tracking).
   2. **Notice verification:** open the PDF. Checklist: names, amount, dates, demand, days. Approve, or **Return to advocate** with a reason (goes back to A5, and the client sees "Being finalised").
   3. **Advocate e-Sign:** request the advocate's Aadhaar e-sign → wait → the signed PDF is stored as the final version.
   4. **Dispatch, per chosen method:**
      - Courier: enter courier name, waybill no., dispatch date. Optionally upload the booking receipt.
      - Email: send from the platform to the noticee (signed PDF attached). Record the sent time. Bounce → mark Failed.
      - WhatsApp: **[DECIDE]** manual for now (admin sends from the business number and marks Sent / Delivered), until a WhatsApp Business API is set up.
   5. **Tracking updates:** add courier status lines (date, place, text). Each one appears on the client's C10.
   6. **Delivered:** enter delivered date / time and received-by, then **upload POD** (required for courier) → case completed → advocate wallet credited.
   7. **Failed:** reason → the client is asked for another address / contact (C12).
5. **Cancellations / refunds** (D-12/13), **support inbox**, **change-round alerts** (> 3 rounds), **client not responding** (> 7 days).

---

## 5. Data
- **Request:** tier (urgent / ordinary) and deadline, notice type, status, sub-status, assigned advocate, price snapshot (base, platform, GST, delivery if courier, pages)
- **Sender (Step 1):** name, father's/husband's name, age, mobile, email, address
- **Noticee (Step 2):** name, type (person / company), through-designation, **send methods** (courier / email / WhatsApp, at least one) and per-method details (address+PIN / email / WhatsApp no.). No relationship.
- **Issue (Step 3):** type, description, amount, key date. Cheque fields when Cheque Bounce.
- **Documents:** slot, file, pages. Identity (masked).
- **Draft versions:** sections 1–6, compliance days, PDF, AI-used flag, created by. **Signed final PDF** after e-sign.
- **Reviews:** client changes (sections, text, attachment), admin returns (reason)
- **Dispatch (per method):** method, status (pending / sent / delivered / failed), courier name, waybill, dispatch date, tracking lines, delivered at, received by, POD file, failure reason
- **E-sign:** requested at, signed at, provider reference (simulated flag)
- **Events:** every change, with actor and time
