"use client";
// Weights panel: a box per bird, and one input where Enter adds the next bird
import { useState } from "react";
import { Panel } from "@/components/kotila/panel";
import { WeightChip } from "@/components/weights/weight-chip";
import { parseGrams } from "@/schemas/weight";
import { cn } from "@/utils/cn";

export type Bird = { key: number; grams: number };

type WeightEntryProps = { birds: Bird[]; onChange: (birds: Bird[]) => void; disabled?: boolean };

export function WeightEntry({ birds, onChange, disabled }: WeightEntryProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    if (text.trim() === "") return;
    const parsed = parseGrams(text);
    if ("error" in parsed) return setError(parsed.error);
    onChange([...birds, { key: Math.max(0, ...birds.map((b) => b.key)) + 1, grams: parsed.grams }]);
    setText("");
    setError(null);
  };

  const change = (key: number, grams: number | null) => onChange(grams === null ? birds.filter((b) => b.key !== key) : birds.map((b) => (b.key === key ? { key, grams } : b)));

  return (
    <Panel variant="raised" title="Weights" subtitle="In grams, one bird at a time">
      <div className="grid grid-cols-4 gap-2">
        {birds.map((b, i) => (
          <WeightChip key={b.key} grams={b.grams} position={i + 1} onChange={(g) => change(b.key, g)} />
        ))}
        <input
          type="text"
          inputMode="numeric"
          enterKeyHint="next"
          placeholder="Add weight (g)"
          aria-label="Add weight in grams"
          aria-invalid={Boolean(error)}
          aria-describedby="weight-help"
          disabled={disabled}
          value={text}
          onChange={(e) => (setText(e.target.value), setError(null))}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            add();
          }}
          onBlur={add}
          className="col-span-2 h-11 min-w-0 rounded-md border-[1.5px] border-green-600 bg-surface px-3 text-base font-medium text-ink tabular-nums shadow-focus outline-none placeholder:text-ink-faint aria-invalid:border-alert"
        />
      </div>
      <span id="weight-help" role={error ? "alert" : undefined} className={cn("text-caption font-medium", error ? "text-alert" : "text-ink-muted")}>
        {error ?? "Tap a weight to change it. Scale reads in grams — type the number only."}
      </span>
    </Panel>
  );
}
