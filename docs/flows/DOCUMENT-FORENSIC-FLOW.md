# Document Forensic: complete flow

> **Read `ISHAAN-ANSWERS-2026-11-12.md` first. It overrides this file where they differ.**


**Sources:** Figma `Document-Forensic-Client-Side` (12 screens) and `Document-Forensic-Advocate-Side` (12 screens + note: *"The Changes Needed screen points to Waiting for Specialist Report Screen in the canvas"*).
Tags: **[DESIGN]** · **[DECIDE]** (proposal; questions in `QUESTIONS-ALL-SERVICES.md`) · **[REMOVE]** (D-01).

## 0. The whole journey
```
CLIENT                                   ADMIN                          ADVOCATE
Landing (method + speed) ─ Learn more ─► Why document forensics
  ├─ Assistance: Chat / Callback ───────► Support inbox
  └─ Quick Submission
     Upload: questioned doc + type + reference sample + instructions
     Review → Payment → Scan & Pay → Success
     Track (6 stages) ──────────────────► assign advocate ───────────► Request details → Accept / More info / Decline
                                                                       Check files (completeness)
                                                                       Waiting for specialist report
                                                                       Fill forensic report → Affidavit (sign)
                                          Admin review ◄─────────────── Review & submit
                                          Approve ─────────────────────► Report approved (no action)
                                          Changes needed ──────────────► Changes needed → back to "Waiting for
                                                                         specialist report" → update → resubmit
     Report ready (summary + report + affidavit) ◄── admin sends ──────► Payment received → wallet
```

---

## 1. Client side

### C1. Landing (`Html → Body.png`)
- "Check Your Document Before You Rely On It", why use a forensic review (4 points)
- Choose how to proceed: Quick Submission / Assistance (Request Chat / Callback, service = Document Forensic)
- **Choose your service speed:** **Ordinary ₹1,499 · Standard processing** / **Urgent ₹2,999 · Faster handling**
- "What you receive": forensic review findings, key observations summary, document-based report, access via the app. **[REMOVE]** "secure portal" → "in the app".
- Summary line "Quick Submission · Ordinary · Fee ₹1,499"
- **Continue with Quick Submission** → sign in → C2. **Learn more** → C1a.
- **[DECIDE] Turnaround conflict:** client review says **24–48 hours**, advocate request says **3–5 business days**. Proposal: **Ordinary 3–5 working days, Urgent 24–48 hours**, admin-editable.

### C1a. Why Is Document Forensics Important? (`Documents Forensic 01.png`)
Info page, kept as written. It's already careful ("may help", "depends on…"). **[REMOVE]** "Prepared by Verified Experts" → "Prepared by qualified professionals" (see the QUESTION on who examines). Back → C1.

