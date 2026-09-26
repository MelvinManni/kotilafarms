# Client data: React Query, forms, validation

## TanStack Query

- One `QueryClient` in `src/lib/query/client.ts`, provided in `src/app/providers.tsx` (client component) with devtools in development only.
- Defaults: `staleTime` 30s for lists, 5 min for settings/reference data; `gcTime` 24h; `retry` 2 for queries, 0 for mutations; `networkMode: 'offlineFirst'`.
- **Query keys** from one factory, `src/lib/query/keys.ts`:

```ts
export const qk = {
  today: () => ['today'] as const,
  sets: { all: () => ['sets'] as const, detail: (id: string) => ['sets', id] as const,
          logs: (id: string) => ['sets', id, 'logs'] as const, weights: (id: string) => ['sets', id, 'weights'] as const },
  sales: { all: (f?: object) => ['sales', f ?? {}] as const, outstanding: () => ['sales', 'outstanding'] as const },
  // … one entry per resource in docs/04-api.md
};
```

- **Hooks live in `src/hooks/queries`, one file per resource:** `src/hooks/queries/use-sales.ts` exports `useSales(filters)`, `useSale(id)`, `useCreateSale()`, `useRecordPayment()`. Components never call `fetch` directly.
- One fetcher (`src/lib/query/fetcher.ts`) that throws a typed `ApiError` from the `{ error }` body.
- **Mutations** invalidate by key prefix (`qk.sets.all()`, `qk.today()`), and use optimistic updates for the daily log and weight sample so the phone never waits.
- Persist the query cache to IndexedDB (`@tanstack/query-persist-client` + an IndexedDB persister — check latest stable versions) so screens render offline.

## Forms

- `react-hook-form` with `zodResolver` from `@hookform/resolvers`, schema from `src/schemas/<entity>.ts`.
- The **same schema** validates the route handler input. Export `XCreateInput = z.infer<typeof xCreateSchema>`.
- Wrap design-system inputs with `Controller` (Stepper, ChipGroup, Segmented, AttributionField, MoneyInput, LinkedAmounts). Build them as controlled components (`value`, `onChange`).
- Money fields parse to integer naira; weights to integer grams.
- Key schema rules:
  - `expense`: `z.union` / refine so exactly one of `setId` or `overhead: true`; message "Choose a Set or farm overhead before saving."
  - `feedPurchase`: `bags`, `pricePerBag`, `total` all required, refine `|bags × pricePerBag − total| ≤ 1`.
  - `sale`: `birds`, `pricePerBird`, `total`, `paidAtSale` required; `balance` derived, never input.
  - `dailyLog`: `deaths` int ≥ 0 required; everything else optional; `deathCause` optional by design.
  - `weightSample`: ≥1 weight; warn (not error) below 10.
  - edits after the day: `reason` required (server enforces too).
- Error copy follows `design/brand/10-writing.md`: say what's wrong and how to fix it.

## Formatting

`src/utils/format`: `naira(n)` → `₦1,284,750` / `−₦879,550`; `pct(n, d)`; `kg(grams)`; farm dates `Sat 26 Sep`. Figures use `tabular-nums` globally.
