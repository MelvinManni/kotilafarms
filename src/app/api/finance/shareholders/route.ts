// POST /api/finance/shareholders — add a shareholder to the register (owners only)
import { shareholderCreateSchema } from "@/schemas/capital";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { addShareholder } from "@/server/services/finance/capital-writes";

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), ["owner"]);
  return Response.json(await addShareholder(getDb(), shareholderCreateSchema.parse(await req.json()), user), { status: 201 });
});
