# FIR Draft: complete flow from the designs

**Source:** the designs in `design/`. Client: 40–49 and 129. Advocate: 213–220 and 449. ID verification: 92–100.
**Updated 11 Nov, 22:30** with the Figma exports `FIR-Draft-Client-Side` and `FIR-Draft-Advocate-Side`. The advocate exports are identical to 213–220 and 449. The client export adds **new versions of the landing page (40) and Step 1 (42)**, plus **9 screens we didn't have**: Request Callback, Support Chat, Payment, Scan & Pay, Payment Success, Approve / Request Changes on Draft Ready, Request Changes, Change Request Submitted, and FIR Draft Approved. Copy them into `design/client/fir-draft/` as F1–F9 (names in each section below).
Each screen below lists what's on it, what every button does, what Back does, and what data the backend must provide.

Tags used:
- **[DESIGN]**: taken directly from the design.
- **[DECIDE]**: the design doesn't cover this. My proposal is written next to it, and you or Ishaan sir confirm or change it.
- **[REMOVE]**: a false claim in the design. Leave it out (per D-01).

---

## 0. The whole journey on one page

```
CLIENT                                   ADMIN                     ADVOCATE
------                                   -----                     --------
Home / All Services
  └─ FIR Draft landing (40)
       ├─ Learn more ─► Why FIR (41)
       ├─ Start Quick Submission
       │    Step 1 Basic + jurisdiction (42)
       │    Step 2 Incident (43)
       │    Step 3 People (44)
       │    Step 4 Documents (45)
       │    Step 5 Review (46)
       │    Payment (F3) → Scan & Pay (F4) → Success (F5)
       │    Submitted (47) ───────────► New FIR request
       │                                  assigns advocate ─────► Cases list (214)
       │                                                           Request details (215)
       │                                                    ◄───── Reject (returns to admin)
       │                                                           Accept ─► Review docs (216)
       │                                                           Draft generator (217)
       │                                                           FIR proforma editor (218)
       │                                  approves draft ◄──────── Send for review
       │                                  or returns ─────────────► (fix and resend)
       │    Draft ready (F6) ◄────────────┘
       │      Approve ─► FIR Draft Approved (F9) ────────────────► Approved (219) → [police step?] → Completed (220)
       │      Request For Changes ─► Request Changes (F7)
       │                             ─► Change Request Submitted (F8) ─► FIR Review: Changes (219)
       └─ Assistance Service
            ├─ Request Chat ─► Support Chat (F2) ──────► admin Support inbox
            └─ Request Callback ─► Request a Callback (F1) ─► admin Support inbox
Status (48) is reachable any time from My Requests / Track Request.
```

---

## 1. Client side

### C1. FIR Draft landing (Figma version, replaces design 40)
**How you get here:** Home → service tile, All Services → FIR Draft, or a search result.

**On screen [DESIGN]**
- Header "FIR Draft Service", Back arrow, (i) info icon
- Hero: "Get Help With Your FIR Draft" plus a short description and an illustration
- "Why Use This Service?": 4 cards (Clear Incident Details, Legal Drafting Support, Supporting Documents, Review & Track), then a "Learn more" link
- "Choose How You Would Like To Proceed": two **selectable cards** (radio)
  - Tag "DO IT YOURSELF": **Quick Submission**, "Fill in your incident details step by step and submit your request." Link: **Continue with Quick Submission →**
  - Tag "GET EXPERT HELP": **Assistance Service**, "Explain your problem in your own words and our team will contact you." Two buttons: **Request Chat** and **Request Callback**
- Disclaimer box: "Legalitt provides legal drafting and advisory assistance; this does not constitute police FIR registration or guaranteed outcome." Keep this. It's honest.
- Footer "256-bit Encrypted • Confidential Legal Assistance" **[REMOVE "256-bit Encrypted"]**

**Buttons**

| Tap | Goes to |
|---|---|
| Back | Wherever the user came from (Home, All Services or search) |
| (i) or Learn more | C2 Why FIR |
| Tapping a card | Selects it (radio). It doesn't navigate on its own. |
| Continue with Quick Submission | C3 Step 1. If not signed in: sign in, then return straight to Step 1 |
| Request Chat | **F2 Support Chat**, with "Regarding: FIR Draft Service" at the top. Creates or opens the client's support thread in the admin Support inbox. |
| Request Callback | **F1 Request a Callback**, with the service set to "FIR Draft" |

### C1a. Request a Callback (F1, Figma `162.png`)
- Box "Need a little help? Our Legal Support Team will contact you…"
- Fields: **Full Name***, **Mobile Number*** (+91), both pre-filled from the profile
- Note "Our team will review your request and contact you in 24 hours". **[DECIDE]** Proposal: take the hours from the support-hours setting.
- **Request Callback →** creates a callback ticket (service = FIR Draft) in the admin Support inbox, then shows the existing "submitted" state. Back → C1.

