#!/usr/bin/env bash
# Run from the repository root; shell-only Windows compatibility for this report.
set -euo pipefail
export AWS_PAGER=''
export MSYS_NO_PATHCONV=1
python3() { python "$@"; }
aws() { command aws "$@" | tr -d '\r'; }
export -f python3 aws
bash infra/scripts/dev-ops-task.sh "$@"
