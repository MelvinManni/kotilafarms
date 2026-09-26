# Kotila Farm — production image (Next.js standalone output).
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
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# Chromium prints the PDF reports
RUN apk add --no-cache chromium
ENV CHROMIUM_PATH=/usr/bin/chromium INTERNAL_APP_URL=http://127.0.0.1:3000
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# Migrations run from a separate one-off service (see docker-compose.yml `migrate`).
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
