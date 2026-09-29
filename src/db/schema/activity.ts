// Sign-in events for the activity log, and the once-a-day claim for scheduled emails
import { sql } from "drizzle-orm";
import { check, index, jsonb, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { eventTime, farmDay } from "@/db/schema/_columns";
import { users } from "@/db/schema/users";

export const AUTH_EVENT_KINDS = ["sign_in", "sign_in_failed", "sign_out", "password_changed"] as const;
export type AuthEventKind = (typeof AUTH_EVENT_KINDS)[number];

export const authEvents = pgTable(
  "auth_events",
  {
    id: uuid().primaryKey().defaultRandom(),
    kind: text().$type<AuthEventKind>().notNull(),
    // Null when a sign-in was tried with an email nobody has
    userId: uuid().references(() => users.id),
    email: text().notNull(),
    ip: text(),
    at: eventTime().notNull().defaultNow(),
  },
  (t) => [
    index("auth_events_at").on(t.at),
    check("auth_events_known_kind", sql`${t.kind} in ('sign_in','sign_in_failed','sign_out','password_changed')`),
  ],
);

// One row per kind per farm day; the insert is the claim, so two servers never send twice
export const reminderRuns = pgTable(
  "reminder_runs",
  {
    id: uuid().primaryKey().defaultRandom(),
    kind: text().notNull(),
    day: farmDay().notNull(),
    claimedAt: eventTime().notNull().defaultNow(),
    sentAt: eventTime(),
    sets: jsonb().notNull().default([]),
    recipients: jsonb().notNull().default([]),
  },
  (t) => [uniqueIndex("reminder_runs_kind_day").on(t.kind, t.day)],
);
