// Payment-to-Income (PTI) Calculator utilities

export interface CreditTier {
  name: string;
  range: string;
  apr: number; // Average APR for this tier
  color: string;
}

export const CREDIT_TIERS: CreditTier[] = [
  { name: "Excellent", range: "750+", apr: 5.99, color: "text-emerald-500" },
  { name: "Good", range: "700-749", apr: 8.49, color: "text-blue-500" },
  { name: "Fair", range: "650-699", apr: 12.99, color: "text-yellow-500" },
  { name: "Poor", range: "550-649", apr: 18.99, color: "text-red-500" },
];

// PTI ratios used by lenders
export const PTI_RATIOS = {
  conservative: 0.08, // 8% - very safe
  standard: 0.12,     // 12% - typical auto loan guideline
  aggressive: 0.15,   // 15% - max most lenders will approve
};

export interface PaymentApproval {
  type: string;
  ratio: number;
  maxPayment: number;
  description: string;
}

export interface LoanEstimate {
  creditTier: CreditTier;
  loanAmount: number;
  totalInterest: number;
  totalCost: number;
}

/**
 * Calculate maximum monthly payments based on income
 */
export function calculatePaymentApprovals(monthlyIncome: number): PaymentApproval[] {
  return [
    {
      type: "Conservative",
      ratio: PTI_RATIOS.conservative,
      maxPayment: monthlyIncome * PTI_RATIOS.conservative,
      description: "Low risk, easier approval",
    },
    {
      type: "Standard",
      ratio: PTI_RATIOS.standard,
      maxPayment: monthlyIncome * PTI_RATIOS.standard,
      description: "Typical auto loan guideline",
    },
    {
      type: "Aggressive",
      ratio: PTI_RATIOS.aggressive,
      maxPayment: monthlyIncome * PTI_RATIOS.aggressive,
      description: "Maximum most lenders approve",
    },
  ];
}

/**
 * Calculate loan amount from monthly payment using amortization formula
 * P = PMT * [(1 - (1 + r)^-n) / r]
 * Where: P = principal, PMT = payment, r = monthly rate, n = months
 */
export function calculateLoanAmount(
  monthlyPayment: number,
  annualRate: number,
  termMonths: number = 60 // 5-year loan default
): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return monthlyPayment * termMonths;

  const principal =
    monthlyPayment * ((1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate);

  return Math.round(principal);
}

/**
 * Calculate loan estimates for all credit tiers
 */
export function calculateLoanEstimates(
  monthlyPayment: number,
  termMonths: number = 60
): LoanEstimate[] {
  return CREDIT_TIERS.map((tier) => {
    const loanAmount = calculateLoanAmount(monthlyPayment, tier.apr, termMonths);
    const totalCost = monthlyPayment * termMonths;
    const totalInterest = totalCost - loanAmount;

    return {
      creditTier: tier,
      loanAmount,
      totalInterest,
      totalCost,
    };
  });
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

/**
 * Format percentage for display
 */
export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(0)}%`;
}
