// Today's farm day in a time zone (default Africa/Lagos)
export function todayInZone(timeZone = "Africa/Lagos", now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
