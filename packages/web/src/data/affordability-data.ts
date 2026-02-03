// Pre-calculated affordability data for programmatic SEO pages
// Based on 2024 federal tax brackets and standard deduction

export interface AffordabilityData {
  salary: number;
  salaryFormatted: string;
  slug: string;
  // Tax calculations (single filer, standard deduction)
  federalTax: number;
  stateTaxEstimate: number; // Average state tax ~5%
  ficaTax: number; // Social Security 6.2% + Medicare 1.45%
  totalTaxes: number;
  takeHomePay: number;
  // Monthly breakdown
  monthlyGross: number;
  monthlyNet: number;
  // 50/30/20 Budget
  needs: number; // 50% of net
  wants: number; // 30% of net
  savings: number; // 20% of net
  // Specific affordability limits
  maxRent: number; // 30% of gross monthly
  maxCarPayment: number; // 12% of gross monthly (with insurance)
  maxMortgage: number; // 28% of gross monthly (front-end DTI)
  recommendedEmergencyFund: number; // 3-6 months expenses
  // Hourly equivalent
  hourlyRate: number; // Assuming 2080 hours/year
  weeklyPay: number;
  biweeklyPay: number;
}

// Federal tax brackets for 2024 (single filer)
function calculateFederalTax(income: number): number {
  const standardDeduction = 14600;
  const taxableIncome = Math.max(0, income - standardDeduction);

  // 2024 tax brackets
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
  let remainingIncome = taxableIncome;
  let previousLimit = 0;

  for (const bracket of brackets) {
    const taxableInBracket = Math.min(remainingIncome, bracket.limit - previousLimit);
    if (taxableInBracket <= 0) break;
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
    previousLimit = bracket.limit;
  }

  return Math.round(tax);
}

function calculateFICA(income: number): number {
  const socialSecurityCap = 168600; // 2024 cap
  const socialSecurityRate = 0.062;
  const medicareRate = 0.0145;

  const socialSecurity = Math.min(income, socialSecurityCap) * socialSecurityRate;
  const medicare = income * medicareRate;

  return Math.round(socialSecurity + medicare);
}

function formatSalarySlug(salary: number): string {
  if (salary >= 1000) {
    return `${salary / 1000}k`;
  }
  return salary.toString();
}

function formatSalaryDisplay(salary: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(salary);
}

export function calculateAffordability(salary: number): AffordabilityData {
  const federalTax = calculateFederalTax(salary);
  const stateTaxEstimate = Math.round(salary * 0.05); // 5% average state tax
  const ficaTax = calculateFICA(salary);
  const totalTaxes = federalTax + stateTaxEstimate + ficaTax;
  const takeHomePay = salary - totalTaxes;

  const monthlyGross = Math.round(salary / 12);
  const monthlyNet = Math.round(takeHomePay / 12);

  return {
    salary,
    salaryFormatted: formatSalaryDisplay(salary),
    slug: formatSalarySlug(salary),
    federalTax,
    stateTaxEstimate,
    ficaTax,
    totalTaxes,
    takeHomePay,
    monthlyGross,
    monthlyNet,
    // 50/30/20 based on NET income
    needs: Math.round(monthlyNet * 0.50),
    wants: Math.round(monthlyNet * 0.30),
    savings: Math.round(monthlyNet * 0.20),
    // Affordability limits (based on GROSS)
    maxRent: Math.round(monthlyGross * 0.30),
    maxCarPayment: Math.round(monthlyGross * 0.12),
    maxMortgage: Math.round(monthlyGross * 0.28),
    recommendedEmergencyFund: Math.round(monthlyNet * 0.50 * 4), // 4 months of "needs"
    // Other pay periods
    hourlyRate: Math.round((salary / 2080) * 100) / 100,
    weeklyPay: Math.round(salary / 52),
    biweeklyPay: Math.round(salary / 26),
  };
}

// Pre-defined salary levels for SEO pages
export const SALARY_LEVELS = [
  30000, 35000, 40000, 45000, 50000,
  55000, 60000, 65000, 70000, 75000,
  80000, 85000, 90000, 95000, 100000,
  110000, 120000, 150000, 175000, 200000,
];

// Pre-calculated data for all salary levels
export const AFFORDABILITY_DATA: Record<string, AffordabilityData> = {};
for (const salary of SALARY_LEVELS) {
  const data = calculateAffordability(salary);
  AFFORDABILITY_DATA[data.slug] = data;
}

