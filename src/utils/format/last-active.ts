// When someone was last active: "Today, 8:12am", "Yesterday", "Thu 24 Sep", or "Never"
import { clockTime, farmDay } from "@/utils/format/dates";
import { addDays } from "@/utils/dates/add-days";
import { todayInZone } from "@/utils/dates/today-in-zone";

export function lastActive(at: Date | string | null, now = new Date(), timeZone = "Africa/Lagos"): string {
  if (!at) return "Never";
  const when = new Date(at);
  const day = todayInZone(timeZone, when);
  const today = todayInZone(timeZone, now);
  if (day === today) return `Today, ${clockTime(when, timeZone)}`;
  if (day === addDays(today, -1)) return "Yesterday";
  return farmDay(day);
}
