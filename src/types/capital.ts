// Partner capital and loans page data
import type { LoanInterest } from "@/utils/metrics/loans";

// removedOn: the farm day they left the register (their shares no longer count)
export type ShareholderRow = { id: string; version: number; name: string; shares: number; ownership: number; contributed: number; withdrawn: number; net: number; removedOn: string | null };

export type LoanRow = { id: string; lender: { id: string; name: string }; amount: number; advancedOn: string; repaidOn: string | null; rate: number; whtRate: number; interest: LoanInterest; version: number };

export type CapitalPayload = {
  shareholders: ShareholderRow[];
  removed: ShareholderRow[];
  totals: { shares: number; contributed: number; withdrawn: number; net: number };
  loans: LoanRow[];
  capacity: { outstanding: number; equity: number; capPct: number; cap: number; headroom: number; ratio: number | null; overCap: boolean };
};
