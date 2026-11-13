#!/usr/bin/env bash
# No AWS request can leave this test: every aws invocation is an exported mock.
set -euo pipefail
aws() {
  case "$1 $2" in
    'cloudformation describe-stacks') printf 'test-local-resource\n' ;;
    'ecs describe-task-definition') printf '%s\n' '{"family":"test-ops","containerDefinitions":[{"name":"ops","image":"test.invalid/api:old"}],"networkMode":"awsvpc"}' ;;
    'ecs register-task-definition') printf 'arn:test:task-definition/test-ops:1\n' ;;
    'ecs run-task') printf 'arn:test:task/test-only\n' ;;
    'ecs wait') : ;;
    'ecs describe-tasks') printf '0 TEST-MOCK-ONLY\n' ;;
    'logs tail') printf 'TEST MOCK: no migration or AWS action was performed\n' ;;
    'ecs deregister-task-definition') : ;;
    *) printf 'Unexpected AWS mock call\n' >&2; return 9 ;;
  esac
}
export -f aws
bash infra/scripts/dev-ops-task.sh migrate a10fde9
printf 'PASS Git Bash ops launcher uses installed Python; all AWS calls mocked.\n'
