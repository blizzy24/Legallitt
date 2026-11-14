#!/usr/bin/env bash
set -euo pipefail
# Final bundle captures for early states whose layout changed during the first walk.
export COURT_WALK_OUT=reports/court-polish-20261114/final-captures
for stage in intakes assignment paid-changes documents; do
  node scripts/verify-court-representation.cjs "--stage=$stage" > "reports/court-20261114/polish-final-$stage.log" 2>&1
  printf 'PASS final captures %s\n' "$stage"
done
