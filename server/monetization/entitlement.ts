/**
 * Entitlement Resolver
 *
 * Server-side source of truth for determining report tier access.
 * Never trust client for tier information - always resolve server-side.
 */

import { getMonetizationFlags, isFeatureEnabled } from './config';
import { entitlementDb, purchaseDb, referralDb } from './db';
import type { EntitlementResult, ReportTier } from './types';

interface ResolveEntitlementInput {
  reportId: string;
  userId?: string | null;
  email?: string | null;
}

/**
 * Resolve entitlements for a report/user combination.
 * This is the single source of truth for what tier a report has access to.
 *
 * @param input - Report and optional user/email identifiers
 * @returns EntitlementResult with tier and feature access
 */
export function resolveEntitlement(input: ResolveEntitlementInput): EntitlementResult {
  const { reportId, userId, email } = input;
  const flags = getMonetizationFlags();

  // Default result - FREE tier with no special entitlements
  const defaultResult: EntitlementResult = {
    tier: 'FREE',
    entitlements: {
      hasProReport: false,
      hasPremiumToolkit: false,
      canUpgrade: flags.monetizationEnabled && flags.proReportEnabled,
      referralCode: null,
      referralCount: 0,
    },
    source: 'default',
  };

  // If monetization is disabled, always return FREE
  if (!flags.monetizationEnabled) {
    return {
      ...defaultResult,
      entitlements: {
        ...defaultResult.entitlements,
        canUpgrade: false,
      },
    };
  }

  // Check for entitlements in database
  const highestTier = entitlementDb.getHighestTier(reportId);

  // Check for referral code if referral system is enabled
  let referralCode: string | null = null;
  let referralCount = 0;

  if (isFeatureEnabled('referralUnlockEnabled')) {
    const referral = referralDb.findByReportId(reportId);
    if (referral) {
      referralCode = referral.code;
      referralCount = referral.count;
    }
  }

  // Determine source of entitlement
  let source: EntitlementResult['source'] = 'default';
  if (highestTier !== 'FREE') {
    const entitlements = entitlementDb.findByReportId(reportId);
    const highestEntitlement = entitlements.find(e => e.tier === highestTier);
    if (highestEntitlement?.sourcePurchaseId) {
      source = 'purchase';
    } else if (highestEntitlement?.sourceReferralId) {
      source = 'referral';
    } else {
      source = 'manual';
    }
  }

  // Build result
  const result: EntitlementResult = {
    tier: highestTier,
    entitlements: {
      hasProReport: compareTiers(highestTier, 'PRO') >= 0,
      hasPremiumToolkit: compareTiers(highestTier, 'PREMIUM') >= 0,
      canUpgrade: highestTier !== 'PREMIUM' && flags.proReportEnabled,
      referralCode,
      referralCount,
    },
    source,
  };

  return result;
}

/**
 * Grant an entitlement to a report.
 * Called after successful purchase or referral reward.
 */
export function grantEntitlement(
  reportId: string,
  tier: ReportTier,
  source: { purchaseId?: string; referralId?: string }
): void {
  // Check if entitlement already exists
  if (entitlementDb.hasEntitlement(reportId, tier)) {
    console.log(`[Entitlement] Report ${reportId} already has ${tier} access`);
    return;
  }

  // Create entitlement
  const entitlement = entitlementDb.create({
    reportId,
    tier,
    sourcePurchaseId: source.purchaseId,
    sourceReferralId: source.referralId,
  });

  console.log(`[Entitlement] Granted ${tier} to report ${reportId}`, {
    entitlementId: entitlement.id,
    source,
  });
}

/**
 * Check if a report can be upgraded to a specific tier.
 */
export function canUpgrade(reportId: string, targetTier: ReportTier): boolean {
  const flags = getMonetizationFlags();

  if (!flags.monetizationEnabled) {
    return false;
  }

  if (targetTier === 'PRO' && !flags.proReportEnabled) {
    return false;
  }

  if (targetTier === 'PREMIUM' && !flags.premiumToolkitEnabled) {
    return false;
  }

  const currentTier = entitlementDb.getHighestTier(reportId);
  return compareTiers(currentTier, targetTier) < 0;
}

/**
 * Validate that a purchase hasn't already been completed for this report.
 * Prevents duplicate purchases.
 */
export function validatePurchaseEligibility(
  reportId: string,
  tier: ReportTier
): { eligible: boolean; reason?: string } {
  // Check for existing completed purchase
  const existingPurchase = purchaseDb.findCompletedByReportId(reportId);
  if (existingPurchase && compareTiers(existingPurchase.tier, tier) >= 0) {
    return {
      eligible: false,
      reason: 'Report already has this tier or higher',
    };
  }

  // Check for pending purchase (avoid duplicate checkout sessions)
  if (purchaseDb.hasPendingOrCompletedPurchase(reportId, tier)) {
    return {
      eligible: false,
      reason: 'Purchase already in progress or completed',
    };
  }

  return { eligible: true };
}

// Helper function to compare tiers
function compareTiers(a: ReportTier, b: ReportTier): number {
  const order: Record<ReportTier, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };
  return order[a] - order[b];
}

/**
 * Get entitlement info for API response (safe to send to client)
 */
export function getEntitlementForClient(reportId: string, userId?: string, email?: string) {
  const result = resolveEntitlement({ reportId, userId, email });

  return {
    tier: result.tier,
    hasProReport: result.entitlements.hasProReport,
    hasPremiumToolkit: result.entitlements.hasPremiumToolkit,
    canUpgrade: result.entitlements.canUpgrade,
    referralCode: result.entitlements.referralCode,
  };
}
