"use client";
// /sets/:id: header with actions, figures, deaths by day and spend by category
import { useSession } from "next-auth/react";
import { useState } from "react";
import { DeathsByDay } from "@/components/sets/deaths-by-day";
import { SetFigures } from "@/components/sets/set-figures";
import { StageSheet } from "@/components/sets/stage-sheet";
import { SetLogsPanel } from "@/components/sets/set-logs-panel";
import { Button } from "@/components/kotila/button";
import { BarList } from "@/components/kotila/charts/bar-list";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { Panel } from "@/components/kotila/panel";
import { StatusChip } from "@/components/kotila/status-chip";
import { PageHeader } from "@/components/layout/page-header";
import { FARM_TIMEZONE } from "@/constants/farm";
import { useSet } from "@/hooks/queries/use-sets";
import { can } from "@/lib/auth/roles";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { categoryShare } from "@/utils/metrics/category-share";
import { naira } from "@/utils/format/naira";

export function SetDetailScreen({ id }: { id: string }) {
  const role = useSession().data?.user.role;
  const set = useSet(id);
  const [staging, setStaging] = useState(false);
  const today = todayInZone(FARM_TIMEZONE);
  if (set.isPending) return <p className="text-body text-on-deep-muted lg:text-ink-muted">Loading the Set…</p>;
  if (set.isError)
    return set.error.message.includes("wasn't found") ? (
      <EmptyState title="That Set wasn’t found" icon="sets" action={{ label: "All Sets", icon: "sets", href: "/sets" }}>It may have been removed. Open the list to find the one you want.</EmptyState>
    ) : (
      <Notice tone="alert" action={{ label: "Try again", onClick: () => set.refetch() }}>{set.error.message}</Notice>
    );
  const s = set.data;
  const manage = role ? can.manageOperations(role) : false;
  const feedShare = s.spendByCategory ? categoryShare(s.spendByCategory, "Feed") : null;
  return (
    <>
      <PageHeader
        eyebrow={`Sets › Set ${s.number}`}
        title={
          <span className="flex flex-wrap items-center gap-3">
            Set {s.number}
            {s.pen ? ` · ${s.pen}` : ""}
            <StatusChip status={s.status} day={s.status === "closed" ? undefined : s.dayOfAge} />
          </span>
        }
        actions={
          <>
            {manage ? <Button onClick={() => setStaging(true)}>Change stage</Button> : null}
            {manage && s.status !== "closed" ? <Button icon="receipt" href={`/expenses?add=1&set=${s.id}`}>Add expense</Button> : null}
            {s.status !== "closed" ? <Button variant="primary" icon="plus" href={`/log/${s.id}/${today}`}>Log today</Button> : null}
          </>
        }
      />
      <SetFigures set={s} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Deaths by day" subtitle={s.status === "closed" ? `${s.deaths} in all` : `${s.trend.thisWeek} this week, ${s.trend.lastWeek} last week`}>
          <DeathsByDay set={s} today={today} />
        </Panel>
        {s.spendByCategory ? (
          <Panel
            title={s.status === "closed" ? "Spend by category" : "Spend so far by category"}
            subtitle={s.money ? `${naira(s.money.spend)}${feedShare !== null && feedShare > 0 ? ` · feed is ${Math.round(feedShare * 100)}%` : ""}` : undefined}
            action={{ label: "All expenses", href: `/expenses?set=${s.id}` }}
          >
            {s.spendByCategory.length ? <BarList items={s.spendByCategory} /> : <p className="m-0 text-body text-ink-muted">Nothing spent on this Set yet.</p>}
          </Panel>
        ) : null}
      </div>
      <SetLogsPanel set={s} today={today} />
      {staging ? <StageSheet set={s} onClose={() => setStaging(false)} /> : null}
    </>
  );
}
