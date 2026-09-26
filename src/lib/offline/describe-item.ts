// A short, plain name for an outbox entry: "Set 4 log · Fri 25 Sep", "Expense · ₦12,000 · Diesel"
import type { OutboxItem } from "@/lib/offline/outbox-types";
import { farmDay } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

export function describeItem(item: OutboxItem, setNumber: (setId: string) => number | undefined): string {
  const p = item.payload;
  const set = typeof p.setId === "string" ? setNumber(p.setId) : undefined;
  if (item.type === "dailyLog.upsert") return `${set ? `Set ${set}` : "Daily"} log · ${farmDay(String(p.date))}`;
  if (item.type === "weightSample.create") return `${set ? `Set ${set}` : ""} weights · ${Array.isArray(p.weightsGrams) ? p.weightsGrams.length : 0} birds · ${farmDay(String(p.date))}`;
  return `Expense · ${naira(Number(p.amount))} · ${String(p.description ?? "")}`;
}
