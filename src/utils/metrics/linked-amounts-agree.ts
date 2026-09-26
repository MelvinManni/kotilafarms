// Quantity × price each = total, allowing for rounding whichever one was worked out (feed and ingredient purchases)
export function linkedAmountsAgree(quantity: number, unitPrice: number, total: number): boolean {
  return Math.abs(total - quantity * unitPrice) <= Math.max(1, quantity / 2, unitPrice * 0.005);
}
