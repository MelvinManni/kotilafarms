// Every payment from a buyer, newest first, with the sale it was for and who recorded it
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Panel } from "@/components/kotila/panel";
import { methodLabel } from "@/constants/payment-methods";
import type { BuyerPayment } from "@/utils/sales/buyer-payments";
import { count } from "@/utils/format/count";
import { farmDay, shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

const columns = [
  { key: "date", label: "Date" },
  { key: "amount", label: "Amount", align: "right" as const },
  { key: "method", label: "Method" },
  { key: "for", label: "For the sale of" },
  { key: "by", label: "Recorded by" },
];

export function BuyerPaymentsPanel({ name, payments }: { name: string; payments: BuyerPayment[] }) {
  const rows = payments.map((p) => ({ id: p.key, date: farmDay(p.date), amount: naira(p.amount), method: p.kind === "later" ? methodLabel(p.method) : { value: methodLabel(p.method), sub: p.kind }, for: `${shortDate(p.sale.date, false)} · ${count(p.sale.birds)} birds`, by: p.by }));
  return (
    <Panel flush title="Payments">
      {rows.length ? <LedgerTable dense caption={`Payments from ${name}, newest first`} columns={columns} rows={rows} /> : <p className="m-0 px-6 pb-5 text-body text-ink-muted">No payments yet.</p>}
    </Panel>
  );
}
