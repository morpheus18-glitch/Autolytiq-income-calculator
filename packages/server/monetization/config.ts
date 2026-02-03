/**
 * Monetization Feature Flags Configuration
 *
 * All monetization features are gated behind feature flags.
 * Default: OFF (false) for all flags until explicitly enabled.
 *
 * Enable via environment variables:
 *   MONETIZATION_ENABLED=true
 *   PRO_REPORT_ENABLED=true
 *   etc.
 */

export interface MonetizationFlags {
  // Master switch - all monetization features require this
  monetizationEnabled: boolean;
  // Enable Pro Report upsell and purchase flow
  proReportEnabled: boolean;
  // Enable Premium toolkit (stub for future)
  premiumToolkitEnabled: boolean;
  // Enable affiliate blocks in reports
  affiliateBlockEnabled: boolean;
  // Enable referral unlock system
  referralUnlockEnabled: boolean;
  // Enable B2B inquiry capture
  b2bInquiryEnabled: boolean;
}

export interface PricingConfig {
  proReportPriceCents: number;
  proReportCurrency: string;
  premiumToolkitPriceCents: number;
  premiumToolkitCurrency: string;
}

// Load flags from environment with strict defaults (all OFF)
export function getMonetizationFlags(): MonetizationFlags {
  return {
    monetizationEnabled: process.env.MONETIZATION_ENABLED === 'true',
    proReportEnabled: process.env.PRO_REPORT_ENABLED === 'true',
    premiumToolkitEnabled: process.env.PREMIUM_TOOLKIT_ENABLED === 'true',
    affiliateBlockEnabled: process.env.AFFILIATE_BLOCK_ENABLED === 'true',
    referralUnlockEnabled: process.env.REFERRAL_UNLOCK_ENABLED === 'true',
    b2bInquiryEnabled: process.env.B2B_INQUIRY_ENABLED === 'true',
  };
}

// Load pricing from environment with safe defaults
export function getPricingConfig(): PricingConfig {
  return {
    proReportPriceCents: parseInt(process.env.PRO_REPORT_PRICE_CENTS || '999', 10),
    proReportCurrency: process.env.PRO_REPORT_CURRENCY || 'usd',
    premiumToolkitPriceCents: parseInt(process.env.PREMIUM_TOOLKIT_PRICE_CENTS || '2999', 10),
    premiumToolkitCurrency: process.env.PREMIUM_TOOLKIT_CURRENCY || 'usd',
  };
}

// Check if a specific feature is enabled (requires master flag)
export function isFeatureEnabled(feature: keyof Omit<MonetizationFlags, 'monetizationEnabled'>): boolean {
  const flags = getMonetizationFlags();
  // Master flag must be ON for any feature to be enabled
  if (!flags.monetizationEnabled) {
    return false;
  }
  return flags[feature];
}

// Get all flags for client consumption (safe to expose)
export function getClientFlags(): MonetizationFlags {
  return getMonetizationFlags();
}

// Validate pricing is reasonable (prevent misconfiguration)
export function validatePricing(): { valid: boolean; errors: string[] } {
  const pricing = getPricingConfig();
  const errors: string[] = [];

  if (pricing.proReportPriceCents < 99) {
    errors.push('Pro report price too low (min 99 cents)');
  }
  if (pricing.proReportPriceCents > 9999) {
    errors.push('Pro report price too high (max $99.99)');
  }
  if (!['usd', 'eur', 'gbp'].includes(pricing.proReportCurrency)) {
    errors.push('Invalid currency for pro report');
  }

  return { valid: errors.length === 0, errors };
}
