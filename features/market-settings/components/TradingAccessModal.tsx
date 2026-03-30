'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { isAddress } from 'viem';
import { useVenueData } from '@/features/venue/hooks/useVenueData';
import { useMarketTradingAC, useWhitelistOwner, WhitelistManagementModal } from '@/features/access-control';
import { useSetMarketTradingAC } from '../hooks/useSetMarketTradingAC';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface TradingAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
}

export function TradingAccessModal({ isOpen, onClose, marketId }: TradingAccessModalProps) {
  const { venue } = useVenueData();
  const { data: marketAC } = useMarketTradingAC(BigInt(marketId));
  const { setMarketTradingAC, removeMarketTradingAC, isLoading } = useSetMarketTradingAC(marketId);
  const [acInput, setAcInput] = useState('');
  const [whitelistOpen, setWhitelistOpen] = useState(false);

  // Determine effective AC
  const hasMarketOverride = !!marketAC && marketAC !== ZERO_ADDRESS;
  const effectiveAC = hasMarketOverride ? marketAC : venue?.tradingAccessControl;
  const isPublic = !effectiveAC || effectiveAC === ZERO_ADDRESS;

  // Check if effective AC is a whitelist
  const { data: owner, error: ownerError } = useWhitelistOwner(
    isPublic ? undefined : (effectiveAC as `0x${string}`),
  );
  const isWhitelist = !isPublic && !!owner && !ownerError;

  const handleSetAC = async () => {
    if (!isAddress(acInput)) return;
    const hash = await setMarketTradingAC(acInput as `0x${string}`);
    if (hash) setAcInput('');
  };

  const handleRemoveOverride = async () => {
    const hash = await removeMarketTradingAC();
    if (hash) setAcInput('');
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>Trading Access Control</ModalHeader>
          <ModalBody>
            {/* Current status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Current Status</span>
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

            {/* Whitelist management */}
            {isWhitelist && (
              <Button
                variant="flat"
                size="sm"
                onPress={() => setWhitelistOpen(true)}
              >
                Manage Whitelist
              </Button>
            )}

            <Divider />

            {/* Set market-level AC override */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Set Market-Level Override</span>
              <p className="text-xs text-default-400">
                Override the venue-level trading access with a market-specific contract.
              </p>
              <div className="flex gap-2">
                <Input
                  size="sm"
                  placeholder="0x... access control contract"
                  value={acInput}
                  onValueChange={setAcInput}
                  isInvalid={acInput.length > 0 && !isAddress(acInput)}
                  errorMessage={acInput.length > 0 && !isAddress(acInput) ? 'Invalid address' : undefined}
                />
                <Button
                  size="sm"
                  color="primary"
                  onPress={handleSetAC}
                  isLoading={isLoading}
                  isDisabled={!isAddress(acInput)}
                >
                  Set
                </Button>
              </div>
            </div>

            {/* Remove override */}
            {hasMarketOverride && (
              <>
                <Divider />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Remove Market Override</span>
                  <p className="text-xs text-default-400">
                    Remove the market-level override to fall back to venue-level access control.
                  </p>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    onPress={handleRemoveOverride}
                    isLoading={isLoading}
                  >
                    Remove Override
                  </Button>
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
