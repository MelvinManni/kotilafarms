// PATCH /api/expenses/:id — change an expense; DELETE — remove it (owners, with a reason)
import { eq } from "drizzle-orm";
import * as z from "zod/mini";
import { expenses } from "@/db/schema";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { expenseEditSchema } from "@/schemas/expense";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { expenseRows } from "@/server/services/expenses/rows";
import { editExpense, removeExpense } from "@/server/services/expenses/update";

export const PATCH = route<RouteContext<"/api/expenses/[id]">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { id } = await ctx.params;
  await editExpense(getDb(), id, expenseEditSchema.parse(await req.json()), user, farmToday());
  const [row] = await expenseRows(getDb(), [eq(expenses.id, id)]);
  return Response.json(row);
});

const removeSchema = z.object({ reason: z.string().check(z.trim(), z.minLength(3, "Say why it's being removed.")) });

export const DELETE = route<RouteContext<"/api/expenses/[id]">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), ["owner"]);
  const { id } = await ctx.params;
  await removeExpense(getDb(), id, removeSchema.parse(await req.json()).reason, user);
  return new Response(null, { status: 204 });
});
