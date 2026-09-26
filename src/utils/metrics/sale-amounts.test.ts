// Tests for sale amount agreement (matches the database check)
import { describe, expect, it } from "vitest";
import { saleAmountsAgree, salePaid } from "@/utils/metrics/sale-amounts";

describe("saleAmountsAgree", () => {
  it("accepts exact amounts", () => expect(saleAmountsAgree(50, 7_171, 358_550)).toBe(true));
  it("accepts a price rounded from the total", () => expect(saleAmountsAgree(465, 7_664, 3_563_550)).toBe(true));
  it("refuses a price that doesn't match", () => expect(saleAmountsAgree(50, 7_500, 358_550)).toBe(false));
});

describe("salePaid", () => {
  it("adds deposit, paid at sale and payments", () => expect(salePaid({ deposit: 5_000, paidAtSale: 10_000 }, [20_000])).toBe(35_000));
});
