// GET /api/reports/set?setIds=a,b — the Set report for one or more Sets (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { pnlQuerySchema } from "@/schemas/finance";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { setReportFor } from "@/server/services/reports/set-report";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { setIds } = pnlQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return Response.json(await setReportFor(getDb(), setIds, farmToday()));
});
