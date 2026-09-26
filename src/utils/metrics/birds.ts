// Bird counts: live birds and mortality rate
export function liveBirds(intake: number, deaths: number, sold: number): number {
  // Live birds = intake − deaths − sold
  return intake - deaths - sold;
}

// Mortality rate = cumulative deaths ÷ intake (0.07 = 7%)
export function mortalityRate(deaths: number, intake: number): number {
  return intake > 0 ? deaths / intake : Number.NaN;
}
