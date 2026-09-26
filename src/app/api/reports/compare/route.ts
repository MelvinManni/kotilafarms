// GET /api/reports/compare?setIds=a,b[,c…] — Sets side by side (owners and managers; two or more)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { compareQuerySchema } from "@/schemas/finance";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { compareFor } from "@/server/services/reports/compare";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { setIds } = compareQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return Response.json(await compareFor(getDb(), setIds, farmToday()));
});
