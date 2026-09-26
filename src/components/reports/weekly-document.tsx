// The weekly review: one note per running Set, and how the notes are written (screen and PDF)
import { Panel } from "@/components/kotila/panel";
import { EmptyState } from "@/components/kotila/empty-state";
import { WeeklySetCard } from "@/components/reports/weekly-set-card";
import { WEEKLY_HOW } from "@/constants/weekly-how";
import type { WeeklyPayload } from "@/types/weekly";
import { farmDay, weekSpan } from "@/utils/format/dates";


export function WeeklyDocument({ w }: { w: WeeklyPayload }) {
  return (
    <div className="flex flex-col gap-5">
      <p className="m-0 text-sm font-medium text-ink-muted">Week of {weekSpan(w.week.start, w.week.end)} · written {farmDay(w.written)}</p>
      {w.sets.length ? w.sets.map((s) => <WeeklySetCard key={s.id} s={s} />) : <EmptyState title="No Sets running that week" icon="reports">A note is written for every Set running in the week. Pick another week, or start a Set.</EmptyState>}
      <Panel title="How reviews are written" variant="sunken" className="break-inside-avoid">
        <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-body text-ink-2">
          {WEEKLY_HOW.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </Panel>
    </div>
  );
}
