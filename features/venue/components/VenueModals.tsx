'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Input, Textarea } from '@heroui/input';
import { Switch } from '@heroui/switch';
import { formatUnits, parseUnits } from 'viem';
import type { VenueMetadata } from '@oddmaki-protocol/sdk';
import type { VenueData } from '../hooks/useVenueData';
import {
  useUpdateVenueFees,
  useUpdateOracleParams,
  useToggleVenuePause,
  useUpdateVenue,
} from '../hooks/useVenueManagement';
import { USDC_DECIMALS } from '@/lib/oddmaki/constants';
import { useWhitelistOwner } from '@/features/access-control/hooks/useWhitelistOwner';
import { WhitelistManagementModal } from '@/features/access-control/components/WhitelistManagementModal';
import { useMetadata } from '@/lib/ipfs/useMetadata';
import { uploadToIPFS } from '@/lib/ipfs';
import { shortenAddress } from '@/lib/identity/pseudonym';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export type SectionKey =
  | 'access-control'
  | 'fees'
  | 'oracle'
  | 'general'
  | 'branding'
  | 'whitelist-trading'
  | 'whitelist-creation';

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-default-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function AccessControlRow({
  label,
  acAddress,
  onManage,
}: {
  label: string;
  acAddress: string;
  onManage?: () => void;
}) {
  const isPublic = acAddress === ZERO_ADDRESS;
  const { data: owner, error: ownerError } = useWhitelistOwner(
    isPublic ? undefined : (acAddress as `0x${string}`),
  );
  const isWhitelist = !isPublic && !!owner && !ownerError;

  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-default-500">{label}</span>
      <div className="flex items-center gap-2">
        {isPublic ? (
          <Chip size="sm" variant="flat" color="primary">
            Public
          </Chip>
        ) : (
          <span className="font-mono text-xs">
            {shortenAddress(acAddress)}
          </span>
        )}
        {isWhitelist && onManage && (
          <Button size="sm" variant="flat" onPress={onManage}>
            Manage
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Access Control Modal ──────────────────────────────────────────────

export function AccessControlModal({
  isOpen,
  onClose,
  venue,
  onManageWhitelist,
}: {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueData;
  onManageWhitelist: (key: 'whitelist-trading' | 'whitelist-creation') => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Access Control</ModalHeader>
        <ModalBody>
          <AccessControlRow
            label="Trading"
            acAddress={venue.tradingAccessControl}
            onManage={() => onManageWhitelist('whitelist-trading')}
          />
          <AccessControlRow
            label="Market Creation"
            acAddress={venue.creationAccessControl}
            onManage={() => onManageWhitelist('whitelist-creation')}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Fees Modal ────────────────────────────────────────────────────────

export function FeesModal({
  isOpen,
  onClose,
  venue,
}: {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueData;
}) {
  const [venueFee, setVenueFee] = useState('');
  const [creatorFee, setCreatorFee] = useState('');
  const { updateFees, isLoading } = useUpdateVenueFees();

  useEffect(() => {
    if (isOpen) {
      setVenueFee(venue.venueFeeBps.toString());
      setCreatorFee(venue.creatorFeeBps.toString());
    }
  }, [isOpen, venue.venueFeeBps, venue.creatorFeeBps]);

  const handleSave = async () => {
    const vf = parseInt(venueFee, 10);
    const cf = parseInt(creatorFee, 10);
    if (isNaN(vf) || isNaN(cf)) return;
    await updateFees(vf, cf);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Fees</ModalHeader>
        <ModalBody>
          <Input
            label="Venue Fee (bps)"
            description="Trading fee in basis points (1-200). 100 bps = 1%."
            type="number"
            value={venueFee}
            onValueChange={setVenueFee}
          />
          <Input
            label="Creator Fee (bps)"
            description={`Portion of venue fee shared with market creator (0-${venueFee}).`}
            type="number"
            value={creatorFee}
            onValueChange={setCreatorFee}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={isLoading}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Oracle Modal ──────────────────────────────────────────────────────

export function OracleModal({
  isOpen,
  onClose,
  venue,
}: {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueData;
}) {
  const [reward, setReward] = useState('');
  const [bond, setBond] = useState('');
  const { updateOracleParams, isLoading } = useUpdateOracleParams();

  useEffect(() => {
    if (isOpen) {
      setReward(formatUnits(venue.umaRewardAmount, USDC_DECIMALS));
      setBond(formatUnits(venue.umaMinBond, USDC_DECIMALS));
    }
  }, [isOpen, venue.umaRewardAmount, venue.umaMinBond]);

  const handleSave = async () => {
    const r = parseFloat(reward);
    const b = parseFloat(bond);
    if (isNaN(r) || isNaN(b)) return;
    await updateOracleParams(
      parseUnits(reward, USDC_DECIMALS),
      parseUnits(bond, USDC_DECIMALS),
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Oracle</ModalHeader>
        <ModalBody>
          <Input
            label="UMA Reward (USDC)"
            description="Reward paid to the UMA asserter on successful resolution."
            type="number"
            value={reward}
            onValueChange={setReward}
          />
          <Input
            label="Min Bond (USDC)"
            description="Minimum bond required to submit a UMA assertion."
            type="number"
            value={bond}
            onValueChange={setBond}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={isLoading}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── General Info Modal ────────────────────────────────────────────────

export function GeneralModal({
  isOpen,
  onClose,
  venue,
}: {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueData;
}) {
  const { togglePause, isLoading: isPauseLoading } = useToggleVenuePause();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>General</ModalHeader>
        <ModalBody>
          <InfoRow
            label="Status"
            value={
              <div className="flex items-center gap-2">
                <Chip
                  size="sm"
                  color={venue.active ? 'primary' : 'danger'}
                  variant="flat"
                >
                  {venue.active ? 'Active' : 'Paused'}
                </Chip>
                <Switch
                  size="sm"
                  isSelected={venue.active}
                  isDisabled={isPauseLoading}
                  onValueChange={() => togglePause(venue.active)}
                />
              </div>
            }
          />
          <Divider className="my-1" />
          <InfoRow label="Venue ID" value={venue.venueId} />
          <InfoRow label="Name" value={venue.name} />
          <InfoRow
            label="Operator"
            value={
              <span className="font-mono text-xs">
                {shortenAddress(venue.operator)}
              </span>
            }
          />
          <InfoRow
            label="Fee Recipient"
            value={
              <span className="font-mono text-xs">
                {shortenAddress(venue.feeRecipient)}
              </span>
            }
          />
          <Divider className="my-1" />
          <InfoRow
            label="Default Tick Size"
            value={formatUnits(venue.defaultTickSize, 18)}
          />
          <InfoRow
            label="Market Creation Fee"
            value={`${formatUnits(venue.marketCreationFee, USDC_DECIMALS)} USDC`}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Branding Modal ───────────────────────────────────────────────────

export function BrandingModal({
  isOpen,
  onClose,
  venue,
}: {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueData;
}) {
  const { data: existingMetadata } = useMetadata<VenueMetadata>(
    venue.metadata || undefined,
  );
  const { updateVenue, isLoading } = useUpdateVenue();

  const [venueUrl, setVenueUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && existingMetadata) {
      setVenueUrl(existingMetadata.venue_url ?? '');
      setDescription(existingMetadata.description ?? '');
    } else if (isOpen) {
      setVenueUrl('');
      setDescription('');
    }
  }, [isOpen, existingMetadata]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const hasMetadata = venueUrl.trim() || description.trim();
      let metadataURI = '';

      if (hasMetadata) {
        const metadata: VenueMetadata = {
          version: 1,
          ...(venueUrl.trim() && { venue_url: venueUrl.trim() }),
          ...(description.trim() && { description: description.trim() }),
        };
        metadataURI = await uploadToIPFS(metadata);
      }

      await updateVenue({
        name: venue.name,
        metadata: metadataURI,
        tradingAccessControl: venue.tradingAccessControl,
        creationAccessControl: venue.creationAccessControl,
        feeRecipient: venue.feeRecipient,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Branding</ModalHeader>
        <ModalBody>
          <Input
            label="Venue URL"
            placeholder="https://yoursite.com"
            description="Your project or venue website URL."
            value={venueUrl}
            onValueChange={setVenueUrl}
          />
          <Textarea
            label="Description"
            placeholder="A brief description of your venue..."
            description="Describe what your venue is about."
            value={description}
            onValueChange={setDescription}
            minRows={2}
            maxRows={4}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={isSaving || isLoading}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Container ────────────────────────────────────────────────────────

export function VenueModalsContainer({
  activeModal,
  onClose,
  venue,
  onManageWhitelist,
}: {
  activeModal: SectionKey | null;
  onClose: () => void;
  venue: VenueData;
  onManageWhitelist: (key: 'whitelist-trading' | 'whitelist-creation') => void;
}) {
  return (
    <>
      <GeneralModal
        isOpen={activeModal === 'general'}
        onClose={onClose}
        venue={venue}
      />
      <BrandingModal
        isOpen={activeModal === 'branding'}
        onClose={onClose}
        venue={venue}
      />
      <AccessControlModal
        isOpen={activeModal === 'access-control'}
        onClose={onClose}
        venue={venue}
        onManageWhitelist={onManageWhitelist}
      />
      <FeesModal
        isOpen={activeModal === 'fees'}
        onClose={onClose}
        venue={venue}
      />
      <OracleModal
        isOpen={activeModal === 'oracle'}
        onClose={onClose}
        venue={venue}
      />
      {venue.tradingAccessControl !== ZERO_ADDRESS && (
        <WhitelistManagementModal
          isOpen={activeModal === 'whitelist-trading'}
          onClose={onClose}
          acContract={venue.tradingAccessControl as `0x${string}`}
          title="Trading Whitelist"
        />
      )}
      {venue.creationAccessControl !== ZERO_ADDRESS && (
        <WhitelistManagementModal
          isOpen={activeModal === 'whitelist-creation'}
          onClose={onClose}
          acContract={venue.creationAccessControl as `0x${string}`}
          title="Creation Whitelist"
        />
      )}
    </>
  );
}
