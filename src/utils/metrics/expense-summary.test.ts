// Tests for expense totals
import { describe, expect, it } from "vitest";
import type { ExpenseRow } from "@/types/expense";
import { summarizeExpenses, topCategories } from "@/utils/metrics/expense-summary";

const row = (amount: number, category: string, setNumber: number | null, capitalItem = false): ExpenseRow => ({
  id: crypto.randomUUID(), clientId: "", version: 1, date: "2026-09-20", category: { id: category, key: category, name: category }, description: "", amount,
  setId: setNumber === null ? null : String(setNumber), setNumber, overhead: setNumber === null, paidBy: null, receiptKey: null, capitalItem,
  possibleDuplicateOf: null, createdBy: "Kosi", createdAt: "",
});

describe("summarizeExpenses", () => {
  const s = summarizeExpenses([
    row(588_000, "Day-old chicks", 5), row(183_400, "Feed", 5), row(198_400, "Feed", 4), row(18_400, "Fuel", null), row(42_000, "Equipment", null, true),
  ]);
  it("keeps capital items apart from running costs", () => {
    expect(s.running).toBe(988_200);
    expect(s.capital).toEqual({ total: 42_000, count: 1 });
  });
  it("splits Sets from overhead", () => {
    expect(s.onSets).toEqual({ total: 969_800, bySet: [{ number: 5, total: 771_400 }, { number: 4, total: 198_400 }] });
    expect(s.overhead).toBe(18_400);
  });
  it("orders categories largest first", () => expect(s.byCategory.map((c) => c.label)).toEqual(["Day-old chicks", "Feed", "Fuel"]));
  it("names the top two and their share", () => expect(topCategories(s.byCategory)).toEqual({ labels: ["Day-old chicks", "Feed"], share: 969_800 / 988_200 }));
});
