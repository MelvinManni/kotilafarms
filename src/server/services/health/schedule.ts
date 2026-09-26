// The farm's default vaccine schedule: new Sets copy it when they start
import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { vaccineScheduleDefaults } from "@/db/schema";
import { recordChange, recordCreate } from "@/server/audit";
import type { VaccineSchedule } from "@/schemas/health";
import type { ScheduleDefault } from "@/types/health";
import type { SessionUser } from "@/types/session";

export async function listSchedule(db: Executor): Promise<ScheduleDefault[]> {
  return db
    .select({ id: vaccineScheduleDefaults.id, item: vaccineScheduleDefaults.item, doseNo: vaccineScheduleDefaults.doseNo, dueAgeDays: vaccineScheduleDefaults.dueAgeDays, method: vaccineScheduleDefaults.method })
    .from(vaccineScheduleDefaults)
    .where(isNull(vaccineScheduleDefaults.deletedAt))
    .orderBy(asc(vaccineScheduleDefaults.dueAgeDays), asc(vaccineScheduleDefaults.doseNo));
}

// Rows with an id are changed, rows without are added, rows left out are removed (soft delete)
export async function saveSchedule(db: Executor, input: VaccineSchedule, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const current = await tx.select().from(vaccineScheduleDefaults).where(isNull(vaccineScheduleDefaults.deletedAt));
    const who = { userId: actor.id };
    for (const row of current.filter((c) => !input.rows.some((r) => r.id === c.id))) {
      const after = { deletedAt: new Date() };
      await tx.update(vaccineScheduleDefaults).set(after).where(eq(vaccineScheduleDefaults.id, row.id));
      await recordChange(tx, { table: "vaccine_schedule_defaults", rowId: row.id, before: row, after, ...who });
    }
    for (const { id, ...fields } of input.rows) {
      const before = current.find((c) => c.id === id);
      if (before) {
        await tx.update(vaccineScheduleDefaults).set(fields).where(and(eq(vaccineScheduleDefaults.id, before.id), isNull(vaccineScheduleDefaults.deletedAt)));
        await recordChange(tx, { table: "vaccine_schedule_defaults", rowId: before.id, before, after: fields, ...who });
      } else {
        const [row] = await tx.insert(vaccineScheduleDefaults).values({ ...fields, clientId: randomUUID(), createdBy: actor.id }).returning();
        await recordCreate(tx, "vaccine_schedule_defaults", row!.id, who);
      }
    }
    return listSchedule(tx);
  });
}
