// GET /api/sets/:id — one Set in detail; PATCH — change its stage
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { setStatusSchema } from "@/schemas/set";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { getSet } from "@/server/services/sets/detail";
import { changeSetStatus } from "@/server/services/sets/status";

export const GET = route<RouteContext<"/api/sets/[id]">>(async (_req, ctx) => {
  const user = await requireSession();
  const { id } = await ctx.params;
  return Response.json(await getSet(getDb(), id, user.role, farmToday()));
});

export const PATCH = route<RouteContext<"/api/sets/[id]">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { id } = await ctx.params;
  const input = setStatusSchema.parse(await req.json());
  await changeSetStatus(getDb(), id, input, user, farmToday());
  return Response.json(await getSet(getDb(), id, user.role, farmToday()));
});
