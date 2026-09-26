// POST /api/other-sales — manure and droppings sold from a Set
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { otherSaleCreateSchema } from "@/schemas/sale";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { addOtherSale } from "@/server/services/sales/other";

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { row, created } = await addOtherSale(getDb(), otherSaleCreateSchema.parse(await req.json()), user);
  return Response.json(row, { status: created ? 201 : 200 });
});
