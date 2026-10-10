/** Small numerical helpers: quantiles, moments and a Cholesky factorisation. */

/** Linear-interpolation quantile (type 7, as in R and NumPy) of an ascending-sorted array. */
export function quantileSorted(sorted: ArrayLike<number>, p: number): number {
  const n = sorted.length;
  if (n === 0) return NaN;
  if (p <= 0) return sorted[0];
  if (p >= 1) return sorted[n - 1];
  const h = (n - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.min(lo + 1, n - 1);
  return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
}

export function sortedCopy(values: ArrayLike<number>): Float64Array {
  const out = Float64Array.from(values as ArrayLike<number>);
  out.sort();
  return out;
}

export function mean(values: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < values.length; i++) s += values[i];
  return s / values.length;
}

export function standardDeviation(values: ArrayLike<number>): number {
  const m = mean(values);
  let s = 0;
  for (let i = 0; i < values.length; i++) s += (values[i] - m) ** 2;
  return Math.sqrt(s / (values.length - 1));
}

export function correlation(x: ArrayLike<number>, y: ArrayLike<number>): number {
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < x.length; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}

/** Lower-triangular L with L·Lᵀ = m. Throws if m is not positive definite. */
export function cholesky(m: number[][]): number[][] {
  const n = m.length;
  const l = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = m[i][j];
      for (let k = 0; k < j; k++) s -= l[i][k] * l[j][k];
      if (i === j) {
        if (s <= 0) throw new Error('Correlation matrix is not positive definite');
        l[i][j] = Math.sqrt(s);
      } else {
        l[i][j] = s / l[j][j];
      }
    }
  }
  return l;
}
