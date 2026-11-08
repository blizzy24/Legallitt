FROM 026379630400.dkr.ecr.ap-south-1.amazonaws.com/legalitt-dev-api@sha256:9a9f786f09542f4a84828e208c7ef8597009417df62002e74f7382742df66c38
LABEL org.opencontainers.image.revision="950592aa6c450cd7fbfdaa267f34318810390a15"
LABEL org.opencontainers.image.description="Scoped isolation seed only; API remains at 92fd314"
COPY --chown=node:node seed-demo.ts /repo/apps/api/prisma/seed-demo.ts
COPY --chown=node:node seed-demo.js /repo/apps/api/dist/prisma/seed-demo.js
