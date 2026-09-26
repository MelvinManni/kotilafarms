// One row per changed field on every create, update, delete or conflict resolution
import { index, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { eventTime } from "@/db/schema/_columns";
import { auditActionEnum } from "@/db/schema/enums";
import { users } from "@/db/schema/users";

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid().primaryKey().defaultRandom(),
    table: text().notNull(),
    rowId: uuid().notNull(),
    action: auditActionEnum().notNull(),
    field: text(),
    oldValue: jsonb(),
    newValue: jsonb(),
    reason: text(),
    userId: uuid()
      .notNull()
      .references(() => users.id),
    deviceId: uuid(),
    at: eventTime().notNull().defaultNow(),
    enteredOfflineAt: eventTime(),
  },
  (t) => [index("audit_events_row").on(t.table, t.rowId)],
);
