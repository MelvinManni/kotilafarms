// Health page headlines in the farm's words
import { describe, expect, it } from "vitest";
import type { HealthRecordRow, SetVaccineRow } from "@/types/health";
import { mostPressingVaccine, treatmentsSummary, vaccineNotice } from "@/utils/metrics/health-headlines";

const vaccine = (over: Partial<SetVaccineRow>): SetVaccineRow => ({ id: "v", item: "Gumboro", doseNo: 1, dueAgeDays: 7, dueOn: "2026-09-27", method: "Drinking water", givenOn: null, givenDay: null, givenBy: null, note: null, state: "due-tomorrow", daysLate: 0, version: 1, ...over });
const rec = (setNumber: number, date: string, cost: number | null): HealthRecordRow => ({ id: date, date, set: { id: String(setNumber), number: setNumber }, item: "x", dose: "y", cost, reason: "z", by: "Adaeze", enteredAt: "" });

describe("health headlines", () => {
  it("puts a late dose before one due tomorrow", () => {
    const tomorrow = { setId: "s5", setNumber: 5, liveBirds: 600, vaccine: vaccine({}) };
    const late = { setId: "s4", setNumber: 4, liveBirds: 482, vaccine: vaccine({ item: "Lasota", state: "late", daysLate: 1, dueAgeDays: 21 }) };
    expect(mostPressingVaccine([tomorrow, late])?.setNumber).toBe(4);
    expect(mostPressingVaccine([{ ...tomorrow, vaccine: vaccine({ state: "upcoming" }) }])).toBeNull();
    expect(vaccineNotice(tomorrow)).toEqual({ title: "Gumboro is due tomorrow for Set 5", body: "Day 7 · 600 doses · give in drinking water in the morning" });
  });

  it("sums treatments across Sets since the first", () => {
    expect(treatmentsSummary([rec(4, "2026-09-25", 6_800), rec(5, "2026-09-12", 37_000), rec(4, "2026-09-20", null)])).toBe("Sets 4 and 5 · ₦43,800 since 12 Sep");
  });
});
