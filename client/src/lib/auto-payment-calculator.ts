/**
 * Auto Payment Calculator - The Decision Stabilizer Engine
 *
 * Core outputs:
 * 1. The Payment (expected monthly payment)
 * 2. The Comfort Verdict (Comfortable/Tight/Risky - binary + explanation)
 * 3. The Stress Driver Breakdown (what actually matters)
 */

import { CREDIT_TIERS, type CreditTier } from "@/data/vehicles";

export type VerdictLevel = "comfortable" | "tight" | "risky";

export interface AutoPaymentInputs {
  vehiclePrice: number;
  downPayment: number;
  creditTierId: string;
  termMonths: number;
  interestRate?: number; // Override if provided, else use credit tier
  monthlyGrossIncome: number;
  monthlyNetIncome?: number;
  fixedObligations: number; // rent, child support, etc.
}

export interface AutoPaymentResult {
  // The Payment
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  loanAmount: number;

  // The Verdict
  verdict: VerdictLevel;
  verdictExplanation: string;
  paymentToIncomeRatio: number; // As percentage
  debtToIncomeWithCar: number; // As percentage
  remainingAfterPayment: number;

  // Stress Drivers
  stressDrivers: StressDriver[];

  // Scenario comparisons
  scenarios: {
    incomeDrops10: ScenarioResult;
    higherInsurance: ScenarioResult;
    longerTerm: ScenarioResult;
  };
}

export interface StressDriver {
  id: string;
  label: string;
  impact: "high" | "medium" | "low";
  explanation: string;
  value: string;
}

export interface ScenarioResult {
  monthlyPayment: number;
  verdict: VerdictLevel;
  delta: number; // Change from base
  explanation: string;
}

// Verdict thresholds (rule-based, deterministic)
const THRESHOLDS = {
  // Payment as % of gross income
  paymentComfortable: 8, // Under 8% = comfortable
  paymentTight: 12, // 8-12% = tight
  // Above 12% = risky

  // Total DTI including car
  dtiComfortable: 36, // Under 36% = comfortable
  dtiTight: 43, // 36-43% = tight
  // Above 43% = risky

  // Monthly margin after obligations
  marginComfortable: 500, // $500+ left = comfortable
  marginTight: 200, // $200-500 = tight
  // Under $200 = risky
};

/**
 * Calculate monthly auto loan payment
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (annualRate <= 0) return principal / termMonths;

  const monthlyRate = annualRate / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return Math.round(payment * 100) / 100;
}

/**
 * Determine verdict based on payment ratio and DTI
 */
function determineVerdict(
  paymentRatio: number,
  dti: number,
  monthlyMargin: number
): { verdict: VerdictLevel; explanation: string } {
  // Check for risky conditions first
  if (
    paymentRatio > THRESHOLDS.paymentTight ||
    dti > THRESHOLDS.dtiTight ||
    monthlyMargin < THRESHOLDS.marginTight
  ) {
    let explanation = "";
    if (paymentRatio > THRESHOLDS.paymentTight) {
      explanation = `This payment consumes ${paymentRatio.toFixed(0)}% of your gross income — beyond the recommended 12% maximum.`;
    } else if (dti > THRESHOLDS.dtiTight) {
      explanation = `Your total debt obligations would reach ${dti.toFixed(0)}% of income, leaving little cushion for emergencies.`;
    } else {
      explanation = `After this payment and your obligations, you'd have only $${Math.round(monthlyMargin)} monthly cushion.`;
    }
    return { verdict: "risky", explanation };
  }

  // Check for tight conditions
  if (
    paymentRatio > THRESHOLDS.paymentComfortable ||
    dti > THRESHOLDS.dtiComfortable ||
    monthlyMargin < THRESHOLDS.marginComfortable
  ) {
    let explanation = "";
    if (paymentRatio > THRESHOLDS.paymentComfortable) {
      explanation = `This payment is ${paymentRatio.toFixed(0)}% of your income — workable but leaves limited margin if expenses rise.`;
    } else if (dti > THRESHOLDS.dtiComfortable) {
      explanation = `Your total debt-to-income of ${dti.toFixed(0)}% is manageable but approaching limits most lenders prefer.`;
    } else {
      explanation = `Your monthly cushion of $${Math.round(monthlyMargin)} is adequate but not robust against unexpected costs.`;
    }
    return { verdict: "tight", explanation };
  }

  // Comfortable
  return {
    verdict: "comfortable",
    explanation: `This payment is ${paymentRatio.toFixed(0)}% of your income with a healthy ${(100 - dti).toFixed(0)}% margin for savings and unexpected expenses.`,
  };
}

