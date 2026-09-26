// What a role can and can't do, as a tick/cross list
import { ROLE_ABILITIES } from "@/constants/role-abilities";
import { Icon } from "@/svgs/icon";
import { ROLE_LABEL, type Role } from "@/types/role";

export function RoleAbilities({ role }: { role: Role }) {
  const { can, cannot } = ROLE_ABILITIES[role];
  return (
    <div className="flex flex-col gap-2.5 rounded-lg bg-surface-sunken p-4">
      <strong className="text-[15px]">What {role === "owner" ? "an" : "a"} {ROLE_LABEL[role].toLowerCase()} can do</strong>
      {can.map((line) => (
        <div key={line} className="flex items-start gap-2.5 text-body text-ink-2">
          <Icon name="check" size={18} strokeWidth={2.6} color="var(--green-600)" />
          <span>{line}</span>
        </div>
      ))}
      {cannot.map((line) => (
        <div key={line} className="flex items-start gap-2.5 text-body text-ink-muted">
          <Icon name="x" size={18} strokeWidth={2.6} />
          <span>{line}</span>
        </div>
      ))}
    </div>
  );
}