### C2. Upload Document (`Html → Body (1).png`, "Step 2 of 3")
- **Document to examine*** (PDF / JPG / PNG ≤ 25 MB): Camera · Gallery · Files. After upload: name, size, **"What should we look at?"** (short label, e.g. "Signature clause on page 3"), View (viewer) / Replace / Remove. **+ Upload more** pages of the same document.
- **Document Type*** (dropdown): Agreement / Contract · Government Document · Property / Sale Deed · Affidavit / Declaration · Cheque / Financial · Digital document (screenshot / PDF) · Other
- **[DECIDE] Requested analysis*** (missing from the upload screen. The review shows "Requested Analysis" and the advocate sees "Signature Examination"): Signature verification · Handwriting · Alteration / tampering · Digital document authenticity · Comprehensive
- **Reference document** ("a previously signed document containing the same person's known signature"): upload (View / Replace), **or** tick **"I don't have a reference sample"**. Required only for Signature / Handwriting analysis. If ticked, show: "Without a reference, the expert can only check for signs of tampering, not whether the signature is genuine."
- **Specific instructions** (optional, ≤ 1,000)
- **[REMOVE]** "processed in encrypted ISO/IEC-compliant environments. Handled strictly by accredited forensic document examiners." (We can't claim accreditation.)
- **Continue** → C3 · Back → C1

### C3. Review Request (`Documents Forensic 12.png`)
Documents attached (questioned + reference, View / Replace / Remove, **+ Upload More**) · "₹25 per page above 25 pages" · document type · number of files · requested analysis · estimated report delivery · "Request ID: generated after payment". **Proceed to Payment** → C4.

### C4. Payment (`Documents Forensic 04 / 13.png`)
"Online Document Forensic · Ref · <document type>". Price rows by our rule (base = speed price, + platform, + GST, + extra pages; the design's ₹3,167 / ₹570 / ₹199 / ₹3,939 are samples). **Pay & Start Analysis** → Scan & Pay → success ("Your forensic analysis request has been submitted", **Start Analysis** → C5). **Fix:** the success screen says ₹3,737 when the total was ₹3,939. Always show the real paid amount.

### C5. Request Submitted (`Documents Forensic 14.png`)
Request ID (`DF-YYYY-NNNNN`), estimated delivery, "What happens next" (3 lines). **Fix:** "You will receive the report via email & app" → app only, unless email delivery is built. **Track Analysis** → C6 · **Back to Home**.

### C6. Track Analysis (`Documents Forensic 15.png`)
Request ID, status. **Analysis Progress, Stage N of 6 [DECIDE: reordered to match what really happens]:**
1. Payment Received
2. Document Uploaded
3. **Expert Assigned** (the design calls it "Assigned by Admin" and lists it after "Forensic Analysis", which is the wrong order)
4. Forensic Analysis
5. Quality Review (= admin review)
6. Report Ready

- **Chat with Expert** (once assigned) → case chat · **Contact Support**
- If the expert asked for more information: a card "The expert needs: <text>" with **Upload / Reply**
- **[REMOVE]** "100% Confidential & Secure. Your documents are encrypted and accessible only to authorized experts." → "Your documents are visible only to your assigned expert and Legalitt admin."

### C7. Report ready (`Documents Forensic 38.png`)
"Analysis Completed" · Request ID · **Report Summary** (filled from the advocate's report, A6):
- Document Status: **Likely genuine / Likely not genuine / Inconclusive**
- Authenticity check: short text
- Risk level: Low / Medium / High
- Review date
- Report pages

**View Report** · **Download PDF** · **Share Report** · also **View Affidavit**. Both go into My Documents.
- **[REMOVE]** "Verified by Forensic AI & Counsel", "certified report" → "Your forensic report is ready."
- **[DECIDE]** Questions after delivery: the chat stays open 7 days.

### C8. Edge cases [DECIDE]
- **Unreadable / low-quality upload:** the expert taps "Request more info" (A2) → the client re-uploads. The due date pauses.
- **Original physical document needed:** some examinations need the original paper. **QUESTION** (courier the original? who pays?).
- Cancellation (D-12) as usual.

---

## 2. Advocate side

### A1. Cases list / Forensic requests (`78.png`, `81.png` "Legalitt Forensic Portal")
DOCUMENT FORENSIC cards: client · document name · DF id · status (New / Accepted / Waiting for specialist / Report draft / With admin / Changes needed / Completed) · last note · updated. **Review Request** → A2.

### A2. Request Details: new (`79.png`)
- "New Request", DF id, Document Forensic Examination
- **Fee:** "You receive ₹<base>" (**[REMOVE]** "Payment Secured")
- Service class (Ordinary / Urgent), examination type, expected time, submission date / time
- Client: name, client id, phone **masked**, email masked, city
- Client's statement and objective (verbatim)
- Documents: questioned (pages, size, the client's "what to look at" note, View) · reference (View). **[REMOVE]** "SHA-256 …" hashes, "Verified genuine specimen", "Evidentiary Files", "Sec. 45 & 73 IEA" (old Act), "Standard Protocol: FDEP-v4"
- Requested examination with a short description
- **Accept Request** → A3 · **Request More Info** (text → client task, C6) · **Decline Request** (reason → admin)

### A3. Check the files (`80.png`)
Case file: total documents, pages. Questioned document (View / Download, target focus). Reference material (View / Download).
**"Ready for review" checklist, ticked by the advocate**, not auto-claimed: ☐ files open properly · ☐ all pages present, none blank · ☐ legible enough to examine. **[REMOVE]** the auto claims "300+ DPI Scan Quality Verified", "Evidence Tracking Recorded", "Legal Standards Followed".
**Continue** → A4 · **Request More Information** → as in A2.

### A4. Waiting For Specialist Report (`06.png`)
- "WAITING FOR SPECIALIST · Report Pending", DF id, client, questioned document, forensic type, service class
- Instruction (from the design): "**Upload report must be filled along with affidavit**"
- **Upload Report** → A5 · **View Request Details** → A2 (read-only)
- **[DECIDE, IMPORTANT] Who examines the document?** The case card says "Documents sent to **external forensic specialist**", but the affidavit (A6) has the **advocate** swearing they examined it personally. The flow can't be both. **QUESTION for Ishaan sir.** Proposal until answered: the advocate arranges the examination (in-house or with a specialist they choose), fills the report and signs the affidavit. Legalitt does no specialist hand-off in the app.

### A5. Forensic Report (`Html → Body.png`, "Ready to fill")
- Client, request id, case type, submitted document (name, label, pages, size)
- **Examination sections** (each required):
  1. **What was checked?** (scope)
  2. **How was it checked?** (method)
  3. **Findings** (observations)
  4. **Final result** (conclusion)
- **[DECIDE] Add the summary fields shown to the client (C7):** Overall status (Likely genuine / Likely not genuine / Inconclusive) · Risk level (Low / Medium / High) · short authenticity line
- **Preview Report** (PDF, "Preliminary Forensic Examination Report") → **Continue** → A6
- **[REMOVE]** "Verified Client", "Physical & Optical Review" badge (unless that's the method the advocate writes)

### A6. Affidavit (`Html → Body (1).png`)
- Progress: Forensic Report ✓ → Affidavit (in progress)
- Matter summary (client, request id, matter, target document)
- **Proforma "Affidavit of Forensic Examination"**, pre-filled: deponent (advocate name, enrolment no., age, office address), 1 Scope & engagement, 2 Methodology (from A5), 3 Confirmation (report date), 4 Verification. **Edit Text** / **Add Info**.
- **Advocate signature:** draw or typed signature → "Signed <time> · Enr <no.>" · **Re-sign**. **[DECIDE]** Is a drawn signature acceptable, or must it be the same Aadhaar e-sign as Legal Notice? (QUESTIONS)
- `Affidavit.pdf` ready → **Continue to Review & Submit** → A7
- **[DECIDE]** The design's matter summary says "High Court Indore" / "Bengaluru Civil Court", but there's no court in this service. Remove court fields unless the client says the document is for a case.

### A7. Review & Submit (`Html → Body (2).png`)
- Matter summary, client context, target document
- Primary output: `Forensic_Report.pdf` (View / Edit → A5)
- Sworn statement: `Affidavit.pdf` (View / Edit → A6)
- Submission check: Report ✓ · Affidavit ✓ (real checks: both exist and are signed)
- **Advocate confirmation** tick: "I have checked the report and affidavit." **[REMOVE]** "I certify that the methodology complies with High Court forensic standards".
- Note "Legalitt Admin will review the report before it is sent to the client."
- **Submit to Legalitt Admin** → status `awaiting_admin_review` → A8
- **[REMOVE]** "Filing due Today 5:00 PM" (use the real due date from the speed), "Verified Advocate", "Digitally Signed" (unless e-signed)

### A8. Admin Review Status (`Html → Body (3).png`), tabs Waiting / Approved / Changes Needed
- **Waiting:** "Your report is being checked by Legalitt Admin." **[DECIDE]** "Usually 15–30 minutes" is a promise. Proposal: "Usually within 4 working hours." **Refresh Status** · **View Submitted Files**. Case details, files sent (time), progress tracker (Report Created · Affidavit Added · Sent to Admin · Admin Review · Sent to Client).
- **Approved** (`Html → Body (4).png`): "Admin checked the report and approved it. Legalitt Admin will send it to the client. **You don't need to do anything.** Your payout is added to your wallet once the client receives the documents." **View Case** / **Back to Cases**.
- **Changes Needed** (`Html → Body (5).png`): the admin's action items (each a line of text), case documents (the report marked "Changes Needed", the affidavit "Available"), and Next steps. **Update Report →** goes back to **A4 "Waiting for Specialist Report"** (per the designer's note). From there, Upload Report → A5 (pre-filled with the last version) → A6 re-check → A7 resubmit. **Version +1.**
- **[REMOVE]** "Legalitt Advocate Desk is online" → "Need help? Contact Admin Support".

### A9. Payment Received (`Html → Body (6).png`)
"Report Completed. Admin approved the report and sent it to the client." **Your payment ₹<base> added to your Legalitt wallet** (pending manual payout, D-36), date, wallet reference. Report status timeline. Files sent. **Back To Home**.

---

## 3. Admin side (no designs)
1. **New requests:** assign an advocate (approved, offering forensic work)
2. Declined / overdue → reassign
3. **Forensic review queue:** open the report and affidavit. Checklist: format, signature present, conclusion matches findings, client's question answered. **Approve & send to client** (client C7 + advocate A9 + wallet credit) or **Changes needed** with one or more action items (advocate A8).
4. More-info requests where the client hasn't answered in 48 h → follow up
5. Refunds / cancellations

## 4. Data
Request (speed, due date, analysis type, document type, status, advocate, price snapshot) · documents (questioned / reference / additional, each with the client's label, pages) · "no reference" flag · instructions · more-info requests and replies · report versions (scope, method, findings, result, overall status, risk, authenticity line, PDF) · affidavit versions (text, signature, signed at, PDF) · admin reviews (decision, action items) · events.
