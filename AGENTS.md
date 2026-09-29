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
| Database | PostgreSQL 18: a Docker container locally, **AWS RDS in production** | The app image never contains the database; see `docs/13-deploy.md` |
| ORM | Drizzle ORM + drizzle-kit | Schema in `src/db/schema/*`, migrations committed |
| Auth | NextAuth (Auth.js), latest **stable** | Credentials (email + password), JWT sessions, roles in the token. See version note below. |
| Client data | TanStack Query (React Query), latest stable | All client reads and writes go through it |
| Forms | react-hook-form + @hookform/resolvers + zod (`zod/mini`) | One zod schema per entity, shared by form and API. Import `* as z from "zod/mini"`, never `"zod"` |
| UI | shadcn/ui CLI (latest) with **Base UI** primitives (`@base-ui/react`), Tailwind CSS v4 | Themed with the Kotila tokens. All styling is Tailwind v4 (see Styling rule) |
| File storage | Private S3 bucket (AWS S3 or S3-compatible) | Receipt photos. Server uploads; DB stores the object key; reads use short-lived signed URLs. No files on local disk or volumes |
| Package manager | pnpm (via corepack) | |
| Tests | Vitest (unit: metrics, zod, API handlers); Playwright later for flows | |
| Container | Docker image for the app (runs `server.js`; `db-migrate.cjs` and `db-setup.cjs` as one-off jobs) + docker compose, `.devcontainer/` for agent work | Postgres container is for local development only |

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
pnpm test:e2e                       # Playwright against a dev server on :3200 and a throwaway kotila_e2e database
pnpm test                           # unit + db tests; db tests need `docker compose up -d db` and use a throwaway kotila_test database
pnpm lint && pnpm typecheck && pnpm test
docker compose --profile app up -d --build  # app + migrations in containers, against DATABASE_URL (AWS RDS in production; see docs/13-deploy.md)
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

### 2026-09-29 — Migrations give up fast when the database can't be reached
- **Agent:** Claude Code (Opus 5.5) · **Task:** follow-up (P0.2)
- **Summary:** Deploy #7 on Deckhand failed its 60s health check with no error in the build log. With no connect timeout, a migration against an unreachable RDS waits for the network to give up, past the health check. It now stops after 15 seconds with "Connection terminated due to connection timeout", and logs which host it is connecting to (no password).
- **Files:** `src/db/migrate.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** The real cause of #7 is in Deckhand's runtime logs (likely RDS not reachable: public access, security group, or DATABASE_URL).

### 2026-09-29 — Container migrates and makes the first owner on start
- **Agent:** Claude Code (Opus 5.5) · **Task:** follow-up (P0.2, P2.6)
- **Summary:** On Deckhand the app started but no owner was made: the image only ran `server.js`, and the migrate and setup jobs were never run. The image now starts with `docker-start.sh`: migrate, then setup when `FIRST_OWNER_EMAIL` is set, then the app. Both steps are safe to repeat; if either fails, the container stops. `DB_SETUP_ON_START=false` skips both. Compose drops its separate `migrate` job. A failed migration now prints the real reason (e.g. "password authentication failed"). Checked with the built image against a blank database: first start makes the owner, later starts leave it alone, removing `FIRST_OWNER_*` skips setup, a wrong password stops the container. No BuildKit-only Dockerfile features (Deckhand builds with the legacy builder); checked with `DOCKER_BUILDKIT=0`.
- **Files:** `docker-start.sh` (new), `Dockerfile`, `docker-compose.yml`, `src/db/migrate.ts`, `.env.example`, `docs/13-deploy.md`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Migrations have no lock; with more than one copy of the app, set `DB_SETUP_ON_START=false` and migrate once per deploy.

### 2026-09-27 — App container for AWS: database outside the image
- **Agent:** Claude Code (Opus 5.5) · **Task:** follow-up (P0.2, P2.6)
- **Summary:** Melvin said Docker is for running the app, and production's database is AWS RDS. Compose no longer forces the local database: the app and a `migrate` job use `DATABASE_URL` from `.env` (RDS in production); the Postgres container is now only for local development (`localdb` profile, or `docker compose up -d db`). The image can migrate and set up a database by itself (`node db-migrate.cjs`, `node db-setup.cjs`, bundled with esbuild), and trusts Amazon's RDS certificates so `?sslmode=verify-full` works. Fixed a production-only PDF bug: behind HTTPS the session cookie is `__Secure-…`, which Chromium won't store for `http://127.0.0.1`, so the printer now passes the Cookie header through instead. Checked end to end: built the image, pointed it at a separate database, ran migrate and setup (twice), signed in and downloaded a PDF from the container.
- **Files:** `Dockerfile`, `docker-compose.yml`, `src/db/migrate.ts`, `package.json` (`build:db-scripts`), `src/server/services/reports/print-pdf.ts`, `eslint.config.mjs`, `.gitignore`, `.env.example`, `docs/13-deploy.md` (new), `README.md`, `AGENTS.md` (stack and commands)
- **Packages:** none (esbuild was already a dev dependency)
- **Migrations:** none
- **Follow-ups:** Not tried against a real RDS instance or over HTTPS (the cookie hand-off was checked with Chromium directly). Load balancers may want a health check: `/sign-in` answers 200 without the database.

