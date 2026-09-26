// GET /api/feed/stock — bags in the store per feed, daily use, days left (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { feedStockFor } from "@/server/services/feed/stock";

export const GET = route(async () => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await feedStockFor(getDb(), farmToday()));
});
