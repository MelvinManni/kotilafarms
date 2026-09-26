// Green band behind the top of phone pages, with the faint mark pattern
import { KotilaMark } from "@/svgs/kotila-mark";
import { cn } from "@/utils/cn";

export function PhoneBand({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-65 overflow-hidden bg-green-700", className)}>
      <KotilaMark color="white" className="absolute -top-10 -right-47 w-115 opacity-10" />
    </div>
  );
}
