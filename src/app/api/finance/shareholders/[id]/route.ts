// PATCH /api/finance/shareholders/:id — fix a name or share count in the register, with a reason (owners only; audited)
import { shareholderUpdateSchema } from "@/schemas/capital";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { updateShareholder } from "@/server/services/finance/capital-writes";

export const PATCH = route<RouteContext<"/api/finance/shareholders/[id]">>(async (req, ctx) => {
  const user = requireRole(await requireSession(), ["owner"]);
  const { id } = await ctx.params;
  return Response.json(await updateShareholder(getDb(), id, shareholderUpdateSchema.parse(await req.json()), user));
});
