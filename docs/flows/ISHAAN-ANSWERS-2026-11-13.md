# Ishaan sir's answers, round 2 (13 Nov 2026): what changes

**Sources (originals in this folder):**
- `ISHAAN-ANSWERS-2026-11-13-all-services-original.txt` (43 points, all services)
- `ISHAAN-ANSWERS-2026-11-13-legal-notice-original.txt` (Legal Notice, revised)
- `ISHAAN-ANSWERS-2026-11-13-legal-advice-original.txt` (Legal Advice, 60 points)

**Priority:** this file > `ISHAAN-ANSWERS-2026-11-12.md` > the flow documents > Figma.
Where the originals disagree with each other, section F says which one wins.

---

## A. All services

| Topic | Rule |
|---|---|
| **Prices (advocate base share; +25% platform fee, +18% GST on base+platform; all admin-editable)** | Legal Notice Urgent ₹999 (5 days) / Ordinary ₹699 (10 days). Legal Advice: starting at Chat ₹499 / Audio ₹699 / Video ₹999 (final price by advocate experience tier, see D). **Property Search Ordinary ₹499 / Urgent ₹999.** **Document Forensic Ordinary ₹1,499 / Urgent ₹2,999.** District Court ₹25,000 / ₹35,000 (indicative). High Court ₹24,999 / ₹34,999. FIR: keep the current price. The same price must show on every screen. |
| **Phone numbers** | Client and advocate **never** see each other's real number, at any stage (not "until acceptance"). All contact is in-app chat / call only. Admin and support staff can see them. |
| **Support hours** | Mon–Sat, 10:00 AM – 7:00 PM. Show "We'll call you back within 24 hours." Admin-editable. |
| **Audio / video calls** | Yes, for Legal Advice. Needs a calling provider (decision pending). |
| **Identity verification (KYC)**, new feature, no Figma (point 42) | **Client:** Aadhaar OTP · or upload Aadhaar / Driving Licence / Voter ID **+ Video KYC** (done within 24 h; the client gets a notification with the slot date and time) · or fetch documents from DigiLocker. **Advocate:** mobile OTP (to the number in the admin panel) · Aadhaar OTP · document + Video KYC (same as client) · DigiLocker. In both dashboards. DigiLocker must **not** be a required dependency. Status shows only what was really completed; uploading a document is **not** "KYC Verified". Providers pending: build behind an adapter with a clearly labelled test mode. |
| **Admin dashboard design** | No Figma. Use the **admin dashboard screenshots** Ishaan sir says were already given to the developer (to be collected). |
| **Court Marriage** | Stays hidden (already done). |

## B. Legal Notice (revised file wins over the 43-point file for Legal Notice)

