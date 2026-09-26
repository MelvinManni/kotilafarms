// Comparing Sets 1–3 and a running Set 4 (design: CompareSets)
import { describe, expect, it } from "vitest";
import type { CompareRow } from "@/types/compare";
import { bestIn, COMPARE_METRICS, compareFindings } from "@/utils/metrics/compare";

const row = (n: number, over: Partial<CompareRow>): CompareRow => ({ id: `s${n}`, number: n, status: "closed", closed: true, closedOn: "2026-01-01", dayOfAge: 42, intake: 500, deaths: 0, sold: 0, fcr: null, weightAtSale: null, costPerBirdSold: null, revenuePerBird: null, marginPerBird: null, margin: null, feedShare: null, profit: null, ...over });
const s1 = row(1, { intake: 200, deaths: 19, sold: 181, fcr: 1.88, weightAtSale: 2_210, revenuePerBird: 7_123, margin: 0.0721, profit: 92_900 });
const s2 = row(2, { intake: 300, deaths: 19, sold: 281, fcr: 1.69, weightAtSale: 2_380, revenuePerBird: 7_400, margin: 0.1765, profit: 367_000 });
const s3 = row(3, { intake: 500, deaths: 35, sold: 465, fcr: 1.74, weightAtSale: 2_460, revenuePerBird: 7_629, margin: 0.1596, profit: 568_750 });
const s4 = row(4, { status: "growing", closed: false, closedOn: null, dayOfAge: 24, deaths: 18, fcr: 1.61 });

const metric = (key: string) => COMPARE_METRICS.find((m) => m.key === key)!;

describe("compare", () => {
  it("names the best Set per row, counting running Sets only for mortality", () => {
    expect(bestIn(metric("fcr"), [s1, s2, s3, s4])?.number).toBe(2);
    expect(bestIn(metric("mortality"), [s1, s2, s3, s4])?.number).toBe(4);
    expect(bestIn(metric("margin"), [s3, s4])).toBeNull();
    expect(bestIn(metric("intake"), [s1, s2])).toBeNull();
    expect(bestIn(metric("mortality"), [row(7, { deaths: 0 }), row(8, { deaths: 0 })])).toBeNull();
  });

  it("writes the three findings", () => {
    const [f1, f2, f3] = compareFindings([s1, s2, s3]);
    expect(f1!.title).toBe("Set 2 has the lowest mortality, 6.3%");
    expect(f2!.title).toBe("Set 2 made the best margin, 17.65%");
    expect(f3!.title).toBe("Revenue per bird is up ₦506 from Set 1 to Set 3");
    expect(compareFindings([s4, row(5, { closed: false, status: "brooding" })])[1]!.title).toBe("No closed Set picked yet");
    expect(compareFindings([row(7, {}), row(8, {})])[0]!.title).toBe("Sets 7–8 share the lowest mortality, 0.0%");
  });
});
