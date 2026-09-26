// Sales, payments and buyers as the API returns them
export type PaymentMethod = "cash" | "transfer" | "pos";

export type SalePayment = { id: string; date: string; amount: number; method: PaymentMethod; by: string };

export type SaleRow = {
  kind: "birds";
  id: string;
  clientId: string;
  version: number;
  date: string;
  set: { id: string; number: number; closedOn: string | null };
  buyer: { id: string; name: string };
  birds: number;
  pricePerBird: number;
  total: number;
  deposit: number;
  paidAtSale: number;
  payments: SalePayment[];
  paid: number;
  balance: number;
  daysOwed: number;
  belowBulk: boolean;
  method: PaymentMethod;
  note: string | null;
  createdBy: string;
};

export type OtherSaleRow = { kind: "manure"; id: string; date: string; set: { id: string; number: number }; amount: number; createdBy: string };

export type SalesList = { sales: SaleRow[]; other: OtherSaleRow[]; bulkRate: number | null };

export type Outstanding = { rows: SaleRow[]; total: { sales: number; paid: number; balance: number }; buyers: number };

export type BuyerRow = { id: string; name: string; phone: string | null; note: string | null; birds: number; spent: number; balance: number; averagePrice: number | null; vsBulk: number | null; lastSale: string | null };
