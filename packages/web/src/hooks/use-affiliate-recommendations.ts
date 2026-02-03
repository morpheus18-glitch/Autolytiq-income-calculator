import { useMemo, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  getAffiliateRecommendations,
  getExitIntentAffiliate,
  type UserContext,
  type AffiliateRecommendation,
} from '@/lib/affiliate-engine';

// Get stored income from localStorage
function getStoredIncome(): number | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    // Try income from calculator
    const calcResult = localStorage.getItem('calc-result');
    if (calcResult) {
      const parsed = JSON.parse(calcResult);
      if (parsed.grossAnnual) return parsed.grossAnnual;
    }

    // Try income from housing calculator
    const housingState = localStorage.getItem('housing-calc-state');
    if (housingState) {
      const parsed = JSON.parse(housingState);
      if (parsed.monthlyIncome) return parsed.monthlyIncome * 12;
    }
  } catch {
    // Ignore parse errors
  }

  return undefined;
}

// Track pages viewed in session
function getSessionPagesViewed(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const pages = sessionStorage.getItem('pages-viewed');
    return pages ? JSON.parse(pages) : [];
  } catch {
    return [];
  }
}

function trackPageView(page: string): void {
  if (typeof window === 'undefined') return;

  try {
    const pages = getSessionPagesViewed();
    if (!pages.includes(page)) {
      pages.push(page);
      sessionStorage.setItem('pages-viewed', JSON.stringify(pages.slice(-10))); // Keep last 10
    }
  } catch {
    // Ignore storage errors
  }
}

// Detect calculator type from page
function detectCalculatorType(
  page: string
): UserContext['calculatorType'] | undefined {
  if (page.includes('housing') || page.includes('rent') || page.includes('mortgage')) {
    return 'housing';
  }
  if (page.includes('auto') || page.includes('car')) {
    return 'auto';
  }
  if (page.includes('budget') || page.includes('smart-money') || page.includes('afford')) {
    return 'budget';
  }
  if (page.includes('calculator') || page === '/') {
    return 'income';
  }
  return undefined;
}

export function useAffiliateRecommendations(limit: number = 4): AffiliateRecommendation[] {
  const [location] = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    trackPageView(location);
  }, [location]);

  const recommendations = useMemo(() => {
    if (!mounted) return [];

    const context: UserContext = {
      income: getStoredIncome(),
      currentPage: location,
      calculatorType: detectCalculatorType(location),
      pagesViewed: getSessionPagesViewed(),
      hasCalculated: !!getStoredIncome(),
    };

    return getAffiliateRecommendations(context, limit);
  }, [location, limit, mounted]);

  return recommendations;
}

export function useExitIntentAffiliate(): AffiliateRecommendation | null {
  const [location] = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const affiliate = useMemo(() => {
    if (!mounted) return null;

    const context: UserContext = {
      income: getStoredIncome(),
      currentPage: location,
      calculatorType: detectCalculatorType(location),
      pagesViewed: getSessionPagesViewed(),
      hasCalculated: !!getStoredIncome(),
    };

    return getExitIntentAffiliate(context);
  }, [location, mounted]);

  return affiliate;
}

// Get user context for external use
export function useUserContext(): UserContext {
  const [location] = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return useMemo(() => {
    if (!mounted) {
      return { currentPage: location };
    }

    return {
      income: getStoredIncome(),
      currentPage: location,
      calculatorType: detectCalculatorType(location),
      pagesViewed: getSessionPagesViewed(),
      hasCalculated: !!getStoredIncome(),
    };
  }, [location, mounted]);
}
