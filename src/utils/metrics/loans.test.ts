// Shareholder loan interest: the two examples in docs/12-seed-data.md
import { describe, expect, it } from "vitest";
import { borrowingCapacity, loanInterest } from "@/utils/metrics/loans";

describe("loanInterest", () => {
  it("Emeka: ₦250,000 for 91 days → gross ₦9,973, WHT ₦997, net ₦8,976", () => {
    expect(loanInterest(250_000, "2026-06-15", "2026-09-14")).toEqual({ days: 91, gross: 9_973, withholdingTax: 997, net: 8_976 });
  });

  it("Kosi: ₦500,000 for 24 days to 26 Sep → gross ₦5,260, WHT ₦526, net ₦4,734", () => {
    expect(loanInterest(500_000, "2026-09-02", "2026-09-26")).toEqual({ days: 24, gross: 5_260, withholdingTax: 526, net: 4_734 });
  });

  it("charges nothing on the day it is advanced", () => {
    expect(loanInterest(500_000, "2026-09-02", "2026-09-02").gross).toBe(0);
  });
});

describe("borrowingCapacity", () => {
  it("₦500,000 owed against ₦2,810,000 equity is inside a 50% cap", () => {
    const b = borrowingCapacity(500_000, 2_810_000, 0.5);
    expect(b.cap).toBe(1_405_000);
    expect(b.headroom).toBe(905_000);
    expect(b.overCap).toBe(false);
    expect(b.ratio).toBeCloseTo(0.178, 3);
  });
});
