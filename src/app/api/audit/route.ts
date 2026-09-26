// GET /api/audit?table=&rowId= — a record's edit history (owners and managers)
import * as z from "zod/mini";
import { OWNER_MANAGER } from "@/lib/auth/roles";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { route } from "@/server/http";
import { auditTrail } from "@/server/services/audit-trail";

const query = z.object({ table: z.string().check(z.regex(/^[a-z_]+$/)), rowId: z.uuid() });

export const GET = route(async (req) => {
  requireRole(await requireSession(), OWNER_MANAGER);
  const { table, rowId } = query.parse(Object.fromEntries(new URL(req.url).searchParams));
  return Response.json(await auditTrail(getDb(), table, rowId));
});
