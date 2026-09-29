// People who can sign in, and invites to join
import { sql } from "drizzle-orm";
import { boolean, pgTable, text, uniqueIndex, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";
import { eventTime, timestamps } from "@/db/schema/_columns";
import { roleEnum } from "@/db/schema/enums";

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    // Always stored lowercased
    email: text().notNull(),
    passwordHash: text().notNull(),
    role: roleEnum().notNull(),
    active: boolean().notNull().default(true),
    // Set when the password was made by the app; the person must choose their own at sign-in
    mustChangePassword: boolean().notNull().default(false),
    lastActiveAt: eventTime(),
    invitedBy: uuid().references((): AnyPgColumn => users.id),
    ...timestamps(),
  },
  (t) => [uniqueIndex("users_email_unique").on(sql`lower(${t.email})`)],
);

// An invite adds someone new, or resets the password of someone who already has an account
export const invites = pgTable("invites", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull(),
  role: roleEnum().notNull(),
  // Only a hash of the emailed token is kept
  tokenHash: text().notNull().unique("invites_token_hash_unique"),
  expiresAt: eventTime().notNull(),
  acceptedAt: eventTime(),
  createdBy: uuid()
    .notNull()
    .references(() => users.id),
  ...timestamps(),
});
