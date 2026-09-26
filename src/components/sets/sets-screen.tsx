"use client";
// /sets: headline figures, Running / Closed tabs and the ledger of Sets
import { useSession } from "next-auth/react";
import { useState } from "react";
import { SetsFigures } from "@/components/sets/sets-figures";
import { SetCards } from "@/components/sets/set-cards";
import { SetsTable } from "@/components/sets/sets-table";
import { StartSetSheet } from "@/components/sets/start-set-sheet";
import { Button } from "@/components/kotila/button";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { Tabs } from "@/components/kotila/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { useSets } from "@/hooks/queries/use-sets";
import { can } from "@/lib/auth/roles";

export function SetsScreen() {
  const role = useSession().data?.user.role;
  const sets = useSets();
  const [tab, setTab] = useState("all");
  const [starting, setStarting] = useState(false);
  const canStart = role ? can.manageOperations(role) : false;
  const all = sets.data ?? [];
  const running = all.filter((s) => s.status !== "closed");
  const shown = tab === "active" ? running : tab === "closed" ? all.filter((s) => s.status === "closed") : all;
  const startButton = canStart ? <Button variant="primary" icon="plus" onClick={() => setStarting(true)}>Start a new Set</Button> : null;
  return (
    <>
      <PageHeader eyebrow={sets.data ? `${all.length} ${all.length === 1 ? "Set" : "Sets"} · ${running.length} running now` : undefined} title="Sets" actions={startButton} />
      {sets.isPending ? <p className="text-body text-ink-muted max-lg:text-on-deep-muted">Loading Sets…</p> : null}
      {sets.isError ? <Notice tone="alert" action={{ label: "Try again", onClick: () => sets.refetch() }}>{sets.error.message}</Notice> : null}
      {sets.data && all.length === 0 ? (
        <EmptyState title="No Sets yet" icon="sets" action={startButton}>
          A Set is one group of day-olds raised together. Start one when the day-olds arrive, and every log, feed bag, sale and expense can be tied to it.
        </EmptyState>
      ) : null}
      {sets.data && all.length > 0 ? (
        <>
          <SetsFigures sets={all} />
          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="px-6 pt-2">
              <Tabs items={[{ value: "all", label: "All", count: all.length }, { value: "active", label: "Running", count: running.length }, { value: "closed", label: "Closed", count: all.length - running.length }]} active={tab} onChange={setTab} />
            </div>
            <div className="hidden lg:block">
              <SetsTable sets={shown} />
            </div>
            <SetCards sets={shown} />
          </section>
          <p className="m-0 text-caption text-ink-muted">Profit and margin appear when a Set is closed. Running Sets show spend to date. Select a row to open the Set.</p>
        </>
      ) : null}
      {starting ? <StartSetSheet onClose={() => setStarting(false)} /> : null}
    </>
  );
}
