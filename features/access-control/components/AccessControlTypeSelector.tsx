'use client';

import { Select, SelectItem } from '@heroui/select';
import { Input } from '@heroui/input';
import type { AccessControlType } from '../hooks/useDeployAccessControl';

const AC_TYPE_OPTIONS = [
  { key: 'public', label: 'Public (no restrictions)' },
  { key: 'whitelist', label: 'Whitelist' },
  { key: 'nft-erc721', label: 'NFT Gated (ERC-721)' },
  { key: 'nft-erc1155', label: 'NFT Gated (ERC-1155)' },
  { key: 'token', label: 'Token Gated (ERC-20)' },
  { key: 'custom', label: 'Custom Contract Address' },
];

interface AccessControlTypeSelectorProps {
  label: string;
  value: AccessControlType;
  onChange: (type: AccessControlType) => void;
  customAddress?: string;
  onCustomAddressChange?: (address: string) => void;
  nftContract?: string;
  onNftContractChange?: (address: string) => void;
  nftTokenId?: string;
  onNftTokenIdChange?: (tokenId: string) => void;
  tokenContract?: string;
  onTokenContractChange?: (address: string) => void;
  tokenMinBalance?: string;
  onTokenMinBalanceChange?: (balance: string) => void;
}

export function AccessControlTypeSelector({
  label,
  value,
  onChange,
  customAddress = '',
  onCustomAddressChange,
  nftContract = '',
  onNftContractChange,
  nftTokenId = '0',
  onNftTokenIdChange,
  tokenContract = '',
  onTokenContractChange,
  tokenMinBalance = '',
  onTokenMinBalanceChange,
}: AccessControlTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <Select
        label={label}
        selectedKeys={[value]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          if (selected) onChange(selected as AccessControlType);
        }}
        size="sm"
      >
        {AC_TYPE_OPTIONS.map((opt) => (
          <SelectItem key={opt.key}>{opt.label}</SelectItem>
        ))}
      </Select>

      {(value === 'nft-erc721' || value === 'nft-erc1155') && (
        <>
          <Input
            label="NFT Contract Address"
            placeholder="0x..."
            value={nftContract}
            onValueChange={onNftContractChange}
            size="sm"
          />
          {value === 'nft-erc1155' && (
            <Input
              label="Token ID"
              placeholder="0"
              type="number"
              value={nftTokenId}
              onValueChange={onNftTokenIdChange}
              size="sm"
            />
          )}
        </>
      )}

      {value === 'token' && (
        <>
          <Input
            label="Token Contract Address"
            placeholder="0x..."
            value={tokenContract}
            onValueChange={onTokenContractChange}
            size="sm"
          />
          <Input
            label="Minimum Balance"
            placeholder="1000"
            type="number"
            value={tokenMinBalance}
            onValueChange={onTokenMinBalanceChange}
            size="sm"
          />
        </>
      )}

      {value === 'custom' && (
        <Input
          label="Access Control Contract Address"
          placeholder="0x..."
          value={customAddress}
          onValueChange={onCustomAddressChange}
          size="sm"
        />
      )}
    </div>
  );
}
