'use client';

import { useState } from 'react';
import { Tabs, Tab } from '@heroui/tabs';
import {
  useLeaderboard,
  LeaderboardTable,
} from '@/features/leaderboard';
import type { LeaderboardSortField } from '@/features/leaderboard';

const SORT_TABS: { key: LeaderboardSortField; label: string }[] = [
  { key: 'totalVolume', label: 'Volume' },
  { key: 'totalRealizedPnL', label: 'P&L' },
  { key: 'totalTradeCount', label: 'Trades' },
];

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<LeaderboardSortField>('totalVolume');
  const { data: users = [], isLoading } = useLeaderboard(sortBy);

  return (
    <section className="flex flex-col gap-6 pt-4 pb-8 md:pt-6 md:pb-10 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <Tabs
          aria-label="Sort by"
          variant="bordered"
          size="sm"
          selectedKey={sortBy}
          onSelectionChange={(key) => setSortBy(key as LeaderboardSortField)}
        >
          {SORT_TABS.map((tab) => (
            <Tab key={tab.key} title={tab.label} />
          ))}
        </Tabs>
      </div>

      <LeaderboardTable users={users} isLoading={isLoading} />
    </section>
  );
}
