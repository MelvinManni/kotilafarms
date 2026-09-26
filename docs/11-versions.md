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
