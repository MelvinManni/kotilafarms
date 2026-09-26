// Headline numbers across all Sets for the Sets page
import type { SetSummary } from "@/types/sets";

export function setsOverview(sets: SetSummary[]) {
  const running = sets.filter((s) => s.status !== "closed");
  const closed = sets.filter((s) => s.status === "closed");
  const withMargin = closed.filter((s) => s.money?.margin !== null && s.money?.margin !== undefined);
  const best = withMargin.sort((a, b) => b.money!.margin! - a.money!.margin!)[0];
  return {
    liveBirds: running.reduce((n, s) => n + s.liveBirds, 0),
    runningNumbers: running.map((s) => s.number).sort((a, b) => a - b),
    birdsSold: sets.reduce((n, s) => n + s.birdsSold, 0),
    closedProfit: closed.some((s) => s.money) ? closed.reduce((n, s) => n + (s.money?.profit ?? 0), 0) : null,
    best: best ? { number: best.number, margin: best.money!.margin!, intake: best.intake } : null,
  };
}
