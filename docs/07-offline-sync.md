# Offline and sync

Signal on the farm is unreliable. The daily log, weight samples and quick expenses must work with no connection. The sync system has one job above all others: **every entry arrives exactly once, and nothing is lost or silently overwritten.**

## Pieces

1. **App shell caching** — a service worker (check the current stable choice for Next.js App Router, e.g. Serwist; do not use unmaintained next-pwa forks). Cache the app shell, fonts, logos and the routes used on the phone: `/today`, `/log/*`, `/weigh/*`.
2. **Read cache** — persisted React Query cache in IndexedDB (see client-data doc).
3. **Outbox** — `src/lib/offline/outbox/*` stores pending mutations in IndexedDB (Dexie or `idb` — check latest stable).
4. **Sync worker** — `src/lib/offline/sync-worker.ts` sends the outbox to `POST /api/sync`.
5. **Sync ledger** — `sync_mutations` table on the server records every mutation it has applied.

## Two ids, two jobs

| Id | Made when | Job |
| --- | --- | --- |
| `clientId` | The form opens (not on save) | Identity of the **record**. Unique on every table. Same record → same `clientId`, forever |
| `mutationId` | The mutation is put in the outbox | Identity of the **request**. Unique in `sync_mutations`. Retrying a request reuses it |

Both are `crypto.randomUUID()`. A double tap, a retry after a lost response, or a second tab all carry the same ids, so the server can tell a repeat from a new entry.

## Duplicate protection, layer by layer

No single layer is trusted alone.

| # | Layer | Stops |
| --- | --- | --- |
| 1 | Save button disabled while saving; `clientId` fixed per open form | Double taps |
| 2 | Outbox key is `mutationId`; a still-pending create is **edited in place**, not queued twice | Two queue rows for one entry |
| 3 | One sync runner at a time (Web Locks: `navigator.locks.request('kotila-sync')`) | Two tabs sending the same batch |
| 4 | `sync_mutations` ledger, written in the **same transaction** as the record | Replays after a lost response, a crash or a timeout |
| 5 | `UNIQUE(clientId)` on every table | Replays after the ledger row has been pruned |
| 6 | Natural keys: `daily_logs UNIQUE(setId, date)` | Two people logging the same Set and day |
| 7 | Likely-repeat check on expenses and weight samples | Two people entering the same real-world thing |

### Layer 4 — the ledger

`sync_mutations(mutationId pk, deviceId, userId, type, payloadHash, status, entityTable, entityId, result jsonb, receivedAt)`

For each mutation the server, inside one transaction:

1. Looks up `mutationId`. If found with the **same** `payloadHash` → return the stored result as `duplicate`. If found with a **different** hash → `rejected`, code `MUTATION_ID_REUSED` (a client bug; never apply).
2. Otherwise applies the change, then inserts the ledger row.
3. If two requests race, the second insert hits the primary key (Postgres `23505`). Catch it, roll back, re-read the ledger row, return `duplicate`.

`payloadHash` = SHA-256 of the payload as canonical JSON (sorted keys). Ledger rows are kept 180 days; layer 5 covers anything older.

### Layer 6 — one daily log per Set per day

`dailyLog.upsert` finds the live row for `(setId, date)`:

| Found | Action | Result |
| --- | --- | --- |
| Nothing | Insert | `applied` |
| Row with the **same** `clientId`, `version = baseVersion` | Update, `version + 1`, audit | `applied` |
| Row with the same `clientId`, `version ≠ baseVersion` | Save to `daily_log_conflicts` | `conflict` |
| Row with a **different** `clientId` | Save to `daily_log_conflicts` | `conflict` |

Conflicts are never merged. A manager picks one in a Sheet that shows both versions. `daily_log_conflicts.mutationId` is unique, so a replayed conflict does not make a second conflict row.

### Layer 7 — likely repeats

