export interface ChartDataPoint {
  time: number; // Unix timestamp in seconds
  value: number; // Price as decimal (e.g., 0.65)
}

/**
 * Convert raw trade data from subgraph into chart data points.
 * Filters by outcome index and converts tick to decimal price.
 */
export function tradesToChartData(
  trades: Array<{ tick: string; timestamp: string; outcome: string }>,
  tickSize: string,
  outcomeIndex: number,
): ChartDataPoint[] {
  const tickSizeNum = parseFloat(tickSize);
  if (tickSizeNum === 0) return [];

  return trades
    .filter((t) => parseInt(t.outcome) === outcomeIndex)
    .map((t) => ({
      time: parseInt(t.timestamp),
      value: (parseFloat(t.tick) * tickSizeNum) / 1e18,
    }));
}

/**
 * Deduplicate data points by timestamp.
 * When multiple trades occur at the same second, keep the last one
 * (it represents the most recent price at that timestamp).
 */
export function deduplicateByTimestamp(
  data: ChartDataPoint[],
): ChartDataPoint[] {
  const map = new Map<number, ChartDataPoint>();
  for (const point of data) {
    map.set(point.time, point);
  }
  return Array.from(map.values()).sort((a, b) => a.time - b.time);
}

/**
 * Largest Triangle Three Buckets (LTTB) downsampling.
 * Reduces data points to `threshold` while preserving visual shape.
 * Returns input as-is if length <= threshold.
 */
export function downsampleLTTB(
  data: ChartDataPoint[],
  threshold: number,
): ChartDataPoint[] {
  if (data.length <= threshold || threshold < 3) return data;

  const sampled: ChartDataPoint[] = [data[0]];
  const bucketSize = (data.length - 2) / (threshold - 2);

  let prevIndex = 0;

  for (let i = 1; i < threshold - 1; i++) {
    const bucketStart = Math.floor((i - 1) * bucketSize) + 1;
    const bucketEnd = Math.min(
      Math.floor(i * bucketSize) + 1,
      data.length - 1,
    );

    // Calculate average point in next bucket (for triangle area)
    const nextBucketStart = Math.floor(i * bucketSize) + 1;
    const nextBucketEnd = Math.min(
      Math.floor((i + 1) * bucketSize) + 1,
      data.length,
    );

    let avgTime = 0;
    let avgValue = 0;
    let nextCount = 0;

    for (let j = nextBucketStart; j < nextBucketEnd; j++) {
      avgTime += data[j].time;
      avgValue += data[j].value;
      nextCount++;
    }

    if (nextCount > 0) {
      avgTime /= nextCount;
      avgValue /= nextCount;
    }

    // Find point in current bucket with max triangle area
    let maxArea = -1;
    let maxIndex = bucketStart;
    const prev = data[prevIndex];

    for (let j = bucketStart; j < bucketEnd; j++) {
      const area = Math.abs(
        (prev.time - avgTime) * (data[j].value - prev.value) -
          (prev.time - data[j].time) * (avgValue - prev.value),
      );
      if (area > maxArea) {
        maxArea = area;
        maxIndex = j;
      }
    }

    sampled.push(data[maxIndex]);
    prevIndex = maxIndex;
  }

  sampled.push(data[data.length - 1]);
  return sampled;
}

/** Target number of data points for the chart */
export const CHART_MAX_POINTS = 150;

/**
 * Pad chart data to fill the entire time window with evenly-spaced points.
 * Generates ~100 synthetic points in leading/trailing gaps so the time axis
 * displays proper labels across the full window.
 */
export function padToTimeWindow(
  data: ChartDataPoint[],
  windowStart: number,
  windowEnd: number,
  fallbackPrice?: number,
): ChartDataPoint[] {
  if (data.length === 0 && fallbackPrice === undefined) return [];

  const duration = windowEnd - windowStart;
  const step = Math.max(Math.floor(duration / 100), 60);

  const leadValue = data.length > 0 ? data[0].value : fallbackPrice!;
  const trailValue = data.length > 0 ? data[data.length - 1].value : fallbackPrice!;

  const result: ChartDataPoint[] = [];

  // Leading fill: from windowStart up to (but not including) first real point
  const firstDataTime = data.length > 0 ? data[0].time : windowEnd;
  for (let t = windowStart; t < firstDataTime; t += step) {
    result.push({ time: t, value: leadValue });
  }

  // Real data points
  for (const point of data) {
    result.push(point);
  }

  // Trailing fill: from after last real point to windowEnd
  const lastDataTime = data.length > 0 ? data[data.length - 1].time : windowStart;
  for (let t = lastDataTime + step; t < windowEnd; t += step) {
    result.push({ time: t, value: trailValue });
  }

  // Always include the exact window end
  if (result.length === 0 || result[result.length - 1].time < windowEnd) {
    result.push({ time: windowEnd, value: trailValue });
  }

  return result;
}
