# Legalitt API image (linux/arm64 for Fargate Graviton). Build from the repo root:
#   docker build -f apps/api/Dockerfile --platform linux/arm64 -t legalitt-api .
# One image serves the API and its one-off ops tasks (migrate, seed), so it keeps
# the Prisma CLI. Nothing secret is baked in: every credential comes from Secrets
# Manager at run time through the task role.
FROM node:22-bookworm-slim AS build
# Prisma detects the OpenSSL version to pick its schema engine; slim has no openssl.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.34.7 --activate
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter @legalitt/api... --config.only-built-dependencies=prisma --config.only-built-dependencies=@prisma/engines
COPY tsconfig.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @legalitt/shared build && pnpm --filter @legalitt/api build
# Fetch the Linux schema engine now, so migrate never downloads at run time.
RUN cd apps/api && pnpm exec prisma version >/dev/null

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=development
# The RDS certificate authority: the API verifies the database certificate
# (database.ts rejectUnauthorized), and Node reads this bundle at start.
ADD https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /etc/ssl/rds/global-bundle.pem
RUN chmod 0755 /etc/ssl/rds && chmod 0644 /etc/ssl/rds/global-bundle.pem
# Prisma's schema engine (migrate) trusts only the first certificate in a file, and
# the global bundle does not start with Mumbai's. Extract the ap-south-1 root the
# database is pinned to (CACertificateIdentifier rds-ca-rsa2048-g1) for migrate.
RUN cd /tmp && awk '/BEGIN CERT/{n++} {print > ("cert-" n ".pem")}' /etc/ssl/rds/global-bundle.pem \
 && for f in cert-*.pem; do if openssl x509 -noout -subject -in "$f" | grep -q "ap-south-1 Root CA RSA2048 G1"; then cp "$f" /etc/ssl/rds/ap-south-1-rsa2048-g1.pem; fi; done \
 && rm -f cert-*.pem && test -s /etc/ssl/rds/ap-south-1-rsa2048-g1.pem && chmod 0644 /etc/ssl/rds/ap-south-1-rsa2048-g1.pem
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/rds/global-bundle.pem
ENV PRISMA_RDS_CA=/etc/ssl/rds/ap-south-1-rsa2048-g1.pem
WORKDIR /repo
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
USER node
CMD ["node", "dist/src/main.js"]
