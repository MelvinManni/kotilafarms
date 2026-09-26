// The largest expenses, in date order
import { LedgerTable } from "@/components/kotila/ledger-table";
import { ReportSection } from "@/components/reports/report-section";
import type { SetReportPayload } from "@/types/report";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

const columns = [
  { key: "date", label: "Date", width: 110 },
  { key: "what", label: "What" },
  { key: "cat", label: "Category", width: 170 },
  { key: "amt", label: "Amount", align: "right" as const, width: 130 },
];

export function ReportExpenses({ list, caption }: { list: SetReportPayload["largestExpenses"]; caption: string }) {
  if (list.of === 0) return null;
  const rows = list.rows.map((e, i) => ({ id: String(i), date: shortDate(e.date, false), what: e.description, cat: e.category, amt: naira(e.amount) }));
  return (
    <ReportSection title="Expenses by date" note={list.of > list.rows.length ? `The ${list.rows.length} largest of ${list.of} entries` : `All ${list.of} ${list.of === 1 ? "entry" : "entries"}`}>
      <LedgerTable dense caption={caption} columns={columns} rows={rows} />
    </ReportSection>
  );
}
