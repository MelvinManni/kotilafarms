// GET /api/users — owners see everyone with access
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { listUsers } from "@/server/services/users";

export const GET = route(async () => {
  requireRole(await requireSession(), ["owner"]);
  return Response.json(await listUsers(getDb()));
});
