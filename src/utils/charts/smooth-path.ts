// Smooth SVG path through points (Catmull-Rom as cubic Béziers)
export type Point = [number, number];

export function smoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(points[0]![0])} ${f(points[0]![1])}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 2] ?? points[i - 1]!;
    const p1 = points[i - 1]!;
    const p2 = points[i]!;
    const p3 = points[i + 1] ?? p2;
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}
