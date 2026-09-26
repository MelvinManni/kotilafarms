// The Set report's title, period line, growth note and closing footnote
import type { SetReportPayload } from "@/types/report";
import { count } from "@/utils/format/count";
import { longDate, shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import { setNames } from "@/utils/format/set-names";
import { kg } from "@/utils/format/weight";
import { gapToStandard, interpolateStandard } from "@/utils/metrics/growth";

const running = (r: SetReportPayload) => r.sets.some((s) => s.status !== "closed");

export function reportTitle(r: SetReportPayload): string {
  const name = setNames(r.sets.map((s) => s.number));
  const profit = r.pnl.profit;
  const verb = profit >= 0 ? (running(r) ? `has made ${naira(profit)}` : `made ${naira(profit)}`) : running(r) ? `is ${naira(-profit)} down` : `lost ${naira(-profit)}`;
  return `${name} ${verb} on ${count(r.intake)} day-olds${running(r) ? " so far" : ""}`;
}

// "Set 3 report · 20 July – 14 September 2026 · prepared 26 Sep 2026"
export function reportPeriod(r: SetReportPayload): string {
  const from = longDate(r.period.from).replace(/ \d{4}$/, "");
  return `${setNames(r.sets.map((s) => s.number))} report · ${from} – ${r.period.to ? longDate(r.period.to) : "still running"} · prepared ${shortDate(r.prepared)}`;
}

export function growthNote(g: NonNullable<SetReportPayload["growth"]>, setNumber: number): string {
  const last = g.samples.at(-1);
  if (!last) return `Set ${setNumber} was never weighed.`;
  const gap = gapToStandard(last.grams, interpolateStandard(g.standard.map((p) => ({ day: p.day, weight: p.grams })), last.day));
  const where = Math.abs(gap) <= 0.05 ? "within 5% of the standard" : `${Math.round(Math.abs(gap) * 100)}% ${gap < 0 ? "under" : "over"} the standard`;
  return `Weighed ${g.samples.length} ${g.samples.length === 1 ? "time" : "times"}. The last weighing, ${kg(last.grams)} at day ${last.day}, was ${where}.`;
}

export function reportFootnote(r: SetReportPayload): string {
  const owed = r.unpaid.count ? ` ${setNames(r.sets.map((s) => s.number))} had ${r.unpaid.count} unpaid ${r.unpaid.count === 1 ? "balance" : "balances"} (${naira(r.unpaid.total)}); ${r.unpaid.count === 1 ? "it is" : "they are"} counted in revenue.` : "";
  return `Figures from the farm records as of ${shortDate(r.prepared)}.${owed}`;
}
