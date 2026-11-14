# Legal Advice rebuild audit — 14 November 2026

Source priority: the 60-point Legal Advice answers, Round 2 sections A/D/H,
12 November answers, the flow, then November PNGs. Older flat-price and
advocate-ended chat assumptions are superseded for new Legal Advice bookings.

## Design inventory

The supplied ZIP contained **85**, not 89, PNGs. Extraction verified each file
against its archive size before deleting the ZIP as instructed: client 36,
advocate 21, profile 26, messages 2. Profile/messages are later-run inputs.
No four missing images are invented. Visual comparisons remain pending.

## Verified implementation gaps

| Area | Observed code | Required change | State |
|---|---|---|---|
| Mode/landing | `ClientScreen.tsx` offers chat only and says calls unavailable | Mode-first landing, test call adapter, tier selection | Open |
| Tier prices | `ConsultationService.submit` selects fixed `consultation_30_minutes`, tier null | Versioned tier × mode tariff; Emerging seed only; others NOT SET | Open |
| Advocate selection | `advocates()` returns approved profiles and weekly availability, without tariff grouping | Real admin profile years, tier price and eligibility; missing-price warning | Open |
| Slots | `requireSlot` needs advocate weekly hours; current policy uses old notice period | Versioned platform requested slots, default Mon–Sat 10–19, 3-hour notice | Open |
| Intake | shared description allows 10,000 and categories do not match new list | Legal Advice-specific 1,000-character limit and ten categories | Open |
| Assignment | existing case has one advocate, no invitation records | Same-tier invitations; transaction-locked first acceptance; loser notices | Open |
| Time proposals | controller has reserve/reschedule but no proposal actions | Advocate proposal, client decision, 12-hour admin alert | Open |
| Session | `sessionAction` restricts end to advocate and starts after client join | Client end; provider-backed test room; pause/resume; authoritative expiry | Open |
| Reschedule | current service has no maximum-two counter | Two-hour cutoff, max two, advocate reconfirmation; fault exemption | Open |
| No-show | session endpoints expose join/start/end only | Both no-show paths, admin alerts and explicit remedies | Open |
| Summary/payout | old consultation reports use admin review | Mandatory advocate summary; direct release and idempotent credit after submission | Open |
| Written opinion | no dedicated controller purchase/task actions | Versioned ₹100 base, shared checkout, letterhead PDF, 3-day deadline | Open |
| Follow-up | no dedicated controller follow-up action | Linked booking, same advocate/default and previous price snapshot | Open |
| Rating | shared schema allows review length 2,000 | New Legal Advice review limit 500 and one per consultation | Open |
| Admin | old consultation panel assumes one assignment/report review | Invitations, settings, prices, exceptions and overdue queues | Open |
| AI | old report path is not the specified automatic summary workflow | Existing AI port, labelled output, advocate edit/review, unavailable document card | Open |
| Checkout | current shared controls reusable | Snapshot mode/tier/base/tax/page policy; no courier | Open |
| Compatibility | existing consultation/court service code is shared | Additive new-workflow marker; retain legacy cases and court consultations | Open |

## Release gates

Not deployable yet. New-endpoint role/isolation tests, concurrent acceptance,
all requested browser journeys, full suites/builds and side-by-side comparisons
must pass before image publication or a main merge. No deployed data changed.
