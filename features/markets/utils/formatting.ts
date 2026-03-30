/**
 * Shared formatting utilities for market price/volume display.
 */

/**
 * Convert a tick value + tickSize to percentage (0-100)
 * price = tick * tickSize / 1e18, percentage = price * 100
 *
 * With default tickSize of 0.01e18: tick 80 → 80%
 */
export function tickToPercentage(tick: string | number, tickSize: string | number): number {
  const tickNum = typeof tick === 'string' ? parseFloat(tick) : tick;
  const tickSizeNum = typeof tickSize === 'string' ? parseFloat(tickSize) : tickSize;

  if (tickNum === 0 || tickSizeNum === 0) return 0;

  const price = (tickNum * tickSizeNum) / 1e18;
  return parseFloat((price * 100).toFixed(2));
}

/**
 * Format market volume to human-readable string
 * Volume is in base units (e.g., USDC with 6 decimals), so divide by 1e6
 */
export function formatVolume(volume: string, decimals: number = 6): string {
  const vol = parseFloat(volume) / Math.pow(10, decimals);
  if (vol === 0) return '$0';
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
  return `$${vol.toFixed(0)}`;
}
