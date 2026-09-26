// Set 3's performance: 465 birds at 2.46 kg, FCR 1.74, ₦1,806 feed per kg live weight
import { describe, expect, it } from "vitest";
import { setPerformance } from "@/utils/metrics/set-performance";

describe("setPerformance", () => {
  it("reproduces Set 3", () => {
    const p = setPerformance({ feedKg: 1_990, birdsSold: 465, liveBirds: 0, averageGrams: 2_460, feedSpend: 2_066_412, closed: true });
    expect(p.liveKg).toBeCloseTo(1_143.9, 1);
    expect(p.fcr!.toFixed(2)).toBe("1.74");
    expect(p.feedCostPerKg).toBe(1_806);
  });

  it("counts live birds on a running Set, and says nothing without a weighing", () => {
    expect(setPerformance({ feedKg: 500, birdsSold: 0, liveBirds: 482, averageGrams: 1_030, feedSpend: 400_000, closed: false }).liveKg).toBeCloseTo(496.46, 2);
    expect(setPerformance({ feedKg: 0, birdsSold: 0, liveBirds: 482, averageGrams: 1_030, feedSpend: 0, closed: false }).feedCostPerKg).toBeNull();
    expect(setPerformance({ feedKg: 500, birdsSold: 0, liveBirds: 482, averageGrams: null, feedSpend: 1, closed: false })).toEqual({ liveKg: null, fcr: null, feedCostPerKg: null });
  });
});
