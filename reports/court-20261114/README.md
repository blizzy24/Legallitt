# Overnight court rebuild — 14 November 2026

Local implementation and acceptance checks are complete. Deployment has not yet
been performed; release identifiers will be recorded here after verification.

## Part A

All five requested UI fixes are implemented: permanent phone-privacy copy,
labelled LN issue fields/date pickers/Indian currency formatting, submitted
advocate presentation and return handling, grouped uploads/pluralisation, and
the neutral Property Search records-unavailable result. Ten focused browser
checks passed. [Part A screenshots](part-a/README.md).

## Court implementation

District and High Court now share a versioned representation workflow with their
own prices, jurisdiction settings and DC-/HC- references. Existing consultation
cases retain their previous engine and saved prices.

The implementation covers intake/resume, advance and balance, verification and
assignment, client acceptance/change requests, chat, document checklists and
manual pickup, preparation and three-round reviews, pass-through fees/receipts,
offline filing, hearing updates and admin-classified wallet credits, final-order
approval, client delivery and feedback. Cancellation/refund and stalled-work
queues are included. No completion lump sum is created.

- [Gap comparison and results](../../docs/flows/COURT-GAPS.md)
- [Court screenshots and source comparisons](../../docs/flows/court-screens/README.md)
- [Machine-readable validation](validation.json)
- [Assumptions and decisions, §16](../../docs/DECISIONS.md)

## Validation

235 full API tests, 30 shared tests, 12 infrastructure tests and 348 route checks
passed. The 11 court tests were also rerun with an actual tariff change after
deposit to verify the original balance remains pinned. All application builds
and typechecks passed. Browser journeys used only newly created synthetic local
cases; time shifts were scoped to their hearing/completion timestamps.

The browser journey covers DC Ordinary and HC Urgent/Bombay, free replacement,
two paid changes (one rejected, one approved with NOC), pickup, corrected
pre-filing review, court/process-fee payments and receipts, Effective/Passive
hearings, unset-rate blocking, final-order delivery, wallet and chat expiry/reopen.
Additional checks cover review/change limits, decline/reassignment and both
cancellation paths. Initial browser automation failures were selectors, a queue
URL, hearing ordering after time shifts, and the earnings route; each was fixed
and the affected journey resumed successfully.

## Assumptions, simulations and outstanding external inputs

- ₹2,000 is an advance within the total; an unassigned closure may receive an
  admin-decided refund. It is not automatically refunded.
- Hearing credits pay the advocate recorded on each hearing. They survive
  reassignment; completion adds no lump sum. Dev rates remain NOT SET until an
  admin chooses them. Local test rates are never part of the deployment seed.
- Monday–Saturday are working days; no court-holiday calendar is claimed.
- ₹2,000 change and ₹249 pickup are flat totals. Additional tax treatment of
  those charges awaits confirmation; none is invented.
- Pending-case verification stays on the same DC-/HC- case and deposit queue.
- Third review is the normal last round; admin can explicitly unlock another.
- Court ID choices follow the flow: masked Aadhaar, passport or voter ID; no
  number extraction. A pending-case NOC can follow later, but a paid transfer
  requires the outgoing advocate’s NOC before reassignment.
- Payment/refund collection is explicitly simulated. Courier booking/tracking
  and court filing are manual. Calls and registry integration are absent.
- Hearing notifications/reminders are in-app. A complete next-hearing date/time,
  room and bench are added through the full hearing form.
- Feedback is recorded on the case, not silently added to a public rating.
- Final Terms/Privacy copy is still outstanding from the client; linked pages
  honestly say it is being finalised. No policy text was invented.

## Release

Pending final release commit, image/migration/stack, frontend deploy verification,
configuration seed and Docker cleanup. The deployed version is unchanged until
all gates have passed.
