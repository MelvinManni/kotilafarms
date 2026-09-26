"use client";
// /expenses: filters, figures, the list and the category breakdown; ?add=1 opens the add sheet
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { HistorySheet } from "@/components/audit/history-sheet";
import { ExpenseFigures } from "@/components/expenses/expense-figures";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseSheet } from "@/components/expenses/expense-sheet";
import { RemoveExpenseSheet } from "@/components/expenses/remove-expense-sheet";
import { Button } from "@/components/kotila/button";
import { BarList } from "@/components/kotila/charts/bar-list";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useCategories, useExpenses, type ExpenseFilterState } from "@/hooks/queries/use-expenses";
import { useSets } from "@/hooks/queries/use-sets";
import type { ExpenseRow } from "@/types/expense";
import { monthName, recentMonths } from "@/utils/dates/recent-months";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { topCategories } from "@/utils/metrics/expense-summary";

export function ExpensesScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const isOwner = useSession().data?.user.role === "owner";
  const today = todayInZone(FARM_TIMEZONE);
  const [filters, setFilters] = useState<ExpenseFilterState>({ month: params.get("set") ? undefined : today.slice(0, 7), set: params.get("set") ?? undefined, show: "all" });
  const [sheet, setSheet] = useState<{ kind: "add" } | { kind: "edit" | "history" | "remove"; expense: ExpenseRow } | null>(params.get("add") ? { kind: "add" } : null);
  const list = useExpenses(filters);
  const sets = useSets();
  const categories = useCategories();
  const period = filters.month ? `in ${monthName(filters.month)}` : "in all";
  const top = list.data ? topCategories(list.data.summary.byCategory) : null;
  const closeAdd = () => {
    setSheet(null);
    if (params.get("add")) router.replace("/expenses");
  };
  return (
    <>
      <PageHeader
        eyebrow={top ? `${filters.month ? `${monthName(filters.month)} · ` : ""}${top.labels.join(" and ").toLowerCase()} were ${Math.round(top.share * 100)}% of it` : undefined}
        title="Expenses"
        actions={<Button variant="primary" icon="plus" onClick={() => setSheet({ kind: "add" })}>Add expense</Button>}
      />
      {sets.data && categories.data ? <ExpenseFilters value={filters} onChange={setFilters} sets={sets.data} categories={categories.data} months={recentMonths(today)} /> : null}
      {list.isError ? <Notice tone="alert" action={{ label: "Try again", onClick: () => list.refetch() }}>{list.error.message}</Notice> : null}
      {list.data ? (
        list.data.rows.length === 0 ? (
          <EmptyState title="No expenses here yet" icon="receipt" action={{ label: "Add expense", icon: "plus", onClick: () => setSheet({ kind: "add" }) }}>
            Every naira out goes here, tied to a Set or to farm overhead. That is what makes profit per Set real.
          </EmptyState>
        ) : (
          <>
            <ExpenseFigures summary={list.data.summary} period={period} />
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <Panel flush title={`Expenses ${period}`} subtitle={`${list.data.rows.length} in all, newest first`}>
                <ExpenseList rows={list.data.rows} onOpen={(expense) => setSheet({ kind: "edit", expense })} />
              </Panel>
              <Panel title="By category" subtitle="Running costs, largest first">
                <BarList items={list.data.summary.byCategory} />
                {list.data.summary.capital.count ? <p className="m-0 text-caption text-ink-muted">Capital items are kept apart from running costs and spread over the Sets that use them.</p> : null}
              </Panel>
            </div>
          </>
        )
      ) : list.isPending ? <p className="text-body text-ink-muted max-lg:text-on-deep-muted">Loading expenses…</p> : null}
      {sheet?.kind === "add" ? <ExpenseSheet presetSet={params.get("set") ?? undefined} onClose={closeAdd} /> : null}
      {sheet?.kind === "edit" ? (
        <ExpenseSheet
          expense={sheet.expense}
          onClose={() => setSheet(null)}
          extraActions={
            <>
              <Button variant="quiet" icon="history" onClick={() => setSheet({ kind: "history", expense: sheet.expense })}>History</Button>
              {isOwner ? <Button variant="danger" onClick={() => setSheet({ kind: "remove", expense: sheet.expense })}>Remove</Button> : null}
            </>
          }
        />
      ) : null}
      {sheet?.kind === "history" ? <HistorySheet table="expenses" rowId={sheet.expense.id} title="Edit history" description={sheet.expense.description} onClose={() => setSheet(null)} /> : null}
      {sheet?.kind === "remove" ? <RemoveExpenseSheet expense={sheet.expense} onClose={() => setSheet(null)} /> : null}
    </>
  );
}
