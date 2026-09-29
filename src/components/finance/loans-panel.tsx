// Shareholder loans: who lent what, when, days out and whether repaid; select one to see its interest or mark it repaid
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Panel } from "@/components/kotila/panel";
import type { LoanRow } from "@/types/capital";
import { naira } from "@/utils/format/naira";
import { shortDate } from "@/utils/format/dates";

const columns = [
  { key: "who", label: "Lender" },
  { key: "amt", label: "Amount", align: "right" as const },
  { key: "adv", label: "Advanced" },
  { key: "rep", label: "Repaid" },
  { key: "days", label: "Days", align: "right" as const },
  { key: "status", label: "Status" },
];

export function LoansPanel({ loans, onOpen }: { loans: LoanRow[]; onOpen: (l: LoanRow) => void }) {
  const rows = loans.map((l) => ({
    id: l.id, who: l.lender.name, amt: { value: naira(l.amount), figure: true }, adv: shortDate(l.advancedOn),
    rep: l.repaidOn ? shortDate(l.repaidOn) : { value: "—", tone: "muted" as const },
    days: l.repaidOn ? String(l.interest.days) : `${l.interest.days} so far`,
    status: { tag: l.repaidOn ? { tone: "success" as const, label: "Repaid" } : { tone: "warning" as const, label: "Outstanding" } },
  }));
  return (
    <Panel flush title="Shareholder loans" subtitle="16% a year, simple interest · 10% withholding tax on interest · select a loan for its interest">
      {rows.length ? <LedgerTable caption="Loans from shareholders to the farm" columns={columns} rows={rows} filters={[{ key: "who", label: "Lender" }, { key: "status", label: "Status" }]} onRowClick={(r) => onOpen(loans.find((l) => l.id === r.id)!)} /> : <p className="m-0 px-6 pb-5 text-body text-ink-muted">No loans yet. Record money a shareholder lends beyond their capital.</p>}
    </Panel>
  );
}