/**
 * Generate stress driver analysis
 */
function generateStressDrivers(
  inputs: AutoPaymentInputs,
  result: { monthlyPayment: number; totalInterest: number },
  creditTier: CreditTier
): StressDriver[] {
  const drivers: StressDriver[] = [];
  const loanAmount = inputs.vehiclePrice - inputs.downPayment;

  // Interest rate sensitivity
  const rateDelta = creditTier.rateRangeHigh - creditTier.rateRangeLow;
  const worstCasePayment = calculateMonthlyPayment(
    loanAmount,
    creditTier.rateRangeHigh,
    inputs.termMonths
  );
  const paymentIncrease = worstCasePayment - result.monthlyPayment;

  if (paymentIncrease > 30) {
    drivers.push({
      id: "interest_rate",
      label: "Interest Rate Sensitivity",
      impact: paymentIncrease > 75 ? "high" : "medium",
      explanation: `Your rate could range from ${(creditTier.rateRangeLow * 100).toFixed(1)}% to ${(creditTier.rateRangeHigh * 100).toFixed(1)}%, varying your payment by up to $${Math.round(paymentIncrease)}/month.`,
      value: `±$${Math.round(paymentIncrease)}/mo`,
    });
  }

  // Term length illusion
  if (inputs.termMonths >= 72) {
    const shorterTermPayment = calculateMonthlyPayment(
      loanAmount,
      inputs.interestRate || creditTier.typicalRate,
      60
    );
    const shorterTermTotal = shorterTermPayment * 60;
    const currentTotal = result.monthlyPayment * inputs.termMonths;
    const extraCost = currentTotal - shorterTermTotal;

    drivers.push({
      id: "term_length",
      label: "Term Length Illusion",
      impact: extraCost > 3000 ? "high" : "medium",
      explanation: `The ${inputs.termMonths}-month term saves $${Math.round(shorterTermPayment - result.monthlyPayment)}/month but costs $${Math.round(extraCost)} more in total interest.`,
      value: `+$${Math.round(extraCost)} total`,
    });
  }

  // Down payment leverage
  const downPaymentPercent = (inputs.downPayment / inputs.vehiclePrice) * 100;
  if (downPaymentPercent < 20) {
    const recommendedDown = inputs.vehiclePrice * 0.2;
    const additionalDown = recommendedDown - inputs.downPayment;
    const reducedLoan = loanAmount - additionalDown;
    const reducedPayment = calculateMonthlyPayment(
      reducedLoan,
      inputs.interestRate || creditTier.typicalRate,
      inputs.termMonths
    );
    const savingsPerMonth = result.monthlyPayment - reducedPayment;

    drivers.push({
      id: "down_payment",
      label: "Down Payment Leverage",
      impact: savingsPerMonth > 50 ? "high" : "medium",
      explanation: `An additional $${Math.round(additionalDown).toLocaleString()} down would reduce your payment by $${Math.round(savingsPerMonth)}/month.`,
      value: `-$${Math.round(savingsPerMonth)}/mo`,
    });
  }

  // Income volatility
  const paymentRatio = (result.monthlyPayment / inputs.monthlyGrossIncome) * 100;
  if (paymentRatio > 10) {
    const reducedIncome = inputs.monthlyGrossIncome * 0.9;
    const stressedRatio = (result.monthlyPayment / reducedIncome) * 100;

    drivers.push({
      id: "income_volatility",
      label: "Income Volatility Impact",
      impact: stressedRatio > 15 ? "high" : "low",
      explanation: `A 10% income drop would push this payment to ${stressedRatio.toFixed(0)}% of income — ${stressedRatio > 15 ? "dangerously high" : "still manageable"}.`,
      value: `${stressedRatio.toFixed(0)}% stressed`,
    });
  }

  return drivers;
}

