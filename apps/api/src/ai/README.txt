AI adapters — no application callers yet
========================================
Nest registers AI once; consumers inject the AiPort with the AI token.
No downstream mode branching. The demo timer still uses its existing fixed
draft directly. No case writes, new endpoints or mobile changes in this chunk.

generate({task:'subject'|'notice', prompt}) -> {text, simulated}
generate({task:'demands', prompt}) -> {options:string[], simulated}
The generic task parameter determines the returned shape at compile time.
Demand JSON is validated (at least two distinct non-empty options), not split
from prose. Empty, blocked, truncated and malformed output is an error.

Configuration (restart API to change adapters):
  AI_MODE                       simulated (default), gemini, bedrock
  GEMINI_API_KEY                required only for gemini; ignored .env.local
  GEMINI_MODEL                  default gemini-3.5-flash-lite
  ENVIRONMENT                   must be dev for gemini
  NODE_ENV                      must not be production for gemini
  AWS_REGION / AWS_DEFAULT_REGION  must be ap-south-1 for bedrock
  BEDROCK_SUBJECT_MODEL_ID       default in.anthropic.claude-haiku-4-5-20251001-v1:0
  BEDROCK_DEMANDS_MODEL_ID        default in.anthropic.claude-haiku-4-5-20251001-v1:0
  BEDROCK_NOTICE_MODEL_ID        default in.anthropic.claude-haiku-4-5-20251001-v1:0

Bedrock resolves the standard AWS credential chain at registration. Missing
credentials fail startup. Access/model entitlement errors are reported on
invocation. The runtime endpoint is pinned to Mumbai. Direct model IDs and the
three audited India-only profiles (Haiku 4.5, Sonnet 5 and Opus 5) are accepted;
APAC/global/unreviewed profiles and ARNs remain rejected. No alternative
region/model/provider is attempted on failure. All tasks currently use Haiku.
Sonnet 5 returned AccessDeniedException requiring an AWS Sales request on the
client's account. Once granted, set BEDROCK_NOTICE_MODEL_ID to
in.anthropic.claude-sonnet-5 to change drafting alone. No code change needed.
No IAM, model agreements, subscriptions or infrastructure changes are made here.

Gemini is for synthetic development data only. Google can use free-tier prompts
for product improvement. The key is sent in a header, never in a URL. Provider
errors redact the key and supplied prompt; requests and responses are not logged.
The free-tier model choice does not configure billing on the Google project.

Checks from apps/api:
  pnpm build
  node --test tests/ai.cjs
  node --env-file=.env.local scripts/verify-ai.cjs
The last command makes real external calls using synthetic prompts, records
responses/guards in reports/ai-providers/verification.json and exits nonzero if
any provider is blocked. It does not read application cases or the database.
Real responses carry simulated:false; the fixed simulator carries true.

Primary references checked on 2 November 2026:
  https://ai.google.dev/api/generate-content
  https://ai.google.dev/gemini-api/docs/pricing
  https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html
  https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html
