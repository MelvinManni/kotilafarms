// Audit trail: one audit_events row per changed field, written in the caller's transaction
import "server-only";
import type { Tx } from "@/db";
import { auditEvents } from "@/db/schema";

type Who = { userId: string; deviceId?: string | null; enteredOfflineAt?: Date | null };

// Bookkeeping columns that never go in the trail
const SKIP = new Set(["id", "clientId", "version", "createdAt", "updatedAt", "createdBy"]);

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export async function recordCreate(tx: Tx, table: string, rowId: string, who: Who) {
  await tx.insert(auditEvents).values({ table, rowId, action: "create", ...who });
}

export async function recordChange(
  tx: Tx,
  change: { table: string; rowId: string; before: Record<string, unknown>; after: Record<string, unknown>; reason?: string | null } & Who,
) {
  const { table, rowId, before, after, reason, ...who } = change;
  const rows = Object.keys(after)
    .filter((field) => !SKIP.has(field) && !same(before[field], after[field]))
    .map((field) => ({
      table,
      rowId,
      action: field === "deletedAt" ? ("delete" as const) : ("update" as const),
      field,
      oldValue: before[field] ?? null,
      newValue: after[field] ?? null,
      reason: reason ?? null,
      ...who,
    }));
  if (rows.length) await tx.insert(auditEvents).values(rows);
  return rows.length;
}

export async function recordResolve(tx: Tx, table: string, rowId: string, who: Who, reason?: string) {
  await tx.insert(auditEvents).values({ table, rowId, action: "resolve", reason: reason ?? null, ...who });
}
