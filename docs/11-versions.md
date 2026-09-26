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
| | | | |
