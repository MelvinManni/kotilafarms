// Row taps open the row; drags and clicks left over from a closing overlay don't
import { describe, expect, it } from "vitest";
import { shouldActivateRow } from "@/utils/table/row-click";

describe("shouldActivateRow", () => {
  it("opens on a tap that started on the row", () => {
    expect(shouldActivateRow({ x: 10, y: 10 }, { x: 14, y: 12 })).toBe(true);
  });

  it("ignores a click with no press on the row", () => {
    expect(shouldActivateRow(null, { x: 10, y: 10 })).toBe(false);
  });

  it("ignores a drag", () => {
    expect(shouldActivateRow({ x: 10, y: 10 }, { x: 40, y: 10 })).toBe(false);
  });
});
