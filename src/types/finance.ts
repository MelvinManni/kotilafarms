// Finance page data: cash position since the last count, and Set profit and loss
import type { Pnl } from "@/utils/metrics/set-pnl";

export type Reconciliation = { id: string; date: string; countedCash: number; bankBalance: number; expected: number; difference: number; note: string | null; by: string };

export type CashPayload = {
  since: Reconciliation | null;
  firstRecord: string | null;
  opening: number;
  moneyIn: number;
  moneyOut: number;
  shouldBeOnHand: number;
  inRows: { label: string; value: number }[];
  outRows: { label: string; value: number }[];
  owed: { total: number; buyers: number };
};

export type PnlPayload = {
  sets: { id: string; number: number; closedOn: string | null; status: string }[];
  intake: number;
  birdsSold: number;
  birdRevenue: number;
  manureRevenue: number;
  pnl: Pnl;
  byCategory: { label: string; value: number }[];
  feedShare: number | null;
};