### 2026-09-27 — Buttons keep their colours on hover; steady focus rings
- **Agent:** Claude Code (Opus 5.5) · **Task:** follow-up (P0.5)
- **Summary:** Melvin saw button text turn black on hover. Cause: our Button and IconButton wrapped shadcn's Button in its `ghost` variant, which adds `hover:text-foreground` (and `aria-expanded:bg-muted`), so every variant's text went near-black on hover. They now render Base UI's button directly with only Kotila classes: hover changes the background, never the text. Chips and segments keep their text colour on hover too (shadcn's toggle adds `hover:text-foreground`). A picked segment and the active tab now show the same green focus halo as everything else (their "selected" shadow was hiding it). Checked every control on `/dev/components`: rest, hover and keyboard focus. Also fixed the e2e date helper, which used the UTC day and broke "day N" checks just after midnight in Lagos.
- **Files:** `src/components/kotila/{button,icon-button,chip-group,segmented,tabs}.tsx`, `e2e/helpers.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Kept on purpose: text links darken one green step on hover, and an unselected tab's grey label darkens on hover.

### 2026-09-26 — Steady accessibility check on sign-in
- **Agent:** Claude Code (Opus 5.5) · **Task:** follow-up (P3.5)
- **Summary:** The sign-in accessibility check sometimes ran while the Sign in button was still fading from its "not ready" grey to green, and measured the colour mid-fade. It now waits for the button's resting colour (5:1 against white text) before scanning. No app change.
- **Files:** `e2e/a11y.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** none.

