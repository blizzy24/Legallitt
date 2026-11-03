Deployed API cutover — 3 November 2026

Live URLs
  Client and advocate: https://legalitt-5.vercel.app
  Admin: https://legalitt-admin-panel.vercel.app
  API: https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com

The existing legalitt Vercel project was updated; no second client project was
created. The new legalitt-admin-panel project is connected to the same repository
and main branch. Both production builds are READY. No mobile screen code changed.

Saved settings, independently read back through Vercel's API
  Client project: prj_gRLd0GHo14ZL5CHnrZA9O0RhW6Ye
    Root: apps/mobile; outside-root source access: enabled; Node: 22.x
    Install: pnpm install --frozen-lockfile
    Build: pnpm build
    Output: dist
    Production EXPO_PUBLIC_DATA_SOURCE=api
    Production EXPO_PUBLIC_API_URL=https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com
  Admin project: prj_blvW2lCDYQwiHDQPQ2mqH19YsI3V
    Root: apps/admin; outside-root source access: enabled; Node: 22.x
    Framework: Vite
    Install: pnpm install --frozen-lockfile
    Build: pnpm --filter @legalitt/admin... build
    Output: dist
    Production VITE_API_BASE_URL=https://gvycg0n3u8.execute-api.ap-south-1.amazonaws.com
  Environment values were set for production. Preview origins were not added to
  CORS. Use the two canonical production URLs above, not random deployment aliases.

AWS changes
  LegalittDev-Core: deployed through CDK. The deployed before/after templates
  differ ONLY at Documents.Properties.CorsConfiguration.CorsRules[0].AllowedOrigins.
  Added https://legalitt-5.vercel.app and https://legalitt-admin-panel.vercel.app.
  Preserved http://localhost:8081 and http://127.0.0.1:5173, methods, headers,
  encryption, access policies and every other Core setting.

  LegalittDev-Compute-DevelopmentOnly: reviewed a prepared changeset, then executed
  it through CDK. CorsOrigins is the sole changed parameter, containing exactly
  the two HTTPS production origins. The dependent ECS task definition/service
  rolled successfully to legalitt-dev-api:2. Image remains 9e9d2611e7e7; CPU,
  memory, database and all progression timers remain unchanged. CDK's analytics
  metadata also records the Node version used by the deployment CLI.

  Core and Compute updates completed. Fresh synthesis confirms both production
  templates unchanged. No production AWS stack was deployed.

Verification
  Local mobile API build, admin build, all six workspace typecheck tasks: pass.
  Infrastructure tests: 9/9 pass.
  Actual deployed mobile smoke: 322 routes, zero failures.
  Both API and S3 admit the two approved origins; an unrelated origin is denied.
  GET /health: 200, {"status":"ok"}.
  Refresh/deep links on both Vercel sites return the SPA successfully.

  LN-2026-0007 / a1dffec9-35ab-45b8-bee5-c1f15feb3846 was created through the
  deployed client UI with explicitly synthetic test details. Three isolated
  browser profiles signed in through their real email/password screens.
  Client intake -> S3 PDF upload -> simulated KYC -> review -> simulated payment;
  admin assignment -> advocate acceptance, editor and generated PDF -> share;
  client approval -> advocate self-courier form and dispatch;
  admin real S3 POD upload and delivery confirmation -> client 440 -> client 441.
  Assignment, acceptance, drafting, review, approval, dispatch and completion
  events are source=real and attributed to the appropriate signed-in role.
  The POD and final delivery are simulated=false. The case retains historical
  demo tags for simulated payment and other simulated steps, as intended.
  A repeated delivery confirmation returns 409.

  Eight notification observations across the three roles updated bell counts
  with no observer reloads. Opening notifications preserved the case ID and
  marked the notification read. The client opened View Proof on 441; a browser
  GET returned the exact admin-uploaded PDF (SHA-256 recorded in the evidence).
  The uploaded test PDF clearly says that no actual delivery occurred.

What differs from the old fixture demo / localhost
  Reload an already-open fixture tab and sign in again. Fixture sessions and
  arbitrary plausible passwords do not authenticate against Cognito. Email
  sign-in uses actual accounts; the existing 123456 demo-phone path selects the
  seeded role account and returns real Cognito tokens.
  Legal Notice cases now persist in the deployed RDS database and are scoped to
  their client/assigned advocate. Local database cases were not copied to RDS.
  Documents use the real S3 validation/upload/read pipeline from both hosts.
  Notifications poll real rows; observers did not need a reload.
  Payments, AI, KYC, external messaging/courier and the registered progression
  simulators remain as configured. This is not live money movement or delivery.
  Backend progression keeps its 30-second assignment/drafting/dispatch delays
  and 5-second shipment steps; these differ from fixture UI timers. A simulated
  pickup milestone appeared during the test before the human completed delivery.
  Other service backends were not added or changed.
  No extra hosted-flow defect was found in the verified path.

Evidence (all paths relative to this directory)
  core-cors-diff.txt; core-deployed-diff.json; bucket-cors-readback.json
  compute-cors-changeset.json; compute-parameter-diff.json; api-runtime-readback.json
  production-unchanged.txt; cors-http-verification.json
  admin-project-readback.json; mobile-project-before.json
  admin-env-readback.json; mobile-env-readback.json
  admin-deployment.json; mobile-deployment.json
  admin-vercel-build.txt; mobile-vercel-build.txt
  infra-tests.txt; typecheck-final.txt; deployed-mobile-smoke.txt
  deployed-walk.txt; walk/verification.json; walk/delivery-verification.json

Screenshots
  walk/client-signed-in.png; walk/advocate-signed-in.png; walk/admin-signed-in.png
  walk/client-bell.png; walk/advocate-bell.png; walk/admin-bell.png
  walk/client-notifications.png; walk/advocate-notifications.png; walk/admin-notifications.png
  walk/advocate-dispatch.png; walk/confirm-delivery.png; walk/admin-case-completed.png
  walk/client-delivery-440.png; walk/client-delivered-441.png; walk/client-delivered-441-proof.png

Commits
  8664358 — admin Vercel build/SPA configuration, upload exclusions, walkthrough.
  c05a894 — exact Dev documents-bucket CORS origins plus infrastructure assertion.
  This report and the final walkthrough checks are committed separately.