Some entries can be genuine twins (two bags of the same feed bought the same day), so the server **never drops** them. It saves the entry and sets `possibleDuplicateOf` when a live row matches:

- **Expense:** same `date`, `categoryId`, `amount`, and same Set (or both overhead), different `clientId`.
- **Weight sample:** same `setId`, `date`, and the same weights (sorted), different `clientId`.

The result is `applied` with `possibleDuplicateOf`. A manager sees *Looks like a repeat of Chinedu's ₦12,000 diesel* with **Keep both** or **Remove this one** (soft delete, audited). The same check runs on the phone before saving, against cached data: *This looks already recorded by Chinedu. Save anyway?*

## Outbox (IndexedDB)

```ts
type OutboxItem = {
  mutationId: string;          // primary key
  clientId: string;            // the record this mutation creates or edits
  type: 'dailyLog.upsert' | 'weightSample.create' | 'expense.create';
  payload: unknown;            // already valid against the shared zod schema
  baseVersion?: number;        // version the edit was based on (edits only)
  userId: string;              // who entered it
  createdAt: string;           // device time, ISO
  status: 'pending' | 'sending' | 'sent' | 'conflict' | 'rejected';
  attempts: number;
  nextAttemptAt: string;
  sendingSince?: string;
  serverId?: string;
  error?: { code: string; message: string };
};
```

Rules:

- **One write path.** These three types always go through the outbox, online or not. Online, the worker sends at once. There is no second "online" code path to drift out of step.
- **Validate before queueing** with the same zod schema the server uses, so rejections are rare.
- **Edit a pending create in place.** If the item is still `pending`, change its payload (the `mutationId` stays; nothing was sent yet). If it is `sending` or `sent`, queue a new mutation with the same `clientId` and a `baseVersion`.
- **Order per record.** A mutation is not sent until earlier mutations for the same `clientId` are `sent`.
- **Keep the queue safe.** Call `navigator.storage.persist()` after sign-in. If IndexedDB is not available, say so plainly: *This browser can't keep entries offline.*
- **Keep sent items 7 days** so lists can show what came from this phone, then prune.

## Sync worker

- **Runs** on `online`, when the app comes to the front, right after a save, every 60 s while online with work waiting, and on the service worker `sync` event where the browser supports Background Sync.
- **One runner** across tabs via Web Locks (`ifAvailable: true`; if the lock is taken, skip).
- **Stuck items:** on start, any `sending` item older than 2 minutes goes back to `pending`. Safe, because the ledger makes resends harmless.
- **Batches** of up to 25, oldest first. The server handles each mutation in its own transaction, in order, so one bad entry does not block the rest.
- **Outcomes:**

| Server says | Outbox does | Person sees |
| --- | --- | --- |
| `applied` / `duplicate` | `sent`, store `serverId`, refresh queries | Tag disappears |
| `conflict` | `conflict` | *1 entry needs a look* |
| `rejected` (validation, permission) | `rejected` with the message | The entry with the reason and **Fix** or **Remove** (remove asks first) |
| Network error, timeout, 5xx | stays `pending`; `attempts + 1`; `nextAttemptAt` = now + min(30 s × 2^attempts, 30 min) ± 20 % | *Offline · 3 waiting* |
| 401 | pause the worker | *Sign in again to send 3 entries* (queue kept) |

- An item is **never deleted automatically** unless it is `sent` and older than 7 days.

## People and devices

- `deviceId` is made once per browser and kept in IndexedDB. The server keeps `devices(id, userId, lastSeenAt, pendingCount, pendingSummary)`; every sync call (even an empty one) updates it. `/api/today` uses it to say *Friday's Set 4 log is on Chinedu's phone, waiting for signal*. This only covers entries the phone reported while it still had signal.
- The server acts as the **session user**. Outbox items carry `userId`; the worker only sends items for the signed-in user, and the server rejects a mismatch (`WRONG_USER`).
- **Switching person on a phone** needs the outbox to be empty: *Send Chinedu's 3 entries before signing in as someone else.* Signing out with items waiting asks first.

