// GET /api/settings/vaccine-schedule — the default schedule; PATCH — replace it (owners and managers; new Sets only)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { vaccineScheduleSchema } from "@/schemas/health";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { listSchedule, saveSchedule } from "@/server/services/health/schedule";

export const GET = route(async () => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await listSchedule(getDb()));
});

export const PATCH = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await saveSchedule(getDb(), vaccineScheduleSchema.parse(await req.json()), user));
});
