// POST /api/sales/:id/payments — record a payment against a sale's balance
import { eq } from "drizzle-orm";
import { sales } from "@/db/schema";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { paymentCreateSchema } from "@/schemas/sale";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { addPayment } from "@/server/services/sales/payments";
import { saleRows } from "@/server/services/sales/rows";

export const POST = route<RouteContext<"/api/sales/[id]/payments">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { id } = await ctx.params;
  const { created } = await addPayment(getDb(), id, paymentCreateSchema.parse(await req.json()), user, farmToday());
  const [row] = await saleRows(getDb(), [eq(sales.id, id)], farmToday());
  return Response.json(row, { status: created ? 201 : 200 });
});
