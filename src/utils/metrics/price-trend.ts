// Price per bag over time: the latest price, the last move, and the change across the window
export type PricePoint = { date: string; pricePerBag: number };

export type PriceTrend = { latest: PricePoint; previous: PricePoint | null; lastMove: number; sinceFirst: number; first: PricePoint; latestMoveBiggest: boolean };

// Uses the last `window` purchases, oldest first
export function priceTrend(points: PricePoint[], window = 6): PriceTrend | null {
  const recent = [...points].sort((a, b) => a.date.localeCompare(b.date)).slice(-window);
  const latest = recent.at(-1);
  if (!latest) return null;
  const previous = recent.at(-2) ?? null;
  const moves = recent.slice(1).map((p, i) => p.pricePerBag - recent[i]!.pricePerBag);
  const lastMove = previous ? latest.pricePerBag - previous.pricePerBag : 0;
  return { latest, previous, lastMove, first: recent[0]!, sinceFirst: latest.pricePerBag - recent[0]!.pricePerBag, latestMoveBiggest: moves.length > 1 && lastMove > 0 && lastMove >= Math.max(...moves) };
}

// Ids of each feed's latest purchase when it cost more a bag than the one before (newest-first list)
export function latestRises(purchases: { id: string; feedTypeId: string; pricePerBag: number }[]): Set<string> {
  const latest = new Map<string, { id: string; pricePerBag: number }>();
  const before = new Map<string, number>();
  for (const p of purchases) {
    if (!latest.has(p.feedTypeId)) latest.set(p.feedTypeId, p);
    else if (!before.has(p.feedTypeId)) before.set(p.feedTypeId, p.pricePerBag);
  }
  return new Set([...latest].filter(([type, l]) => l.pricePerBag > (before.get(type) ?? Infinity)).map(([, l]) => l.id));
}
