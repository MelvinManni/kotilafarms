// Names for the records in a page of activity: "Set 4's log for 26 Sep", "Nonso", "Chinedu's account"
import "server-only";
import { eq, inArray } from "drizzle-orm";
import type { Executor } from "@/db";
import { buyers, dailyLogs, expenses, loans, sales, sets, shareholders, users, weightSamples } from "@/db/schema";
import { naira } from "@/utils/format/naira";
import { shortDate } from "@/utils/format/dates";

type Lookup = (db: Executor, ids: string[]) => Promise<[string, string][]>;

const LOOKUPS: Record<string, Lookup> = {
  sets: async (db, ids) => (await db.select({ id: sets.id, n: sets.number }).from(sets).where(inArray(sets.id, ids))).map((r) => [r.id, `Set ${r.n}`]),
  daily_logs: async (db, ids) =>
    (await db.select({ id: dailyLogs.id, n: sets.number, day: dailyLogs.date }).from(dailyLogs).innerJoin(sets, eq(sets.id, dailyLogs.setId)).where(inArray(dailyLogs.id, ids))).map((r) => [
      r.id,
      `Set ${r.n}'s log for ${shortDate(r.day, false)}`,
    ]),
  weight_samples: async (db, ids) =>
    (await db.select({ id: weightSamples.id, n: sets.number, day: weightSamples.date }).from(weightSamples).innerJoin(sets, eq(sets.id, weightSamples.setId)).where(inArray(weightSamples.id, ids))).map((r) => [
      r.id,
      `Set ${r.n}'s weights for ${shortDate(r.day, false)}`,
    ]),
  sales: async (db, ids) =>
    (await db.select({ id: sales.id, birds: sales.birds, buyer: buyers.name }).from(sales).innerJoin(buyers, eq(buyers.id, sales.buyerId)).where(inArray(sales.id, ids))).map((r) => [
      r.id,
      `a sale of ${r.birds} birds to ${r.buyer}`,
    ]),
  expenses: async (db, ids) =>
    (await db.select({ id: expenses.id, what: expenses.description, amount: expenses.amount }).from(expenses).where(inArray(expenses.id, ids))).map((r) => [r.id, `the expense "${r.what}" (${naira(r.amount)})`]),
  shareholders: async (db, ids) => (await db.select({ id: shareholders.id, name: shareholders.name }).from(shareholders).where(inArray(shareholders.id, ids))).map((r) => [r.id, r.name]),
  users: async (db, ids) => (await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, ids))).map((r) => [r.id, `${r.name}'s account`]),
  buyers: async (db, ids) => (await db.select({ id: buyers.id, name: buyers.name }).from(buyers).where(inArray(buyers.id, ids))).map((r) => [r.id, `the buyer ${r.name}`]),
  loans: async (db, ids) =>
    (await db.select({ id: loans.id, name: shareholders.name, amount: loans.amount }).from(loans).innerJoin(shareholders, eq(shareholders.id, loans.lenderShareholderId)).where(inArray(loans.id, ids))).map((r) => [
      r.id,
      `${r.name}'s loan of ${naira(r.amount)}`,
    ]),
};

// "table|rowId" → name, for the tables we know how to name
export async function recordNames(db: Executor, rows: { table: string; rowId: string }[]): Promise<Map<string, string>> {
  const byTable = new Map<string, Set<string>>();
  for (const r of rows) if (LOOKUPS[r.table]) byTable.set(r.table, (byTable.get(r.table) ?? new Set()).add(r.rowId));
  const names = new Map<string, string>();
  for (const [table, ids] of byTable) for (const [id, name] of await LOOKUPS[table]!(db, [...ids])) names.set(`${table}|${id}`, name);
  return names;
}
