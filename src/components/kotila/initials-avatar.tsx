// Round avatar with a person's initials
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/utils/format/initials";
import { cn } from "@/utils/cn";

const SIZES = { sm: "size-7 text-xs", md: "size-10 text-[15px]", lg: "size-13 text-xl" };

export function InitialsAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  return (
    <Avatar aria-hidden className={cn("shrink-0 after:hidden", SIZES[size])}>
      <AvatarFallback className="bg-green-100 font-display font-semibold text-green-700">{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
