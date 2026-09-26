// Feed page data: purchases, ingredient buys, stock per feed type and price history
export type FeedPurchaseRow = {
  id: string;
  date: string;
  feedTypeId: string;
  feed: string;
  bags: number;
  kgPerBag: number;
  pricePerBag: number;
  total: number;
  transportCost: number;
  supplier: string;
  set: { id: string; number: number } | null;
  by: string;
};

export type IngredientRow = { id: string; date: string; ingredient: string; quantity: number; unit: string; unitCost: number; total: number; set: { id: string; number: number }; by: string };

export type FeedStockRow = {
  feedTypeId: string;
  feed: string;
  kind: "starter" | "grower" | "finisher";
  stockBags: number;
  bagsPerDay: number;
  daysLeft: number | null;
  eating: { id: string; number: number }[];
  lastPrice: number | null;
};

export type FeedStockPayload = { rows: FeedStockRow[]; bagsPer500Birds: number | null };

export type FeedPrice = { date: string; pricePerBag: number; supplier: string };
