// GET /api/finance/loans — shareholder loans with gross / WHT / net interest; POST — record a loan (owners only)
import { loanCreateSchema } from "@/schemas/capital";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { capitalFor } from "@/server/services/finance/capital";
import { addLoan } from "@/server/services/finance/capital-writes";

export const GET = route(async () => {
  requireRole(await requireSession(), ["owner"]);
  return Response.json((await capitalFor(getDb(), farmToday())).loans);
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), ["owner"]);
  return Response.json(await addLoan(getDb(), loanCreateSchema.parse(await req.json()), user, farmToday()), { status: 201 });
});
