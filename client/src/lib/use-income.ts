import { useState, useEffect, useCallback } from "react";

const INCOME_STORAGE_KEY = "income-calc-state";

export interface IncomeData {
  grossAnnual: number;
  grossMonthly: number;
  grossWeekly: number;
  grossDaily: number;
  daysWorked: number;
  maxAutoPayment: number; // 12% of monthly
  maxRent: number; // 30% of monthly
  source: "calculator" | "manual";
  calculatedAt: string;
}

export interface UseIncomeResult {
  income: IncomeData | null;
  hasIncome: boolean;
  refreshIncome: () => void;
  clearIncome: () => void;
}

/**
 * Shared hook to access income data calculated from the main calculator.
 * Use this across all pages to maintain consistent income data flow.
 */
export function useIncome(): UseIncomeResult {
  const [income, setIncome] = useState<IncomeData | null>(null);

  const calculateFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(INCOME_STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const { ytdIncome, startDate, checkDate } = parsed;

      if (!ytdIncome || !startDate || !checkDate) return null;

      const start = new Date(startDate);
      const check = new Date(checkDate);
      const yearStart = new Date(check.getFullYear(), 0, 1);
      const effectiveStart = start < yearStart ? yearStart : start;

      const days = Math.floor((check.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (days <= 0) return null;

      const ytd = parseFloat(ytdIncome);
      if (isNaN(ytd) || ytd <= 0) return null;

      const daily = ytd / days;
      const annual = daily * 365;
      const monthly = annual / 12;
      const weekly = annual / 52;

      return {
        grossAnnual: Math.round(annual),
        grossMonthly: Math.round(monthly),
        grossWeekly: Math.round(weekly),
        grossDaily: Math.round(daily),
        daysWorked: days,
        maxAutoPayment: Math.round(monthly * 0.12),
        maxRent: Math.round(monthly * 0.30),
        source: "calculator" as const,
        calculatedAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error("Failed to parse income data:", e);
      return null;
    }
  }, []);

  const refreshIncome = useCallback(() => {
    const data = calculateFromStorage();
    setIncome(data);
  }, [calculateFromStorage]);

  const clearIncome = useCallback(() => {
    localStorage.removeItem(INCOME_STORAGE_KEY);
    setIncome(null);
  }, []);

  // Load on mount
  useEffect(() => {
    refreshIncome();
  }, [refreshIncome]);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === INCOME_STORAGE_KEY) {
        refreshIncome();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshIncome]);

  return {
    income,
    hasIncome: income !== null,
    refreshIncome,
    clearIncome,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
