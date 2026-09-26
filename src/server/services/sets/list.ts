// Every Set, newest first, with headline numbers
import "server-only";
import { desc, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { sets } from "@/db/schema";
import { deathsByDay, setTotals } from "@/server/services/sets/aggregates";
import { summarizeSet } from "@/server/services/sets/summarize";
import type { Role } from "@/types/role";
import type { SetSummary } from "@/types/sets";

export async function listSets(db: Executor, role: Role, today: string): Promise<SetSummary[]> {
  const rows = await db.select().from(sets).where(isNull(sets.deletedAt)).orderBy(desc(sets.number));
  const ids = rows.map((r) => r.id);
  const [totals, logs] = await Promise.all([setTotals(db, ids), deathsByDay(db, ids)]);
  return rows.map((row) => summarizeSet(row, totals.get(row.id)!, logs.filter((l) => l.setId === row.id), today, role));
}
