# Versions

## Policy

See AGENTS.md › Version policy. Look up every version with `pnpm view <pkg> version` / `dist-tags` at install time. Stable `latest` only.

## Observed at handoff (npm `latest`, 26 Sep 2026) — reference only, re-check

| Package | `latest` seen | Note |
| --- | --- | --- |
| next | 16.3.6 | needs Node ≥ 20.9 |
| react / react-dom | 19.3.0 | |
| next-auth | 4.24.15 | v5 only on `beta` (5.0.0-beta.32) → use v4 while that holds |
| drizzle-orm | 0.45.3 | 1.0 only on beta tags → do not use |
| drizzle-kit | 0.31.11 | |
| pg | 8.23.0 | or `postgres` 3.4.9 — pick one driver |
| @tanstack/react-query | 5.103.3 | devtools same version |
| zod | 4.6.5 | |
| react-hook-form | 7.89.0 | v8 only alpha/beta → do not use |
| @hookform/resolvers | 5.9.1 | |
| shadcn (CLI) | 4.21.0 | Base UI is the default for new projects |
| @base-ui/react | 1.8.0 | not `@base-ui-components/react` (RC) |
| tailwindcss | 4.3.3 | |
| vitest | 5.0.2 | |
| @playwright/test | 1.63.0 | |
| dexie | 4.4.6 | if chosen for the offline queue |
| serwist / @serwist/next | 9.5.12 | if chosen for the service worker |

## Installed (fill in as you go)

| Package | Version | Added in task | Why |
| --- | --- | --- | --- |
| next | 16.3.6 | P0.1 | Framework |
| react / react-dom | 19.3.0 | P0.1 | UI runtime |
| tailwindcss / @tailwindcss/postcss | 4.3.3 | P0.1 | Styling (Tailwind v4 only) |
| typescript | 6.0.3 | P0.1 | Types. 7.0.2 is `latest` but `typescript-eslint` 8.70.1 needs <6.1 |
| eslint | 9.39.5 | P0.1 | Lint. 10.11.0 is `latest` but crashes `eslint-plugin-react` 7.37.5 (used by `eslint-config-next`) |
| eslint-config-next | 16.3.6 | P0.1 | Next.js lint rules |
| @types/node | 24.19.0 | P0.1 | Matches Node 24 LTS runtime (26.x is `latest`) |
| @types/react / @types/react-dom | 19.3.0 | P0.1 | React types |
| vitest | 5.0.2 | P0.1 | Unit tests |
| zod | 4.6.5 | P0.3 | Validation (env now; forms and API later) |
| server-only | 0.0.1 | P0.3 | Stops server modules being bundled for the browser |
| drizzle-orm | 0.45.3 | P0.6 | ORM (1.0 is beta only) |
| drizzle-kit | 0.31.11 | P0.6 | Migrations (dev) |
| pg / @types/pg | 8.23.0 / 8.23.1 | P0.6 | Postgres driver (node-postgres) |
| @node-rs/argon2 | 2.2.1 | P0.6 | Argon2id password hashing; prebuilt binaries incl. Alpine (musl) |
| tsx | 4.23.15 | P0.6 | Runs `db:setup` (dev) |
| next-auth | 4.24.15 | P0.8 | Auth (v5 is beta only); peers allow Next 16 |
| @tanstack/react-query | 5.103.3 | P0.8 | Client data |
| @tanstack/react-query-devtools | 5.103.3 | P0.8 | Dev only |
| react-hook-form | 7.89.0 | P1.1 | Forms (v8 is alpha/beta only) |
| @hookform/resolvers | 5.9.1 | P1.1 | zod resolver |
| @playwright/test | 1.63.0 | P1.1 | Browser e2e tests (dev); uses installed Chrome when present |
| @aws-sdk/client-s3 | 3.1141.0 | P1.5 | Receipt photos in the private S3 bucket |
| @aws-sdk/s3-request-presigner | 3.1141.0 | P1.5 | Short-lived signed links to read receipts |
| @tanstack/react-query (+ devtools) | 5.104.0 | P1.8 | Upgraded from 5.103.3; the persister needs ^5.104 |
| @tanstack/react-query-persist-client / @tanstack/query-async-storage-persister | 5.104.0 | P1.8 | Keep the query cache in IndexedDB |
| idb-keyval | 6.3.0 | P1.8 | IndexedDB storage for the query cache |
| idb | 8.0.3 | P1.8 | The outbox (IndexedDB) |
| @serwist/turbopack / serwist | 9.5.12 | P1.8 | Service worker for Turbopack builds (10.x is preview only) |
| esbuild | 0.28.2 | P1.8 | Serwist builds the service worker with it (dev) |
| fake-indexeddb | 6.2.5 | P1.8 | IndexedDB in unit tests (dev) |
| shadcn | 4.21.0 | P0.4 | CLI; also provides `shadcn/tailwind.css` imported by globals.css |
| @base-ui/react | 1.8.0 | P0.4 | Primitives under shadcn components |
| cn | 0.4.0 | P0.4 | Tailwind class merge used by shadcn (replaces clsx + tailwind-merge) |
| class-variance-authority | 0.7.1 | P0.4 | Component variants |
| lucide-react | 1.48.0 | P0.4 | Icons |
| tw-animate-css | 1.4.0 | P0.4 | Enter/exit animations for dialogs and sheets |
| playwright-core | 1.63.0 | P2.6 | Prints the Set report to PDF with headless Chromium (the Docker image adds Alpine's `chromium`; dev uses the installed Chrome) |
