// GET /api/sets/:id/logs[?date=] — the Set's daily logs; POST — save a day's log (upsert by Set and day)
import { dailyLogUpsertSchema } from "@/schemas/daily-log";
import { farmDateSchema } from "@/schemas/set";
import { requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { listLogs } from "@/server/services/daily-logs/list";
import { upsertDailyLog } from "@/server/services/daily-logs/upsert";

export const GET = route<RouteContext<"/api/sets/[id]/logs">>(async (req, ctx) => {
  await requireSession();
  const { id } = await ctx.params;
  const date = new URL(req.url).searchParams.get("date");
  return Response.json(await listLogs(getDb(), id, date ? { date: farmDateSchema.parse(date) } : undefined));
});

export const POST = route<RouteContext<"/api/sets/[id]/logs">>(async (req, ctx) => {
  const user = await requireSession();
  const { id } = await ctx.params;
  const input = dailyLogUpsertSchema.parse(await req.json());
  const result = await upsertDailyLog(getDb(), id, input, user, farmToday(), { onConflict: "reject" });
  const [log] = await listLogs(getDb(), id, { date: input.date });
  const created = result.status === "applied" && result.log.version === 1;
  return Response.json(log, { status: created ? 201 : 200 });
});
