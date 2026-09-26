// PATCH /api/logs/:id — change a daily log (a reason is needed after the day; recorders: own log, same day)
import { dailyLogEditSchema } from "@/schemas/daily-log";
import { requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { farmToday } from "@/server/farm-today";
import { route } from "@/server/http";
import { editDailyLog } from "@/server/services/daily-logs/edit";
import { listLogs } from "@/server/services/daily-logs/list";

export const PATCH = route<RouteContext<"/api/logs/[id]">>(async (req, ctx) => {
  const user = await requireSession();
  const { id } = await ctx.params;
  const input = dailyLogEditSchema.parse(await req.json());
  const log = await editDailyLog(getDb(), id, input, user, farmToday());
  const [row] = await listLogs(getDb(), log.setId, { date: log.date });
  return Response.json(row);
});
