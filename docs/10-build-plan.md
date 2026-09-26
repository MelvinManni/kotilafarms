# Build plan

Work top to bottom. One task per commit. Each task ends with the Definition of done in AGENTS.md and a change-log entry naming the task id.

## P0 — Foundation

- **P0.1 Scaffold.** Check latest stable versions (AGENTS.md version policy). `pnpm create next-app@latest` (TypeScript, App Router, ESLint, Tailwind, `src/`, import alias `@/*`). Set `output: 'standalone'`. Add scripts from AGENTS.md. Record versions in `docs/11-versions.md`.
- **P0.2 Container.** Set `NODE_VERSION` / `POSTGRES_VERSION` in `Dockerfile` and `docker-compose.yml` to the current Node Active LTS and PostgreSQL stable major. `docker compose up -d db` works; `docker compose up --build` serves the app on :3000; dev container opens.
- **P0.3 Env.** `src/lib/env.ts` validates `.env` with zod.
- **P0.4 UI base.** `shadcn init` with Base UI; apply `design/theme.css`; fonts; add the shadcn primitives listed in `docs/08-design-system.md`.
- **P0.5 Design components.** Port the Kotila components (props from `design/reference-components/index.d.ts`) into `components/kotila` and `components/layout`. A dev-only `/dev/components` page renders each with the reference preview data.
- **P0.6 Database.** Drizzle client, schema from `docs/03-data-model.md`, first migration, `db:seed` from `docs/12-seed-data.md`.
- **P0.7 Metrics.** `src/utils/metrics/*` with Vitest tests that reproduce the Set 3 calibration numbers from seed data and the loan interest examples.
- **P0.8 API plumbing.** `server/http.ts` (error mapping), `server/auth.ts` (`requireSession`, `requireRole`), `server/audit.ts`, query client, key factory, fetcher.

## P1 — Replaces the notebook

- **P1.1 Auth.** NextAuth Credentials + JWT with roles; `/sign-in`, invites, middleware; owner-only user management (Settings › Users and roles).
- **P1.2 App shell.** Desktop side rail and phone top bar + tab bar, role-aware; sync status placeholder.
- **P1.3 Sets.** List, start a Set (creates vaccine schedule from defaults), detail (without growth chart yet), status changes.
- **P1.4 Daily log.** Phone-first entry, stepper first, live count, tags, missed-day notice and backfill, edit with reason, edit history sheet.
- **P1.5 Expenses.** List with filters, quick-add sheet, Set-or-overhead enforced in schema, API and DB; capital item flag; receipt upload.
- **P1.6 Sales.** Buyers, new sale (linked amounts), payments, outstanding balances, owed banner on Today.
- **P1.7 Today.** Dashboard for owner/manager and recorder variants from `/api/today`.
- **P1.8 Offline v1.** Service worker, persisted query cache, write queue + `/api/sync` for daily log and expenses, sync status states, conflict resolution sheet.

## P2 — Performance and money

- **P2.1 Weights.** Weight sample entry with live stats; breed standard curve in Settings.
- **P2.2 Growth chart.** On Set detail and Today, ported from the reference component.
- **P2.3 Feed.** Purchases (linked amounts), ingredients, stock from purchases − daily use, run-out warning, price trend.
- **P2.4 Health.** Vaccine schedule with due / given / late, treatments.
- **P2.5 Set P&L and cash position.** Finance page; reconciliations.
- **P2.6 Set report + PDF.**

## P3 — Improving the farm

- **P3.1 Weekly review.** Rules engine over metrics; written review per active Set.
- **P3.2 Compare Sets.** Dropdown picker per the acceptance criteria.
- **P3.3 Capital and loans.** Shareholders, entries, loans with gross / WHT / net, borrowing capacity.
- **P3.4 Buyer analytics.** Buyer page vs bulk rate.
- **P3.5 Hardening.** Playwright flows for daily log (offline), expense attribution, sale balances; accessibility pass; performance on a mid-range Android.

## Later (do not build)

Other stock types, payroll, native app, multiple farms.
