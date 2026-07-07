export function median(values: number[]): number {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function mad(values: number[]): number {
  if (values.length === 0) return NaN;
  const med = median(values);
  return median(values.map((v) => Math.abs(v - med)));
}

// shift(1).rolling(window, minPeriods).median()
// At index i: median of values[max(0, i-window) : i]
export function shiftedRollingMedian(
  values: (number | null)[],
  window: number,
  minPeriods: number
): (number | null)[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window), i).filter((v): v is number => v !== null);
    return slice.length >= minPeriods ? median(slice) : null;
  });
}

// shift(1).rolling(window, minPeriods).apply(mad)
export function shiftedRollingMAD(
  values: (number | null)[],
  window: number,
  minPeriods: number
): (number | null)[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window), i).filter((v): v is number => v !== null);
    return slice.length >= minPeriods ? mad(slice) : null;
  });
}

// shift(1).rolling(window, minPeriods).mean()
export function shiftedRollingMean(
  values: (number | null)[],
  window: number,
  minPeriods: number
): (number | null)[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window), i).filter((v): v is number => v !== null);
    if (slice.length < minPeriods) return null;
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

// shift(1).rolling(window, minPeriods).min()
export function shiftedRollingMin(
  values: (number | null)[],
  window: number,
  minPeriods: number
): (number | null)[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window), i).filter((v): v is number => v !== null);
    return slice.length >= minPeriods ? Math.min(...slice) : null;
  });
}

// shift(1).rolling(window, minPeriods=1).sum().fillna(0)
// values are boolean — counts trues in the shifted window
export function shiftedRollingSum(values: boolean[], window: number): number[] {
  return values.map((_, i) => {
    return values.slice(Math.max(0, i - window), i).filter(Boolean).length;
  });
}

// diff().rolling(window, minPeriods).mean()
// At index i: mean of diffs[max(0, i-window+1) : i+1]
export function diffRollingMean(values: number[], window: number, minPeriods: number): (number | null)[] {
  const diffs: (number | null)[] = values.map((v, i) => (i === 0 ? null : v - values[i - 1]));
  return diffs.map((_, i) => {
    const slice = diffs.slice(Math.max(0, i - window + 1), i + 1).filter((v): v is number => v !== null);
    if (slice.length < minPeriods) return null;
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

// Consecutive True streak counter (mirrors pandas groupby cumcount pattern)
export function consecutiveStreak(values: boolean[]): number[] {
  const result: number[] = new Array(values.length).fill(0);
  let streak = 0;
  for (let i = 0; i < values.length; i++) {
    streak = values[i] ? streak + 1 : 0;
    result[i] = values[i] ? streak : 0;
  }
  return result;
}
