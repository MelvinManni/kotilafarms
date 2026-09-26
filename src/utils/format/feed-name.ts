// "Finisher · Ultima" from a feed type
export function feedName(t: { kind: string; brand: string }): string {
  return `${t.kind[0]!.toUpperCase()}${t.kind.slice(1)} · ${t.brand}`;
}
