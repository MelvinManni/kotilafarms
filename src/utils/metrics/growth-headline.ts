// The finding a growth panel leads with, and what to do about it
import type { GrowthSummary } from "@/utils/metrics/growth-summary";

const points = (gap: number) => Math.round(Math.abs(gap) * 100);

export function growthHeadline(g: GrowthSummary, setNumber?: number): { title: string; subtitle: string } {
  const who = setNumber === undefined ? "" : `Set ${setNumber} is `;
  const was = g.previous ? `It was ${points(g.previous.gap)}% ${g.previous.gap < 0 ? "under" : "over"} at day ${g.previous.day}. ` : "";
  if (Math.abs(g.gap) <= 0.05)
    return { title: `${who || "Growing "}on the standard at day ${g.day}`.replace(/^./, (c) => c.toUpperCase()), subtitle: `${was}Within 5% of the breed standard. Keep feed and water steady.` };
  if (g.gap > 0) return { title: `${who}${points(g.gap)}% over the standard at day ${g.day}`.replace(/^./, (c) => c.toUpperCase()), subtitle: `${was}Growing well. Keep feed and water steady.` };
  const trend = g.trend === "widening" ? (setNumber === undefined ? ", and the gap is widening" : " — and the gap is widening") : g.trend === "closing" ? ", but the gap is closing" : "";
  const title = `${who}${points(g.gap)}% under weight at day ${g.day}${trend}`;
  const act = g.late ? "After day 28 it is hard to recover. Plan sale weights around it." : "Check feeder space and finisher intake this week, while there is still time to close it.";
  return { title: title.replace(/^./, (c) => c.toUpperCase()), subtitle: `${was}${act}` };
}
