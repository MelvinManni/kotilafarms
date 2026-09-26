"use client";
// Pick the Sets to compare: one list per Set, a Set picked in one list leaves the others; at least two
import { Button } from "@/components/kotila/button";
import { IconButton } from "@/components/kotila/icon-button";
import { Select } from "@/components/kotila/fields/select";
import type { SetSummary } from "@/types/sets";
import { shortDate } from "@/utils/format/dates";
import { compareOptionLabel } from "@/utils/format/compare-value";

const ORDINAL = ["First Set", "Second Set", "Third Set", "Fourth Set", "Fifth Set", "Sixth Set", "Seventh Set", "Eighth Set", "Ninth Set", "Tenth Set"];

type Props = { sets: SetSummary[]; picked: string[]; onChange: (ids: string[]) => void };

export function CompareSlots({ sets, picked, onChange }: Props) {
  const left = sets.filter((s) => !picked.includes(s.id));
  const label = (s: SetSummary) => compareOptionLabel(s, s.closedOn ? `Closed ${shortDate(s.closedOn, false)}` : "Closed");
  return (
    <div className="flex flex-wrap items-end gap-3">
      {picked.map((id, i) => {
        const set = sets.find((s) => s.id === id);
        const options = sets.filter((s) => s.id === id || !picked.includes(s.id)).map((s) => ({ value: s.id, label: label(s) }));
        return (
          <div key={`${i}-${id}`} className="flex items-end gap-1.5">
            <div className="w-72">
              <Select label={ORDINAL[i]} options={options} value={id} onChange={(v) => onChange(picked.map((p, j) => (j === i ? v : p)))} />
            </div>
            {i >= 2 ? <IconButton icon="x" label={`Remove ${set ? `Set ${set.number}` : "this Set"} from the comparison`} onClick={() => onChange(picked.filter((_, j) => j !== i))} /> : null}
          </div>
        );
      })}
      {left.length ? <Button icon="plus" size="lg" onClick={() => onChange([...picked, left[0]!.id])}>Add a Set</Button> : null}
    </div>
  );
}
