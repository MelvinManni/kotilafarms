// Move a Set to another stage; closing records the date (audited)
import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { Executor } from "@/db";
import { sets } from "@/db/schema";
import { recordChange } from "@/server/audit";
import { notFound, unprocessable } from "@/server/errors";
import type { SetStatusInput } from "@/schemas/set";
import type { SessionUser } from "@/types/session";

export async function changeSetStatus(db: Executor, id: string, input: SetStatusInput, actor: SessionUser, today: string) {
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(sets).where(and(eq(sets.id, id), isNull(sets.deletedAt)));
    if (!before) throw notFound("That Set");
    const closedOn = input.status === "closed" ? (input.closedOn ?? today) : null;
    if (closedOn && closedOn < before.startDate) throw unprocessable("A Set can't close before it started.");
    const after = { status: input.status, closedOn };
    await tx.update(sets).set({ ...after, version: sql`${sets.version} + 1` }).where(eq(sets.id, id));
    await recordChange(tx, { table: "sets", rowId: id, before: { status: before.status, closedOn: before.closedOn }, after, userId: actor.id });
  });
}
