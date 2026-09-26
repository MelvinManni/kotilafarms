"use client";
// /reports/weekly: this week's or last week's notes, one per running Set, and the PDF
import { useState } from "react";
import { ReportTabs } from "@/components/reports/report-tabs";
import { WeeklyDocument } from "@/components/reports/weekly-document";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { Segmented } from "@/components/kotila/segmented";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useWeeklyReview } from "@/hooks/queries/use-weekly";
import { useOnline } from "@/hooks/use-online";
import { addDays } from "@/utils/dates/add-days";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { weekOf } from "@/utils/dates/week-of";

export function WeeklyScreen() {
  const today = todayInZone(FARM_TIMEZONE);
  const online = useOnline();
  const [which, setWhich] = useState("this");
  const day = which === "this" ? today : addDays(weekOf(today).start, -1);
  const review = useWeeklyReview(day);
  return (
    <>
      <PageHeader title="Weekly review" actions={<Button icon="download" href={`/api/reports/weekly/pdf?week=${day}`} download disabled={!online}>Download PDF</Button>} />
      <ReportTabs active="weekly" />
      <Panel>
        <Segmented label="Week" options={[{ value: "this", label: "This week" }, { value: "last", label: "Last week" }]} value={which} onChange={setWhich} />
      </Panel>
      {review.isError ? <Notice tone="alert">{review.error.message}</Notice> : null}
      {review.data ? <WeeklyDocument w={review.data} /> : review.isPending ? <p className="text-body text-on-deep-muted lg:text-ink-muted">Writing the review…</p> : null}
    </>
  );
}
