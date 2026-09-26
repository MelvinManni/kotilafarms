// Weight samples: a Set's samples with stats, and saving one (once per clientId; a same-looking sample is flagged)
import "server-only";
import { and, asc, eq, isNull, ne } from "drizzle-orm";
import type { Executor } from "@/db";
import { breedCurves, sets, users, weightSamples } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { notFound, unprocessable } from "@/server/errors";
import type { WeightSampleCreate } from "@/schemas/weight";
import type { SessionUser } from "@/types/session";
import type { SetWeights } from "@/types/weight";
import { daysBetween } from "@/utils/dates/days-between";
import { weightsKey } from "@/utils/metrics/find-repeat";
import { sampleStats } from "@/utils/metrics/sample-stats";

async function setWithCurve(db: Executor, setId: string) {
  const [row] = await db.select({ set: sets, points: breedCurves.points }).from(sets).innerJoin(breedCurves, eq(breedCurves.id, sets.breedCurveId)).where(and(eq(sets.id, setId), isNull(sets.deletedAt)));
  if (!row) throw notFound("That Set");
  return { set: row.set, standard: [...row.points].sort((a, b) => a.day - b.day) };
}

export async function listWeights(db: Executor, setId: string): Promise<SetWeights> {
  const { standard } = await setWithCurve(db, setId);
  const rows = await db.select({ w: weightSamples, by: users.name }).from(weightSamples).innerJoin(users, eq(users.id, weightSamples.createdBy)).where(and(eq(weightSamples.setId, setId), isNull(weightSamples.deletedAt))).orderBy(asc(weightSamples.ageDays), asc(weightSamples.createdAt));
  let previous: { ageDays: number; averageGrams: number } | undefined;
  const samples = rows.map(({ w, by }) => {
    const stats = sampleStats(w.weightsGrams, w.ageDays, standard, previous);
    previous = { ageDays: w.ageDays, averageGrams: stats.averageGrams };
    return { id: w.id, date: w.date, ageDays: w.ageDays, ...stats, weightsGrams: w.weightsGrams, by, possibleDuplicateOf: w.possibleDuplicateOf };
  });
  return { standard, samples };
}


export async function createWeightSample(db: Executor, setId: string, input: WeightSampleCreate, actor: SessionUser, today: string, meta: { deviceId?: string | null } = {}) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(weightSamples).where(eq(weightSamples.clientId, input.clientId));
    if (existing) return { sample: existing, created: false };
    const { set } = await setWithCurve(tx, setId);
    if (input.date < set.startDate || input.date > today) throw unprocessable("Choose a day between the Set's start and today.");
    const others = await tx.select().from(weightSamples).where(and(eq(weightSamples.setId, setId), eq(weightSamples.date, input.date), isNull(weightSamples.deletedAt), ne(weightSamples.clientId, input.clientId)));
    const key = weightsKey(input.weightsGrams);
    const twin = others.find((o) => weightsKey(o.weightsGrams) === key);
    const [sample] = await tx
      .insert(weightSamples)
      .values({ clientId: input.clientId, setId, date: input.date, ageDays: daysBetween(set.startDate, input.date), weightsGrams: input.weightsGrams, createdBy: actor.id, possibleDuplicateOf: twin?.id ?? null })
      .returning();
    await recordCreate(tx, "weight_samples", sample!.id, { userId: actor.id, deviceId: meta.deviceId, enteredOfflineAt: input.enteredOfflineAt ? new Date(input.enteredOfflineAt) : null });
    return { sample: sample!, created: true };
  });
}
