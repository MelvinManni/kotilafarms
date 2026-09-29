// Activity lines: when, who, what they did, and why when they said
import { Person } from "@/components/kotila/person";
import type { ActivityItem } from "@/types/activity";
import { todayInZone } from "@/utils/dates/today-in-zone";
import { clockTime, shortDate } from "@/utils/format/dates";
import type { Role } from "@/types/role";

const when = (at: string) => `${shortDate(todayInZone("Africa/Lagos", new Date(at)), false)}, ${clockTime(at)}`;

export function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {items.map((item) => (
        <li key={item.id} className="flex flex-col gap-2 border-t border-line px-6 py-4 first:border-t-0 sm:flex-row sm:items-start sm:gap-5">
          <time dateTime={item.at} className="w-32 shrink-0 text-sm font-medium text-ink-muted tabular-nums sm:pt-2.5">{when(item.at)}</time>
          <div className="w-44 shrink-0">{item.who ? <Person name={item.who} role={(item.role ?? undefined) as Role | undefined} size="sm" /> : <span className="text-body text-ink-muted">Not signed in</span>}</div>
          <div className="flex min-w-0 grow flex-col gap-1 sm:pt-2">
            <p className="m-0 text-body text-ink">{item.who && !item.text.startsWith("Someone") ? `${item.who.split(" ")[0]} ${item.text}` : item.text}</p>
            {item.reason ? <p className="m-0 text-sm text-ink-muted">Why: {item.reason}</p> : null}
            {item.ip ? <p className="m-0 text-sm text-ink-muted">From {item.ip}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
