// "₦412,000 is owed by 3 buyers" with the oldest balance; first thing an owner sees when anything is unpaid
import { Notice } from "@/components/kotila/notice";
import type { ActionObject } from "@/types/action";
import type { Outstanding } from "@/types/sale";
import { naira } from "@/utils/format/naira";

export function OwedNotice({ owed, action }: { owed: Outstanding; action?: ActionObject }) {
  const oldest = owed.rows[0];
  if (!oldest) return null;
  return (
    <Notice tone="owed" title={`${naira(owed.total.balance)} is owed by ${owed.buyers} ${owed.buyers === 1 ? "buyer" : "buyers"}`} action={action}>
      Oldest: {oldest.buyer.name}, {naira(oldest.balance)} for {oldest.birds} birds from Set {oldest.set.number} — {oldest.daysOwed} {oldest.daysOwed === 1 ? "day" : "days"} unpaid
    </Notice>
  );
}
