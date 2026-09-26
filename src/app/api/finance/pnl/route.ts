// GET /api/finance/pnl?setIds=a,b — profit and loss for one or more Sets (owners and managers)
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { pnlQuerySchema } from "@/schemas/finance";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { pnlFor } from "@/server/services/finance/pnl";

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { setIds } = pnlQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return Response.json(await pnlFor(getDb(), setIds));
});
