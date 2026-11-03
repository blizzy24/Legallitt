Approved isolated deployed AI failure verification — 3 November 2026

Case: LN-2026-0012 / 65ca3bca-229d-4dc6-9d4a-c89ea420dcce
Sender: TEST ONLY - AI and progression sender
Noticee: TEST ONLY - no real notice recipient
These party names are the values the admin table renders in its Matter column.
The case is still a draft: unpaid drafts are excluded from the admin list by
design. Its directly accessible admin detail visibly shows both TEST ONLY names.
No shared demo-account name was changed.

Method and limits:
- One-off Dev ECS ops task using the exact deployed notice-ai-errors-20261103
  image, digest 6c429333e78f406ca25f6ce1cfe01c14728e02f97cb4c4e6f87241145f5808fd.
- Upstream 429 RESOURCE_EXHAUSTED and 503 UNAVAILABLE were injected only inside
  this isolated process. This was controlled fault injection, not a Google outage.
- Cognito sign-in, HTTP guards/controllers, RDS writes and CloudWatch were real.
- The task returned the real handler's HTTP 502 response bodies. An isolated
  browser on legalitt-5.vercel.app replayed exactly those bodies for one request
  each, then retried both operations against the unmodified public API/Gemini.
- The public API configuration, credentials, Core and production were unchanged.

What the client saw:
Subject: Couldn’t generate the subject just now. Please try again.
Demands: Couldn’t generate suggestions just now. Try again, or type your own.
Neither provider code nor model details appeared. Subject input remained intact.
The custom demand field remained usable; both retries succeeded and the flow
reached Documents. No page errors or blocking dialogs.

What the logs recorded:
CloudWatch group /legalitt-dev/api, stream
ops/ops/51733580740c4f818cd57645d80f9c59.
NoticeIntakeAiController logged the case UUID, task, provider Gemini, model
gemini-3.5-flash-lite, the exact codes RESOURCE_EXHAUSTED and UNAVAILABLE, and
the controlled upstream diagnostic. No key, token, password or prompt was logged.

What the case events recorded (read back from the public API):
- Event 77: subject_generation_failed; code RESOURCE_EXHAUSTED; task subject.
- Event 78: demand_options_generation_failed; code UNAVAILABLE; task demands.
Both: provider Gemini, model gemini-3.5-flash-lite, source real, actor_role client,
actor_id aadf5486-cb3e-4379-b7aa-6def2f688d84; from_status/to_status null.
The failure writes did not change lifecycle, saved subject or saved demands.
The normal browser retries then appended their normal success events.

Cleanup accounting:
- Both ECS task attempts are STOPPED; no running verification task remains.
- Attempt 1 (c50c1f30a4cb4d169f73f1b4a9dc87e8, exit 1) exposed a test-harness
  Response.ok property typo. It stopped after sign-in, before either AI request.
- Attempt 2 (51733580740c4f818cd57645d80f9c59, exit 0) completed all checks.
- RDS retains the labelled existing test draft, its two failure events, ordinary
  retry success events, saved test intake fields, and normal password-login audit
  entries. No payment, shipment, POD, S3 object or new user was created by this
  verification. These are intentional test/audit records; none needs emergency
  cleanup. They were not deleted or disguised as a production case.
- CloudWatch retains both attempts' startup/error/result logs under its existing
  14-day retention. No retention setting was changed; manual deletion is optional.

Evidence:
deployed-subject-error.png / deployed-demand-error.png — actual deployed UI
admin-test-case.png — visibly labelled test case in the deployed admin detail
browser-result.json / browser-check.txt — messages, retry checks and public API events
task-result.json — actual isolated-task HTTP responses and RDS events
cloudwatch.json — successful task's CloudWatch logs
task-final.json / log-retention.json — stopped tasks and 14-day retention
task-request*.json / task-start*.json / cloudwatch-attempt1.json — attempt audit

Later verification: this same labelled draft was advanced to completed in the
approved progression rollout walk. Its earlier no-payment/no-shipment findings
above describe the isolated AI test at that time. See
reports/demo-progression-2026-11-03/README.txt for the later workflow and uploads.
