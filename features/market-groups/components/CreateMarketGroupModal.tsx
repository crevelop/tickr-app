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
import { Select, SelectItem } from '@heroui/select';
import { Checkbox } from '@heroui/checkbox';
import { Divider } from '@heroui/divider';
import { useCreateMarketGroup } from '../hooks/useCreateMarketGroup';
import { TransactionFlowModal } from '@/lib/oddmaki/TransactionFlowModal';
import { TagSelector } from '@/features/market-creation/components/TagSelector';

interface MarketOutcomeInput {
  name: string;
  question: string;
}

interface CreateMarketGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormStep = 'info' | 'outcomes' | 'review';

export function CreateMarketGroupModal({
  isOpen,
  onClose,
}: CreateMarketGroupModalProps) {
  const { startCreateMarketGroup, flow } = useCreateMarketGroup();

  // Form step navigation
  const [step, setStep] = useState<FormStep>('info');

  // Step 1: Group Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tickSize, setTickSize] = useState('0.01');

  // Step 2: Outcomes
  const [outcomes, setOutcomes] = useState<MarketOutcomeInput[]>([
    { name: '', question: '' },
    { name: '', question: '' },
  ]);

  // Step 3: Review
  const [placeholderCount, setPlaceholderCount] = useState(0);
  const [activateImmediately, setActivateImmediately] = useState(true);

  const [formError, setFormError] = useState('');
  const [flowActive, setFlowActive] = useState(false);

  const resetForm = () => {
    setStep('info');
    setTitle('');
    setDescription('');
    setTags([]);
    setTickSize('0.01');
    setOutcomes([
      { name: '', question: '' },
      { name: '', question: '' },
    ]);
    setPlaceholderCount(0);
    setActivateImmediately(true);
    setFormError('');
  };

  const handleClose = () => {
    if (!flow.isRunning) {
      resetForm();
      setFlowActive(false);
      flow.reset();
      onClose();
    }
  };

  const handleNext = () => {
    setFormError('');
    if (step === 'info') {
      if (!title.trim()) {
        setFormError('Group question is required');
        return;
      }
      if (!description.trim()) {
        setFormError('Resolution criteria is required');
        return;
      }
      setStep('outcomes');
    } else if (step === 'outcomes') {
      const validOutcomes = outcomes.filter(
        (o) => o.name.trim() && o.question.trim(),
      );
      if (validOutcomes.length < 2) {
        setFormError('At least 2 outcomes with name and question are required');
        return;
      }
      setStep('review');
    }
  };

  const handleBack = () => {
    setFormError('');
    if (step === 'outcomes') setStep('info');
    else if (step === 'review') setStep('outcomes');
  };

  const updateOutcome = (
    index: number,
    field: keyof MarketOutcomeInput,
    value: string,
  ) => {
    setOutcomes((prev) =>
      prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)),
    );
    setFormError('');
  };

  const addOutcome = () => {
    if (outcomes.length >= 50) return;
    setOutcomes((prev) => [...prev, { name: '', question: '' }]);
  };

  const removeOutcome = (index: number) => {
    if (outcomes.length <= 2) return;
    setOutcomes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setFormError('');
    const validOutcomes = outcomes.filter(
      (o) => o.name.trim() && o.question.trim(),
    );
    if (validOutcomes.length < 2) {
      setFormError('At least 2 complete outcomes are required');
      return;
    }

    setFlowActive(true);
    await startCreateMarketGroup({
      title: title.trim(),
      description: description.trim(),
      tags,
      tickSize,
      markets: validOutcomes.map((o) => ({
        name: o.name.trim(),
        question: o.question.trim(),
      })),
      placeholderCount: placeholderCount > 0 ? placeholderCount : undefined,
      activateImmediately,
    });
  };

  const handleFlowClose = () => {
    if (flow.isComplete) {
      resetForm();
      setFlowActive(false);
      flow.reset();
      onClose();
    } else {
      setFlowActive(false);
      flow.reset();
    }
  };

  // Show the transaction flow modal when active
  if (flowActive) {
    return (
      <TransactionFlowModal
        isOpen={isOpen}
        onClose={handleFlowClose}
        title="Creating Market Group"
        stepStates={flow.stepStates}
        isRunning={flow.isRunning}
        isComplete={flow.isComplete}
        hasError={flow.hasError}
        onRetry={flow.retry}
      />
    );
  }

  const validOutcomeCount = outcomes.filter(
    (o) => o.name.trim() && o.question.trim(),
  ).length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Create Market Group</h2>
            <p className="text-xs text-default-400 font-normal">
              Step {step === 'info' ? '1' : step === 'outcomes' ? '2' : '3'} of
              3 —{' '}
              {step === 'info'
                ? 'Group Info'
                : step === 'outcomes'
                  ? 'Add Outcomes'
                  : 'Review & Create'}
            </p>
          </div>
        </ModalHeader>

        <ModalBody className="gap-4">
          {/* Step 1: Group Info */}
          {step === 'info' && (
            <>
              <Input
                label="Group Question"
                placeholder="US strikes Iran by...?"
                value={title}
                onValueChange={(v) => {
                  setTitle(v);
                  setFormError('');
                }}
                isRequired
              />
              <Input
                label="Resolution Criteria"
                placeholder="Resolves YES for the date on which the US first strikes Iran. All other outcomes resolve NO."
                value={description}
                onValueChange={(v) => {
                  setDescription(v);
                  setFormError('');
                }}
                isRequired
              />
              <TagSelector selectedTags={tags} onChange={setTags} />
              <Select
                label="Tick Size"
                selectedKeys={[tickSize]}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  if (selected) setTickSize(selected);
                }}
                size="sm"
                description={tickSize === '0.01' ? '100 price levels (standard)' : '1,000 price levels (fine)'}
              >
                <SelectItem key="0.01">$0.01 (1%)</SelectItem>
                <SelectItem key="0.001">$0.001 (0.1%)</SelectItem>
              </Select>

              <div className="flex flex-col gap-1 text-xs text-default-400">
                <p>Collateral: USDC</p>
                <p>UMA Challenge Period: 2 hours (default)</p>
              </div>
            </>
          )}

          {/* Step 2: Outcomes */}
          {step === 'outcomes' && (
            <>
              <p className="text-sm text-default-500">
                Add at least 2 outcomes. Each outcome becomes a separate binary
                market within the group.
              </p>
              <div className="flex flex-col gap-3">
                {outcomes.map((outcome, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-lg border border-default-200 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-default-400 font-medium">
                        Outcome {i + 1}
                      </span>
                      {outcomes.length > 2 && (
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => removeOutcome(i)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <Input
                      size="sm"
                      label="Name"
                      placeholder="e.g., February 27, March 1, $78k-$80k"
                      value={outcome.name}
                      onValueChange={(v) => updateOutcome(i, 'name', v)}
                      isRequired
                    />
                    <Input
                      size="sm"
                      label="Resolution Question"
                      placeholder="e.g., Will the US strike Iran on February 27?"
                      value={outcome.question}
                      onValueChange={(v) => updateOutcome(i, 'question', v)}
                      isRequired
                    />
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                variant="flat"
                onPress={addOutcome}
                isDisabled={outcomes.length >= 50}
              >
                + Add Outcome
              </Button>
            </>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <>
              <div className="rounded-lg border border-default-200 p-3 flex flex-col gap-2">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-default-400">{description}</p>
                {tags.length > 0 && (
                  <p className="text-xs text-default-400">
                    Tags: {tags.join(', ')}
                  </p>
                )}
              </div>

              <Divider />

              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">
                  {validOutcomeCount} Outcomes
                </p>
                {outcomes
                  .filter((o) => o.name.trim() && o.question.trim())
                  .map((o, i) => (
                    <div key={i} className="text-xs text-default-500 pl-2">
                      {i + 1}. {o.name} — {o.question}
                    </div>
                  ))}
              </div>

              <Divider />

              <Input
                type="number"
                label="Placeholder Markets (optional)"
                description="Placeholders can be activated later with real market data"
                placeholder="0"
                min={0}
                max={50 - validOutcomeCount}
                value={placeholderCount.toString()}
                onValueChange={(v) => setPlaceholderCount(parseInt(v) || 0)}
              />

              <Checkbox
                isSelected={activateImmediately}
                onValueChange={setActivateImmediately}
              >
                <span className="text-sm">Activate immediately</span>
              </Checkbox>
              <p className="text-xs text-default-400 -mt-2 ml-7">
                {activateImmediately
                  ? 'The group will be activated and trading enabled after creation.'
                  : 'The group will stay in Draft. You can add more markets and activate later.'}
              </p>
            </>
          )}

          {formError && <p className="text-danger text-sm">{formError}</p>}
        </ModalBody>

        <ModalFooter>
          {step !== 'info' && (
            <Button variant="flat" onPress={handleBack}>
              Back
            </Button>
          )}
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          {step === 'review' ? (
            <Button
              color="primary"
              onPress={handleSubmit}
              isDisabled={validOutcomeCount < 2}
            >
              {activateImmediately ? 'Create & Activate' : 'Create Group'}
            </Button>
          ) : (
            <Button color="primary" onPress={handleNext}>
              Next
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
