// PATCH /api/expense-categories/:id — rename a category or change whether it can be a capital item
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { categoryUpdateSchema } from "@/schemas/expense";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { updateCategory } from "@/server/services/expenses/categories";

export const PATCH = route<RouteContext<"/api/expense-categories/[id]">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { id } = await ctx.params;
  return Response.json(await updateCategory(getDb(), id, categoryUpdateSchema.parse(await req.json()), user));
});
