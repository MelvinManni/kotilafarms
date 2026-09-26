// Tests for the Sales page headline
import { describe, expect, it } from "vitest";
import type { SaleRow } from "@/types/sale";
import { salesHeadline } from "@/utils/metrics/sales-headline";

const sale = (birds: number, total: number, set = { id: "3", number: 3, closedOn: "2026-09-14" as string | null }) => ({ birds, total, set }) as SaleRow;

describe("salesHeadline", () => {
  it("sums the latest Set's sales", () => expect(salesHeadline([sale(30, 225_000), sale(50, 358_550)])).toBe("Set 3 closed 2026-09-14 · 80 birds sold for ₦583,550"));
  it("is null with no sales", () => expect(salesHeadline([])).toBeNull());
});
