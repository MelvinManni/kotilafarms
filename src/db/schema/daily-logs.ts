// One daily log per Set per day, and the conflicts when two devices log the same day
import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, numeric, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { commonColumns } from "@/db/schema/_common";
import { eventTime, farmDay } from "@/db/schema/_columns";
import { conflictResolutionEnum, deathCauseEnum, feedUnitEnum, waterLevelEnum } from "@/db/schema/enums";
import { feedTypes } from "@/db/schema/feed";
import { sets } from "@/db/schema/sets";
import { users } from "@/db/schema/users";

export const dailyLogs = pgTable(
  "daily_logs",
  {
    ...commonColumns("daily_logs"),
    setId: uuid()
      .notNull()
      .references(() => sets.id),
    date: farmDay().notNull(),
    deaths: integer().notNull(),
    deathCause: deathCauseEnum(),
    feedTypeId: uuid().references(() => feedTypes.id),
    feedQty: numeric({ precision: 10, scale: 2, mode: "number" }),
    feedUnit: feedUnitEnum().notNull().default("bags"),
    waterLevel: waterLevelEnum(),
    waterLitres: integer(),
    tempC: numeric({ precision: 4, scale: 1, mode: "number" }),
    tags: text().array().notNull().default(sql`'{}'::text[]`),
    note: text(),
    enteredOfflineAt: eventTime(),
  },
  (t) => [
    uniqueIndex("daily_logs_set_date_live").on(t.setId, t.date).where(sql`${t.deletedAt} is null`),
    check("daily_logs_deaths_not_negative", sql`${t.deaths} >= 0`),
    check("daily_logs_feed_not_negative", sql`${t.feedQty} is null or ${t.feedQty} >= 0`),
    check(
      "daily_logs_known_tags",
      sql`${t.tags} <@ array['coughing','green_stool','lethargy','panting','wet_litter','poor_appetite']::text[]`,
    ),
  ],
);

export const dailyLogConflicts = pgTable(
  "daily_log_conflicts",
  {
    id: uuid().primaryKey().defaultRandom(),
    setId: uuid()
      .notNull()
      .references(() => sets.id),
    date: farmDay().notNull(),
    // The entry that could not be applied, as sent
    incoming: jsonb().notNull(),
    existingId: uuid()
      .notNull()
      .references(() => dailyLogs.id),
    // One conflict per sync request, so a replay never raises a second one
    mutationId: uuid().notNull().unique("daily_log_conflicts_mutation_id_unique"),
    raisedBy: uuid()
      .notNull()
      .references(() => users.id),
    resolvedBy: uuid().references(() => users.id),
    resolvedAt: eventTime(),
    resolution: conflictResolutionEnum(),
    createdAt: eventTime().notNull().defaultNow(),
  },
  (t) => [index("daily_log_conflicts_open").on(t.setId).where(sql`${t.resolvedAt} is null`)],
);
