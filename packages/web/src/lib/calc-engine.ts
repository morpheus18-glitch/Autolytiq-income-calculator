/**
 * Unified calculation engine with WASM/JS fallback
 *
 * This module provides a unified interface for financial calculations
 * that automatically uses WASM when available and falls back to JavaScript.
 *
 * Feature flag: WASM_ENABLED controls whether WASM is attempted
 */

// Types for calculation results (matching Rust struct layouts)

export interface IncomeData {
  gross_annual: number;
  gross_monthly: number;
  gross_weekly: number;
  gross_daily: number;
  days_worked: number;
  max_auto_payment: number;
  max_rent: number;
}

export interface PaymentApproval {
  pti_type: string;
  ratio: number;
  max_payment: number;
  description: string;
}

export interface CreditTier {
  name: string;
  range: string;
  apr: number;
}

export interface LoanEstimate {
  credit_tier: CreditTier;
  loan_amount: number;
  total_interest: number;
  total_cost: number;
}

export interface PitiBreakdown {
  principal_interest: number;
  property_tax: number;
  insurance: number;
  pmi: number;
  total_monthly: number;
}

export interface MortgageResult {
  home_price: number;
  down_payment: number;
  down_payment_percent: number;
  loan_amount: number;
  interest_rate: number;
  term_years: number;
  piti: PitiBreakdown;
  total_payments: number;
  total_interest: number;
}

export interface DtiAnalysis {
  monthly_income: number;
  housing_payment: number;
  other_debts: number;
  front_end_dti: number;
  back_end_dti: number;
  is_affordable: boolean;
  qualification: string;
}

export interface TaxBreakdown {
  gross_annual: number;
  federal_tax: number;
  state_tax: number;
  fica_tax: number;
  social_security: number;
  medicare: number;
  retirement_401k: number;
  health_insurance: number;
  total_deductions: number;
  net_annual: number;
  net_monthly: number;
  effective_tax_rate: number;
}

export interface BudgetCategory {
  name: string;
  percent: number;
  monthly: number;
  weekly: number;
  daily: number;
  subcategories: { name: string; percent: number; monthly: number }[];
}

export interface BudgetAllocation {
  net_monthly: number;
  needs: BudgetCategory;
  wants: BudgetCategory;
  savings: BudgetCategory;
}

// WASM module type (will be loaded dynamically)
interface WasmModule {
  calculateIncome: (ytd: number, start: string, end: string) => IncomeData;
  incomeFromMonthly: (monthly: number) => IncomeData;
  incomeFromAnnual: (annual: number) => IncomeData;
  calculatePaymentApprovals: (monthly: number) => PaymentApproval[];
  calculateLoanAmount: (payment: number, rate: number, months: number) => number;
  calculateMonthlyPayment: (principal: number, rate: number, months: number) => number;
  calculateLoanEstimates: (payment: number, months: number) => LoanEstimate[];
  calculateMortgage: (
    price: number,
    down: number,
    rate: number,
    years: number,
    taxRate: number,
    insurance: number
  ) => MortgageResult;
  calculateDti: (income: number, housing: number, debts: number) => DtiAnalysis;
  calculateTaxes: (
    gross: number,
    retirement: number,
    health: number,
    state: number
  ) => TaxBreakdown;
  calculateBudgetAllocation: (netMonthly: number) => BudgetAllocation;
  isWasmLoaded: () => boolean;
  getVersion: () => string;
}

// Global state for WASM module
let wasmModule: WasmModule | null = null;
let wasmLoadPromise: Promise<WasmModule | null> | null = null;
let wasmLoadFailed = false;

// Feature flag - can be set via environment or localStorage
const WASM_ENABLED = (() => {
  // Check environment variable (build time)
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_WASM_ENABLED === "false") {
    return false;
  }
  // Check localStorage (runtime override)
  if (typeof localStorage !== "undefined") {
    const override = localStorage.getItem("WASM_ENABLED");
    if (override !== null) {
      return override === "true";
    }
  }
  // Default: enabled
  return true;
})();

