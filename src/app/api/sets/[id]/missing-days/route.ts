// GET /api/sets/:id/missing-days — days with no log yet (day 1 to yesterday)
import { requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { missingLogDays } from "@/server/services/daily-logs/missing";

export const GET = route<RouteContext<"/api/sets/[id]/missing-days">>(async (_req, ctx) => {
  await requireSession();
  const { id } = await ctx.params;
  return Response.json(await missingLogDays(getDb(), id, farmToday()));
});
