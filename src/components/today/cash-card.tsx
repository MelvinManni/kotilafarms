"use client";
// Today: what should be on hand since the last count, in and out, owed, and a link to reconcile
import { Figure } from "@/components/kotila/figure";
import { Panel } from "@/components/kotila/panel";
import { Rows } from "@/components/kotila/rows";
import { useCash } from "@/hooks/queries/use-finance";
import { useCurrentUser } from "@/lib/auth/current-user";
import { shortDate } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

export function CashCard() {
  const cash = useCash();
  // Only owners record a count
  const owner = useCurrentUser().role === "owner";
  const c = cash.data;
  if (!c) return null;
  const from = c.since?.date ?? c.firstRecord;
  return (
    <Panel title="Cash position" subtitle={from ? `Since ${shortDate(from, false)}` : "Nothing recorded yet"} action={{ label: owner ? "Reconcile cash" : "See finance", href: "/finance" }}>
      <Figure label="Should be on hand" value={naira(c.shouldBeOnHand)} size="lg" />
      <Rows items={[
        { label: "Money in", value: naira(c.moneyIn) },
        { label: "Money out", value: c.moneyOut ? naira(-c.moneyOut) : naira(0) },
        { label: "Owed to the farm", value: naira(c.owed.total), tone: c.owed.total ? "owed" : undefined },
      ]} />
    </Panel>
  );
}
