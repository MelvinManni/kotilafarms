// GET /api/sales?setId=&buyerId= — bird and manure sales with balances; POST — record a sale
import { eq } from "drizzle-orm";
import { sales } from "@/db/schema";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { saleCreateSchema, saleFiltersSchema } from "@/schemas/sale";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { createSale } from "@/server/services/sales/create";
import { listSales } from "@/server/services/sales/list";
import { saleRows } from "@/server/services/sales/rows";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const filters = saleFiltersSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return Response.json(await listSales(getDb(), filters, farmToday()));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { sale, created } = await createSale(getDb(), saleCreateSchema.parse(await req.json()), user);
  const [row] = await saleRows(getDb(), [eq(sales.id, sale.id)], farmToday());
  return Response.json(row, { status: created ? 201 : 200 });
});
