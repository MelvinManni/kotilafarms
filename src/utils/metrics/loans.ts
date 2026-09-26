// Shareholder loans: simple interest for the days outstanding, then withholding tax
import { daysBetween } from "@/utils/dates/days-between";

export type LoanInterest = { days: number; gross: number; withholdingTax: number; net: number };

// Gross = principal × rate × days ÷ 365; WHT on the gross; net = gross − WHT (whole naira)
export function loanInterest(principal: number, advancedOn: string, until: string, rate = 0.16, whtRate = 0.1): LoanInterest {
  const days = Math.max(0, daysBetween(advancedOn, until));
  const grossExact = (principal * rate * days) / 365;
  const gross = Math.round(grossExact);
  const withholdingTax = Math.round(grossExact * whtRate);
  return { days, gross, withholdingTax, net: gross - withholdingTax };
}

// Borrowing capacity: outstanding member loans against equity and the agreed cap
export function borrowingCapacity(outstandingLoans: number, equity: number, capPct: number) {
  const cap = Math.round(equity * capPct);
  return {
    ratio: equity > 0 ? outstandingLoans / equity : Number.NaN,
    cap,
    headroom: cap - outstandingLoans,
    overCap: outstandingLoans > cap,
  };
}
