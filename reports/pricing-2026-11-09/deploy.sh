#!/usr/bin/env bash
# Authorized development Compute rollout only; run from repository root in Git Bash.
set -euo pipefail
export AWS_PAGER=''
export MSYS_NO_PATHCONV=1
python3() { python "$@"; }
aws() { command aws "$@" | tr -d '\r'; }
export -f python3 aws
region=ap-south-1
stack=LegalittDev-Compute-DevelopmentOnly
repo=026379630400.dkr.ecr.ap-south-1.amazonaws.com/legalitt-dev-api
out=reports/pricing-2026-11-09
phase=${1:?phase required}
tag=${2:?reviewed image tag required}
[[ "$tag" =~ ^[a-f0-9]{7,40}$ ]] || exit 2
case "$phase" in
  image)
    test "$(git rev-parse --short=7 HEAD)" = "$tag"
    git diff --quiet HEAD -- apps/api packages/shared package.json pnpm-lock.yaml
    docker build --platform linux/arm64 -f apps/api/Dockerfile -t "$repo:$tag" .
    aws ecr get-login-password --region "$region" | docker login --username AWS --password-stdin "${repo%/*}"
    docker push "$repo:$tag"
    aws ecr describe-images --region "$region" --repository-name legalitt-dev-api --image-ids "imageTag=$tag" > "$out/image.json"
    ;;
  migrate) bash infra/scripts/dev-ops-task.sh migrate "$tag" ;;
  prepare)
    aws cloudformation describe-stacks --region "$region" --stack-name "$stack" > "$out/stack-before.json"
    python - "$out" "$tag" <<'PY'
import json,sys,pathlib
p=pathlib.Path(sys.argv[1]); s=json.loads((p/'stack-before.json').read_text())['Stacks'][0]
assert s['StackStatus']=='UPDATE_COMPLETE'
assert '026379630400' in s['StackId']
params=[{'ParameterKey':x['ParameterKey'], **({'ParameterValue':sys.argv[2]} if x['ParameterKey']=='ApiImageTag' else {'UsePreviousValue':True})} for x in s['Parameters']]
assert any(x['ParameterKey']=='ApiImageTag' for x in params)
(p/'parameters.json').write_text(json.dumps(params))
PY
    aws cloudformation create-change-set --region "$region" --stack-name "$stack" --change-set-name "pricing-$tag" --change-set-type UPDATE --use-previous-template --capabilities CAPABILITY_NAMED_IAM --parameters "file://$(cygpath -m "$out/parameters.json")" > "$out/change-set-created.json"
    aws cloudformation wait change-set-create-complete --region "$region" --stack-name "$stack" --change-set-name "pricing-$tag"
    aws cloudformation describe-change-set --region "$region" --stack-name "$stack" --change-set-name "pricing-$tag" > "$out/change-set-reviewed.json"
    ;;
  execute)
    # The agent must inspect change-set-reviewed.json before invoking this phase.
    aws cloudformation execute-change-set --region "$region" --stack-name "$stack" --change-set-name "pricing-$tag"
    ;;
  seed)
    # Only after the API and frontend have been verified on this release.
    bash infra/scripts/dev-ops-task.sh seed-pricing "$tag"
    ;;
  *) exit 2 ;;
esac
