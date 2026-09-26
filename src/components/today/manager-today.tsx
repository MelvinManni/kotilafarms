// Today for owners and managers: what is owed, missed days, active Sets, and what needs doing
import { ActiveSetsTable } from "@/components/today/active-sets-table";
import { MissedDaysAll } from "@/components/today/missed-days-all";
import { OwedBand } from "@/components/today/owed-band";
import { TaskList } from "@/components/today/task-list";
import { Button } from "@/components/kotila/button";
import { EmptyState } from "@/components/kotila/empty-state";
import { Panel } from "@/components/kotila/panel";
import { PageHeader } from "@/components/layout/page-header";
import { GrowthPanel } from "@/components/weights/growth-panel";
import type { TodayPayload } from "@/types/today";
import { fullDay } from "@/utils/format/dates";

export function ManagerToday({ data }: { data: TodayPayload }) {
  const growth = data.sets.find((s) => s.id === data.growthSetId);
  return (
    <>
      <PageHeader
        eyebrow={fullDay(data.date)}
        title="Today on the farm"
        actions={
          <>
            <Button icon="receipt" href="/expenses?add=1">Add expense</Button>
            {data.sets.length ? <Button variant="primary" icon="plus" href="/log">Log today</Button> : null}
          </>
        }
      />
      {data.owed ? <OwedBand owed={data.owed} /> : null}
      <MissedDaysAll missed={data.missed} />
      {data.sets.length === 0 ? (
        <EmptyState title="No Sets running" icon="sets" action={{ label: "Start a new Set", icon: "plus", href: "/sets" }}>
          Start a Set when the day-olds arrive. Its daily logs, feed, sales and costs will show here every day.
        </EmptyState>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <Panel flush title="Active Sets" action={{ label: "All Sets", href: "/sets" }}>
              <ActiveSetsTable sets={data.sets} />
            </Panel>
            {growth ? <GrowthPanel setId={growth.id} setNumber={growth.number} dayOfAge={growth.dayOfAge} running named /> : null}
          </div>
          <Panel title="Needs doing today" className="self-start">
            <TaskList tasks={data.tasks} />
          </Panel>
        </div>
      )}
    </>
  );
}
