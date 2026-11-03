Deployed Gemini activation — 3 November 2026

Credential and model gate (before infrastructure changes): PASS.
The supplied credential works with the adapter's x-goog-api-key header. Google
returned HTTP 200 for models/gemini-3.5-flash-lite and for generateContent,
responding "Gemini connection verified". The model supports generateContent.
Its AQ prefix is not evidence of an invalid key: Google now supports authorization
API keys as well as standard keys. No OAuth bearer-token conversion was needed.
https://aistudio.google.com/docs/api-key

Deployment:
- Credential stored as a raw Secrets Manager string: legalitt-dev/gemini-api-key.
  Only metadata is saved here; the value is never written to repository files.
- Dev Compute's GeminiSecretArn CloudFormation parameter carries only its ARN.
- ECS Secrets.ValueFrom injects GEMINI_API_KEY at startup. This uses the existing
  adapter unchanged, without a new API image. It is cleaner than adding a second
  runtime secret loader for an adapter that already takes an environment value.
- Only the execution role receives GetSecretValue for this exact secret; the
  permission boundary permits that same resource. No wildcard secret access,
  application/ops role grant, Bedrock permission, Core or production change.
- CDK sets AI_MODE=gemini and GEMINI_MODEL=gemini-3.5-flash-lite on the dev API
  task only. Module default remains simulated. ENVIRONMENT=dev and
  NODE_ENV=development retain the existing development-only guard.
- CloudFormation deployment completed successfully. ECS rollout COMPLETED; one
  task running, none pending. Post-deploy diff: zero differences for Dev Core
  and Dev Compute.
- Task revision: legalitt-dev-api:3. Image unchanged: 9e9d2611e7e7.
- Rotating this secret requires a new ECS task to receive its new value.
  https://docs.aws.amazon.com/AmazonECS/latest/developerguide/secrets-envvar-secrets-manager.html
- CDK's password-name warning on GeminiSecretArn is a name heuristic: this
  parameter is an ARN, not a credential. Readback and credential scan confirm it.

Deployed browser verification:
Signed in through https://legalitt-5.vercel.app as demo-client@legalitt.invalid.
Created synthetic Legal Notice LN-2026-0010 (f57b7ba1-2fc5-445e-a2a9-7774bf6b2fb5),
completed notice type/subject matter, noticee, sender and legal demand steps,
selected a generated option, and continued to Documents.
Both generation responses carried simulated=false. The subject and selected
demand were saved on the case. subject_generated and demand_options_generated
events have source=real. The results differ from the simulator constants.

Actual subject:
Legal Notice for Recovery of ₹5,000 for Website Design Services

Actual demand options:
1. Demand immediate payment of the outstanding invoice amount of ₹5,000 for website design services
2. Demand written confirmation of settlement regarding the unpaid website design services

Failure handling:
The adapter throws on quota/provider errors; there is no canned fallback. The
API converts that to HTTP 502. Since the deployed stack is development, its
response includes the sanitized provider reason; production uses the existing
"Could not generate suggestions. Please try again." message.
The screen renders a nonmodal inline alert and clears its busy state. Subject
failure preserves the typed dispute and remains on step 1; Continue retries.
Demand failure leaves Generate options and the custom-demand field usable.

Verification used browser-only injected HTTP 502 responses shaped like the
API's quota error, not deliberate exhaustion of Google's quota. Both steps
displayed RESOURCE_EXHAUSTED inline, stayed responsive, and recovered via the
existing retry controls; retries called the actual deployed API and Gemini.
The adapter's automated 429/error/redaction/no-fallback and startup-guard tests
also pass. No browser exception or blocking dialog occurred.

Screenshots:
- generated-demands.png — actual generated demand options on the deployed site
- subject-rate-limit.png — subject failure keeps the typed form and Continue
- demands-rate-limit.png — demand failure shows the retry and custom input

Evidence:
- direct-key-check.json — sanitized direct Google response facts
- secret-metadata.json / task-readback.json — ARN-only configuration
- credential-audit.json — no credential found in the repository, CloudFormation,
  task definition or recent API logs (raw logs/secret stayed in memory)
- compute-diff.txt / deploy.txt — reviewed scope and CDK deployment
- postdeploy-diff.txt / service-after.json — deployment matches CDK; ECS stable
- health.json — live API health response
- intake-result.json / browser-check.txt — real outputs, saved values and events
- infra-tests.txt / ai-tests.txt / typecheck.txt — passing checks
- scripts/verify-deployed-gemini.cjs — reproducible opt-in deployed UI check

The first UI-check attempt expected HTTP 200 for Nest's successful POST; the API
correctly returned 201. Corrected the test and resumed the same case. It contains
two real subject-generation events from those two attempts, not two test cases.
No mobile code, local credentials, API image or simulator timers were changed.
