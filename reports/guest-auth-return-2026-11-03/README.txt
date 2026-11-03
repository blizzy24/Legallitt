Guest service cards and authentication return navigation — 3 November 2026

Cause, reproduced on legalitt-5.vercel.app before editing:
The card handler called router.push with a valid service route. The signed-out
Stack.Protected guard rejected it. Cold protected URLs fell through index to
onboarding because its completion flag was memory-only. Authentication success
always navigated to home/dashboard and discarded the requested destination.

Change:
Home and All Services now use one authenticated navigation method. Guests go
to sign-in with a validated, tab-scoped app destination; signed-in users still
open the service directly. Email, phone OTP and sign-up completion consume that
destination. Case queries survive the detour and a refresh during sign-in.
Cancellation/sign-out clear it. Onboarding completion and entry role persist.
Existing auth and role guards remain enabled. No layouts or tokens changed.

Verification:
- Original deployed failure: before.json and before-deep-link.png.
- Fixture browser checks: fixtures/results.json; all seven built services,
  email login, exact case URL with OTP, rejected empty/wrong OTP, signup through
  its success screen, refreshes, cancel, and direct signed-in navigation.
  Zero page errors and zero API requests in fixture mode.
- 322-route fixture smoke: all passed, zero failures.
- Both fixture and API production exports built successfully.
- All workspace typechecks passed.
- Three focused return-destination tests passed (query preservation, rejection
  of external/unknown/auth-loop URLs, and role isolation).
- Real API browser checks pass locally (api/results.json) and on
  https://legalitt-5.vercel.app (deployed/results.json): all four reported cards,
  email sign-in, OTP sign-in, exact completed-case deep links, auth-screen and
  case refreshes, cancellation, and direct signed-in navigation. Zero page errors.
- Deployed code: d71b360, Vercel deployment dpl_H7QF2ufrUCrg38J1TrBxibKqXsi9.

Development credential repair (explicit owner approval):
CloudTrail shows six successful AdminSetUserPassword calls at 05:26 IST on
3 November, followed by PutSecretValue for legalitt-dev/demo-auth at 14:10 IST
without a subsequent reseed. Both local secret names resolve to the same ARNs
used by deployed ECS. The seed resets existing passwords correctly; the secret
update alone caused the drift. See credential-drift-evidence.json.

Set the owner's fixed development password in that secret (value deliberately
omitted here), then ran infra/scripts/dev-ops-task.sh seed-demo against deployed
RDS and pnpm --filter @legalitt/api db:seed-demo locally. Both exited 0 and
seeded all six accounts. No manual one-account reset, stack deployment, flag
change or password literal in source. Both API instances accept all six email
accounts and both OTP roles: reseed-auth-checks.json.

Deployed simulator verification:
Created one explicitly labelled synthetic Legal Notice, LN-2026-0008
(acea22b0-c3e2-4e6b-aefe-90dca6596e62), through the real client endpoints.
Only intake, simulated service payment and client approval were driven by the
test. The deployed timers performed assignment, drafting, dispatch, courier
milestones and delivery. Observed paid -> assigned -> in_progress ->
client_review -> approved -> dispatched -> completed. Those timer actions have
source=simulated; the completion event has null actor columns and actor=system.
The admin simulator authenticated, uploaded the labelled placeholder POD to S3,
passed the real validation and delivery handler, and the client downloaded the
resulting PDF successfully. See simulator-verification.json and
simulated-proof-of-delivery.pdf. No simulator flag, delay or stack was changed.

The first local deep-link test used a historical case unavailable to the demo
client and correctly rendered Case not found. Repeated with that client's
existing completed LN-2026-0006; the full local browser test passed. The deployed
test uses completed LN-2026-0007.

Screenshots:
fixtures/guest-service-sign-in.png
fixtures/service-after-sign-in.png
fixtures/deep-link-sign-in.png
fixtures/case-after-sign-in.png
api/guest-service-sign-in.png
api/service-after-sign-in.png
api/deep-link-sign-in.png
api/case-after-sign-in.png
deployed/guest-service-sign-in.png
deployed/service-after-sign-in.png
deployed/deep-link-sign-in.png
deployed/case-after-sign-in.png

Repeat:
pnpm --filter @legalitt/api exec tsx --test ../../scripts/auth-destination.test.ts
EXPO_PUBLIC_DATA_SOURCE=fixtures pnpm --filter @legalitt/mobile build
AUTH_RETURN_MODE=fixtures node scripts/guest-auth-return.cjs
SMOKE_DATA_SOURCE=fixtures SMOKE_ASSERT_FIXTURES=1 node scripts/mobile-smoke.mjs
For real API checks, set AUTH_RETURN_MODE=api, SMOKE_BASE_URL and
AUTH_RETURN_CASE_ID, and load the ignored API env for the existing demo secret.
The script does not write credentials or tokens to its report.
Explicit simulator check (creates one synthetic dev case):
VERIFY_DEPLOYED_DEMO=1 node --env-file=apps/api/.env.local scripts/verify-deployed-demo.cjs
