// Tests for display formatting
import { describe, expect, it } from "vitest";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";
import { kg } from "@/utils/format/weight";
import { decimal } from "@/utils/format/decimal";
import { clockTime, farmDay, fullDay, longDate, shortDate } from "@/utils/format/dates";

describe("naira", () => {
  it("formats whole naira with separators", () => expect(naira(3563550)).toBe("₦3,563,550"));
  it("uses a true minus for money out", () => expect(naira(-879550)).toBe("−₦879,550"));
  it("adds + only when asked", () => {
    expect(naira(568750, { sign: true })).toBe("+₦568,750");
    expect(naira(0, { sign: true })).toBe("₦0");
  });
  it("shows a dash for no value", () => expect(naira(null)).toBe("—"));
});

describe("count", () => {
  it("groups thousands", () => expect(count(1284)).toBe("1,284"));
  it("leaves small numbers alone", () => expect(count(482)).toBe("482"));
});

describe("pct", () => {
  it("formats a ratio with one decimal", () => expect(pct(0.07)).toBe("7.0%"));
  it("supports two decimals for margins", () => expect(pct(0.1596, 2)).toBe("15.96%"));
  it("uses a true minus", () => expect(pct(-0.104)).toBe("−10.4%"));
  it("adds + when signed", () => expect(pct(0.021, 1, { signed: true })).toBe("+2.1%"));
  it("never shows −0.0%", () => expect(pct(-0.00001)).toBe("0.0%"));
});

describe("kg and decimal", () => {
  it("turns grams into kg", () => expect(kg(1030)).toBe("1.03 kg"));
  it("formats FCR", () => expect(decimal(1.7234)).toBe("1.72"));
});

describe("dates", () => {
  it("formats a farm day", () => expect(farmDay("2026-09-26")).toBe("Sat 26 Sep"));
  it("formats a short date", () => expect(shortDate("2026-09-02")).toBe("2 Sep 2026"));
  it("formats a heading day", () => expect(fullDay("2026-09-26")).toBe("Saturday, 26 September"));
  it("formats a long date", () => expect(longDate("2026-09-26")).toBe("26 September 2026"));
  it("formats time in Lagos, 12-hour, no space", () =>
    expect(clockTime("2026-09-26T17:40:00Z")).toBe("6:40pm"));
});
