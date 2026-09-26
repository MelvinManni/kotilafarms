// Likely-repeat weight samples: same day, same weights in any order
import { describe, expect, it } from "vitest";
import { findRepeat } from "@/utils/metrics/find-repeat";

const saved = [{ date: "2026-09-26", weightsGrams: [1000, 980, 1020], by: "Chinedu", count: 3 }];

describe("findRepeat", () => {
  it("finds the same weights on the same day, in any order", () => {
    expect(findRepeat(saved, "2026-09-26", [1020, 1000, 980])?.by).toBe("Chinedu");
  });
  it("ignores other days, other weights and an empty sample", () => {
    expect(findRepeat(saved, "2026-09-25", [1000, 980, 1020])).toBeNull();
    expect(findRepeat(saved, "2026-09-26", [1000, 980])).toBeNull();
    expect(findRepeat(saved, "2026-09-26", [])).toBeNull();
  });
});