// Get data by slug (e.g., "50k", "100k")
export function getAffordabilityBySlug(slug: string): AffordabilityData | null {
  return AFFORDABILITY_DATA[slug.toLowerCase()] || null;
}

// Get all slugs for routing
export function getAllAffordabilitySlugs(): string[] {
  return SALARY_LEVELS.map(formatSalarySlug);
}

// Affiliate recommendations based on income level
export interface AffiliateRecommendation {
  name: string;
  description: string;
  url: string;
  tag?: string;
  category: 'credit' | 'savings' | 'investing' | 'loans' | 'budgeting';
  minIncome?: number;
  maxIncome?: number;
}

export const AFFORDABILITY_AFFILIATES: AffiliateRecommendation[] = [
  // Universal (all income levels)
  {
    name: 'Credit Karma',
    description: 'Free credit scores, reports & monitoring',
    url: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202',
    tag: 'Free',
    category: 'credit',
  },
  // Lower income focus
  {
    name: 'Goodbudget',
    description: 'Envelope budgeting made easy',
    url: 'https://goodbudget.com',
    tag: 'Free Plan',
    category: 'budgeting',
    maxIncome: 60000,
  },
  {
    name: 'EveryDollar',
    description: 'Zero-based budgeting app',
    url: 'https://www.everydollar.com',
    category: 'budgeting',
    maxIncome: 75000,
  },
  // Mid income ($40k-$100k)
  {
    name: 'SoFi',
    description: 'High-yield savings + no-fee banking',
    url: 'https://www.sofi.com/banking',
    tag: '4.00% APY',
    category: 'savings',
    minIncome: 40000,
  },
  {
    name: 'Marcus by Goldman Sachs',
    description: 'High-yield online savings',
    url: 'https://www.marcus.com',
    tag: 'Top Rate',
    category: 'savings',
    minIncome: 50000,
  },
  {
    name: 'LendingTree',
    description: 'Compare loan rates from multiple lenders',
    url: 'https://www.lendingtree.com',
    tag: 'Compare',
    category: 'loans',
    minIncome: 40000,
  },
  // Higher income ($75k+)
  {
    name: 'Betterment',
    description: 'Automated investing & retirement',
    url: 'https://www.betterment.com',
    tag: 'Robo-Advisor',
    category: 'investing',
    minIncome: 75000,
  },
  {
    name: 'Robinhood',
    description: 'Commission-free stock trading',
    url: 'https://join.robinhood.com',
    tag: 'Free Stock',
    category: 'investing',
    minIncome: 50000,
  },
  {
    name: 'Acorns',
    description: 'Invest spare change automatically',
    url: 'https://www.acorns.com',
    tag: 'Start Small',
    category: 'investing',
    minIncome: 35000,
  },
  // High income ($100k+)
  {
    name: 'Wealthfront',
    description: 'Automated wealth management',
    url: 'https://www.wealthfront.com',
    tag: 'Premium',
    category: 'investing',
    minIncome: 100000,
  },
  {
    name: 'Personal Capital',
    description: 'Free financial dashboard + advisors',
    url: 'https://www.personalcapital.com',
    tag: 'Free Tools',
    category: 'investing',
    minIncome: 100000,
  },
];

export function getAffiliatesForIncome(income: number): AffiliateRecommendation[] {
  return AFFORDABILITY_AFFILIATES.filter(affiliate => {
    const meetsMin = !affiliate.minIncome || income >= affiliate.minIncome;
    const meetsMax = !affiliate.maxIncome || income <= affiliate.maxIncome;
    return meetsMin && meetsMax;
  });
}

// SEO metadata helpers
export function getAffordabilityPageTitle(data: AffordabilityData): string {
  return `Budget on ${data.salaryFormatted} Salary 2026 | How to Spend ${data.slug.toUpperCase()} Income`;
}

export function getAffordabilityPageDescription(data: AffordabilityData): string {
  return `Complete budget breakdown for a ${data.salaryFormatted} salary. Take-home pay: ${formatSalaryDisplay(data.takeHomePay)}. Max rent: ${formatSalaryDisplay(data.maxRent * 12)}/year. 50/30/20 budget calculator included.`;
}
