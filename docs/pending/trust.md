# Builder A — trust sweep (P0-1, P0-2) — pending entries

## New decisions

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

## §9.2 substitutions (exact strings)

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

## Not changed here (owned by other builders)

Designs 56/57/58/59/142/143/64/54 (documents, viewer, payments, messages,
security, request details) are rebuilt by builders C, D and E, who apply D-01
on those screens. Their fixture screens still carry the drawn claims.

## §9.1

No new simulated capability.

## D-03

`apps/mobile/copy/support.ts` exports `supportHours` (hours, ticket, callback,
chat response text) as the single configurable source.

## D-05

Court Marriage removed from `ALL_SERVICE_IDS` (it was never on Home). Backend,
admin handling, existing cases and `/court-marriage` deep links remain.
