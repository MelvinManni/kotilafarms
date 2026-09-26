// Compare Sets: each Set's report boiled down to one line of figures
import "server-only";
import { eachQuery } from "@/server/queries";
import { setReportFor } from "@/server/services/reports/set-report";
import type { CompareRow } from "@/types/compare";
import { daysBetween } from "@/utils/dates/days-between";

const finite = (n: number) => (Number.isFinite(n) ? n : null);

export async function compareFor(db: Parameters<typeof setReportFor>[0], setIds: string[], today: string): Promise<CompareRow[]> {
  const reports = await eachQuery(db, setIds, (id) => setReportFor(db, [id], today));
  return reports.map((r) => {
    const s = r.sets[0]!;
    const closed = s.status === "closed";
    const sold = r.birdsSold > 0;
    return {
      id: s.id, number: s.number, status: s.status, closed, closedOn: s.closedOn, dayOfAge: daysBetween(s.startDate, s.closedOn ?? today),
      intake: r.intake, deaths: r.deaths, sold: r.birdsSold,
      fcr: r.performance.fcr, weightAtSale: closed ? (r.saleWeight?.averageGrams ?? null) : null,
      costPerBirdSold: sold ? finite(r.pnl.costPerBirdSold) : null, revenuePerBird: sold ? finite(r.pnl.revenuePerBird) : null, marginPerBird: sold ? finite(r.pnl.marginPerBird) : null,
      margin: closed ? finite(r.pnl.margin) : null, feedShare: r.feedShare, profit: closed ? r.pnl.profit : null,
    };
  });
}
