# Data model (Drizzle, PostgreSQL)

Money: integer naira (`bigint` mode `number`). Weights: integer grams. Feed quantities: numeric(10,2) bags or kg. All tables get the **common columns**:

```ts
id uuid pk default gen_random_uuid()
clientId uuid unique not null        // generated on the device when the form opens; record identity for sync
version int not null default 1        // + 1 on every update; offline edits send baseVersion (see offline doc)
createdBy uuid -> users.id not null
createdAt timestamptz default now()
updatedAt timestamptz default now()
deletedAt timestamptz null           // soft delete (owner only); audit keeps the tombstone
```

Put these in a helper (`src/db/schema/_common.ts`) and spread into each table.

## Tables

```text
users            id, name, email (unique, lowercased), passwordHash, role enum(owner|manager|recorder),
                 active bool, lastActiveAt, invitedBy
invites          id, email, role, tokenHash, expiresAt, acceptedAt, createdBy

stock_types      id, key ('broiler'), name                      -- only broiler seeded in v1
breed_curves     id, name, points jsonb [{day, grams}]           -- editable in Settings
sets             id, number (unique, sequential), name?, stockTypeId, pen?, status enum(brooding|growing|selling|closed),
                 startDate date, intake int, dayOldSupplier, dayOldUnitCost int, breedCurveId, closedOn date?

daily_logs       id, setId, date, deaths int, deathCause enum?(unknown|disease|heat|culled|predator|crush),
                 feedTypeId?, feedQty numeric, feedUnit enum(bags|kg), waterLevel enum?(low|normal|high), waterLitres int?,
                 tempC numeric?, tags text[] (coughing|green_stool|lethargy|panting|wet_litter|poor_appetite), note text?,
                 enteredOfflineAt timestamptz?, UNIQUE(setId, date) WHERE deletedAt IS NULL
daily_log_conflicts id, setId, date, incoming jsonb, existingId, mutationId uuid unique, raisedBy, resolvedBy?, resolvedAt?,
                 resolution enum?

weight_samples   id, setId, date, ageDays int, weightsGrams int[], possibleDuplicateOf uuid?   -- avg, cv, uniformity computed
feed_types       id, kind enum(starter|grower|finisher), brand, kgPerBag numeric default 25, active
feed_purchases   id, date, feedTypeId, bags numeric, kgPerBag numeric, pricePerBag int, total int,
                 transportCost int default 0, supplier, setId? , overhead bool   -- CHECK bags*pricePerBag ≈ total (±1)
ingredient_purchases id, date, setId, ingredient, quantity numeric, unit, unitCost int, total int

vaccine_schedule_defaults id, item, doseNo, dueAgeDays, method
set_vaccines     id, setId, item, doseNo, dueAgeDays, givenOn date?, givenBy?, note?
health_records   id, setId, date, item, dose text, cost int?, reason text, setVaccineId?

buyers           id, name, phone?, note?
sales            id, setId, date, buyerId, birds int, pricePerBird int, total int, paidAtSale int, deposit int default 0,
                 method enum(cash|transfer|pos), note?          -- balance = total − deposit − paidAtSale − Σ payments
sale_payments    id, saleId, date, amount int, method
other_sales      id, setId, date, kind enum(manure), amount int

expense_categories id, key, name, isCapitalEligible bool       -- the 10 categories from the spec
expenses         id, date, categoryId, description, amount int, setId uuid?, overhead bool, paidByUserId?,
                 receiptKey?, capitalItem bool default false, spreadOverSets int?, possibleDuplicateOf uuid?,
                 CHECK ((setId IS NOT NULL) <> overhead)   -- receiptKey = S3 object key, never a public URL

shareholders     id, name, shares int                            -- 633,858 / 122,985 / 122,984 / 120,173
capital_entries  id, shareholderId, date, amount int (+ contributed, − withdrawn), note
loans            id, lenderShareholderId, amount int, advancedOn date, repaidOn date?, rate numeric default 0.16,
                 whtRate numeric default 0.10
settings         key text pk, value jsonb                         -- borrowingCapPct (0.5), farm timezone, bulk rate

cash_reconciliations id, date, countedCash int, bankBalance int, expected int, difference int, note, by

devices          id uuid (made on the device), userId, userAgent, lastSeenAt, pendingCount int, pendingSummary jsonb
sync_mutations   mutationId uuid pk, deviceId, userId, type, payloadHash text, status enum(applied|conflict|rejected),
                 entityTable text?, entityId uuid?, result jsonb, receivedAt timestamptz  -- sync ledger, kept 180 days

audit_events     id, table, rowId, action enum(create|update|delete|resolve), field?, oldValue jsonb?, newValue jsonb?,
                 reason text?, userId, deviceId?, at timestamptz, enteredOfflineAt?
```

## Decisions made while building (P0.6)

- **Every naira out is an `expenses` row.** Feed purchases, ingredient purchases and health records with a cost each point at their expense (`expenseId`, unique), and a feed purchase's transport is a second expense (`transportExpenseId`). Set-or-overhead lives on the expense. P&L and cash read only `expenses`, so nothing is counted twice.
- **Amounts agree, allowing for a worked-out value.** `sales`: `|total − birds × price| × 2 ≤ max(birds, 2)` (price rounded to the naira from the total). `feed_purchases`: `|total − bags × price| ≤ max(1, bags ÷ 2, price × 0.005)`. A flat ±1 would refuse real entries (465 birds for ₦3,563,550 → ₦7,664 each).
- `daily_log_conflicts`, `devices`, `sync_mutations`, `audit_events`, `settings`, `users`, `invites` do not use the common columns.
- Every unique constraint has an explicit snake_case name (`<table>_client_id_unique` …), so errors name it plainly.
- Columns are camelCase in code and snake_case in Postgres (`casing: "snake_case"`).

## Rules enforced in the database

- `expenses`: exactly one of `setId` / `overhead` (CHECK). This is the core rule of the product.
- `sales`: `total = birds × pricePerBird` (CHECK, tolerance ±1 for rounding if price was derived).
- `feed_purchases`: bags, pricePerBag, total all NOT NULL.
- `daily_logs`: one live row per Set per day (partial unique index).
- Sequential `sets.number` (use a sequence).
- `clientId` unique on every table; `sync_mutations.mutationId` primary key; `daily_log_conflicts.mutationId` unique. These are the duplicate backstops (see `docs/07-offline-sync.md`).
- `devices`, `sync_mutations` do not use the common columns.

## Audit

`server/audit.ts` exposes `recordChange(tx, { table, rowId, before, after, reason, user, deviceId })` which diffs `before`/`after` and writes one `audit_events` row per changed field. Changing `deaths`, any amount, or `birds` on a record older than its own day **requires** `reason` (service throws 422 without it).

## Indexes

`daily_logs(setId, date)`, `sales(setId)`, `sales(buyerId)`, `expenses(date)`, `expenses(setId)`, `audit_events(table, rowId)`, `feed_purchases(feedTypeId, date)`.
