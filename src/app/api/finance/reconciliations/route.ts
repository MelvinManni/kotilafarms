// GET /api/finance/reconciliations — past cash counts; POST — record a count (owners only; never queued offline)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { reconciliationSchema } from "@/schemas/finance";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { listReconciliations, reconcile } from "@/server/services/finance/cash";

export const GET = route(async () => {
  requireRole(await requireSession(), OWNER_MANAGER);
  return Response.json(await listReconciliations(getDb()));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), ["owner"]);
  return Response.json(await reconcile(getDb(), reconciliationSchema.parse(await req.json()), user, farmToday()), { status: 201 });
});
