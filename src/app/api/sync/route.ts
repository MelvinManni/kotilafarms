// POST /api/sync — queued entries from a phone, one result each; also the device heartbeat
import { syncRequestSchema } from "@/schemas/sync";
import { requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { processSync } from "@/server/services/sync/process";

export const POST = route(async (req) => {
  const user = await requireSession();
  const body = syncRequestSchema.parse(await req.json());
  return Response.json({ results: await processSync(getDb(), body, user, farmToday()) });
});
