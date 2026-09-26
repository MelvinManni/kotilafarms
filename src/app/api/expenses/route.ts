// GET /api/expenses?set=&categoryId=&month=&show= — filtered list with totals; POST — add an expense
import { eq } from "drizzle-orm";
import { expenses } from "@/db/schema";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { expenseCreateSchema, expenseFiltersSchema } from "@/schemas/expense";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { createExpense } from "@/server/services/expenses/create";
import { listExpenses } from "@/server/services/expenses/list";
import { expenseRows } from "@/server/services/expenses/rows";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const filters = expenseFiltersSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return Response.json(await listExpenses(getDb(), filters));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const input = expenseCreateSchema.parse(await req.json());
  const { expense, created } = await createExpense(getDb(), input, user);
  const [row] = await expenseRows(getDb(), [eq(expenses.id, expense.id)]);
  return Response.json(row, { status: created ? 201 : 200 });
});
