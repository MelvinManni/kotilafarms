// Growth maths shared by the growth chart, Set detail and reports (unit-agnostic: g or kg)
export type CurvePoint = { day: number; weight: number };

// Standard weight at a day of age, straight-line between curve points
export function interpolateStandard(curve: CurvePoint[], day: number): number {
  if (curve.length === 0) return Number.NaN;
  if (day <= curve[0]!.day) return curve[0]!.weight;
  for (let i = 1; i < curve.length; i++) {
    const a = curve[i - 1]!;
    const b = curve[i]!;
    if (day <= b.day) return a.weight + ((b.weight - a.weight) * (day - a.day)) / (b.day - a.day);
  }
  return curve[curve.length - 1]!.weight;
}

// Average daily gain = (current avg − previous avg) ÷ days between samples
export function averageDailyGain(previous: CurvePoint, current: CurvePoint): number {
  const days = current.day - previous.day;
  return days > 0 ? (current.weight - previous.weight) / days : Number.NaN;
}

// Weight at a later day if the latest daily gain holds
export function projectWeight(previous: CurvePoint, current: CurvePoint, toDay: number): number {
  return current.weight + averageDailyGain(previous, current) * (toDay - current.day);
}

// Gap to standard = actual ÷ standard − 1 (−0.104 means 10.4% under)
export function gapToStandard(actual: number, standard: number): number {
  return standard > 0 ? actual / standard - 1 : Number.NaN;
}
