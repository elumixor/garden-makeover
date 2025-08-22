/**
 * Linearly interpolate between two hex colors.
 * @param a Hex color string (e.g. "#fff700")
 * @param b Hex color string (e.g. "#ffeebb")
 * @param t Interpolation factor (0..1)
 * @returns Interpolated hex color string
 */
export function lerpColor(a: string, b: string, t: number): string {
  const ah = a.startsWith("#") ? a.slice(1) : a;
  const bh = b.startsWith("#") ? b.slice(1) : b;
  const av = [parseInt(ah.substring(0, 2), 16), parseInt(ah.substring(2, 4), 16), parseInt(ah.substring(4, 6), 16)];
  const bv = [parseInt(bh.substring(0, 2), 16), parseInt(bh.substring(2, 4), 16), parseInt(bh.substring(4, 6), 16)];
  const rv = av.map((v, i) => Math.round(v + (bv[i] - v) * t));
  return `#${rv.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}
