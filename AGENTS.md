<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Kotila Farm internal tool

This file is the contract for every agent (Claude Code or otherwise) working in this repo. Read it fully before any change. **Every change to the repo ends with a new entry in the [Change log](#change-log) at the bottom of this file.**

## What we are building

An internal web app for Kotila Farms, a broiler poultry farm in Nigeria owned by four shareholders. It replaces a WhatsApp-and-notebook record. Staff log each day on a phone (outdoors, bright sun, often offline); shareholders read the money and performance picture on a laptop.

- Product spec: `docs/01-product-spec.md` (the source of truth for behaviour)
- Design system: `design/` and `docs/08-design-system.md` (the source of truth for look)
- Screen designs: `design/screens/*.dc.html` and `docs/09-screens.md`
- Build order: `docs/10-build-plan.md` — work through it in order, one task at a time

## Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js, latest stable, App Router, TypeScript strict | `output: 'standalone'` for the container |
| Backend | Next.js Route Handlers under `app/api/**/route.ts` | The only backend surface. No Server Actions for data writes. |
| Database | PostgreSQL in Docker | |
| ORM | Drizzle ORM + drizzle-kit | Schema in `src/db/schema/*`, migrations committed |
| Auth | NextAuth (Auth.js), latest **stable** | Credentials (email + password), JWT sessions, roles in the token. See version note below. |
| Client data | TanStack Query (React Query), latest stable | All client reads and writes go through it |
| Forms | react-hook-form + @hookform/resolvers + zod | One zod schema per entity, shared by form and API |
| UI | shadcn/ui CLI (latest) with **Base UI** primitives (`@base-ui/react`), Tailwind CSS v4 | Themed with the Kotila tokens. All styling is Tailwind v4 (see Styling rule) |
| File storage | Private S3 bucket (AWS S3 or S3-compatible) | Receipt photos. Server uploads; DB stores the object key; reads use short-lived signed URLs. No files on local disk or volumes |
| Package manager | pnpm (via corepack) | |
| Tests | Vitest (unit: metrics, zod, API handlers); Playwright later for flows | |
| Container | Docker + docker compose (app + postgres), `.devcontainer/` for agent work | |

## Version policy (hard rule)

1. **Never guess a version.** Before adding or upgrading any package, look it up: `pnpm view <pkg> version` and `pnpm view <pkg> dist-tags`. Use the `latest` dist-tag.
2. **Stable only.** Never install `alpha`, `beta`, `rc`, `canary`, `next`, `experimental` or `0.0.0-*` builds, even if docs recommend them.
3. Check `peerDependencies` (`pnpm view <pkg>@<version> peerDependencies`) against what is already installed before installing.
4. Scaffold with the official CLIs at their latest versions (`pnpm create next-app@latest`, `pnpm dlx shadcn@latest init`) rather than hand-writing config they generate.
5. Record every package you add (name, exact version, why) in `docs/11-versions.md` and in the change-log entry.
6. Docker base images follow the same rule: check the current Node.js **Active LTS** and the current stable PostgreSQL major before building, and pin the major in `Dockerfile` / `docker-compose.yml`.

**Known at handoff (26 Sep 2026, re-verify):** `next-auth` `latest` is 4.24.x; v5 is still published only as `beta`. Under rule 2 that means **NextAuth v4** with the Credentials provider and JWT sessions (no DB adapter needed). If `latest` has moved to 5.x by the time you start, use v5 and note it in the change log. Base UI's package is `@base-ui/react` (the old `@base-ui-components/react` name is an RC, do not use it). shadcn's `init` now offers Base UI as the default; choose it.

## Architecture rules

- **Break everything down.** One component, hook or function per file. Keep files short (aim under 150 lines, never over 250). If a file does two things, split it.
- **Modular and reusable.** No copy-paste. Anything used twice moves to `components/kotila`, `hooks`, `utils` or `lib`.
- **UI separate from logic.** Components only render props. Data fetching lives in `src/hooks/queries`, calculations in `src/utils/metrics`, validation in `src/schemas`, database access in `src/server`.
- **Scan before you create.** Search the repo for an existing component, hook or util before writing a new one.
- **One metrics module.** Every derived number (live birds, mortality rate, FCR, ADG, uniformity, cost per bird, P&L, cash position, loan interest) comes from `src/utils/metrics/*` and is unit-tested. Screens, API and PDF all use it. Never compute a business number inside a component.
- **Server is the gatekeeper.** Every route handler: check session → check role → validate with the shared zod schema → call a service in `src/server/services` → return typed JSON. Hiding a button is not security.
- **Every write is audited.** Updates and deletes write an `audit_events` row in the same transaction (see `docs/03-data-model.md`).
- **Styling is Tailwind v4 only.** All classes and styling use Tailwind v4 utilities and its CSS-first config (`@theme` in CSS, no `tailwind.config.js`). No CSS modules, styled-components or inline `style` for things a utility can do. Custom CSS only for tokens and theme in `globals.css`.
- **Use `cn` from `@/utils/cn`**, never from the `cn` package directly (it is configured for our theme). After `shadcn add`, fix the import in the new files.
- **No seed data.** The database starts blank. Never load demo farm records (Sets, logs, sales, people). Tests build the rows they need inside a rolled-back transaction (`test/db/factories.ts`); `docs/12-seed-data.md` is reference numbers for those fixtures.
- **Money is integer naira** (no floats). Weights are integer grams. Format only for display, with `src/utils/format`.
- **Dates:** `date` for farm days, `timestamptz` for events. Farm timezone is `Africa/Lagos`.
- **Accessibility:** 4.5:1 text contrast (the tokens already meet it), 44px minimum touch targets, 56px on entry screens, every icon-only control has `aria-label` and a tooltip.

## Writing rules (code, comments, UI, docs)

- **Plain, simple English everywhere**: UI text, error messages, comments, docs, commit messages and change-log entries. Short sentences. No jargon where a plain word works.
- **Comments are one short, direct line** that says what the code does or why. No long explanations, no restating the code.
  - Good: `// Live birds = intake − deaths − sold`
  - Good: `// Recorders never get money fields`
  - Bad: `// This function is responsible for calculating the number of birds that are currently alive in the Set by taking…`
- Add a one-line comment at the top of each file saying what it is: `// Stepper for counts like daily deaths`.
- No commented-out code. No TODOs without a build-plan id (`// TODO(P2.3): add ingredient stock`).
- Names say what things are: `useOutstandingBalances`, `calcLoanInterest`, `SetStatusChip`. Files in kebab-case (`use-outstanding-balances.ts`), components in PascalCase.
- UI copy follows `design/brand/10-writing.md`: sentence case, plain verbs, the farm's own words (Set, day-olds, bags, sawdust, buyer, owed).

### Folder layout (target)

```text
src/
  app/                          # routes only; pages stay thin
    (auth)/sign-in/page.tsx
    (auth)/invite/[token]/page.tsx
    (app)/layout.tsx            # rail on desktop, top bar + tab bar on phone
    (app)/today/page.tsx
    (app)/sets/…  log/…  weigh/…  feed/…  health/…  sales/…  expenses/…  finance/…  reports/…  settings/…
    (print)/reports/…           # A4 pages for PDF
    api/auth/[...nextauth]/route.ts
    api/<resource>/route.ts
    api/<resource>/[id]/route.ts
    api/sync/route.ts
    providers.tsx               # React Query + session providers
  components/
    ui/                         # shadcn (Base UI) primitives, close to upstream
    kotila/                     # design-system components, one per file (stepper.tsx, linked-amounts.tsx, …)
      charts/                   # growth-chart.tsx, sparkline.tsx, bar-list.tsx
      fields/                   # money-input.tsx, attribution-field.tsx, …
    layout/                     # side-rail.tsx, top-bar.tsx, tab-bar.tsx, page-header.tsx
    today/  sets/  daily-log/  weights/  feed/  health/  sales/  expenses/  finance/  reports/  settings/
                                # screen parts, one per file (e.g. sales/outstanding-table.tsx)
  svgs/                         # logo and custom icons as React components (kotila-icon.tsx, kotila-mark.tsx)
  hooks/
    queries/                    # React Query hooks, one file per resource (use-sets.ts, use-sales.ts)
    use-online.ts  use-sync-queue.ts  use-role.ts  use-media-query.ts
  utils/
    metrics/                    # pure business maths, one file per metric group, with tests
    format/                     # naira.ts, percent.ts, weight.ts, dates.ts
    cn.ts
  lib/                          # setup and wiring
    query/                      # query-client.ts, query-keys.ts, fetcher.ts
    offline/                    # queue.ts, sync-worker.ts
    auth/roles.ts               # role checks usable on client and server
    env.ts
  schemas/                      # zod schemas shared by forms and API (expense.ts, sale.ts, …)
  constants/                    # expense-categories.ts, observation-tags.ts, death-causes.ts, nav.ts
  types/                        # shared TypeScript types
  server/                       # server-only
    auth.ts                     # NextAuth options, requireSession, requireRole
    http.ts                     # error → response mapping
    audit.ts
    services/                   # business logic per entity (sets.ts, sales.ts, …)
  db/
    schema/                     # one file per table group
    index.ts                    # Drizzle client
    setup/                      # db:setup: first owner + the spec's fixed lists (no farm records)
    migrations/                 # drizzle-kit output, committed
```

## Commands

```bash
docker compose up -d db            # Postgres only (set DB_PORT if 5432 is taken)
pnpm install
pnpm dev                            # Next.js on :3000
pnpm db:generate && pnpm db:migrate # drizzle-kit
pnpm db:setup                       # first owner (FIRST_OWNER_*) + fixed lists; never farm data
pnpm test                           # unit + db tests; db tests need `docker compose up -d db` and use a throwaway kotila_test database
pnpm lint && pnpm typecheck && pnpm test
docker compose --profile app up --build  # full stack in containers (db + migrate + app)
```

Add these scripts to `package.json` when scaffolding if the CLIs didn't.

## Definition of done (every task)

- Matches the screen in `design/screens/` and the rules in `docs/08-design-system.md`
- zod validation on both sides; role checks on the server; audit rows on writes
- Loading, empty (inviting the next action — never "No data available"), error and offline states handled
- `pnpm lint`, `pnpm typecheck`, `pnpm test` pass; migrations generated and committed
- New packages recorded in `docs/11-versions.md`
- **Change-log entry added below**

## Change-log protocol

Append a new entry at the **top** of the list below after every change (feature, fix, refactor, dependency, migration, config). Format:

```md
### YYYY-MM-DD — <short title>
- **Agent:** <name/model>  · **Task:** <build-plan id, e.g. P1.3>
- **Summary:** what changed and why, in 1–3 lines
- **Files:** key files added/changed
- **Packages:** name@exact-version (added|upgraded|removed) — or "none"
- **Migrations:** drizzle migration file name — or "none"
- **Follow-ups:** anything left undone or decided
```

## Change log

### 2026-09-26 — API plumbing
- **Agent:** Claude Code (Opus 5.5) · **Task:** P0.8
- **Summary:** `route()` wrapper maps errors to `{ error: { code, message, issues? } }` (ApiError, zod → 422, Postgres unique → 409, check/FK → 422, anything else → 500 without details). NextAuth v4 options (Credentials against `users`, Argon2id, JWT with id and role, role/active re-read every 5 minutes so a deactivated person loses access), `requireSession` / `requireRole`, audit helpers (one row per changed field, soft delete logged as delete). Client: query client (offline-first), key factory, `apiFetch` with typed errors, providers.
- **Files:** `src/server/{errors,http,auth,auth-options,audit}.ts`, `src/server/services/sign-in.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth/roles.ts`, `src/lib/query/*`, `src/app/providers.tsx`, `src/types/{api,session,next-auth.d}.ts` + tests
- **Packages:** next-auth@4.24.15, @tanstack/react-query@5.103.3 (added); @tanstack/react-query-devtools@5.103.3 (added, dev)
- **Migrations:** none
- **Follow-ups:** Sign-in pages, invites, middleware and rate limiting come in P1.1.

### 2026-09-26 — Metrics module
- **Agent:** Claude Code (Opus 5.5) · **Task:** P0.7
- **Summary:** Pure metric functions in `src/utils/metrics`: live birds, mortality, sample average / CV / uniformity, growth (from P0.5), FCR, live weight, feed stock, daily use, days left, feed cost per kg, Set P&L (one or several Sets) with per-bird figures, sale balance, cash position, capital, ownership, loan interest (gross / WHT / net) and borrowing capacity. Tests reproduce the Set 3 calibration, both loan examples and the Set 4 growth numbers, using the doc's figures as fixtures (no database).
- **Files:** `src/utils/metrics/{birds,weight-sample,feed,set-pnl,money,loans}.ts` + tests (`set3-calibration`, `loans`, `set4-growth`, `everyday`)
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Two doc figures don't match their own inputs: (1) feed cost per kg live weight "₦1,646 (₦2,066,412 ÷ 1,255 kg)" in `design/brand/20-numbers.md`, but Set 3's 465 birds × 2.46 kg = 1,143.9 kg gives ₦1,806; (2) Set 4 "projected 1.72 kg at day 35" uses a gain rounded to 63 g; the exact gain gives 1.73 kg (still −22%). Code uses the exact formulas. Money per bird rounds to whole naira; rates stay as ratios.

### 2026-09-26 — Database: schema, first migration, db:setup, db tests
- **Agent:** Claude Code (Opus 5.5) · **Task:** P0.6
- **Summary:** Drizzle schema for every table in the data model plus `devices` and `sync_mutations`, first migration, pg client. Melvin asked for a clean, blank database and tests instead of seed data: `pnpm db:setup` adds only the first owner (`FIRST_OWNER_*`) and the spec's fixed lists (10 expense categories, broiler, vaccine schedule, breed curve, settings), idempotently. 23 db tests run against a throwaway `kotila_test` database built from the committed migrations, each in a rolled-back transaction: Set-or-overhead, one log per Set per day, sale and feed amounts, clientId and mutationId duplicates, case-blind emails, setup idempotency. Checked end to end: `db:setup` twice on the dev DB, and `docker compose --profile app up --build` (migrate exits 0, app serves).
- **Files:** `src/db/schema/*`, `src/db/index.ts`, `src/db/migrations/0000_init.sql`, `src/db/setup/*`, `src/server/{db,password}.ts`, `src/utils/dates/*`, `drizzle.config.ts`, `vitest.config.mts` (unit + db projects), `test/db/*`, `test/server-only-stub.ts`, `tsconfig.json` (`@test/*`), `.env.example` (`FIRST_OWNER_*` replaces `SEED_OWNER_*`), `docs/03`, `docs/10`, `docs/11`, `docs/12`, `README.md`
- **Packages:** drizzle-orm@0.45.3, pg@8.23.0, @node-rs/argon2@2.2.1 (added); drizzle-kit@0.31.11, @types/pg@8.23.1, tsx@4.23.15 (added, dev)
- **Migrations:** `0000_init.sql`
- **Follow-ups:** Decisions recorded in `docs/03-data-model.md` › Decisions (expenses hold every naira out; amount-agreement tolerances fixed, the doc's ±1 would refuse real sales; named constraints). The db tests caught drizzle-kit naming column uniques in camelCase; all are named explicitly now. Your `.env` needs `DATABASE_URL`, `NEXTAUTH_*`, `S3_*`, `FIRST_OWNER_*` (see `.env.example`).

### 2026-09-26 — Kotila design components and /dev/components
- **Agent:** Claude Code (Opus 5.5) · **Task:** P0.5
- **Summary:** Ported every reference component to typed React + Tailwind v4 on shadcn/Base UI: fields (Field, TextInput, MoneyInput, Select, Checkbox), LinkedAmounts, Stepper, ChipGroup, Segmented, AttributionField, Button, IconButton, Tooltip, Tag, StatusChip, Delta, Figure, Money, Rows, Panel, LedgerTable, Notice, SyncStatus, Person, RoleBadge, AuditTrail, EmptyState, Tabs, Sheet, Wordmark, SideRail, TopBar, TabBar, GrowthChart, Sparkline, BarList. Dev-only `/dev/components` shows each with Set 3/4/5 data (404 in production; `?sheet=modal|sheet` opens a sheet). Checked by screenshot at 1280px and 390px.
- **Files:** `src/components/kotila/**`, `src/components/layout/{side-rail,top-bar,tab-bar}.tsx`, `src/components/dev/*`, `src/app/dev/components/page.tsx`, `src/svgs/{icon,icon-paths}.ts(x)`, `src/utils/format/*`, `src/utils/parse/parse-number.ts`, `src/utils/linked-amounts/*`, `src/utils/metrics/growth.ts`, `src/utils/charts/smooth-path.ts`, `src/utils/cn.ts`, `src/hooks/use-controlled.ts`, `src/types/*`, `src/constants/{nav,breed-standard}.ts`, `src/app/globals.css` (component tokens), `docs/08-design-system.md`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** `cn` is now configured for our theme (font sizes and shadows were being dropped next to colours); shadcn `ui/*` files import it from `@/utils/cn`. Prop differences from `index.d.ts` are listed in `docs/08-design-system.md` › Port notes. The growth projection label now flips left sooner so it isn't clipped.

### 2026-09-26 — UI base: shadcn (Base UI), Kotila theme, fonts, logos
- **Agent:** Claude Code (Opus 5.5) · **Task:** P0.4
- **Summary:** `shadcn init` with Base UI (base-nova). `globals.css` is now the Kotila theme from `design/theme.css` plus shadcn's colour utilities; dark theme removed, and `dark:` classes in primitives only apply under a `.dark` class we never set, so phones in dark mode still get the light app. Signika and Plus Jakarta Sans via `next/font`. Logos as React components. Added the shadcn primitives listed in `docs/08-design-system.md`.
- **Files:** `components.json`, `src/app/{globals.css,layout.tsx,page.tsx}`, `src/components/ui/*` (alert, avatar, badge, button, card, checkbox, dialog, drawer, empty, field, input, label, radio-group, select, separator, sheet, sidebar, skeleton, table, tabs, toggle, toggle-group, tooltip), `src/svgs/{kotila-icon,kotila-mark}.tsx`, `src/utils/cn.ts`, `src/hooks/{use-media-query,use-mobile}.ts`
- **Packages:** shadcn@4.21.0, @base-ui/react@1.8.0, cn@0.4.0, class-variance-authority@0.7.1, lucide-react@1.48.0, tw-animate-css@1.4.0 (added, pinned exact)
- **Migrations:** none
- **Follow-ups:** `cn` lives at `src/utils/cn.ts` (components.json points there). shadcn's `use-mobile` was rewritten on `useSyncExternalStore` to pass the React hooks lint rule.

### 2026-09-26 — Env validation
- **Agent:** Claude Code (Opus 5.5) · **Task:** P0.3
- **Summary:** `.env` is checked with zod when the server starts (`src/instrumentation.ts`), not at build time, so Docker builds need no secrets. A bad env stops the server with one list of every problem. The schema is pure (`env-schema.ts`) so seed scripts and tests can use it; `env.ts` is the server-only getter.
- **Files:** `src/lib/env-schema.ts`, `src/lib/env-schema.test.ts`, `src/lib/env.ts`, `src/instrumentation.ts`, `docs/11-versions.md`
- **Packages:** zod@4.6.5 (added), server-only@0.0.1 (added)
- **Migrations:** none
- **Follow-ups:** S3 keys are optional as a pair (none = use the machine's role). Seed-only vars (`SEED_OWNER_*`) get their own schema in P0.6.

### 2026-09-26 — Container versions pinned
- **Agent:** Claude Code (Opus 5.5) · **Task:** P0.2
- **Summary:** Pinned Node 24 (Active LTS; 26 becomes LTS on 28 Oct 2026) and PostgreSQL 18 (19 is still beta). Postgres 18 keeps data under `/var/lib/postgresql/18/docker`, so the volume now mounts `/var/lib/postgresql`. Host DB port is `DB_PORT` (default 5432). Docker build copies `pnpm-workspace.yaml` and turns off the corepack prompt. Checked: `docker compose up -d db` is healthy (18.6); the app image builds and serves on Node 24.21.0.
- **Files:** `Dockerfile`, `docker-compose.yml`, `.env.example`, `AGENTS.md`
- **Packages:** none (images: `node:24-alpine`, `postgres:18-alpine`)
- **Migrations:** none
- **Follow-ups:** the full `--profile app` stack needs `pnpm db:migrate`, which lands in P0.6; check it there. Dev container config unchanged (Node 24 image) and not opened here.

### 2026-09-26 — Harden offline sync against duplicates
- **Agent:** Claude Code (Opus 5.5) · **Task:** docs (shapes P0.6, P1.4, P1.5, P1.8, P2.1)
- **Summary:** Melvin asked for a robust offline sync that avoids duplicates. Rewrote the offline doc as seven layers: fixed ids per form, an outbox that edits pending items in place, one sync runner across tabs, a server ledger (`sync_mutations`) written in the same transaction, unique `clientId`, one daily log per Set per day, and a likely-repeat flag for expenses and weight samples. Added the retry, conflict and user-switch rules and the tests that must exist.
- **Files:** `docs/07-offline-sync.md`, `docs/03-data-model.md` (`version` column, `devices`, `sync_mutations`, `possibleDuplicateOf`, `daily_log_conflicts.mutationId`), `docs/04-api.md`
- **Packages:** none
- **Migrations:** none (the schema lands in P0.6)
- **Follow-ups:** none

### 2026-09-26 — Receipt photos go to S3
- **Agent:** Claude Code (Opus 5.5) · **Task:** docs (affects P0.3, P1.5)
- **Summary:** Melvin decided files are stored in an S3 bucket, not on a disk volume. Bucket is private: the upload route puts the photo in S3 and saves the object key; photos are shown through short-lived signed URLs.
- **Files:** `AGENTS.md`, `docs/03-data-model.md` (`receiptUrl` → `receiptKey`), `docs/04-api.md`, `.env.example` (`UPLOADS_DIR` → `S3_*`), `docker-compose.yml` (dropped `uploads` volume), `.gitignore`, `.dockerignore`
- **Packages:** none (S3 client is added in P1.5)
- **Migrations:** none
- **Follow-ups:** P0.3 validates the `S3_*` vars in `src/lib/env.ts`. P1.5 adds the S3 client. Open: which provider (AWS or S3-compatible), region, and how local dev gets a bucket.

### 2026-09-26 — Scaffold Next.js app
- **Agent:** Claude Code (Opus 5.5) · **Task:** P0.1
- **Summary:** Scaffolded with `create-next-app@16.3.6` (TypeScript strict, App Router, ESLint, Tailwind v4, `src/`, `@/*`). Set `output: 'standalone'`. Added `typecheck` and `test` scripts and a Vitest config. Placeholder home page and Kotila favicon. Added a Tailwind-v4-only styling rule (Melvin's request).
- **Files:** `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.mts`, `.gitignore`, `src/app/{layout.tsx,page.tsx,globals.css,icon.svg}`, `public/.gitkeep`, `AGENTS.md`, `docs/11-versions.md`
- **Packages:** next@16.3.6, react@19.3.0, react-dom@19.3.0 (added); tailwindcss@4.3.3, @tailwindcss/postcss@4.3.3, typescript@6.0.3, eslint@9.39.5, eslint-config-next@16.3.6, @types/node@24.19.0, @types/react@19.3.0, @types/react-dom@19.3.0, vitest@5.0.2 (added, dev). Three held below `latest`: typescript (7.0.2 breaks `typescript-eslint`, which needs <6.1), eslint (10.11.0 crashes `eslint-plugin-react` in `eslint-config-next`; 9.x is end-of-life, move to 10 when Next's config supports it), @types/node (matches the Node 24 runtime).
- **Migrations:** none
- **Follow-ups:** `db:generate`, `db:migrate`, `db:seed` scripts land with Drizzle in P0.6. Fonts and theme are still the scaffold defaults until P0.4. `design/` is excluded from lint and tsc (reference only). No commit made — no `main` or remote exists yet.

### 2026-09-26 — Handoff package created
- **Agent:** Claude (Cowork) · **Task:** handoff
- **Summary:** Repo seeded with folder layout and writing rules, product spec, architecture, data model, API, auth and roles, offline sync, design system (tokens, Tailwind v4 theme, reference components, screen designs), build plan, seed data, Docker and devcontainer setup. No application code yet.
- **Files:** `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/*`, `design/*`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example`, `.devcontainer/devcontainer.json`
- **Packages:** none installed. Versions observed on 2026-09-26 are listed in `docs/11-versions.md` for reference only — re-check before installing.
- **Migrations:** none
- **Follow-ups:** start at `docs/10-build-plan.md` task P0.1.
