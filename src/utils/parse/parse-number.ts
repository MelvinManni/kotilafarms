// Read a typed number, ignoring ₦, commas and spaces; null when empty
export function parseNumber(text: string): number | null {
  const cleaned = text.replace(/[^0-9.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const value = Number(cleaned);
  return Number.isNaN(value) ? null : value;
}
