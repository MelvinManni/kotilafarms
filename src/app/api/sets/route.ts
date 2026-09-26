// GET /api/sets — every Set with headline numbers (no money for recorders); POST — start a Set
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { setCreateSchema } from "@/schemas/set";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { listSets } from "@/server/services/sets/list";
import { startSet } from "@/server/services/sets/start";

export const GET = route(async () => {
  const user = await requireSession();
  return Response.json(await listSets(getDb(), user.role, farmToday()));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), OWNER_MANAGER);
  const input = setCreateSchema.parse(await req.json());
  const { set, created } = await startSet(getDb(), input, user);
  return Response.json({ id: set.id, number: set.number }, { status: created ? 201 : 200 });
});
