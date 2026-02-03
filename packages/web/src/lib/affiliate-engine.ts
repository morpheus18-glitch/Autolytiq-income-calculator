// Contextual Affiliate Recommendation Engine
// Recommends different affiliates based on user context

export type UserContext = {
  income?: number;
  currentPage?: string;
  calculatorType?: 'income' | 'housing' | 'auto' | 'budget';
  hasCalculated?: boolean;
  pagesViewed?: string[];
};

export interface AffiliateRecommendation {
  id: string;
  name: string;
  description: string;
  url: string;
  tag?: string;
  category: 'credit' | 'savings' | 'investing' | 'loans' | 'insurance' | 'budgeting' | 'jobs';
  priority: number; // Higher = more relevant
}

// Base affiliate catalog
const AFFILIATE_CATALOG: Record<string, AffiliateRecommendation> = {
  'credit-karma': {
    id: 'credit-karma',
    name: 'Credit Karma',
    description: 'Free credit scores, reports & monitoring',
    url: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202',
    tag: 'Free',
    category: 'credit',
    priority: 10,
  },
  'sofi-banking': {
    id: 'sofi-banking',
    name: 'SoFi',
    description: 'High-yield savings up to 4.00% APY',
    url: 'https://www.sofi.com/banking',
    tag: '4.00% APY',
    category: 'savings',
    priority: 8,
  },
  'sofi-loans': {
    id: 'sofi-loans',
    name: 'SoFi Personal Loans',
    description: 'Low rates, no fees, unemployment protection',
    url: 'https://www.sofi.com/personal-loans',
    tag: 'No Fees',
    category: 'loans',
    priority: 7,
  },
  'lendingtree': {
    id: 'lendingtree',
    name: 'LendingTree',
    description: 'Compare mortgage rates from multiple lenders',
    url: 'https://www.lendingtree.com/home/mortgage/',
    tag: 'Compare',
    category: 'loans',
    priority: 7,
  },
  'lendingtree-auto': {
    id: 'lendingtree-auto',
    name: 'LendingTree Auto',
    description: 'Compare auto loan rates',
    url: 'https://www.lendingtree.com/auto',
    tag: 'Compare',
    category: 'loans',
    priority: 7,
  },
  'progressive': {
    id: 'progressive',
    name: 'Progressive',
    description: 'Compare auto insurance quotes',
    url: 'https://www.progressive.com',
    tag: 'Save',
    category: 'insurance',
    priority: 6,
  },
  'robinhood': {
    id: 'robinhood',
    name: 'Robinhood',
    description: 'Commission-free stock trading',
    url: 'https://join.robinhood.com',
    tag: 'Free Stock',
    category: 'investing',
    priority: 7,
  },
  'betterment': {
    id: 'betterment',
    name: 'Betterment',
    description: 'Automated investing & retirement',
    url: 'https://www.betterment.com',
    tag: 'Robo-Advisor',
    category: 'investing',
    priority: 7,
  },
  'acorns': {
    id: 'acorns',
    name: 'Acorns',
    description: 'Invest spare change automatically',
    url: 'https://www.acorns.com',
    tag: 'Auto-Invest',
    category: 'investing',
    priority: 6,
  },
  'ynab': {
    id: 'ynab',
    name: 'YNAB',
    description: 'Best-in-class budgeting app',
    url: 'https://www.ynab.com',
    tag: 'Top Pick',
    category: 'budgeting',
    priority: 8,
  },
  'indeed': {
    id: 'indeed',
    name: 'Indeed',
    description: 'Find higher-paying jobs',
    url: 'https://www.indeed.com',
    tag: 'Jobs',
    category: 'jobs',
    priority: 5,
  },
  'lemonade': {
    id: 'lemonade',
    name: 'Lemonade',
    description: 'Renters insurance from $5/mo',
    url: 'https://www.lemonade.com',
    tag: '$5/mo',
    category: 'insurance',
    priority: 6,
  },
  'marcus': {
    id: 'marcus',
    name: 'Marcus',
    description: 'High-yield savings by Goldman Sachs',
    url: 'https://www.marcus.com',
    tag: 'Goldman Sachs',
    category: 'savings',
    priority: 7,
  },
  'experian': {
    id: 'experian',
    name: 'Experian',
    description: 'Free FICO score and credit lock',
    url: 'https://www.experian.com/consumer-products/free-credit-report.html',
    tag: 'FICO',
    category: 'credit',
    priority: 7,
  },
};

