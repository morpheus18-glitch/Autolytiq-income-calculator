/**
 * Monetization Module
 *
 * Main entry point for all monetization functionality.
 * Import from this file to ensure proper initialization.
 */

// Re-export config
export {
  getMonetizationFlags,
  getPricingConfig,
  isFeatureEnabled,
  getClientFlags,
  validatePricing,
  type MonetizationFlags,
  type PricingConfig,
} from './config';

// Re-export types
export * from './types';

// Re-export database operations
export {
  initMonetizationTables,
  purchaseDb,
  entitlementDb,
  referralDb,
  referralEventDb,
  affiliateOfferDb,
  affiliateClickDb,
  partnerInquiryDb,
} from './db';

// Re-export entitlement functions
export {
  resolveEntitlement,
  grantEntitlement,
  canUpgrade,
  validatePurchaseEligibility,
  getEntitlementForClient,
} from './entitlement';

// Initialize on import (safe to call multiple times)
import { initMonetizationTables } from './db';
import { getMonetizationFlags, validatePricing } from './config';

let initialized = false;

export function initMonetization(): void {
  if (initialized) return;

  console.log('[Monetization] Initializing...');

  // Initialize database tables
  initMonetizationTables();

  // Log current configuration
  const flags = getMonetizationFlags();
  console.log('[Monetization] Feature flags:', flags);

  // Validate pricing if monetization is enabled
  if (flags.monetizationEnabled) {
    const { valid, errors } = validatePricing();
    if (!valid) {
      console.error('[Monetization] Pricing validation errors:', errors);
    }
  }

  initialized = true;
  console.log('[Monetization] Initialization complete');
}
