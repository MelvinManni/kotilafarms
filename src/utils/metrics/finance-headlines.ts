// What the Finance page leads with: cash on hand since when, and what a Set (or Sets) made
import type { CashPayload, PnlPayload } from "@/types/finance";
import { count } from "@/utils/format/count";
import { longDate, shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";

export function cashHeadline(c: CashPayload): { title: string; subtitle: string } {
  const since = c.since ? `since ${c.since.by.split(" ")[0]} reconciled on ${shortDate(c.since.date, false)}` : c.firstRecord ? `since the first record on ${shortDate(c.firstRecord, false)}` : "";
  const title = c.shouldBeOnHand < 0 ? `${naira(-c.shouldBeOnHand)} more went out than came in` : `${naira(c.shouldBeOnHand)} should be on hand`;
  return { title, subtitle: since ? `Money in minus money out ${since}.` : "Nothing recorded yet." };
}

// "Set 3 made ₦568,750 — a 15.96% margin" / "Sets 1–3 made …" / "Set 5 has lost ₦X so far"
export function pnlHeadline(p: PnlPayload): { title: string; subtitle: string } {
  const numbers = p.sets.map((s) => s.number).sort((a, b) => a - b);
  const name = numbers.length === 1 ? `Set ${numbers[0]}` : numbers.every((n, i) => i === 0 || n === numbers[i - 1]! + 1) ? `Sets ${numbers[0]}–${numbers.at(-1)}` : `Sets ${numbers.join(", ")}`;
  const running = p.sets.some((s) => s.status !== "closed");
  const profit = p.pnl.profit;
  const title = profit >= 0
    ? `${name} ${running ? "has made" : "made"} ${naira(profit)}${Number.isFinite(p.pnl.margin) ? ` — a ${pct(p.pnl.margin, 2)} margin` : ""}${running ? " so far" : ""}`
    : `${name} ${running ? "is" : "was"} ${naira(-profit)} down${running ? " so far" : ""}`;
  const closed = p.sets.length === 1 && p.sets[0]!.closedOn ? ` · closed ${longDate(p.sets[0]!.closedOn)}` : running ? " · still running" : "";
  return { title, subtitle: `${count(p.intake)} day-olds, ${count(p.birdsSold)} sold${closed}` };
}
