// Sets side by side, metric by metric, with the best named on the right
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Panel } from "@/components/kotila/panel";
import type { CompareRow } from "@/types/compare";
import { compareValue } from "@/utils/format/compare-value";
import { bestIn, COMPARE_METRICS, compareTitle } from "@/utils/metrics/compare";

export function CompareTable({ rows }: { rows: CompareRow[] }) {
  const columns = [{ key: "m", label: "Metric", width: 240 }, ...rows.map((r) => ({ key: r.id, label: `Set ${r.number}`, align: "right" as const })), { key: "best", label: "Best", align: "right" as const, width: 150 }];
  const table = COMPARE_METRICS.map((m) => {
    const best = bestIn(m, rows);
    const cells = Object.fromEntries(rows.map((r) => {
      const v = compareValue(m.key, r);
      return [r.id, v === null ? { value: "—", tone: "muted" as const } : { value: v, sub: !r.closed && m.runningCounts ? "so far" : undefined }];
    }));
    return { id: m.key, m: m.label, ...cells, best: best ? { tag: { tone: "success" as const, label: `Best: Set ${best.number}` } } : { value: "—", tone: "muted" as const } };
  });
  return (
    <Panel flush title={compareTitle(rows)} subtitle="The best value in each row is named on the right. Only Sets with that figure take part." className="break-inside-avoid">
      <LedgerTable dense caption="Sets compared by metric" columns={columns} rows={table} />
    </Panel>
  );
}
