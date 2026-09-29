// Sets on a phone: one tappable row per Set with its stage, birds and mortality
import Link from "next/link";
import { StatusChip } from "@/components/kotila/status-chip";
import { Icon } from "@/svgs/icon";
import type { SetSummary } from "@/types/sets";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";

export function SetCards({ sets }: { sets: SetSummary[] }) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {sets.map((s) => {
        const closed = s.status === "closed";
        return (
          <li key={s.id} className="border-t border-line-soft first:border-t-0">
            <Link href={`/sets/${s.id}`} className="flex items-center gap-3 px-5 py-4 text-ink no-underline outline-none focus-visible:bg-row-hover">
              <div className="flex min-w-0 grow flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="font-display text-[19px] font-semibold">Set {s.number}</strong>
                  {s.pen ? <span className="text-body text-ink-muted">· {s.pen}</span> : null}
                  <StatusChip status={s.status} day={closed ? undefined : s.dayOfAge} />
                </div>
                <span className="text-body text-ink-2 tabular-nums">
                  {closed ? `${count(s.birdsSold)} sold` : `${count(s.liveBirds)} live`} of {count(s.intake)} · {pct(s.mortalityRate)} died
                  {s.money && closed ? ` · ${naira(s.money.profit)} profit` : ""}
                </span>
              </div>
              <Icon name="chevron-right" size={20} className="shrink-0 text-ink-faint" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
