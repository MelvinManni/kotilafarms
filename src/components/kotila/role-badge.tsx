// Owner, Manager or Recorder as a small badge
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL, type Role } from "@/types/role";
import { cn } from "@/utils/cn";

const TONES: Record<Role, string> = {
  owner: "bg-green-700 text-white",
  manager: "bg-green-50 text-green-800",
  recorder: "bg-surface-sunken text-ink-2 inset-ring inset-ring-line",
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge className={cn("h-auto rounded-full border-0 px-2.25 py-0.5 text-xs leading-4.5 font-bold", TONES[role])}>{ROLE_LABEL[role]}</Badge>;
}
