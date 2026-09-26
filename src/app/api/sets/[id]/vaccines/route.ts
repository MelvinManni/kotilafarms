// GET /api/sets/:id/vaccines — the Set's schedule and where each dose stands; PATCH — mark one given or not (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { vaccineMarkSchema } from "@/schemas/health";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { listSetVaccines, markVaccine } from "@/server/services/health/vaccines";

export const GET = route<RouteContext<"/api/sets/[id]/vaccines">>(async (_req, ctx) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await listSetVaccines(getDb(), (await ctx.params).id, farmToday()));
});

export const PATCH = route<RouteContext<"/api/sets/[id]/vaccines">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { id } = await ctx.params;
  await markVaccine(getDb(), id, vaccineMarkSchema.parse(await req.json()), user, farmToday());
  return Response.json(await listSetVaccines(getDb(), id, farmToday()));
});
