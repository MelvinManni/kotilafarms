// Vaccine states for Set 4 (started 2 Sep) and Set 5 (started 20 Sep), on Sat 26 Sep
import { describe, expect, it } from "vitest";
import { doseLabel, vaccineStateLabel, vaccineStatus } from "@/utils/metrics/vaccine-status";

describe("vaccineStatus", () => {
  it("reads given on time and given late", () => {
    const late = vaccineStatus({ dueAgeDays: 7, givenOn: "2026-09-11" }, "2026-09-02", "2026-09-26");
    expect(late).toEqual({ dueOn: "2026-09-09", state: "given-late", daysLate: 2, givenDay: 9 });
    expect(vaccineStateLabel(late)).toBe("Given 2 days late");
    expect(vaccineStatus({ dueAgeDays: 21, givenOn: "2026-09-23" }, "2026-09-02", "2026-09-26").state).toBe("given");
  });

  it("reads due tomorrow, due today, late and upcoming", () => {
    const set5 = (day: number) => vaccineStatus({ dueAgeDays: day, givenOn: null }, "2026-09-20", "2026-09-26");
    expect(set5(7).state).toBe("due-tomorrow");
    expect(set5(6).state).toBe("due-today");
    expect(vaccineStateLabel(set5(4))).toBe("2 days late");
    expect(set5(10)).toMatchObject({ state: "upcoming", dueOn: "2026-09-30" });
    expect(doseLabel(2)).toBe("2nd dose");
  });
});
