// Growth chart geometry: plot box and day/kg → x/y
export const CHART = { width: 940, height: 346, left: 48, top: 16, plotWidth: 860, plotHeight: 300 };

export type ChartScale = { x: (day: number) => number; y: (kg: number) => number; maxDay: number; maxKg: number };

export function chartScale(maxDay: number, maxKg: number): ChartScale {
  return {
    x: (day) => CHART.left + (day / maxDay) * CHART.plotWidth,
    y: (kg) => CHART.top + CHART.plotHeight - (kg / maxKg) * CHART.plotHeight,
    maxDay,
    maxKg,
  };
}
