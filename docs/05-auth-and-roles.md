# Auth and roles

## NextAuth setup

- **Version:** latest stable `next-auth` (at handoff: v4.24.x; v5 is beta — do not use unless it has become `latest`). Re-check per AGENTS.md.
- **Provider:** Credentials (email + password). No public sign-up; accounts come from owner invites.
- **Sessions:** JWT strategy. Put `id`, `name`, `role` in the token and session via the `jwt` and `session` callbacks. Refresh `role` and `active` from the DB at most every 5 minutes inside the `jwt` callback, so a deactivated person is logged out soon after.
- **Passwords:** hash with a maintained library (check latest stable; argon2 via a pure-JS/WASM or native build that works in the container, or bcrypt). Minimum 10 characters.
- **Rate-limit** sign-in attempts per email + IP (in-memory is fine for one instance; note it in the change log).
- **Pages:** custom `/sign-in` and `/invite/[token]` matching `design/screens/Main.dc.html`, `SignInPhone.dc.html`, `SetPassword.dc.html`.
- **Offline sign-in:** keep the session cookie long-lived on the device (30 days, sliding). If the app shell loads offline with a valid cached session, show the "Open offline as <name>" screen (SignInPhone design). Signing in as someone else needs a connection.
- **Middleware:** protect `(app)` routes; redirect unauthenticated users to `/sign-in`; send recorders who hit owner/manager routes to `/today`.

## Role helpers

`src/lib/auth/roles.ts` (isomorphic):

```ts
export type Role = 'owner' | 'manager' | 'recorder';
export const can = {
  seeMoney: (r: Role) => r !== 'recorder',
  manageOperations: (r: Role) => r === 'owner' || r === 'manager',
  seeCapitalAndLoans: (r: Role) => r === 'owner',
  manageUsers: (r: Role) => r === 'owner',
  logDaily: (_: Role) => true,
};
```

`src/server/auth.ts`: `requireSession()`, `requireRole(session, roles)`. Use them in every route handler. The UI uses `can.*` to hide (not disable) navigation and actions.

## Access matrix

| Area | Owner | Manager | Recorder |
| --- | --- | --- | --- |
| Today | Full with money | Full (no capital/loans) | Sets, logs, what's due — no money |
| Daily log, weights | ✓ | ✓ | ✓ (edit same day; later edits need a manager) |
| Sets list and detail | ✓ | ✓ | Read counts, no money |
| Feed, health, sales, buyers, expenses | ✓ | ✓ | — |
| Cash position, Set P&L | ✓ | ✓ | — |
| Partner capital, loans, settlement | ✓ | — | — |
| Reports | ✓ | ✓ | — |
| Users and roles | ✓ | — | — |
| Feed types, categories, buyers, schedule, breed curve | ✓ | ✓ | — |

Recorders use the phone layout only (tab bar: Today, Log, Weigh, History).
