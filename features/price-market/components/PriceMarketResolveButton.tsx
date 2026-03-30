'use client';

import { Button } from '@heroui/button';
import { useResolvePriceMarket } from '../hooks/useResolvePriceMarket';

interface PriceMarketResolveButtonProps {
  marketId: bigint;
  canResolve: boolean;
}

export function PriceMarketResolveButton({
  marketId,
  canResolve,
}: PriceMarketResolveButtonProps) {
  const { resolvePriceMarket, isLoading } = useResolvePriceMarket(marketId);

  if (!canResolve) return null;

  return (
    <Button
      color="primary"
      variant="flat"
      onPress={resolvePriceMarket}
      isLoading={isLoading}
      size="sm"
    >
      Resolve On-Chain
    </Button>
  );
}
