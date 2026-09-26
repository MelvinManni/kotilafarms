// A Set's daily logs, newest first, with who logged each and what was changed since
import "server-only";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Executor } from "@/db";
import { auditEvents, dailyLogs, feedTypes, sets, users } from "@/db/schema";
import { notFound } from "@/server/errors";
import type { DailyLogRow } from "@/types/daily-log";
import { dayOfAge } from "@/utils/metrics/mortality-trend";

export async function listLogs(db: Executor, setId: string, only?: { date: string }): Promise<DailyLogRow[]> {
  const [set] = await db.select({ startDate: sets.startDate }).from(sets).where(eq(sets.id, setId));
  if (!set) throw notFound("That Set");
  const author = alias(users, "author");
  const conditions = [eq(dailyLogs.setId, setId), isNull(dailyLogs.deletedAt)];
  if (only) conditions.push(eq(dailyLogs.date, only.date));
  const rows = await db
    .select({ log: dailyLogs, author: { id: author.id, name: author.name, role: author.role }, feedTypeName: feedTypes.brand, feedKind: feedTypes.kind })
    .from(dailyLogs)
    .innerJoin(author, eq(author.id, dailyLogs.createdBy))
    .leftJoin(feedTypes, eq(feedTypes.id, dailyLogs.feedTypeId))
    .where(and(...conditions))
    .orderBy(desc(dailyLogs.date));
  const ids = rows.map((r) => r.log.id);
  const edits = ids.length
    ? await db
        .select({ rowId: auditEvents.rowId, field: auditEvents.field, from: auditEvents.oldValue, to: auditEvents.newValue, reason: auditEvents.reason, at: auditEvents.at, by: users.name })
        .from(auditEvents)
        .innerJoin(users, eq(users.id, auditEvents.userId))
        .where(and(eq(auditEvents.table, "daily_logs"), eq(auditEvents.action, "update"), inArray(auditEvents.rowId, ids)))
        .orderBy(asc(auditEvents.at))
    : [];
  return rows.map(({ log, author: a, feedTypeName, feedKind }) => ({
    id: log.id,
    clientId: log.clientId,
    version: log.version,
    setId: log.setId,
    date: log.date,
    dayOfAge: dayOfAge(set.startDate, log.date),
    deaths: log.deaths,
    deathCause: log.deathCause,
    feedTypeId: log.feedTypeId,
    feedTypeName: feedKind ? `${feedKind[0]!.toUpperCase()}${feedKind.slice(1)} · ${feedTypeName}` : null,
    feedQty: log.feedQty,
    feedUnit: log.feedUnit,
    waterLevel: log.waterLevel,
    waterLitres: log.waterLitres,
    tempC: log.tempC,
    tags: log.tags,
    note: log.note,
    createdBy: a,
    createdAt: log.createdAt.toISOString(),
    enteredOfflineAt: log.enteredOfflineAt?.toISOString() ?? null,
    edits: edits.filter((e) => e.rowId === log.id).map((e) => ({ field: e.field ?? "", from: e.from, to: e.to, by: e.by, at: e.at.toISOString(), reason: e.reason })),
  }));
}
