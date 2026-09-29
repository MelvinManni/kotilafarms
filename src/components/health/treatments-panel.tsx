// Drugs and supplements given, newest first
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Panel } from "@/components/kotila/panel";
import type { HealthRecordRow } from "@/types/health";
import { clockTime, farmDay, shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";
import { treatmentsSummary } from "@/utils/metrics/health-headlines";

const columns = [
  { key: "date", label: "Date", width: 110 },
  { key: "set", label: "Set", width: 90 },
  { key: "item", label: "Item" },
  { key: "dose", label: "Amount / dose" },
  { key: "cost", label: "Cost", align: "right" as const },
  { key: "why", label: "Why" },
  { key: "by", label: "Entered by" },
];

export function TreatmentsPanel({ rows, onRecord }: { rows: HealthRecordRow[]; onRecord: () => void }) {
  const table = rows.map((r) => ({
    id: r.id, date: farmDay(r.date), set: `Set ${r.set.number}`, item: r.item, dose: r.dose,
    cost: r.cost ? naira(r.cost) : { value: "—", tone: "muted" as const }, why: r.reason,
    by: { value: r.by.split(" ")[0]!, sub: `${shortDate(r.enteredAt.slice(0, 10), false)}, ${clockTime(r.enteredAt)}` },
  }));
  return (
    <Panel flush title="Drugs and supplements" subtitle={treatmentsSummary(rows)} action={{ label: "Record a treatment", onClick: onRecord }}>
      {rows.length ? <LedgerTable dense caption="Drugs and supplements given, newest first" columns={columns} rows={table} filters={[{ key: "set", label: "Set" }, { key: "item", label: "Item" }, { key: "by", label: "Entered by" }]} /> : <p className="m-0 px-6 pb-5 text-body text-ink-muted">Record each drug, vaccine booster or supplement with how much, the cost and why. It shows here and on the Set.</p>}
    </Panel>
  );
}
