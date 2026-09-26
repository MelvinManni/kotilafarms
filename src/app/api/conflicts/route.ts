// GET /api/conflicts — daily logs entered twice for the same day, waiting for a manager
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { openConflicts } from "@/server/services/conflicts";

export const GET = route(async () => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await openConflicts(getDb()));
});
