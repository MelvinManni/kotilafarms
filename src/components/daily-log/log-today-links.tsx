// A big green button per running Set to log today (Today and /log)
import { SetActionLink } from "@/components/kotila/set-action-link";
import type { SetSummary } from "@/types/sets";

export function LogTodayLinks({ sets, today, loggedToday = [] }: { sets: SetSummary[]; today: string; loggedToday?: string[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {sets.map((s) => {
        const done = loggedToday.includes(s.id);
        const detail = done ? "Logged today — open to change it" : s.status === "brooding" ? "Brooding — add temperature too" : "Deaths, feed, water, notes";
        return <SetActionLink key={s.id} href={`/log/${s.id}/${today}`} title={`Set ${s.number} · day ${s.dayOfAge}`} detail={detail} done={done} />;
      })}
    </div>
  );
}
