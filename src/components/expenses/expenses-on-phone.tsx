"use client";
// Expenses saved on this phone that haven't reached the farm records yet
import { Panel } from "@/components/kotila/panel";
import { Tag } from "@/components/kotila/tag";
import { unsent, useOutboxItems } from "@/hooks/use-outbox-items";
import { useCurrentUser } from "@/lib/auth/current-user";
import { farmDay } from "@/utils/format/dates";
import { naira } from "@/utils/format/naira";

export function ExpensesOnPhone() {
  const items = unsent(useOutboxItems(useCurrentUser().id)).filter((i) => i.type === "expense.create");
  if (!items.length) return null;
  return (
    <Panel title="On this phone" subtitle="Saved here. They send by themselves when there's signal.">
      {items.map((i) => (
        <div key={i.mutationId} className="flex items-center justify-between gap-3 border-t border-line-soft py-2.5 first:border-t-0">
          <span className="flex flex-col">
            <strong className="text-body">{String(i.payload.description)}</strong>
            <span className="text-caption text-ink-muted">{farmDay(String(i.payload.date))}</span>
          </span>
          <span className="flex items-center gap-3">
            <strong className="tabular-nums">{naira(Number(i.payload.amount))}</strong>
            <Tag dot tone="warning">On this phone</Tag>
          </span>
        </div>
      ))}
    </Panel>
  );
}
