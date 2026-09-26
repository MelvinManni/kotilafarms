// Share register: shares and ownership (fixed), and each person's money in the company
import { LedgerTable } from "@/components/kotila/ledger-table";
import { Panel } from "@/components/kotila/panel";
import type { CapitalPayload, ShareholderRow } from "@/types/capital";
import { count } from "@/utils/format/count";
import { naira } from "@/utils/format/naira";
import { pct } from "@/utils/format/percent";

const columns = [
  { key: "who", label: "Shareholder", width: 220 },
  { key: "shares", label: "Shares", align: "right" as const },
  { key: "pct", label: "Ownership", align: "right" as const },
  { key: "in", label: "Contributed", align: "right" as const },
  { key: "out", label: "Withdrawn", align: "right" as const },
  { key: "net", label: "Net position", align: "right" as const },
];

const muted = (n: number) => (n ? naira(n) : { value: naira(0), tone: "muted" as const });

export function OwnershipPanel({ c, onAdd, onOpen }: { c: CapitalPayload; onAdd: () => void; onOpen: (s: ShareholderRow) => void }) {
  const rows = c.shareholders.map((s) => ({ id: s.id, who: s.name, shares: count(s.shares), pct: pct(s.ownership, 2), in: muted(s.contributed), out: muted(s.withdrawn), net: { value: naira(s.net), figure: true } }));
  const t = c.totals;
  return (
    <Panel flush title="Ownership" subtitle="Ownership comes from the share register; select a shareholder to correct it. Contributions and withdrawals change each person's money in the company, not their shares." action={{ label: "Add a shareholder", onClick: onAdd }}>
      {rows.length ? (
        <LedgerTable caption="Shareholders, their shares and their money in the company" columns={columns} rows={rows} onRowClick={(r) => onOpen(c.shareholders.find((s) => s.id === r.id)!)} footer={{ who: "Total", shares: count(t.shares), pct: t.shares ? "100.00%" : "—", in: naira(t.contributed), out: naira(t.withdrawn), net: naira(t.net) }} />
      ) : (
        <p className="m-0 px-6 pb-5 text-body text-ink-muted">Add each shareholder with the shares they hold. Ownership is worked out from the shares.</p>
      )}
    </Panel>
  );
}
