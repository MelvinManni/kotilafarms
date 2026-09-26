// GET /api/feed/prices?feedTypeId= — price per bag for one feed, oldest first (owners and managers)
import { z } from "zod";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { feedPrices } from "@/server/services/feed/stock";

const query = z.object({ feedTypeId: z.uuid({ error: "Choose the feed." }) });

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { feedTypeId } = query.parse(Object.fromEntries(new URL(req.url).searchParams));
  return Response.json(await feedPrices(getDb(), feedTypeId));
});