/**
 * Calculate scenario: What if income drops 10%?
 */
function calculateIncomeDropScenario(
  inputs: AutoPaymentInputs,
  basePayment: number
): ScenarioResult {
  const reducedIncome = inputs.monthlyGrossIncome * 0.9;
  const newRatio = (basePayment / reducedIncome) * 100;
  const newDti = ((inputs.fixedObligations + basePayment) / reducedIncome) * 100;
  const newMargin = reducedIncome - inputs.fixedObligations - basePayment;

  const { verdict, explanation } = determineVerdict(newRatio, newDti, newMargin);

  return {
    monthlyPayment: basePayment,
    verdict,
    delta: -inputs.monthlyGrossIncome * 0.1,
    explanation: `With 10% less income, this payment becomes ${newRatio.toFixed(0)}% of your earnings. ${verdict === "risky" ? "This would be unsustainable." : verdict === "tight" ? "Manageable but strained." : "Still workable."}`,
  };
}

/**
 * Calculate scenario: What if insurance is higher?
 */
function calculateInsuranceScenario(
  inputs: AutoPaymentInputs,
  basePayment: number,
  vehiclePrice: number
): ScenarioResult {
  // Estimate insurance cost based on vehicle value
  const estimatedInsurance = Math.round(vehiclePrice * 0.003); // ~$150/mo for $50k car
  const higherInsurance = Math.round(estimatedInsurance * 1.5); // 50% higher
  const insuranceDelta = higherInsurance - estimatedInsurance;

  const effectivePayment = basePayment + higherInsurance;
  const newRatio = (effectivePayment / inputs.monthlyGrossIncome) * 100;
  const newDti = ((inputs.fixedObligations + effectivePayment) / inputs.monthlyGrossIncome) * 100;
  const newMargin = inputs.monthlyGrossIncome - inputs.fixedObligations - effectivePayment;

  const { verdict } = determineVerdict(newRatio, newDti, newMargin);

  return {
    monthlyPayment: effectivePayment,
    verdict,
    delta: insuranceDelta,
    explanation: `If insurance runs $${higherInsurance}/month instead of $${estimatedInsurance}, your true cost is $${effectivePayment}/month (${newRatio.toFixed(0)}% of income).`,
  };
}

/**
 * Calculate scenario: What if term is extended?
 */
function calculateLongerTermScenario(
  inputs: AutoPaymentInputs,
  creditTier: CreditTier
): ScenarioResult {
  const loanAmount = inputs.vehiclePrice - inputs.downPayment;
  const extendedTerm = Math.min(inputs.termMonths + 12, 84);
  const rate = inputs.interestRate || creditTier.typicalRate;

  const extendedPayment = calculateMonthlyPayment(loanAmount, rate, extendedTerm);
  const basePayment = calculateMonthlyPayment(loanAmount, rate, inputs.termMonths);
  const totalBase = basePayment * inputs.termMonths;
  const totalExtended = extendedPayment * extendedTerm;
  const additionalCost = totalExtended - totalBase;

  const newRatio = (extendedPayment / inputs.monthlyGrossIncome) * 100;
  const newDti = ((inputs.fixedObligations + extendedPayment) / inputs.monthlyGrossIncome) * 100;
  const newMargin = inputs.monthlyGrossIncome - inputs.fixedObligations - extendedPayment;

  const { verdict } = determineVerdict(newRatio, newDti, newMargin);

  return {
    monthlyPayment: extendedPayment,
    verdict,
    delta: extendedPayment - basePayment,
    explanation: `Extending to ${extendedTerm} months drops payment to $${Math.round(extendedPayment)} but adds $${Math.round(additionalCost).toLocaleString()} in total interest.`,
  };
}

/**
 * Main calculator function - produces all outputs
 */
