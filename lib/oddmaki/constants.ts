/**
 * Protocol Constants
 *
 * Common constants used across venue-app features.
 */

import { CONTRACT_ADDRESSES, DEFAULT_CHAIN } from '@oddmaki-protocol/sdk';
import type { Address } from 'viem';

export const MAX_UINT256 = BigInt(
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
);

const addresses = CONTRACT_ADDRESSES[DEFAULT_CHAIN.id as keyof typeof CONTRACT_ADDRESSES];

export const DIAMOND_ADDRESS: Address = addresses.diamond;
export const USDC_ADDRESS: Address = addresses.usdc;
export const CTF_ADDRESS: Address = addresses.conditionalTokens;

/** USDC uses 6 decimals */
export const USDC_DECIMALS = 6;