/**
 * Attempt to load the WASM module
 */
async function loadWasm(): Promise<WasmModule | null> {
  if (!WASM_ENABLED || wasmLoadFailed) {
    return null;
  }

  if (wasmModule) {
    return wasmModule;
  }

  if (wasmLoadPromise) {
    return wasmLoadPromise;
  }

  wasmLoadPromise = (async () => {
    try {
      const wasm = await import("@autolytiq/calc-wasm");
      await wasm.default(); // Initialize WASM
      wasmModule = wasm as unknown as WasmModule;
      console.log("[CalcEngine] WASM module loaded, version:", wasm.getVersion());
      return wasmModule;
    } catch (error) {
      console.warn("[CalcEngine] WASM load failed, using JS fallback:", error);
      wasmLoadFailed = true;
      return null;
    }
  })();

  return wasmLoadPromise;
}

/**
 * Check if WASM is currently available
 */
export async function isWasmAvailable(): Promise<boolean> {
  const wasm = await loadWasm();
  return wasm !== null;
}

/**
 * Get the current engine mode
 */
export async function getEngineMode(): Promise<"wasm" | "js"> {
  const wasm = await loadWasm();
  return wasm ? "wasm" : "js";
}

// =============================================================================
// JavaScript Fallback Implementations
// =============================================================================