### C1b. Support Chat (F2, Figma `163.png`)
- Header "Legal Support · Legalitt Support Team". Bar "Regarding: FIR Draft Service · Non-Advocate Chat"
- Welcome message, quick-question chips (What documents do I need? / How does the process work? / I need help choosing a service / I have a question), message list, attachment, send
- **[REMOVE]** "Available to assist" (green dot), since we have no presence. The mic only works if speech-to-text works, otherwise hide it.
- The same thread appears under **Messages → Support** (D-28). Admin replies from the Support inbox.

**Not used for FIR:** Figma `164.png` "Select Date & Time" (30-min consultation, ₹999). That's the Legal Advice booking screen. **[DECIDE]** Confirm it doesn't belong to FIR.

**Backend needs:** FIR service record (name, active flag) and the current price (shown later at payment).

---

### C2. Why a proper FIR draft is important (design 41)
**On screen [DESIGN]**
- 5 explainer cards
- "How Legalitt Can Help: Step 1 to 4" (Submit Request → Information Collection → FIR Draft Preparation → PDF Delivered)
- "Estimated turnaround: 12–24 Hours, Standard Review"
- Button **Send a FIR Draft →**

| Tap | Goes to |
|---|---|
| Back | C1 landing |
| Send a FIR Draft | C3 Step 1 |

**[DECIDE] Turnaround mismatch:** design 41 says **12–24 hours**, but designs 47 and 48 say **24–48 hours**. Proposal: use one value from the service settings (admin-editable) everywhere. Default 24–48 hours.

---

### C3. Step 1 of 5: Quick Submission (Figma version, replaces design 42)
Progress "STEP 1 OF 5 · 20% Completed". Three cards.

**Fields [DESIGN]**

| Card | Field | Required | Notes |
|---|---|---|---|
| Your details | Full Name | Yes | Pre-fill from the profile |
| | Mobile Number | Yes | +91 selector. Pre-fill from the profile |
| | Email Address | Optional | Pre-fill from the profile |
| | Incident Type | Yes | Dropdown, plus quick chips: Theft, Fraud, Assault, Harassment, Property Dispute, Cyber Crime, Other. Tapping a chip fills the dropdown. |
| **Place of Incident** ("Where did the incident take place?") | Address / Place | Yes | Multi-line: "Building, Street, Landmark" |
| | Use current location | Optional link | Fills address, city and PIN from the phone's location, after the browser asks permission. If permission is refused or location fails, show "Couldn't get your location. Please type the address." |
| | City | Yes | Dropdown |
| | PIN Code | Optional | 6 digits |
| **Jurisdiction Details** | State | Yes | Dropdown |
| | District | Yes | Dropdown, filtered by State |
| | Police Station | Yes | Dropdown, filtered by District |

**[REMOVE]** The small label "Primary Evidentiary Site" next to Address. It's legal jargon with no meaning here.

- Footer note "Your details are encrypted and shared only with authorized legal drafting counsel." **[REMOVE "encrypted"]** Keep "shared only with your assigned advocate and Legalitt admin".

| Tap | Result |
|---|---|
| Continue | Validates. Errors appear under each field. Saves as a draft request, then goes to Step 2 |
| Back | **[DECIDE]** Proposal: if anything was typed, ask "Save as draft and leave?" with the options Save draft / Discard / Stay. The draft appears under My Requests as "Draft – not submitted". |

**Backend needs**
- Lists of states, districts and police stations. **[DECIDE]** We don't have a full police-station list. Proposal: seed MP (Indore, Bhopal and others) properly, and for other places allow "Type police station name" as free text.
- A draft FIR request that can be saved and resumed at every step.

---

### C4. Step 2 of 5: Incident Details (design 43)
**Fields [DESIGN]**

| Field | Required | Notes |
|---|---|---|
| Incident Date | Yes | Can't be in the future |
| Incident Time | Yes | |
| Incident Location | Yes | **Pre-filled from Step 1's Place of Incident** (address, city, PIN), editable. Step 1 now collects the place, so this mustn't ask again from blank. |
| Competent Police Station | Yes | **Pre-filled from Step 1**, editable, with the note "Pre-filled from basic details jurisdiction. You can edit if different." |
| What Happened? | Yes | Free text, **max 2,000 characters**, with a live counter "0 / 2,000" and a **Dictate statement** mic button |
| Additional Details | Optional | Witness names, vehicle numbers, transaction IDs, demands made |

- Note: "Your statement will be structured into formal FIR paragraphs by your assigned legal drafting advocate under relevant BNS sections." Keep this.