// Income tier classification
function getIncomeTier(income: number): 'low' | 'mid' | 'high' | 'premium' {
  if (income < 40000) return 'low';
  if (income < 75000) return 'mid';
  if (income < 150000) return 'high';
  return 'premium';
}

// Get recommendations based on income level
function getIncomeBasedRecommendations(income: number): string[] {
  const tier = getIncomeTier(income);

  switch (tier) {
    case 'low':
      // Focus on credit building, budgeting, job search
      return ['credit-karma', 'acorns', 'ynab', 'indeed'];
    case 'mid':
      // Add savings, loans
      return ['credit-karma', 'sofi-banking', 'ynab', 'robinhood'];
    case 'high':
      // Add investing, more sophisticated products
      return ['sofi-banking', 'betterment', 'robinhood', 'credit-karma'];
    case 'premium':
      // Focus on wealth building, premium products
      return ['betterment', 'sofi-banking', 'marcus', 'credit-karma'];
    default:
      return ['credit-karma', 'sofi-banking'];
  }
}

// Get recommendations based on page/calculator type
function getPageBasedRecommendations(page: string): string[] {
  // Housing pages
  if (page.includes('housing') || page.includes('rent') || page.includes('mortgage')) {
    return ['lendingtree', 'credit-karma', 'lemonade', 'sofi-banking'];
  }

  // Auto pages
  if (page.includes('auto') || page.includes('car')) {
    return ['progressive', 'lendingtree-auto', 'credit-karma'];
  }

  // Budget/money pages
  if (page.includes('budget') || page.includes('smart-money') || page.includes('afford')) {
    return ['ynab', 'sofi-banking', 'credit-karma', 'acorns'];
  }

  // Salary/job pages
  if (page.includes('salary') || page.includes('job')) {
    return ['credit-karma', 'indeed', 'sofi-banking'];
  }

  // Investment pages
  if (page.includes('invest')) {
    return ['robinhood', 'betterment', 'acorns'];
  }

  // Default for calculator and other pages
  return ['credit-karma', 'sofi-banking', 'ynab'];
}

// Main recommendation function
export function getAffiliateRecommendations(
  context: UserContext,
  limit: number = 4
): AffiliateRecommendation[] {
  const scores: Record<string, number> = {};

  // Initialize all affiliates with base priority
  Object.values(AFFILIATE_CATALOG).forEach((affiliate) => {
    scores[affiliate.id] = affiliate.priority;
  });

  // Boost based on income
  if (context.income) {
    const incomeRecommendations = getIncomeBasedRecommendations(context.income);
    incomeRecommendations.forEach((id, index) => {
      if (scores[id] !== undefined) {
        scores[id] += 10 - index * 2; // First recommendation gets +10, second +8, etc.
      }
    });
  }

  // Boost based on current page
  if (context.currentPage) {
    const pageRecommendations = getPageBasedRecommendations(context.currentPage);
    pageRecommendations.forEach((id, index) => {
      if (scores[id] !== undefined) {
        scores[id] += 8 - index * 2;
      }
    });
  }

  // Boost based on calculator type
  if (context.calculatorType) {
    switch (context.calculatorType) {
      case 'housing':
        scores['lendingtree'] += 5;
        scores['lemonade'] += 3;
        break;
      case 'auto':
        scores['progressive'] += 5;
        scores['lendingtree-auto'] += 5;
        break;
      case 'budget':
        scores['ynab'] += 5;
        scores['sofi-banking'] += 3;
        break;
      case 'income':
      default:
        scores['credit-karma'] += 3;
        scores['sofi-banking'] += 3;
        break;
    }
  }

  // Sort by score and return top results
  const sortedAffiliates = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => AFFILIATE_CATALOG[id])
    .filter(Boolean);

  return sortedAffiliates;
}

// Get contextual exit intent affiliate
export function getExitIntentAffiliate(context: UserContext): AffiliateRecommendation {
  // Get top recommendation for context
  const recommendations = getAffiliateRecommendations(context, 1);
  return recommendations[0] || AFFILIATE_CATALOG['credit-karma'];
}

// Get affiliate by ID
export function getAffiliateById(id: string): AffiliateRecommendation | null {
  return AFFILIATE_CATALOG[id] || null;
}

// Get all affiliates in a category
export function getAffiliatesByCategory(
  category: AffiliateRecommendation['category']
): AffiliateRecommendation[] {
  return Object.values(AFFILIATE_CATALOG).filter(
    (affiliate) => affiliate.category === category
  );
}
