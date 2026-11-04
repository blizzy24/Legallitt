Advocate five-state sweep — 4 November 2026

Scope: Legal Notice and the advocate dashboard/matters entry screens.
The zero-case account is existing Demo Advocate Asha (demo-advocate-2).
The browser audit visits all 147 routes under app/advocate and (advocate),
including invalid case URLs. Other-service screens are audited, not implemented.

AGENTS.md: the exact required five-state rule already existed in 9ff6657.
This chunk preserves it and adds the demo-password rotation rule.

Before changing the fee UI, findings reported to the owner:
- Total Client Fee: recorded captured service payment, rounded to whole rupees.
- Client/service fee: the case's own pricing_id (historical agreed base).
- Client platform/delivery fees: pricing effective at capture time, shown only
  when all base/GST components reconcile with the recorded payment.
- GST: recorded captured GST, not today's recomputation.
- Gateway charges: not separately recorded; omitted.
- Net Earnings / You Receive: cannot compute; commission split unconfirmed.
- Payout Method / Disbursement Window: not configured; omitted.
No fixture 10% commission is applied to API cases. Client charges are not
advocate deductions. Missing charges carry their labels away.

Dashboard 148 reuse: greeting/avatar/date, statistic tiles, section row/View All,
work-card geometry, existing type/colour/spacing and tab navigation. Counts and
card actions use the same lifecycle mapping as My Cases. Only assigned,
advocate_accepted, in_progress, changes_requested, approved and dispatching
require the advocate's attention; client_review and dispatched are waiting.
Needs Review / In Progress / Resolved tiles link to the matching list filters.
Omitted: hearings, consultations, availability/preferences and today's schedule.
They return when those services are built. This is registered in architecture §9.2.
No-work, no-action-needed, loading and retry states are explicit.

Client Review: the MESSAGE SENT TO CLIENT card had no real message source.
The whole card now disappears when absent. No fabricated message is sent.

Further Notice fixes: shared unavailable/loading case states cover all 21 Notice
routes; saved-case errors remain nonmodal; empty inbound shipments don't claim
receipt; empty documents don't claim AI findings; absent table cells, payout,
escrow and party separators are removed. Acceptance/decline is enabled only
for an assigned request, not a completed case opened by URL.

Completion remains a DESIGN GAP. 203 is report/payout confirmation; 199–202
are incoming client-to-advocate receipt; 441 is client-side delivered.
181 is consultation; 395/432 are court; 450 is FIR. None supplies the requested
advocate Notice completion/POD screen. No other service's design was substituted.

Additional defects found with no cases (not fixed by adding new service APIs):
- /clients shows 28 clients, 16 active and Rahul fixture matters; a real empty
  design exists at /advocate/clients/empty but the tab doesn't select it.
- /earnings, wallet, analytics and payout settings show fictional balances,
  bank accounts, transactions and totals despite no configured payout split.
- Settings/profile/security show Priya Sharma; verification shows Rahul and
  sample uploads. These are fixtures, not the signed-in advocate's identity.
- Calendar/availability, consultation, court, FIR, forensic and property-search
  routes still show their supplied fixture work. They are not real account data.
- Notifications correctly shows No notifications.
See route-audit-before.csv for every route's actual visible text and classification.
The sweep does not certify those unrelated fixture flows as production-ready.

Credentials: the original secret and Cognito disagreed; same-secret reference
was confirmed. The existing deployed seed resynchronized all six accounts.
The secret was NOT changed. The combined `pnpm demo:password --resume` then
seeded deployed and local databases and verified all six sign-ins again.
`pnpm demo:password` is the new hidden-prompt rotation command; `--check` is
read-only; `--resume` completes a failed rotation using the current secret.
Exact cause of past drift is unproven; no password-changing actor is inferred.
No password or tokens are stored in this report. Automatic approval review
refused displaying the current password; inspect legalitt-dev/demo-auth in
Secrets Manager if the client message needs the exact value.

Commits so far:
ac03670 — combined dev credential rotation / AGENTS rule
 aac6064 — recorded client fees and historical reconciliation tests
7b74328 — dashboard, fee binding, five-state Notice treatment / §9.2

Validation: all workspace typechecks; API 87 tests passing; full fixture smoke
322 routes with zero failures. Local test DB needed the pre-existing sender-
salutation migration, which was applied before the suite. No new migration.
Dev Compute deployed image advocate-fees-20261104 after its migration check
reported no pending migrations. Core, production and admin UI unchanged.

Evidence directories:
before/ — deployed zero-case account, before changes; all-routes.json + screenshots
local-export/ — predeploy export in an isolated browser, real deployed API;
                network failures only injected in that browser
local/ — intermediate local Metro checks (not final deployment evidence)
deployed/ — final real deployed checks and five-state browser scenarios
after/ — final full deployed zero-case route audit

Final audit: all 147 advocate routes visited twice using the real zero-case
account. No JavaScript errors. All 21 Notice routes now show a loading or
select/unavailable-case state rather than fixture headings and empty cells.
The route-audit-after.csv gives the exact post-deployment screen text for EACH
route. route-comparison.json retains the full before/after comparison.

Real account example: Arjun has 9 cases: Needs Review 0, In Progress 3, Resolved 6.
His attention cards are the approved case and the draft-preparation case;
dispatched cases are waiting on delivery and correctly stay off that action list.
LN-2026-0014 displays client charges ₹999 + ₹199 + ₹179 + ₹248 GST = ₹1,625.
The payment stores ₹1,624.86; all displayed values follow the whole-rupee rule.
Legacy seeded Kabir/Meera workload cases have a ₹699 base and no captured payment
record, so no payment total/GST/add-ons are fabricated for them. This data gap is
visible with guidance to ask the administrator to check the payment record.

Additional fixes from visual review: an unsent draft cannot claim Draft Sent;
accepted cases do not show Pre-Acceptance or accept/decline on the fee URL.
Retry shows loading rather than briefly looking like no work.

Five-state checks on the deployed build include real loaded/empty accounts,
missing-case URLs, plus browser-only delayed/503/partial-response scenarios.
The API and database are not modified by those fault scenarios. Retry recovery
is checked after removing the 503. Screenshots named fee-partial and dashboard-
error/loading are deliberately injected states, not production incidents.

7480a8d — follow-up unsent review and accepted fee states, found during the walk.
Frontend final deployment: https://legalitt-k3u1n7nnd-blizzard7.vercel.app
Alias: https://legalitt-5.vercel.app
Backend image: advocate-fees-20261104, Dev API task definition revision 10.
Push initially failed because SSH had no identity, then GitHub's HTTPS transfer
returned internal errors. Existing gh authentication with HTTPS HTTP/1.1 and
--no-thin succeeded; no GitHub credentials or repository branch policy changed.

Open index.html for the screenshot gallery, including before/after empty screens.

Final deployed verification passed on 7480a8d: exact live group counts, each tile
opens its corresponding filter; all fee values match the case API; missing
platform/delivery values remove labels; retry recovers after a browser-injected
503; loading is explicit. Current unsent-review and accepted-fee screenshots are
in deployed/. The earlier false Draft Sent finding is retained separately at
before/unsent-review-found-during-walk.png.

Audit limitation: full zero-case audit was on 7b74328; the final 7480a8d follow-up
changes populated review/fee states and retry presentation, and was verified
separately on the deployed site. No real assigned request or client_review case
was present among these demo advocates during the read-only checks. No new
case was fabricated or advanced merely to populate a screenshot. The existing
API suite covers acceptance and draft submission; this report does not claim a
new accept/send journey was performed.
