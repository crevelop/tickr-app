'use client';

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from '@heroui/navbar';
import NextLink from 'next/link';
import { ConnectButton } from '@/features/auth';

import { siteConfig } from '@/config/site';
import { Logo } from '@/components/icons';
import { WalletPanel } from '@/features/wallet/components';
import { CreateMarketDropdown } from '@/features/market-creation/components';

export const Navbar = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* Left side - Logo and App Name */}
      <NavbarContent justify="start">
        <NavbarBrand>
          <NextLink className="flex items-center gap-2" href="/">
            <Logo />
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* Center - Navigation links */}
      <NavbarContent justify="center">
      </NavbarContent>

      {/* Right side - Create Market, Wallet, and User Settings */}
      <NavbarContent justify="end">
        <NavbarItem>
          <CreateMarketDropdown />
        </NavbarItem>
        <NavbarItem>
          <WalletPanel />
        </NavbarItem>
        <NavbarItem>
          <ConnectButton />
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};
