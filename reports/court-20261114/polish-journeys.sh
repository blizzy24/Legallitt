#!/usr/bin/env bash
set -euo pipefail
export COURT_WALK_OUT=reports/court-polish-20261114/journeys
for stage in paid-changes documents review fees-filing hearings completion edges capture process-fee capture-extra; do
  node scripts/verify-court-representation.cjs "--stage=$stage" > "reports/court-20261114/polish-$stage.log" 2>&1
  printf 'PASS %s\n' "$stage"
done
