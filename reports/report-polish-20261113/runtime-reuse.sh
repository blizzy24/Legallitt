#!/usr/bin/env bash
set -euo pipefail
export AWS_PAGER='' MSYS_NO_PATHCONV=1
repo=026379630400.dkr.ecr.ap-south-1.amazonaws.com/legalitt-dev-api
tag=3a7631d
out=reports/report-polish-20261113/deploy
git diff --quiet 1bff6f2 "$tag" -- apps/api/package.json packages/shared/package.json package.json
git diff --quiet "$tag" -- apps/api packages/shared
# Only mobile importer/dependency additions occurred in the lockfile. Check all
# pre-existing package resolutions and dependency snapshots before runtime reuse.
node reports/report-polish-20261113/check-runtime-lock.cjs
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin "${repo%/*}"
docker build --platform linux/arm64 -f reports/report-polish-20261113/Dockerfile.runtime-reuse -t "$repo:$tag" .
docker push "$repo:$tag"
aws ecr describe-images --region ap-south-1 --repository-name legalitt-dev-api --image-ids "imageTag=$tag" > "$out/image.json"
docker buildx imagetools inspect "$repo:$tag" --raw > "$out/image-manifest.json"
