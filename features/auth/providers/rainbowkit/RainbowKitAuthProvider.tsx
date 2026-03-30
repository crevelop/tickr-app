'use client';

import '@rainbow-me/rainbowkit/styles.css';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from '@rainbow-me/rainbowkit';

import { rainbowkitWagmiConfig } from './rainbowkit-config';
import { queryClient } from '../../utils/query-client';
import type { AuthProviderProps } from '../../types';

export function RainbowKitAuthProvider({ children }: AuthProviderProps) {
  return (
    <WagmiProvider config={rainbowkitWagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme(),
            darkMode: darkTheme(),
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
