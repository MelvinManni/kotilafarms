# Architecture

## Shape

```text
Browser (phone / laptop)
  React (App Router pages, client components)
    hooks/queries/*  ── TanStack Query ──►  fetch('/api/...')
    react-hook-form + zod (schemas/*)          │
    offline queue (lib/offline) ── /api/sync ──┤
                                               ▼
Next.js server
  app/api/**/route.ts   (thin: auth → role → zod → service → JSON)
  server/services/*     (business rules, transactions, audit)
  utils/metrics/*       (pure calculations, shared with client)
  db (Drizzle) ───────► PostgreSQL (docker)
  NextAuth (Credentials, JWT) ─ app/api/auth/[...nextauth]
```

## Layers and what may import what

| Layer | Path | May import | Must not import |
| --- | --- | --- | --- |
| Pages / layouts | `src/app/(app)/**` | components, hooks, utils, constants, types | `server/*`, `db/*` (except `server/auth` for the session in layouts) |
| Screen components | `src/components/<area>/**` | kotila, ui, layout, svgs, hooks, utils, schemas, constants | server, db |
| Design components | `src/components/kotila`, `components/layout` | `components/ui`, svgs, utils | hooks/queries, server |
| shadcn primitives | `src/components/ui` | Base UI, `utils/cn` | everything else |
| SVGs | `src/svgs` | React only | everything else |
| Hooks | `src/hooks/**` | lib, utils, schemas, types | server, db, components |
| Utils | `src/utils/**` | other utils, constants, types | React, server, db |
| Lib (setup) | `src/lib/**` | utils, schemas, types | server, db, components |
| Schemas | `src/schemas/**` | zod, constants | everything else |
| Route handlers | `src/app/api/**` | server, schemas, utils | components, hooks |
| Services | `src/server/services/**` | db, utils, schemas, `server/audit` | app, components, hooks |
| DB | `src/db/**` | drizzle | everything else |

Mark server-only modules with `import 'server-only'`.

## Route handler template

```ts
// src/app/api/expenses/route.ts
export async function POST(req: Request) {
  const session = await requireSession();                    // 401 if none
  requireRole(session, ['owner', 'manager']);                // 403 otherwise
  const input = expenseCreateSchema.parse(await req.json()); // 422 with zod issues
  const expense = await expenseService.create(input, session.user);
  return Response.json(expense, { status: 201 });
}
```

Errors return `{ error: { code, message, issues? } }` with the right status (401, 403, 404, 409 conflict, 422 validation). Put the error mapping in one helper (`src/server/http.ts`) and wrap every handler with it.

## Services

One file per entity. Each mutating method runs in a Drizzle transaction and writes `audit_event` rows via `server/audit.ts`. Services never read the request; they receive validated input and the acting user.

## Derived numbers

`src/utils/metrics/` exposes pure functions (`liveBirds`, `mortalityRate`, `fcr`, `adg`, `uniformity`, `gapToStandard`, `setPnl`, `cashPosition`, `loanInterest`, `feedRunOut`, `weeklyReviewFindings`). Services call them for API responses; the client may call them for instant feedback (live bird count while typing, weight sample stats) — same code, same answers.

## PDF

Set report and weekly review are pages under `src/app/(print)/…` rendered at A4. Export with a headless browser from a route handler (`/api/reports/set/[ids]/pdf`). Check whether Playwright's Chromium is acceptable in the container image; if too heavy, run it only in the app container, not the dev container.

As built (P2.6): `playwright-core` drives Alpine's `chromium` in the app image (`CHROMIUM_PATH`), or the installed Chrome in development. The route passes the person's session cookie to the browser, which only ever visits `INTERNAL_APP_URL` (or `NEXTAUTH_URL`), never the request's Host. The print page is `/print/reports/set?setIds=`, rendered on the server.

## Environment

`.env.example` lists every variable. Validate env at startup with a zod schema in `src/lib/env.ts`; fail fast on missing values.

## Performance (measured in P3.5)

Production build, Pixel 7 profile, CPU slowed 4×, slow 4G (1.6 Mb/s down, 150 ms latency):

| Visit | Time |
| --- | --- |
| Sign-in, first visit (no cache, no service worker) | about 2.3 s to tap-ready; 279 KB JS compressed (was 2.7 s and 348 KB before `zod/mini`) |
| Sign in → Today on screen | about 2.2 s |
| `/log` with no cache | about 2.4 s to interactive (was 2.8 s) |
| Any phone page once the service worker has it | 0.3–0.4 s |

Schemas use `zod/mini` (functional checks: `z.string().check(z.trim(), z.minLength(2, "…"))`, `z.optional(…)`, `z.extend(…)`); it took zod from about 87 KB to about 20 KB compressed. Shared checks live in `src/schemas/checks.ts`.

