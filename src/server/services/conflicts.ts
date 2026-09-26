// Open daily-log conflicts, and settling one by keeping the logged version or the one from the phone
import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Executor } from "@/db";
import { dailyLogConflicts, dailyLogs, sets, users } from "@/db/schema";
import { recordResolve } from "@/server/audit";
import { conflict as conflictError, notFound } from "@/server/errors";
import { editDailyLog } from "@/server/services/daily-logs/edit";
import * as z from "zod/mini";
import { dailyLogFieldsSchema } from "@/schemas/daily-log";
import type { LogConflict } from "@/types/conflict";
import type { SessionUser } from "@/types/session";

// The entry that couldn't be applied, as the phone sent it (checked when it arrived)
const incomingSchema = z.extend(z.partial(dailyLogFieldsSchema), { deaths: dailyLogFieldsSchema.shape.deaths });

export async function openConflicts(db: Executor): Promise<LogConflict[]> {
  const author = alias(users, "author");
  const raiser = alias(users, "raiser");
  const rows = await db
    .select({ c: dailyLogConflicts, setNumber: sets.number, log: dailyLogs, author: author.name, raiser: raiser.name })
    .from(dailyLogConflicts)
    .innerJoin(sets, eq(sets.id, dailyLogConflicts.setId))
    .innerJoin(dailyLogs, eq(dailyLogs.id, dailyLogConflicts.existingId))
    .innerJoin(author, eq(author.id, dailyLogs.createdBy))
    .innerJoin(raiser, eq(raiser.id, dailyLogConflicts.raisedBy))
    .where(isNull(dailyLogConflicts.resolvedAt))
    .orderBy(asc(dailyLogConflicts.createdAt));
  return rows.map(({ c, setNumber, log, author: a, raiser: r }) => {
    const inc = incomingSchema.parse(c.incoming);
    return {
      id: c.id,
      setId: c.setId,
      setNumber,
      date: c.date,
      existing: { id: log.id, version: log.version, deaths: log.deaths, feedQty: log.feedQty, feedUnit: log.feedUnit, waterLevel: log.waterLevel, tags: log.tags, note: log.note, by: a },
      incoming: { deaths: inc.deaths, feedQty: inc.feedQty ?? null, feedUnit: inc.feedUnit ?? "bags", waterLevel: inc.waterLevel ?? null, tags: inc.tags ?? [], note: inc.note ?? null, by: r },
      raisedAt: c.createdAt.toISOString(),
    };
  });
}

export async function resolveConflict(db: Executor, id: string, keep: "existing" | "incoming", actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const [c] = await tx.select().from(dailyLogConflicts).where(and(eq(dailyLogConflicts.id, id), isNull(dailyLogConflicts.resolvedAt)));
    if (!c) throw notFound("That conflict");
    const [log] = await tx.select().from(dailyLogs).where(eq(dailyLogs.id, c.existingId));
    if (!log) throw conflictError("The logged version is gone. Reload.");
    const [raiser] = await tx.select({ name: users.name }).from(users).where(eq(users.id, c.raisedBy));
    if (keep === "incoming") {
      const inc = incomingSchema.parse(c.incoming);
      const fields = { deaths: inc.deaths, deathCause: inc.deathCause ?? null, feedQty: inc.feedQty ?? null, feedUnit: inc.feedUnit ?? "bags", feedTypeId: inc.feedTypeId ?? null, waterLevel: inc.waterLevel ?? null, waterLitres: inc.waterLitres ?? null, tempC: inc.tempC ?? null, tags: inc.tags ?? [], note: inc.note ?? null };
      // Managers settle conflicts, so the recorder same-day rule doesn't apply here
      await editDailyLog(tx, log.id, { ...fields, baseVersion: log.version, reason: `Kept the version from ${raiser?.name ?? "the other phone"}` }, { ...actor, role: actor.role === "recorder" ? "manager" : actor.role }, today);
    }
    await tx.update(dailyLogConflicts).set({ resolvedAt: new Date(), resolvedBy: actor.id, resolution: keep === "incoming" ? "kept_incoming" : "kept_existing" }).where(eq(dailyLogConflicts.id, id));
    await recordResolve(tx, "daily_logs", log.id, { userId: actor.id }, keep === "incoming" ? `Kept ${raiser?.name ?? "the other"}'s version` : "Kept the version already logged");
  });
}
