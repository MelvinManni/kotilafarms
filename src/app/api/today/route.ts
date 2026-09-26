// GET /api/today — the Today screen for whoever is signed in
import { requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { todayFor } from "@/server/services/today";

export const GET = route(async () => {
  const user = await requireSession();
  return Response.json(await todayFor(getDb(), user.role, farmToday()));
});
