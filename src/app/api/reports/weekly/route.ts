// GET /api/reports/weekly?week=YYYY-MM-DD — the weekly review for the week holding that day (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { weekQuerySchema } from "@/schemas/report";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { weeklyFor } from "@/server/services/reports/weekly";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { week } = weekQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const today = farmToday();
  return Response.json(await weeklyFor(getDb(), week ?? today, today));
});
