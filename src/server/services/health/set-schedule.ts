// Change one Set's own vaccine schedule: move due days, add doses, drop doses not given yet — audited, farm defaults untouched
import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { sets, setVaccines } from "@/db/schema";
import { recordChange, recordCreate } from "@/server/audit";
import { conflict, notFound, unprocessable } from "@/server/errors";
import type { SetSchedule } from "@/schemas/health";
import type { SessionUser } from "@/types/session";
import { doseLabel } from "@/utils/metrics/vaccine-status";

export async function saveSetSchedule(db: Executor, setId: string, input: SetSchedule, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [set] = await tx.select().from(sets).where(and(eq(sets.id, setId), isNull(sets.deletedAt)));
    if (!set) throw notFound("That Set");
    if (set.status === "closed") throw unprocessable(`Set ${set.number} is closed. Its schedule can't change now.`);
    const current = await tx.select().from(setVaccines).where(and(eq(setVaccines.setId, setId), isNull(setVaccines.deletedAt)));
    const who = { userId: actor.id, reason: input.reason ?? null };
    const keys = input.rows.map((r) => `${r.item.toLowerCase()}|${r.doseNo}`);
    if (new Set(keys).size !== keys.length) throw unprocessable("A vaccine dose appears twice. Give each dose its own number.");

    for (const row of current.filter((c) => !input.rows.some((r) => r.id === c.id))) {
      if (row.givenOn) throw unprocessable(`${row.item} ${doseLabel(row.doseNo)} was already given. Mark it not given before removing it.`);
      const after = { deletedAt: new Date() };
      await tx.update(setVaccines).set(after).where(eq(setVaccines.id, row.id));
      await recordChange(tx, { table: "set_vaccines", rowId: row.id, before: row, after, ...who });
    }
    for (const { id, version, ...fields } of input.rows) {
      const before = current.find((c) => c.id === id);
      if (id && !before) throw unprocessable("One of those doses wasn't found. Open the schedule again.");
      if (!before) {
        const [row] = await tx.insert(setVaccines).values({ ...fields, setId, clientId: randomUUID(), createdBy: actor.id }).returning();
        await recordCreate(tx, "set_vaccines", row!.id, { userId: actor.id });
        continue;
      }
      if (version !== undefined && version !== before.version) throw conflict("Someone changed this schedule. Open it again.");
      const changed = fields.item !== before.item || fields.doseNo !== before.doseNo || fields.dueAgeDays !== before.dueAgeDays;
      if (!changed) continue;
      await tx.update(setVaccines).set({ ...fields, version: before.version + 1 }).where(eq(setVaccines.id, before.id));
      await recordChange(tx, { table: "set_vaccines", rowId: before.id, before, after: fields, ...who });
    }
  });
}
