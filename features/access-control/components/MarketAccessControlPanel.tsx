'use client';

import { useState } from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { useVenueData } from '@/features/venue/hooks/useVenueData';
import { useMarketTradingAC } from '../hooks/useMarketTradingAC';
import { useWhitelistOwner } from '../hooks/useWhitelistOwner';
import { WhitelistManagementModal } from './WhitelistManagementModal';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface MarketAccessControlPanelProps {
  marketId: bigint;
  marketCreator: string;
}

export function MarketAccessControlPanel({
  marketId,
}: MarketAccessControlPanelProps) {
  const { venue, isOperator } = useVenueData();
  const { data: marketAC } = useMarketTradingAC(marketId);
  const [whitelistOpen, setWhitelistOpen] = useState(false);

  // Determine the effective trading AC for this market
  const hasMarketOverride = !!marketAC && marketAC !== ZERO_ADDRESS;
  const effectiveAC = hasMarketOverride
    ? marketAC
    : venue?.tradingAccessControl;
  const isPublic = !effectiveAC || effectiveAC === ZERO_ADDRESS;

  // Check if the effective AC is a manageable whitelist
  const { data: owner, error: ownerError } = useWhitelistOwner(
    isPublic ? undefined : (effectiveAC as `0x${string}`),
  );
  const isWhitelist = !isPublic && !!owner && !ownerError;

  // Only show panel to venue operator
  if (!isOperator) return null;

  return (
    <>
      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-md font-semibold">Trading Access Control</h3>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {/* Effective AC status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-default-500">Status</span>
            {isPublic ? (
              <Chip size="sm" variant="flat" color="primary">
                Public
              </Chip>
            ) : (
              <div className="flex items-center gap-2">
                <Chip
                  size="sm"
                  variant="flat"
                  color={hasMarketOverride ? 'secondary' : 'default'}
                >
                  {hasMarketOverride ? 'Market Override' : 'Venue Level'}
                </Chip>
                <span className="font-mono text-xs">
                  {truncateAddress(effectiveAC!)}
                </span>
              </div>
            )}
          </div>

          {/* Manage whitelist button */}
          {isWhitelist && (
            <Button
              variant="flat"
              size="sm"
              onPress={() => setWhitelistOpen(true)}
            >
              Manage Whitelist
            </Button>
          )}
        </CardBody>
      </Card>

      {isWhitelist && effectiveAC && (
        <WhitelistManagementModal
          isOpen={whitelistOpen}
          onClose={() => setWhitelistOpen(false)}
          acContract={effectiveAC as `0x${string}`}
          title={
            hasMarketOverride
              ? 'Market Trading Whitelist'
              : 'Venue Trading Whitelist'
          }
        />
      )}
    </>
  );
}
