/**
 * React hooks for monetization features
 */

import { useState, useEffect, useCallback } from 'react';
import {
  type MonetizationFlags,
  type PricingInfo,
  type EntitlementInfo,
  type AffiliateOffer,
  type ReferralInfo,
  fetchMonetizationFlags,
  fetchPricing,
  fetchEntitlement,
  fetchAffiliateOffers,
  fetchReferralInfo,
  createCheckoutSession,
  createReferralCode,
  getOrCreateReportId,
} from '@/lib/monetization';

// Cache for flags to avoid re-fetching
let flagsCache: MonetizationFlags | null = null;
let pricingCache: PricingInfo | null = null;

/**
 * Hook to get monetization feature flags
 */
export function useMonetizationFlags() {
  const [flags, setFlags] = useState<MonetizationFlags | null>(flagsCache);
  const [loading, setLoading] = useState(!flagsCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flagsCache) {
      setFlags(flagsCache);
      setLoading(false);
      return;
    }

    fetchMonetizationFlags()
      .then((data) => {
        flagsCache = data;
        setFlags(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { flags, loading, error };
}

/**
 * Hook to get pricing information
 */
export function usePricing() {
  const [pricing, setPricing] = useState<PricingInfo | null>(pricingCache);
  const [loading, setLoading] = useState(!pricingCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pricingCache) {
      setPricing(pricingCache);
      setLoading(false);
      return;
    }

    fetchPricing()
      .then((data) => {
        pricingCache = data;
        setPricing(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { pricing, loading, error };
}

/**
 * Hook to get entitlement status for a report
 */
export function useEntitlement(reportId?: string) {
  const [entitlement, setEntitlement] = useState<EntitlementInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actualReportId = reportId || getOrCreateReportId();

  useEffect(() => {
    setLoading(true);
    fetchEntitlement(actualReportId)
      .then(setEntitlement)
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [actualReportId]);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetchEntitlement(actualReportId)
      .then((data) => {
        setEntitlement(data);
        return data;
      })
      .catch((err) => {
        setError(err.message);
        return null;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [actualReportId]);

  return { entitlement, loading, error, refresh, reportId: actualReportId };
}

/**
 * Hook to handle Pro upgrade checkout
 */
export function useProUpgrade(reportId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actualReportId = reportId || getOrCreateReportId();

  const startCheckout = useCallback(
    async (email: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await createCheckoutSession(actualReportId, email);

        if (!result) {
          throw new Error('Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (result.url) {
          window.location.href = result.url;
        }

        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Checkout failed';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [actualReportId]
  );

  return { startCheckout, loading, error, reportId: actualReportId };
}

/**
 * Hook for affiliate offers
 */
export function useAffiliateOffers(income?: number) {
  const [offers, setOffers] = useState<AffiliateOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const { flags } = useMonetizationFlags();

  useEffect(() => {
    if (!flags?.affiliateBlockEnabled) {
      setOffers([]);
      setLoading(false);
      return;
    }

    fetchAffiliateOffers(income)
      .then(setOffers)
      .finally(() => setLoading(false));
  }, [income, flags?.affiliateBlockEnabled]);

  return { offers, loading };
}

/**
 * Hook for referral system
 */
export function useReferral(reportId?: string) {
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { flags } = useMonetizationFlags();

  const actualReportId = reportId || getOrCreateReportId();

  useEffect(() => {
    if (!flags?.referralUnlockEnabled) {
      setReferral({ enabled: false, hasCode: false });
      setLoading(false);
      return;
    }

    fetchReferralInfo(actualReportId)
      .then(setReferral)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [actualReportId, flags?.referralUnlockEnabled]);

  const createCode = useCallback(
    async (email: string) => {
      setCreating(true);
      setError(null);

      try {
        const result = await createReferralCode(actualReportId, email);
        if (result) {
          setReferral((prev) =>
            prev
              ? {
                  ...prev,
                  hasCode: true,
                  code: result.code,
                  count: result.count,
                  rewardGranted: result.rewardGranted,
                }
              : null
          );
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create code';
        setError(message);
        return null;
      } finally {
        setCreating(false);
      }
    },
    [actualReportId]
  );

  const shareUrl = referral?.code
    ? `${window.location.origin}/?ref=${referral.code}`
    : null;

  return {
    referral,
    loading,
    creating,
    error,
    createCode,
    shareUrl,
    reportId: actualReportId,
  };
}

/**
 * Combined hook for all monetization state
 */
export function useMonetization(reportId?: string) {
  const { flags, loading: flagsLoading } = useMonetizationFlags();
  const { pricing, loading: pricingLoading } = usePricing();
  const { entitlement, loading: entitlementLoading, refresh: refreshEntitlement, reportId: actualReportId } =
    useEntitlement(reportId);
  const { startCheckout, loading: checkoutLoading, error: checkoutError } =
    useProUpgrade(reportId);

  const isReady = !flagsLoading && !pricingLoading && !entitlementLoading;

  const canShowUpsell =
    flags?.monetizationEnabled &&
    flags?.proReportEnabled &&
    entitlement?.canUpgrade;

  return {
    // State
    flags,
    pricing,
    entitlement,
    reportId: actualReportId,

    // Loading states
    loading: !isReady,
    checkoutLoading,

    // Errors
    checkoutError,

    // Computed
    isReady,
    canShowUpsell,
    tier: entitlement?.tier || 'FREE',
    hasProAccess: entitlement?.hasProReport || false,

    // Actions
    startCheckout,
    refreshEntitlement,
  };
}
