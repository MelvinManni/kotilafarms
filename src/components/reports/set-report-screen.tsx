"use client";
// /reports/set: pick a Set (or all closed Sets), read the report, download it as a PDF
import { useState } from "react";
import { ReportTabs } from "@/components/reports/report-tabs";
import { SetReportDocument } from "@/components/reports/set-report-document";
import { Button } from "@/components/kotila/button";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { Segmented } from "@/components/kotila/segmented";
import { PageHeader } from "@/components/layout/page-header";
import { useSetReport } from "@/hooks/queries/use-reports";
import { useSets } from "@/hooks/queries/use-sets";
import { useOnline } from "@/hooks/use-online";
import { defaultPnlChoice, pnlChoices } from "@/utils/sets/pnl-choices";

export function SetReportScreen({ initialIds }: { initialIds: string[] }) {
  const sets = useSets();
  const online = useOnline();
  const choices = pnlChoices(sets.data ?? []);
  const [picked, setPicked] = useState<string | null>(null);
  const choice = picked ?? (initialIds.length ? null : defaultPnlChoice(sets.data ?? []));
  const ids = choice ? (choices.find((c) => c.value === choice)?.ids ?? []) : initialIds;
  const report = useSetReport(ids);
  const failed = sets.error ?? report.error;
  return (
    <>
      <PageHeader
        title="Set report"
        actions={ids.length ? <Button icon="download" href={`/api/reports/set/pdf?setIds=${ids.join(",")}`} download disabled={!online}>Download PDF</Button> : null}
      />
      <ReportTabs active="set" />
      {failed ? <Notice tone="alert">{failed.message}</Notice> : null}
      {sets.data?.length === 0 ? (
        <EmptyState title="No Sets yet" icon="reports" action={{ label: "Start a new Set", icon: "plus", href: "/sets" }}>A report shows a Set’s birds, money and growth from start to sale. Start a Set to see one.</EmptyState>
      ) : null}
      {choices.length ? (
        <Panel>
          <Segmented label="Sets" options={choices.map(({ value, label }) => ({ value, label }))} value={choice ?? undefined} onChange={setPicked} />
        </Panel>
      ) : null}
      {report.data ? <SetReportDocument r={report.data} /> : ids.length && !failed ? <p className="text-body text-on-deep-muted lg:text-ink-muted">Putting the report together…</p> : null}
    </>
  );
}
