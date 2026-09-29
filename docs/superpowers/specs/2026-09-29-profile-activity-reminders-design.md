# Profile, shareholder removal, activity log, emails — design

Date: 29 Sep 2026. Agreed with Melvin in chat.

Five small features. Emails go through Resend from the `kotilafarms.com` domain.

## 1. Profile page and password change

- Clicking your name opens `/profile`: the person in the side rail on a laptop, the account button in the top bar on a phone. Every role gets it.
- The page shows name, email and role; a **Change password** form (current password, new password, new password again); and **Sign out**, with the "entries haven't reached the farm records" warning. The account sheet is removed; its sign-out logic moves to a hook.
- `POST /api/me/password` (`{ current, password, confirm }`): session required; the same zod schema on the form and the server (new password at least 10 characters, the two must match, must differ from the current one); a wrong current password answers 422 "That isn't your current password."; 5 tries per person per 15 minutes (existing rate limiter); saves the hash, clears `mustChangePassword`, writes an auth event. Needs a connection.
- Changing your password does not sign out your other devices (sessions last 30 days so phones work offline).

## 2. New users get a password by email

- Settings › Users › **Add person** (owners): name, email, role. The server makes the account at once with a random password (16 characters, easy to read and type: no 0/O, 1/l/I), stores only its hash, sets `users.must_change_password = true`, and emails the password.
- **Reset password** on a person does the same for an existing account: new random password, flag set, email sent.
- Email (from `Kotila Farms <hello@kotilafarms.com>`, `MAIL_FROM` overrides it): "Kosi added you to Kotila Farms as a recorder", the email address and password, a **Sign in** button (`NEXTAUTH_URL/sign-in`), "You'll choose your own password when you first sign in", and a **Watch the how-to video** button linking to `https://kotilafarms.s3.us-east-1.amazonaws.com/kotila-farm-how-to-staff.mp4` (`HOW_TO_VIDEO_URL` overrides it). Email apps can't play video inline, so it is a link.
- If the email can't be sent (no `RESEND_API_KEY`, or Resend refuses it), the account is still made and the owner sees the password once in the sheet with Copy and WhatsApp buttons, and a notice saying the email didn't go.
- Sign-in with `mustChangePassword` set: the proxy sends every page to `/profile?first=1`, which shows only the change-password form ("Choose your own password to carry on"). APIs other than auth and `/api/me/password` answer 403 until it is changed. The flag is carried in the JWT and re-read with role every 5 minutes, and at once after a password change.
- Invite links already sent keep working until they expire; new invites are no longer made. The invite code stays for those links.

## 3. Removing a shareholder

- New column `shareholders.removed_at` (timestamptz, null). Not `deleted_at`, which hides rows from the books.
- Owners only: **Remove** (reason required) and **Restore** on the shareholder sheet, through the existing `PATCH /api/finance/shareholders/[id]` with `{ version, removed: boolean, reason }`. Audited (field `removedAt`).
- A removed shareholder's money in and out stays in every total and history. Their shares stop counting: ownership % is split among the others. New capital entries and new loans for them are refused (422). An open loan of theirs can still be marked repaid.
- The register lists them under **Removed** with their net money and the date removed.

## 4. Activity log

- Settings › **Activity** (owners only), `GET /api/activity?person=&kind=&from=&to=&before=`: newest first, 50 a page, "Show older" pages by time. Each line is one sentence: who, what, which record, old → new where there is one, the reason, and when (Lagos time). Kinds: daily logs, weights, sales and buyers, expenses, feed, health, money (capital, loans, cash counts), Sets, settings and people, sign-ins.
- Record changes come from `audit_events` (already written by every write service). Gaps filled: settling a sync clash, adding a person, resetting a password, removing or restoring a shareholder.
- New table `auth_events` (`id`, `kind` in sign_in / sign_in_failed / sign_out / password_changed, `user_id` null for an unknown email, `email`, `ip`, `at`). Written by the credentials sign-in (success and failure), NextAuth's `signOut` event, and the password change.
- A server-side labeller turns a table + field into plain words ("deaths on Set 4's log for 26 Sep"); unknown fields fall back to the field name.
- Test: each write path writes its row; the activity query returns both sources merged in time order.

## 5. 6pm reminder for missing daily logs

- Missing: a Set that is not closed, not deleted, started on or before today, with no live daily log for today (Africa/Lagos).
- `src/instrumentation.ts` starts a timer when `RESEND_API_KEY` is set (otherwise it logs "Daily reminders are off: RESEND_API_KEY is not set"). Every minute between 18:00 and 23:59 Lagos time it tries the day's run.
- Once a day: new table `reminder_runs` (`kind`, `day`, `claimed_at`, `sent_at`, `sets`, `recipients`), unique on `(kind, day)`. The run inserts its claim first (on conflict do nothing); if the insert makes no row, another copy or an earlier minute has it. If sending fails the claim is deleted and the next minute retries. If every Set has its log, the run is recorded with no email.
- Email to every active owner, subject "No daily log yet for Set 4 today" (or "for 2 Sets"), each Set with its day of age and a **Fill in today** link to `/log/<setId>/<today>`.

## Settings, packages, migration

- Env (all optional): `RESEND_API_KEY`, `MAIL_FROM`, `HOW_TO_VIDEO_URL`. Added to `env-schema.ts`, `.env.example`, `docs/13-deploy.md`.
- Package: `resend` at its `latest` stable version, recorded in `docs/11-versions.md`.
- One migration: `users.must_change_password`, `shareholders.removed_at`, `auth_events`, `reminder_runs`.
- Emails are plain HTML built in `src/server/mail/*` (one file per email), sent through one `sendMail` wrapper that never throws past its caller.
