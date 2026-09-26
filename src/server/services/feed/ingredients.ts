// Raw ingredient buys (maize, soya, red oil…) for mixing on site: each is a Feed expense on its Set
import "server-only";
import { desc, eq, isNull } from "drizzle-orm";
import type { Executor } from "@/db";
import { ingredientPurchases, sets, users } from "@/db/schema";
import { recordCreate } from "@/server/audit";
import { createExpense } from "@/server/services/expenses/create";
import { categoryIdByKey } from "@/server/services/expenses/category-by-key";
import type { IngredientPurchaseCreate } from "@/schemas/feed";
import type { IngredientRow } from "@/types/feed";
import type { SessionUser } from "@/types/session";

export async function createIngredientPurchase(db: Executor, input: IngredientPurchaseCreate, actor: SessionUser) {
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(ingredientPurchases).where(eq(ingredientPurchases.clientId, input.clientId));
    if (existing) return { purchase: existing, created: false };
    const description = `${input.ingredient}, ${input.quantity} ${input.unit}${input.supplier ? ` · ${input.supplier}` : ""}`;
    const { expense } = await createExpense(tx, { clientId: crypto.randomUUID(), date: input.date, categoryId: await categoryIdByKey(tx, "feed"), description, amount: input.total, setId: input.setId, overhead: false, capitalItem: false }, actor);
    const { supplier: _s, ...fields } = input;
    const [purchase] = await tx.insert(ingredientPurchases).values({ ...fields, expenseId: expense.id, createdBy: actor.id }).returning();
    await recordCreate(tx, "ingredient_purchases", purchase!.id, { userId: actor.id });
    return { purchase: purchase!, created: true };
  });
}

export async function listIngredientPurchases(db: Executor): Promise<IngredientRow[]> {
  const rows = await db
    .select({ p: ingredientPurchases, setNumber: sets.number, by: users.name })
    .from(ingredientPurchases)
    .innerJoin(sets, eq(sets.id, ingredientPurchases.setId))
    .innerJoin(users, eq(users.id, ingredientPurchases.createdBy))
    .where(isNull(ingredientPurchases.deletedAt))
    .orderBy(desc(ingredientPurchases.date), desc(ingredientPurchases.createdAt));
  return rows.map(({ p, setNumber, by }) => ({ id: p.id, date: p.date, ingredient: p.ingredient, quantity: p.quantity, unit: p.unit, unitCost: p.unitCost, total: p.total, set: { id: p.setId, number: setNumber }, by }));
}
