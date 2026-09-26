// GET /api/feed/types — feed types in use (everyone: the daily log needs them; ?all=1 adds retired ones); POST — add one (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { feedTypeCreateSchema } from "@/schemas/feed";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { addFeedType, listFeedTypes } from "@/server/services/feed-types";

export const GET = route(async (req) => {
  await requireSession();
  return Response.json(await listFeedTypes(getDb(), new URL(req.url).searchParams.get("all") === "1"));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await addFeedType(getDb(), feedTypeCreateSchema.parse(await req.json()), user), { status: 201 });
});
