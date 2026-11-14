# Legal Advice rebuild — gap audit and acceptance

Authority: the 60-point answers in ISHAAN-ANSWERS-2026-11-13-legal-advice-original.txt,
the owner's rebuild prompt, Round 2 A/D/H, 12 November answers, the flow, then the
November designs. Older flat-price/chat-only/advocate-ended behaviour is retained
only for legacy cases. Profile/Messages redesigns are deferred as requested.

## Comparison and resolution

| Gap observed before rebuild | Implemented resolution | Evidence |
|---|---|---|
| Fixed ₹600, no mode/tier selection | Mode first; real advocates grouped by configured experience; Emerging ₹499/699/999, other prices NOT SET; immutable policy and capture snapshots | Policy/settings/workflow tests; client mode/tier captures |
| Personal contacts exposed after acceptance | New views omit the opposite party's phone/email; invitation preview is scoped and contacts stay masked; existing document privacy pipeline reused | Invitation/workflow isolation tests; request/room captures |
| Old categories, 10,000-character description | Ten categories, skip to General, 1,000-character intake; autosave, explicit flush before tap navigation, resumable draft; mobile required, email validated if given | Three UI intakes; review/edit; snapshot tests |
| Advocate-specific calendar assumed before assignment | Versioned platform hours, Mon–Sat 10–19, 30-minute requested slots, 3-hour notice; final acceptance checks availability and both participants' existing appointments | Settings, concurrent acceptance and legacy-overlap tests |
| Single assignment | Client's selection invited first; same-tier/practice/availability admin invitations; four-hour expiry; one locked winner plus partial unique index; losers notified and marked closed | Real DB race, invitation HTTP tests; audio browser journey |
| No alternate-time workflow | Advocate proposal, client accept/counter/cancel, reconfirmation, 12-hour idempotent admin alert | Workflow tests; video proposal and overdue queue captures |
| No reschedule cap or both no-shows | Two-hour cutoff, max two ordinary reschedules; advocate accepts replacement; free fault remedy; ten-minute no-show alerts/options; full test refund before acceptance/advocate fault | API tests; browser no-shows, cancellation, two accepted reschedules and blocked third |
| Advocate controlled end; no durable call state | TEST CallProvider; both join; client-only end; advocate pause/resume; cumulative 10-minute pause cap; server persisted timer, five-minute warning and auto-end; room reload never resets time | Session boundary tests; audio/video captures and auto-end journey |
| One-hour chat assumption | Seven-day chat from confirmed start, then read-only; admin may reopen; no clock-driven route changes | Chat boundary tests; expiry/reopen browser captures |
| Completion immediately released money | Immediate case completion, private summary draft, mandatory published summary/key points/next steps; 24-hour alert; wallet entitlement only after submission, idempotent | Chat + video late-summary → credit; wallet tests |
| No automatic preliminary assistance | Existing AI port, automatic preliminary summary/action plan; advocate can edit copied text; bounded supporting-PDF extraction; identity excluded; unavailable document-analysis card; honest TEST/unavailable labels | AI/workflow tests; completed and advocate captures |
| No written opinion purchase | Separate ₹100 base + fees/GST, shared checkout, three-day task, real letterhead PDF/document pipeline, all edited sections rendered, private until delivery, separate credit | PDF text/pagination tests; purchase/editor/viewer browser journey |
| No linked follow-up or per-case review | Same advocate/default mode and prior base retained; linked new request and fresh acceptance; one 1–5 rating and ≤500-character optional review | API tests; follow-up/rating captures |
| Old admin report-review workflow | Existing panel style: versioned scheduling/tariff editor, multi-invite, proposals, no-shows, interruptions, disputes/refunds, summary/written overdue queues, session history, reviews and chat reopen | Admin build; admin queue/settings/case captures; role tests |
| New endpoints could bypass ownership | Case/booking locks and current-role scope; pending-invitation-only file viewer; no general historical access granted; client-private disputes and advocate-private notes/drafts | Foreign-client and foreign-advocate tests for new handlers, invitation file scope, bidirectional browser/API probes |
| Old cases would be forced through new engine | Own booking marker/table; nullable unfinished slot via additive migration; old paid consultations and court cases retain renderer and handlers; stale unpaid entry points give a new-flow instruction | Compatibility guards and full regression suite |
| Extra filled buttons, raw fields, timer navigation | Shared brown/cream visual tokens, radio choices/icons, one primary decision, outlined secondaries/menu, readable event/due dates, generic document labels, loading/empty/partial/error states | [Screen comparisons](la-screens/README.md) |

## Source inventory and intentional substitutions

The archive contains 85 PNGs (36 consultation client, 21 advocate, 26 profile,
2 messages), not 89. Every extracted file was size-verified. Profile/Messages are
later inputs; four missing images are not invented. Repeated DigiLocker/video-KYC
screens, fake verified/security claims, drawn invented people/prices, an advocate
End Call action and fake AI document analysis are excluded under the overriding
answers. Existing support and shared Document Viewer/checkout are reused.

Admin screens have no supplied designs and use the existing panel style, recorded
in architecture §9.2. Calls have no media provider, payments use the existing test
adapter, and simulated AI is labelled; the §9.1 register records these boundaries.
No real call, banking transfer or automatic legal examination is claimed.

## Acceptance and release

Local journeys use newly labelled synthetic cases in the separate
legalitt_report_local database. Timing fixtures are guarded by case owner, saved
walkthrough ID and TEST description. Existing real cases, credentials and money
are untouched. See [the release report](../../reports/legal-advice-20261114/README.md)
for exact final test counts, commits, deployment identifiers and live-check scope.
Decisions and assumptions are LA-R2-01 through LA-R2-13 in DECISIONS.md.
