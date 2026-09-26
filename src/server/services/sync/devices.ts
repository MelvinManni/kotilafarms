// Device heartbeat: who uses the device, when it was last seen, what is still waiting on it
import "server-only";
import type { Executor } from "@/db";
import { devices } from "@/db/schema";
import type { SyncRequest } from "@/schemas/sync";

export async function recordHeartbeat(db: Executor, req: Pick<SyncRequest, "deviceId" | "userAgent" | "pending">, userId: string) {
  const values = { userId, userAgent: req.userAgent ?? null, lastSeenAt: new Date(), pendingCount: req.pending.count, pendingSummary: req.pending.summary };
  await db.insert(devices).values({ id: req.deviceId, ...values }).onConflictDoUpdate({ target: devices.id, set: values });
}
