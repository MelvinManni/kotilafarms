// GET /api/sales/:id — one sale with its payments; PATCH — change it
import { eq } from "drizzle-orm";
import { sales } from "@/db/schema";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { saleEditSchema } from "@/schemas/sale";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { notFound } from "@/server/errors";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { editSale } from "@/server/services/sales/edit";
import { saleRows } from "@/server/services/sales/rows";

async function one(id: string) {
  const [row] = await saleRows(getDb(), [eq(sales.id, id)], farmToday());
  if (!row) throw notFound("That sale");
  return row;
}

export const GET = route<RouteContext<"/api/sales/[id]">>(async (_req, ctx) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await one((await ctx.params).id));
});

export const PATCH = route<RouteContext<"/api/sales/[id]">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { id } = await ctx.params;
  await editSale(getDb(), id, saleEditSchema.parse(await req.json()), user, farmToday());
  return Response.json(await one(id));
});
