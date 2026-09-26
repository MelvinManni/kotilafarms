// PATCH /api/sets/:id/vaccine-schedule — change this Set's own schedule (owners and managers); answers with the new schedule
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { setScheduleSchema } from "@/schemas/health";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { saveSetSchedule } from "@/server/services/health/set-schedule";
import { listSetVaccines } from "@/server/services/health/vaccines";

export const PATCH = route<RouteContext<"/api/sets/[id]/vaccine-schedule">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { id } = await ctx.params;
  await saveSetSchedule(getDb(), id, setScheduleSchema.parse(await req.json()), user);
  return Response.json(await listSetVaccines(getDb(), id, farmToday()));
});
