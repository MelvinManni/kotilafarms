// A record's edit history for the history sheet: who, when, which field, from what to what, why
import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import type { Executor } from "@/db";
import { auditEvents, users } from "@/db/schema";

export async function auditTrail(db: Executor, table: string, rowId: string) {
  return db
    .select({
      action: auditEvents.action,
      field: auditEvents.field,
      from: auditEvents.oldValue,
      to: auditEvents.newValue,
      reason: auditEvents.reason,
      at: auditEvents.at,
      enteredOfflineAt: auditEvents.enteredOfflineAt,
      who: users.name,
      role: users.role,
    })
    .from(auditEvents)
    .innerJoin(users, eq(users.id, auditEvents.userId))
    .where(and(eq(auditEvents.table, table), eq(auditEvents.rowId, rowId)))
    // Rows written in one transaction share a time; the create always reads first
    .orderBy(asc(auditEvents.at), sql`case when ${auditEvents.action} = 'create' then 0 else 1 end`);
}

export type AuditEntry = Awaited<ReturnType<typeof auditTrail>>[number];
