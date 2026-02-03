// VS Comparison data for head-to-head pages

export interface VersusComparison {
  slug: string;
  productA: {
    id: string;
    name: string;
    shortName?: string;
    affiliateUrl: string;
  };
  productB: {
    id: string;
    name: string;
    shortName?: string;
    affiliateUrl: string;
  };
  category: string;
  metaTitle: string;
  metaDescription: string;
  verdict: {
    winner: 'a' | 'b' | 'tie';
    summary: string;
    aWinsWhen: string[];
    bWinsWhen: string[];
  };
  comparisonPoints: {
    category: string;
    aValue: string;
    bValue: string;
    winner?: 'a' | 'b' | 'tie';
    explanation?: string;
  }[];
}

export const VERSUS_COMPARISONS: Record<string, VersusComparison> = {
  'ynab-vs-mint': {
    slug: 'ynab-vs-mint',
    productA: {
      id: 'ynab',
      name: 'YNAB (You Need A Budget)',
      shortName: 'YNAB',
      affiliateUrl: 'https://www.ynab.com',
    },
    productB: {
      id: 'mint',
      name: 'Mint (Credit Karma)',
      shortName: 'Mint',
      affiliateUrl: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202',
    },
    category: 'budgeting-apps',
    metaTitle: 'YNAB vs Mint 2026: Which Budgeting App is Better?',
    metaDescription: 'YNAB vs Mint comparison. We compare features, pricing, pros & cons to help you choose the best budgeting app for your needs in 2026.',
    verdict: {
      winner: 'a',
      summary: 'YNAB wins for serious budgeters willing to pay for a proven system. Mint wins for casual users who want free, comprehensive financial tracking.',
      aWinsWhen: [
        'You want to change your spending habits',
        'You\'re serious about getting out of debt',
        'You prefer proactive budgeting over tracking',
        'You want detailed goal tracking',
      ],
      bWinsWhen: [
        'You want a free solution',
        'You need credit monitoring included',
        'You prefer passive expense tracking',
        'You want a simple financial dashboard',
      ],
    },
    comparisonPoints: [
      {
        category: 'Pricing',
        aValue: '$14.99/mo or $99/year',
        bValue: 'Free',
        winner: 'b',
        explanation: 'Mint is completely free while YNAB requires a subscription.',
      },
      {
        category: 'Budgeting Method',
        aValue: 'Envelope/Zero-based',
        bValue: 'Traditional tracking',
        winner: 'a',
        explanation: 'YNAB\'s envelope method is more effective for behavior change.',
      },
      {
        category: 'Learning Curve',
        aValue: 'Steeper',
        bValue: 'Easy',
        winner: 'b',
        explanation: 'Mint is easier to get started with.',
      },
      {
        category: 'Goal Tracking',
        aValue: 'Excellent',
        bValue: 'Basic',
        winner: 'a',
        explanation: 'YNAB has superior goal-setting features.',
      },
      {
        category: 'Credit Monitoring',
        aValue: 'No',
        bValue: 'Yes (via Credit Karma)',
        winner: 'b',
        explanation: 'Mint includes free credit monitoring.',
      },
      {
        category: 'Bank Sync',
        aValue: 'Yes',
        bValue: 'Yes',
        winner: 'tie',
        explanation: 'Both offer automatic bank syncing.',
      },
      {
        category: 'Mobile App',
        aValue: 'Excellent',
        bValue: 'Good',
        winner: 'a',
        explanation: 'YNAB\'s app is more polished and feature-complete.',
      },
      {
        category: 'Customer Support',
        aValue: 'Excellent',
        bValue: 'Limited',
        winner: 'a',
        explanation: 'YNAB offers live support and free workshops.',
      },
    ],
  },

  'credit-karma-vs-experian': {
    slug: 'credit-karma-vs-experian',
    productA: {
      id: 'credit-karma',
      name: 'Credit Karma',
      affiliateUrl: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202',
    },
    productB: {
      id: 'experian',
      name: 'Experian',
      affiliateUrl: 'https://www.experian.com/consumer-products/free-credit-report.html',
    },
    category: 'credit-monitoring',
    metaTitle: 'Credit Karma vs Experian 2026: Best Free Credit Monitoring',
    metaDescription: 'Credit Karma vs Experian comparison. Compare free credit scores, monitoring features, and which service is better for your credit needs.',
    verdict: {
      winner: 'a',
      summary: 'Credit Karma wins for most users with its completely free, comprehensive features. Experian wins if you specifically need your FICO score or Experian Boost.',
      aWinsWhen: [
        'You want everything free',
        'You want two bureau scores',
        'You want tax filing included',
        'You prefer a comprehensive financial dashboard',
      ],
      bWinsWhen: [
        'You need your actual FICO score',
        'You want Experian Boost for thin credit',
        'You need 3-bureau monitoring (paid)',
        'You want credit lock features',
      ],
    },
    comparisonPoints: [
      {
        category: 'Base Price',
        aValue: 'Free',
        bValue: 'Free (basic)',
        winner: 'tie',
        explanation: 'Both offer free basic plans.',
      },
      {
        category: 'Score Type',
        aValue: 'VantageScore 3.0',
        bValue: 'FICO Score 8',
        winner: 'b',
        explanation: 'Most lenders use FICO scores.',
      },
      {
        category: 'Bureaus Covered',
        aValue: 'TransUnion + Equifax',
        bValue: 'Experian only (free)',
        winner: 'a',
        explanation: 'Credit Karma shows two bureaus for free.',
      },
      {
        category: 'Score Simulator',
        aValue: 'Yes',
        bValue: 'Yes',
        winner: 'tie',
        explanation: 'Both offer what-if simulators.',
      },
      {
        category: 'Credit Lock',
        aValue: 'No',
        bValue: 'Yes',
        winner: 'b',
        explanation: 'Experian offers free credit lock.',
      },
      {
        category: 'Experian Boost',
        aValue: 'No',
        bValue: 'Yes',
        winner: 'b',
        explanation: 'Only Experian offers Boost for thin credit files.',
      },
      {
        category: 'Additional Features',
        aValue: 'Tax filing, banking, loans',
        bValue: 'Identity protection (paid)',
        winner: 'a',
        explanation: 'Credit Karma includes more free features.',
      },
    ],
  },

  'sofi-vs-marcus': {
    slug: 'sofi-vs-marcus',
    productA: {
      id: 'sofi',
      name: 'SoFi',
      affiliateUrl: 'https://www.sofi.com/banking',
    },
    productB: {
      id: 'marcus',
      name: 'Marcus by Goldman Sachs',
      affiliateUrl: 'https://www.marcus.com',
    },
    category: 'high-yield-savings',
    metaTitle: 'SoFi vs Marcus 2026: Best High-Yield Savings Account',
    metaDescription: 'SoFi vs Marcus comparison. Compare APY rates, features, and which high-yield savings account is better for your money.',
    verdict: {
      winner: 'a',
      summary: 'SoFi wins for those who want an all-in-one banking platform with top rates. Marcus wins for simplicity and Goldman Sachs brand trust.',
      aWinsWhen: [
        'You want checking + savings together',
        'You have direct deposit (higher APY)',
        'You want early paycheck access',
        'You prefer an all-in-one platform',
      ],
      bWinsWhen: [
        'You want pure savings focus',
        'You prefer Goldman Sachs reputation',
        'You don\'t have direct deposit',
        'You want the simplest option',
      ],
    },
    comparisonPoints: [
      {
        category: 'APY',
        aValue: '4.00%+ (with DD)',
        bValue: '4.00%+',
        winner: 'tie',
        explanation: 'Both offer competitive top-tier rates.',
      },
      {
        category: 'Minimum Deposit',
        aValue: '$0',
        bValue: '$0',
        winner: 'tie',
        explanation: 'No minimums for either.',
      },
      {
        category: 'Checking Account',
        aValue: 'Yes',
        bValue: 'No',
        winner: 'a',
        explanation: 'SoFi offers integrated checking.',
      },
      {
        category: 'ATM Access',
        aValue: '55,000+ ATMs',
        bValue: 'None',
        winner: 'a',
        explanation: 'SoFi provides ATM access.',
      },
      {
        category: 'Sub-accounts',
        aValue: 'Vaults',
        bValue: 'No',
        winner: 'a',
        explanation: 'SoFi Vaults help organize savings goals.',
      },
      {
        category: 'Early Paycheck',
        aValue: 'Up to 2 days early',
        bValue: 'No',
        winner: 'a',
        explanation: 'SoFi offers early direct deposit.',
      },
      {
        category: 'Brand Trust',
        aValue: 'Newer fintech',
        bValue: 'Goldman Sachs',
        winner: 'b',
        explanation: 'Marcus backed by 150+ year institution.',
      },
    ],
  },

  'robinhood-vs-acorns': {
    slug: 'robinhood-vs-acorns',
    productA: {
      id: 'robinhood',
      name: 'Robinhood',
      affiliateUrl: 'https://join.robinhood.com',
    },
    productB: {
      id: 'acorns',
      name: 'Acorns',
      affiliateUrl: 'https://www.acorns.com',
    },
    category: 'investment-apps',
    metaTitle: 'Robinhood vs Acorns 2026: Best Investment App for Beginners',
    metaDescription: 'Robinhood vs Acorns comparison. Compare features, fees, and which investment app is better for beginners and casual investors.',
    verdict: {
      winner: 'tie',
      summary: 'Robinhood wins for active traders who want control. Acorns wins for passive investors who want automated investing without thinking.',
      aWinsWhen: [
        'You want to pick your own stocks',
        'You want crypto trading',
        'You prefer no monthly fees',
        'You\'re comfortable making decisions',
      ],
      bWinsWhen: [
        'You want totally hands-off investing',
        'You struggle to save money',
        'You prefer automatic round-ups',
        'You want a set-it-and-forget-it approach',
      ],
    },
    comparisonPoints: [
      {
        category: 'Pricing',
        aValue: 'Free (Gold: $5/mo)',
        bValue: '$3-$5/month',
        winner: 'a',
        explanation: 'Robinhood is free for basic trading.',
      },
      {
        category: 'Investment Style',
        aValue: 'Self-directed',
        bValue: 'Automated',
        winner: 'tie',
        explanation: 'Different styles for different preferences.',
      },
      {
        category: 'Stock Selection',
        aValue: 'Full market access',
        bValue: 'Pre-built portfolios only',
        winner: 'a',
        explanation: 'Robinhood offers more investment choices.',
      },
      {
        category: 'Round-ups',
        aValue: 'No',
        bValue: 'Yes',
        winner: 'b',
        explanation: 'Acorns\' signature feature for passive saving.',
      },
      {
        category: 'Crypto',
        aValue: 'Yes',
        bValue: 'No',
        winner: 'a',
        explanation: 'Only Robinhood offers crypto trading.',
      },
      {
        category: 'Retirement Accounts',
        aValue: 'IRA only',
        bValue: 'IRA + 401k-like',
        winner: 'b',
        explanation: 'Acorns offers more retirement options.',
      },
      {
        category: 'Best For',
        aValue: 'Active traders',
        bValue: 'Passive savers',
        winner: 'tie',
        explanation: 'Depends on your investing style.',
      },
    ],
  },
};

export function getVersusComparison(slug: string): VersusComparison | null {
  return VERSUS_COMPARISONS[slug] || null;
}

export function getAllVersusSlugs(): string[] {
  return Object.keys(VERSUS_COMPARISONS);
}

export function getRelatedComparisons(currentSlug: string): VersusComparison[] {
  return Object.values(VERSUS_COMPARISONS)
    .filter((c) => c.slug !== currentSlug)
    .slice(0, 3);
}
