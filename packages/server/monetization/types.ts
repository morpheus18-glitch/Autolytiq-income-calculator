/**
 * Monetization Types
 *
 * Core type definitions for the monetization system.
 * These types are used across server and can be shared with client.
 */

// Report tiers - order matters (FREE < PRO < PREMIUM)
export type ReportTier = 'FREE' | 'PRO' | 'PREMIUM';

// Purchase status for tracking checkout flow
export type PurchaseStatus =
  | 'pending'      // Checkout session created
  | 'completed'    // Payment successful
  | 'failed'       // Payment failed
  | 'refunded'     // Payment refunded
  | 'expired';     // Checkout session expired

// Payment provider
export type PaymentProvider = 'stripe' | 'manual';

// Entitlement represents access to a specific tier for a report
export interface Entitlement {
  id: string;
  reportId: string;
  tier: ReportTier;
  sourcePurchaseId: string | null;
  sourceReferralId: string | null;
  createdAt: string;
  expiresAt: string | null; // null = never expires
}

// Purchase record for tracking payments
export interface Purchase {
  id: string;
  userId: string | null;     // null for anonymous purchases
  email: string;
  reportId: string;
  tier: ReportTier;
  amountCents: number;
  currency: string;
  provider: PaymentProvider;
  providerRef: string;       // Stripe payment intent ID or session ID
  status: PurchaseStatus;
  createdAt: string;
  updatedAt: string;
}

// Referral tracking
export interface Referral {
  id: string;
  code: string;
  ownerReportId: string;
  ownerUserId: string | null;
  ownerEmail: string;
  count: number;
  rewardGranted: boolean;
  createdAt: string;
}

export interface ReferralEvent {
  id: string;
  referralId: string;
  code: string;
  newReportId: string;
  fingerprintHash: string | null;
  createdAt: string;
}

// Affiliate offer configuration
export interface AffiliateOffer {
  slug: string;
  title: string;
  description: string;
  category: string;
  url: string;
  priority: number;
  active: boolean;
  createdAt: string;
}

export interface AffiliateClick {
  id: string;
  slug: string;
  reportId: string | null;
  userId: string | null;
  timestamp: string;
  userAgent: string | null;
  referrer: string | null;
}

// B2B inquiry
export interface PartnerInquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  volume: string;
  message: string;
  createdAt: string;
}

// Entitlement resolver output
export interface EntitlementResult {
  tier: ReportTier;
  entitlements: {
    hasProReport: boolean;
    hasPremiumToolkit: boolean;
    canUpgrade: boolean;
    referralCode: string | null;
    referralCount: number;
  };
  source: 'purchase' | 'referral' | 'manual' | 'default';
}

// Report data with tier-specific sections
export interface ReportData {
  // Base report data (FREE tier)
  calculationType: string;
  results: Record<string, string | number>;
  createdAt: string;

  // Pro tier additions (only populated if tier >= PRO)
  proSections?: {
    incomeStabilityScore: number | null;
    approvalReadiness: string | null;
    leverageMoves: string[] | null;
    thirtyDayPlan: string[] | null;
    expandedTips: string[] | null;
  };

  // Premium tier additions (stub)
  premiumSections?: {
    templates: string[] | null;
    monthlyRefresh: boolean;
  };
}

// Checkout session request
export interface CheckoutRequest {
  reportId: string;
  tier: ReportTier;
  email: string;
  successUrl?: string;
  cancelUrl?: string;
}

// Checkout session response
export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

// Tier comparison for UI
export interface TierFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  premium: boolean | string;
}

export const TIER_FEATURES: TierFeature[] = [
  { name: 'Income Projection', free: true, pro: true, premium: true },
  { name: 'Basic Tips', free: true, pro: true, premium: true },
  { name: 'Email Results', free: true, pro: true, premium: true },
  { name: 'Income Stability Score', free: false, pro: true, premium: true },
  { name: 'Approval Readiness Analysis', free: false, pro: true, premium: true },
  { name: 'Top 3 Leverage Moves', free: false, pro: true, premium: true },
  { name: '30-Day Action Plan', free: false, pro: true, premium: true },
  { name: 'Expanded Financial Tips', free: false, pro: true, premium: true },
  { name: 'Downloadable Templates', free: false, pro: false, premium: true },
  { name: 'Monthly Report Refresh', free: false, pro: false, premium: true },
];

// Helper to compare tiers
export function compareTiers(a: ReportTier, b: ReportTier): number {
  const order: Record<ReportTier, number> = { FREE: 0, PRO: 1, PREMIUM: 2 };
  return order[a] - order[b];
}

// Check if tier A has access to tier B features
export function tierHasAccess(userTier: ReportTier, requiredTier: ReportTier): boolean {
  return compareTiers(userTier, requiredTier) >= 0;
}
