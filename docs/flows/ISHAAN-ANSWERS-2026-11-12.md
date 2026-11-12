# Ishaan sir's answers (12 Nov 2026): what changes

**Source:** `ISHAAN-ANSWERS-2026-11-12-original.txt` (131 answers + 10 extra instructions).
**This file overrides every flow document where they disagree.**

---

## A. Changes to things already built and LIVE (fix first)

| # | Answer | What to change |
|---|---|---|
| Q119, Q120 | **FIR: no "Mark Submitted to Police", and no admin setting for it.** The advocate's job ends at preparing and delivering the draft. | Remove the police-submission feature, its admin switch and its receipt upload. The client's "FIR Draft Approved" (F9) must **not** say the advocate will submit to police. Use the client-submits wording: "Download your approved draft · Submit it at <police station>". The advocate's FIR timeline drops "Submitted to Police". The case completes when the client approves, and the advocate is credited then. Remove "within 24 hours". Existing cases in the police-pending state must complete cleanly. |
| Q114 | **FIR: no Aadhaar / PAN at all.** | Remove the Identity Proof slot from FIR Step 4, the "ID last 4 digits" requirement in the API, and the "Official ID Document" row from the proforma and PDF. Existing ID files on old FIR cases stay stored but aren't shown or required. |
| Q79, Q113 | **Court Marriage is not part of Legalitt for now.** Development deferred. | Hide it everywhere, not only from clients: the advocate service filters, the admin sidebar and lists, pricing screens, seeds shown in demos. Keep the code and data dormant. Don't delete them. |
| Q3 | Payment success **stays until the user taps something.** | Every service's success screen gets two buttons: **Start Tracking** (that request's tracking screen) and **Home**. |

## B. Rules for all services (add to SHARED-FLOWS)

| # | Answer | Meaning |
|---|---|---|
| Q7, Q12, Q129 | Every charge is admin-configurable: base fees, platform % (25% to start), GST, page charge, courier charges, other service charges. | No hard-coded price, percentage or fee anywhere. |
| Q8 | GST shown separately. **The tax treatment must be checked by the company's tax professional before production.** | Add to the production checklist. |
| Q22, Q26 | The "Test payment" label and the "Simulate successful payment" button exist **only in development**, never in production. | Gate both on the environment. |
| Q23, Q27 | The QR countdown comes from the **real expiry time** created by the payment system, not a screen-only timer. | The backend stores the order expiry, and the screen counts down to it. |
| Q25 | While waiting, the app **checks payment status with the backend** regularly. | Polling (or webhook + polling). |
| Q28, Q34 | New QR / retry **never creates a duplicate request or a double charge.** | Same request, new payment order, with duplicate-protection keys. |
| Q33 | "You haven't been charged" appears **only after confirming the payment wasn't captured.** If unsure, show "Payment status pending" and check before allowing another payment. | New pending state on Complete Payment. |
| Q35 | Receipt includes transaction ID, request ID, date, amount, itemised charges, **company and tax details.** | Company name, address and GSTIN on receipts (GSTIN still to be supplied). |
| Q40 | Support tickets carry the service, request ID, client and **source screen.** | |
| Q42 | Support quick-question chips are **admin-configurable per service.** | New admin setting. |
| Q44 | Support conversations can be **assigned to support staff.** | Support-staff role (see E1). |
| Q50 | Document Viewer → More → **Report a Problem creates a support ticket** linked to that document and case. | |
| Q65 | 25 MB default, **admin-configurable per service.** | |
| Q66 | PDFs show the page count. **Images show as "N images", not pages.** | See question C2 on whether images count toward the 25-page allowance. |
| Q71 | ID numbers masked in screens, **notifications, logs and support screens.** Full view only for authorised staff. | Log masking too. |
| Q73 | Advocate case search covers client name, request ID, **case number** and service. | |
| Q110 | In-app notifications. **Push notifications may be used too.** Never claim SMS. | Push is allowed later (needs the phone apps). In-app now. |

## C. Advocate profiles: admin control (new feature)

| # | Answer | Meaning |
|---|---|---|
| Q81, Q83 | **The admin panel controls all advocate profile data**: add, edit, update, **suspend**, including the name and every professional detail (experience, city, practice areas, education, courts, languages). The client-facing profile shows what's in the admin panel. | New admin "Advocates" editor. Suspend hides the advocate and blocks new assignments. |
| Q81, Q85 | **The About / description can be edited by both** the advocate and the admin. | |
| Q84 | **Bar Enrolment No.** can be entered by the admin **or** the advocate. **Entering it does not make them Verified.** | |
| Q82 | **Verified badge = admin only**, linked to the real verification record (D-35). | |
| Q86 | **Every advocate shows as Available by default.** The advocate can mark themselves unavailable, and the admin can too. | Availability toggle for advocate and admin. Real time slots stay for Legal Advice only (Q87). |
| Q88 | Real client reviews, **plus an "Admin Review"** the admin can publish, shown **at the top** and clearly marked as Legalitt's review. | New admin-review field, and an "Admin Review" badge on the profile. |

