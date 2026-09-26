// A Set's vaccine schedule with where each dose stands, and marking one given (audited)
import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Executor } from "@/db";
import { sets, setVaccines, users, vaccineScheduleDefaults } from "@/db/schema";
import { recordChange } from "@/server/audit";
import { notFound, unprocessable } from "@/server/errors";
import type { VaccineMark } from "@/schemas/health";
import type { SetVaccineRow } from "@/types/health";
import type { SessionUser } from "@/types/session";
import { vaccineStatus } from "@/utils/metrics/vaccine-status";

async function liveSet(db: Executor, setId: string) {
  const [set] = await db.select().from(sets).where(and(eq(sets.id, setId), isNull(sets.deletedAt)));
  if (!set) throw notFound("That Set");
  return set;
}

export async function listSetVaccines(db: Executor, setId: string, today: string): Promise<SetVaccineRow[]> {
  const set = await liveSet(db, setId);
  const giver = alias(users, "giver");
  const [rows, defaults] = await Promise.all([
    db.select({ v: setVaccines, by: giver.name }).from(setVaccines).leftJoin(giver, eq(giver.id, setVaccines.givenBy)).where(and(eq(setVaccines.setId, setId), isNull(setVaccines.deletedAt))).orderBy(asc(setVaccines.dueAgeDays), asc(setVaccines.doseNo)),
    db.select().from(vaccineScheduleDefaults).where(isNull(vaccineScheduleDefaults.deletedAt)),
  ]);
  return rows.map(({ v, by }) => {
    const s = vaccineStatus(v, set.startDate, today);
    const method = defaults.find((d) => d.item === v.item)?.method ?? "Drinking water";
    return { id: v.id, item: v.item, doseNo: v.doseNo, dueAgeDays: v.dueAgeDays, dueOn: s.dueOn, method, givenOn: v.givenOn, givenDay: s.givenDay, givenBy: by, note: v.note, state: s.state, daysLate: s.daysLate, version: v.version };
  });
}

export async function markVaccine(db: Executor, setId: string, input: VaccineMark, actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const set = await liveSet(tx, setId);
    const [before] = await tx.select().from(setVaccines).where(and(eq(setVaccines.id, input.vaccineId), eq(setVaccines.setId, setId), isNull(setVaccines.deletedAt)));
    if (!before) throw notFound("That vaccine");
    if (input.givenOn && (input.givenOn < set.startDate || input.givenOn > today)) throw unprocessable("Choose a day between the Set's start and today.");
    const after = { givenOn: input.givenOn, givenBy: input.givenOn ? actor.id : null, note: input.note ?? before.note };
    await tx.update(setVaccines).set({ ...after, version: before.version + 1 }).where(eq(setVaccines.id, before.id));
    await recordChange(tx, { table: "set_vaccines", rowId: before.id, before, after, userId: actor.id });
    return { id: before.id };
  });
}
