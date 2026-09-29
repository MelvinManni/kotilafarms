"use client";
// A Set's days as a ledger: logged days, missed days, and today; a row opens that day
import { useRouter } from "next/navigation";
import { LedgerTable } from "@/components/kotila/ledger-table";
import { tagLabel } from "@/constants/observation-tags";
import type { PendingLog } from "@/lib/offline/pending-logs";
import type { DailyLogRow } from "@/types/daily-log";
import { addDays } from "@/utils/dates/add-days";
import { clockTime, farmDay } from "@/utils/format/dates";
import { auditValue } from "@/utils/format/audit-value";

const muted = { value: "—", tone: "muted" as const };
const columns = [
  { key: "date", label: "Date", width: 170 },
  { key: "deaths", label: "Deaths", align: "right" as const, width: 110 },
  { key: "feed", label: "Feed used", align: "right" as const, width: 150 },
  { key: "water", label: "Water", align: "right" as const, width: 100 },
  { key: "seen", label: "Seen in the pen" },
  { key: "by", label: "Logged by", width: 220 },
];

const edited = (log: DailyLogRow, field: string) => {
  const first = log.edits.find((e) => e.field === field);
  return first ? `edited, was ${auditValue(field, first.from)}` : undefined;
};

function logRow(log: DailyLogRow, today: string) {
  return {
    id: log.date,
    state: "Logged",
    date: { value: farmDay(log.date), sub: `day ${log.dayOfAge}${log.date === today ? " · today" : ""}` },
    deaths: { value: String(log.deaths), figure: true, sub: edited(log, "deaths") },
    feed: log.feedQty === null ? muted : { value: `${log.feedQty} ${log.feedUnit}`, sub: edited(log, "feedQty") ?? log.feedTypeName ?? undefined },
    water: log.waterLevel ? log.waterLevel[0]!.toUpperCase() + log.waterLevel.slice(1) : muted,
    seen: log.tags.length || log.note ? [log.tags.map(tagLabel).join(", "), log.note].filter(Boolean).join(" · ") : "All normal",
    by: { value: log.createdBy.name.split(" ")[0], sub: `${farmDay(log.createdAt.slice(0, 10))} ${clockTime(log.createdAt)}${log.edits.length ? ` · edited by ${log.edits.at(-1)!.by.split(" ")[0]}` : ""}` },
  };
}

// Logged here but not sent yet
function phoneRow(date: string, pending: PendingLog, startDate: string, today: string) {
  const p = pending.payload;
  const day = Math.round((Date.parse(date) - Date.parse(startDate)) / 86_400_000);
  return {
    id: date,
    state: "On this phone",
    date: { value: farmDay(date), sub: `day ${day}${date === today ? " · today" : ""}` },
    deaths: { value: String(p.deaths), figure: true },
    feed: p.feedQty ? `${String(p.feedQty)} ${String(p.feedUnit ?? "bags")}` : muted,
    water: p.waterLevel ? String(p.waterLevel) : muted,
    seen: Array.isArray(p.tags) && p.tags.length ? (p.tags as string[]).map(tagLabel).join(", ") : muted,
    by: { tag: { tone: "warning" as const, label: "On this phone" }, sub: "sends when there's signal" },
  };
}

function emptyRow(date: string, startDate: string, today: string) {
  const day = Math.round((Date.parse(date) - Date.parse(startDate)) / 86_400_000);
  const isToday = date === today;
  return {
    id: date,
    state: isToday ? "Not logged yet" : "Missed",
    date: { value: farmDay(date), sub: `day ${day}${isToday ? " · today" : ""}` },
    deaths: muted, feed: muted, water: muted, seen: muted,
    by: isToday ? { value: "Not logged yet", tone: "muted" as const } : { tag: { tone: "warning" as const, label: "Missed" }, sub: "select to fill it in" },
  };
}

type LogTableProps = { setId: string; startDate: string; endDate: string; today: string; logs: DailyLogRow[]; pending?: Map<string, PendingLog>; days?: number };

export function LogTable({ setId, startDate, endDate, today, logs, pending, days = 14 }: LogTableProps) {
  const router = useRouter();
  const byDate = new Map(logs.map((l) => [l.date, l]));
  const rows = [];
  for (let d = endDate, i = 0; d >= startDate && i < days; d = addDays(d, -1), i++) {
    const log = byDate.get(d);
    const onPhone = pending?.get(d);
    rows.push(onPhone ? phoneRow(d, onPhone, startDate, today) : log ? logRow(log, today) : emptyRow(d, startDate, today));
  }
  return <LedgerTable dense caption="Daily logs, newest first" columns={columns} rows={rows} filters={[{ key: "state", label: "Day" }, { key: "water", label: "Water" }]} onRowClick={(r) => router.push(`/log/${setId}/${r.id}`)} />;
}
