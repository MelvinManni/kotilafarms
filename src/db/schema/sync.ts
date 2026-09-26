// Devices that sync, and the ledger of every mutation the server has applied (see docs/07-offline-sync.md)
import { index, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { eventTime } from "@/db/schema/_columns";
import { syncStatusEnum } from "@/db/schema/enums";
import { users } from "@/db/schema/users";

export const devices = pgTable("devices", {
  // Made once per browser, kept in IndexedDB
  id: uuid().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => users.id),
  userAgent: text(),
  lastSeenAt: eventTime().notNull().defaultNow(),
  pendingCount: integer().notNull().default(0),
  pendingSummary: jsonb().notNull().default([]),
});

export const syncMutations = pgTable(
  "sync_mutations",
  {
    // Same id on every retry of one request; the primary key stops it applying twice
    mutationId: uuid().primaryKey(),
    deviceId: uuid()
      .notNull()
      .references(() => devices.id),
    userId: uuid()
      .notNull()
      .references(() => users.id),
    type: text().notNull(),
    payloadHash: text().notNull(),
    status: syncStatusEnum().notNull(),
    entityTable: text(),
    entityId: uuid(),
    result: jsonb().notNull(),
    receivedAt: eventTime().notNull().defaultNow(),
  },
  (t) => [index("sync_mutations_received").on(t.receivedAt)],
);
