// PATCH /api/finance/loans/:id — mark a loan repaid on a day (owners only; audited)
import { loanRepaySchema } from "@/schemas/capital";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { repayLoan } from "@/server/services/finance/capital-writes";

export const PATCH = route<RouteContext<"/api/finance/loans/[id]">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), ["owner"]);
  const { id } = await ctx.params;
  return Response.json(await repayLoan(getDb(), id, loanRepaySchema.parse(await req.json()), user, farmToday()));
});
