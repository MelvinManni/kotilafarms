// GET /api/feed/ingredients — raw ingredient buys; POST — record one as a Feed expense on its Set (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { ingredientPurchaseCreateSchema } from "@/schemas/feed";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { createIngredientPurchase, listIngredientPurchases } from "@/server/services/feed/ingredients";

export const GET = route(async () => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await listIngredientPurchases(getDb()));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { purchase, created } = await createIngredientPurchase(getDb(), ingredientPurchaseCreateSchema.parse(await req.json()), user);
  return Response.json({ id: purchase.id }, { status: created ? 201 : 200 });
});
