'use client';

import { useQuery } from '@tanstack/react-query';
import { useOddMakiClient } from '@/lib/oddmaki/hooks';
import { getVenueId } from '@/config/venue.config';
import { parseAncillaryData } from '@oddmaki-protocol/sdk';
import { queryKeys } from '@/lib/oddmaki/queryKeys';
import { tickToPercentage, formatVolume } from '../utils/formatting';
import type { Market, FormattedMarket, UnifiedFeedItem } from '../types';
import type {
  FormattedMarketGroup,
  FormattedGroupOutcome,
  MarketGroupStatus,
} from '@/features/market-groups/types';

/**
 * Transform raw standalone market to FormattedMarket
 * (same logic as useMarkets.ts formatMarket)
 */
function formatStandaloneMarket(market: Market): FormattedMarket {
  const yesPrice = tickToPercentage(market.lastPriceTick_0 || 0, market.tickSize || 0);
  const noPrice = tickToPercentage(market.lastPriceTick_1 || 0, market.tickSize || 0);
  const { title } = parseAncillaryData(market.question);

  return {
    ...market,
    question: title,
    yesPrice,
    noPrice,
    volumeFormatted: formatVolume(market.totalVolume || '0', 6),
  };
}

/**
 * Transform SDK-formatted group data into FormattedMarketGroup
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatGroup(sdkFormatted: any, rawGroup: any): FormattedMarketGroup {
  const outcomes: FormattedGroupOutcome[] = (sdkFormatted.outcomes || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (o: any) => ({
      marketId: o.marketId,
      name: o.name,
      question: o.question || '',
      probability: o.probability ? parseFloat(o.probability) * 100 : 0,
      status: o.status,
      totalVolume: o.totalVolume || '0',
      volumeFormatted: formatVolume(o.totalVolume || '0', 6),
      isPlaceholder: false,
    }),
  );

  // Sum volume across all child markets
  const totalVolume = (rawGroup.markets || [])
    .reduce(
      (sum: number, m: { totalVolume?: string }) =>
        sum + parseFloat(m.totalVolume || '0'),
      0,
    )
    .toString();

  return {
    groupId: sdkFormatted.groupId,
    marketQuestion: sdkFormatted.marketQuestion,
    status: sdkFormatted.status as MarketGroupStatus,
    totalMarkets: sdkFormatted.totalMarkets || '0',
    activeMarketCount: sdkFormatted.activeMarketCount || '0',
    resolvedMarketId: sdkFormatted.resolvedMarketId || '0',
    tags: rawGroup.tags || [],
    createdAt: sdkFormatted.createdAt || '0',
    activatedAt: rawGroup.activatedAt || null,
    resolvedAt: rawGroup.resolvedAt || null,
    creator: rawGroup.creator?.address || '',
    outcomes,
    totalVolume,
    volumeFormatted: formatVolume(totalVolume, 6),
  };
}

export function useUnifiedFeed(sortBy: 'created' | 'volume' = 'created') {
  const client = useOddMakiClient();
  const venueId = getVenueId();

  return useQuery<UnifiedFeedItem[]>({
    queryKey: queryKeys.unifiedFeed.list(venueId?.toString(), sortBy),
    queryFn: async () => {
      const feedData = await client.public.getUnifiedMarketFeed({
        venueId,
        first: 50,
        sortBy,
      });

      const merged = client.public.mergeAndSortFeed(feedData, sortBy);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return merged.map((item: any): UnifiedFeedItem => {
        if (item.type === 'standalone') {
          return { type: 'standalone', data: formatStandaloneMarket(item) };
        } else {
          const formatted = client.public.formatMarketGroupForDisplay(item);
          return { type: 'group', data: formatGroup(formatted, item) };
        }
      });
    },
    enabled: !!client && venueId !== undefined,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
