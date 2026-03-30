/**
 * Contract Addresses
 *
 * Imports contract addresses from the OddMaki SDK.
 * This ensures we're always using the correct deployed contracts.
 */

import { CONTRACT_ADDRESSES, DEFAULT_CHAIN } from '@oddmaki-protocol/sdk';

// Re-export for easy access throughout the app
export const contracts = CONTRACT_ADDRESSES;
export const defaultChain = DEFAULT_CHAIN;

// Type-safe contract address access for a specific chain
export function getContractsForChain(chainId: keyof typeof CONTRACT_ADDRESSES) {
  return CONTRACT_ADDRESSES[chainId];
}

// Get contracts for the default chain
export function getDefaultContracts() {
  return CONTRACT_ADDRESSES[DEFAULT_CHAIN.id as keyof typeof CONTRACT_ADDRESSES];
}
