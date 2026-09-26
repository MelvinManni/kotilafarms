// What each role can do, as a ledger; hidden, not greyed out
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Panel } from "@/components/kotila/panel";
import { ROLE_MATRIX } from "@/constants/role-abilities";

const cell = (text: string) => {
  if (text === "—") return { value: "—", tone: "muted" as const };
  const [mark, ...rest] = text.split(" ");
  return { value: mark, sub: rest.length ? rest.join(" ") : undefined };
};

export function RoleMatrixPanel() {
  const rows = ROLE_MATRIX.map((r) => ({
    id: r.area,
    area: { value: r.area, sub: r.sub },
    owner: cell(r.owner),
    manager: cell(r.manager),
    recorder: cell(r.recorder),
  }));
  return (
    <Panel flush title="What each role can do" subtitle="Hidden, not greyed out: people only see what their role allows.">
      <LedgerTable
        dense
        caption="Access by role"
        columns={[
          { key: "area", label: "Area" },
          { key: "owner", label: "Owner", align: "center", width: 76 },
          { key: "manager", label: "Manager", align: "center", width: 96 },
          { key: "recorder", label: "Recorder", align: "center", width: 100 },
        ]}
        rows={rows}
      />
    </Panel>
  );
}
