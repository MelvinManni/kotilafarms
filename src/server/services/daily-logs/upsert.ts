// Save a day's log: insert, update your own (by clientId + version), or meet someone else's log for that day
import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { dailyLogConflicts, dailyLogs, sets } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { conflict, notFound } from "@/server/errors";
import { editDailyLog } from "@/server/services/daily-logs/edit";
import { assertLoggableDay } from "@/server/services/daily-logs/rules";
import type { DailyLogUpsert } from "@/schemas/daily-log";
import type { SessionUser } from "@/types/session";

// "reject": answer 409 (online, the person can open the other log); "record": save a conflict for a manager (offline sync)
type Options = { onConflict: "reject" | "record"; mutationId?: string; deviceId?: string | null };

export type UpsertResult =
  | { status: "applied" | "duplicate"; log: typeof dailyLogs.$inferSelect }
  | { status: "conflict"; conflictId: string; existingId: string };

export async function upsertDailyLog(db: Executor, setId: string, input: DailyLogUpsert, actor: SessionUser, today: string, options: Options): Promise<UpsertResult> {
  return db.transaction(async (tx) => {
    const [set] = await tx.select().from(sets).where(and(eq(sets.id, setId), isNull(sets.deletedAt)));
    if (!set) throw notFound("That Set");
    assertLoggableDay(set, input.date, today);
    const { clientId, date, baseVersion, reason, enteredOfflineAt, ...fields } = input;
    const offlineAt = enteredOfflineAt ? new Date(enteredOfflineAt) : null;
    const [existing] = await tx.select().from(dailyLogs).where(and(eq(dailyLogs.setId, setId), eq(dailyLogs.date, date), isNull(dailyLogs.deletedAt)));

    if (!existing) {
      const [log] = await tx.insert(dailyLogs).values({ ...fields, clientId, setId, date, createdBy: actor.id, enteredOfflineAt: offlineAt }).returning();
      await recordCreate(tx, "daily_logs", log!.id, { userId: actor.id, deviceId: options.deviceId, enteredOfflineAt: offlineAt });
      return { status: "applied", log: log! };
    }
    if (existing.clientId === clientId) {
      // The same entry sent again with no edit: nothing new to save
      if (baseVersion === undefined) return { status: "duplicate", log: existing };
      if (baseVersion === existing.version) {
        const log = await editDailyLog(tx, existing.id, { ...fields, baseVersion, reason }, actor, today, { deviceId: options.deviceId, enteredOfflineAt: offlineAt });
        return { status: "applied", log };
      }
    }
    if (options.onConflict === "reject") throw conflict(`Set ${set.number} already has a log for ${date}. Open it to change it.`);
    const mutationId = options.mutationId ?? crypto.randomUUID();
    const [saved] = await tx
      .insert(dailyLogConflicts)
      .values({ setId, date, incoming: input, existingId: existing.id, mutationId, raisedBy: actor.id })
      .onConflictDoNothing({ target: dailyLogConflicts.mutationId })
      .returning({ id: dailyLogConflicts.id });
    const conflictId = saved?.id ?? (await tx.select({ id: dailyLogConflicts.id }).from(dailyLogConflicts).where(eq(dailyLogConflicts.mutationId, mutationId)))[0]!.id;
    return { status: "conflict", conflictId, existingId: existing.id };
  });
}
