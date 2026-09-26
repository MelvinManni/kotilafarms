// "Needs doing today" / "Coming up": logs not in, vaccines due, weighing day, tags that keep coming back
import { tagLabel } from "@/constants/observation-tags";
import type { TodayTask } from "@/types/today";
import { addDays } from "@/utils/dates/add-days";

type RunningSet = { id: string; number: number; startDate: string; dayOfAge: number };
type Vaccine = { setId: string; item: string; doseNo: number; dueAgeDays: number; givenOn: string | null };
type LogTags = { setId: string; date: string; tags: string[] };
type Sample = { setId: string; ageDays: number };

type Inputs = { today: string; sets: RunningSet[]; loggedToday: string[]; vaccines: Vaccine[]; weekLogs: LogTags[]; samples: Sample[] };

const setList = (numbers: number[]) => (numbers.length === 1 ? `Set ${numbers[0]}` : `Sets ${numbers.slice(0, -1).join(", ")} and ${numbers.at(-1)}`);

export function todayTasks({ today, sets, loggedToday, vaccines, weekLogs, samples }: Inputs): TodayTask[] {
  const tasks: TodayTask[] = [];
  const toLog = sets.filter((s) => !loggedToday.includes(s.id));
  if (toLog.length) tasks.push({ kind: "log", tone: "neutral", title: `Log ${setList(toLog.map((s) => s.number))} for today`, detail: "Deaths, feed, water and anything seen in the pen", href: toLog.length === 1 ? `/log/${toLog[0]!.id}/${today}` : "/log" });

  for (const v of vaccines.filter((x) => !x.givenOn)) {
    const set = sets.find((s) => s.id === v.setId);
    if (!set) continue;
    const due = addDays(set.startDate, v.dueAgeDays);
    if (due > addDays(today, 1)) continue;
    const when = due < today ? "is late" : due === today ? "due today" : "due tomorrow";
    tasks.push({ kind: "vaccine", tone: due < today ? "alert" : "warning", title: `${v.item} ${when} · Set ${set.number}`, detail: `Day ${v.dueAgeDays} · dose ${v.doseNo} · in drinking water, morning` });
  }

  for (const set of sets) {
    const counts = new Map<string, number>();
    for (const log of weekLogs.filter((l) => l.setId === set.id)) for (const t of log.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const [tag, n] of counts) if (n >= 3) tasks.push({ kind: "tag", tone: "warning", title: `${tagLabel(tag)} noted ${n} days this week`, detail: `Set ${set.number} · worth a look in the pen` });
  }

  for (const set of sets) {
    const weighDay = Math.ceil(Math.max(set.dayOfAge, 1) / 7) * 7;
    const weighed = samples.some((s) => s.setId === set.id && s.ageDays > weighDay - 7 && s.ageDays <= weighDay);
    if (weighed || weighDay - set.dayOfAge > 3) continue;
    const date = addDays(set.startDate, weighDay);
    const day = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
    tasks.push({ kind: "weigh", tone: "neutral", title: `Weigh Set ${set.number} ${date === today ? "today" : `on ${day}`}`, detail: `Day ${weighDay} · at least 10 birds from different corners`, href: `/weigh/${set.id}` });
  }
  return tasks;
}
