# Overnight court rebuild — 14 November 2026

Local implementation and acceptance checks are complete. **Deployment was stopped
at the migration launcher, before any AWS migration task started.** The previous
working API and production frontend aliases remain unchanged, as instructed.

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

## Release and stop condition

- API/shared implementation: `a10fde9`. Image pushed to development ECR as
  `a10fde9`, digest `sha256:7b65e88c82602d598000bfbb355f5c884fced08c18e2b510cc251b5e077f90f8`.
- Frontend corrections: `679102e`, `0c1a51b`; both rebuilt and typechecked.
- `bash infra/scripts/dev-ops-task.sh migrate a10fde9` was run in **Git Bash**.
  It exited before registering/running an AWS task because `python3` resolves to
  `C:/Users/KESHAV/AppData/Local/Microsoft/WindowsApps/python3` (the Store alias).
  The installed `python` is Python 3.13.5. See [launcher output](migrate-deployed.log).
- Interpreter selection is fixed in `b3feced`: Git Bash defaults to `python`,
  other platforms to `python3`, with `PYTHON_BIN` override. Shell syntax was
  checked. **The migration was not retried**, honoring the instruction to stop
  deployment on a failed step and leave the working version live.
- No stack update, production Vercel update, or deployed court configuration seed
  was performed. Existing cases and credentials were not changed.
- Work is pushed to `overnight-court-20261114`, rather than `main`, because main
  automatically deploys both production Vercel projects. This keeps the work
  safely on GitHub while preserving the previous working frontends.
- Docker builder and image prune ran after the image push. No release build cache
  or unused local API image was retained.

The remaining release steps are migration with `a10fde9`, stack update, both
frontends, `seed-courts a10fde9`, and live verification. All local acceptance gates
passed; these release steps are explicitly **not claimed complete**.
