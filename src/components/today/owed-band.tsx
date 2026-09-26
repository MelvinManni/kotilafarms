// Money owed to the farm, with the two biggest balances — the first thing an owner sees when anything is unpaid
import { OwedNotice } from "@/components/sales/owed-notice";
import type { Outstanding } from "@/types/sale";
import { naira } from "@/utils/format/naira";

export function OwedBand({ owed }: { owed: Outstanding }) {
  if (!owed.rows.length) return null;
  const biggest = [...owed.rows].sort((a, b) => b.balance - a.balance).slice(0, 3);
  return (
    <div className="flex flex-col gap-2">
      <OwedNotice owed={owed} action={{ label: "See balances", href: "/sales" }} />
      <div className="flex flex-wrap gap-x-6 gap-y-1 px-2 text-sm text-ink-2 max-lg:text-white">
        {biggest.map((s) => (
          <span key={s.id}>
            {s.buyer.name} <strong className="tabular-nums">{naira(s.balance)}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