### 2026-09-26 — Editable Set schedules and share register
- **Agent:** Claude Code (Opus 5.5) · **Task:** follow-up (P2.4, P3.3)
- **Summary:** Melvin asked for schedules to be adjustable and editable. On Health, each running Set's schedule has **Change schedule**: move a dose's due day, add a dose, or drop one not given yet (a given dose must be marked not given first); an optional reason is kept in the audit trail; stale copies and repeated doses are refused; the farm defaults in Settings stay as they are, and closed Sets can't change. The share register is editable too: select a shareholder to fix a name or share count, with a required reason in the history. Also fixed a flaky order in edit histories: rows written in one transaction share a time, so the create now always reads first.
- **Files:** `src/server/services/health/set-schedule.ts`, `src/app/api/sets/[id]/vaccine-schedule/route.ts`, `src/components/health/{set-schedule-sheet,set-dose-row,schedule-panel,health-screen}.tsx`, `src/server/services/finance/{capital,capital-writes}.ts`, `src/app/api/finance/shareholders/[id]/route.ts`, `src/components/finance/{shareholder-sheet,ownership-panel,capital-screen}.tsx`, `src/hooks/queries/{use-health,use-capital}.ts`, `src/types/capital.ts`, `src/server/services/audit-trail.ts`, tests in `src/app/api/{health,finance/capital}/*.db.test.ts`, `e2e/{health,capital}.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** none.

### 2026-09-26 — Schemas on zod/mini
- **Agent:** Claude Code (Opus 5.5) · **Task:** follow-up (P3.5)
- **Summary:** Melvin asked to switch to `zod/mini`. Every schema, form schema, route query and env check now uses its functional style (`.check(z.trim(), z.minLength(…))`, `z.optional`, `z.extend`, `z.partial`, `z.pipe`); shared `whole()` and `text()` checks live in `src/schemas/checks.ts`. Validation errors are caught as `z.core.$ZodError`. Messages are unchanged. First-visit JS on a phone fell from 348 KB to 279 KB and sign-in is ready about 0.4 s sooner on slow 4G. Also adds the schemas for the next two changes (a Set's own vaccine schedule, fixing the share register).
- **Files:** `src/schemas/*` (new `checks.ts`), `src/components/{expenses/expense-form-schema,daily-log/log-form-schema,auth/accept-invite-form,settings/breed-form}.tsx`, `src/server/{http,auth-options}.ts`, `src/server/services/{conflicts,sync/apply,sync/classify}.ts`, `src/app/api/{expenses/[id],health,conflicts/[id],audit,feed/prices}/route.ts`, `src/lib/env-schema.ts`, `src/db/setup/setup-env.ts`, `docs/02-architecture.md`, `AGENTS.md` (stack row)
- **Packages:** none (zod 4.6.5 ships `zod/mini`)
- **Migrations:** none
- **Follow-ups:** none.

### 2026-09-26 — App image checked with Chromium
- **Agent:** Claude Code (Opus 5.5) · **Task:** P3.5 (follow-up)
- **Summary:** `docker build .` now completes (the earlier failure was a slow fetch of Alpine's `chromium`). The image has Chromium 152 at `CHROMIUM_PATH=/usr/bin/chromium` and playwright-core's run-time files, so PDF downloads can work in the container. Closes the image-build follow-ups from P2.6, P3.1 and P3.2.
- **Files:** `AGENTS.md`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** A PDF hasn't been downloaded from a running container yet (needs the full stack with real env).

### 2026-09-26 — Hardening: accessibility, performance, safe queries
- **Agent:** Claude Code (Opus 5.5) · **Task:** P3.5
- **Summary:** Accessibility: an axe sweep of sign-in and 19 owner pages on laptop and phone (WCAG 2.0–2.2 A/AA, serious and critical) now runs in e2e and passes. Fixes it found: wide tables scroll inside a labelled box you can reach by keyboard; the big Set buttons' small text was 4.4:1 (now white, one shared `SetActionLink`); report pickers and the weekly "Week of" line sat on the phone's green band (now on a white panel). Performance measured on a mid-range Android profile (see `docs/02-architecture.md`). Queries: services no longer run side-by-side queries on one transaction's client (`queries` / `eachQuery` helpers: side by side on the pool, one after another in a transaction), which pg@9 will refuse; the test run is now free of those warnings. The P3.5 Playwright flows (offline daily log with reload, lost reply mid-sync, expense attribution, sale balances) were already in place from P1.4–P1.8.
- **Files:** `src/server/queries.ts` and every service that read in parallel, `src/components/ui/table.tsx` (`containerProps`), `src/components/kotila/{ledger-table,set-action-link}.tsx`, `src/components/daily-log/log-today-links.tsx`, `src/components/weights/weigh-index-screen.tsx`, `src/components/reports/{set-report-screen,weekly-screen,weekly-document}.tsx`, `e2e/a11y.spec.ts`, `docs/02-architecture.md`, `docs/11-versions.md`
- **Packages:** @axe-core/playwright@4.13.0 (added, dev)
- **Migrations:** none
- **Follow-ups:** zod is the biggest JS chunk (about 87 KB compressed); `zod/mini` would trim first visits on slow signal.

### 2026-09-26 — Buyer analytics
- **Agent:** Claude Code (Opus 5.5) · **Task:** P3.4
- **Summary:** The buyer page now reads like the design: phone and "buying since", Record a payment and New sale to them; birds (sales, Sets), average per bird with its gap to the bulk rate, total bought since, still owed (from which sale, how many days); a warning when a buyer pays ₦100+ a bird under the bulk rate, with what that came to over the year's birds; every sale with a totals row (opens the sale, payments and edit history); and every payment including deposits and money paid at the sale. The buyers list shows who pays under the bulk rate. One metric (`buyerInsight`) feeds both pages.
- **Files:** `src/utils/metrics/buyer-insight.ts`, `src/utils/sales/buyer-payments.ts`, `src/components/sales/{buyer-screen,buyer-figures,buyer-payments-panel,buyers-screen,sales-table,new-sale-sheet}.tsx`, `src/server/services/buyers.ts`, `src/types/sale.ts` (`vsBulk`), `e2e/buyer.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** none.

### 2026-09-26 — Partner capital and shareholder loans
- **Agent:** Claude Code (Opus 5.5) · **Task:** P3.3
- **Summary:** `/finance/capital` (owners only; Finance now has tabs): the share register with ownership from shares, and each person's money contributed, withdrawn and net; shareholder loans (lender, amount, advanced, repaid, days) with interest as three separate numbers — gross at 16% simple for the actual days, 10% withholding tax, net — and what is paid; borrowing capacity (loans outstanding against the agreed share of equity from Settings, room left, a warning when a new loan would pass the cap). Owners add shareholders, record money in or out, record a loan and mark it repaid; every write needs a connection, is saved once per clientId and audited. Capital and loans flow into the cash position (repayments out at principal + gross interest). Reproduces Emeka's loan (₦9,973 / ₦997 / ₦8,976) and Kosi's 24 days (₦5,260 / ₦526 / ₦4,734).
- **Files:** `src/server/services/finance/{capital,capital-writes}.ts`, `src/app/api/finance/{capital,shareholders,loans,loans/[id]}/route.ts`, `src/components/finance/{capital-screen,ownership-panel,capacity-panel,loans-panel,loan-breakdown,loan-sheet,loan-detail-sheet,contribution-sheet,shareholder-sheet,finance-tabs}.tsx`, `src/app/(app)/finance/capital/page.tsx`, `src/schemas/capital.ts`, `src/types/capital.ts`, `src/constants/finance-tabs.ts`, `src/hooks/queries/use-capital.ts`, `src/utils/metrics/finance-headlines.ts` (`capacityLine`), `e2e/capital.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Shareholders are added by an owner (no seed data), not preloaded. Shares can't be edited after adding yet; a mistake needs a new register entry.

### 2026-09-26 — Compare Sets
- **Agent:** Claude Code (Opus 5.5) · **Task:** P3.2
- **Summary:** `/reports/compare`: one dropdown per Set (First Set, Second Set, …); a Set picked in one list leaves the others; at least two; Add a Set, and remove from the third on. The table runs intake, mortality, birds sold, FCR, weight at sale, cost/revenue/margin per bird, net margin, feed share and profit, with the best named per row (only Sets with that figure take part; running Sets count for mortality only; a tie names nobody). Three findings under it: lowest mortality, best margin, revenue per bird from the first closed Set to the last. PDF download. Each Set's line comes from its Set report, so the numbers match everywhere. The three PDF routes now share one helper.
- **Files:** `src/utils/metrics/compare.ts`, `src/utils/format/compare-value.ts`, `src/utils/sets/default-compare.ts`, `src/server/services/reports/{compare,print-pdf}.ts`, `src/app/api/reports/compare/{route.ts,pdf/route.ts}`, `src/app/(print)/print/reports/compare/page.tsx`, `src/app/(app)/reports/compare/page.tsx`, `src/components/reports/compare-*.tsx`, `src/schemas/finance.ts` (`compareQuerySchema`), `src/types/compare.ts`, `src/constants/report-tabs.ts`, `e2e/compare.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Checked separately that `apk add chromium` works on `node:24-alpine` (it's large and slow to fetch; the earlier image build failed on the fetch). A full image build is still worth running before deploying.

### 2026-09-26 — Weekly review
- **Agent:** Claude Code (Opus 5.5) · **Task:** P3.1
- **Summary:** `/reports/weekly` (Reports now opens here): one note per Set running that week (Sunday to Saturday), this week or last. A rules engine over the metrics writes 3–6 short points, worst first, each ending in "Do this": late vaccines (grouped), weight under the standard (widening or not, gain against what the standard needs, where it's heading at day 35, feeders needed), feed running out (bags to order and by when, at the last price), deaths above last week and the running average (brooding week left out), pen tags seen 3+ days (advice per tag), vaccines given late, missing logs. When nothing is wrong: one line. Figures: deaths, weight vs standard, FCR so far and where it's heading, feed cost per kg. PDF download like the Set report. Reports pages share tabs.
- **Files:** `src/utils/metrics/weekly/{week-facts,review-points,set-review}.ts`, `src/utils/dates/week-of.ts`, `src/constants/{tag-advice,weekly-how,report-tabs}.ts`, `src/server/services/reports/weekly.ts`, `src/app/api/reports/weekly/{route.ts,pdf/route.ts}`, `src/app/(print)/print/reports/weekly/page.tsx`, `src/app/(app)/reports/{page.tsx,weekly/page.tsx}`, `src/components/reports/{weekly-*,report-tabs}.tsx`, `src/schemas/report.ts`, `src/types/weekly.ts`, `src/utils/format/dates.ts` (`weekSpan`), `next.config.ts`, `e2e/weekly.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Feed run-out points only appear for the current week (stock is known for today, not for past weeks). The Docker image build failed at `apk add chromium` on this machine (network fetch); the PDF works in dev and e2e with the installed Chrome — check the image build before deploying. Restarted the stopped `db` container (exit 0, stopped outside this session) on port 5434; its data was kept.

### 2026-09-26 — Set report and PDF
- **Agent:** Claude Code (Opus 5.5) · **Task:** P2.6
- **Summary:** `/reports/set`: pick a Set or all closed Sets and read the full picture — intake, deaths, birds sold, weight at sale, revenue, expenses, profit, margin, per-bird money, FCR, feed cost per kg live weight, mortality, spend by category, growth against the standard (one Set), the largest expenses by date, and unpaid balances in the footnote. Reproduces Set 3 (FCR 1.74, ₦1,806 a kg). Download PDF prints the server-rendered A4 page `/print/reports/set` with headless Chromium, signed in as the person asking.
- **Files:** `src/server/services/reports/{set-report,print-pdf}.ts`, `src/app/api/reports/set/{route.ts,pdf/route.ts}`, `src/app/(print)/print/reports/set/page.tsx`, `src/app/(app)/reports/{page.tsx,set/page.tsx}`, `src/components/reports/*`, `src/components/kotila/button.tsx` (`download`), `src/utils/metrics/{set-performance,report-headlines}.ts`, `src/utils/format/set-names.ts`, `src/lib/env-schema.ts` (`CHROMIUM_PATH`, `INTERNAL_APP_URL`), `src/app/globals.css` (white paper when printing), `Dockerfile` (Alpine `chromium`), `next.config.ts`, `test/api/set3.ts`, `e2e/reports.spec.ts`, `docs/02-architecture.md`
- **Packages:** playwright-core@1.63.0 (added)
- **Migrations:** none
- **Follow-ups:** The Docker image with Chromium wasn't built here (Docker build takes a while; check `docker compose --profile app up --build` before deploying). `pg` warns about queries run side by side on one transaction (`Promise.all` inside a transaction); it still works but pg@9 will refuse it — tidy up in P3.5.

### 2026-09-26 — Set P&L, cash position and cash counts
- **Agent:** Claude Code (Opus 5.5) · **Task:** P2.5
- **Summary:** `/finance`: cash position since the last count (money in: sale money received, deposits, payments, manure, capital, loans; money out: every expense by category, withdrawals, loan repayments with gross interest), what should be on hand, and what buyers owe (not cash yet). Owners record a count (cash box + bank; needs a connection): the difference against the books is saved and the count becomes the new starting point; same-day entries made after the count still count. Set P&L for one Set or all closed Sets: revenue, expenses, profit, margin, per-bird figures, feed share, spend by category; capital items spread over Sets count their share. Reproduces Set 3 (₦568,750, 15.96%, ₦6,440 a bird). Today gets cash and feed price cards.
- **Files:** `src/server/services/finance/*`, `src/app/api/finance/{cash,pnl,reconciliations}/route.ts`, `src/components/finance/*`, `src/components/today/{cash-card,feed-card,manager-today}.tsx`, `src/app/(app)/finance/page.tsx`, `src/schemas/finance.ts`, `src/types/finance.ts`, `src/utils/metrics/{cash-since,finance-headlines}.ts`, `src/utils/sets/pnl-choices.ts`, `src/hooks/queries/use-finance.ts`, `e2e/finance.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Capital and loans screens (P3.3) add the Partner capital and Shareholder loans tabs; their money already flows into the cash position. Any Set combination beyond "all closed" comes with Compare Sets (P3.2).

### 2026-09-26 — Health and vaccines
- **Agent:** Claude Code (Opus 5.5) · **Task:** P2.4
- **Summary:** `/health`: the most pressing dose leads (late, then due today, then tomorrow, with doses = live birds and how to give it) with Mark as given; each running Set's schedule shows due day and date, when given and by whom, and a status (given, given N days late, N days late, due today or tomorrow, upcoming); a dose can be marked given on a day or cleared (audited). Treatments: Set, date, item (quick picks from the spec's list), amount, cost and why; a cost becomes a Drugs and vaccines expense on the Set in the same transaction; saved once per clientId. Settings › Vaccine schedule edits the defaults new Sets copy. Today's vaccine tasks use the same status rule and link to Health for roles that can open it.
- **Files:** `src/server/services/health/*`, `src/server/services/expenses/category-by-key.ts` (moved from feed), `src/app/api/{health,sets/[id]/vaccines,settings/vaccine-schedule}/**`, `src/components/health/*`, `src/components/settings/{vaccines-screen,vaccine-schedule-form,vaccine-row}.tsx`, `src/app/(app)/{health,settings/vaccines}/page.tsx`, `src/schemas/health.ts`, `src/types/health.ts`, `src/utils/metrics/{vaccine-status,health-headlines,today-tasks}.ts`, `src/constants/health-items.ts`, `src/server/services/today.ts`, `e2e/health.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** A running Set's own due days can't be moved yet (only the defaults). Set detail tabs for health come with the Set report work.

### 2026-09-26 — Feed
- **Agent:** Claude Code (Opus 5.5) · **Task:** P2.3
- **Summary:** `/feed`: bags in the store per feed (bought − used from the daily log, kg turned into bags), daily rate and days left, a run-out warning with an order-by day, the price per bag over the last six purchases with the change stated and what a ₦1,000 rise costs a Set, and every feed and ingredient buy. Feed purchase sheet: bags × price per bag = total (any two, none blank), bag size, transport as its own Transport expense, supplier, date, Set or the store. Ingredient sheet: what, quantity × cost each = total, which Set. Each buy writes its expenses in the same transaction and is saved once per clientId. Settings › Feed types (add, change, retire; audited). Today lists a feed running out within a week.
- **Files:** `src/server/services/feed/*`, `src/server/services/{feed-types,today}.ts`, `src/app/api/feed/**`, `src/components/feed/*`, `src/components/settings/feed-type*.tsx`, `src/components/kotila/charts/price-chart.tsx`, `src/components/kotila/attribution-field.tsx` (`allowOverhead`), `src/app/(app)/{feed,settings/feed}/page.tsx`, `src/schemas/{feed,field-errors}.ts`, `src/types/feed.ts`, `src/utils/metrics/{feed-stock,price-trend,feed-headlines,feed-store,linked-amounts-agree,today-tasks}.ts`, `src/utils/format/{bags,feed-name,dates}.ts`, `src/utils/sets/attribution-sets.ts` (moved from expenses), `docs/04-api.md`, `e2e/feed.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** The "Feed left" figure on Set detail isn't added yet. Ingredient purchases have no transport line (the table has no column for it); record transport as its own expense for now.

### 2026-09-26 — Growth chart on Set detail and Today
- **Agent:** Claude Code (Opus 5.5) · **Task:** P2.2
- **Summary:** Deep growth panel on Set detail and on Today (for the Set furthest under its standard): a headline that states the finding and what to do, the chart with ±5% band, today marker, late zone from day 28 and projection to day 35, and figures for the latest average, standard, daily gain and uniformity. The growth story is worked out in one metric (`growthSummary`, `growthHeadline`), tested on Set 4's numbers. Also fixed: panel links on the deep panel were dark on dark; duplicate keys in Today's task list when two vaccine doses share a name.
- **Files:** `src/utils/metrics/{growth-summary,growth-headline}.ts`, `src/components/weights/{growth-panel,growth-figures}.tsx`, `src/components/kotila/charts/growth-legend.tsx`, `src/components/sets/set-detail-screen.tsx`, `src/components/today/{manager-today,task-list}.tsx`, `src/server/services/today.ts`, `src/types/today.ts`, `src/components/kotila/{panel-action,figure}.tsx`, `e2e/weights.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** none.

### 2026-09-26 — Weights and the breed standard
- **Agent:** Claude Code (Opus 5.5) · **Task:** P2.1
- **Summary:** Weigh screen (`/weigh`, `/weigh/[setId]`): type each bird in grams; average, gap to standard, uniformity and bird count update as you type; tap a weight to change it; fewer than 10 birds warns but never blocks; chart against the standard. Samples save through the outbox (new `weightSample.create` type); a same-day sample with the same weights is flagged as a likely repeat on the phone and on the server, never dropped. Settings › Breed standard edits the curve (owners and managers, audited).
- **Files:** `src/app/api/sets/[id]/weights`, `src/app/api/settings/breed-curve`, `src/server/services/{weights,breed-curve}.ts`, `src/schemas/weight.ts`, `src/utils/metrics/{sample-stats,find-repeat}.ts`, `src/hooks/queries/use-weights.ts`, `src/components/weights/*`, `src/components/settings/breed-*.tsx`, `src/components/offline/saved-on-phone.tsx` (moved and made general), `src/components/kotila/tabs.tsx` (tabs scroll instead of widening the page on phones), `e2e/weights.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** removing a flagged repeat sample (Keep both / Remove) comes with the manager review screens; growth chart on Set detail and Today is P2.2.

### 2026-09-26 — Offline v1 and duplicate-free sync
- **Agent:** Claude Code (Opus 5.5) · **Task:** P1.8
- **Summary:** Built `docs/07-offline-sync.md`. Daily logs and new expenses always go through an IndexedDB outbox (online too): ids fixed per form, pending entries changed in place, per-record order, stuck sends reset after 2 minutes, backoff 30s → 30 min, pause on 401, one runner across tabs (Web Locks), triggers on signal back / app to front / after a save / every 60s. `/api/sync` applies each entry in its own transaction with a ledger row (`sync_mutations`): replays return `duplicate`, a reused id with a different payload is refused, a race of two copies makes one row, two people logging one day become one conflict for a manager (settled side by side, audited), a matching expense is flagged. Device heartbeat feeds Today ("Friday's Set 4 log is on Chinedu's phone"). Serwist service worker, manifest and icons, `/~offline`; the query cache kept in IndexedDB; sync status is real, with a sheet (waiting, turned down, clashes, Send now); sign-out warns about unsent entries; nobody else can sign in on a phone holding someone's unsent entries.
- **Files:** `src/lib/offline/*`, `src/server/services/{sync/*,conflicts}.ts`, `src/app/api/{sync,conflicts}/**`, `src/components/offline/*`, `src/app/{sw.ts,manifest.ts,serwist/[path]/route.ts,~offline/page.tsx,providers.tsx,layout.tsx}`, `src/lib/auth/current-user.tsx`, `src/lib/query/persister.ts`, `src/hooks/{use-outbox-items,use-sync-summary}.ts`, `public/icons/*`, `next.config.ts`, `e2e/offline.spec.ts`
- **Packages:** see `docs/11-versions.md` (P1.8 rows); @tanstack/react-query upgraded to 5.104.0
- **Migrations:** none (tables came in P0.6)
- **Follow-ups:** All ten tests from the offline doc exist (server, outbox and worker on fake IndexedDB, and two Playwright flows: log offline → reload → online = one row; reply lost mid-send = one row). Weight samples join the outbox in P2.1. Bugs found on the way: React Query drops per-call `onSuccess` when a form remounts (saves now use `mutateAsync`), and a restored cache counted as fresh (now refetched on open).

### 2026-09-26 — Today
- **Agent:** Claude Code (Opus 5.5) · **Task:** P1.7
- **Summary:** `/api/today` (role-shaped: no money for recorders) and `/today`. Owners and managers: owed band (total, oldest, biggest balances → See balances), the latest missed day per Set with Fill in, Active Sets (age, live, mortality, deaths this week vs last, spend), Needs doing today. Recorders (phone): missed days, big Log today buttons (ticked once logged), each Set's counts with this week vs last, Coming up. Tasks come from a tested rule set: logs not in, vaccines due tomorrow / today / late (from each Set's schedule), weighing day within 3 days, a tag seen 3+ days this week. Notices drop their action under the text on phones.
- **Files:** `src/server/services/today.ts`, `src/app/api/today/**`, `src/components/today/*`, `src/components/daily-log/log-today-links.tsx`, `src/utils/metrics/today-tasks.ts`, `src/types/today.ts`, `src/lib/auth/sign-in-with-password.ts`, `e2e/today.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Fixed a sign-in bug found while checking Today: on a device's first visit NextAuth could hit a CSRF cookie race, report "ok", and bounce the person back to sign-in with no message; sign-in now spots it and retries once. Cash position, the growth chart and the feed panel join Today in P2.2, P2.3 and P2.5.

### 2026-09-26 — Sales, buyers and balances
- **Agent:** Claude Code (Opus 5.5) · **Task:** P1.6
- **Summary:** `/sales`: owed notice ("₦X is owed by N buyers", oldest balance), outstanding balances oldest first with a total line, every sale (bird and manure) by All / Owed / per-Set tabs. New sale sheet: Set (closed-Set warning), date, buyer or add one inline, linked birds × price = total (any two, price may be rounded from the total), paid now, still owed (worked out), method, deposit. Never more birds than are alive. Payments can't exceed the balance; manure sales; sale details with payments and history; late changes to a sale's birds or money need a reason. Buyers list and buyer page (average per bird against the bulk rate in Settings). Rail badge on Sales counts buyers who owe. Same clientId twice records a sale, payment or buyer once.
- **Files:** `src/server/services/{sales/*,buyers,settings}.ts`, `src/app/api/{sales,other-sales,buyers}/**`, `src/components/sales/*`, `src/app/(app)/sales/**`, `src/schemas/sale.ts`, `src/types/sale.ts`, `src/utils/metrics/{sale-amounts,sales-headline}.ts`, `src/constants/payment-methods.ts`, `src/components/layout/app-shell.tsx`, `e2e/sales.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** The owed banner on Today comes with P1.7. Buyer analytics beyond average vs bulk rate: P3.4.

### 2026-09-26 — Expenses
- **Agent:** Claude Code (Opus 5.5) · **Task:** P1.5
- **Summary:** `/expenses` with Set / category / month / Set-costs-or-overhead filters, figures (spent, on Sets, overhead; capital items kept apart), the list (ledger on desktop, rows on phones) and a by-category chart. Add / change sheet (bottom sheet on phones, opened by the + tab or `?add=1&set=`): amount, category, what for, Set or overhead (required: schema, API and database), paid on, capital item (only in capital categories), receipt photo. Same clientId twice adds it once; a matching expense entered separately is saved and flagged "looks like a repeat". Changing an old amount needs a reason; owners remove with a reason (soft delete); all audited. Receipts upload through the server to the private S3 bucket and open through 5-minute signed links. Settings › Expense categories (add, rename, capital-eligible).
- **Files:** `src/server/services/expenses/*`, `src/server/storage/receipts.ts`, `src/app/api/{expenses,expense-categories,uploads/receipt}/**`, `src/components/expenses/*`, `src/components/settings/{categories-screen,category-sheet}.tsx`, `src/app/(app)/{expenses,settings/categories}/page.tsx`, `src/schemas/expense.ts`, `src/types/expense.ts`, `src/utils/metrics/expense-summary.ts`, `src/utils/dates/recent-months.ts`, `e2e/expenses.spec.ts`
- **Packages:** @aws-sdk/client-s3@3.1141.0, @aws-sdk/s3-request-presigner@3.1141.0 (added)
- **Migrations:** none
- **Follow-ups:** Receipt upload is covered by API tests with S3 stubbed; it needs real S3 settings (and an answer on local dev) to try in the browser. Receipts need a connection; offline expenses (P1.8) save without one and the photo is added later.

### 2026-09-26 — Daily log
- **Agent:** Claude Code (Opus 5.5) · **Task:** P1.4
- **Summary:** Phone-first entry at `/log/[setId]/[date]`: deaths stepper first with the live count as it changes (alert colour above yesterday or the daily average), optional cause, feed (bags/kg, type), water, tags ("wet litter logged on the two days before too"), temperature, note. `/log` picks a Set; `/log/[setId]` lists the last 14 days with missed days named ("Set 5 has no log for Friday" → Fill in Friday); `/log/history` for recorders; the Set page shows the last week. Saving upserts by Set and day: the same clientId again returns the same log, someone else's log for that day answers 409 pointing at it (offline sync will record a conflict instead), a stale version answers 409. Changing deaths or feed after the day needs a reason; recorders may only change their own log on the same day. Every change is audited; the edit history sheet shows who, when, old → new and why.
- **Files:** `src/server/services/daily-logs/*`, `src/server/services/{audit-trail,feed-types}.ts`, `src/app/api/{sets/[id]/logs,sets/[id]/missing-days,logs/[id],audit,feed/types}/**`, `src/components/daily-log/*`, `src/components/audit/history-sheet.tsx`, `src/components/sets/set-logs-panel.tsx`, `src/app/(app)/log/**`, `src/schemas/daily-log.ts`, `src/constants/{observation-tags,death-causes}.ts`, `src/utils/metrics/missing-days.ts`, `src/utils/format/audit-value.ts`, `e2e/daily-log.spec.ts`, `playwright.config.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Fixed a bug the tests caught: the edit schema carried defaults (`tags: []`), so editing only deaths wiped the tags. e2e now runs against a production build (no dev compile delays) and waits for hydration before typing. Feed types can't be added until Settings › Feed types (P2.3), so the feed field shows how to add them. Offline saving arrives in P1.8. Restored `src/server/db.ts` after an outside typo (`creaeDb`), with Melvin's OK.

### 2026-09-26 — Sets
- **Agent:** Claude Code (Opus 5.5) · **Task:** P1.3
- **Summary:** Sets list (figures, All / Running / Closed, ledger on desktop, cards on phones), start a Set (sheet; same clientId twice returns the same Set; adds the vaccine schedule from the defaults and the day-olds as a Day-old chicks expense, in one transaction), Set detail (figures with this-week vs last-week mortality, deaths by day, spend by category), stage changes with a closing date (audited). Recorders get counts without money; the server strips money fields. All numbers from `utils/metrics` (new: mortality trend, day of age, Sets overview, category share).
- **Files:** `src/server/services/sets/*`, `src/app/api/sets/**`, `src/components/sets/*`, `src/app/(app)/sets/**`, `src/hooks/queries/use-sets.ts`, `src/schemas/set.ts`, `src/types/sets.ts`, `src/utils/metrics/{mortality-trend,sets-overview,category-share}.ts`, `e2e/sets.spec.ts`, `test/db/farm.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Growth chart (P2.2), feed left (P2.3) and the logs / weights / health / sales / expenses tabs arrive with those features. e2e setup now also creates a manager and a recorder test account in the throwaway e2e database.

### 2026-09-26 — App shell
- **Agent:** Claude Code (Opus 5.5) · **Task:** P1.2
- **Summary:** `(app)` layout with the frame from the designs: side rail on desktop (role-filtered, active section, sync status, person); on phones a green band, glass top bar (sync status, account) and glass tab bar. Recorders always get the phone frame. Owners/managers on a phone: Today, Sets, + (add expense), Sales, More (sheet with every section). Account sheet signs out and forgets the person for offline use. The app remembers who signed in on the device. Page headings go white over the band on phones.
- **Files:** `src/components/layout/{app-shell,account-sheet,more-sheet,phone-band,tab-bar,page-header}.tsx`, `src/app/(app)/layout.tsx`, `src/hooks/use-sync-summary.ts`, `src/constants/nav.ts`, `src/types/nav.ts`, `e2e/shell.spec.ts`
- **Packages:** none
- **Migrations:** none
- **Follow-ups:** Sync status shows online/offline only until P1.8 reads the outbox. Tab bar items without `href` are buttons.

### 2026-09-26 — Auth: sign-in, invites, proxy, users and roles
- **Agent:** Claude Code (Opus 5.5) · **Task:** P1.1
- **Summary:** `/sign-in` (desktop split, phone band; offline "Open offline as <name>" for the last person on the device), invites with a link to share (copy or WhatsApp; no email service), `/invite/[token]` to set a password (also used as the password reset), `src/proxy.ts` (Next 16's middleware) sending signed-out people to sign-in and roles away from pages they can't use, Settings › Users and roles (list, change role, deactivate/reactivate; never below one active owner; audited). Sign-in is limited to 5 tries per email + IP per 15 minutes (in memory). Submit buttons wait for hydration so an early tap can't reload the page. First Playwright e2e: invite → accept → recorder kept out of Settings.
- **Files:** `src/components/auth/*`, `src/components/settings/*`, `src/app/(auth)/*`, `src/app/(app)/settings/*`, `src/app/api/{invites,users}/**`, `src/proxy.ts`, `src/constants/{route-access,role-abilities,settings-tabs}.ts`, `src/server/services/{invites,users,sign-in}.ts`, `src/server/{rate-limit,tokens}.ts`, `src/schemas/auth.ts`, `e2e/*`, `playwright.config.ts`, `test/api/*`
- **Packages:** react-hook-form@7.89.0, @hookform/resolvers@5.9.1 (added); @playwright/test@1.63.0 (added, dev)
- **Migrations:** `0001_invite_name.sql` (invites get the person's name)
- **Follow-ups:** "Keep me signed in" was left out: sessions last 30 days so the phone works offline. Route tests call the real handlers with a stand-in session and the test transaction (`test/api/*`). Other Settings tabs arrive with their features.

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
