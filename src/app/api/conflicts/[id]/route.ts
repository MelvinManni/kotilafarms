// POST /api/conflicts/:id — keep the logged version or the one from the phone
import { z } from "zod";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { resolveConflict } from "@/server/services/conflicts";

const body = z.object({ keep: z.enum(["existing", "incoming"]) });

export const POST = route<RouteContext<"/api/conflicts/[id]">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  await resolveConflict(getDb(), (await ctx.params).id, body.parse(await req.json()).keep, user, farmToday());
  return new Response(null, { status: 204 });
});
