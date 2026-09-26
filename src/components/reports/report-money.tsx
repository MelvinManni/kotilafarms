// Per-bird money, performance (FCR, feed cost per kg, mortality) and expenses by category
import { BarList } from "@/components/kotila/charts/bar-list";
import { Rows } from "@/components/kotila/rows";
import { ReportSection as Section } from "@/components/reports/report-section";
import type { SetReportPayload } from "@/types/report";
import { count } from "@/utils/format/count";
import { decimal } from "@/utils/format/decimal";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import { mortalityRate } from "@/utils/metrics/birds";

const money = (n: number) => (Number.isFinite(n) ? naira(n) : "—");

export function ReportMoney({ r }: { r: SetReportPayload }) {
  const p = r.performance;
  return (
    <div className="grid gap-8 sm:grid-cols-3 print:grid-cols-3">
      <Section title="Per bird">
        <Rows items={[
          { label: "Cost per bird started", value: money(r.pnl.costPerBirdStarted) },
          { label: "Cost per bird sold", value: money(r.pnl.costPerBirdSold) },
          { label: "Revenue per bird", value: money(r.pnl.revenuePerBird) },
          { label: "Margin per bird", value: money(r.pnl.marginPerBird), total: true },
        ]} />
      </Section>
      <Section title="Performance">
        <Rows items={[
          { label: "Feed conversion ratio", value: p.fcr === null ? "—" : decimal(p.fcr, 2), sub: p.fcr === null ? "needs feed logged and a weighing" : undefined },
          { label: "Feed cost per kg live weight", value: p.feedCostPerKg === null ? "—" : naira(p.feedCostPerKg), sub: p.feedCostPerKg !== null && p.liveKg ? `${naira(p.feedSpend)} ÷ ${count(Math.round(p.liveKg))} kg` : undefined },
          { label: "Mortality", value: pct(mortalityRate(r.deaths, r.intake)), sub: `${count(r.deaths)} of ${count(r.intake)}` },
        ]} />
      </Section>
      <Section title="Expenses by category">
        {r.byCategory.length ? <BarList items={r.byCategory} /> : <p className="m-0 text-body text-ink-muted">Nothing spent yet.</p>}
      </Section>
    </div>
  );
}
