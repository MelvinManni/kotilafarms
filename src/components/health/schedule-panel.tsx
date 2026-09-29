// One Set's vaccine schedule: due day and date, when given and by whom, and where each dose stands
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Panel } from "@/components/kotila/panel";
import type { SetVaccineRow } from "@/types/health";
import type { SetSummary } from "@/types/sets";
import { farmDay, shortDate } from "@/utils/format/dates";
import { doseLabel, vaccineStateLabel } from "@/utils/metrics/vaccine-status";

const columns = [{ key: "vax", label: "Vaccine" }, { key: "due", label: "Due" }, { key: "given", label: "Given" }, { key: "status", label: "Status" }];

// Filter words: "3 days late" and "4 days late" both count as Late
const GROUP = { given: "Given", "given-late": "Given late", late: "Late", "due-today": "Due today", "due-tomorrow": "Due tomorrow", upcoming: "Upcoming" } as const;

const TONE = { given: "success", "given-late": "warning", late: "alert", "due-today": "warning", "due-tomorrow": "warning", upcoming: "neutral" } as const;

type SchedulePanelProps = { set: SetSummary; vaccines: SetVaccineRow[] | undefined; onOpen: (v: SetVaccineRow) => void; onEdit: () => void };

export function SchedulePanel({ set, vaccines, onOpen, onEdit }: SchedulePanelProps) {
  const given = vaccines?.filter((v) => v.givenOn).length ?? 0;
  const all = vaccines && vaccines.length > 0 && given === vaccines.length ? ` · all ${vaccines.length} given` : "";
  const rows = (vaccines ?? []).map((v) => ({
    id: v.id,
    vax: { value: v.item, sub: doseLabel(v.doseNo) },
    due: { value: `Day ${v.dueAgeDays}`, sub: farmDay(v.dueOn) },
    given: v.givenOn ? { value: `Day ${v.givenDay}`, sub: `${farmDay(v.givenOn)}${v.givenBy ? ` · ${v.givenBy.split(" ")[0]}` : ""}` } : { value: "—", tone: "muted" as const },
    group: GROUP[v.state],
    status: { tag: { tone: TONE[v.state], label: vaccineStateLabel(v) } },
  }));
  return (
    <Panel flush title={`Vaccine schedule · Set ${set.number}`} subtitle={`${set.pen ? `${set.pen} · ` : ""}started ${shortDate(set.startDate, false)} · day ${set.dayOfAge}${all}`} action={vaccines && set.status !== "closed" ? { label: "Change schedule", onClick: onEdit } : undefined}>
      {vaccines && rows.length === 0 ? (
        <p className="m-0 px-6 pb-5 text-body text-ink-muted">No vaccines on this Set’s schedule.</p>
      ) : (
        <LedgerTable caption={`Set ${set.number} vaccines`} columns={columns} rows={rows} loading={!vaccines} filters={[{ key: "group", label: "Status" }]} onRowClick={(r) => onOpen(vaccines!.find((v) => v.id === r.id)!)} />
      )}
    </Panel>
  );
}
