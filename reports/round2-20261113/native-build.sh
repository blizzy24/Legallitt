#!/usr/bin/env bash
set -euo pipefail
export AWS_PAGER=''
unset MSYS_NO_PATHCONV
repo=026379630400.dkr.ecr.ap-south-1.amazonaws.com/legalitt-dev-api
tag=7bc60d0
out=reports/round2-20261113/deploy
git diff --quiet 3a7631d "$tag" -- apps/api/package.json packages/shared/package.json package.json pnpm-lock.yaml
git diff --quiet "$tag" -- apps/api packages/shared
node --version
pnpm --filter @legalitt/shared build
pnpm --filter @legalitt/api build
echo 'PASS native build of exact source; dependency manifests and lockfile unchanged'
export MSYS_NO_PATHCONV=1
docker build --platform linux/arm64 -f reports/round2-20261113/Dockerfile.native-build -t "$repo:$tag" .
docker run --rm --entrypoint node "$repo:$tag" -e 'console.log(process.arch);require("./dist/src/app.module.js");require("./dist/prisma/seed-round2.js");console.log("PASS ARM64 application and seed modules load")'
docker push "$repo:$tag"
aws ecr describe-images --region ap-south-1 --repository-name legalitt-dev-api --image-ids "imageTag=$tag" > "$out/image.json"
docker buildx imagetools inspect "$repo:$tag" --raw > "$out/image-manifest.json"
