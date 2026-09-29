# Profile, shareholder removal, activity log, emails — implementation plan

> Spec: `docs/superpowers/specs/2026-09-29-profile-activity-reminders-design.md`. Executed inline, one commit per task on `main`.

**Goal:** profile + password change, emailed starting passwords, shareholder removal, an owners' activity log, and a 6pm missing-log email.

**Architecture:** one migration for the new columns and tables; a small `src/server/mail` module that posts to Resend's HTTP API with `fetch` (no SDK: the `resend` package wants `@react-email/render` as a peer); services under `src/server/services`, thin routes, screens under `src/components/{profile,settings,finance}`.

## Global constraints

- AGENTS.md rules: one thing per file, under 150 lines; `zod/mini`; route = session → role → schema → service; every write audited; plain English; money integer naira; Lagos time.
- Env (optional): `RESEND_API_KEY`, `MAIL_FROM` (default `Kotila Farms <hello@kotilafarms.com>`), `HOW_TO_VIDEO_URL` (default the S3 video).
- `pnpm lint && pnpm typecheck && pnpm test` pass after every task; migration generated with `pnpm db:generate` and committed.

## Tasks

1. **Schema and mail.** Migration `0002`: `users.must_change_password boolean default false`, `shareholders.removed_at timestamptz`, `auth_events`, `reminder_runs` (unique `kind, day`). Env schema entries. `src/server/mail/{send-mail,layout,starting-password,daily-reminder}.ts`; `sendMail` returns `{ sent: true } | { sent: false, reason }` and never throws. Tests: env parsing, `sendMail` without a key, templates escape names.
2. **Auth events and first-password gate.** `recordAuthEvent`; sign-in success and failure in `authorize`, sign-out via NextAuth `events.signOut`. JWT and session carry `mustChangePassword`; `jwt` re-reads on `trigger === "update"`. `requireSession` refuses (403 `password_change_required`) while it is set; `getSessionUser` still works. Proxy sends pages to `/profile?first=1`. Tests: gate on a route, auth event rows.
3. **Profile page and password change.** `passwordChangeSchema`; `changePassword` service (checks current, rate limit per user, hash, clear flag, auth event); `POST /api/me/password` (uses `getSessionUser`, so it works while gated). `/profile` page: details, change form, sign out (logic moved from `AccountSheet` to `useSignOut`); rail person and top-bar account button link there; account sheet removed. Tests: wrong current, mismatch, success clears the flag and records the event.
4. **Add person with a starting password.** `generatePassword`; `addPerson` and `resetPassword` services (hash, flag, audit, email); `POST /api/users`, `POST /api/users/[id]/password`. `AddPersonSheet` replaces `InviteSheet`; `PersonSheet` gets **Reset password**; `StartingPassword` shows the password once if the email didn't go. Tests: add, duplicate email, reset, non-owner refused, email result reported.
5. **Remove a shareholder.** Schema `shareholderUpdateSchema` gains `removed`; service sets or clears `removedAt` (audited); capital payload splits active and removed, ownership only over active shares; new capital entries and loans refused for removed people; repay still allowed. Sheet buttons and a Removed list. Tests: shares drop out, money stays, entries refused, restore.
6. **Activity log.** `activityFeed` service merges `audit_events` and `auth_events` (filters, `before` cursor, 50 a page); `describeActivity` labeller; `GET /api/activity` (owners); Settings › Activity tab and screen. Tests: merge order, filters, owner only, labels.
7. **6pm reminder.** `setsMissingToday`; `runDailyReminder(db, now)` claims `reminder_runs`, sends, releases the claim on failure; `startReminderTimer` from `instrumentation.ts` when a key is set. Tests: missing detection, window, one send per day, retry after failure, nothing sent when all logged.
8. **Docs.** `docs/13-deploy.md` env, `.env.example`, `docs/04-api.md`, `docs/05-auth-and-roles.md`, change log; e2e for users and shell updated.
