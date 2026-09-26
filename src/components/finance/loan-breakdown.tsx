// One loan's interest as three separate numbers: gross, withholding tax, net — and what is paid
import { Rows } from "@/components/kotila/rows";
import type { LoanRow } from "@/types/capital";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import { shortDate } from "@/utils/format/dates";

export function LoanBreakdown({ loan: l }: { loan: LoanRow }) {
  const i = l.interest;
  const days = `${i.days} ${i.days === 1 ? "day" : "days"}`;
  return l.repaidOn ? (
    <Rows items={[
      { label: `Principal, lent ${shortDate(l.advancedOn, false)}, repaid ${shortDate(l.repaidOn, false)}`, value: naira(l.amount) },
      { label: `Interest at ${pct(l.rate, 0)} for ${days} (gross)`, value: naira(i.gross) },
      { label: `Withholding tax (${pct(l.whtRate, 0)})`, value: naira(-i.withholdingTax) },
      { label: `Net interest to ${l.lender.name}`, value: naira(i.net) },
      { label: `Paid to ${l.lender.name}`, value: naira(l.amount + i.net), total: true },
    ]} />
  ) : (
    <Rows items={[
      { label: `Interest at ${pct(l.rate, 0)} for ${days} (gross)`, value: naira(i.gross) },
      { label: `Withholding tax (${pct(l.whtRate, 0)})`, value: naira(-i.withholdingTax) },
      { label: "Net interest so far", value: naira(i.net), total: true },
    ]} />
  );
}
