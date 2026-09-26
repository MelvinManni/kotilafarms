// GET /api/buyers/:id — one buyer with every sale to them
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { notFound } from "@/server/errors";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { listBuyers } from "@/server/services/buyers";
import { listSales } from "@/server/services/sales/list";

export const GET = route<RouteContext<"/api/buyers/[id]">>(async (_req, ctx) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { id } = await ctx.params;
  const buyer = (await listBuyers(getDb(), farmToday())).find((b) => b.id === id);
  if (!buyer) throw notFound("That buyer");
  const { sales, bulkRate } = await listSales(getDb(), { buyerId: id }, farmToday());
  return Response.json({ buyer, sales, bulkRate });
});
