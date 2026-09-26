// Columns every record table gets: ids for sync, version for offline edits, who and when, soft delete
import { integer, uuid } from "drizzle-orm/pg-core";
import { eventTime, timestamps } from "@/db/schema/_columns";
import { users } from "@/db/schema/users";

export const commonColumns = (table: string) => ({
  id: uuid().primaryKey().defaultRandom(),
  // Made on the device when the form opens; the record's identity for sync
  clientId: uuid().notNull().unique(`${table}_client_id_unique`),
  // + 1 on every update; offline edits send the version they started from
  version: integer().notNull().default(1),
  createdBy: uuid()
    .notNull()
    .references(() => users.id),
  ...timestamps(),
  deletedAt: eventTime(),
});
