// Farm dates and times: "Sat 26 Sep", "26 September 2026", "6:40pm"
const FARM_TIMEZONE = "Africa/Lagos";

// A farm day (YYYY-MM-DD) has no time zone; read it at UTC noon so it never shifts
function farmDayToDate(day: string): Date {
  return new Date(`${day}T12:00:00Z`);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function farmDay(day: string): string {
  const date = farmDayToDate(day);
  return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

export function longDate(day: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(farmDayToDate(day));
}

export function clockTime(at: Date | string, timeZone = FARM_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).formatToParts(new Date(at));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("hour")}:${get("minute")}${get("dayPeriod").toLowerCase().replace(/\./g, "")}`;
}

// "20 Sep 2026" for tables; "20 Sep" when the year is obvious
export function shortDate(day: string, withYear = true): string {
  const date = farmDayToDate(day);
  const text = `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
  return withYear ? `${text} ${date.getUTCFullYear()}` : text;
}

// "Saturday, 26 September" for page headings
export function fullDay(day: string): string {
  const date = farmDayToDate(day);
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(date);
  const month = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(date);
  return `${weekday}, ${date.getUTCDate()} ${month}`;
}
