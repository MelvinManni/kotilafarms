// "Needs doing today" / "Coming up": one row per task, linking where it can be done
import Link from "next/link";
import { Icon } from "@/svgs/icon";
import type { IconName } from "@/svgs/icon-paths";
import type { TodayTask } from "@/types/today";
import { cn } from "@/utils/cn";

const ICONS: Record<TodayTask["kind"], IconName> = { log: "log", missed: "calendar-x", vaccine: "syringe", weigh: "scale", tag: "alert" };
const TONES = { alert: "bg-alert-bg text-alert", warning: "bg-warning-icon text-warning-ink", neutral: "bg-green-50 text-green-700" };

export function TaskList({ tasks }: { tasks: TodayTask[] }) {
  if (!tasks.length) return <p className="m-0 text-body text-ink-2">Nothing to worry about today.</p>;
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {tasks.map((t) => {
        const body = (
          <>
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", TONES[t.tone])}>
              <Icon name={ICONS[t.kind]} size={20} />
            </span>
            <span className="flex min-w-0 grow flex-col gap-0.5">
              <strong className="text-[15px] leading-5 text-ink">{t.title}</strong>
              <span className="text-caption text-ink-muted">{t.detail}</span>
            </span>
            {t.href ? <Icon name="chevron-right" size={18} className="shrink-0 text-ink-faint" /> : null}
          </>
        );
        return (
          <li key={`${t.title}|${t.detail}`} className="border-t border-line-soft first:border-t-0">
            {t.href ? (
              <Link href={t.href} className="flex items-center gap-3 py-3 no-underline outline-none focus-visible:shadow-focus">{body}</Link>
            ) : (
              <div className="flex items-center gap-3 py-3">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
