// Tests for spend shares
import { describe, expect, it } from "vitest";
import { categoryShare, perBirdStarted } from "@/utils/metrics/category-share";

describe("categoryShare", () => {
  it("Set 3: feed was 69% of spend", () => {
    const share = categoryShare([{ label: "Feed", value: 2_066_412 }, { label: "Other", value: 928_388 }], "Feed");
    expect(Math.round(share! * 100)).toBe(69);
  });
  it("is null with no spend", () => expect(categoryShare([], "Feed")).toBeNull());
  it("Set 4: ₦3,485 per bird started", () => expect(perBirdStarted(1_742_350, 500)).toBe(3_485));
});
