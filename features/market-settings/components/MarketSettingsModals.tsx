'use client';

import { TagsModal } from './TagsModal';
import { TradingAccessModal } from './TradingAccessModal';
import { PauseMarketModal } from './PauseMarketModal';
import { MetadataModal } from './MetadataModal';

export type SettingsAction = 'tags' | 'trading-access' | 'pause' | 'metadata';

interface MarketSettingsModalsProps {
  activeModal: SettingsAction | null;
  onClose: () => void;
  marketId: string;
}

export function MarketSettingsModals({ activeModal, onClose, marketId }: MarketSettingsModalsProps) {
  return (
    <>
      <TagsModal
        isOpen={activeModal === 'tags'}
        onClose={onClose}
        marketId={marketId}
      />
      <TradingAccessModal
        isOpen={activeModal === 'trading-access'}
        onClose={onClose}
        marketId={marketId}
      />
      <PauseMarketModal
        isOpen={activeModal === 'pause'}
        onClose={onClose}
        marketId={marketId}
      />
      <MetadataModal
        isOpen={activeModal === 'metadata'}
        onClose={onClose}
        marketId={marketId}
      />
    </>
  );
}
