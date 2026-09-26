// Apply one queued mutation with the same services the online API uses
import "server-only";
import { z } from "zod";
import type { Tx } from "@/db";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { dailyLogUpsertSchema } from "@/schemas/daily-log";
import { expenseCreateSchema } from "@/schemas/expense";
import type { SyncMutation, SyncResult } from "@/schemas/sync";
import { requireRole } from "@/server/auth";
import { unprocessable } from "@/server/errors";
import { upsertDailyLog } from "@/server/services/daily-logs/upsert";
import { createExpense } from "@/server/services/expenses/create";
import type { SessionUser } from "@/types/session";

const dailyLogPayload = z.object({ setId: z.uuid() }).passthrough();

type Applied = Omit<SyncResult, "mutationId">;

export async function applyMutation(tx: Tx, m: SyncMutation, user: SessionUser, today: string, deviceId: string): Promise<Applied> {
  const withClient = { ...(m.payload as object), clientId: m.clientId, enteredOfflineAt: m.enteredOfflineAt };
  if (m.type === "dailyLog.upsert") {
    const { setId } = dailyLogPayload.parse(m.payload);
    const input = dailyLogUpsertSchema.parse(withClient);
    const r = await upsertDailyLog(tx, setId, input, user, today, { onConflict: "record", mutationId: m.mutationId, deviceId });
    if (r.status === "conflict") return { status: "conflict", conflictId: r.conflictId, id: r.existingId };
    return { status: r.status, id: r.log.id, version: r.log.version };
  }
  if (m.type === "expense.create") {
    requireRole(user, OWNER_MANAGER);
    const { expense, created } = await createExpense(tx, expenseCreateSchema.parse(withClient), user, { deviceId });
    return { status: created ? "applied" : "duplicate", id: expense.id, version: expense.version, possibleDuplicateOf: expense.possibleDuplicateOf };
  }
  throw unprocessable("This kind of entry can't be sent yet.");
}
