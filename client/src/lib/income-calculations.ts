/**
 * Income Calculation Utilities
 * Shared functions for income calculations across the app
 */

// ============================================
// Types & Interfaces
// ============================================

export type Frequency = "weekly" | "biweekly" | "monthly" | "annually";
export type IncomeType = "w2" | "freelance" | "gig" | "rental" | "side-hustle" | "other";
export type StabilityRating = 1 | 2 | 3 | 4 | 5;

export interface IncomeStream {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  type: IncomeType;
  stabilityRating: StabilityRating;
}

export interface GigResult {
  grossAnnual: number;
  grossMonthly: number;
  expenses: number;
  expenseRate: number;
  netBeforeTax: number;
  selfEmploymentTax: number;
  estimatedIncomeTax: number;
  trueNetIncome: number;
  quarterlyTaxSetAside: number;
  effectiveHourlyRate: number | null;
  lenderVisibleIncome: number;
}

export interface InflationProjection {
  year: number;
  purchasingPower: number;
  percentLoss: number;
  raiseNeeded: number;
}

export interface GigPlatform {
  id: string;
  name: string;
  icon: string;
  expenseRate: number;
  description: string;
}

// ============================================
// Platform Presets
// ============================================

export const GIG_PLATFORMS: GigPlatform[] = [
  {
    id: "uber",
    name: "Uber",
    icon: "car",
    expenseRate: 0.30,
    description: "Rideshare driver"
  },
  {
    id: "lyft",
    name: "Lyft",
    icon: "car",
    expenseRate: 0.30,
    description: "Rideshare driver"
  },
  {
    id: "doordash",
    name: "DoorDash",
    icon: "bike",
    expenseRate: 0.25,
    description: "Food delivery"
  },
  {
    id: "instacart",
    name: "Instacart",
    icon: "shopping",
    expenseRate: 0.25,
    description: "Grocery delivery"
  },
  {
    id: "upwork",
    name: "Upwork",
    icon: "laptop",
    expenseRate: 0.10,
    description: "Freelance work"
  },
  {
    id: "other",
    name: "Other",
    icon: "briefcase",
    expenseRate: 0.20,
    description: "Custom gig work"
  },
];

// ============================================
// Stability Weights
// ============================================

export const STABILITY_WEIGHTS: Record<StabilityRating, number> = {
  5: 1.00,   // Very Stable (W2)
  4: 0.90,   // Stable
  3: 0.80,   // Moderate
  2: 0.65,   // Variable
  1: 0.50,   // Very Variable
};

export const STABILITY_LABELS: Record<StabilityRating, string> = {
  5: "Very Stable",
  4: "Stable",
  3: "Moderate",
  2: "Variable",
  1: "Very Variable",
};

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  w2: "W-2 Employment",
  freelance: "Freelance",
  gig: "Gig Work",
  rental: "Rental Income",
  "side-hustle": "Side Hustle",
  other: "Other",
};

// ============================================
// Frequency Conversion
// ============================================

/**
 * Convert any amount to annual based on frequency
 */
export function toAnnual(amount: number, frequency: Frequency): number {
  switch (frequency) {
    case "weekly":
      return amount * 52;
    case "biweekly":
      return amount * 26;
    case "monthly":
      return amount * 12;
    case "annually":
      return amount;
    default:
      return amount;
  }
}

/**
 * Convert annual amount to specified frequency
 */
export function fromAnnual(annual: number, frequency: Frequency): number {
  switch (frequency) {
    case "weekly":
      return annual / 52;
    case "biweekly":
      return annual / 26;
    case "monthly":
      return annual / 12;
    case "annually":
      return annual;
    default:
      return annual;
  }
}

// ============================================
// Gig Worker Calculations
// ============================================

const SE_TAX_RATE = 0.153; // 15.3% self-employment tax
const SE_TAX_DEDUCTIBLE_PORTION = 0.9235; // SE tax is on 92.35% of net earnings

/**
 * Calculate gig worker true net income
 *
 * Formula:
 * Gross Earnings
 * - Platform Expenses (mileage, phone, supplies: 25-35%)
 * = Net Before Tax
 * - Self-Employment Tax (15.3% on 92.35% of net)
 * = True Net Income
 */
