// Up to two initials from a name: "Chinedu Okafor" → "CO"
export function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
  return letters || "?";
}
