// GET /api/sales/outstanding — every sale with money still owed, oldest first
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { outstanding } from "@/server/services/sales/list";

export const GET = route(async () => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await outstanding(getDb(), farmToday()));
});
