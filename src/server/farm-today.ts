// Today's farm day in the farm's time zone
import "server-only";
import { env } from "@/lib/env";
import { todayInZone } from "@/utils/dates/today-in-zone";

export function farmToday(): string {
  return todayInZone(env().FARM_TIMEZONE);
}
