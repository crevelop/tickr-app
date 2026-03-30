'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { authConfig } from '../config';
import type { AuthProviderProps } from '../types';

const RainbowKitAuthProvider = dynamic(
  () =>
    import('../providers/rainbowkit/RainbowKitAuthProvider').then(
      (mod) => mod.RainbowKitAuthProvider,
    ),
  { ssr: false },
);

const PrivyAuthProvider = dynamic(
  () =>
    import('../providers/privy/PrivyAuthProvider').then(
      (mod) => mod.PrivyAuthProvider,
    ),
  { ssr: false },
);

export function AuthProvider({ children }: AuthProviderProps) {
  const Provider =
    authConfig.provider === 'privy' ? PrivyAuthProvider : RainbowKitAuthProvider;
  return <Provider>{children}</Provider>;
}
