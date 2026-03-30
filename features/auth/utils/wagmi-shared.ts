/**
 * Shared Wagmi Configuration
 *
 * Chain and transport config reused by all auth provider adapters.
 * Each adapter imports these to build its own wagmi config.
 */

import { baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const supportedChains = [baseSepolia] as const;

export const transports = {
  [baseSepolia.id]: http(),
} as const;
