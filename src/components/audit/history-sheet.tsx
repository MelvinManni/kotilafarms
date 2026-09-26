"use client";
// Edit history for any record: who, when, which field, old (struck) → new, and why
import { AuditTrail } from "@/components/kotila/audit-trail";
import { Button } from "@/components/kotila/button";
import { Notice } from "@/components/kotila/notice";
import { Sheet } from "@/components/kotila/sheet";
import { useAuditTrail } from "@/hooks/queries/use-audit-trail";
import { auditFieldLabel, auditValue } from "@/utils/format/audit-value";
import { clockTime, farmDay } from "@/utils/format/dates";
import { todayInZone } from "@/utils/dates/today-in-zone";

const when = (iso: string) => `${farmDay(todayInZone("Africa/Lagos", new Date(iso)))}, ${clockTime(iso)}`;

const ACTIONS = { create: "entered this", update: "changed", delete: "removed this", resolve: "settled a conflict on this" };

type HistorySheetProps = { table: string; rowId: string; title: string; description?: string; onClose: () => void };

export function HistorySheet({ table, rowId, title, description, onClose }: HistorySheetProps) {
  const trail = useAuditTrail(table, rowId);
  const entries = (trail.data ?? []).map((e) => ({
    who: e.who,
    role: e.role,
    when: when(e.at),
    action: ACTIONS[e.action],
    field: e.field ? auditFieldLabel(e.field) : undefined,
    from: e.action === "update" && e.field ? auditValue(e.field, e.from) : undefined,
    to: e.action === "update" && e.field ? auditValue(e.field, e.to) : undefined,
    note: e.reason ?? undefined,
    device: e.enteredOfflineAt ? `entered offline ${when(e.enteredOfflineAt)}` : undefined,
  }));
  return (
    <Sheet wide title={title} description={description} onClose={onClose} footer={<Button onClick={onClose}>Close</Button>}>
      {trail.isPending ? <p className="m-0 text-body text-ink-muted">Loading the history…</p> : null}
      {trail.isError ? <Notice tone="alert" compact>{trail.error.message}</Notice> : null}
      {trail.data ? <AuditTrail entries={entries} /> : null}
      <Notice compact>Changing a count after the day needs a reason. The old value is kept here.</Notice>
    </Sheet>
  );
}
