# Offline and sync

Signal on the farm is unreliable. The daily log, weight samples and quick expenses must work with no connection.

## Pieces

1. **App shell caching** — a service worker (check the current stable choice for Next.js App Router, e.g. Serwist; do not use unmaintained next-pwa forks). Cache the app shell, fonts, logos and the routes used on the phone: `/today`, `/log/*`, `/weigh/*`.
2. **Read cache** — persisted React Query cache in IndexedDB (see client-data doc).
3. **Write queue** — `src/lib/offline/queue.ts` stores pending mutations in IndexedDB (Dexie or `idb` — check latest stable): `{ clientId, type, payload, createdAt, attempts, status }`.
4. **Sync worker** — runs on `online`, on app focus, and every 60s while online: posts batches to `POST /api/sync`, marks items `sent`, surfaces `conflict` items.

## `POST /api/sync`

Request: `{ deviceId, mutations: [{ clientId, type: 'dailyLog.upsert' | 'weightSample.create' | 'expense.create', payload, enteredOfflineAt }] }`
Response: `{ results: [{ clientId, status: 'applied' | 'duplicate' | 'conflict' | 'rejected', id?, conflictId?, error? }] }`

- Idempotent by `clientId`.
- `dailyLog.upsert` for a (Set, date) that already has a different row from another device → store in `daily_log_conflicts`, return `conflict`.
- Money-sensitive writes (capital, loans, reconciliations) are never queued; those screens show "Needs a connection".

## UI states (design: `SyncStatus` component)

| State | Text | Where |
| --- | --- | --- |
| synced | All synced · 2 min ago | rail foot (desktop); hidden or pill on phone |
| offline | Offline · 3 waiting | phone top bar, always |
| syncing | Sending 3 entries… | same |
| conflict | 1 entry needs a look | same + notice on the record; manager resolves in a Sheet showing both versions |

- Save confirmation never waits for the network: "Saved on this phone · will send when signal returns".
- Items still queued show a "On this phone" tag in lists; other users see "Friday's Set 4 log is on Chinedu's phone, waiting for signal" (`/api/today` knows from device heartbeat: store `lastSeenAt` and `pendingCount` per device on each sync).
- Missed days: `/api/sets/:id/missing-days` → "Set 5 has no log for Friday" with a **Fill in Friday** action.