| Tap | Result |
|---|---|
| Continue | Saves, then goes to **Step 3 People**. **[DECIDE]** The design's button says "Continue to Evidence & Documents", but the next step is People. Proposal: label it "Continue to People Involved". |
| Back (arrow or text link) | Step 1, with everything kept |
| (?) help | Help Center, FIR section |
| Dictate statement | **[DECIDE]** Proposal: use the browser's or phone's speech-to-text where available. Where not, hide the button. Never show a button that does nothing. |

---

### C5. Step 3 of 5: People Involved (design 44)
**Complainant card [DESIGN]:** "Primary (You)" badge and **Edit**. Shows Full Name, Contact (with a tick if the mobile is verified at sign-in) and Registered Residence.

**[DECIDE]** The FIR proforma (218) also needs **Father's/Husband's name, Age, Gender and Occupation**, and none of the client steps collect them. Proposal: the complainant **Edit** sheet asks for Full Name, Father's/Husband's Name, Age, Gender, Occupation and Address (all required before Continue). The card then shows them.

**Accused / Opposite Party [DESIGN]**
- Count badge ("1 Added")
- Each card shows name or description (e.g. "Unknown Caller / Impersonator"), a "Primary Accused" tag on the first, phone, alias, and **Remove** / **Edit Details**
- **+ Add Accused / Opposite Party** opens a sheet: Name (or tick "Unknown"), Phone (optional), Alias / description (optional), Address (optional), Primary yes/no
- At least one accused is required, and "Unknown" counts

**Witnesses [DESIGN]**
- Count badge
- Each card shows name, tag (e.g. Key Witness), relation (e.g. Eyewitness / Colleague), phone and note (e.g. "Present during call"), with **Edit Statement Note**
- **+ Add Witness** opens a sheet: Name, Relation, Phone (optional), Note (optional)
- Witnesses are optional. Show the empty state "No witnesses added. Add anyone who saw the incident."

| Tap | Result |
|---|---|
| Continue | Goes to **Step 4 Documents**. The design label "Continue to Evidence & Documents" is correct here. |
| Back | Step 2, with everything kept |
| Remove | Confirm "Remove this person?", then remove |

---

### C6. Step 4 of 5: Documents & Evidence (design 45)
**Upload slots [DESIGN]**

| Slot | Required | Accepts |
|---|---|---|
| 1. Primary Documents (agreements, notices, receipts, stamps) | **Required** | PDF, images |
| 2. Scene Photos & Video | Optional, max 5 | JPEG, PNG, MP4, up to 50 MB each |
| 3. Digital Communications (WhatsApp logs, emails, SMS) | Optional | PDF, images |
| 4. Ancillary / Other Records (audio, bank statements, affidavits) | Optional | PDF, images, audio |
| + Add Custom Category Slot | Optional | User names the slot |

- Each file row: name, size, **View** (eye) and **Delete** (bin, with confirmation)
- Note: **"₹25 per page for every page above 25 pages."** The page count runs across all files, and the charge shows at payment.
- Summary box: files staged and total size

**[REMOVE]** "VERIFIED", "SHA-256 Validated", "Timestamp Verified", "Evidentiary Chain of Custody – Compliant", "AES-256 Cipher", "256-bit Encrypted Legal Draft Session". Show only: file count and total size.

**[DECIDE] ID proof (Aadhaar).** Ishaan sir said the FIR needs the client's Aadhaar, collected during the application. The KYC designs (92–100: DigiLocker and Video KYC) need paid government integrations we don't have (D-40). Proposal: add **"5. Identity Proof (Aadhaar or other government ID): Required"** as a slot in this same step, using the same component. Once uploaded, the number is shown masked everywhere (XXXX-XXXX-1234). Never call it "KYC Verified".

| Tap | Result |
|---|---|
| Continue Draft | Blocked until Primary Documents and ID are uploaded, with the reason shown next to each missing slot. Then goes to Step 5 |
| Back | Step 3, with uploads kept |

---

### C7. Step 5 of 5: Review & Submit (design 46)
**Four summary cards [DESIGN]**, each with a link back to its step:

| Card | Shows | Link → |
|---|---|---|
| Basic Details | Complainant name, mobile, email | Edit → Step 1 |
| Incident Details | Date and time, location / police station, statement (first lines, "Show more") | Edit → Step 2 |
| People Involved | "1 Complainant (Self)", "N Suspects / Accused", witnesses count | View / Edit → Step 3 |
| Documents & Evidence | Each file with a type badge (PDF/IMG/DOC) and size, plus a total count | Manage → Step 4 |

