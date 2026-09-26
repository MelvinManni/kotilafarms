// Totals for a list of expenses: running costs, capital items, Sets vs overhead, by category
import type { ExpenseRow, ExpenseSummary } from "@/types/expense";

export function summarizeExpenses(rows: ExpenseRow[]): ExpenseSummary {
  const running = rows.filter((r) => !r.capitalItem);
  const capital = rows.filter((r) => r.capitalItem);
  const bySet = new Map<number, number>();
  const byCategory = new Map<string, number>();
  for (const r of running) {
    if (r.setNumber !== null) bySet.set(r.setNumber, (bySet.get(r.setNumber) ?? 0) + r.amount);
    byCategory.set(r.category.name, (byCategory.get(r.category.name) ?? 0) + r.amount);
  }
  const sum = (list: ExpenseRow[]) => list.reduce((n, r) => n + r.amount, 0);
  return {
    running: sum(running),
    capital: { total: sum(capital), count: capital.length },
    onSets: { total: sum(running.filter((r) => !r.overhead)), bySet: [...bySet.entries()].map(([number, total]) => ({ number, total })).sort((a, b) => b.number - a.number) },
    overhead: sum(running.filter((r) => r.overhead)),
    byCategory: [...byCategory.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
  };
}

// Share of the total taken by the largest n categories ("day-olds and feed were 85% of it")
export function topCategories(byCategory: { label: string; value: number }[], n = 2) {
  const total = byCategory.reduce((s, c) => s + c.value, 0);
  const top = byCategory.slice(0, n);
  return total > 0 && top.length ? { labels: top.map((c) => c.label), share: top.reduce((s, c) => s + c.value, 0) / total } : null;
}
