#!/usr/bin/env bash
set -euo pipefail
export AWS_PAGER='' MSYS_NO_PATHCONV=1 PYTHONIOENCODING=utf-8 PYTHONUTF8=1
aws() { command aws "$@" | tr -d '\r'; }
python3() { command python "$@"; }
export -f aws python3
bash infra/scripts/dev-ops-task.sh "${1:?operation required}" "${2:?image tag required}"
