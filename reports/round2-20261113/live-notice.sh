#!/usr/bin/env bash
set -euo pipefail
for stage in intakes drafts admin cancellation; do
  node scripts/verify-round2-notice.cjs --live --only="$stage"
done
