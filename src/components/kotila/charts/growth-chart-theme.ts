// Growth chart colours as Tailwind classes: deep (on green-900) or light (in a white panel)
export type ChartTheme = {
  grid: string; axis: string; label: string; text: string; ground: string; zone: string;
  actualStroke: string; actualFill: string; gapStroke: string; gapText: string; gapSub: string;
  band: string; standard: string; today: string; calloutBox: string; calloutTitle: string; calloutSub: string;
};

export const CHART_THEMES: Record<"deep" | "light", ChartTheme> = {
  deep: {
    grid: "stroke-white/9", axis: "stroke-white/28", label: "fill-[#b9d3a6]", text: "fill-white", ground: "fill-green-900",
    zone: "fill-white/[0.045]", actualStroke: "stroke-green-300", actualFill: "fill-green-300", gapStroke: "stroke-[#ffb38a]",
    gapText: "fill-[#ffb38a]", gapSub: "fill-[#ffd9c4]", band: "fill-yellow-500/14", standard: "stroke-yellow-500",
    today: "stroke-white/40", calloutBox: "fill-white", calloutTitle: "fill-ink", calloutSub: "fill-ink-muted",
  },
  light: {
    grid: "stroke-line-soft", axis: "stroke-line-strong", label: "fill-ink-muted", text: "fill-ink", ground: "fill-white",
    zone: "fill-surface-sunken", actualStroke: "stroke-green-600", actualFill: "fill-green-600", gapStroke: "stroke-alert",
    gapText: "fill-alert", gapSub: "fill-alert-ink", band: "fill-yellow-500/22", standard: "stroke-[#c99a00]",
    today: "stroke-ink-faint", calloutBox: "fill-ink", calloutTitle: "fill-white", calloutSub: "fill-on-deep-muted",
  },
};
