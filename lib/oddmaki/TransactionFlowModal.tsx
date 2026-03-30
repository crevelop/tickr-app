'use client';

/**
 * Transaction Flow Modal
 *
 * Displays a vertical step-by-step progress view inside a modal.
 * Each step shows an icon reflecting its status (pending, active, completed, error).
 */

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import {
  CheckCircleIcon,
  SpinnerIcon,
  ErrorCircleIcon,
  CircleIcon,
} from '@/components/icons';
import type { FlowStepState } from './useTransactionFlow';

interface TransactionFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  stepStates: FlowStepState[];
  isRunning: boolean;
  isComplete: boolean;
  hasError: boolean;
  onRetry: () => void;
}

function StepIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon size={20} className="text-primary" />;
    case 'active':
      return <SpinnerIcon size={20} className="text-primary animate-spin" />;
    case 'error':
      return <ErrorCircleIcon size={20} className="text-danger" />;
    default:
      return <CircleIcon size={20} className="text-default-300" />;
  }
}

function stepTextClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-primary';
    case 'active':
      return 'font-semibold text-foreground';
    case 'error':
      return 'text-danger';
    default:
      return 'text-default-400';
  }
}

export function TransactionFlowModal({
  isOpen,
  onClose,
  title,
  stepStates,
  isRunning,
  isComplete,
  hasError,
  onRetry,
}: TransactionFlowModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      isDismissable={!isRunning}
      hideCloseButton={isRunning}
      size="sm"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg font-bold">{title}</h2>
        </ModalHeader>

        <ModalBody>
          <div className="flex flex-col gap-0">
            {stepStates.map((step, i) => (
              <div key={step.id}>
                {/* Connecting line */}
                {i > 0 && (
                  <div className="flex ml-[9px]">
                    <div
                      className={`w-0.5 h-4 ${
                        stepStates[i - 1].status === 'completed'
                          ? 'bg-primary'
                          : 'bg-default-200'
                      }`}
                    />
                  </div>
                )}
                {/* Step row */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <StepIcon status={step.status} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm ${stepTextClass(step.status)}`}>
                      {step.label}
                    </span>
                    {step.status === 'error' && step.error && (
                      <span className="text-xs text-danger mt-0.5 break-words">
                        {step.error.length > 120
                          ? step.error.slice(0, 120) + '...'
                          : step.error}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ModalBody>

        <ModalFooter>
          {hasError && (
            <>
              <Button variant="flat" size="sm" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" size="sm" onPress={onRetry}>
                Retry
              </Button>
            </>
          )}
          {isComplete && (
            <Button color="primary" size="sm" onPress={onClose}>
              Done
            </Button>
          )}
          {isRunning && (
            <p className="text-xs text-default-400">
              Confirm in your wallet...
            </p>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
