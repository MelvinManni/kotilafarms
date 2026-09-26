// Weight sample stats from each bird's weight in grams
export function averageWeight(grams: number[]): number {
  return grams.length ? grams.reduce((a, b) => a + b, 0) / grams.length : Number.NaN;
}

// Coefficient of variation = standard deviation ÷ mean (population)
export function coefficientOfVariation(grams: number[]): number {
  const mean = averageWeight(grams);
  if (!grams.length || !mean) return Number.NaN;
  const variance = grams.reduce((sum, g) => sum + (g - mean) ** 2, 0) / grams.length;
  return Math.sqrt(variance) / mean;
}

// Uniformity = share of birds within ±10% of the sample mean
export function uniformity(grams: number[], band = 0.1): number {
  const mean = averageWeight(grams);
  if (!grams.length) return Number.NaN;
  return grams.filter((g) => Math.abs(g - mean) <= mean * band).length / grams.length;
}

// The farm asks for at least 10 birds; fewer is allowed with a warning
export const MIN_SAMPLE_BIRDS = 10;
