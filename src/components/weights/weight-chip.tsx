"use client";
// One bird's weight; tap to change it, clear it to take it out
import { useState } from "react";
import { parseGrams } from "@/schemas/weight";
import { count } from "@/utils/format/count";
import { cn } from "@/utils/cn";

type WeightChipProps = { grams: number; position: number; onChange: (grams: number | null) => void };

const box = "flex h-11 min-w-0 items-center justify-end gap-0.75 rounded-md border-[1.5px] px-2.5 text-base font-semibold tabular-nums";

export function WeightChip({ grams, position, onChange }: WeightChipProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(String(grams));
  const [bad, setBad] = useState(false);

  const commit = () => {
    if (text.trim() === "") return onChange(null);
    const parsed = parseGrams(text);
    if ("error" in parsed) return setBad(true);
    setEditing(false);
    onChange(parsed.grams);
  };

  if (editing)
    return (
      <input
        autoFocus
        inputMode="numeric"
        aria-label={`Bird ${position} weight in grams`}
        aria-invalid={bad}
        value={text}
        onChange={(e) => (setText(e.target.value), setBad(false))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setText(String(grams));
            setEditing(false);
          }
        }}
        className={cn(box, "w-full border-green-600 bg-surface text-right shadow-focus outline-none aria-invalid:border-alert")}
      />
    );
  return (
    <button type="button" aria-label={`Bird ${position}: ${count(grams)} g. Tap to change`} onClick={() => (setText(String(grams)), setEditing(true))} className={cn(box, "border-line-strong bg-surface-sunken text-ink outline-none focus-visible:shadow-focus")}>
      <span>{count(grams)}</span>
      <span className="text-xs text-ink-muted">g</span>
    </button>
  );
}