| # | Rule |
|---|---|
| Sender details | **Separate fields: Father's Name, Mother's Name, Husband's Name** (fill whichever apply). **Remove Age completely**, everywhere (form, review, draft, PDF, API). |
| Noticee type | Individual / Person · Company / Organisation. For a company, add "Designation / concerned person" (optional). |
| Issue | Description **required, max 2,000 characters**. Amount involved and key date optional. **Cheque bounce, required:** cheque number, cheque date, amount, bank details, cheque return date. |
| Documents by notice type | Upload slots change with the type. Property: property papers, sale deed, agreements, screenshots. Money recovery: invoices, bills, agreements, payment proof. **Cheque bounce: cheque copy + bank return memo, required.** Tenant: rent agreement, rent receipts, communications. Family / Consumer / Other: supporting documents. Always allow "Additional documents". |
| Chat | From advocate acceptance **until the advocate submits the client-approved notice to admin**. No 1-hour limit anywhere. |
| Client doesn't respond to draft | Reminder at 24 h, second at 72 h; at 7 days the case goes to the admin's **"Pending client response"** list. **Never auto-approve.** |
| Revisions | Unlimited. After 3 rounds, alert the admin (no auto-reject). |
| Advocate deadline | Urgent 5 days / Ordinary 10 days **from payment confirmation**, shown on the advocate dashboard. |
| Deadline missed | Admin gets an overdue alert and can contact, **extend the deadline (reason recorded, client notified)**, reassign, or give a partial refund. **No automatic refund.** |
| Advocate signature | After client approval, the advocate adds a signature by **Aadhaar e-sign** (test mode until a provider is chosen; never shown as genuine) **or an uploaded signature** (saved in the advocate dashboard, placed automatically in a **fixed position right after the closing lines**, not movable). Signature record + timestamps kept. |
| Advocate's job ends at submission | After submitting to admin, the advocate's case shows **Submitted / Completed** on their dashboard. **Remove all advocate dispatch actions** (address check, courier, email, WhatsApp, POD). |
| AI Document Summary card | Show it in the advocate's case details **even though it isn't working yet**: title "AI Document Summary", placeholder "AI document summary will be available here." No fake results. |
| AI draft | Keep. Uses only the client's facts and documents. Advocate must review / edit before sending to the client. |
| Dispatch (admin) | Admin checks the notice; returns it to the advocate with reasons if needed. **Email** goes through the platform with the signed PDF; record recipient, date/time, bounce/failure. **WhatsApp** is sent manually by admin from the Legalitt business number; admin records date/time and status. **Courier**: admin uploads POD, delivery date/time, recipient. **No fake POD for email/WhatsApp.** Each selected method has its own status; "delivered" only per method. |
| Failed delivery | Admin records the reason → client notified → client gives a new address / email / number → admin verifies → dispatch again. **New courier address = another ₹179 (shown before paying). New email / WhatsApp = free.** |
| ₹179 courier fee | **Belongs to Legalitt.** Never credited to the advocate wallet. |
| Noticee's reply | Replace "Get Reply Update" with a **Reply section** on the client's tracking page: the **client or admin** can upload a reply; visible to client, assigned advocate and admin; in-app notification; timeline event "Reply Received". Never claim Legalitt receives replies automatically. No separate "Legal Notice Response" service. |
| Cancellation | Before acceptance: full refund. After acceptance, before dispatch: admin decides (recorded). After dispatch: not allowed ("Contact Support"). |

## C. FIR Draft
- Drafting only. The client files at the police station. (Already built.)
- The **"Select Date & Time – ₹999 Consultation"** item belongs to Legal Advice only; it must never appear in FIR.

## D. Legal Advice (new detailed rules, see the original for all 60 points)
- **Pricing:** choose mode (Chat / Audio / Video, "starting at" ₹499 / ₹699 / ₹999) → **choose an advocate** from a list grouped by experience tier: **Veteran 15+ yrs · Highly Experienced 10–15 · Experienced 5–10 · Emerging up to 5.** Each tier × mode has an admin-set price; the selected advocate's price is shown before payment. Snapshot price on payment.
- **Category** (10 options, skippable → General Consultation). Form: name, mobile, email, category, preferred slot, description (≤1,000), documents (25 pages free, ₹25/page after). Review screen with Edit per section.
- **Slots:** Mon–Sat 10–7, 30-minute slots, at least 3 h from now, all admin-editable. The slot is a request; the advocate accepts or proposes another time (client must accept; admin alerted after 12 h without a reply).
- **Assignment:** admin can assign **several eligible advocates at once; first to accept gets it (atomic)**, others are notified and their Accept is disabled; nobody accepts in time → back to admin.
- **Session:** 30 min, countdown, 5-minute warning, **auto-ends at 0.** **The advocate has no End button**, only **Pause / Resume** (timer stops; max pause 10 min, then "Interrupted" + admin alert; limit still to be approved). **The client can end.** Client ending = "Successfully Completed". No extension; book a follow-up.
- **Join** opens 10 min before ("Opens at 3:50 PM").
- **Chat consultation:** 7 days from confirmed start, then read-only ("This consultation has ended." + Book Follow-up). Admin can reopen.
- **No-shows:** client not joined within 10 min → advocate marks "Client didn't join", no refund. Advocate not joined within 10 min → client chooses Wait / Reschedule (free) / Cancel with full refund; admin alerted.
- **Reschedule:** up to 2 h before, max 2 times, advocate must accept the new slot; after 2, contact support.
- **After session:** AI Case Summary + Action Plan generated automatically from description and documents (labelled AI, advocate can edit). The advocate **must** submit client summary, key points, next steps (+ private notes, optional attachment) **within 24 h**; admin alerted if late. **Wallet credit only after that summary is submitted.**
- **Written Legal Advice:** ₹100 base (admin-editable) + platform fee + GST; advocate editor with letterhead → PDF; due in 3 days; in the completed screen and My Documents.
- **Follow-up:** same advocate by default, same price as before, linked to the original.
- **Rating:** 1–5 stars + optional review (≤500), one per consultation, real reviews only.
- **AI Document Summary card** shown even before it works (placeholder, no fake results).
- **Admin:** queue, multi-assign, time proposals, no-show / interrupted / disputed / refund / reschedule lists, overdue summaries and written opinions, scheduling settings, tier pricing.

