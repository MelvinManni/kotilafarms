// Initials avatar with name and role or a meta line
import { InitialsAvatar } from "@/components/kotila/initials-avatar";
import { ROLE_LABEL, type Role } from "@/types/role";

type PersonProps = { name: string; role?: Role; meta?: string; size?: "sm" | "md" | "lg"; hideText?: boolean };

export function Person({ name, role, meta, size = "md", hideText }: PersonProps) {
  const line = meta ?? (role ? ROLE_LABEL[role] : undefined);
  return (
    <div className="inline-flex min-w-0 items-center gap-3">
      <InitialsAvatar name={name} size={size} />
      {hideText ? null : (
        <span className="flex min-w-0 flex-col">
          <span className="text-[15px] leading-5 font-bold text-ink">{name}</span>
          {line ? <span className="text-caption font-medium text-ink-muted">{line}</span> : null}
        </span>
      )}
    </div>
  );
}
