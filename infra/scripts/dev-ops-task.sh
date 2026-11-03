#!/usr/bin/env bash
# Runs one ops command (migrate, seed, seed-demo) inside the development VPC as a
# one-off Fargate task, waits for it, and prints its exit code and log tail.
#   infra/scripts/dev-ops-task.sh migrate|seed|seed-demo
set -euo pipefail
STACK=LegalittDev-Compute-DevelopmentOnly
REGION=ap-south-1
case "${1:-}" in
  migrate)   CMD='["node","scripts/migrate-deploy.cjs"]' ;;
  seed)      CMD='["node","dist/prisma/seed.js"]' ;;
  seed-demo) CMD='["node","dist/prisma/seed-demo.js"]' ;;
  *) echo "usage: $0 migrate|seed|seed-demo" >&2; exit 2 ;;
esac
out() { aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }
CLUSTER=$(out ClusterName); TASKDEF=$(out OpsTaskDefinitionArn); SUBNETS=$(out TaskSubnetIds); SG=$(out TaskSecurityGroupId)
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
