// Edit history: who changed which field, from what to what, and why
import type { ReactNode } from "react";
import { InitialsAvatar } from "@/components/kotila/initials-avatar";
import { ROLE_LABEL, type Role } from "@/types/role";

type AuditEntry = {
  who: string;
  role?: Role;
  when: string;
  action?: string;
  field?: string;
  from?: ReactNode;
  to?: ReactNode;
  note?: string;
  device?: string;
};

export function AuditTrail({ entries }: { entries: AuditEntry[] }) {
  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {entries.map((e, i) => (
        <li key={i} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3 py-3 not-first:before:absolute not-first:before:-top-3 not-first:before:left-3.25 not-first:before:h-6 not-first:before:w-0.5 not-first:before:bg-line">
          <InitialsAvatar name={e.who} size="sm" />
          <div>
            <div className="text-body text-ink-2">
              <strong className="text-ink">{e.who}</strong> {e.action ?? "changed"}
              {e.field ? <> <strong className="text-ink">{e.field}</strong></> : null}
              {e.from !== undefined ? (
                <>
                  {" from "}
                  <span className="text-ink-muted line-through">{e.from}</span>
                  {" to "}
                  <span className="font-extrabold text-ink">{e.to}</span>
                </>
              ) : null}
            </div>
            <div className="text-caption font-medium text-ink-muted">
              {[e.when, e.role ? ROLE_LABEL[e.role] : null, e.device].filter(Boolean).join(" · ")}
            </div>
            {e.note ? <div className="mt-1 rounded-sm bg-surface-sunken px-3 py-2 text-sm leading-5 text-ink-2">“{e.note}”</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