export function calculateAutoPayment(inputs: AutoPaymentInputs): AutoPaymentResult {
  const creditTier = CREDIT_TIERS.find(t => t.id === inputs.creditTierId) || CREDIT_TIERS[1];
  const interestRate = inputs.interestRate ?? creditTier.typicalRate;

  const loanAmount = inputs.vehiclePrice - inputs.downPayment;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, inputs.termMonths);
  const totalCost = monthlyPayment * inputs.termMonths + inputs.downPayment;
  const totalInterest = totalCost - inputs.vehiclePrice;

  // Calculate ratios
  const paymentToIncomeRatio = (monthlyPayment / inputs.monthlyGrossIncome) * 100;
  const debtToIncomeWithCar = ((inputs.fixedObligations + monthlyPayment) / inputs.monthlyGrossIncome) * 100;
  const effectiveIncome = inputs.monthlyNetIncome || inputs.monthlyGrossIncome * 0.75;
  const remainingAfterPayment = effectiveIncome - inputs.fixedObligations - monthlyPayment;

  // Determine verdict
  const { verdict, verdictExplanation } = determineVerdict(
    paymentToIncomeRatio,
    debtToIncomeWithCar,
    remainingAfterPayment
  );

  // Generate stress drivers
  const stressDrivers = generateStressDrivers(
    inputs,
    { monthlyPayment, totalInterest },
    creditTier
  );

  // Calculate scenarios
  const scenarios = {
    incomeDrops10: calculateIncomeDropScenario(inputs, monthlyPayment),
    higherInsurance: calculateInsuranceScenario(inputs, monthlyPayment, inputs.vehiclePrice),
    longerTerm: calculateLongerTermScenario(inputs, creditTier),
  };

  return {
    monthlyPayment,
    totalInterest,
    totalCost,
    loanAmount,
    verdict,
    verdictExplanation,
    paymentToIncomeRatio,
    debtToIncomeWithCar,
    remainingAfterPayment,
    stressDrivers,
    scenarios,
  };
}

/**
 * Format currency
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
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Generate FAQ items based on calculator logic
 */
export function generateAutoPaymentFAQs(
  vehicle: { year: number; make: string; model: string },
  result: AutoPaymentResult
): { question: string; answer: string }[] {
  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return [
    {
      question: `Is $${Math.round(result.monthlyPayment)}/month too much for a ${vehicleName}?`,
      answer:
        result.verdict === "comfortable"
          ? `At ${result.paymentToIncomeRatio.toFixed(0)}% of income, this payment is within comfortable bounds. You have healthy margin for other expenses and savings.`
          : result.verdict === "tight"
            ? `At ${result.paymentToIncomeRatio.toFixed(0)}% of income, this payment is workable but tight. Consider a larger down payment or longer term to create more breathing room.`
            : `At ${result.paymentToIncomeRatio.toFixed(0)}% of income, this payment exceeds recommended limits. Most financial advisors suggest keeping car payments under 10-15% of gross income.`,
    },
    {
      question: `How much income do I need for a ${vehicleName}?`,
      answer: `For a comfortable payment of $${Math.round(result.monthlyPayment)}/month, you'd ideally earn at least $${Math.round(result.monthlyPayment / 0.08).toLocaleString()}/month gross (payment under 8% of income). At minimum, $${Math.round(result.monthlyPayment / 0.12).toLocaleString()}/month keeps you under the 12% threshold.`,
    },
    {
      question: `Why does this ${vehicleName} feel tight even if I'm approved?`,
      answer: `Lender approval focuses on ability to pay, not comfort. They'll approve loans up to 43%+ DTI because you technically CAN make payments. But at ${result.debtToIncomeWithCar.toFixed(0)}% DTI, there's little cushion for emergencies, savings, or lifestyle changes. Approval ≠ affordability.`,
    },
    {
      question: `What's the real cost of this ${vehicleName}?`,
      answer: `Beyond the $${Math.round(result.monthlyPayment)} monthly payment, factor in insurance (~$${Math.round(result.monthlyPayment * 0.25)}/mo), maintenance (~$100/mo), and fuel. Total ownership cost is likely $${Math.round(result.monthlyPayment * 1.4)}-$${Math.round(result.monthlyPayment * 1.6)}/month.`,
    },
  ];
}
