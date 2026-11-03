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

API verification blocker discovered independently:
The configured dev demo secret is rejected for demo-client@legalitt.invalid by
both the local and deployed APIs. Email and phone OTP return 401. The deployed
auth logs report Cognito NotAuthorizedException: Incorrect username or password.
The account is CONFIRMED and enabled. No credential reset or AWS change has
been made. Approval to restore only that demo account's configured password is
pending; successful real API sign-in verification cannot yet be claimed.

Screenshots:
fixtures/guest-service-sign-in.png
fixtures/service-after-sign-in.png
fixtures/deep-link-sign-in.png
fixtures/case-after-sign-in.png

Repeat:
pnpm --filter @legalitt/api exec tsx --test ../../scripts/auth-destination.test.ts
EXPO_PUBLIC_DATA_SOURCE=fixtures pnpm --filter @legalitt/mobile build
AUTH_RETURN_MODE=fixtures node scripts/guest-auth-return.cjs
SMOKE_DATA_SOURCE=fixtures SMOKE_ASSERT_FIXTURES=1 node scripts/mobile-smoke.mjs
For real API checks, set AUTH_RETURN_MODE=api, SMOKE_BASE_URL and
AUTH_RETURN_CASE_ID, and load the ignored API env for the existing demo secret.
The script does not write credentials or tokens to its report.
