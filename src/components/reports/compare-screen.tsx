"use client";
// /reports/compare: pick two or more Sets and see them side by side
import { useState } from "react";
import { CompareDocument } from "@/components/reports/compare-document";
import { CompareSlots } from "@/components/reports/compare-slots";
import { ReportTabs } from "@/components/reports/report-tabs";
import { Button } from "@/components/kotila/button";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { useCompare } from "@/hooks/queries/use-compare";
import { useSets } from "@/hooks/queries/use-sets";
import { useOnline } from "@/hooks/use-online";
import { defaultCompare } from "@/utils/sets/default-compare";

export function CompareScreen() {
  const sets = useSets();
  const online = useOnline();
  const [picked, setPicked] = useState<string[] | null>(null);
  const ids = picked ?? defaultCompare(sets.data ?? []);
  const compare = useCompare(ids);
  const failed = sets.error ?? compare.error;
  const running = compare.data?.some((r) => !r.closed);
  return (
    <>
      <PageHeader eyebrow="Any two or more Sets, side by side" title="Compare Sets" actions={ids.length >= 2 ? <Button icon="download" href={`/api/reports/compare/pdf?setIds=${ids.join(",")}`} download disabled={!online}>Download PDF</Button> : null} />
      <ReportTabs active="compare" />
      {failed ? <Notice tone="alert">{failed.message}</Notice> : null}
      {sets.data && sets.data.length < 2 ? (
        <EmptyState title="Two Sets are needed to compare" icon="compare" action={{ label: "All Sets", icon: "sets", href: "/sets" }}>Once the farm has two Sets, compare them here metric by metric.</EmptyState>
      ) : sets.data ? (
        <Panel title="Sets to compare" subtitle={`${ids.length} picked · a Set picked in one list is removed from the others`}>
          <CompareSlots sets={sets.data} picked={ids} onChange={setPicked} />
          {running ? <p className="m-0 text-caption text-ink-muted">Running Sets show figures so far. Sale, cost-per-bird and profit figures appear once a Set has sold.</p> : null}
        </Panel>
      ) : null}
      {compare.data ? <CompareDocument rows={compare.data} /> : ids.length >= 2 && !failed ? <p className="text-body text-on-deep-muted lg:text-ink-muted">Lining the Sets up…</p> : null}
    </>
  );
}
