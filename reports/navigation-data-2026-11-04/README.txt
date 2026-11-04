Navigation data coverage — 4 November 2026

Scope: API-mode client/advocate navigation; no new backend, no AWS or credential
changes. Fixture-mode design previews remain available unchanged.

ADVOCATE — bottom navigation order
Dashboard: real identity, Notice work and explicit empty state -> retained.
Matters: real assigned cases and filters -> retained.
Clients: 28 clients / 16 active / 4 this month, sample client cards -> unavailable
  directory state, My Cases exit. All nested client detail routes also gated.
Earnings (wallet icon): fabricated available ₹24,850, total ₹78,500, pending
  ₹9,200, paid ₹44,450 and bank details -> payout split not configured;
  balances/withdrawals unavailable, recorded client charges remain in each case.

OUTWARD FROM ADVOCATE NAVIGATION
Analytics/performance, reviews, calendar/hearings/availability, other service
workspaces, bank and withdrawal screens no longer mount fixture records.
Settings: sample Priya Sharma identity, verified badge, bank/default/language
claims and inert toggles -> authenticated name/email, navigable rows, real
notification bell and sign-out. Unsupported destinations explicitly gated.
No fake zero counts stand in for data we have no endpoint for.
Legal Notice case screens and notifications remain live.

CLIENT — bottom navigation order
Home: fixed Rahul greeting/RS and nonfunctional video carousel -> signed-in
  name/initials, carousel omitted. Service catalogue retained; only Legal Notice
  can enter a live service flow, other services stop at an unavailable gate.
Cases: real cases -> retained, unsupported HEARINGS 0 tile omitted.
Advocates: three sample saved counsel, ratings/availability/prices -> unavailable
  directory. The real case's assigned-advocate profile remains accessible.
Profile: Rahul sample email/phone, 3 Active, presence dot, version claim -> real
  authenticated name/email/phone only; sample claims omitted; sign-out retained.

OUTWARD FROM CLIENT NAVIGATION
Messages: canned conversations/unread counts -> unavailable inbox; real Notice
  chat stays inside its case.
Documents: sample filenames and sale-agreement viewer -> unavailable library;
  real Notice documents still open via their existing API preview/download path.
Payments: old preview notice (not a real ledger) -> clear unavailable-history
  state pointing to real cases and their payments.
Settings/profile editing/language/privacy/support/callback -> unavailable gates;
  no claimed saved changes or support conversation.
My Requests: real Notice records retained; assigned advocate bound when present,
  empty metadata rows omitted. Notifications and polling remain real.

IMPLEMENTATION
AccountDataBoundary wraps individual navigator screens, never the navigator.
Blocked children do not mount; deep links use the same policy as taps. Tabs stay
available. Shared Notice advocate profiles require caseId; outbound courier
form requires noticeOutbound=1. This is data coverage gating explicitly requested
by the owner, not bypassing the existing API payment/AI/KYC simulators.
Copy registered in architecture §9.2 and copy/instructed.ts. Measured tokens are
unchanged. No other-service backend is implemented.

EVIDENCE
before/: deployed, authenticated, read-only captures before changes.
local/ and local-final/: isolated local exports against the deployed API, pre-deploy captures.
deployed/: deployed captures after release (when present).
index.html: paired before/deployed screenshots.
Audit uses separate browser contexts for the real demo client and the zero-case
advocate, no new accounts/cases and no case, payment or document mutations.
Normal authentication may produce authentication audit records.

VALIDATION
- All workspace typechecks passed (typecheck.txt).
- Fixture build and all 322 smoke routes passed, no failures or fixture API calls
  (fixture-smoke.txt). Initial Chrome process stalled; its isolated rerun passed.
- Final local API export: 35 routes, no browser exceptions; actual visible bottom
  tab clicks in both roles, plus assigned Notice advocate profile and chat.
- Deployed alias: the same 35-route checks passed with no browser exceptions.
- Registry inspection covers 315 registered non-public/tab routes: 252 unbuilt
  screens are gated without mounting fixture content. Case-aware profile/courier
  exceptions tested separately. This is coverage analysis, not 315 API browser walks.
- No new accounts/cases, API deployment, AWS change or credential change.
- Source change: 7183c1a, pushed to main.
