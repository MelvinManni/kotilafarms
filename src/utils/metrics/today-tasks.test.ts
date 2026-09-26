// Tests for Today's task list
import { describe, expect, it } from "vitest";
import { todayTasks } from "@/utils/metrics/today-tasks";

const set4 = { id: "s4", number: 4, startDate: "2026-09-02", dayOfAge: 24 };
const set5 = { id: "s5", number: 5, startDate: "2026-09-20", dayOfAge: 6 };
const base = { today: "2026-09-26", sets: [set4, set5], loggedToday: [], vaccines: [], weekLogs: [], samples: [{ setId: "s4", ageDays: 24 }] };

describe("todayTasks", () => {
  it("says whose phone is holding a log", () => {
    const tasks = todayTasks({ ...base, loggedToday: ["s5"], waiting: [{ person: "Chinedu Okafor", setId: "s4", date: "2026-09-25" }] });
    expect(tasks[0]).toMatchObject({ title: "Friday’s Set 4 log is on Chinedu’s phone", detail: "Waiting for signal — it sends by itself" });
  });
  it("asks for today's logs", () => expect(todayTasks(base)[0]).toMatchObject({ kind: "log", title: "Log Sets 4 and 5 for today", href: "/log" }));
  it("names a vaccine due tomorrow and a late one", () => {
    const tasks = todayTasks({ ...base, loggedToday: ["s4", "s5"], vaccines: [
      { setId: "s5", item: "Gumboro", doseNo: 1, dueAgeDays: 7, givenOn: null },
      { setId: "s4", item: "Lasota", doseNo: 2, dueAgeDays: 21, givenOn: null },
      { setId: "s4", item: "Gumboro", doseNo: 2, dueAgeDays: 14, givenOn: "2026-09-18" },
    ] });
    expect(tasks.filter((t) => t.kind === "vaccine").map((t) => [t.title, t.tone])).toEqual([["Gumboro due tomorrow · Set 5", "warning"], ["Lasota is late · Set 4", "alert"]]);
  });
  it("flags a tag seen 3 days this week", () => {
    const weekLogs = ["2026-09-23", "2026-09-24", "2026-09-25"].map((date) => ({ setId: "s4", date, tags: ["wet_litter"] }));
    expect(todayTasks({ ...base, loggedToday: ["s4", "s5"], weekLogs }).find((t) => t.kind === "tag")?.title).toBe("Wet litter noted 3 days this week");
  });
  it("reminds to weigh on the next weekly day, unless it's done", () => {
    const tasks = todayTasks({ ...base, loggedToday: ["s4", "s5"] });
    expect(tasks.filter((t) => t.kind === "weigh").map((t) => t.title)).toEqual(["Weigh Set 5 on Sunday"]);
  });

  it("warns when a feed runs out within a week, soonest first", () => {
    const feed = [
      { feedTypeId: "st", feed: "Starter · Breedwell", kind: "starter" as const, stockBags: 14, bagsPerDay: 1.3, daysLeft: 14 / 1.3, eating: [{ id: "s5", number: 5 }], lastPrice: 26_200 },
      { feedTypeId: "fi", feed: "Finisher · Ultima", kind: "finisher" as const, stockBags: 9, bagsPerDay: 2.3, daysLeft: 9 / 2.3, eating: [{ id: "s4", number: 4 }], lastPrice: 24_800 },
    ];
    const tasks = todayTasks({ ...base, loggedToday: ["s4", "s5"], feed }).filter((t) => t.kind === "feed");
    expect(tasks).toEqual([{ kind: "feed", tone: "warning", title: "Finisher runs out in about 3 days", detail: "9 bags left, using 2.3 a day · Set 4", href: "/feed" }]);
  });
});
