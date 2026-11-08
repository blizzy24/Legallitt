Legalitt dev API deployment and deployed browser verification — 9 November 2026

DEPLOYED
API source: 92fd3140a6413cdf7d4f86abc5baaf60c7265c34.
Image: 026379630400.dkr.ecr.ap-south-1.amazonaws.com/legalitt-dev-api:92fd314
Digest: sha256:9a9f786f09542f4a84828e208c7ef8597009417df62002e74f7382742df66c38
Migration 202611080001_service_references completed with exit 0 before the
CloudFormation change set was executed. Only the image parameter changed.
LegalittDev-Compute-DevelopmentOnly: UPDATE_COMPLETE.
ECS legalitt-dev-api:11: one RUNNING/HEALTHY task, rollout COMPLETED.
Public /health returned 200 with status=ok after the walkthrough.
Core, production, frontend deployments and infrastructure sizing were unchanged.

The original dev-ops-task.sh invocation was tried in Git Bash. It failed before
launching a task because python3 resolved to the Windows Store placeholder.
The successful invocation mapped python3 to installed Python 3.13 in that shell,
normalized Windows AWS CLI CRLF output, and disabled MSYS argument-path conversion.
The helper's migration implementation was not changed.

PERMANENT SECOND CLIENT
Source commit: 950592a, committed locally and not pushed. Pushing could trigger
Vercel's automatic frontend deployments, which the owner explicitly excluded.
Account: demo-client-isolation@legalitt.invalid, using the existing demo secret.
Deployed owned draft: LN-2026-0020, 28e9dbf2-0e04-4a6d-8c54-03fe9e58da61.
Full demo seeding and future password-maintenance verification include all seven
accounts. The scoped seed-client-isolation command touches only the new account
and its tagged case, and never resets an existing confirmed password.
Local integration ran the scoped seed twice: exactly one owned case was retained;
the original six Cognito account modification times were unchanged; all seven
modification times were unchanged on rerun. No email or SMS was sent.
Deployed seeding used the separate 950592a-seed-only ops image, built by overlaying
the compiled, validated seed from that commit on the immutable 92fd314 image.
This seed-only image was never assigned to the API service.

DEPLOYED LEGAL NOTICE WALKTHROUGH — PASSED
Mobile/client/advocate: https://legalitt-5.vercel.app
Admin: https://legalitt-admin-panel.vercel.app
Case: LN-2026-0021, a57919a4-2ee1-4431-b79b-6b9161947306, completed.
All three roles signed in through the real browser forms in separate profiles.
Client: selected the matter, supplied intake, uploaded a labelled synthetic PDF,
completed the existing simulated identity flow, submitted and paid through UI.
Admin: assigned the case to the seeded advocate through the picker.
Advocate: accepted, reviewed documents, edited Background & Facts, generated the
PDF and shared it for client review.
Client: approved the draft through the tracking screen.
Advocate: entered synthetic courier details and confirmed dispatch through UI.
Admin: uploaded the labelled synthetic proof, recorded receipt and confirmed
delivery through UI. The case reached completed.
Client: opened Notice Delivered and View Proof. The downloaded proof matched
the admin's original upload byte-for-byte (SHA-256 in walk/verification.json).
The assignment, acceptance, drafting, review, approval, dispatch and completion
events all have source=real, confirming the role actions were UI-driven.
Payment, KYC and courier providers retain their existing simulated adapters.
This was a synthetic test; no actual dispute, physical dispatch or delivery took
place. Generated/uploaded verification material is labelled accordingly.
Final browser run reported zero page errors.

The walkthrough resumed the SAME case after harness corrections: a renamed
sender field label, waiting for data before editing, and recognizing cached 304
responses. A premature edit during an earlier run cleared the notice type; UI
validation refused submission. The test restored the type through the UI and
continued. No direct API mutation or response interception bypassed any step.

BIDIRECTIONAL CLIENT ISOLATION — PASSED
1. Isolation client -> existing client's LN-2026-0021: API 404, Case not found.
   The direct tracking URL showed Case not found and no foreign reference/data.
2. Existing demo client -> isolation client's LN-2026-0020: API 404, Case not found.
   The direct tracking URL showed Case not found and no foreign reference/data.
Both clients' positive controls returned 200 for their OWN case. The checks ran
against the deployed API and actual deployed frontend, with no mocked responses.

EVIDENCE
deployment-verification.json       Stack, task, image digest and health readback
migration-succeeded.txt            Migration task and successful ordering
changeset-review.json              Image-only change set
seed-local-verification.json       Seed rerun and credential-preservation checks
seed-deployed.txt                  Deployed seed image, task and owned case
ops-image/provenance.json          Seed source/compiled hashes and immutable base
walk/verification.json             UI lifecycle, event provenance, proof hash
walk/browser-network*.json         Browser API status evidence across resumed runs
walk/client-delivered.png          Final client delivery screen
walk/admin-completed.png           Admin's completed case and audit timeline
isolation/verification.json        Both direct-URL checks and own-case controls
isolation/*-foreign-case.png       Browser refusals, both directions

REPEATABLE CHECKS (Git Bash, Node 22; explicit dev mutations)
node scripts/verify-client-isolation-seed.cjs
node scripts/verify-deployed-legal-notice.cjs
node scripts/verify-deployed-client-isolation.cjs
These load ignored apps/api/.env.local for AWS configuration. Credentials and
tokens remain in memory. CHROME_PATH can override the Windows Chrome location.
The lifecycle check resumes the case recorded in walk/case.json; it does not
silently create another case after completion. The isolation check uses this
known case and discovers the second client's own seeded draft.

Validation: shared/API builds passed; all workspace typechecks passed. The seed
and evidence commits remain local so this task cannot trigger Vercel deployments.
