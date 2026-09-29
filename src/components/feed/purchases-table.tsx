// Feed and ingredient buys together, newest first
import { LedgerTable } from "@/components/kotila/ledger-table";
import type { FeedPurchaseRow, IngredientRow } from "@/types/feed";
import { shortDate } from "@/utils/format/dates";
import { decimal } from "@/utils/format/decimal";
import { naira } from "@/utils/format/naira";
import { latestRises } from "@/utils/metrics/price-trend";

const columns = [
  { key: "date", label: "Date", width: 120 },
  { key: "feed", label: "Feed" },
  { key: "bags", label: "Bags", align: "right" as const },
  { key: "per", label: "Per bag", align: "right" as const },
  { key: "total", label: "Total", align: "right" as const },
  { key: "transport", label: "Transport", align: "right" as const },
  { key: "supplier", label: "Supplier" },
  { key: "by", label: "Entered by" },
];

const FILTERS = [
  { key: "kind", label: "Bought" },
  { key: "where", label: "Set or store" },
  { key: "supplier", label: "Supplier" },
];

const first = (name: string) => name.split(" ")[0]!;

export function PurchasesTable({ purchases, ingredients }: { purchases: FeedPurchaseRow[]; ingredients: IngredientRow[] }) {
  const rose = latestRises(purchases);
  const rows = [
    ...purchases.map((p) => ({
      id: p.id, sort: p.date, kind: "Feed", where: p.set ? `Set ${p.set.number}` : "Farm store",
      date: shortDate(p.date), feed: { value: p.feed, sub: p.set ? `Set ${p.set.number}` : "Farm store" }, bags: decimal(p.bags, p.bags % 1 ? 1 : 0),
      per: rose.has(p.id) ? { value: naira(p.pricePerBag), tone: "alert" as const } : naira(p.pricePerBag),
      total: { value: naira(p.total), figure: true }, transport: p.transportCost ? naira(p.transportCost) : { value: "—", tone: "muted" as const }, supplier: p.supplier, by: first(p.by),
    })),
    ...ingredients.map((g) => ({
      id: g.id, sort: g.date, kind: "Ingredients", where: `Set ${g.set.number}`,
      date: shortDate(g.date), feed: { tag: { tone: "neutral" as const, label: "Ingredients" }, sub: `${g.ingredient}, ${decimal(g.quantity, g.quantity % 1 ? 1 : 0)} ${g.unit} · Set ${g.set.number}` },
      bags: { value: `${decimal(g.quantity, g.quantity % 1 ? 1 : 0)} ${g.unit}`, tone: "muted" as const }, per: { value: `${naira(g.unitCost)} a ${g.unit === "litres" ? "litre" : g.unit.replace(/s$/, "")}`, tone: "muted" as const },
      total: { value: naira(g.total), figure: true }, transport: { value: "—", tone: "muted" as const }, supplier: { value: "—", tone: "muted" as const }, by: first(g.by),
    })),
  ].sort((a, b) => b.sort.localeCompare(a.sort));
  return <LedgerTable dense caption="Feed purchases, newest first" columns={columns} rows={rows.map(({ sort: _s, ...r }) => r)} filters={FILTERS} />;
}