## Time

- The farm day is chosen in the form (default: today in `Africa/Lagos`), never worked out from when the entry syncs.
- `enteredOfflineAt` is device time, kept for the record only. The server stamps `receivedAt` itself.

## `POST /api/sync`

Request: `{ deviceId, pending: { count, summary }, mutations: [{ mutationId, clientId, type, payload, baseVersion?, enteredOfflineAt? }] }`
Response: `{ results: [{ mutationId, status: 'applied' | 'duplicate' | 'conflict' | 'rejected', id?, version?, conflictId?, possibleDuplicateOf?, error? }] }`

- Max 25 mutations per call (`413` above that).
- Always `200` with per-mutation results; `401`/`403` only for the whole call.

## Other writes

Online-only creates (sales, feed purchases, payments, …) still send a `clientId` made when the form opens, so a double submit or a retry returns the existing row. Money-sensitive writes (capital, loans, reconciliations) are never queued; those screens show "Needs a connection".

## UI states (design: `SyncStatus` component)

| State | Text | Where |
| --- | --- | --- |
| synced | All synced · 2 min ago | rail foot (desktop); hidden or pill on phone |
| offline | Offline · 3 waiting | phone top bar, always |
| syncing | Sending 3 entries… | same |
| conflict | 1 entry needs a look | same + notice on the record; manager resolves in a Sheet showing both versions |
| rejected | 1 entry couldn't be saved | same + the entry shows why and how to fix it |

- Save confirmation never waits for the network: "Saved on this phone · will send when signal returns".
- Items still queued show an "On this phone" tag in lists.
- Missed days: `/api/sets/:id/missing-days` → "Set 5 has no log for Friday" with a **Fill in Friday** action.

## As built (P1.8)

- Service worker: Serwist (`@serwist/turbopack`), `src/app/sw.ts`, served at `/serwist/sw.js`; pages are cached as they are opened, `/~offline` when a page isn't on the phone yet. Off in development. It never reloads the page when signal returns (that would lose a half-typed log).
- Screens read the signed-in person from the page (`useCurrentUser`), not a session fetch, so they open offline.
- Results also include `"retry"`: the server hit a problem it may not hit next time; the phone backs off and tries again.
- The sync sheet (tap the sync status) lists what is on the phone, entries turned down (with why, and Remove), clashes, and **Send now**, which ignores the backoff.
- Saving with no signal confirms in place ("Saved on this phone") instead of loading another page.
- Managers settle clashes from the sync sheet: both versions side by side, keep one; the choice is audited.
- The React Query cache is kept in IndexedDB for 7 days and refreshed as soon as the app opens; signing out clears it and the cached pages.
- Code: `src/lib/offline/*` (outbox, worker, submit), `src/server/services/sync/*`, `src/app/api/sync`, `src/app/api/conflicts`, `src/components/offline/*`.

## Tests that must exist

Unit (Vitest, server service against a test database, and the outbox with `fake-indexeddb`):

1. Same mutation sent twice → one row, second result `duplicate` with the same id.
2. Response lost (server applied, client retries) → one row.
3. Two concurrent requests with one `mutationId` → one row, one `applied`, one `duplicate`.
4. Same `mutationId`, different payload → `rejected` `MUTATION_ID_REUSED`, nothing written.
5. Two devices log the same Set and day → one row + one conflict; replaying the conflict makes no second conflict.
6. Stale `baseVersion` → conflict, row unchanged.
7. Editing a pending create changes the one outbox item; no second item.
8. `sending` item older than 2 minutes is resent; still one row.
9. Rejected item stays in the outbox until the person removes it.
10. Matching expense from another device → saved with `possibleDuplicateOf`.

Playwright (P3.5): log offline, reload, go online → one row; kill the network mid-sync → one row.
