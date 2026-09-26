// How each compared figure reads in the table ("so far" on running Sets)
import type { CompareRow } from "@/types/compare";
import { count } from "@/utils/format/count";
import { decimal } from "@/utils/format/decimal";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import { kg } from "@/utils/format/weight";

export function compareValue(key: string, r: CompareRow): string | null {
  const soFar = r.closed ? "" : " so far";
  switch (key) {
    case "intake": return count(r.intake);
    case "mortality": return `${pct(r.deaths / r.intake)} · ${count(r.deaths)} birds`;
    case "sold": return r.sold ? count(r.sold) : null;
    case "fcr": return r.fcr === null ? null : `${decimal(r.fcr, 2)}${soFar}`;
    case "weight": return r.weightAtSale === null ? null : kg(r.weightAtSale);
    case "cost": return r.costPerBirdSold === null ? null : naira(r.costPerBirdSold);
    case "revenue": return r.revenuePerBird === null ? null : naira(r.revenuePerBird);
    case "marginPerBird": return r.marginPerBird === null ? null : naira(r.marginPerBird);
    case "margin": return r.margin === null ? null : pct(r.margin, 2);
    case "feedShare": return r.feedShare === null ? null : `${pct(r.feedShare, 0)}${soFar}`;
    case "profit": return r.profit === null ? null : naira(r.profit);
    default: return null;
  }
}

// "Set 4 · Growing, day 24" / "Set 3 · Closed 14 Sep"
export const compareOptionLabel = (s: { number: number; status: string; dayOfAge: number; closedOn: string | null }, closedLabel: string) =>
  s.status === "closed" ? `Set ${s.number} · ${closedLabel}` : `Set ${s.number} · ${s.status[0]!.toUpperCase()}${s.status.slice(1)}, day ${s.dayOfAge}`;
