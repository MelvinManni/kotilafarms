// Headline figures for the filtered expenses
import { Figure } from "@/components/kotila/figure";
import type { ExpenseSummary } from "@/types/expense";
import { naira } from "@/utils/format/naira";

export function ExpenseFigures({ summary, period }: { summary: ExpenseSummary; period: string }) {
  const bySet = summary.onSets.bySet.slice(0, 3).map((s) => `Set ${s.number} ${naira(s.total)}`).join(" · ");
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-surface px-6 py-5 sm:grid-cols-3">
      <Figure label={`Spent ${period}`} value={naira(summary.running)} size="lg" sub={summary.capital.count ? `plus ${naira(summary.capital.total)} on ${summary.capital.count === 1 ? "one capital item" : `${summary.capital.count} capital items`}` : undefined} />
      <Figure label="On Sets" value={naira(summary.onSets.total)} size="lg" sub={bySet || undefined} />
      <Figure label="Farm overhead" value={naira(summary.overhead)} size="lg" sub="shared by all Sets" />
    </div>
  );
}
