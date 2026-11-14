#!/usr/bin/env bash
# Dev image-only update: reuses the deployed template and all other parameters.
set -euo pipefail
export AWS_PAGER='' MSYS_NO_PATHCONV=1 PYTHONIOENCODING=utf-8 PYTHONUTF8=1
aws() { command aws "$@" | tr -d '\r'; }
region=ap-south-1
stack=LegalittDev-Compute-DevelopmentOnly
repo=026379630400.dkr.ecr.ap-south-1.amazonaws.com/legalitt-dev-api
out=reports/legal-advice-20261114/deploy
mkdir -p "$out"
phase=${1:?phase required}; tag=${2:?reviewed image tag required}
[[ "$tag" =~ ^[a-f0-9]{7,40}$ ]] || exit 2
test "$(aws sts get-caller-identity --query Account --output text)" = 026379630400
case "$phase" in
 image)
  test "$(git rev-parse --short=7 HEAD)" = "$tag"
  git diff --quiet HEAD -- apps/api packages/shared package.json pnpm-lock.yaml
  proxy_args=()
  if [[ "${NOTICE_BUILD_HOST_PROXY:-0}" == 1 ]]; then
    proxy_args=(--build-arg HTTP_PROXY=http://host.docker.internal:3017 --build-arg HTTPS_PROXY=http://host.docker.internal:3017 --build-arg http_proxy=http://host.docker.internal:3017 --build-arg https_proxy=http://host.docker.internal:3017)
  fi
  docker build "${proxy_args[@]}" --platform linux/arm64 -f apps/api/Dockerfile -t "$repo:$tag" .
  aws ecr get-login-password --region "$region" | docker login --username AWS --password-stdin "${repo%/*}"
  docker push "$repo:$tag"
  aws ecr describe-images --region "$region" --repository-name legalitt-dev-api --image-ids "imageTag=$tag" > "$out/image.json"
  docker buildx imagetools inspect "$repo:$tag" --raw > "$out/image-manifest.json"
  ;;
 prepare)
  aws cloudformation describe-stacks --region "$region" --stack-name "$stack" > "$out/stack-before.json"
  python - "$out" "$tag" <<'PY'
import json,sys,pathlib
p=pathlib.Path(sys.argv[1]); s=json.loads((p/'stack-before.json').read_text())['Stacks'][0]
assert s['StackStatus']=='UPDATE_COMPLETE' and '026379630400' in s['StackId']
params=[{'ParameterKey':x['ParameterKey'], **({'ParameterValue':sys.argv[2]} if x['ParameterKey']=='ApiImageTag' else {'UsePreviousValue':True})} for x in s['Parameters']]
(p/'parameters.json').write_text(json.dumps(params))
PY
  aws cloudformation create-change-set --region "$region" --stack-name "$stack" --change-set-name "advice-$tag" --change-set-type UPDATE --use-previous-template --capabilities CAPABILITY_NAMED_IAM --parameters "file://$(cygpath -m "$out/parameters.json")" > "$out/change-set-created.json"
  aws cloudformation wait change-set-create-complete --region "$region" --stack-name "$stack" --change-set-name "advice-$tag"
  aws cloudformation describe-change-set --region "$region" --stack-name "$stack" --change-set-name "advice-$tag" > "$out/change-set-reviewed.json"
  ;;
 execute) aws cloudformation execute-change-set --region "$region" --stack-name "$stack" --change-set-name "advice-$tag" ;;
 verify)
  task=$(aws ecs list-tasks --region "$region" --cluster legalitt-dev-cluster --service-name legalitt-dev-api --desired-status RUNNING --query 'taskArns[0]' --output text)
  aws ecs describe-tasks --region "$region" --cluster legalitt-dev-cluster --tasks "$task" > "$out/running-task.json"
  python - "$out" "$tag" <<'PY'
import json,sys,pathlib
p=pathlib.Path(sys.argv[1]); t=json.loads((p/'running-task.json').read_text())['tasks'][0]
c=t['containers'][0]; manifest=json.loads((p/'image-manifest.json').read_text())
allowed={x['digest'] for x in manifest.get('manifests',[]) if x.get('platform',{}).get('architecture')=='arm64'}
allowed.add(json.loads((p/'image.json').read_text())['imageDetails'][0]['imageDigest'])
assert c['image'].endswith(':'+sys.argv[2]) and c['imageDigest'] in allowed
assert t['lastStatus']=='RUNNING' and t['healthStatus']=='HEALTHY'
print('PASS healthy ARM64 image '+c['imageDigest'])
PY
  ;;
 *) exit 2 ;;
esac
