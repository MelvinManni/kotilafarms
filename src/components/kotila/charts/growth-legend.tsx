// Legend for the growth chart: actual line and the dashed breed standard
import { cn } from "@/utils/cn";

export function GrowthLegend({ theme = "deep" }: { theme?: "deep" | "light" }) {
  const deep = theme === "deep";
  return (
    <div className={cn("flex flex-wrap gap-5 text-sm leading-5 font-medium", deep ? "text-green-50" : "text-ink-2")}>
      <span className="inline-flex items-center gap-2">
        <span className={cn("h-1 w-5.5 rounded-xs", deep ? "bg-green-300" : "bg-green-600")} aria-hidden />
        Actual
      </span>
      <span className="inline-flex items-center gap-2">
        <span className={cn("w-5.5 border-t-[3px] border-dashed", deep ? "border-yellow-500" : "border-[#c99a00]")} aria-hidden />
        Breed standard ±5%
      </span>
    </div>
  );
}
