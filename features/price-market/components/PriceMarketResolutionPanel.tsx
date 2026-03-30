'use client';

import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { useConnection } from 'wagmi';
import type { PriceMarketData } from '@oddmaki-protocol/sdk';
import { useResolvePriceMarket } from '../hooks/useResolvePriceMarket';

interface PriceMarketResolutionPanelProps {
  marketId: bigint;
  canResolve: boolean;
  data: PriceMarketData;
}

function formatCountdown(targetTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = Number(targetTime) - now;

  if (remaining <= 0) return 'Expired';

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function PriceMarketResolutionPanel({
  marketId,
  canResolve,
  data,
}: PriceMarketResolutionPanelProps) {
  const { isConnected } = useConnection();
  const { resolvePriceMarket, isLoading } = useResolvePriceMarket(marketId);

  const now = Math.floor(Date.now() / 1000);
  const isBeforeClose = now < Number(data.closeTime);

  return (
    <Card>
      <CardHeader className="flex-col items-start">
        <h2 className="text-lg font-semibold">On-Chain Resolution</h2>
        <p className="text-sm text-default-400 mt-1">
          Resolve using verified Pyth Network price data. Permissionless — no bond required.
        </p>
      </CardHeader>
      <CardBody>
        {isBeforeClose ? (
          <p className="text-sm text-default-500">
            Market closes in{' '}
            <span className="font-semibold">{formatCountdown(data.closeTime)}</span>.
            Resolution will be available after close.
          </p>
        ) : canResolve ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-default-500">
              The market has closed. Anyone can resolve it on-chain using Pyth price data.
            </p>
            <Button
              color="primary"
              isDisabled={!isConnected}
              isLoading={isLoading}
              onPress={resolvePriceMarket}
              className="w-full"
            >
              {!isConnected ? 'Connect Wallet' : 'Resolve with Pyth'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-default-400">
            This market has already been resolved.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
