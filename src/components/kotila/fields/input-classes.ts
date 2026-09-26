// Shared look for Kotila text inputs: 56px, sunken until focused
export const inputClasses =
  "h-auto min-h-14 w-full rounded-md border-[1.5px] border-line-strong bg-surface-sunken px-4 font-sans text-[17px] font-medium text-ink tabular-nums shadow-none placeholder:text-ink-faint focus-visible:border-green-600 focus-visible:bg-surface focus-visible:shadow-focus focus-visible:ring-0 read-only:border-line read-only:text-ink-muted aria-invalid:border-alert aria-invalid:ring-0";

// Pill that marks a value worked out from the other two
export const calculatedPillClasses =
  "pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full bg-green-50 px-2.5 py-0.5 text-xs leading-4 font-bold text-green-800";

// Unit or currency sign sitting inside an input
export const affixClasses =
  "pointer-events-none absolute inset-y-0 flex items-center text-[17px] leading-none font-bold text-ink-muted";
