"use client";
// Bird and manure sales, newest first; a bird sale opens its details
import { LedgerTable } from "@/components/kotila/ledger-table";
import { methodLabel } from "@/constants/payment-methods";
import type { OtherSaleRow, SaleRow } from "@/types/sale";
import { count } from "@/utils/format/count";
import { farmDay } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

const none = { value: "—", tone: "muted" as const };
const columns = [
  { key: "date", label: "Date" },
  { key: "buyer", label: "Buyer", width: 220 },
  { key: "set", label: "Set" },
  { key: "birds", label: "Birds", align: "right" as const },
  { key: "per", label: "Per bird", align: "right" as const },
  { key: "total", label: "Total", align: "right" as const },
  { key: "paid", label: "Paid", align: "right" as const },
  { key: "bal", label: "Balance", align: "right" as const },
  { key: "method", label: "Method" },
];

type SalesTableProps = {
  sales: (SaleRow | OtherSaleRow)[];
  onOpen: (sale: SaleRow) => void;
  // On a buyer's page the buyer column is the same on every row
  hideBuyer?: boolean;
  caption?: string;
  footer?: Parameters<typeof LedgerTable>[0]["footer"];
};

export function SalesTable({ sales, onOpen, hideBuyer, caption = "Sales, newest first", footer }: SalesTableProps) {
  const rows = sales.map((s) =>
    s.kind === "manure"
      ? { id: s.id, date: farmDay(s.date), buyer: { value: "Manure and droppings", sub: "Other sale" }, set: `Set ${s.set.number}`, birds: none, per: none, total: naira(s.amount), paid: naira(s.amount), bal: none, method: none }
      : {
          id: s.id,
          date: farmDay(s.date),
          buyer: s.buyer.name,
          set: `Set ${s.set.number}`,
          birds: count(s.birds),
          per: s.belowBulk ? { value: naira(s.pricePerBird), sub: "under bulk rate" } : naira(s.pricePerBird),
          total: naira(s.total),
          paid: naira(s.paid),
          bal: s.balance > 0 ? { value: naira(s.balance), tone: "owed" as const } : none,
          method: methodLabel(s.method),
        },
  );
  return (
    <LedgerTable
      dense
      caption={caption}
      columns={hideBuyer ? columns.filter((c) => c.key !== "buyer") : columns}
      footer={footer}
      rows={rows}
      onRowClick={(r) => {
        const sale = sales.find((s) => s.id === r.id);
        if (sale?.kind === "birds") onOpen(sale);
      }}
    />
  );
}
