// The Set report's eight headline figures: birds in, out and alive, then the money
import { Figure } from "@/components/kotila/figure";
import type { SetReportPayload } from "@/types/report";
import { count } from "@/utils/format/count";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import { kg } from "@/utils/format/weight";
import { mortalityRate } from "@/utils/metrics/birds";

export function ReportFigures({ r }: { r: SetReportPayload }) {
  const one = r.sets.length === 1;
  const kinds = r.byCategory.length;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
      <Figure label="Intake" value={count(r.intake)} sub={one ? `day-olds, ${shortDate(r.period.from, false)}` : `day-olds in ${r.sets.length} Sets`} />
      <Figure label="Deaths" value={count(r.deaths)} sub={`${pct(mortalityRate(r.deaths, r.intake))} of intake`} />
      <Figure label="Birds sold" value={count(r.birdsSold)} sub={r.liveBirds ? `${count(r.liveBirds)} still alive` : `of ${count(r.intake)} started`} />
      <Figure label={r.sets.every((s) => s.status === "closed") ? "Average weight at sale" : "Latest average weight"} value={r.saleWeight ? kg(r.saleWeight.averageGrams) : "—"} sub={r.saleWeight ? `day ${r.saleWeight.day}` : "not weighed"} />
      <Figure label="Revenue" value={naira(r.pnl.revenue)} sub="birds and manure" />
      <Figure label="Expenses" value={naira(r.pnl.expenses)} sub={`${kinds} ${kinds === 1 ? "category" : "categories"}`} />
      <Figure label="Profit" value={naira(r.pnl.profit)} sub="revenue − expenses" tone={r.pnl.profit < 0 ? "alert" : undefined} />
      <Figure label="Margin" value={pct(r.pnl.margin, 2)} sub="profit ÷ revenue" />
    </div>
  );
}
