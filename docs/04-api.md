# API (Next.js Route Handlers under `/api`)

All JSON. All require a session except `auth/*` and `invites/accept`. Roles: **O** owner, **M** manager, **R** recorder. Recorder responses never include money fields (strip in the service, not the client).

| Method & path | Roles | Purpose |
| --- | --- | --- |
| `GET/POST /api/auth/[...nextauth]` | — | NextAuth |
| `POST /api/invites` | O | Invite by email + role |
| `POST /api/invites/accept` | public (token) | Set name + password |
| `GET /api/users`, `PATCH /api/users/:id` | O | List, change role, deactivate |
| `GET /api/today` | O M R | Dashboard payload (role-shaped): active Sets summary, tasks, owed (O M), cash (O M) |
| `GET /api/sets`, `POST /api/sets` | O M (R read) | List (with headline metrics) / start a Set (creates vaccine schedule from defaults) |
| `GET/PATCH /api/sets/:id` | O M (R read) | Detail with metrics; status changes |
| `GET /api/sets/:id/logs`, `POST /api/sets/:id/logs` | O M R | Daily logs; POST upserts by (setId, date); returns 409 + conflict id if another device already logged that day |
| `PATCH /api/logs/:id` | O M (R same day, own) | Edit with `reason` when after the day |
| `GET /api/sets/:id/missing-days` | O M R | Days with no log since start |
| `GET/POST /api/sets/:id/weights` | O M R | Weight samples (server computes stats) |
| `GET/POST /api/feed/purchases` | O M | Feed purchases |
| `GET/POST /api/feed/ingredients` | O M | Raw ingredient purchases |
| `GET /api/feed/stock` | O M | Stock per feed type + run-out estimate |
| `GET /api/feed/prices?feedTypeId=` | O M | Price-per-bag history |
| `GET/PATCH /api/sets/:id/vaccines` | O M | Schedule; mark given |
| `GET/POST /api/health` | O M | Drug and supplement records |
| `GET/POST /api/buyers`, `GET /api/buyers/:id` | O M | Buyers; buyer page with analytics |
| `GET/POST /api/sales`, `GET/PATCH /api/sales/:id` | O M | Sales (any two of birds/price/total → third) |
| `POST /api/sales/:id/payments` | O M | Record a payment |
| `GET /api/sales/outstanding` | O M | Balances owed |
| `POST /api/other-sales` | O M | Manure |
| `GET/POST /api/expenses`, `PATCH /api/expenses/:id` | O M | Filters: `setId`, `overhead`, `categoryId`, `from`, `to` |
| `POST /api/uploads/receipt` | O M | Receipt photo. Server checks role, type and size, puts it in the private S3 bucket, returns the object key |
| `GET /api/uploads/receipt/:key` | O M | Redirects to a short-lived signed S3 URL for the photo |
| `GET /api/finance/cash` , `POST /api/finance/reconciliations` | O (M read cash) | Cash position |
| `GET /api/finance/pnl?setIds=` | O M | P&L for one or more Sets |
| `GET/POST /api/finance/capital` | O | Shareholders, entries |
| `GET/POST /api/finance/loans`, `PATCH /api/finance/loans/:id` | O | Loans with gross / WHT / net interest |
| `GET /api/reports/set?setIds=` , `GET /api/reports/set/pdf?setIds=` | O M | Set report data / PDF |
| `GET /api/reports/weekly?week=` | O M | Weekly review per active Set |
| `GET /api/reports/compare?setIds=` | O M | Comparison (≥2 ids) |
| `GET /api/audit?table=&rowId=` | O M | Edit history |
| `POST /api/sync` | O M R | Batch of queued offline mutations (see offline doc) |
| `GET /api/settings/*` , `PATCH` | O (M for feed types, categories, buyers, schedule, curve) | Settings |

## Conventions

- Request and response types come from `z.infer` of the shared schemas in `src/schemas`.
- Every create accepts a client-generated `clientId`; repeating a request with the same `clientId` returns the existing row (idempotent).
- List endpoints: `?cursor=&limit=` pagination, default 50.
- Dates as `YYYY-MM-DD` strings for farm days; ISO timestamps for events.
