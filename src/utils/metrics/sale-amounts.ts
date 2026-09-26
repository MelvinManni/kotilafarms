// Birds × price per bird = total, allowing the price to be rounded to the naira when it was worked out from the total
export function saleAmountsAgree(birds: number, pricePerBird: number, total: number): boolean {
  return Math.abs(total - birds * pricePerBird) * 2 <= Math.max(birds, 2);
}

// Paid so far on a sale: deposit + paid at the sale + later payments
export function salePaid(sale: { deposit: number; paidAtSale: number }, payments: number[]): number {
  return sale.deposit + sale.paidAtSale + payments.reduce((a, b) => a + b, 0);
}
