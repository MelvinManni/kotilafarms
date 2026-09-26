// One Set's weekly note: who, the finding, figures and points to act on — or one line when all is well
import { Panel } from "@/components/kotila/panel";
import { StatusChip } from "@/components/kotila/status-chip";
import { WeeklyFigures } from "@/components/reports/weekly-figures";
import type { WeeklySet } from "@/types/weekly";
import { count } from "@/utils/format/count";

export function WeeklySetCard({ s }: { s: WeeklySet }) {
  const r = s.review;
  return (
    <Panel ariaLabel={`Set ${s.number} review`} className="break-inside-avoid">
      <div className="flex flex-wrap items-center gap-3">
        <strong className="font-display text-[17px] font-semibold">Set {s.number} · day {s.facts.day}</strong>
        <StatusChip status={s.status} />
        <span className="text-sm text-ink-muted">{s.pen ? `${s.pen} · ` : ""}{count(s.facts.live)} live of {count(s.intake)}</span>
      </div>
      <h2 className="m-0 font-display text-[22px] leading-7 font-semibold text-ink">{r.title}</h2>
      {r.points.length ? (
        <>
          {s.facts.weight || s.facts.deaths.week ? <WeeklyFigures f={s.facts} /> : null}
          <ol className="m-0 flex list-decimal flex-col gap-3 pl-5 text-body text-ink-2 marker:font-bold marker:text-ink">
            {r.points.map((p) => (
              <li key={p.problem} className="pl-1">
                {p.text} <strong className="text-ink">Do this:</strong> {p.action}
              </li>
            ))}
          </ol>
        </>
      ) : (
        <p className="m-0 text-body text-ink-2">{r.allWell}</p>
      )}
    </Panel>
  );
}
