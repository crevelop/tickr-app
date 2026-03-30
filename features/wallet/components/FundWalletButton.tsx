'use client';

import { Button } from '@heroui/button';
import { useMintUSDC } from '../hooks/useMintUSDC';

export function FundWalletButton() {
  const { mint, isMinting } = useMintUSDC();

  return (
    <Button
      color="primary"
      variant="flat"
      size="sm"
      onPress={mint}
      isLoading={isMinting}
      className="w-full"
    >
      {isMinting ? 'Minting...' : 'Mint 1,000 USDC'}
    </Button>
  );
}
