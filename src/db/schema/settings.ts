// Farm-wide settings as key → JSON value (borrowing cap, bulk rate, …)
import { jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "@/db/schema/_columns";
import { users } from "@/db/schema/users";

export const settings = pgTable("settings", {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedBy: uuid().references(() => users.id),
  ...timestamps(),
});
