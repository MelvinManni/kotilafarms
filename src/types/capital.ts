// Partner capital and loans page data
import type { LoanInterest } from "@/utils/metrics/loans";

export type ShareholderRow = { id: string; name: string; shares: number; ownership: number; contributed: number; withdrawn: number; net: number };

export type LoanRow = { id: string; lender: { id: string; name: string }; amount: number; advancedOn: string; repaidOn: string | null; rate: number; whtRate: number; interest: LoanInterest; version: number };

export type CapitalPayload = {
  shareholders: ShareholderRow[];
  totals: { shares: number; contributed: number; withdrawn: number; net: number };
  loans: LoanRow[];
  capacity: { outstanding: number; equity: number; capPct: number; cap: number; headroom: number; ratio: number | null; overCap: boolean };
};
