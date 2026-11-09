Confirmed pricing implementation — 9 November 2026

Delivery provenance
Opened design/434-ln-complete-payment.png: Legal Notice Delivery Fee is 179;
Platform fees is 199. Its printed tax/total are inconsistent. Superseded
design/28-ln-step6-payment.webp has platform 199 and no delivery line.
The new delivery tariff is 17900 paise, GST 0. No amount is inferred from a total.
Urgent notice without overage: 999 + 249.75 + 224.78 + 179 = 1652.53.
Ordinary notice without overage: 699 + 174.75 + 157.28 + 179 = 1210.03.

Versioned data
apps/api/prisma/confirmed-pricing.json defines six base tariffs (notice urgent,
ordinary, advice, FIR, District consultation, High Court consultation), delivery,
eight commission rows, eight service fee policies and one case-level PDF policy.
Court consultations each retain their own service code, 60000 paise / 30 minutes.
No fixed court representation price; advocate quote follows consultation.
No standalone courier commission: mobile route is gated; archival courier
screens are subflows; API courier payment requires an existing assigned notice.

Preservation and rollout
Migration adds policy/quote tables and nullable columns only; no tariff activation.
Activate rows with seed-pricing only after API and mobile rollout. Rerunning the
seed preserves original IDs/dates and all historical observations.
Quotes freeze financial inputs and document counts. Capture checks the document
fingerprint under the case lock and records the quote ID. Immutable quote rows
cannot be updated. Existing captured receipts and already-submitted legacy
tariffs retain their original amounts; historical payout gaps remain unknown.
Advocate entitlement is base plus delivery; GST and page overage are excluded.
Actual transfers/withdrawals and the other services' lifecycles remain unbuilt.

Validation
- Additive migration applied successfully to both local PostgreSQL 16 databases.
- API suite: 96 tests passed, zero failures or skipped tests, Node 22.23.4.
- Pricing integration: combined PDF allowance, 25/26-page boundary, no GST on
  delivery/overage, entitlement, idempotent seed, historical preservation, missing
  page counts, pending uploads, changed-document capture refusal, pinned commission,
  immutable quotes, access denial and idempotent payment capture.
- Fixture flow/rounding checks and case-spine navigation checks passed.
- The 322-route API-mode browser smoke passed with zero failures.
- Focused recovery testing found that a resumed submitted case was sent back to
  simulated KYC from Documents. Recovery now returns to payment without redoing
  intake or trying to save its locked fields.
- browser-verification.json and screenshots record the real local API walkthrough:
  two synthetic PDFs (18 + 12 pages), one unfinished upload, explicit blocking copy,
  removal through the UI, 125 overage, 1777.53 captured and 1178 advocate entitlement.
  Payment uses the existing simulated provider; no real charge or dispute exists.
- typecheck.txt records final workspace checks. Browser route/deployment results
  are recorded below after completion.

No credentials, tokens, real client documents or secret values belong in this report.
