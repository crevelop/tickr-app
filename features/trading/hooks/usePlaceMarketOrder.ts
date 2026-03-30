'use client';

import { useCallback } from 'react';
import { useConnection, usePublicClient } from 'wagmi';
import { useOddMakiClient } from '@/lib/oddmaki/hooks';
import { queryKeys } from '@/lib/oddmaki/queryKeys';
import {
  USDC_ADDRESS,
  DIAMOND_ADDRESS,
  USDC_DECIMALS,
} from '@/lib/oddmaki/constants';
import { useTransactionFlow, waitForAllowance } from '@/lib/oddmaki/useTransactionFlow';
import type { FlowStep } from '@/lib/oddmaki/useTransactionFlow';

interface PlaceMarketOrderParams {
  marketId: string;
  outcomeIndex: 0 | 1;
  amount: string;
  maxPrice: string;
  orderType: 'FOK' | 'FAK';
}

export function usePlaceMarketOrder() {
  const client = useOddMakiClient();
  const { address } = useConnection();
  const publicClient = usePublicClient();

  const flow = useTransactionFlow({
    invalidateKeys: [
      queryKeys.markets.all,
      queryKeys.positions.all,
      queryKeys.balance.all,
      queryKeys.trades.all,
      queryKeys.orderbook.all,
    ],
  });

  const startPlaceMarketOrder = useCallback(
    async (params: PlaceMarketOrderParams) => {
      if (!address || !publicClient) return;

      const usdcAmount = BigInt(
        Math.round(parseFloat(params.amount) * Math.pow(10, USDC_DECIMALS)),
      );

      const steps: FlowStep[] = [
        {
          id: 'usdc-approval',
          label: `USDC Approval ($${params.amount})`,
          shouldSkip: async () => {
            const allowance = (await client.token.getAllowance(
              USDC_ADDRESS,
              address,
              DIAMOND_ADDRESS,
            )) as bigint;
            return allowance >= usdcAmount;
          },
          execute: async () => {
            const hash = await client.token.approve(
              USDC_ADDRESS,
              DIAMOND_ADDRESS,
              usdcAmount,
            );
            await publicClient.waitForTransactionReceipt({ hash });
            await waitForAllowance(
              publicClient,
              USDC_ADDRESS,
              address,
              DIAMOND_ADDRESS,
              usdcAmount,
            );
          },
        },
        {
          id: 'place-market-order',
          label: 'Place Market Order',
          execute: async () => {
            const hash = await client.trade.placeMarketOrderSimple({
              marketId: BigInt(params.marketId),
              outcomeId: BigInt(params.outcomeIndex),
              amount: params.amount,
              maxPrice: params.maxPrice,
              orderType: params.orderType,
            });
            await publicClient.waitForTransactionReceipt({ hash });
          },
        },
      ];

      await flow.start(steps);
    },
    [address, client, publicClient, flow],
  );

  return {
    startPlaceMarketOrder,
    flow,
  };
}
