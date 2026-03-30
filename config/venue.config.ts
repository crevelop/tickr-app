/**
 * Venue Configuration
 *
 * venueId comes exclusively from the NEXT_PUBLIC_VENUE_ID env var.
 * If not set, VenueSetupGuard shows a modal to create a venue and
 * instructs the developer to set the env var and restart.
 */

const envVenueIdRaw = process.env.NEXT_PUBLIC_VENUE_ID;
const envVenueId =
  envVenueIdRaw !== undefined && envVenueIdRaw !== ''
    ? BigInt(envVenueIdRaw)
    : undefined;

/**
 * Get the configured venueId from the NEXT_PUBLIC_VENUE_ID env var.
 * Returns undefined when no venueId is configured.
 */
export function getVenueId(): bigint | undefined {
  return envVenueId;
}

export const venueConfig = {
  // Venue identification - use getVenueId() at runtime for client code
  venueId: envVenueId,

  // Branding & UI
  branding: {
    name: process.env.NEXT_PUBLIC_VENUE_NAME || 'OddMaki Markets',
    description: 'Trade on prediction markets powered by OddMaki Protocol',
    logo: '/logo.svg',
    favicon: '/favicon.ico',
    // Note: Theme colors are configured in theme.config.json
  },

  // Feature flags
  features: {
    enableMarketCreation:
      process.env.NEXT_PUBLIC_ENABLE_MARKET_CREATION === 'true',
    enableThemeEditor:
      process.env.NEXT_PUBLIC_ENABLE_THEME_EDITOR === 'true',
  },

  // Network settings
  network: {
    defaultChainId: 84532, // Base Sepolia testnet
    supportedChains: [84532], // Add more chain IDs as needed
  },

  // UI settings
  ui: {
    marketsPerPage: 12,
    enableAnimations: true,
    defaultTheme: 'dark' as const,
  },
} as const;

export type VenueConfig = typeof venueConfig;
