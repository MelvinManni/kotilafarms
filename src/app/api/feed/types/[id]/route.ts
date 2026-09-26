// PATCH /api/feed/types/:id — change a feed's brand or bag size, or retire it (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { feedTypeUpdateSchema } from "@/schemas/feed";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { updateFeedType } from "@/server/services/feed-types";

export const PATCH = route<RouteContext<"/api/feed/types/[id]">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const { id } = await ctx.params;
  return Response.json(await updateFeedType(getDb(), id, feedTypeUpdateSchema.parse(await req.json()), user));
});
