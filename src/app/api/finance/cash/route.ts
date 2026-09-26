// GET /api/finance/cash — money in and out since the last count, and what should be on hand (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { cashFor } from "@/server/services/finance/cash";

export const GET = route(async () => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await cashFor(getDb(), farmToday()));
});
