'use client';

import React from 'react';
import { ConnectButton as RKConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';
import { Button } from '@heroui/button';
import { UserSettings } from '../../components/UserSettings';
import type { ConnectButtonProps } from '../../types';

export function RainbowKitConnectButton(_props: ConnectButtonProps) {
  const { disconnect } = useDisconnect();

  return (
    <RKConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none' as const,
                userSelect: 'none' as const,
              },
            })}
          >
            {!connected ? (
              <Button
                color="primary"
                variant="flat"
                size="sm"
                onPress={openConnectModal}
              >
                Connect
              </Button>
            ) : chain.unsupported ? (
              <Button
                color="danger"
                variant="flat"
                size="sm"
                onPress={openChainModal}
              >
                Wrong Network
              </Button>
            ) : (
              <UserSettings
                address={account.address}
                switchNetwork={openChainModal}
                disconnect={disconnect}
              />
            )}
          </div>
        );
      }}
    </RKConnectButton.Custom>
  );
}
