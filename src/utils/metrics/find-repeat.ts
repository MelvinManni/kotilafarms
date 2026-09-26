// A saved sample on the same day with the very same weights (any order) is likely a repeat
type Saved = { date: string; weightsGrams: number[]; by: string; count: number };

const key = (w: number[]) => [...w].sort((a, b) => a - b).join(",");

export function findRepeat<T extends Saved>(samples: T[], date: string, grams: number[]): T | null {
  if (grams.length === 0) return null;
  const k = key(grams);
  return samples.find((s) => s.date === date && key(s.weightsGrams) === k) ?? null;
}

export const weightsKey = key;
