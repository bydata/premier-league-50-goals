export const F_BODY = "var(--font-body)";
export const F_CONDENSED = "var(--font-condensed)";
export const F_HEADLINE = "var(--font-headline)";

export function goalsPerMatch(cumulative) {
  const sorted = [...cumulative].sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const g of sorted) {
    out.push(g - prev);
    prev = g;
  }
  return out;
}

export function clipAt50(arr) {
  const pts = [[0, 0]];
  for (let i = 0; i < arr.length; i++) {
    pts.push([i + 1, arr[i]]);
    if (arr[i] >= 50) break;
  }
  return pts;
}

export function meanOf(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}
