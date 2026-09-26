// Share of spend that went to one category (0.64 = 64%)
export function categoryShare(byCategory: { label: string; value: number }[], label: string): number | null {
  const total = byCategory.reduce((n, c) => n + c.value, 0);
  const part = byCategory.find((c) => c.label === label)?.value ?? 0;
  return total > 0 ? part / total : null;
}

// Spend per bird started, whole naira
export function perBirdStarted(spend: number, intake: number): number | null {
  return intake > 0 ? Math.round(spend / intake) : null;
}
