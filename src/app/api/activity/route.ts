// GET /api/activity?person=&kind=&from=&to=&before= — who did what on the farm records (owners only)
import { activityQuerySchema } from "@/schemas/activity";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { activityFeed } from "@/server/services/activity/feed";

export const GET = route(async (req) => {
  requireRole(await requireSession(), ["owner"]);
  const query = activityQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return Response.json(await activityFeed(getDb(), query));
});
