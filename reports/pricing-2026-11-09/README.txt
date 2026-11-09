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
- typecheck.txt records final workspace checks; mobile-smoke.txt records the final
  322-route browser smoke, with zero failures.

Deployed verification — completed 10 November 2026 IST
- Implementation commit 3223645 is on origin/main. API image tag 3223645:
  sha256:2f59fbab89ed4a25b58fb418582d0a2d8d60d3eb841ec99807a4f316e366b1a5.
- The first Docker build lost its engine connection; the cached retry succeeded.
  No application or infrastructure setting was changed to work around it.
- Pushed image, ran the additive migration with dev-ops-task.sh (exit 0), then
  updated LegalittDev-Compute-DevelopmentOnly. Stack UPDATE_COMPLETE; running
  task healthy on the verified image. Reviewed change set only changed the API
  and operations task definitions and the service's task-definition reference.
- Main was pushed after the new API endpoint was verified. Both deployed sites
  responded 200; the mobile production bundle contained the quote endpoint and
  blocked-quote recovery UI before tariff activation.
- Ran dev-ops-task.sh seed-pricing 3223645 using Git Bash. Task
  8836bc3de46a4298b5a33b9fc583fffb exited 0. Versioned prices are now active.
- Deployed case LN-2026-0023 (3ea11007-4647-4323-8983-49166516e65f) used two
  synthetic PDFs, 18 + 12 pages, and one unfinished upload. Client browser showed
  the blocked reason and recovery actions; removing the unfinished upload allowed
  a quote. Documents review returned to payment successfully.
- Client saw and paid 1777.53: base 999, platform 249.75, GST 224.78,
  delivery 179, five excess pages 125 with no GST. Captured receipt matched;
  advocate entitlement was 1178 and platform revenue was 374.75. Payment was
  simulated, with no real charge. Admin browser independently showed 1777.53.
  No client browser errors. Screenshots and full quote are in deployed/.
- Deployed service-tariffs.json verifies separate District Court and High Court
  consultation rows: each 600 / 30 minutes, consultation_then_quote, one active
  tariff per service. Other service lifecycles remain gated as documented above.
- Historical LN-2026-0021 retained its original pricing ID and receipt of
  1624.86, with every stored receipt field unchanged after deployment and seed.
  historical-before.json and historical-after.json compare exactly.
- The final evidence commit changes reports and verification helpers only; the
  deployed API remains image 3223645. Pushing this evidence may rebuild the same
  frontend application sources.

No credentials, tokens, real client documents or secret values belong in this report.
