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
| UI | shadcn/ui CLI (latest) with **Base UI** primitives (`@base-ui/react`), Tailwind CSS latest stable | Themed with the Kotila tokens |
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
    seed/                       # seed data split by area
```

## Commands

```bash
docker compose up -d db            # Postgres only
pnpm install
pnpm dev                            # Next.js on :3000
pnpm db:generate && pnpm db:migrate # drizzle-kit
pnpm db:seed                        # farm data from docs/12-seed-data.md
pnpm lint && pnpm typecheck && pnpm test
docker compose up --build           # full stack in containers
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

### 2026-09-26 — Handoff package created
- **Agent:** Claude (Cowork) · **Task:** handoff
- **Summary:** Repo seeded with folder layout and writing rules, product spec, architecture, data model, API, auth and roles, offline sync, design system (tokens, Tailwind v4 theme, reference components, screen designs), build plan, seed data, Docker and devcontainer setup. No application code yet.
- **Files:** `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/*`, `design/*`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `.env.example`, `.devcontainer/devcontainer.json`
- **Packages:** none installed. Versions observed on 2026-09-26 are listed in `docs/11-versions.md` for reference only — re-check before installing.
- **Migrations:** none
- **Follow-ups:** start at `docs/10-build-plan.md` task P0.1.
