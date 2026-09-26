// Change an existing daily log: version check, who may edit, reason after the day, audit per field
import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { Executor } from "@/db";
import { dailyLogs } from "@/db/schema";
import { recordChange } from "@/server/audit";
import { conflict, notFound } from "@/server/errors";
import { assertCanEdit, assertReasonIfLate } from "@/server/services/daily-logs/rules";
import type { DailyLogEdit } from "@/schemas/daily-log";
import type { SessionUser } from "@/types/session";

export type EditMeta = { deviceId?: string | null; enteredOfflineAt?: Date | null };

export async function editDailyLog(db: Executor, id: string, input: DailyLogEdit, actor: SessionUser, today: string, meta: EditMeta = {}) {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(dailyLogs).where(and(eq(dailyLogs.id, id), isNull(dailyLogs.deletedAt)));
    if (!before) throw notFound("That log");
    if (before.version !== input.baseVersion) throw conflict("Someone changed this log since you opened it. Reload to see the latest, then try again.");
    assertCanEdit(actor, before, today);
    const { baseVersion, reason, ...changes } = input;
    assertReasonIfLate(before, changes, today, reason);
    const [after] = await tx
      .update(dailyLogs)
      .set({ ...changes, version: sql`${dailyLogs.version} + 1` })
      .where(eq(dailyLogs.id, id))
      .returning();
    await recordChange(tx, { table: "daily_logs", rowId: id, before, after: changes, reason: reason ?? null, userId: actor.id, ...meta });
    return after!;
  });
}
