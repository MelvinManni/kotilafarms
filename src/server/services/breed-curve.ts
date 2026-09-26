// The farm's breed standard curve (grams by day of age), editable in Settings
import "server-only";
import { asc, eq, isNull, sql } from "drizzle-orm";
import type { Executor } from "@/db";
import { breedCurves } from "@/db/schema";
import { recordChange } from "@/server/audit";
import { notFound } from "@/server/errors";
import type { SessionUser } from "@/types/session";

export async function getBreedCurve(db: Executor) {
  const [curve] = await db.select().from(breedCurves).where(isNull(breedCurves.deletedAt)).orderBy(asc(breedCurves.createdAt)).limit(1);
  if (!curve) throw notFound("The breed standard");
  return { id: curve.id, name: curve.name, points: [...curve.points].sort((a, b) => a.day - b.day) };
}

export async function saveBreedCurve(db: Executor, points: { day: number; grams: number }[], actor: SessionUser) {
  return db.transaction(async (tx) => {
    const before = await getBreedCurve(tx);
    const sorted = [...points].sort((a, b) => a.day - b.day);
    await tx.update(breedCurves).set({ points: sorted, version: sql`${breedCurves.version} + 1` }).where(eq(breedCurves.id, before.id));
    await recordChange(tx, { table: "breed_curves", rowId: before.id, before: { points: before.points }, after: { points: sorted }, userId: actor.id });
    return { ...before, points: sorted };
  });
}
