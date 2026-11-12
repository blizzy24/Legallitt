# Property Search Report: complete flow

> **Read `ISHAAN-ANSWERS-2026-11-12.md` first. It overrides this file where they differ.**


**Sources:** Figma `Property-Search-Report-Client-Side` (15 screens) and `Property-Search-Report-Advocate-Side` (10 screens).
Tags: **[DESIGN]** · **[DECIDE]** (proposal; questions in `QUESTIONS-ALL-SERVICES.md`) · **[REMOVE]** (D-01).

## 0. The whole journey
```
CLIENT                                  ADMIN                       ADVOCATE
Landing (method + speed) ─ Learn more ─► Why a property search
  ├─ Assistance: Chat / Callback ──────► Support inbox
  └─ Quick Submission
     Request form (details, location, property, duration)
     Review → Payment → Scan & Pay → Success
     Track (6 stages) ─────────────────► assign advocate ─────────► Request details → Accept / Decline
     Chat with advocate ◄──────────────────────────────────────────► Chat (quick prompts: request title deed / EC)
                                                                    Off-platform registry search
                                                                    Report: editor (8 sections) or upload PDF
                                        [DECIDE: admin check?] ◄─── Send report
     Report ready (view / download / share) ◄──────────────────────
                                                                    Sent → wallet
```

---

## 1. Client side

### C1. Landing (`Html → Body → Standalone Mobile App Screen.png`)
- "Know Your Property Before You Invest", why a property search matters (4 ticks), "What does a Property Search Report contain?" → C1a
- Choose how to proceed: Quick Submission / Assistance Service (Request Chat / Callback, service = Property Search)
- **Choose your service speed:** **Ordinary ₹499 · Standard processing** / **Urgent ₹999 · Priority processing**. "Final fee shown before submission."
- **Continue with Quick Submission** → sign in → C2
- **[DECIDE]** Delivery time per speed. Review says "3–5 working days". Proposal: **Ordinary 3–5 working days, Urgent 1–2 working days**, both admin-editable.

### C1a. Why Is a Property Search Report Important? (`Html → Body.png`)
Info page (ownership verification, liabilities, history, informed decision; what the report checks; "Availability of records may vary…", keep that). **[REMOVE]** "Encrypted". **[DECIDE]** The header oddly says "DATA & PRIVACY / Data & Documents". Use "Property Search". Back → C1.

