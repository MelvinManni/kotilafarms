// "Set 3", "Sets 1–3", "Sets 1, 3 and 5"
export function setNames(numbers: number[]): string {
  const n = [...numbers].sort((a, b) => a - b);
  if (n.length === 1) return `Set ${n[0]}`;
  const run = n.every((x, i) => i === 0 || x === n[i - 1]! + 1);
  return run ? `Sets ${n[0]}–${n.at(-1)}` : `Sets ${n.slice(0, -1).join(", ")} and ${n.at(-1)}`;
}
