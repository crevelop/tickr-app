'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { useConnection } from 'wagmi';
import { useMergePositions } from '../hooks/useMergePositions';
import { TransactionFlowModal } from '@/lib/oddmaki/TransactionFlowModal';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
  outcomes: string[];
}

export function MergeModal({
  isOpen,
  onClose,
  marketId,
  outcomes,
}: MergeModalProps) {
  const { isConnected } = useConnection();
  const { startMergePositions, flow } = useMergePositions();
  const [amount, setAmount] = useState('');
  const [flowOpen, setFlowOpen] = useState(false);

  const yesLabel = outcomes[0] || 'Yes';
  const noLabel = outcomes[1] || 'No';

  const isValid = (() => {
    const a = parseFloat(amount);
    return !isNaN(a) && a > 0;
  })();

  const handleMerge = async () => {
    if (!isValid) return;
    setFlowOpen(true);
    await startMergePositions({ marketId, amount });
  };

  const handleFlowClose = () => {
    if (flow.isComplete) {
      setAmount('');
      onClose();
    }
    setFlowOpen(false);
    flow.reset();
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen && !flowOpen} onClose={handleClose} size="sm">
        <ModalContent>
          <ModalHeader>Merge shares</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500">
              Merge a share of {yesLabel} and {noLabel} to get 1 USDC. You can
              do this to save cost when trying to get rid of a position.
            </p>
            <Input
              label="Amount"
              placeholder="Tokens to merge (each side)"
              type="number"
              step="1"
              min="0"
              value={amount}
              onValueChange={setAmount}
              endContent={
                <span className="text-xs text-default-400">each</span>
              }
              size="sm"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              className="w-full"
              isDisabled={!isConnected || !isValid}
              onPress={handleMerge}
            >
              {!isConnected ? 'Connect Wallet' : 'Merge Shares'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <TransactionFlowModal
        isOpen={flowOpen}
        onClose={handleFlowClose}
        title="Merge Positions"
        stepStates={flow.stepStates}
        isRunning={flow.isRunning}
        isComplete={flow.isComplete}
        hasError={flow.hasError}
        onRetry={flow.retry}
      />
    </>
  );
}
