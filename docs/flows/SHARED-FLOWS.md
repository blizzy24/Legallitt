# Shared pieces used by every service

> **Read `ISHAAN-ANSWERS-2026-11-12.md` first.** It adds admin control of advocate profiles (edit, suspend, availability, Admin Review), a support-staff role, an audit trail, configurable support quick-questions, and "Report a Problem" in the viewer, and it changes the payment-success, chat-window and Court Marriage rules. It overrides this file where they differ.

**Sources:** Figma `Document-Viewer` (3), `User-Messages-Client-Side-Legalitt` (2), `User-Profile-Client-Side-Legalitt` (26), plus the shared screens repeated in every service folder (payment, Scan & Pay, success, Request Callback, Support Chat, advocate cases list, advocate profile).
**Profile and Messages** are the same 28 screens already in `design/supplied-2026-11-11/` and covered by **D-15 to D-30** in `docs/DECISIONS.md` (already built). Nothing new there.

---

## 1. Rules that apply to every service
1. **Navigation follows the tap** (§2.12). Nothing moves on by itself. Back always returns to where the user came from. Back from payment success goes Home, never into payment again.
2. **Five states on every screen:** ideal · empty · partial · loading · error (with retry next to what failed).
3. **Pricing:** base (advocate's share) + platform fee 25% of base + GST 18% on (base + platform) + extra pages above 25 × ₹25 (no GST, platform revenue) + **delivery fees only where a courier is actually used** (Legal Notice courier ₹179 to the courier cost; court document delivery ₹249). **Court fees and process fees are pass-through:** no platform fee, no GST, paid to the court through the advocate, with a receipt required. Every service's prices come from `service_pricing` (admin-editable). **The prices drawn in the designs are samples.**
4. **Statuses:** each service has **one** status list, shown the same way to client, advocate and admin (each sees its own wording for the same state).
5. **Only approved advocates** (D-35) can be assigned. Assignment is by admin.
6. **Cancellations** (D-12): before an advocate accepts → client cancels, full refund. After acceptance and before delivery → client requests, admin decides. After delivery → no cancel, Contact Support.
7. **Honesty (D-01):** the same false claims appear across all folders. Remove everywhere: "256-bit / end-to-end encrypted", "Escrow / held safely / automatically released", "Bar Council compliant", "Verified" badges not backed by a real check, "Secure Government Court Payment", "Official Registry", "Digitally signed / sealed / tamper-proof", "court admissible", "chain of custody", "SMS" (we only send in-app notifications), "Online / typing" indicators, "Section 126 Evidence Act / legally privileged" banners, "eIDAS", ratings, review counts and experience not from real data (D-02).
8. **Copy-paste errors in the designs to fix everywhere:** payment success says "forensic analysis request" and Scan & Pay says "Legal Notice" in every service. Always show the real service name, real request ID prefix and real amount paid.

---

## 2. Shared components

### Payment (Complete Payment → Scan & Pay → Payment Successful)
- **Complete Payment:** service name, Ref ID, price rows (rule above), Total Payable, methods (UPI app · Scan QR · Cards · Net Banking), **Pay**. Simulated until Razorpay, with a small "Test payment, no money is charged" label.
- **Scan & Pay:** real 10:00 countdown, real amount and service, "Waiting for payment…", **Pay using UPI App**. A "Simulate successful payment" test button (never automatic). Expired → **Generate new QR**.
- **Success:** request ID (copy), "Payment Successful · ₹<real amount>", one line on what happens next for **that** service. Two buttons: **Start Tracking** → that request's tracking screen, and **Home**. It stays on screen until the user taps (Ishaan sir Q3).
- **Pending:** if the payment result is unclear, show "Payment status pending", keep checking with the backend, and block a second payment until it's resolved (Q33).
- The "Test payment" label and the "Simulate" button appear **in development only** (Q22, Q26). The QR countdown uses the backend's real order expiry (Q23).
- **Failure:** stay on Complete Payment: "Payment didn't go through. You haven't been charged." + **Try again**.
- Every payment creates a receipt (D-18/19) visible in Profile → Payments.

### Request a Callback · Support Chat (Assistance Service on every landing)
- **Callback:** Full Name*, Mobile*, note "Our team will contact you within <support hours setting>". Creates a ticket in the admin **Support inbox** with service = the landing it came from.
- **Support Chat:** "Regarding: <service>", quick-question chips, messages, attachment. It's the client's single support thread (Messages → Support). Admin replies from the Support inbox (D-26, D-42). No "Available to assist" dot.

### Document Viewer (`iPhone 13 & 14 - 147 / 148 / 149`)
- Header: back, file name, client, case. PDF pages with "Page 1 of N". Bottom bar: **Zoom Out · Zoom In · Fit to Screen · Download · Share · More** (More: "Open in new tab", "Report a problem").
- **148 Error:** "Unable to load document. Something went wrong while loading this document." + **Retry**. If retry fails twice: "Download instead".
- **149 Empty:** "No document available. There is no document uploaded for this case yet." + **Back to Case**.
- Images open full-size, with pinch zoom on phones. Signed URLs fetched on open, re-fetched silently when expired.
- **Fixes Ishaan sir's Legal Notice point 4** ("uploaded PDFs are not properly shown") and applies to every service.

### Stepper (multi-step forms in every service)
One shared component: evenly spaced numbered circles joined by a continuous line, filled up to the current step, "Step N of M" below. Fixes Ishaan sir's Legal Notice point 5 everywhere.

### Uploader
Camera / Gallery / Files (PDF, JPG, PNG, ≤ 25 MB unless the service says otherwise). After upload: name, pages, size, **View** (viewer) / **Replace** / **Remove** (with confirmation). A running page counter with the "₹25 per page above 25" note. Identity documents are always shown masked.

### Advocate cases list (`68 / 78 / 82 / 83 / 84 / 85.png`)
Counters Active / Upcoming / Completed (real), search, status chips (Active · Upcoming · Waiting for Client), service chips (All · each service), sort (Recent first), cards by service type (each flow's A1). Empty state per filter. **Court Marriage is not offered anywhere** (Ishaan sir Q79, Q113): no filter chip, no cards.

### Advocate profile (client view) (`Html → Body@2x.png` and copies)
Name, photo / initials, **Verified only if D-35 approved**, experience / city / practice areas / education / courts / languages **only if filled in the advocate's own profile**, bar enrolment no., about, availability (Legal Advice only, from the advocate's real slots), client reviews (real only; empty state if none).

### Case chat (client ↔ advocate)
Per-case thread in Messages (D-28). Attachments as document cards (open in the viewer), failed-send with **Retry**. When it's open:

| Service | Chat open |
|---|---|
| Legal Notice | from acceptance **until the notice goes to admin** (client approval), then read-only. No 1-hour session (Ishaan sir Q95, Q99) |
| Legal Advice (chat format) | from confirmation for 7 days, then read-only |
| Property Search / Document Forensic / FIR | from acceptance until delivered + 7 days |
| Court cases | from acceptance until the case is completed + 7 days, then read-only (Ishaan sir Q98) |
| Any service | the admin can **reopen** a read-only chat (Q96) |

### Notifications (in-app only; D-20)
Every status change that needs the user's attention or action creates a notification with a deep link to the exact screen (survives sign-in): advocate assigned, draft ready, changes requested, fee requested, hearing added / updated, document requested, report ready, payment received, refund decided, support reply.

---

## 3. Missing designs (needed before the matching part can be built exactly)

| Missing | Affects | Until we have it |
|---|---|---|
| **The whole admin panel** (Figma page "Admin Dashboard" not exported) | Every service's admin steps, support inbox, refunds, verifications | Build from the existing admin style. Each flow lists the admin steps. |
| ~~Court Marriage~~ | — | **Deferred by Ishaan sir.** Hidden from clients, advocates and admin. Code kept dormant. |
| **`Client-Side-Identity-Verification` folder** (it arrived **empty**) | ID step in Legal Notice / FIR / court cases | Aadhaar / PAN upload (D-40). The DigiLocker / Video KYC screens in the Legal Advice folder are not used. |
| Legal Notice: **email / WhatsApp delivery** status, **failed delivery**, **advocate e-sign** | Legal Notice dispatch | Built from existing cards (LEGAL-NOTICE-FLOW C10–C12, A8) |
| FIR: **advocate "mark submitted to police"** | FIR end step | Built behind a setting (FIR flow C14) |
| Court: **advocate "mark case completed"**, **client cancellation after acceptance** | Court cases | Built from existing components |
| Legal Advice: **written-opinion editor** (₹100 add-on) | Legal Advice | Reuse the letterhead editor |
