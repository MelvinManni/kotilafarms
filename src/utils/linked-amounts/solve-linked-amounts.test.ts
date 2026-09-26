// Tests for linked quantity × price = total
import { describe, expect, it } from "vitest";
import {
  calculatedField,
  initialLinkedAmounts,
  solveLinkedAmounts,
} from "@/utils/linked-amounts/solve-linked-amounts";

describe("solveLinkedAmounts", () => {
  it("works out the total from bags and price per bag", () => {
    let s = initialLinkedAmounts();
    s = solveLinkedAmounts(s, "quantity", 20);
    s = solveLinkedAmounts(s, "unitPrice", 16500);
    expect(s.total).toBe(330000);
    expect(calculatedField(s)).toBe("total");
  });

  it("works out price each from quantity and total", () => {
    let s = initialLinkedAmounts(465);
    s = solveLinkedAmounts(s, "total", 3563550);
    expect(calculatedField(s)).toBe("unitPrice");
    expect(s.unitPrice).toBe(7664);
  });

  it("works out quantity from price and total, to two decimals", () => {
    let s = initialLinkedAmounts();
    s = solveLinkedAmounts(s, "unitPrice", 16000);
    s = solveLinkedAmounts(s, "total", 200000);
    expect(calculatedField(s)).toBe("quantity");
    expect(s.quantity).toBe(12.5);
  });

  it("leaves the calculated field empty until two are filled", () => {
    const s = solveLinkedAmounts(initialLinkedAmounts(), "quantity", 10);
    expect(s.total).toBeNull();
  });

  it("does not divide by zero", () => {
    let s = initialLinkedAmounts();
    s = solveLinkedAmounts(s, "quantity", 0);
    s = solveLinkedAmounts(s, "total", 5000);
    expect(s.unitPrice).toBeNull();
  });

  it("fills the total from defaults", () => {
    expect(initialLinkedAmounts(10, 7500).total).toBe(75000);
  });
});
