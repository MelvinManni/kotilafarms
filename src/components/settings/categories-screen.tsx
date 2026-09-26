"use client";
// Settings › Expense categories
import { useCurrentUser } from "@/lib/auth/current-user";
import { useState } from "react";
import { CategorySheet } from "@/components/settings/category-sheet";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Button } from "@/components/kotila/button";
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { useCategories } from "@/hooks/queries/use-expenses";
import type { ExpenseCategory } from "@/types/expense";

export function CategoriesScreen() {
  const role = useCurrentUser().role;
  const categories = useCategories();
  const [sheet, setSheet] = useState<{ category?: ExpenseCategory } | null>(null);
  const rows = (categories.data ?? []).map((c) => ({ id: c.id, name: c.name, capital: c.isCapitalEligible ? { tag: { tone: "deep" as const, label: "Capital items allowed" } } : { value: "—", tone: "muted" as const } }));
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" actions={<Button variant="primary" icon="plus" onClick={() => setSheet({})}>Add a category</Button>} />
      <SettingsTabs active="categories" role={role} />
      {categories.isError ? <Notice tone="alert">{categories.error.message}</Notice> : null}
      <Panel flush title="Expense categories" subtitle="Every expense is filed under one. Select a category to rename it.">
        <LedgerTable
          caption="Expense categories"
          columns={[{ key: "name", label: "Category" }, { key: "capital", label: "Capital items", align: "right" }]}
          rows={rows}
          onRowClick={(r) => setSheet({ category: categories.data!.find((c) => c.id === r.id) })}
        />
      </Panel>
      {sheet ? <CategorySheet category={sheet.category} onClose={() => setSheet(null)} /> : null}
    </div>
  );
}