### C2. Request Property Search Report (`Property Search Report 16.png`). Stepper: Your detail · Confirmation · Payment
- Full Name · Mobile Number · Email Address (pre-filled)
- **Jurisdiction & Location:** State* · District* · Ward Number · Tehsil / Village · Colony. The dropdowns are filtered by the parent. **[DECIDE]** We don't have ward / tehsil / colony lists. Proposal: State and District are dropdowns (seeded), the other three are text fields.
- **Property Type*** (`Listbox…png`): Residential · Commercial · Agricultural · Plot / Land · Industrial · Apartment / Flat · Other (Other → "Specify")
- **Survey No. / Plot No. / Khata No.** (text, hint "Accurate numbers avoid sub-registrar title ambiguities")
- **Search Duration:** 15 Years · **30 Years (recommended, default)** · Full Record. **[DECIDE]** Does Full Record cost more? (QUESTIONS)
- **[DECIDE] Missing from the form, but needed by the review screen and the advocate** (advocate `02.png` shows them):
  - **Full property address*** (the review shows "Property Location")
  - **Purpose of report*** (Buying / Selling / Loan / Investment / Other)
  - **Current owner name(s)** (optional, "if known")
  - **What do you want checked?** (text, optional. The advocate screen shows the client's requirement in their own words.)
  - **Documents** (optional: previous sale deed, EC, tax receipt, Khasra copy). Same uploader with the Document Viewer and the 25-page rule.
- **The design's form has no button.** Add **Continue** → C3. Back → C1 ("Save draft?").

### C3. Review Request (`Property Search Report 03.png`)
Name · mobile · email · property location · property type · purpose · search duration · speed · **Estimated delivery** (from speed) · documents count. **Edit** → C2. **Proceed to Payment** → C4.

### C4. Payment (`Property Search Report 04.png`, `Documents Forensic 29 / 33.png`)
Service summary (location, type, estimated delivery), then the price rows by our rule (base = speed price, + platform 25%, + GST, + extra pages), then the payment methods (simulated). Scan & Pay ("Property Search Report", **not** "Legal Notice"). Success (real `PSR-YYYY-NNNN`) → **Start Tracking** → C5.

### C5. Track Your Request (`Property Search Report 06.png`)
- Request ID, status chip
- **Progress Timeline:**
  1. Request Submitted
  2. Payment Received
  3. Verification in Progress (**[DECIDE]** = admin checks that the details are enough. If not, the client gets "We need more details" with an Edit button.)
  4. Assign Advocate (+ **View Profile** once assigned)
  5. Report Preparation
  6. Report Delivered
- **Contact Support** · **Chat with Advocate** (once assigned) → C6
- Due date shown ("Expected by <date>")

### C6. Advocate profile and chat (`Html → Body (1).png`, `Html → Body (2).png`)
- Profile: real data only (D-02), linked request card "Advocate Assigned", **Chat with Advocate**
- Chat: request header (ID, status), messages, attachments. The advocate's quick-request chips appear to the client as a message with an **Upload** button.
- **[REMOVE]** "Bar Council Verified" (unless D-35), "100% Track Record", "N audits", "legally privileged, encrypted", "End-to-end encrypted", "protected under Section 126 of the Indian Evidence Act" (that Act was replaced by the Bharatiya Sakshya Adhiniyam in 2024, and it isn't our promise to make anyway)

### C7. Report delivered (`Documents Forensic 37.png`)
"Report Ready" (**fix** the design text "Analysis Completed… analysis report"). Request ID (the design shows a `DF-` id, fix it to `PSR-`), status Completed. **View Report** (Document Viewer) · **Download PDF** · **Share Report** (phone share sheet with the file) · **Back to Home**. The advocate's note to the client appears above the buttons. The report also goes into My Documents.
- **[DECIDE]** Can the client ask questions or request a correction after delivery? Proposal: yes, through the chat for 7 days. A correction means the advocate re-sends v2.

### C8. Edge cases [DECIDE]
- Records not available at the registry: the advocate sends a report saying so. **Refund? (QUESTIONS)**
- Wrong details from the client: the advocate requests correction in chat. The due date pauses until the client answers.
- Cancellation (D-12): before acceptance → full refund. After acceptance → admin decides. After delivery → no.

---

## 2. Advocate side

### A1. Cases list (`01.png`, `83.png`)
Card: PROPERTY SEARCH · client · property type · city · PSR id · status (New / Accepted / Searching / Report draft / Sent) · last note · due date. **Review Request** → A2.

### A2. Property Search Details: new request (`02.png`)
- Docket, status "Request Pending", "Review client facts and documents below to conduct off-platform registry search"
- Client information: name, role (Buyer…), phone / email **masked until acceptance** [DECIDE]
- Property details: address, Khasra / Survey, plot no., village / sector, tehsil, district, state, type
- Owner details (from the client, if given)
- Client's requirement and scope (verbatim), submitted date
- Documents provided (View)
- **Payment:** "You receive ₹<base>". **[REMOVE]** "Client Paid ₹4,500 / Escrow Secured / Held securely in Legalitt Escrow / Released automatically".
- **Accept** → A3 · **Decline** (missing from the design, add it: reason → admin reassigns)

### A3. Accepted (`03.png`)
The same details with status Accepted. Actions: **Chat with client** · **Request documents** (quick prompts: Title Deed / EC Certificate / Tax Receipt / Khasra copy) · **Prepare report** → A4 (editor) **or** **Upload report PDF** → A5.

### A4. Report editor (`Html → Body.png`, "Step 3 of 5 · Report Editor")
Sections, each editable with a filled tick:
1. **Client Details** (pre-filled)
2. **Property Details** (pre-filled + total area)
3. **Owner Details** (current owner, father's name, owner type, ownership period, previous transferor)
4. **Documents Checked** (list: name, registration no., office, ✓ checked. **+ Add Document Record**)
5. **Search Details** (search date, period, records inspected, registry office, notes)
6. **Ownership History** (text)
7. **Search Findings** (ownership / loan or charge / court case / property tax, each with a short line)
8. **Search Conclusion: Title Clearance Opinion** (text)

- **Legalitt AI writing assistant:** improves wording only, never changes facts (keep, it's built on the AI port). Apply / Keep Original per suggestion.
- **Final advocate sign-off:** checkbox "I have personally checked these records" → enables Generate PDF
- **Preview** → PDF on letterhead → **Continue** → A6
- **[REMOVE]** "Factual records remain immutable by automation", "Bar Council Compliant Workflow", "Certification Pending" → "Sign-off pending"

### A5. Upload Property Search Report (`04.png`), the alternative to the editor
Upload the final PDF (PDF only, ≤ 25 MB): View / Replace. **Add note for client** (optional, ≤ 300). Payment line: "You'll receive ₹<base>". **Continue** → A6.

### A6. Send Report (`05.png`)
- Client, property, report document (View)
- Message to client (≤ 300, default text)
- **Delivery channels:** Legalitt App (always on) · Email copy (optional, to the client's registered email)
- **[REMOVE]** "Digitally Signed" (unless e-signed), "Verified Identity", "encrypted download access", "triggers escrow release"
- **Send Report to Client** → **[DECIDE]** Should a Legalitt admin check property reports before the client gets them, like Document Forensic and FIR? The design sends directly. Proposal: **send directly** (as designed) until Ishaan sir says otherwise.
- → A7

### A7. Report sent (`06.png`)
"Report sent. ₹<base> will be added to your wallet once delivered" → wallet (D-36). **Back to Home**. **[REMOVE]** "Escrow Protected", "automatically credited to your bank account".

### Unused: `25.png` (Legal Notice Response template titled "Property Search Report")
It's a copy of the Legal Notice letterhead. **[DECIDE]** Not used. The report uses the A4 editor.

---

## 3. Admin side (no designs)
1. **New requests:** verify details are sufficient (C5 stage 3) → **Assign advocate** (approved advocates covering that district) or **Ask client for more details**
2. Declined → reassign. Overdue against the speed deadline → alert / reassign.
3. (If Ishaan sir wants it) **Report check** before delivery: approve / return with reason.
4. Refund decisions for "records not available" and cancellations.

## 4. Data
Request (speed, due date, status, advocate, price snapshot) · location (state, district, ward, tehsil / village, colony, full address) · property (type, survey / plot / khata, area) · purpose · duration (15 / 30 / full) · owners (if given) · client requirement · documents · report (editor sections 1–8 or uploaded PDF, version, note to client, channels, sent at) · chat · events.