## E. Property Search
- **Same price for 15 years, 30 years and full record.**
- **Timelines: Urgent 2–3 working days · Ordinary 4–6 working days** (everywhere).
- **Admin must verify the report before the client gets it** (like Document Forensic). Advocate "Send" → admin review → approve / return with reason → client.
- **No records found:** **no refund.** The advocate (or admin) uploads the office's note confirming records are unavailable; the admin informs the client by **in-app chat message + push notification**; the note is viewable in the app.

## F. Document Forensic
- The assigned advocate is responsible; they may examine personally **or use an external forensic specialist**, but they review the findings and sign the affidavit.
- **Timelines: Urgent 3–4 days · Ordinary 5–7 working days**, same on client and advocate screens.
- Starts from scans. If the original physical document is needed, the advocate can **request the original** from the client through the app (request card with reason + instructions, client acknowledges, status tracked).
- Affidavit: **drawn or typed signature is enough** for now. No Aadhaar e-sign needed.

## G. District Court & High Court
- **Payment:** **₹2,000 at submission** (starts advocate assignment) → client accepts the assigned advocate → pays the service fee; **the ₹2,000 is adjusted** against it.
- **Changing the advocate before accepting / paying:** up to 2 times free; after that the admin contacts the client.
- **Changing the advocate after paying:** **₹2,000 change fee, non-refundable** (even if admin rejects), **max 2 times.**
- **Advocate pay is per hearing:** admin records each hearing date and marks it **Effective** (advocate appeared, no adjournment sought) or **Passive** (didn't appear / court didn't sit / matter not taken up / advocate sought adjournment); each type has its own admin-set charge; the system calculates the advocate's pay.
- **Cancellation:** admin decides the refund case by case; **no refund once the case is filed in court.**
- **Pre-filing review:** max 3 rounds of corrections, then "Contact Support".
- **Document pickup:** arranged by admin through a courier, flat ₹249.
- **High Courts (first phase):** Madhya Pradesh, Delhi, Bombay. Client selects one.

## H. Which answer wins where they disagree
| Conflict | Decision |
|---|---|
| Legal Notice parent name: one common field (43-point Q12) vs separate fields (Legal Notice revised C2/R11) | **Separate fields** (the revised file corrects the flow explicitly). |
| Legal Notice chat: until delivery + 7 days (43-point Q14) vs until the advocate submits to admin (Legal Notice revised C10/R5) | **Until submission to admin** (revised, matches the earlier answer Q95). Confirm with Ishaan sir. |
| Legal Notice reply: admin uploads (43-point Q15) vs client or admin (revised C11) | **Both can upload.** |
| Legal Advice price: fixed ₹499/699/999 (43-point) vs starting prices + experience tiers (Legal Advice file) | **Tiers** (the Legal Advice file is the detailed one). |
| Phone numbers "masked until acceptance" (our flows) | **Never shown** (43-point Q5). |
| Property Search "send directly" (our flow) | **Admin check first** (Q27). |

## I. Still open (ask Ishaan sir)
1. **Court prices:** what are the two numbers (₹25,000 / ₹35,000 and ₹24,999 / ₹34,999): ordinary/urgent, civil/criminal, or something else? Effective and passive hearing amounts? Does the ₹2,000 carry platform fee + GST, and is it refunded if no advocate can be found?
2. **Legal Advice tier prices:** the price for each tier × mode (4 × 3). Is the "starting at" price the Emerging tier?
3. **KYC:** required before which step (first booking? payment?) and for which services? Advocates before their first assignment? Providers (Aadhaar OTP, DigiLocker, Video KYC cost).
4. **Calling provider** for audio/video (cost).
5. **Legal Notice wallet credit:** when the advocate submits to admin (their job ends) or after delivery?
6. **Document Forensic Urgent "3–4 days":** calendar days or working days? Original document: who pays postage, and where is it sent?
7. **Admin dashboard screenshots:** please share them.
8. Still open from round 1: C2 (images vs pages), C6 (retention period), e-sign provider, GSTIN and company details.