function jsCalculateIncome(
  ytdIncome: number,
  startDate: string,
  checkDate: string
): IncomeData {
  const start = new Date(startDate);
  const check = new Date(checkDate);
  const yearStart = new Date(check.getFullYear(), 0, 1);
  const effectiveStart = start < yearStart ? yearStart : start;

  const days = Math.floor(
    (check.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  if (days <= 0) {
    throw new Error("Check date must be after start date");
  }

  const daily = ytdIncome / days;
  const annual = daily * 365;
  const monthly = annual / 12;
  const weekly = annual / 52;

  return {
    gross_annual: Math.round(annual),
    gross_monthly: Math.round(monthly),
    gross_weekly: Math.round(weekly),
    gross_daily: Math.round(daily),
    days_worked: days,
    max_auto_payment: Math.round(monthly * 0.12),
    max_rent: Math.round(monthly * 0.30),
  };
}

function jsCalculateLoanAmount(
  monthlyPayment: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return monthlyPayment * termMonths;
  const principal =
    monthlyPayment * ((1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate);
  return Math.round(principal);
}

function jsCalculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return Math.round(principal / termMonths);
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return Math.round(principal * (monthlyRate * factor) / (factor - 1));
}

function jsCalculateMortgage(
  homePrice: number,
  downPaymentPercent: number,
  interestRate: number,
  termYears: number,
  propertyTaxRate: number,
  annualInsurance: number
): MortgageResult {
  const downPayment = homePrice * (downPaymentPercent / 100);
  const loanAmount = homePrice - downPayment;
  const termMonths = termYears * 12;

  const monthlyRate = interestRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  const principalInterest =
    monthlyRate === 0
      ? loanAmount / termMonths
      : loanAmount * (monthlyRate * factor) / (factor - 1);

  const propertyTax = (homePrice * (propertyTaxRate / 100)) / 12;
  const insurance = annualInsurance / 12;
  const pmi = downPaymentPercent < 20 ? (loanAmount * 0.005) / 12 : 0;
  const totalMonthly = principalInterest + propertyTax + insurance + pmi;
  const totalPayments = principalInterest * termMonths;

  return {
    home_price: homePrice,
    down_payment: Math.round(downPayment),
    down_payment_percent: downPaymentPercent,
    loan_amount: Math.round(loanAmount),
    interest_rate: interestRate,
    term_years: termYears,
    piti: {
      principal_interest: Math.round(principalInterest),
      property_tax: Math.round(propertyTax),
      insurance: Math.round(insurance),
      pmi: Math.round(pmi),
      total_monthly: Math.round(totalMonthly),
    },
    total_payments: Math.round(totalPayments),
    total_interest: Math.round(totalPayments - loanAmount),
  };
}

// 2024 Tax brackets
const TAX_BRACKETS = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

const STANDARD_DEDUCTION = 14600;
const SS_WAGE_BASE = 168600;

function jsCalculateTaxes(
  grossAnnual: number,
  retirement401kPercent: number,
  healthInsuranceAnnual: number,
  stateTaxRate: number
): TaxBreakdown {
  const retirement = grossAnnual * (retirement401kPercent / 100);
  const agi = grossAnnual - retirement - healthInsuranceAnnual;

  // Federal tax
  const taxableIncome = Math.max(0, agi - STANDARD_DEDUCTION);
  let federalTax = 0;
  let remaining = taxableIncome;
  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
    federalTax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }

  // State tax
  const stateTax = agi * (stateTaxRate / 100);

  // FICA
  const ssTaxable = Math.min(grossAnnual, SS_WAGE_BASE);
  const socialSecurity = ssTaxable * 0.062;
  const medicare = grossAnnual * 0.0145;
  const fica = socialSecurity + medicare;

  const totalDeductions =
    federalTax + stateTax + fica + retirement + healthInsuranceAnnual;
  const netAnnual = grossAnnual - totalDeductions;
  const taxOnly = federalTax + stateTax + fica;

  return {
    gross_annual: Math.round(grossAnnual),
    federal_tax: Math.round(federalTax),
    state_tax: Math.round(stateTax),
    fica_tax: Math.round(fica),
    social_security: Math.round(socialSecurity),
    medicare: Math.round(medicare),
    retirement_401k: Math.round(retirement),
    health_insurance: Math.round(healthInsuranceAnnual),
    total_deductions: Math.round(totalDeductions),
    net_annual: Math.round(netAnnual),
    net_monthly: Math.round(netAnnual / 12),
    effective_tax_rate: Math.round((taxOnly / grossAnnual) * 1000) / 10,
  };
}

function jsCalculateBudgetAllocation(netMonthly: number): BudgetAllocation {
  const needsMonthly = netMonthly * 0.5;
  const wantsMonthly = netMonthly * 0.3;
  const savingsMonthly = netMonthly * 0.2;

  return {
    net_monthly: Math.round(netMonthly),
    needs: {
      name: "Needs",
      percent: 50,
      monthly: Math.round(needsMonthly),
      weekly: Math.round(needsMonthly / 4.33),
      daily: Math.round(needsMonthly / 30),
      subcategories: [
        { name: "Housing", percent: 25, monthly: Math.round(netMonthly * 0.25) },
        { name: "Utilities", percent: 5, monthly: Math.round(netMonthly * 0.05) },
        { name: "Groceries", percent: 10, monthly: Math.round(netMonthly * 0.1) },
        { name: "Transportation", percent: 10, monthly: Math.round(netMonthly * 0.1) },
      ],
    },
    wants: {
      name: "Wants",
      percent: 30,
      monthly: Math.round(wantsMonthly),
      weekly: Math.round(wantsMonthly / 4.33),
      daily: Math.round(wantsMonthly / 30),
      subcategories: [
        { name: "Dining Out", percent: 5, monthly: Math.round(netMonthly * 0.05) },
        { name: "Subscriptions", percent: 5, monthly: Math.round(netMonthly * 0.05) },
        { name: "Travel/Fun", percent: 10, monthly: Math.round(netMonthly * 0.1) },
        { name: "Personal", percent: 10, monthly: Math.round(netMonthly * 0.1) },
      ],
    },
    savings: {
      name: "Savings",
      percent: 20,
      monthly: Math.round(savingsMonthly),
      weekly: Math.round(savingsMonthly / 4.33),
      daily: Math.round(savingsMonthly / 30),
      subcategories: [
        { name: "Emergency Fund", percent: 10, monthly: Math.round(netMonthly * 0.1) },
        { name: "Investments", percent: 5, monthly: Math.round(netMonthly * 0.05) },
        { name: "Goals", percent: 5, monthly: Math.round(netMonthly * 0.05) },
      ],
    },
  };
}

// =============================================================================
// Unified API - Uses WASM when available, JS fallback otherwise
// =============================================================================

/**
 * Calculate income projection from YTD data
 */
export async function calculateIncome(
  ytdIncome: number,
  startDate: string,
  checkDate: string
): Promise<IncomeData> {
  const wasm = await loadWasm();
  if (wasm) {
    return wasm.calculateIncome(ytdIncome, startDate, checkDate);
  }
  return jsCalculateIncome(ytdIncome, startDate, checkDate);
}

/**
 * Calculate loan amount from monthly payment (reverse amortization)
 */
export async function calculateLoanAmount(
  monthlyPayment: number,
  annualRate: number,
  termMonths: number = 60
): Promise<number> {
  const wasm = await loadWasm();
  if (wasm) {
    return wasm.calculateLoanAmount(monthlyPayment, annualRate, termMonths);
  }
  return jsCalculateLoanAmount(monthlyPayment, annualRate, termMonths);
}

/**
 * Calculate monthly payment from loan amount
 */
export async function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number = 60
): Promise<number> {
  const wasm = await loadWasm();
  if (wasm) {
    return wasm.calculateMonthlyPayment(principal, annualRate, termMonths);
  }
  return jsCalculateMonthlyPayment(principal, annualRate, termMonths);
}

