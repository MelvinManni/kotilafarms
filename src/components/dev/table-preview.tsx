"use client";
// Dev preview: ledger table of Sets and buyers owed
import { LedgerTable } from "@/components/kotila/ledger-table";
import { PreviewSection } from "@/components/dev/preview-section";

const columns = [
  { key: "set", label: "Set" },
  { key: "status", label: "Stage" },
  { key: "live", label: "Live birds", align: "right" as const },
  { key: "deaths", label: "Deaths", align: "right" as const },
  { key: "spend", label: "Spent so far", align: "right" as const },
];

const rows = [
  { id: "5", set: { value: "Set 5", sub: "Front pen" }, status: { status: "brooding" as const, day: 6 }, live: { value: "597", sub: "of 600" }, deaths: { value: "3", sub: "0.5%" }, spend: "₦812,600" },
  { id: "4", set: { value: "Set 4", sub: "Back pen" }, status: { status: "growing" as const, day: 24 }, live: { value: "482", sub: "of 500" }, deaths: { value: "18", tone: "alert" as const, delta: { direction: "up" as const, label: "4 this week" }, sub: "3.6%" }, spend: "₦1,742,350" },
  { id: "3", set: { value: "Set 3", sub: "Closed 14 Sep" }, status: { status: "closed" as const }, live: { value: "0", tone: "muted" as const, sub: "465 sold" }, deaths: { value: "35", sub: "7.0%" }, spend: "₦2,994,800" },
];

export function TablePreview() {
  return (
    <PreviewSection title="Ledger table">
      <div className="rounded-xl border border-line bg-surface">
        <LedgerTable caption="Sets" columns={columns} rows={rows} filters={[{ key: "status", label: "Stage" }]} onRowClick={() => undefined} />
      </div>
      <div className="rounded-xl border border-line bg-surface">
        <LedgerTable
          dense
          caption="Balances owed"
          columns={[{ key: "buyer", label: "Buyer" }, { key: "sale", label: "Sale" }, { key: "owed", label: "Owed", align: "right" }]}
          rows={[
            { buyer: "Mama Nkechi", sale: { value: "7 Sep", sub: "30 birds" }, owed: { value: "₦215,000", tone: "owed", sub: "19 days" } },
            { buyer: "Chidi Poultry Mart", sale: { value: "18 Sep", sub: "20 birds" }, owed: { value: "₦143,400", tone: "owed" } },
            { buyer: "Alhaji Sule", sale: { value: "10 Sep", sub: "50 birds" }, owed: { value: "₦53,600", tone: "owed" } },
          ]}
          footer={{ buyer: "Total owed", owed: "₦412,000" }}
        />
      </div>
    </PreviewSection>
  );
}
