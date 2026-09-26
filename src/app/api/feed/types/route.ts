// GET /api/feed/types — feed types in use (everyone: the daily log needs them)
import { requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { listFeedTypes } from "@/server/services/feed-types";

export const GET = route(async () => {
  await requireSession();
  return Response.json(await listFeedTypes(getDb()));
});
