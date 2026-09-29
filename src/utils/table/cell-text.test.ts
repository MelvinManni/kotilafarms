// Words pulled out of ledger cells for search and filters
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { cellLabel, cellText } from "@/utils/table/cell-text";

describe("cellText", () => {
  it("reads plain strings and numbers", () => {
    expect(cellText("Set 4")).toBe("Set 4");
    expect(cellText(18)).toBe("18");
  });

  it("joins value, sub-line and delta", () => {
    expect(cellText({ value: "₦215,000", sub: "19 days", delta: { direction: "up", label: "4 this week" } })).toBe("₦215,000 19 days 4 this week");
  });

  it("uses the tag or stage label", () => {
    expect(cellText({ tag: { tone: "warning", label: "Missed" }, sub: "select to fill it in" })).toBe("Missed select to fill it in");
    expect(cellText({ status: "brooding", day: 6 })).toBe("Brooding");
  });

  it("skips elements and empty cells", () => {
    expect(cellText(createElement("span", null, "x"))).toBe("");
    expect(cellText(undefined)).toBe("");
  });
});

describe("cellLabel", () => {
  it("keeps only the main label", () => {
    expect(cellLabel({ value: "Set 4", sub: "Back pen" })).toBe("Set 4");
    expect(cellLabel({ status: "closed" })).toBe("Closed");
    expect(cellLabel({ tag: { tone: "success", label: "Repaid" } })).toBe("Repaid");
  });
});
