'use client';

import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import type { PriceMarketData } from '@oddmaki-protocol/sdk';
import { PYTH_FEED_MAP } from '../constants/pythFeeds';

interface PriceMarketInfoProps {
  data: PriceMarketData;
  outcomes?: string[];
}

function formatPythPrice(rawPrice: bigint, expo: number): string {
  const factor = Math.pow(10, expo);
  return (Number(rawPrice) * factor).toFixed(Math.abs(expo) > 4 ? 2 : Math.abs(expo));
}

function formatCountdown(closeTime: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = Number(closeTime) - now;

  if (remaining <= 0) return 'Expired';

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function PriceMarketInfo({ data, outcomes }: PriceMarketInfoProps) {
  const feed = PYTH_FEED_MAP.get(data.feedId);
  const feedName = feed?.symbol || data.feedId.slice(0, 10) + '...';
  const strikePriceFormatted = formatPythPrice(data.strikePrice, data.priceExpo);

  return (
    <Card className="bg-default-50">
      <CardBody className="gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-default-500">Price Feed</span>
          <Chip size="sm" variant="flat" color="primary">
            {feedName}
          </Chip>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-default-500">Reference Price</span>
          <span className="font-mono text-sm font-semibold">
            ${strikePriceFormatted}
          </span>
        </div>

        {data.resolved ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Final Price</span>
              <span className="font-mono text-sm">
                ${formatPythPrice(data.finalPrice, data.priceExpo)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Outcome</span>
              <Chip
                size="sm"
                color={data.finalPrice >= data.strikePrice ? 'primary' : 'secondary'}
              >
                {data.finalPrice >= data.strikePrice ? (outcomes?.[0] ?? 'Up') : (outcomes?.[1] ?? 'Down')}
              </Chip>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-default-500">Closes In</span>
            <span className="font-mono text-sm">
              {formatCountdown(data.closeTime)}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
