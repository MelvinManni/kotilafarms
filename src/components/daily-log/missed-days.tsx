// "Set 5 has no log for Friday" with a button to fill it in (one notice per missed day, most recent first)
import { Notice } from "@/components/kotila/notice";
import { farmDay } from "@/utils/format/dates";

const weekday = (d: string) => new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

export function MissedDays({ setId, setNumber, days, limit = 3 }: { setId: string; setNumber: number; days: string[]; limit?: number }) {
  const recent = [...days].reverse().slice(0, limit);
  return (
    <>
      {recent.map((d) => (
        <Notice key={d} tone="warning" icon="calendar-x" title={`Set ${setNumber} has no log for ${weekday(d)}, ${farmDay(d).slice(4)}`} action={{ label: `Fill in ${weekday(d)}`, href: `/log/${setId}/${d}`, variant: "outline" }}>
          Fill it in now so the week has no gap. Guess if you must — a count is better than nothing.
        </Notice>
      ))}
      {days.length > recent.length ? <p className="m-0 text-caption text-ink-muted">{days.length - recent.length} more missed {days.length - recent.length === 1 ? "day" : "days"} earlier — see the Set’s daily log.</p> : null}
    </>
  );
}
