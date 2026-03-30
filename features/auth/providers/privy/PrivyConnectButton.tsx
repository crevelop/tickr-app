'use client';

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useConnection } from 'wagmi';
import { Button } from '@heroui/button';
import { UserSettings } from '../../components/UserSettings';
import type { ConnectButtonProps } from '../../types';

export function PrivyConnectButton(_props: ConnectButtonProps) {
  const { ready, authenticated, login, logout } = usePrivy();
  const { address } = useConnection();

  if (!ready) {
    return (
      <Button size="sm" isDisabled isLoading>
        Loading...
      </Button>
    );
  }

  if (!authenticated || !address) {
    return (
      <Button size="sm" color="primary" variant="flat" onPress={() => login()}>
        Connect
      </Button>
    );
  }

  return (
    <UserSettings
      address={address}
      disconnect={logout}
    />
  );
}