/**
 * Calculate mortgage with PITI breakdown
 */
export async function calculateMortgage(
  homePrice: number,
  downPaymentPercent: number,
  interestRate: number,
  termYears: number,
  propertyTaxRate: number,
  annualInsurance: number
): Promise<MortgageResult> {
  const wasm = await loadWasm();
  if (wasm) {
    return wasm.calculateMortgage(
      homePrice,
      downPaymentPercent,
      interestRate,
      termYears,
      propertyTaxRate,
      annualInsurance
    );
  }
  return jsCalculateMortgage(
    homePrice,
    downPaymentPercent,
    interestRate,
    termYears,
    propertyTaxRate,
    annualInsurance
  );
}

/**
 * Calculate tax breakdown
 */
export async function calculateTaxes(
  grossAnnual: number,
  retirement401kPercent: number,
  healthInsuranceAnnual: number,
  stateTaxRate: number
): Promise<TaxBreakdown> {
  const wasm = await loadWasm();
  if (wasm) {
    return wasm.calculateTaxes(
      grossAnnual,
      retirement401kPercent,
      healthInsuranceAnnual,
      stateTaxRate
    );
  }
  return jsCalculateTaxes(
    grossAnnual,
    retirement401kPercent,
    healthInsuranceAnnual,
    stateTaxRate
  );
}

/**
 * Calculate 50/30/20 budget allocation
 */
export async function calculateBudgetAllocation(
  netMonthly: number
): Promise<BudgetAllocation> {
  const wasm = await loadWasm();
  if (wasm) {
    return wasm.calculateBudgetAllocation(netMonthly);
  }
  return jsCalculateBudgetAllocation(netMonthly);
}

// Synchronous versions for backwards compatibility
// These use the JS fallback directly without waiting for WASM

export const sync = {
  calculateIncome: jsCalculateIncome,
  calculateLoanAmount: jsCalculateLoanAmount,
  calculateMonthlyPayment: jsCalculateMonthlyPayment,
  calculateMortgage: jsCalculateMortgage,
  calculateTaxes: jsCalculateTaxes,
  calculateBudgetAllocation: jsCalculateBudgetAllocation,
};

// Export for testing
export const _internal = {
  WASM_ENABLED,
  loadWasm,
  jsCalculateIncome,
  jsCalculateLoanAmount,
  jsCalculateMortgage,
  jsCalculateTaxes,
  jsCalculateBudgetAllocation,
};
