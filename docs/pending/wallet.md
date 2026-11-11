# Builder G — Advocate wallet and payouts (D-36, D-37, D-42)

Branch `p1-wallet`. For the integrator to merge into `docs/DECISIONS.md` §13 and
the architecture document.

## New decisions

- **D-80. Entitlements are read live from captured price snapshots.** The wallet
  sums `advocate_entitlement_paise` from each captured `service_fee` payment's
  quote snapshot, for cases in `completed` whose `advocate_id` is the signed-in
  advocate (the completing advocate; a replaced advocate gets nothing, per the
  10 Nov payout-on-reassignment decision). Refunded and cancelled cases carry no
  entitlement, except where an admin cancellation decision set
  `advocate_entitlement_paise` (D-14/D-55). Payments whose snapshot has no
  recorded entitlement (legacy) are left out, not shown as zero (§2.5a). The
  existing `payouts` table (one row per case and payment, shaped for Razorpay
  Route transfers) is not used for manual withdrawals.
- **D-81. A withdrawal is a request for an amount, not an allocation of cases.**
  New `payout_requests` table. Ready to withdraw = lifetime entitlements −
  requested − paid. Minimum ₹1,000 (design 359). One advocate's requests are
  serialised with an advisory lock so two taps cannot spend the same balance. A
  request can't be withdrawn once sent (the admin pays it).
- **D-82. The bank account is stored in full, shown masked.** `advocate_bank_accounts`
  keeps the full account number because Legalitt pays manually and the admin
  needs it; every advocate-facing response returns only the last four digits.
  `verified` is always false (no penny-drop): advocate screens say "Unverified",
  the admin queue says so beside the account. Each payout request snapshots the
  bank details it was requested against.
- **D-83. Recording a payout is an admin statement of an outside transfer.** The
  admin enters the bank UTR (6–30 letters/digits) and payment date after a
  confirmation step; recorded in `admin_actions` (`record_payout_paid`,
  `money_moved_in_app: false`). Re-recording with the same UTR is idempotent; a
  different UTR is refused. The advocate is notified in-app.

## §9.1 — register

| Capability | Flag | Standing in because | Clears when |
|---|---|---|---|
| Advocate payouts (D-36) | No flag — manual by design | Razorpay Route not configured; Legalitt pays advocates by bank transfer outside the app and records the UTR | Route linked accounts and transfers are integrated |
| Bank account verification (D-36) | No flag | No penny-drop provider; accounts are stored as entered and marked "Unverified" | A verification provider is integrated |

## §9.2 — built without a design / substitutions

| Screen | Decision | Notes |
|---|---|---|
| Admin **Payouts** queue (`/payouts`) | D-42, D-83 | Existing counters/table/detail-panel style; waiting age reuses `WaitingAge` |
| Wallet 356–358 | D-37 | Drawn "₹3,500 gross / ₹350 fee (10%)" replaced by our structure per case: client paid, platform fee (25% of base), GST, your share. Period tabs This Month / Last Month / This Year from real completion dates. Drawn TDS, settlement window and recent-transfer figures omitted unless a real transfer exists |
| Withdraw 359 | D-01, D-36 | "RBI-compliant clearing network… zero custody" replaced by "Paid to your bank account by Legalitt. You'll see the UTR here once sent." The drawn header "Edit Clause" is replaced by "Withdraw Money" |
| UTR details 361 | D-36 | Shows only the real amount, account, dates and UTR; drawn download receipt / advocate desk actions omitted |
| Bank account 257–260, 360 | D-36, D-82 | One real form (holder, bank, IFSC, account number twice, type); drawn "Matched"/verified states and OTP verification replaced by "Unverified" |
| Payout settings 256 | D-36 | Payout account and an accurate description of manual payouts; schedules shown as not available |
