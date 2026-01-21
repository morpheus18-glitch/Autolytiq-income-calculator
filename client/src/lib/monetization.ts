/**
 * Client-side monetization utilities and types
 */

// Types matching server types
export type ReportTier = 'FREE' | 'PRO' | 'PREMIUM';

export interface MonetizationFlags {
  monetizationEnabled: boolean;
  proReportEnabled: boolean;
  premiumToolkitEnabled: boolean;
  affiliateBlockEnabled: boolean;
  referralUnlockEnabled: boolean;
  b2bInquiryEnabled: boolean;
}

export interface PricingInfo {
  enabled: boolean;
  proReport?: {
    enabled: boolean;
    priceCents: number;
    priceFormatted: string;
    currency: string;
  };
  premiumToolkit?: {
    enabled: boolean;
    priceCents: number;
    priceFormatted: string;
    currency: string;
  };
}

export interface EntitlementInfo {
  tier: ReportTier;
  hasProReport: boolean;
  hasPremiumToolkit: boolean;
  canUpgrade: boolean;
  referralCode: string | null;
}

export interface AffiliateOffer {
  slug: string;
  title: string;
  description: string;
  category: string;
}

export interface ReferralInfo {
  enabled: boolean;
  hasCode: boolean;
  code?: string;
  count?: number;
  required?: number;
  rewardGranted?: boolean;
}

// API functions
export async function fetchMonetizationFlags(): Promise<MonetizationFlags> {
  try {
    const response = await fetch('/api/monetization/flags');
    if (!response.ok) {
      throw new Error('Failed to fetch flags');
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch monetization flags:', error);
    // Return all-disabled flags on error
    return {
      monetizationEnabled: false,
      proReportEnabled: false,
      premiumToolkitEnabled: false,
      affiliateBlockEnabled: false,
      referralUnlockEnabled: false,
      b2bInquiryEnabled: false,
    };
  }
}

export async function fetchPricing(): Promise<PricingInfo> {
  try {
    const response = await fetch('/api/monetization/pricing');
    if (!response.ok) {
      throw new Error('Failed to fetch pricing');
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch pricing:', error);
    return { enabled: false };
  }
}

export async function fetchEntitlement(reportId: string): Promise<EntitlementInfo> {
  try {
    const response = await fetch(`/api/monetization/entitlement/${reportId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch entitlement');
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch entitlement:', error);
    return {
      tier: 'FREE',
      hasProReport: false,
      hasPremiumToolkit: false,
      canUpgrade: false,
      referralCode: null,
    };
  }
}

export async function fetchAffiliateOffers(income?: number): Promise<AffiliateOffer[]> {
  try {
    const url = income
      ? `/api/monetization/affiliate-offers?income=${income}`
      : '/api/monetization/affiliate-offers';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch offers');
    }
    const data = await response.json();
    return data.offers || [];
  } catch (error) {
    console.error('Failed to fetch affiliate offers:', error);
    return [];
  }
}

export async function fetchReferralInfo(reportId: string): Promise<ReferralInfo> {
  try {
    const response = await fetch(`/api/monetization/referral/${reportId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch referral info');
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch referral info:', error);
    return { enabled: false, hasCode: false };
  }
}

export async function createReferralCode(
  reportId: string,
  email: string
): Promise<{ code: string; count: number; rewardGranted: boolean } | null> {
  try {
    const response = await fetch('/api/monetization/referral/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, email }),
    });
    if (!response.ok) {
      throw new Error('Failed to create referral');
    }
    return response.json();
  } catch (error) {
    console.error('Failed to create referral code:', error);
    return null;
  }
}

export async function createCheckoutSession(
  reportId: string,
  email: string
): Promise<{ sessionId: string; url: string } | null> {
  try {
    const response = await fetch('/api/checkout/pro-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId,
        email,
        successUrl: `${window.location.origin}/report/${reportId}?upgrade=success`,
        cancelUrl: `${window.location.origin}/report/${reportId}?upgrade=cancelled`,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create checkout');
    }

    return response.json();
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return null;
  }
}

export async function submitPartnerInquiry(data: {
  name: string;
  email: string;
  company: string;
  volume?: string;
  message?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('/api/partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to submit inquiry');
    }

    return response.json();
  } catch (error) {
    console.error('Failed to submit partner inquiry:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit inquiry',
    };
  }
}

// Tier feature comparison
export const TIER_FEATURES = [
  { name: 'Income Projection', free: true, pro: true, premium: true },
  { name: 'Basic Financial Tips', free: true, pro: true, premium: true },
  { name: 'Email Results', free: true, pro: true, premium: true },
  { name: 'Income Stability Score', free: false, pro: true, premium: true },
  { name: 'Approval Readiness Analysis', free: false, pro: true, premium: true },
  { name: 'Top 3 Leverage Moves', free: false, pro: true, premium: true },
  { name: '30-Day Action Plan', free: false, pro: true, premium: true },
  { name: 'Expanded Financial Tips', free: false, pro: true, premium: true },
  { name: 'Downloadable Templates', free: false, pro: false, premium: true },
  { name: 'Monthly Report Refresh', free: false, pro: false, premium: true },
];

// Generate a report ID (used for anonymous users)
export function generateReportId(): string {
  return `rpt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get or create report ID from localStorage
export function getOrCreateReportId(): string {
  const storageKey = 'income-calc-report-id';
  let reportId = localStorage.getItem(storageKey);

  if (!reportId) {
    reportId = generateReportId();
    localStorage.setItem(storageKey, reportId);
  }

  return reportId;
}

// Clear report ID (for new calculation)
export function clearReportId(): void {
  localStorage.removeItem('income-calc-report-id');
}
