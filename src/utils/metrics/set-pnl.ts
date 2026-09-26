// Profit and loss for one Set or several added together
export type PnlInput = {
  intake: number;
  birdsSold: number;
  birdRevenue: number;
  manureRevenue: number;
  expensesByCategory: Record<string, number>;
};

export type Pnl = {
  revenue: number;
  expenses: number;
  profit: number;
  // Net margin = profit ÷ revenue
  margin: number;
  costPerBirdStarted: number;
  costPerBirdSold: number;
  revenuePerBird: number;
  marginPerBird: number;
  expensesByCategory: Record<string, number>;
};

const perBird = (amount: number, birds: number) => (birds > 0 ? Math.round(amount / birds) : Number.NaN);

export function setPnl(input: PnlInput): Pnl {
  const expenses = Object.values(input.expensesByCategory).reduce((a, b) => a + b, 0);
  const revenue = input.birdRevenue + input.manureRevenue;
  const profit = revenue - expenses;
  const costPerBirdSold = perBird(expenses, input.birdsSold);
  const revenuePerBird = perBird(input.birdRevenue, input.birdsSold);
  return {
    revenue,
    expenses,
    profit,
    margin: revenue > 0 ? profit / revenue : Number.NaN,
    costPerBirdStarted: perBird(expenses, input.intake),
    costPerBirdSold,
    revenuePerBird,
    marginPerBird: revenuePerBird - costPerBirdSold,
    expensesByCategory: input.expensesByCategory,
  };
}

// Several Sets as one: add every input, then work out the P&L
export function combinePnlInputs(inputs: PnlInput[]): PnlInput {
  const byCategory: Record<string, number> = {};
  for (const i of inputs) for (const [k, v] of Object.entries(i.expensesByCategory)) byCategory[k] = (byCategory[k] ?? 0) + v;
  const total = (key: "intake" | "birdsSold" | "birdRevenue" | "manureRevenue") => inputs.reduce((sum, i) => sum + i[key], 0);
  return { intake: total("intake"), birdsSold: total("birdsSold"), birdRevenue: total("birdRevenue"), manureRevenue: total("manureRevenue"), expensesByCategory: byCategory };
}
