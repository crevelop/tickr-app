'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { Tooltip } from '@heroui/tooltip';
import { Tabs, Tab } from '@heroui/tabs';
import { useConnection } from 'wagmi';
import { isAddress } from 'viem';
import { useWhitelistOwner } from '../hooks/useWhitelistOwner';
import { useAddToWhitelist } from '../hooks/useAddToWhitelist';
import { useRemoveFromWhitelist } from '../hooks/useRemoveFromWhitelist';
import { useCheckWhitelist } from '../hooks/useCheckWhitelist';

interface WhitelistManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  acContract: `0x${string}`;
  title?: string;
}

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function WhitelistManagementModal({
  isOpen,
  onClose,
  acContract,
  title = 'Whitelist',
}: WhitelistManagementModalProps) {
  const { address: connectedAddress } = useConnection();
  const { data: owner, isLoading: ownerLoading } =
    useWhitelistOwner(acContract);
  const { addToWhitelist, isLoading: isAdding } =
    useAddToWhitelist(acContract);
  const { removeFromWhitelist, isLoading: isRemoving } =
    useRemoveFromWhitelist(acContract);
  const {
    checkAddress,
    isLoading: isChecking,
    result: checkResult,
    reset: resetCheck,
  } = useCheckWhitelist(acContract);

  const [addInput, setAddInput] = useState('');
  const [removeInput, setRemoveInput] = useState('');
  const [checkInput, setCheckInput] = useState('');
  const [addError, setAddError] = useState('');
  const [removeError, setRemoveError] = useState('');
  const [checkError, setCheckError] = useState('');

  const isOwner =
    !!connectedAddress &&
    !!owner &&
    connectedAddress.toLowerCase() === owner.toLowerCase();

  const isMutating = isAdding || isRemoving;

  const handleAdd = async () => {
    setAddError('');
    const addr = addInput.trim();
    if (!addr) {
      setAddError('Enter an address');
      return;
    }
    if (!isAddress(addr)) {
      setAddError('Invalid address');
      return;
    }
    const result = await addToWhitelist([addr as `0x${string}`]);
    if (result) {
      setAddInput('');
    }
  };

  const handleRemove = async () => {
    setRemoveError('');
    const addr = removeInput.trim();
    if (!addr) {
      setRemoveError('Enter an address');
      return;
    }
    if (!isAddress(addr)) {
      setRemoveError('Invalid address');
      return;
    }
    const result = await removeFromWhitelist([addr as `0x${string}`]);
    if (result) {
      setRemoveInput('');
    }
  };

  const handleCheck = async () => {
    setCheckError('');
    resetCheck();
    const addr = checkInput.trim();
    if (!addr) {
      setCheckError('Enter an address');
      return;
    }
    if (!isAddress(addr)) {
      setCheckError('Invalid address');
      return;
    }
    await checkAddress(addr as `0x${string}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span>{title}</span>
          <Tooltip content="Click to copy contract address">
            <button
              onClick={() => copyToClipboard(acContract)}
              className="text-xs font-mono text-default-400 hover:text-default-600 transition-colors text-left"
            >
              {truncateAddress(acContract)}
            </button>
          </Tooltip>
        </ModalHeader>

        <ModalBody>
          {/* Owner badge */}
          <div className="flex items-center gap-3">
            {!ownerLoading && isOwner && (
              <Chip size="sm" variant="flat" color="primary">
                Owner
              </Chip>
            )}
            {!ownerLoading && !isOwner && owner && (
              <Chip size="sm" variant="flat" color="warning">
                View Only
              </Chip>
            )}
          </div>

          <Divider className="my-1" />

          <Tabs aria-label="Whitelist actions" fullWidth>
            {/* Check tab — available to everyone */}
            <Tab key="check" title="Check Address">
              <div className="flex flex-col gap-3 pt-2">
                <Input
                  label="Address"
                  placeholder="0x..."
                  value={checkInput}
                  onValueChange={(val) => {
                    setCheckInput(val);
                    setCheckError('');
                    resetCheck();
                  }}
                  isDisabled={isChecking}
                />
                {checkError && (
                  <p className="text-danger text-xs">{checkError}</p>
                )}
                <Button
                  color="primary"
                  size="sm"
                  onPress={handleCheck}
                  isLoading={isChecking}
                  isDisabled={!checkInput.trim()}
                >
                  Check
                </Button>
                {checkResult !== null && (
                  <Chip
                    size="sm"
                    variant="flat"
                    color={checkResult ? 'success' : 'danger'}
                  >
                    {checkResult ? 'Whitelisted' : 'Not Whitelisted'}
                  </Chip>
                )}
              </div>
            </Tab>

            {/* Add tab — owner only */}
            <Tab key="add" title="Add Address" isDisabled={!isOwner}>
              <div className="flex flex-col gap-3 pt-2">
                <Input
                  label="Address"
                  placeholder="0x..."
                  value={addInput}
                  onValueChange={(val) => {
                    setAddInput(val);
                    setAddError('');
                  }}
                  isDisabled={isMutating}
                />
                {addError && (
                  <p className="text-danger text-xs">{addError}</p>
                )}
                <Button
                  color="primary"
                  size="sm"
                  onPress={handleAdd}
                  isLoading={isAdding}
                  isDisabled={!addInput.trim() || isMutating}
                >
                  Add to Whitelist
                </Button>
              </div>
            </Tab>

            {/* Remove tab — owner only */}
            <Tab key="remove" title="Remove Address" isDisabled={!isOwner}>
              <div className="flex flex-col gap-3 pt-2">
                <Input
                  label="Address"
                  placeholder="0x..."
                  value={removeInput}
                  onValueChange={(val) => {
                    setRemoveInput(val);
                    setRemoveError('');
                  }}
                  isDisabled={isMutating}
                />
                {removeError && (
                  <p className="text-danger text-xs">{removeError}</p>
                )}
                <Button
                  color="danger"
                  size="sm"
                  onPress={handleRemove}
                  isLoading={isRemoving}
                  isDisabled={!removeInput.trim() || isMutating}
                >
                  Remove from Whitelist
                </Button>
              </div>
            </Tab>
          </Tabs>
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
