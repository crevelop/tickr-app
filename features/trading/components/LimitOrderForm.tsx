'use client';

import { useState, useMemo } from 'react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import { useConnection } from 'wagmi';
import { usePlaceLimitOrder } from '../hooks/usePlaceLimitOrder';
import { TransactionFlowModal } from '@/lib/oddmaki/TransactionFlowModal';
import { useCanTradeOnMarket } from '@/features/access-control';

interface LimitOrderFormProps {
  marketId: string;
  outcomeIndex: 0 | 1;
  outcomeName: string;
  side: 'BUY' | 'SELL';
  /** Pre-filled price from orderbook click */
  prefillPrice?: string;
}

const EXPIRY_OPTIONS = [
  { key: 'gtc', label: 'Good till cancelled' },
  { key: '1h', label: '1 hour' },
  { key: '24h', label: '24 hours' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
];

export function LimitOrderForm({
  marketId,
  outcomeIndex,
  outcomeName,
  side,
  prefillPrice,
}: LimitOrderFormProps) {
  const { isConnected } = useConnection();
  const { startPlaceLimitOrder, flow } = usePlaceLimitOrder();
  const { data: canTrade = true } = useCanTradeOnMarket(
    marketId ? BigInt(marketId) : undefined,
  );

  const [price, setPrice] = useState(prefillPrice || '');
  const [quantity, setQuantity] = useState('');
  const [expiry, setExpiry] = useState('gtc');
  const [flowOpen, setFlowOpen] = useState(false);

  // Update price when prefillPrice changes
  if (prefillPrice && prefillPrice !== price && !flow.isRunning) {
    setPrice(prefillPrice);
  }

  const costEstimate = useMemo(() => {
    const p = parseFloat(price);
    const q = parseFloat(quantity);
    if (isNaN(p) || isNaN(q) || p <= 0 || q <= 0) return null;
    const total = p * q;
    return total.toFixed(2);
  }, [price, quantity]);

  const isValid = (() => {
    const p = parseFloat(price);
    const q = parseFloat(quantity);
    return !isNaN(p) && !isNaN(q) && p > 0 && p < 1 && q > 0;
  })();

  const handleSubmit = async () => {
    if (!isValid) return;
    setFlowOpen(true);
    await startPlaceLimitOrder({
      marketId,
      outcomeIndex,
      side,
      price,
      quantity,
      expiry,
    });
  };

  const handleFlowClose = () => {
    if (flow.isComplete) {
      setQuantity('');
    }
    setFlowOpen(false);
    flow.reset();
  };

  const sideLabel = side === 'BUY' ? 'Buy' : 'Sell';
  const sideColor = side === 'BUY' ? 'primary' : 'secondary';

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Price"
        placeholder="0.01 — 0.99"
        type="number"
        step="0.01"
        min="0.01"
        max="0.99"
        value={price}
        onValueChange={setPrice}
        endContent={<span className="text-xs text-default-400">USDC</span>}
        size="sm"
      />

      <Input
        label="Quantity"
        placeholder="Amount of tokens"
        type="number"
        step="1"
        min="0"
        value={quantity}
        onValueChange={setQuantity}
        endContent={
          <span className="text-xs text-default-400">{outcomeName}</span>
        }
        size="sm"
      />

      <Select
        label="Expiry"
        selectedKeys={[expiry]}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          if (selected) setExpiry(selected);
        }}
        size="sm"
      >
        {EXPIRY_OPTIONS.map((opt) => (
          <SelectItem key={opt.key}>{opt.label}</SelectItem>
        ))}
      </Select>

      {/* Cost summary */}
      {costEstimate && (
        <div className="flex justify-between text-xs px-1">
          <span className="text-default-400">
            {side === 'BUY' ? 'Est. Cost' : 'Est. Proceeds'}
          </span>
          <span className="font-semibold">${costEstimate} USDC</span>
        </div>
      )}

      <Button
        color={sideColor}
        isDisabled={!isConnected || !isValid || !canTrade}
        isLoading={flow.isRunning}
        onPress={handleSubmit}
        className="w-full"
      >
        {!isConnected
          ? 'Connect Wallet'
          : !canTrade
            ? 'Access Restricted'
            : `${sideLabel} ${outcomeName} @ $${price || '—'}`}
      </Button>

      <TransactionFlowModal
        isOpen={flowOpen}
        onClose={handleFlowClose}
        title={`${sideLabel} ${outcomeName}`}
        stepStates={flow.stepStates}
        isRunning={flow.isRunning}
        isComplete={flow.isComplete}
        hasError={flow.hasError}
        onRetry={flow.retry}
      />
    </div>
  );
}
