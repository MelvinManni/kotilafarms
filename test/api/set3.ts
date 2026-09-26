// Set 3 from docs/12-seed-data.md, built through the API: ₦2,994,800 spent, 465 birds sold, ₦15,900 manure
import { POST as addBuyer } from "@/app/api/buyers/route";
import { GET as categories } from "@/app/api/expense-categories/route";
import { POST as addExpense } from "@/app/api/expenses/route";
import { POST as addManure } from "@/app/api/other-sales/route";
import { POST as addSale } from "@/app/api/sales/route";
import { signInAs } from "@test/api/state";
import { call, type withApi } from "@test/api/with-api";
import { readyFarm } from "@test/db/farm";
import { makeSet } from "@test/db/sets";

type Tx = Parameters<Parameters<typeof withApi>[0]>[0];

// Set 3 (docs/12-seed-data.md): day-olds ₦445,000 come with the Set; the rest are expenses
const SET3_SPEND: [string, number][] = [["feed", 2_066_412], ["drugs", 131_600], ["brooding", 96_500], ["transport", 84_000], ["litter", 36_000], ["labour", 90_000], ["processing", 22_500], ["other", 22_788]];

export async function set3(tx: Tx) {
  const people = await readyFarm(tx);
  const set = await makeSet(tx, people.owner, { startDate: "2026-07-20", intake: 500, dayOldUnitCost: 890 });
  signInAs(people.manager);
  const cats = (await call(categories)).body as { id: string; key: string }[];
  for (const [key, amount] of SET3_SPEND) await call(addExpense, { method: "POST", body: { clientId: crypto.randomUUID(), date: "2026-09-01", categoryId: cats.find((c) => c.key === key)!.id, description: key, amount, setId: set.id, overhead: false } });
  const buyer = (await call(addBuyer, { method: "POST", body: { clientId: crypto.randomUUID(), name: "Alhaji Sule" } })).body;
  await call(addSale, { method: "POST", body: { clientId: crypto.randomUUID(), setId: set.id, date: "2026-09-10", buyerId: buyer.id, birds: 465, pricePerBird: 7_629, total: 3_547_650, paidAtSale: 3_547_650, method: "transfer" } });
  await call(addManure, { method: "POST", body: { clientId: crypto.randomUUID(), setId: set.id, date: "2026-09-12", amount: 15_900 } });
  return { ...people, set };
}

