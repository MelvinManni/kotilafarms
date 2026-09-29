// The activity log: record changes (audit_events) and sign-ins (auth_events), newest first, 50 a page
import "server-only";
import { and, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import type { Executor } from "@/db";
import { auditEvents, authEvents, users } from "@/db/schema";
import { ACTIVITY_KINDS } from "@/constants/activity-kinds";
import { env } from "@/lib/env";
import { recordNames } from "@/server/services/activity/context";
import type { ActivityQuery } from "@/schemas/activity";
import type { ActivityItem, ActivityPage } from "@/types/activity";
import { describeActivity } from "@/utils/activity/describe-activity";

const PAGE = 50;

// Microsecond time as text, so paging never skips rows written in the same moment
const cursorAt = (at: AnyPgColumn) => sql<string>`to_char(${at} at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

function shared(q: ActivityQuery, t: { at: AnyPgColumn; id: AnyPgColumn; userId: AnyPgColumn }): SQL[] {
  const day = sql`(${t.at} at time zone ${env().FARM_TIMEZONE})::date`;
  const where: SQL[] = [];
  if (q.person) where.push(eq(t.userId, q.person));
  if (q.from) where.push(gte(day, q.from));
  if (q.to) where.push(lte(day, q.to));
  if (q.before) {
    const [at, id] = q.before.split("|");
    where.push(sql`(${t.at}, ${t.id}) < (${at}::timestamptz, ${id}::uuid)`);
  }
  return where;
}

async function changes(db: Executor, q: ActivityQuery) {
  if (q.kind === "sign_ins") return [];
  const where = shared(q, auditEvents);
  const tables = ACTIVITY_KINDS.find((k) => k.value === q.kind)?.tables;
  if (tables) where.push(inArray(auditEvents.table, [...tables]));
  return db
    .select({ e: auditEvents, cursor: cursorAt(auditEvents.at), who: users.name, role: users.role })
    .from(auditEvents)
    .innerJoin(users, eq(users.id, auditEvents.userId))
    .where(and(...where))
    .orderBy(sql`${auditEvents.at} desc, ${auditEvents.id} desc`)
    .limit(PAGE + 1);
}

async function signIns(db: Executor, q: ActivityQuery) {
  if (q.kind && q.kind !== "sign_ins") return [];
  return db
    .select({ e: authEvents, cursor: cursorAt(authEvents.at), who: users.name, role: users.role })
    .from(authEvents)
    .leftJoin(users, eq(users.id, authEvents.userId))
    .where(and(...shared(q, authEvents)))
    .orderBy(sql`${authEvents.at} desc, ${authEvents.id} desc`)
    .limit(PAGE + 1);
}

export async function activityFeed(db: Executor, q: ActivityQuery): Promise<ActivityPage> {
  const [a, b] = [await changes(db, q), await signIns(db, q)];
  const merged = [...a.map((r) => ({ ...r, kind: "audit" as const })), ...b.map((r) => ({ ...r, kind: "auth" as const }))]
    .map((r) => ({ ...r, key: `${r.cursor}|${r.e.id}` }))
    .sort((x, y) => (x.key < y.key ? 1 : -1));
  const page = merged.slice(0, PAGE);
  const names = await recordNames(db, page.flatMap((r) => (r.kind === "audit" ? [{ table: r.e.table, rowId: r.e.rowId }] : [])));
  const items: ActivityItem[] = page.map((r) => {
    const base = { id: r.e.id, at: r.cursor, who: r.who, role: r.role };
    if (r.kind === "auth") return { ...base, text: describeActivity({ source: "auth", kind: r.e.kind, email: r.e.email, known: Boolean(r.e.userId) }), reason: null, ip: r.e.ip };
    const e = r.e;
    const text = describeActivity({ source: "audit", action: e.action, table: e.table, field: e.field, oldValue: e.oldValue, newValue: e.newValue }, names.get(`${e.table}|${e.rowId}`));
    return { ...base, text, reason: e.reason, ip: null };
  });
  return { items, nextBefore: merged.length > PAGE ? page[page.length - 1]!.key : null };
}
