// The comparison: the table and three findings (screen and PDF)
import { Panel } from "@/components/kotila/panel";
import { CompareTable } from "@/components/reports/compare-table";
import type { CompareRow } from "@/types/compare";
import { compareFindings } from "@/utils/metrics/compare";

export function CompareDocument({ rows }: { rows: CompareRow[] }) {
  return (
    <div className="flex flex-col gap-5">
      <CompareTable rows={rows} />
      <div className="grid gap-5 lg:grid-cols-3 print:grid-cols-3">
        {compareFindings(rows).map((f) => (
          <Panel key={f.title} title={f.title} className="break-inside-avoid">
            <p className="m-0 text-body text-ink-2">{f.body}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
