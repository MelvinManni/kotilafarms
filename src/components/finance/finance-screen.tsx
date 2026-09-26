"use client";
// /finance: cash position since the last count, and what each Set made
import { useState } from "react";
import { CashPanel } from "@/components/finance/cash-panel";
import { PnlPanel } from "@/components/finance/pnl-panel";
import { ReconcileSheet } from "@/components/finance/reconcile-sheet";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { PageHeader } from "@/components/layout/page-header";
import { useCash } from "@/hooks/queries/use-finance";
import { useSets } from "@/hooks/queries/use-sets";
import { useCurrentUser } from "@/lib/auth/current-user";

export function FinanceScreen() {
  const role = useCurrentUser().role;
  const cash = useCash();
  const sets = useSets();
  const [reconciling, setReconciling] = useState(false);
  const failed = cash.error ?? sets.error;
  return (
    <>
      <PageHeader eyebrow="Money in and out, and what each Set made" title="Finance" />
      {failed ? <Notice tone="alert">{failed.message}</Notice> : null}
      {cash.data ? <CashPanel cash={cash.data} canReconcile={role === "owner"} onReconcile={() => setReconciling(true)} /> : failed ? null : <p className="text-body text-on-deep-muted lg:text-ink-muted">Loading the books…</p>}
      {sets.data?.length === 0 ? (
        <EmptyState title="No Sets yet" icon="sets" action={{ label: "Start a new Set", icon: "plus", href: "/sets" }}>Profit and loss is worked out per Set from its sales and expenses. Start a Set to see it here.</EmptyState>
      ) : sets.data ? (
        <PnlPanel sets={sets.data} />
      ) : null}
      {reconciling && cash.data ? <ReconcileSheet expected={cash.data.shouldBeOnHand} onClose={() => setReconciling(false)} /> : null}
    </>
  );
}