## D. Service-specific answers

### Legal Notice
| # | Answer | Meaning |
|---|---|---|
| Q95 | **Client–advocate chat is open only until the notice reaches admin.** After that, the advocate's part is closed, and the client only has tracking. | Chat becomes read-only for both when the client approves (that's when it goes to admin, per Ishaan sir's earlier change 1). |
| Q99 | **No 1-hour live session** in Legal Notice. | Remove any session timer from Legal Notice chat. |
| Q116 | Email and WhatsApp delivery must go through **real providers**, showing the real method, date, time and status. | Email: AWS SES (we're already on AWS, cheap). WhatsApp: a WhatsApp Business provider, **cost decision needed** (question C4). Until the provider account is ready, the admin marks it sent by hand, labelled as such. |
| Q117 | Failed delivery: show the reason, and offer retry / change method. | **Who acts on it: admin or advocate?** (Question C3, because the answer says "advocate", but the earlier change says the advocate's part ends at admin.) |
| Q118 | E-sign yes, **once a provider is chosen.** Never say "digitally signed" unless it really was. | Test step until then (question C5). |

### Legal Advice
| # | Answer | Meaning |
|---|---|---|
| Q96 | Chat consultation: 7 days, then read-only, **unless the admin reopens it.** | New admin action: Reopen chat. |
| Q123–125 | Written opinion: structured editor reusing the letterhead editor (advocate letterheads, preview, PDF). **₹100 add-on to start, admin-editable. Tax configured separately.** | Confirmed. |

### Property Search / Document Forensic / FIR
| Q97 | Chat from acceptance until delivery + 7 days. | Confirmed. |

### Court cases
| # | Answer | Meaning |
|---|---|---|
| Q98 | **Same chat rule as the others**: acceptance until completion + 7 days. Not "whole case forever". | Read-only 7 days after the case is completed. |
| Q121 | The advocate can **request / mark completion with supporting info. The admin keeps oversight.** | Advocate taps "Mark case completed" (final order + note) → admin confirms → the client sees Completed → wallet. |
| Q122 | Cancellation after acceptance: the client requests, and **the admin decides** using work done, terms and refund eligibility. | Confirmed. |

## E. Extra instructions (whole project)
1. **Roles:** client, advocate, admin **and support staff**, each with separate permissions. Support staff can work the Support inbox but can't change prices, approve advocates or refund (proposal).
2. **Every request, payment, document, message and status change is linked by unique IDs.**
3. **Audit trail:** important actions by anyone are recorded with time and who did it. Admin can view it per case.
4. **Data security:** access control, encryption at rest (S3 and RDS encryption on), secure storage.
5. **Document retention and deletion policy** must be defined (question C6).
6. **AI for advocates:** document summaries and legal research **with source references and "verify before relying" warnings.** This is D-41, now wanted.
7. **Human supervision:** every AI draft, summary or opinion is reviewed and approved by the advocate before anyone else sees it.
8. **Admin configuration** without code changes: pricing, support hours, service on / off, cancellation rules, notifications, workflow settings.
9. **Scalability:** shared components and APIs, so new services can be added without rebuilding.
10. **Before public launch:** real payment gateway, error logging, backups, access control, security testing.

---

## Still open (Ishaan sir didn't cover these. Defaults in `QUESTIONS-ALL-SERVICES.md` apply until answered)
- **Prices** for every service (the design values conflict)
- **When court clients pay** (at submission or at advocate acceptance)
- **Change of advocate mid-case:** does the first advocate really get nothing
- **Who examines forensic documents** (advocate or outside specialist)
- **Who keeps the ₹179** courier fee
- No-show / reschedule / overtime rules for Legal Advice
- Property Search: full-record price, no-records refund, admin check
- **C2:** do uploaded images count toward the 25-page allowance (e.g. 1 image = 1 page)?
- **C3:** Legal Notice failed delivery: does the **admin** or the **advocate** handle it?
- **C4:** WhatsApp provider (cost) for Legal Notice delivery
- **C5:** e-sign provider (cost per signature)
- **C6:** document retention period (e.g. keep case files 7 years, then delete?)
- **GSTIN and company details** for receipts
- **Default support hours** (admin-configurable, but a starting value is needed)
