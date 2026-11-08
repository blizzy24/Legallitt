#!/usr/bin/env bash
# Runs one ops command (migrate, seed, seed-demo) inside the development VPC as a
# one-off Fargate task, waits for it, and prints its exit code and log tail.
#   infra/scripts/dev-ops-task.sh migrate|seed|seed-demo|seed-client-isolation [IMAGE_TAG]
# With IMAGE_TAG the command runs in that image instead of the deployed one, so a
# new image's migrations can run before the API is deployed on it (AGENTS.md).
# The one-off task definition revision is deregistered afterwards.
set -euo pipefail
STACK=LegalittDev-Compute-DevelopmentOnly
REGION=ap-south-1
case "${1:-}" in
  migrate)   CMD='["node","scripts/migrate-deploy.cjs"]' ;;
  seed)      CMD='["node","dist/prisma/seed.js"]' ;;
  seed-demo) CMD='["node","dist/prisma/seed-demo.js"]' ;;
  seed-client-isolation) CMD='["node","dist/prisma/seed-demo.js","--client-isolation-only"]' ;;
  *) echo "usage: $0 migrate|seed|seed-demo|seed-client-isolation [IMAGE_TAG]" >&2; exit 2 ;;
esac
out() { aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }
CLUSTER=$(out ClusterName); TASKDEF=$(out OpsTaskDefinitionArn); SUBNETS=$(out TaskSubnetIds); SG=$(out TaskSecurityGroupId)
if [ -n "${2:-}" ]; then
  [[ "$2" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "bad image tag" >&2; exit 2; }
  # Same definition as the deployed ops task, image tag swapped.
  INPUT=$(aws ecs describe-task-definition --region "$REGION" --task-definition "$TASKDEF" --query taskDefinition --output json |
    python3 -c 'import json,sys
d=json.load(sys.stdin); c=d["containerDefinitions"][0]
c["image"]=c["image"].rsplit(":",1)[0]+":"+sys.argv[1]
print(json.dumps({k:d[k] for k in ["family","taskRoleArn","executionRoleArn","networkMode","containerDefinitions","volumes","placementConstraints","requiresCompatibilities","cpu","memory","runtimePlatform"] if k in d}))' "$2")
  TASKDEF=$(aws ecs register-task-definition --region "$REGION" --cli-input-json "$INPUT" --query taskDefinition.taskDefinitionArn --output text)
  trap 'aws ecs deregister-task-definition --region "$REGION" --task-definition "$TASKDEF" >/dev/null' EXIT
  echo "image tag $2 (one-off ${TASKDEF##*/})"
fi
# A public IP gives the task ECR, Secrets Manager and Cognito without a NAT.
ARN=$(aws ecs run-task --region "$REGION" --cluster "$CLUSTER" --task-definition "$TASKDEF" --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${SUBNETS}],securityGroups=[$SG],assignPublicIp=ENABLED}" \
  --overrides "{\"containerOverrides\":[{\"name\":\"ops\",\"command\":$CMD}]}" --query 'tasks[0].taskArn' --output text)
echo "task $ARN"
aws ecs wait tasks-stopped --region "$REGION" --cluster "$CLUSTER" --tasks "$ARN"
read -r CODE REASON < <(aws ecs describe-tasks --region "$REGION" --cluster "$CLUSTER" --tasks "$ARN" \
  --query 'tasks[0].[containers[0].exitCode, stoppedReason]' --output text)
echo "exit $CODE ($REASON)"
aws logs tail "/legalitt-dev/api" --region "$REGION" --log-stream-name-prefix "ops/ops/${ARN##*/}" --since 30m --format short 2>/dev/null | tail -40 || true
[ "$CODE" = "0" ]
