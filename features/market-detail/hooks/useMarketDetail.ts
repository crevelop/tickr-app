'use client';

import { useQuery } from '@tanstack/react-query';
import { useOddMakiClient } from '@/lib/oddmaki/hooks';
import { queryKeys } from '@/lib/oddmaki/queryKeys';
import { parseAncillaryData } from '@oddmaki-protocol/sdk';

export interface MarketDetail {
  // From subgraph
  marketId: string;
  conditionId: string;
  question: string;
  title: string;
  description: string;
  outcomes: string[];
  status: string;
  collateralToken: string;
  tickSize: string;
  totalVolume: string;
  totalOrders: string;
  uniqueTraders: string;
  lastPriceTick_0: string;
  lastPriceTick_1: string;
  lastTradeTimestamp: string;
  yesPrice: number;
  noPrice: number;
  volumeFormatted: string;
  metadataURI: string;
  createdAt: string;
  creator: string;
}

function tickToPercentage(tick: string | number, tickSize: string | number): number {
  const tickNum = typeof tick === 'string' ? parseFloat(tick) : tick;
  const tickSizeNum = typeof tickSize === 'string' ? parseFloat(tickSize) : tickSize;
  if (tickNum === 0 || tickSizeNum === 0) return 0;
  const price = (tickNum * tickSizeNum) / 1e18;
  return parseFloat((price * 100).toFixed(2));
}

function formatVolume(volume: string, decimals: number = 6): string {
  const vol = parseFloat(volume) / Math.pow(10, decimals);
  if (vol === 0) return '$0';
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
  return `$${vol.toFixed(0)}`;
}

/**
 * Hook to fetch full market detail from the subgraph.
 */
export function useMarketDetail(marketId: string) {
  const client = useOddMakiClient();

  return useQuery<MarketDetail | null>({
    queryKey: queryKeys.markets.detail(marketId),
    queryFn: async () => {
      const market = await client.public.getMarket(BigInt(marketId));
      if (!market) return null;

      const m = market as any;
      const { title, description } = parseAncillaryData(m.question || '');
      const yesPrice = tickToPercentage(m.lastPriceTick_0 || 0, m.tickSize || 0);
      const noPriceRaw = tickToPercentage(m.lastPriceTick_1 || 0, m.tickSize || 0);
      // Binary market: NO = 100 - YES when no direct NO trades have occurred
      const noPrice = noPriceRaw > 0 ? noPriceRaw : (yesPrice > 0 ? parseFloat((100 - yesPrice).toFixed(2)) : 0);

      return {
        marketId: m.marketId,
        conditionId: m.conditionId,
        question: m.question,
        title,
        description,
        outcomes: m.outcomes || ['Yes', 'No'],
        status: m.status,
        collateralToken: m.collateralToken,
        tickSize: m.tickSize,
        totalVolume: m.totalVolume || '0',
        totalOrders: m.totalOrders || '0',
        uniqueTraders: m.uniqueTraders || '0',
        lastPriceTick_0: m.lastPriceTick_0 || '0',
        lastPriceTick_1: m.lastPriceTick_1 || '0',
        lastTradeTimestamp: m.lastTradeTimestamp || '0',
        yesPrice,
        noPrice,
        volumeFormatted: formatVolume(m.totalVolume || '0', 6),
        metadataURI: m.metadataURI || '',
        createdAt: m.createdAt || '0',
        creator: m.creator?.id || m.creator?.address || '',
      };
    },
    enabled: !!marketId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
