// Shared cell classes for LedgerTable: alignment, edge padding, the pinned first column
export const ALIGN = { left: "text-left", right: "text-right", center: "text-center" } as const;

// Wider padding on the outer edges lines the table up with its panel
export const EDGE = "first:pl-6 last:pr-6";

// The first column stays put while the rest scroll sideways
export const PINNED = "sticky left-0";

export const HEAD_CELL = "h-auto bg-surface px-4 py-3 text-[12px] leading-4 font-bold tracking-[0.04em] whitespace-nowrap text-ink-muted uppercase";
