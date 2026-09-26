// A big green button per running Set to log today (Today and /log)
import Link from "next/link";
import { Icon } from "@/svgs/icon";
import type { SetSummary } from "@/types/sets";

export function LogTodayLinks({ sets, today, loggedToday = [] }: { sets: SetSummary[]; today: string; loggedToday?: string[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {sets.map((s) => {
        const done = loggedToday.includes(s.id);
        return (
          <Link
            key={s.id}
            href={`/log/${s.id}/${today}`}
            className={`flex h-19 items-center gap-3.5 rounded-lg pr-4.5 pl-5 no-underline outline-none focus-visible:shadow-focus ${done ? "border border-line bg-surface text-ink" : "bg-green-600 text-white shadow-primary"}`}
          >
            <span className="flex grow flex-col gap-0.5">
              <strong className="text-[19px]">Set {s.number} · day {s.dayOfAge}</strong>
              <span className={`text-sm ${done ? "text-ink-muted" : "text-green-100"}`}>{done ? "Logged today — open to change it" : s.status === "brooding" ? "Brooding — add temperature too" : "Deaths, feed, water, notes"}</span>
            </span>
            <span className={`flex size-11 items-center justify-center rounded-full ${done ? "bg-green-50 text-green-700" : "bg-white/18"}`}>
              <Icon name={done ? "check" : "chevron-right"} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
