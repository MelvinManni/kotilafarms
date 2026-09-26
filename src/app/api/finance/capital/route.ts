// GET /api/finance/capital — ownership, money in and out per shareholder, loans, borrowing capacity; POST — record capital in or out (owners only)
import { capitalEntryCreateSchema } from "@/schemas/capital";
import { requireRole, requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { capitalFor } from "@/server/services/finance/capital";
import { addCapitalEntry } from "@/server/services/finance/capital-writes";

export const GET = route(async () => {
  requireRole(await requireSession(), ["owner"]);
  return Response.json(await capitalFor(getDb(), farmToday()));
});

export const POST = route(async (req) => {
  const user = requireRole(await requireSession(), ["owner"]);
  return Response.json(await addCapitalEntry(getDb(), capitalEntryCreateSchema.parse(await req.json()), user, farmToday()), { status: 201 });
});
