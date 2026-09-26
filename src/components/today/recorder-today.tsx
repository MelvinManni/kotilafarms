// Today for recorders (phone): missed days first, log today, the Sets' counts, and what's coming up
import { LogTodayLinks } from "@/components/daily-log/log-today-links";
import { MissedDaysAll } from "@/components/today/missed-days-all";
import { TaskList } from "@/components/today/task-list";
import { Delta } from "@/components/kotila/delta";
import { EmptyState } from "@/components/kotila/empty-state";
import { Figure } from "@/components/kotila/figure";
import { Panel } from "@/components/kotila/panel";
import { StatusChip } from "@/components/kotila/status-chip";
import { PageHeader } from "@/components/layout/page-header";
import { useOutboxItems } from "@/hooks/use-outbox-items";
import { useCurrentUser } from "@/lib/auth/current-user";
import type { TodayPayload } from "@/types/today";
import { count } from "@/utils/format/count";
import { fullDay } from "@/utils/format/dates";
import { pct } from "@/utils/format/percent";

export function RecorderToday({ data }: { data: TodayPayload }) {
  const coming = data.tasks.filter((t) => t.kind !== "log");
  // A log saved on this phone counts as done for today
  const onPhone = useOutboxItems(useCurrentUser().id).filter((i) => i.type === "dailyLog.upsert" && i.payload.date === data.date).map((i) => String(i.payload.setId));
  return (
    <>
      <PageHeader eyebrow={fullDay(data.date)} title="Today" />
      <MissedDaysAll missed={data.missed} />
      {data.sets.length === 0 ? (
        <EmptyState title="No Sets running" icon="log">When day-olds arrive, a manager starts a Set and you can log it from here.</EmptyState>
      ) : (
        <>
          <h2 className="m-0 mt-2 px-1 font-display text-title font-semibold">Log today</h2>
          <LogTodayLinks sets={data.sets} today={data.date} loggedToday={[...data.loggedToday, ...onPhone]} />
          <Panel flush>
            {data.sets.map((s) => (
              <div key={s.id} className="flex flex-col gap-3 border-t border-line-soft px-5 py-4 first:border-t-0">
                <div className="flex items-center justify-between gap-2">
                  <strong className="font-display text-[19px] font-semibold">
                    Set {s.number} {s.pen ? <span className="font-normal text-ink-muted">· {s.pen}</span> : null}
                  </strong>
                  <StatusChip status={s.status} day={s.dayOfAge} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Figure label="Live birds" value={count(s.liveBirds)} />
                  <Figure label="Mortality" value={pct(s.mortalityRate)} />
                </div>
                {s.trend.thisWeek > 0 ? (
                  <Delta direction={s.trend.thisWeek > s.trend.lastWeek ? "up" : "down"} goodWhen="down">{`${s.trend.thisWeek} deaths this week · ${s.trend.lastWeek} last week`}</Delta>
                ) : null}
              </div>
            ))}
          </Panel>
          <Panel title="Coming up">
            <TaskList tasks={coming} />
          </Panel>
        </>
      )}
    </>
  );
}