- Declaration: "By submitting, you confirm that the information provided is accurate and truthful to the best of your knowledge." Keep this. **[REMOVE]** "Verified KYC", "Legal Privilege Protected", "SHA-256 Validated • End-to-End Encrypted".
- After editing a step from here, Continue returns **straight to Review**, not through the remaining steps.

| Tap | Result |
|---|---|
| Proceed To Pay | Payment |
| Back | Step 4 |

---

### C8. Complete Payment (F3, Figma `Documents Forensic 20.png`)
**On screen [DESIGN]**
- Service card: "FIR", Ref ID (the real request ID)
- Price rows, then **Total Payable** and "Inclusive of all legal taxes"
- **Select Payment Method:** UPI (Recommended), with sub-options **Pay via UPI App** and **Scan QR Code**, plus **Cards** and **Net Banking**
- Note "Your payment is processed securely through our payment provider." Keep it, since it'll be true with Razorpay. Until then, add a small "Test payment, no money is charged" label (§2.11). **[REMOVE]** "Fast & Secure".
- Bottom bar: Amount to pay and **Pay →**

**Price rows: use our pricing rule, not the design's sample numbers** (the design shows ₹999 + GST ₹179 + platform ₹199 = ₹1,377, which is placeholder maths):
- Service fee (base, the advocate's share)
- Platform fee (25% of base)
- GST 18% on (base + platform fee)
- Extra pages × ₹25 (no GST), shown only if there are more than 25 pages
- **Total Payable**

No delivery charge, because an FIR has no courier.

| Tap | Result |
|---|---|
| Pay with Scan QR Code selected | F4 Scan & Pay |
| Pay with UPI App / Cards / Net Banking | Simulated: shows the same "processing" state, then F5. Once Razorpay is live, its own screens open here. |
| Back | Step 5 Review. The request stays as an unpaid draft. |

### C8a. Scan & Pay (F4, Figma `Documents Forensic 21.png`)
- "Scan to Pay", **QR valid for 10:00** (a real countdown), QR code, amount, **service name "FIR Draft"** (the design wrongly says "Legal Notice"), "Waiting for payment…", UPI app names
- "Prefer another method?" → **Pay using UPI App**
- Simulated until Razorpay: a clearly labelled **"Simulate successful payment"** button for testing, never automatic on a timer (§2.12)
- When the QR expires: "QR expired" with **Generate new QR**
- Back → F3

### C8b. Payment Successful (F5, Figma `Documents Forensic 32.png`)
- Request ID with Copy (the real FIR ID; the design shows "PSR…", which is a placeholder)
- Card "Payment Successful. Your payment of ₹<total> has been received." and "**Your FIR draft request has been submitted.**" (the design wrongly says "forensic analysis")
- **Start Tracking →** goes to C9 Request Submitted. **[DECIDE]** Proposal: F5, then C9 (47), then C10, each moved on by a tap. That way both designed screens are used.
- Back arrow → Home (never back into payment)
- Payment fails: stay on F3 with "Payment didn't go through. You haven't been charged." and **Try again**

---

### C9. Request Submitted (design 47)
**On screen [DESIGN]**
- Tick icon, "Request Submitted Successfully" and a description
- **Request ID**, real (e.g. `FIR-2026-0012`), with a **Copy** button
- Current Status: badge "Submitted", "Your request is now under review", submitted time (real), turnaround (from settings)
- Footer **[REMOVE]** "Your information is encrypted • Bar Council Compliant"

| Tap | Result |
|---|---|
| Track Request | C10 Status |
| Back To Home | Home |
| Back arrow | Home. **Never back into payment.** |

---

### C10. FIR Draft Status (design 48)
**How you get here:** Track Request, My Requests → this request, or a notification.

**On screen [DESIGN]**
- Status badge, title, Request ID with Copy
- Request Details: Type, Submitted On, Current Status, Estimated Turnaround
- **"What happens next?"** timeline, highlighting the current stage:
  1. Request Submitted
  2. Information Review (sub-note "Drafting team assigned" once an advocate is assigned)
  3. Draft Preparation
  4. Awaiting Your Approval
  5. Draft Ready
- "Need to update something?" → **Contact Legalitt Support**
- Share icon
- **[REMOVE]** "Verified Draft", "We'll notify you via SMS" (we have in-app only), "256-bit encrypted folio", "Bar Council Compliant". **[DECIDE]** The design header says "Stage 2 of 4" with 5 rows. Proposal: show 5 stages and "Stage N of 5".

**Mapping from backend status to stage** (so all three apps agree):

| Backend status | Client sees stage |
|---|---|
| submitted / awaiting assignment | 1 Request Submitted (done), 2 Information Review (active) |
| assigned, accepted, reviewing documents | 2 Information Review (active, "Drafting team assigned") |
| drafting, sent back by admin | 3 Draft Preparation (active) |
| awaiting admin approval | 3 Draft Preparation (active). The client doesn't see the admin step. |
| sent to client | 4 Awaiting Your Approval (active) → opens C11 |
| client requested changes | 3 Draft Preparation (active, note "Advocate is updating your draft") |
| client approved / completed | 5 Draft Ready (done) |

| Tap | Result |
|---|---|
| Contact Legalitt Support | Contact Support with this request pre-filled |
| Share | Phone share sheet with the request ID and status text. No document link. |
| Back | Wherever the user came from |

---

### C11. Your FIR Draft Is Ready (F6, Figma `Html → Body (7).png`, replaces design 49 when a decision is due)
**On screen [DESIGN]**
- Badge "Draft Ready" and the title "Your FIR Draft Is Ready"
- Request ID with Copy
- "Finalized Draft Dossier": PDF card `FIR_Draft_<ID>_v<N>.pdf` with real size, an eye button (View), and **Download PDF**
- Request Progress, "Stage 4 of 4": Request Submitted ✓ · Information Reviewed ✓ · FIR Draft Prepared ✓ · **Ready for Your Review (ACTIVE)**
- "Please review your draft carefully" box with the Statutory Notice, kept as written: it becomes an official FIR only when the SHO registers it
- **Two buttons: Approve → and Request For Changes**
- **[REMOVE]** "BNSS Compliant", "Certified", "compiled and certified", "IPC" in "mapped under BNSS / IPC" (BNS only).

Design 49 (with "View FIR Draft" and "Back to Dashboard" instead) is the same screen when no decision is pending. Use it after approval, or while changes are being made.

| Tap | Result |
|---|---|
| Eye / View | Document viewer with the PDF |
| Download PDF | Downloads the real PDF |
| Approve → | Confirm "Approve this FIR draft? Your advocate will be notified." → status "client approved" → **C14 FIR Draft Approved** |
| Request For Changes | **C12 Request Changes** |
| Back arrow | Wherever the user came from. The decision stays pending. |

### C12. Request Changes (F7, Figma `Html → Body (9).png`)
**On screen [DESIGN]**
- Label "Draft Revision Request", title "What Changes Are Needed?" and an explanation
- PDF card: file name, request ID, badge "Awaiting Review"
- **Select Section*** ("Tap to pick"). Chips, **more than one allowed**: Complainant Info · Incident Details · Date, Time, Place · People Involved · Missing Data · Other Clarification
- **Describe Required Changes***: text, **max 600 characters**, counter "0 / 600", hint "Please be as specific as possible"
- **Supporting Attachment (Optional):** one file, PDF / JPG / PNG, up to 10 MB, with a **Remove** link. **[REMOVE "Encrypted"]**
- **Submit Change Request →** and **Cancel & Return**

| Tap | Result |
|---|---|
| Submit Change Request | Needs at least 1 section and some text. Saves the review (sections, text, attachment) → status "client requested changes" → **C13** |
| Cancel & Return / Back | C11, with nothing saved. If text was typed, ask "Discard your changes?" |

### C13. Change Request Submitted (F8, Figma `Html → Body (10).png`)
**On screen [DESIGN]**
- Tick, badge "Changes Under Review", title "Change Request Submitted Successfully" and a description
- Card: Request Type "FIR Draft Revision", Draft Reference ID with Copy, the PDF with "Status: Awaiting Revision", "Selected Sections for Review" chips (what the client picked), "Submitted: <real time>"
- **What Happens Next?** 1 Change Request Submitted ✓ · 2 Legal Team Review · 3 Updated Draft Released
- **[REMOVE]** "logged securely", "Securely recorded on ledger", "Logged & Dispatched", "securely transmitted". Keep the plain version: "Your notes and attachments have been sent to your assigned advocate."
- **Back to FIR Request →** → C10 Status · **Go to Home** → Home · "Need to add more details? **Contact Support**" → Contact Support with this request pre-filled
- Back arrow → C10 (never back into the form)

### C14. FIR Draft Approved (F9, Figma `Html → Body (8).png`)
**On screen [DESIGN]**
- Green tick, title "FIR Draft Approved Successfully", "You have approved your legal draft."
- **Advocate card:** real photo or initials, name, "Assigned Lead Legal Counsel", and a **Chat** button (opens this case's chat thread). **[REMOVE]** the verified tick and online dot, unless the advocate is admin-verified (D-35).
- **Reference Details:** badge "Approved", FIR Request ID with Copy, PDF (name, real size) with download, "Recorded: <real time>"
- **What Happens Next?:** Draft Authorization ✓ · Advocate Final Endorsement (Active) · Police Station Submission
- Statutory Notice box
- "Questions regarding your filing? **Contact Support**" · **Back to Home →**
- **[REMOVE]** "Verification Confirmed", "electronic authorization formally recorded on the ledger", "Signed & Certified", "E-SIGNED", "biometric sign-off", "affixing statutory bar credentials".

**[DECIDE — MOST IMPORTANT] Who takes the FIR to the police?** The designs on **both sides** say the **advocate** does it after the client approves:
- F9: "Formal police registration will be carried out by your assigned advocate team within 24 hours"
- 219: timeline "Submitted to Police — Final dispatch & receipt"
- 220: "FIR Submitted Successfully"

My earlier flow assumed the client goes to the police station. **This is a real service promise, so Ishaan sir must confirm it.**
- **If yes, the advocate submits:** after the client approves, the advocate's A6 shows **"Mark as submitted to police"** with an upload for the police receipt or acknowledgement (required) and the date. Only then is the case complete (A7), the client's timeline ticks "Police Station Submission", and the receipt appears in the client's documents. **No design exists for the advocate's "mark submitted" step.** Build it from existing components and record it in §9.2.
- **If no, the client submits:** F9's last two rows become "Download your approved draft" and "Submit it at <police station>", the notice says the client submits it, and 219/220 drop the police row.

Until confirmed, **build the "if yes" version but keep it behind one setting**, so it can be switched without rework.

---

## 2. Advocate side

### A1. Cases list, FIR filter (designs 213, 214)
**On screen [DESIGN]**
- Header Cases, search, profile
- Counters: **Active / Upcoming / Completed** (real counts)
- Search "client, case, service or case ID"
- Status chips: All · Active · Upcoming · Waiting for Client
- Service chips: All Services · Legal Notice · **FIR Draft** · Property Search …
- "Your Matters (N active)", sort "Recent First"
- **Card:** service tag "FIR DRAFT", priority tag "ORDINARY", **client name · incident type**, request ID · **Fee: ₹ advocate share**, status chip (e.g. "Draft Preparation"), last note ("Client information reviewed."), "Updated: <time>", and an action button whose label depends on status:

| Status | Button |
|---|---|
| New / assigned | Review Request → A2 |
| Accepted | Review Documents → A3 |
| Drafting / admin returned / client changes | Continue Draft → A5 |
| Awaiting admin / awaiting client | View Status → A6 |
| Completed | View → A7 |

- Empty state (no FIR cases): "No FIR requests yet. New requests assigned to you will appear here."
- Bottom nav: Home · Cases · Clients · Wallet

---

### A2. FIR Request Details (design 215)
**On screen [DESIGN]**
- Badge "New Request", received time, FIR Request ID, police station
- **Client Details:** name, city, mobile, email **[REMOVE "KYC Verified"]**
- **Incident Overview:** incident type, date and time, location
- **Client's Statement** (verbatim)
- **Fee Structure:** "Advocate will receive ₹X". **[DECIDE]** The design shows "Client Retainer Fee ₹3,500 − Legalitt Service Fee ₹500". Proposal: show only **"You will receive ₹<base>"** from the price snapshot, since our platform fee is added on top for the client, not deducted from the advocate. **[REMOVE]** "Escrow Protected • Direct Bank Transfer upon acceptance".
- **Documents (N files):** each with name, size, type and View. **[REMOVE "All Verified", "Signed"]**. The ID shows as "Identity Proof (masked)".
- Note "Review documents thoroughly before accepting this request."

| Tap | Result |
|---|---|
| Accept Request | Confirm → status accepted → A3 |
| Reject | Opens a reason box (required) → case **returns to admin** for reassignment ("Reject → Returns to Admin") → advocate goes back to A1 |
| View (document) | Document viewer |
| Back | A1 |

---

### A3. Review Documents (design 216)
**On screen [DESIGN]**
- Banner "Request Accepted. Please review the documents before drafting."
- **Client** card with initials, name, mobile and city **[REMOVE "Verified Client"]**
- **Client Documents (N files):** name, real page count, size, **View**
- **Client Information:** Incident Date, Incident Place, People Involved (e.g. "Rahul Sharma (Complainant), Vikram Singh & 2 others (Accused)")
- **Client's Description**, labelled "Original text from client"

| Tap | Result |
|---|---|
| Continue to FIR Draft | A4 generator |
| Back | A1 (the case stays "Accepted") |

---

### A4. FIR Draft Generator (design 217)
**On screen [DESIGN]**, all pre-filled from the client's answers
- Badge "Ready to Create"
- Complainant Details: name, father's/husband's name, address, mobile
- Incident Details: date, time, place, police station
- People Involved (count), with **+ Add Person**
- What Happened?: the client's text, editable, with a character count
- Other Information: advocate's extra notes
- Documents (count) → **View Documents**
- **Create FIR Draft** box with "Important AI Rules" (only uses case facts, never invents, can't change the client's facts, advocate must review)

| Tap | Result |
|---|---|
| Generate with AI | **[DECIDE]** FIR AI generation is D-08, not built yet. Until it's built: show the button disabled with "AI drafting is coming soon. Use Create Manually." Once built: it fills the proforma (A5) from the case facts only. |
| Create Manually | A5 proforma, pre-filled with the client's facts (no AI) |
| Back | A3 |

---

### A5. FIR proforma editor (design 218)
**Header:** "Workspace / Fir Draft" with icons for outline, preview (eye) and save-checkpoint.
- Status "Draft Ready" and "Auto-saved N min ago"
- Docket card: request ID and police station
- Banner (only if AI was used): "AI Draft — Please Review. All facts from your client intake are filled below."

**The proforma: "FIRST INFORMATION REPORT — FORM I — Police Information Proforma, under Section 173 BNSS"**
**[DECIDE]** The design header says "Madhya Pradesh Police State Command". That makes it look like a police document. Proposal: header "FIR DRAFT — prepared for submission at <police station>", with the state taken from the case. Never imply a police office prepared it.

| # | Section | Fields (all editable) |
|---|---|---|
| 1 | Police Station & Filing Time | Police Station · District & State · **FIR Number: left blank, filled by police** (§1a.1: show as an empty box on screen, a blank line in the PDF, never `____` text) · Report Received Date & Time (blank in the PDF, police fill it) |
| 2 | Complainant / Reporter Info | Full Legal Name · Father's Name · Age & Gender · Occupation · Address · Phone & Email · Official ID Document (**masked**, e.g. Aadhaar XXXX-XXXX-4812) |
| 3 | When and Where It Happened | Date & Time · Place · Distance from Police Station (advocate fills, optional) |
| 4 | Accused Person(s) | Main accused name · Others involved · Vehicle used · Suspected reason / motive · **+ Add Accused / Person** |
| 5 | Applicable Legal Sections | Chips like "BNS 308(2)", each with × to remove, plus **+ Add Legal Section** (search list). **[DECIDE]** The design shows old IPC numbers next to BNS. Proposal: BNS only, since IPC was replaced in July 2024. |
| 6 | Statement of Facts | Full letter-style text ("To, The Station House Officer, … Respected Sir, …"), word count, Edit text |
| 7 | Witnesses | Witness 1…N, **+ Add Witness** |
| 8 | Attached Documents | Each client file with a checkbox (include in the dossier or not) and View; "N Included"; **+ Attach Additional Document** |

| Tap | Result |
|---|---|
| Save Draft | Saves a new version, shows "Saved" |
| Send to Client for Review | **[DECIDE]** Per Ishaan sir, the admin approves an FIR before the client sees it. Proposal: the button reads **"Send for Review"**. It validates the required fields (name, police station, date, place, at least 1 section, statement), generates the PDF, sets the status to "awaiting admin approval", then goes to A6. |
| Preview (eye) | Shows the PDF exactly as the client will see it |
| Back | Asks "Save changes?" if unsaved, then A1 |

---

### A6. FIR Review: status after sending (designs 219 and 449)
**On screen [DESIGN]**
- Request ID with status badge, police station
- Client Details: name, phone, city, plus a call button **[REMOVE "Verified Complainant"]**
- FIR Draft card: version (v1, v2…), "Created by <advocate name>", "N Legal Sections · N Files Attached", **View Draft** and Share
- **Filing Timeline**, where **[DECIDE]** we add the admin step:
  1. Draft Created
  2. **Sent to Admin**
  3. **Admin Approved**
  4. Sent to Client
  5. Client Approved

  6. **Submitted to Police**, kept only if decision 1 (C14) confirms the advocate submits. Then the approved state shows **"Mark as submitted to police"** (receipt upload required, plus date) → A7.
- Status panel, by state:
  - **Waiting for admin:** "Sent to Legalitt for approval." No actions.
  - **Admin returned:** shows the admin's reason, plus **Edit Draft** → A5.
  - **Waiting for client:** "The FIR draft has been sent to <client>." **Remind Client** (sends an in-app notification, max once every 24 h, then the button says when it's next allowed). **[REMOVE]** "Resend Review Link", "via SMS".
  - **Client requested changes:** shows the client's text, plus **Edit Draft** → A5. After resending, the draft goes to the admin again.
  - **Approved:** → A7.
- **Audit Log & History:** real events with times (draft generated, sent to admin, admin approved, sent to client, client viewed, client approved)
- **[REMOVE]** "Advocate Preview Switcher / Interactive Demo". That was only for showing the design.

| Tap | Result |
|---|---|
| View Draft | PDF viewer |
| Call | Phone dialler with the client's number. **[DECIDE]** Should advocates see the client's phone at all? Proposal: yes, after acceptance, as the design shows. |
| Continue (449) | A1 |
| Back | A1 |

---

### A7. FIR Completed (design 220)
**On screen [DESIGN]**
- Green tick. **[DECIDE]** The design says "FIR Submitted Successfully — the client approved the draft and the FIR was submitted". Proposal: "**FIR Draft Completed** — the client approved your draft."
- Case card: Client, Request ID, Service, plus a "Completed" badge
- Your Payment: **₹ advocate share** from the price snapshot, "added to your Legalitt wallet", Payment Date, wallet reference
- Completed Steps: Draft created · Sent to admin · Admin approved · Sent to client · Client approved · Payment added to wallet

| Tap | Result |
|---|---|
| View Earnings | Wallet (356) |
| View FIR | PDF viewer |
| × (close) | A1 |

---

## 3. Admin side
**There are no admin designs in our `design/` folder.** The Figma file has an **"Admin Dashboard"** page we never received. **Get these exported before the admin side is built further.**

Until then, the admin does the following (from Ishaan sir's answers):
1. **New FIR requests queue:** see paid requests and assign an advocate.
2. **Advocate rejected:** the request comes back with the reason, and the admin reassigns.
3. **Approval queue:** open the draft PDF, then either **Approve** (goes to the client) or **Return to advocate** with a required reason (goes back to the same advocate).
4. **Reassign after repeated failure:** if the same advocate fails again, the admin reassigns, with a reason shown in the timeline. Only the advocate who does the final job is paid.

---

## 4. Data the backend must store for FIR

| Group | Fields |
|---|---|
| Request | id (FIR-YYYY-NNNN), client, status, sub-status, created / submitted / completed times, assigned advocate, price snapshot, turnaround |
| Basic (Step 1) | full name, mobile, email, incident type, state, district, police station (id or free text) |
| Incident (Step 2) | date, time, location, competent police station, statement (≤ 2,000), additional details |
| Complainant (Step 3) | father's/husband's name, age, gender, occupation, address |
| Accused (list) | name or "unknown", phone, alias, address, is-primary |
| Witnesses (list) | name, relation, phone, note, is-key |
| Documents (list) | slot (primary / scene / digital / other / custom name / identity), file, size, page count, type |
| Draft versions (list) | version no., proforma fields (sections 1–8), legal sections list, included documents, generated PDF, created by, AI-used flag |
| Reviews (list) | who (admin or client), decision (approve / return / changes), reason text, **selected sections** (client: Complainant Info, Incident Details, Date-Time-Place, People Involved, Missing Data, Other), **optional attachment**, time |
| Place of incident (Step 1) | address, city, PIN, optional location coordinates |
| Police submission (if confirmed) | submitted date, receipt / acknowledgement file, marked by advocate, time |
| Support requests | type (chat / callback), service = FIR Draft, name, mobile, status. Goes into the admin Support inbox. |
| Events (list) | every status change with actor and time. Powers the audit log and all timelines. |

---

## 5. Decisions needed from you
These are the **[DECIDE]** items above. My proposal is the default if you don't change it.

**Settled by the Figma exports** (no longer questions): the Assistance path (Request Chat / Request Callback), the payment screens, and the client's Approve / Request Changes screens.

**Ask Ishaan sir:**
1. **Police submission:** does the advocate submit the FIR at the police station after the client approves, as the designs say? (See C14. It decides the last step for client, advocate and admin.)
2. **Is `164.png`** (Select Date & Time, ₹999 consultation) part of FIR? It looks like the Legal Advice booking screen.

**Defaults unless you say otherwise:**
3. **Turnaround:** one admin-set value, default 24–48 h.
4. **Police stations:** seed MP fully, free text elsewhere.
5. **Complainant extra fields** (father's name, age, gender, occupation) in the Step 3 Edit sheet.
6. **Aadhaar** as a required upload slot in Step 4, instead of DigiLocker / Video KYC.
7. **Payment Success, then Request Submitted, then Status**, each moved on by a tap.
8. **Advocate fee display:** "You will receive ₹base" only.
9. **Proforma header:** "FIR DRAFT" instead of "Madhya Pradesh Police State Command".
10. **BNS only**, without IPC numbers.
11. **Admin approval** before the client, with the advocate button "Send for Review".
12. **Generate with AI:** disabled with "coming soon" until D-08 is built.
13. **Admin designs:** export the Figma "Admin Dashboard" page, the same way you exported these.
