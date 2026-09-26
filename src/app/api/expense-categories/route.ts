// GET /api/expense-categories — the categories; POST — add one (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { categoryCreateSchema } from "@/schemas/expense";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { addCategory, listCategories } from "@/server/services/expenses/categories";

export const GET = route(async () => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await listCategories(getDb()));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await addCategory(getDb(), categoryCreateSchema.parse(await req.json()), user), { status: 201 });
});
