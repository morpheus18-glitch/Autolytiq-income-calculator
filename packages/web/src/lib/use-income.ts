import { useState, useEffect, useCallback } from "react";
import {
  type IncomeStream,
  calculateTotalAnnual,
  calculateReliableIncome,
} from "./income-calculations";

const INCOME_STORAGE_KEY = "income-calc-state";
const STREAMS_STORAGE_KEY = "income-streams";

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
  // Income streams support
  streams: IncomeStream[];
  hasStreams: boolean;
  combinedIncome: {
    totalAnnual: number;
    reliableAnnual: number;
    totalMonthly: number;
    reliableMonthly: number;
    streamCount: number;
  } | null;
}

/**
 * Shared hook to access income data calculated from the main calculator.
 * Use this across all pages to maintain consistent income data flow.
 */
export function useIncome(): UseIncomeResult {
  const [income, setIncome] = useState<IncomeData | null>(null);
  const [streams, setStreams] = useState<IncomeStream[]>([]);

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

  const loadStreams = useCallback((): IncomeStream[] => {
    try {
      const stored = localStorage.getItem(STREAMS_STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }, []);

  const refreshIncome = useCallback(() => {
    const data = calculateFromStorage();
    setIncome(data);
    const loadedStreams = loadStreams();
    setStreams(loadedStreams);
  }, [calculateFromStorage, loadStreams]);

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

  // Calculate combined income from streams
  const combinedIncome = streams.length > 0 ? (() => {
    const totalAnnual = calculateTotalAnnual(streams);
    const reliableAnnual = calculateReliableIncome(streams);
    return {
      totalAnnual,
      reliableAnnual,
      totalMonthly: Math.round(totalAnnual / 12),
      reliableMonthly: Math.round(reliableAnnual / 12),
      streamCount: streams.length,
    };
  })() : null;

  return {
    income,
    hasIncome: income !== null,
    refreshIncome,
    clearIncome,
    streams,
    hasStreams: streams.length > 0,
    combinedIncome,
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
