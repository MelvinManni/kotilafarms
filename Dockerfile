# Kotila Farm — production image (Next.js standalone output). Runs the app; the database lives elsewhere (AWS RDS in production).
# NODE_VERSION: Node.js Active LTS major (24, checked 2026-09-26; 26 becomes LTS on 2026-10-28).
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build && pnpm build:db-scripts

FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# Chromium prints the PDF reports
RUN apk add --no-cache chromium
# Amazon RDS certificates, so `?sslmode=verify-full` connections to RDS are trusted
RUN wget -qO /usr/local/share/rds-global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem && chmod 644 /usr/local/share/rds-global-bundle.pem
ENV CHROMIUM_PATH=/usr/bin/chromium INTERNAL_APP_URL=http://127.0.0.1:3000 NODE_EXTRA_CA_CERTS=/usr/local/share/rds-global-bundle.pem MIGRATIONS_DIR=/app/db/migrations
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# Run on every start by docker-start.sh; also usable alone: `node db-migrate.cjs`, `node db-setup.cjs`
COPY --from=build --chown=nextjs:nodejs /app/dist/db-migrate.cjs /app/dist/db-setup.cjs ./
COPY --chown=nextjs:nodejs --chmod=755 docker-start.sh ./
COPY --from=build --chown=nextjs:nodejs /app/src/db/migrations ./db/migrations
USER nextjs
EXPOSE 3000
CMD ["./docker-start.sh"]
