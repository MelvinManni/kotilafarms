// GET /api/buyers — buyers with birds bought, spend, balance and average price; POST — add a buyer
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { buyerCreateSchema } from "@/schemas/sale";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { createBuyer, listBuyers } from "@/server/services/buyers";

export const GET = route(async () => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await listBuyers(getDb(), farmToday()));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await createBuyer(getDb(), buyerCreateSchema.parse(await req.json()), user), { status: 201 });
});
