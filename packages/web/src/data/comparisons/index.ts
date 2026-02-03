// Comparison data for best-of and versus pages

export interface Product {
  id: string;
  name: string;
  logo?: string;
  rating: number; // 1-5 stars
  description: string;
  website: string;
  affiliateUrl: string;
  pricing: {
    model: 'free' | 'freemium' | 'paid' | 'subscription';
    price?: string;
    freeTrialDays?: number;
  };
  pros: string[];
  cons: string[];
  bestFor: string[];
  features: Record<string, boolean | string>;
  incomeRange?: {
    min?: number;
    max?: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  products: Product[];
  comparisonFeatures: string[];
  winner: string; // product id
  runnerUp: string; // product id
}

// Budgeting Apps Category
export const BUDGETING_APPS: Category = {
  id: 'budgeting-apps',
  name: 'Best Budgeting Apps',
  slug: 'budgeting-apps',
  description: 'Compare the top budgeting apps to help you track spending, save money, and reach your financial goals.',
  metaTitle: 'Best Budgeting Apps 2026 | Top Budget Tracker Comparison',
  metaDescription: 'Compare the best budgeting apps of 2026. YNAB vs Mint vs EveryDollar vs Goodbudget - features, pricing, and which is best for your needs.',
  winner: 'ynab',
  runnerUp: 'mint',
  comparisonFeatures: ['Bank Sync', 'Goal Tracking', 'Reports', 'Mobile App', 'Shared Budgets', 'Investment Tracking'],
  products: [
    {
      id: 'ynab',
      name: 'YNAB',
      rating: 4.8,
      description: 'You Need A Budget uses the envelope method with powerful goal tracking. Best for people serious about changing their spending habits.',
      website: 'https://www.ynab.com',
      affiliateUrl: 'https://www.ynab.com',
      pricing: { model: 'subscription', price: '$14.99/mo or $99/year', freeTrialDays: 34 },
      pros: ['Proven envelope budgeting method', 'Excellent goal tracking', 'Great educational content', 'Real-time bank sync'],
      cons: ['Steeper learning curve', 'No free tier', 'More expensive than alternatives'],
      bestFor: ['Serious budgeters', 'People in debt', 'Those wanting behavior change'],
      features: { 'Bank Sync': true, 'Goal Tracking': true, 'Reports': true, 'Mobile App': true, 'Shared Budgets': true, 'Investment Tracking': false },
    },
    {
      id: 'mint',
      name: 'Mint (Credit Karma)',
      rating: 4.3,
      description: 'Free comprehensive financial dashboard now integrated with Credit Karma. Great for beginners wanting an overview of their finances.',
      website: 'https://www.creditkarma.com',
      affiliateUrl: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202',
      pricing: { model: 'free' },
      pros: ['Completely free', 'Easy setup', 'Credit monitoring included', 'Bill tracking'],
      cons: ['Ads and product recommendations', 'Less powerful budgeting', 'Mint brand being phased out'],
      bestFor: ['Beginners', 'Those wanting free tools', 'People who want credit monitoring'],
      features: { 'Bank Sync': true, 'Goal Tracking': true, 'Reports': true, 'Mobile App': true, 'Shared Budgets': false, 'Investment Tracking': true },
    },
    {
      id: 'everydollar',
      name: 'EveryDollar',
      rating: 4.2,
      description: 'Dave Ramsey\'s budgeting app focused on zero-based budgeting. Simple interface great for beginners following the Baby Steps.',
      website: 'https://www.everydollar.com',
      affiliateUrl: 'https://www.everydollar.com',
      pricing: { model: 'freemium', price: '$17.99/mo for premium', freeTrialDays: 14 },
      pros: ['Simple zero-based budgeting', 'Clean interface', 'Integrates with Ramsey+', 'Free version available'],
      cons: ['Bank sync requires premium', 'Limited features in free tier', 'No investment tracking'],
      bestFor: ['Dave Ramsey fans', 'Beginners', 'Zero-based budget fans'],
      features: { 'Bank Sync': 'Premium only', 'Goal Tracking': true, 'Reports': 'Premium only', 'Mobile App': true, 'Shared Budgets': true, 'Investment Tracking': false },
    },
    {
      id: 'goodbudget',
      name: 'Goodbudget',
      rating: 4.0,
      description: 'Digital envelope budgeting app that works offline. Perfect for couples who want to share a budget without bank connections.',
      website: 'https://www.goodbudget.com',
      affiliateUrl: 'https://www.goodbudget.com',
      pricing: { model: 'freemium', price: '$8/mo or $70/year for Plus' },
      pros: ['Simple envelope system', 'Works offline', 'Great for couples', 'No bank connection required'],
      cons: ['Manual transaction entry', 'Limited envelopes on free', 'Basic reporting'],
      bestFor: ['Couples', 'Cash-based budgeters', 'Privacy-conscious users'],
      features: { 'Bank Sync': false, 'Goal Tracking': true, 'Reports': 'Plus only', 'Mobile App': true, 'Shared Budgets': true, 'Investment Tracking': false },
    },
  ],
};

// Credit Monitoring Category
export const CREDIT_MONITORING: Category = {
  id: 'credit-monitoring',
  name: 'Best Credit Monitoring Services',
  slug: 'credit-monitoring',
  description: 'Compare free and paid credit monitoring services to protect your identity and improve your credit score.',
  metaTitle: 'Best Credit Monitoring Services 2026 | Free Credit Score Apps',
  metaDescription: 'Compare best credit monitoring services. Credit Karma vs Experian vs Credit Sesame - get free credit scores, reports, and identity protection.',
  winner: 'credit-karma',
  runnerUp: 'experian',
  comparisonFeatures: ['Free Credit Score', 'Credit Report', 'Score Simulator', 'Identity Monitoring', 'Dark Web Scan', 'Credit Lock'],
  products: [
    {
      id: 'credit-karma',
      name: 'Credit Karma',
      rating: 4.7,
      description: 'Free credit scores, reports, and monitoring from TransUnion and Equifax. Also offers banking, tax filing, and personalized recommendations.',
      website: 'https://www.creditkarma.com',
      affiliateUrl: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202',
      pricing: { model: 'free' },
      pros: ['Completely free', 'Two bureau scores', 'Credit simulator', 'Tax filing included', 'Banking products'],
      cons: ['Ad-supported', 'Not FICO scores', 'No Experian data'],
      bestFor: ['Everyone', 'Free credit monitoring', 'Tax filers'],
      features: { 'Free Credit Score': true, 'Credit Report': true, 'Score Simulator': true, 'Identity Monitoring': true, 'Dark Web Scan': true, 'Credit Lock': false },
    },
    {
      id: 'experian',
      name: 'Experian',
      rating: 4.5,
      description: 'Get your free FICO score and Experian credit report. Premium plans offer 3-bureau monitoring and identity protection.',
      website: 'https://www.experian.com',
      affiliateUrl: 'https://www.experian.com/consumer-products/free-credit-report.html',
      pricing: { model: 'freemium', price: '$24.99/mo for premium' },
      pros: ['Free FICO score', 'Experian report access', 'Credit lock feature', 'Boost feature for thin files'],
      cons: ['Only one bureau free', 'Premium is expensive', 'Upselling'],
      bestFor: ['FICO score seekers', 'Thin credit files', 'Identity protection'],
      features: { 'Free Credit Score': true, 'Credit Report': true, 'Score Simulator': true, 'Identity Monitoring': 'Premium', 'Dark Web Scan': 'Premium', 'Credit Lock': true },
    },
    {
      id: 'credit-sesame',
      name: 'Credit Sesame',
      rating: 4.1,
      description: 'Free credit monitoring with a focus on credit improvement recommendations. Offers $50k identity theft insurance.',
      website: 'https://www.creditsesame.com',
      affiliateUrl: 'https://www.creditsesame.com',
      pricing: { model: 'freemium', price: '$19.95/mo for premium' },
      pros: ['Free TransUnion score', '$50k identity insurance', 'Credit improvement tips', 'Debt analysis'],
      cons: ['Only one bureau', 'VantageScore (not FICO)', 'Lots of product offers'],
      bestFor: ['Credit builders', 'Debt management', 'Basic monitoring'],
      features: { 'Free Credit Score': true, 'Credit Report': false, 'Score Simulator': true, 'Identity Monitoring': 'Premium', 'Dark Web Scan': 'Premium', 'Credit Lock': false },
    },
  ],
};

// High-Yield Savings Category
export const HIGH_YIELD_SAVINGS: Category = {
  id: 'high-yield-savings',
  name: 'Best High-Yield Savings Accounts',
  slug: 'high-yield-savings',
  description: 'Compare the best high-yield savings accounts to earn more on your emergency fund and savings goals.',
  metaTitle: 'Best High-Yield Savings Accounts 2026 | Top APY Rates',
  metaDescription: 'Compare best high-yield savings accounts with top APY rates. SoFi vs Marcus vs Ally vs Discover - maximize your savings interest.',
  winner: 'sofi',
  runnerUp: 'marcus',
  comparisonFeatures: ['APY Rate', 'Min Deposit', 'FDIC Insured', 'ATM Access', 'Mobile App', 'Sub-accounts'],
  products: [
    {
      id: 'sofi',
      name: 'SoFi',
      rating: 4.8,
      description: 'High-yield checking and savings with no fees. Get bonus APY with direct deposit. Full-service banking platform.',
      website: 'https://www.sofi.com',
      affiliateUrl: 'https://www.sofi.com/banking',
      pricing: { model: 'free' },
      pros: ['Top APY rates', 'No account fees', 'Checking + savings combo', 'Early paycheck access'],
      cons: ['Higher APY requires direct deposit', 'Newer bank brand', 'Limited branch access'],
      bestFor: ['High earners', 'Direct deposit users', 'All-in-one banking'],
      features: { 'APY Rate': '4.00%+', 'Min Deposit': '$0', 'FDIC Insured': true, 'ATM Access': '55,000+ ATMs', 'Mobile App': true, 'Sub-accounts': 'Vaults' },
      incomeRange: { min: 40000 },
    },
    {
      id: 'marcus',
      name: 'Marcus by Goldman Sachs',
      rating: 4.6,
      description: 'Goldman Sachs\' consumer bank offering competitive savings rates with no fees and no minimum deposit.',
      website: 'https://www.marcus.com',
      affiliateUrl: 'https://www.marcus.com',
      pricing: { model: 'free' },
      pros: ['Competitive APY', 'Goldman Sachs backing', 'No fees', 'Easy to use app'],
      cons: ['Savings only (no checking)', 'No ATM card', 'Limited account options'],
      bestFor: ['Savers', 'Emergency fund builders', 'Simplicity seekers'],
      features: { 'APY Rate': '4.00%+', 'Min Deposit': '$0', 'FDIC Insured': true, 'ATM Access': false, 'Mobile App': true, 'Sub-accounts': false },
      incomeRange: { min: 50000 },
    },
    {
      id: 'ally',
      name: 'Ally Bank',
      rating: 4.5,
      description: 'Full-service online bank with competitive savings rates, checking, and investment options. Great all-around choice.',
      website: 'https://www.ally.com',
      affiliateUrl: 'https://www.ally.com',
      pricing: { model: 'free' },
      pros: ['Full banking suite', 'Buckets for savings goals', 'ATM fee rebates', 'Excellent customer service'],
      cons: ['No cash deposits', 'Rates slightly lower', 'Online only'],
      bestFor: ['Full-service banking', 'Savings goal setters', 'Online banking fans'],
      features: { 'APY Rate': '3.85%+', 'Min Deposit': '$0', 'FDIC Insured': true, 'ATM Access': 'Allpoint ATMs', 'Mobile App': true, 'Sub-accounts': 'Buckets' },
    },
    {
      id: 'discover',
      name: 'Discover Bank',
      rating: 4.4,
      description: 'Trusted name in finance offering high-yield savings with cashback debit and excellent customer service.',
      website: 'https://www.discover.com/online-banking',
      affiliateUrl: 'https://www.discover.com/online-banking',
      pricing: { model: 'free' },
      pros: ['Trusted brand', 'Cashback debit card', 'No fees', '24/7 US support'],
      cons: ['Checking requires separate app', 'No cash deposits', 'APY slightly lower'],
      bestFor: ['Discover card holders', 'Customer service priority', 'Cashback seekers'],
      features: { 'APY Rate': '3.75%+', 'Min Deposit': '$0', 'FDIC Insured': true, 'ATM Access': '60,000+ ATMs', 'Mobile App': true, 'Sub-accounts': false },
    },
  ],
};

// Auto Loans Category
export const AUTO_LOANS: Category = {
  id: 'auto-loans',
  name: 'Best Auto Loans',
  slug: 'auto-loans',
  description: 'Compare auto loan rates from banks, credit unions, and online lenders to get the best deal on your car purchase.',
  metaTitle: 'Best Auto Loans 2026 | Compare Car Loan Rates',
  metaDescription: 'Compare best auto loan rates and lenders. LendingTree vs Capital One vs local credit unions - find the lowest rate for new and used cars.',
  winner: 'lendingtree',
  runnerUp: 'capital-one',
  comparisonFeatures: ['Rate Comparison', 'Pre-Qualification', 'Refinancing', 'Used Car Loans', 'Bad Credit Options', 'Mobile App'],
  products: [
    {
      id: 'lendingtree',
      name: 'LendingTree',
      rating: 4.6,
      description: 'Compare auto loan offers from multiple lenders with one application. Great for rate shopping without hurting your credit.',
      website: 'https://www.lendingtree.com',
      affiliateUrl: 'https://www.lendingtree.com/auto',
      pricing: { model: 'free' },
      pros: ['Multiple offers at once', 'Soft credit pull', 'Wide lender network', 'New and used loans'],
      cons: ['Not a direct lender', 'May get marketing calls', 'Offers vary by credit'],
      bestFor: ['Rate shoppers', 'Comparison seekers', 'All credit types'],
      features: { 'Rate Comparison': true, 'Pre-Qualification': true, 'Refinancing': true, 'Used Car Loans': true, 'Bad Credit Options': true, 'Mobile App': true },
    },
    {
      id: 'capital-one',
      name: 'Capital One Auto',
      rating: 4.4,
      description: 'Pre-qualify for auto financing and shop for cars on their platform. Dealer network makes the buying process easier.',
      website: 'https://www.capitalone.com/cars',
      affiliateUrl: 'https://www.capitalone.com/cars',
      pricing: { model: 'free' },
      pros: ['Pre-qualification tool', 'Car shopping platform', 'No dealer markup', 'Transparent pricing'],
      cons: ['Limited dealer network', 'Rates may not be lowest', 'Best for good credit'],
      bestFor: ['Capital One customers', 'Car shoppers', 'Good credit borrowers'],
      features: { 'Rate Comparison': false, 'Pre-Qualification': true, 'Refinancing': true, 'Used Car Loans': true, 'Bad Credit Options': 'Limited', 'Mobile App': true },
    },
    {
      id: 'myautoloan',
      name: 'myAutoloan',
      rating: 4.2,
      description: 'Auto loan marketplace connecting you with lenders for new, used, refinance, and lease buyout loans.',
      website: 'https://www.myautoloan.com',
      affiliateUrl: 'https://www.myautoloan.com',
      pricing: { model: 'free' },
      pros: ['Multiple lender offers', 'All loan types', 'Accepts lower credit', 'Fast decisions'],
      cons: ['Not a direct lender', 'Marketing communications', 'Rates vary widely'],
      bestFor: ['All credit types', 'Refinancing', 'Lease buyouts'],
      features: { 'Rate Comparison': true, 'Pre-Qualification': true, 'Refinancing': true, 'Used Car Loans': true, 'Bad Credit Options': true, 'Mobile App': false },
    },
  ],
};

// Personal Loans Category
export const PERSONAL_LOANS: Category = {
  id: 'personal-loans',
  name: 'Best Personal Loans',
  slug: 'personal-loans',
  description: 'Compare personal loan rates for debt consolidation, home improvement, or major purchases.',
  metaTitle: 'Best Personal Loans 2026 | Compare Rates & Lenders',
  metaDescription: 'Compare best personal loan rates and lenders. SoFi vs LendingTree vs Prosper - find low rates for debt consolidation and more.',
  winner: 'sofi-loans',
  runnerUp: 'lendingtree-personal',
  comparisonFeatures: ['APR Range', 'Loan Amounts', 'Funding Speed', 'No Origination Fee', 'Unemployment Protection', 'Mobile App'],
  products: [
    {
      id: 'sofi-loans',
      name: 'SoFi Personal Loans',
      rating: 4.7,
      description: 'Low rates for qualified borrowers with no fees. Includes unemployment protection and member benefits.',
      website: 'https://www.sofi.com',
      affiliateUrl: 'https://www.sofi.com/personal-loans',
      pricing: { model: 'free' },
      pros: ['No origination fees', 'Unemployment protection', 'Low rates for good credit', 'Same-day funding possible'],
      cons: ['Requires good credit', 'No co-signers', 'Income requirements'],
      bestFor: ['Good credit borrowers', 'Debt consolidation', 'High earners'],
      features: { 'APR Range': '8.99%-25.81%', 'Loan Amounts': '$5K-$100K', 'Funding Speed': 'Same day', 'No Origination Fee': true, 'Unemployment Protection': true, 'Mobile App': true },
      incomeRange: { min: 45000 },
    },
    {
      id: 'lendingtree-personal',
      name: 'LendingTree',
      rating: 4.5,
      description: 'Compare personal loan offers from multiple lenders. Great for finding the best rate for your credit profile.',
      website: 'https://www.lendingtree.com',
      affiliateUrl: 'https://www.lendingtree.com/personal',
      pricing: { model: 'free' },
      pros: ['Compare multiple offers', 'All credit types', 'Soft credit pull', 'Wide lender network'],
      cons: ['Not a direct lender', 'May receive marketing', 'Rates vary by lender'],
      bestFor: ['Rate shoppers', 'All credit types', 'Comparison shopping'],
      features: { 'APR Range': '5.99%-35.99%', 'Loan Amounts': '$1K-$50K', 'Funding Speed': '1-7 days', 'No Origination Fee': 'Varies', 'Unemployment Protection': 'Varies', 'Mobile App': true },
    },
    {
      id: 'prosper',
      name: 'Prosper',
      rating: 4.2,
      description: 'Peer-to-peer lending platform offering personal loans for debt consolidation and major expenses.',
      website: 'https://www.prosper.com',
      affiliateUrl: 'https://www.prosper.com',
      pricing: { model: 'free' },
      pros: ['Fixed rates', 'No prepayment penalty', 'Joint applications', 'Accepts fair credit'],
      cons: ['Origination fees (1-9.99%)', 'Slower funding', 'Higher rates for fair credit'],
      bestFor: ['Fair credit borrowers', 'Joint applicants', 'Debt consolidation'],
      features: { 'APR Range': '8.99%-35.99%', 'Loan Amounts': '$2K-$50K', 'Funding Speed': '3-5 days', 'No Origination Fee': false, 'Unemployment Protection': false, 'Mobile App': true },
    },
  ],
};

// Investment Apps Category
export const INVESTMENT_APPS: Category = {
  id: 'investment-apps',
  name: 'Best Investment Apps',
  slug: 'investment-apps',
  description: 'Compare the best investment apps for beginners and experienced investors. Start investing with any budget.',
  metaTitle: 'Best Investment Apps 2026 | Top Stock & Robo-Advisor Apps',
  metaDescription: 'Compare best investment apps. Robinhood vs Acorns vs Betterment vs Fidelity - commission-free trading and robo-advisors compared.',
  winner: 'fidelity',
  runnerUp: 'robinhood',
  comparisonFeatures: ['Commission-Free', 'Fractional Shares', 'Robo-Advisor', 'Retirement Accounts', 'Research Tools', 'Mobile App'],
  products: [
    {
      id: 'fidelity',
      name: 'Fidelity',
      rating: 4.9,
      description: 'Full-service brokerage with commission-free trading, excellent research, and retirement accounts. Best overall choice.',
      website: 'https://www.fidelity.com',
      affiliateUrl: 'https://www.fidelity.com',
      pricing: { model: 'free' },
      pros: ['Commission-free stocks & ETFs', 'Excellent research', 'Retirement accounts', 'Fractional shares', 'No account minimums'],
      cons: ['Interface can be overwhelming', 'Mutual fund fees for non-Fidelity', 'Learning curve'],
      bestFor: ['Long-term investors', 'Retirement savers', 'Research-focused traders'],
      features: { 'Commission-Free': true, 'Fractional Shares': true, 'Robo-Advisor': 'Fidelity Go', 'Retirement Accounts': true, 'Research Tools': 'Excellent', 'Mobile App': true },
      incomeRange: { min: 50000 },
    },
    {
      id: 'robinhood',
      name: 'Robinhood',
      rating: 4.3,
      description: 'Pioneer of commission-free trading with a simple mobile app. Great for beginners wanting to start investing.',
      website: 'https://robinhood.com',
      affiliateUrl: 'https://join.robinhood.com',
      pricing: { model: 'freemium', price: '$5/mo for Gold' },
      pros: ['Commission-free trading', 'Crypto trading', 'Easy to use', 'Free stock for signing up', 'Cash card'],
      cons: ['Limited research', 'No retirement accounts', 'Gamified interface'],
      bestFor: ['Beginners', 'Mobile traders', 'Crypto curious'],
      features: { 'Commission-Free': true, 'Fractional Shares': true, 'Robo-Advisor': false, 'Retirement Accounts': 'IRA only', 'Research Tools': 'Basic', 'Mobile App': true },
    },
    {
      id: 'acorns',
      name: 'Acorns',
      rating: 4.1,
      description: 'Micro-investing app that rounds up purchases and invests the spare change. Perfect for hands-off beginners.',
      website: 'https://www.acorns.com',
      affiliateUrl: 'https://www.acorns.com',
      pricing: { model: 'subscription', price: '$3-$5/mo' },
      pros: ['Automatic round-ups', 'Set and forget', 'Educational content', 'Banking included'],
      cons: ['Monthly fees add up', 'Limited investment choices', 'High fees for small balances'],
      bestFor: ['Hands-off investors', 'Spare change savers', 'Beginners'],
      features: { 'Commission-Free': true, 'Fractional Shares': true, 'Robo-Advisor': true, 'Retirement Accounts': true, 'Research Tools': 'Basic', 'Mobile App': true },
      incomeRange: { max: 75000 },
    },
    {
      id: 'betterment',
      name: 'Betterment',
      rating: 4.4,
      description: 'Leading robo-advisor with automated portfolio management, tax-loss harvesting, and retirement planning.',
      website: 'https://www.betterment.com',
      affiliateUrl: 'https://www.betterment.com',
      pricing: { model: 'subscription', price: '0.25% annual fee' },
      pros: ['Automated investing', 'Tax-loss harvesting', 'Goal-based planning', 'Low fees'],
      cons: ['No individual stocks', 'Premium requires $100k', 'Less control'],
      bestFor: ['Hands-off investors', 'Retirement savers', 'Tax-conscious investors'],
      features: { 'Commission-Free': true, 'Fractional Shares': true, 'Robo-Advisor': true, 'Retirement Accounts': true, 'Research Tools': 'Goal-based', 'Mobile App': true },
      incomeRange: { min: 75000 },
    },
  ],
};

// All categories for easy access
export const ALL_CATEGORIES: Record<string, Category> = {
  'budgeting-apps': BUDGETING_APPS,
  'credit-monitoring': CREDIT_MONITORING,
  'high-yield-savings': HIGH_YIELD_SAVINGS,
  'auto-loans': AUTO_LOANS,
  'personal-loans': PERSONAL_LOANS,
  'investment-apps': INVESTMENT_APPS,
};

export function getCategoryBySlug(slug: string): Category | null {
  return ALL_CATEGORIES[slug] || null;
}

export function getAllCategorySlugs(): string[] {
  return Object.keys(ALL_CATEGORIES);
}

export function getProductById(categorySlug: string, productId: string): Product | null {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;
  return category.products.find(p => p.id === productId) || null;
}
