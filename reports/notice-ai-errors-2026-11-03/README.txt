Legal Notice AI error copy — 3 November 2026

Commit f8f946b pushed to main. Image notice-ai-errors-20261103 published and
deployed to LegalittDev-Compute-DevelopmentOnly on 3 November 2026.
CloudFormation UPDATE_COMPLETE; ECS task legalitt-dev-api:4 stable; /health OK.

Subject generation now returns:
Couldn’t generate the subject just now. Please try again.

Demand generation now returns:
Couldn’t generate suggestions just now. Try again, or type your own.

Both messages apply in development and production. The subject screen has no
manual subject-line field, so only the demand message offers a custom input.
API-owned instructed copy is in apps/api/src/copy/instructed.ts and registered
with the Approved block in architecture §9.2. No mobile layout or retry code
was changed. The client still retries with Continue or Generate options.

Diagnostics:
- AiProviderError now exposes its existing provider/model/code as typed fields.
- The API logs the actual provider code and its already-redacted diagnostic.
- Each failed request writes subject_generation_failed or
  demand_options_generation_failed to case_events, source=real, attributed to
  the client who requested it. The payload contains task, actual provider code,
  provider/model where known and provider request ID if available.
- No prompts, credentials or party details are stored in failure payloads.
- Failures do not change status, updated_at, subject or saved demand data.
- If the audit write fails, its failure is logged and the plain HTTP 502 response
  is still returned. No provider error text is returned to the intake screen.
- Existing generation success, retry and simulator selection behaviour remains.

Checks:
- All workspace typechecks pass.
- 12 focused AI/intake tests pass, none skipped, using local Postgres 16.
  Real HTTP 502 responses and real failure-event rows are checked for both
  development and production. Upstream 429 is injected through GeminiAi,
  including credential/prompt redaction. Audit-storage failure is also checked.
- Browser verification uses the actual mobile UI with the updated local API and
  local test database. The test provider returns 429 for subject generation and
  503 for demand generation, then the existing simulator handles retry success.
  Both plain errors render; neither provider code appears in the page text.
  Continue and Generate options recover, the custom demand is preserved, and
  the flow reaches Documents. No browser errors or blocking alerts.
- The temporary test case and identity were removed after verification.
- The linux/arm64 API image builds successfully:
  legalitt-api:notice-ai-errors-20261103 (exact local ID in image-id.json).

Evidence:
subject-friendly-error.png / demands-friendly-error.png — actual local UI
browser-result.json — messages, real audit rows and captured sanitized logs
browser-check.txt — browser-check result
api-tests.txt / typecheck.txt / image-build.txt — checks

Completed deployment scope:
Publish the built image to the existing legalitt-dev-api ECR repository and
deploy only LegalittDev/Compute with ApiImageTag=notice-ai-errors-20261103.
That replaces the API/ops image revisions, retaining Gemini mode, model, secret
reference and all existing infrastructure. No migration, Core, production,
Bedrock, mobile configuration or Vercel change is needed.

Deployed verification:
- The actual legalitt-5.vercel.app intake, with unmodified API requests, created
  synthetic draft LN-2026-0012 and reached Documents. Subject and demands both
  came from Gemini. No browser errors. Evidence: live/intake-result.json,
  live/generated-demands.png, live-check.txt.
- No provider error occurred in that live check. This does not verify the live
  failure path. Upstream 429/503 behavior is verified locally above.
- Owner-approved isolated ECS verification is complete. It used the exact
  deployed image, real Cognito, real HTTP handlers, RDS and CloudWatch, with
  upstream 429/503 injected only in that task. The deployed browser replayed
  those exact HTTP responses and then retried against the public API. Both
  friendly errors and both real retries passed. See isolated/README.txt.
- deployment-readback.json and task-readback.json identify the deployed stack,
  task/image and configuration (ARNs only, no secret values).
- deploy-diff.txt, deploy.txt, health.json record the rollout.