export function calculateGigIncome(
  grossAnnual: number,
  platformId: string,
  customExpenseRate?: number,
  hoursWorkedPerWeek?: number
): GigResult {
  const platform = GIG_PLATFORMS.find(p => p.id === platformId) || GIG_PLATFORMS[GIG_PLATFORMS.length - 1];
  const expenseRate = customExpenseRate ?? platform.expenseRate;

  // Calculate expenses
  const expenses = grossAnnual * expenseRate;
  const netBeforeTax = grossAnnual - expenses;

  // Self-employment tax (15.3% on 92.35% of net earnings)
  const seBase = netBeforeTax * SE_TAX_DEDUCTIBLE_PORTION;
  const selfEmploymentTax = seBase * SE_TAX_RATE;

  // Estimated income tax (rough estimate using 22% marginal rate for middle income)
  // Adjusted gross = net - 50% of SE tax (above-the-line deduction)
  const adjustedGross = netBeforeTax - (selfEmploymentTax * 0.5);
  const standardDeduction = 14600; // 2024 single filer
  const taxableIncome = Math.max(0, adjustedGross - standardDeduction);
  const estimatedIncomeTax = estimateFederalTax(taxableIncome);

  // True net income
  const trueNetIncome = netBeforeTax - selfEmploymentTax - estimatedIncomeTax;

  // Quarterly tax set-aside
  const quarterlyTaxSetAside = (selfEmploymentTax + estimatedIncomeTax) / 4;

  // Effective hourly rate (if hours provided)
  let effectiveHourlyRate: number | null = null;
  if (hoursWorkedPerWeek && hoursWorkedPerWeek > 0) {
    const annualHours = hoursWorkedPerWeek * 52;
    effectiveHourlyRate = trueNetIncome / annualHours;
  }

  // What lenders see (they typically count 75-80% of self-employment income)
  const lenderVisibleIncome = netBeforeTax * 0.75;

  return {
    grossAnnual,
    grossMonthly: grossAnnual / 12,
    expenses,
    expenseRate,
    netBeforeTax,
    selfEmploymentTax,
    estimatedIncomeTax,
    trueNetIncome,
    quarterlyTaxSetAside,
    effectiveHourlyRate,
    lenderVisibleIncome,
  };
}

/**
 * Rough federal tax estimate using 2024 brackets
 */
function estimateFederalTax(taxableIncome: number): number {
  // 2024 single filer brackets
  const brackets = [
    { limit: 11600, rate: 0.10 },
    { limit: 47150, rate: 0.12 },
    { limit: 100525, rate: 0.22 },
    { limit: 191950, rate: 0.24 },
    { limit: 243725, rate: 0.32 },
    { limit: 609350, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ];

  let tax = 0;
  let remaining = taxableIncome;
  let prevLimit = 0;

  for (const bracket of brackets) {
    const taxableInBracket = Math.min(remaining, bracket.limit - prevLimit);
    if (taxableInBracket <= 0) break;
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    prevLimit = bracket.limit;
  }

  return tax;
}

// ============================================
// Inflation Impact Calculations
// ============================================

/**
 * Calculate inflation impact projections
 *
 * Purchasing Power = Income / (1 + inflation)^years
 * Percent Loss = (1 - Purchasing Power / Income) * 100
 * Raise Needed = ((1 + inflation)^years - 1) * 100
 */
export function calculateInflationImpact(
  income: number,
  annualInflationRate: number = 0.03,
  years: number[] = [1, 3, 5, 10]
): InflationProjection[] {
  return years.map(year => {
    const inflationMultiplier = Math.pow(1 + annualInflationRate, year);
    const purchasingPower = income / inflationMultiplier;
    const percentLoss = ((1 - purchasingPower / income) * 100);
    const raiseNeeded = ((inflationMultiplier - 1) * 100);

    return {
      year,
      purchasingPower,
      percentLoss,
      raiseNeeded,
    };
  });
}

// ============================================
// Income Streams Calculations
// ============================================

/**
 * Calculate total annual income from streams
 */
export function calculateTotalAnnual(streams: IncomeStream[]): number {
  return streams.reduce((total, stream) => {
    return total + toAnnual(stream.amount, stream.frequency);
  }, 0);
}

/**
 * Calculate reliable (stability-weighted) income
 *
 * Reliable Income = Sum of (stream annual * stability weight)
 */
export function calculateReliableIncome(streams: IncomeStream[]): number {
  return streams.reduce((total, stream) => {
    const annual = toAnnual(stream.amount, stream.frequency);
    const weight = STABILITY_WEIGHTS[stream.stabilityRating];
    return total + (annual * weight);
  }, 0);
}

/**
 * Calculate income breakdown by type
 */
export function calculateIncomeByType(streams: IncomeStream[]): Record<IncomeType, number> {
  const byType: Record<IncomeType, number> = {
    w2: 0,
    freelance: 0,
    gig: 0,
    rental: 0,
    "side-hustle": 0,
    other: 0,
  };

  streams.forEach(stream => {
    byType[stream.type] += toAnnual(stream.amount, stream.frequency);
  });

  return byType;
}

/**
 * Calculate monthly breakdown
 */
export function calculateMonthlyBreakdown(streams: IncomeStream[]): number {
  const totalAnnual = calculateTotalAnnual(streams);
  return totalAnnual / 12;
}

/**
 * Generate a unique ID for new streams
 */
export function generateStreamId(): string {
  return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get suggested stability rating based on income type
 */
export function getSuggestedStability(type: IncomeType): StabilityRating {
  switch (type) {
    case "w2":
      return 5;
    case "rental":
      return 4;
    case "freelance":
      return 3;
    case "side-hustle":
      return 2;
    case "gig":
      return 2;
    case "other":
      return 3;
    default:
      return 3;
  }
}

// ============================================
// Format Helpers
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
