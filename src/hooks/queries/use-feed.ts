// Feed: purchases, ingredient buys, stock, price history, and recording new buys
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/query/fetcher";
import { qk } from "@/lib/query/query-keys";
import type { FeedPurchaseCreateInput, IngredientPurchaseCreateInput } from "@/schemas/feed";
import type { FeedPrice, FeedPurchaseRow, FeedStockPayload, IngredientRow } from "@/types/feed";

export function useFeedPurchases() {
  return useQuery({ queryKey: qk.feed.purchases(), queryFn: ({ signal }) => apiFetch<FeedPurchaseRow[]>("/api/feed/purchases", { signal }) });
}

export function useIngredientPurchases() {
  return useQuery({ queryKey: qk.feed.ingredients(), queryFn: ({ signal }) => apiFetch<IngredientRow[]>("/api/feed/ingredients", { signal }) });
}

export function useFeedStock() {
  return useQuery({ queryKey: qk.feed.stock(), queryFn: ({ signal }) => apiFetch<FeedStockPayload>("/api/feed/stock", { signal }) });
}

export function useFeedPrices(feedTypeId: string | undefined) {
  return useQuery({ queryKey: qk.feed.prices(feedTypeId ?? ""), queryFn: ({ signal }) => apiFetch<FeedPrice[]>(`/api/feed/prices?feedTypeId=${feedTypeId}`, { signal }), enabled: Boolean(feedTypeId) });
}

// A buy changes stock, prices, spend on Sets and the expenses list
function useRefreshFeed() {
  const client = useQueryClient();
  return () => {
    for (const key of [["feed"], ["expenses"], ["finance"], qk.sets.all(), qk.today()]) void client.invalidateQueries({ queryKey: key });
  };
}

export function useAddFeedPurchase() {
  const refresh = useRefreshFeed();
  return useMutation({ mutationFn: (input: FeedPurchaseCreateInput) => apiFetch<{ id: string }>("/api/feed/purchases", { method: "POST", body: input }), onSuccess: refresh });
}

export function useAddIngredientPurchase() {
  const refresh = useRefreshFeed();
  return useMutation({ mutationFn: (input: IngredientPurchaseCreateInput) => apiFetch<{ id: string }>("/api/feed/ingredients", { method: "POST", body: input }), onSuccess: refresh });
}
