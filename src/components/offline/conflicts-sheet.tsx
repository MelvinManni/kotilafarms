"use client";
// Managers settle a day logged twice: both versions side by side, keep one (never merged)
import { Button } from "@/components/kotila/button";
import { EmptyState } from "@/components/kotila/empty-state";
import { Notice } from "@/components/kotila/notice";
import { Rows } from "@/components/kotila/rows";
import { Sheet } from "@/components/kotila/sheet";
import { tagLabel } from "@/constants/observation-tags";
import { useConflicts, useResolveConflict } from "@/hooks/queries/use-conflicts";
import type { LogVersion } from "@/types/conflict";
import { farmDay } from "@/utils/format/dates";

const rows = (v: LogVersion) => [
  { label: "Deaths", value: String(v.deaths) },
  { label: "Feed used", value: v.feedQty === null ? "—" : `${v.feedQty} ${v.feedUnit}` },
  { label: "Water", value: v.waterLevel ?? "—" },
  { label: "Seen in the pen", value: v.tags.length ? v.tags.map(tagLabel).join(", ") : "—" },
  { label: "Note", value: v.note ?? "—" },
];

export function ConflictsSheet({ onClose }: { onClose: () => void }) {
  const conflicts = useConflicts(true);
  const resolve = useResolveConflict();
  return (
    <Sheet wide title="Days logged twice" description="Two people logged the same Set and day. Keep one version — counts are never added together." onClose={onClose} footer={<Button onClick={onClose}>Close</Button>}>
      {resolve.error ? <Notice tone="alert" compact>{resolve.error.message}</Notice> : null}
      {conflicts.data?.length === 0 ? <EmptyState title="Nothing to settle" icon="check">Every day has one log.</EmptyState> : null}
      {conflicts.data?.map((c) => (
        <section key={c.id} className="flex flex-col gap-3 rounded-lg border border-line p-4">
          <strong className="font-display text-title font-semibold">Set {c.setNumber} · {farmDay(c.date)}</strong>
          <div className="grid gap-4 sm:grid-cols-2">
            {([["existing", c.existing, "Logged first"], ["incoming", c.incoming, "From the phone"]] as const).map(([keep, v, label]) => (
              <div key={keep} className="flex flex-col gap-3 rounded-md bg-surface-sunken p-3">
                <span className="text-caption font-semibold text-ink-muted">{label} · {v.by}</span>
                <Rows items={rows(v)} />
                <Button variant={keep === "existing" ? "secondary" : "outline"} disabled={resolve.isPending} onClick={() => resolve.mutate({ id: c.id, keep })}>
                  Keep {v.by.split(" ")[0]}’s
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </Sheet>
  );
}
