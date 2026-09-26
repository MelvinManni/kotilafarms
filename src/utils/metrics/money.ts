// Sale balances, cash position and shareholder capital
// Balance owed = total − deposit − paid at sale − payments since
export function saleBalance(sale: { total: number; deposit: number; paidAtSale: number }, payments: number[]): number {
  return sale.total - sale.deposit - sale.paidAtSale - payments.reduce((a, b) => a + b, 0);
}

// What should be on hand = counted at the last reconciliation + money in − money out since
export function cashPosition(lastCounted: number, moneyIn: number[], moneyOut: number[]) {
  const totalIn = moneyIn.reduce((a, b) => a + b, 0);
  const totalOut = moneyOut.reduce((a, b) => a + b, 0);
  return { moneyIn: totalIn, moneyOut: totalOut, shouldBeOnHand: lastCounted + totalIn - totalOut };
}

// Capital entries are + contributed, − withdrawn
export function capitalPosition(entries: number[]) {
  const contributed = entries.filter((e) => e > 0).reduce((a, b) => a + b, 0);
  const withdrawn = -entries.filter((e) => e < 0).reduce((a, b) => a + b, 0);
  return { contributed, withdrawn, net: contributed - withdrawn };
}

export function ownershipShare(shares: number, totalShares: number): number {
  return totalShares > 0 ? shares / totalShares : Number.NaN;
}
