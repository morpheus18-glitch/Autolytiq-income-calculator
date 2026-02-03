// Financial Health Quiz Data

export interface QuizQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    points: Record<PersonalityType, number>;
  }[];
}

export type PersonalityType = 'saver' | 'investor' | 'spender' | 'balanced' | 'builder';

export interface PersonalityResult {
  type: PersonalityType;
  title: string;
  emoji: string;
  description: string;
  strengths: string[];
  watchOuts: string[];
  tips: string[];
  recommendedTools: {
    name: string;
    description: string;
    url: string;
    category: string;
  }[];
  color: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'When you receive unexpected money (bonus, gift, tax refund), what do you typically do?',
    options: [
      { text: 'Save it all for emergencies', points: { saver: 3, investor: 1, spender: 0, balanced: 1, builder: 1 } },
      { text: 'Invest most of it', points: { saver: 1, investor: 3, spender: 0, balanced: 1, builder: 2 } },
      { text: 'Treat myself to something nice', points: { saver: 0, investor: 0, spender: 3, balanced: 1, builder: 0 } },
      { text: 'Split it between saving and spending', points: { saver: 1, investor: 1, spender: 1, balanced: 3, builder: 1 } },
    ],
  },
  {
    id: 'q2',
    question: 'How do you feel about checking your bank account balance?',
    options: [
      { text: 'I check it daily and track every expense', points: { saver: 3, investor: 1, spender: 0, balanced: 2, builder: 2 } },
      { text: 'I focus more on my investment accounts', points: { saver: 0, investor: 3, spender: 0, balanced: 1, builder: 2 } },
      { text: 'I prefer not to look too often', points: { saver: 0, investor: 0, spender: 3, balanced: 0, builder: 0 } },
      { text: 'I check weekly to stay on track', points: { saver: 1, investor: 1, spender: 1, balanced: 3, builder: 1 } },
    ],
  },
  {
    id: 'q3',
    question: 'What\'s your approach to budgeting?',
    options: [
      { text: 'I have a strict budget I follow religiously', points: { saver: 3, investor: 1, spender: 0, balanced: 2, builder: 2 } },
      { text: 'I prioritize investing before budgeting', points: { saver: 0, investor: 3, spender: 0, balanced: 1, builder: 2 } },
      { text: 'Budgets feel too restrictive for me', points: { saver: 0, investor: 0, spender: 3, balanced: 0, builder: 0 } },
      { text: 'I use the 50/30/20 rule or similar', points: { saver: 1, investor: 1, spender: 1, balanced: 3, builder: 2 } },
    ],
  },
  {
    id: 'q4',
    question: 'How would you describe your emergency fund?',
    options: [
      { text: '6+ months of expenses saved', points: { saver: 3, investor: 0, spender: 0, balanced: 2, builder: 1 } },
      { text: 'Enough, but I prefer to invest extra', points: { saver: 1, investor: 3, spender: 0, balanced: 1, builder: 2 } },
      { text: 'I\'m still working on building one', points: { saver: 0, investor: 0, spender: 2, balanced: 1, builder: 2 } },
      { text: '3-6 months, then the rest is invested', points: { saver: 1, investor: 2, spender: 0, balanced: 3, builder: 2 } },
    ],
  },
  {
    id: 'q5',
    question: 'When shopping, how do you decide on purchases?',
    options: [
      { text: 'I research extensively and wait for deals', points: { saver: 3, investor: 1, spender: 0, balanced: 1, builder: 1 } },
      { text: 'I consider the opportunity cost of not investing', points: { saver: 1, investor: 3, spender: 0, balanced: 1, builder: 2 } },
      { text: 'I buy what makes me happy now', points: { saver: 0, investor: 0, spender: 3, balanced: 1, builder: 0 } },
      { text: 'I have a \'wants\' budget for discretionary spending', points: { saver: 1, investor: 1, spender: 1, balanced: 3, builder: 1 } },
    ],
  },
  {
    id: 'q6',
    question: 'What best describes your financial goals?',
    options: [
      { text: 'Financial security and a large safety net', points: { saver: 3, investor: 0, spender: 0, balanced: 1, builder: 1 } },
      { text: 'Growing wealth and early retirement', points: { saver: 0, investor: 3, spender: 0, balanced: 1, builder: 3 } },
      { text: 'Enjoying life and experiences now', points: { saver: 0, investor: 0, spender: 3, balanced: 1, builder: 0 } },
      { text: 'Balance between present enjoyment and future security', points: { saver: 1, investor: 1, spender: 1, balanced: 3, builder: 1 } },
    ],
  },
  {
    id: 'q7',
    question: 'How do you feel about debt?',
    options: [
      { text: 'I avoid all debt, even mortgages', points: { saver: 3, investor: 0, spender: 0, balanced: 1, builder: 1 } },
      { text: 'Strategic debt can be a wealth-building tool', points: { saver: 0, investor: 3, spender: 1, balanced: 1, builder: 3 } },
      { text: 'I use credit cards regularly for rewards', points: { saver: 0, investor: 0, spender: 3, balanced: 1, builder: 0 } },
      { text: 'Only low-interest debt for major purchases', points: { saver: 1, investor: 1, spender: 1, balanced: 3, builder: 2 } },
    ],
  },
  {
    id: 'q8',
    question: 'What excites you most about money?',
    options: [
      { text: 'Watching my savings grow', points: { saver: 3, investor: 1, spender: 0, balanced: 1, builder: 1 } },
      { text: 'Seeing my investments compound', points: { saver: 1, investor: 3, spender: 0, balanced: 1, builder: 3 } },
      { text: 'The freedom to enjoy it', points: { saver: 0, investor: 0, spender: 3, balanced: 1, builder: 0 } },
      { text: 'Having enough for both now and later', points: { saver: 1, investor: 1, spender: 1, balanced: 3, builder: 1 } },
    ],
  },
  {
    id: 'q9',
    question: 'How do you handle financial stress?',
    options: [
      { text: 'I cut back on everything until I feel secure', points: { saver: 3, investor: 0, spender: 0, balanced: 1, builder: 1 } },
      { text: 'I focus on my long-term investment strategy', points: { saver: 1, investor: 3, spender: 0, balanced: 1, builder: 2 } },
      { text: 'Sometimes I stress-spend to feel better', points: { saver: 0, investor: 0, spender: 3, balanced: 0, builder: 0 } },
      { text: 'I review my budget and make adjustments', points: { saver: 1, investor: 1, spender: 0, balanced: 3, builder: 2 } },
    ],
  },
  {
    id: 'q10',
    question: 'Where do you see yourself financially in 10 years?',
    options: [
      { text: 'Debt-free with a large emergency fund', points: { saver: 3, investor: 0, spender: 0, balanced: 1, builder: 1 } },
      { text: 'Financially independent from investments', points: { saver: 0, investor: 3, spender: 0, balanced: 1, builder: 3 } },
      { text: 'Living my best life, whatever that looks like', points: { saver: 0, investor: 0, spender: 3, balanced: 1, builder: 0 } },
      { text: 'Comfortable balance of security and lifestyle', points: { saver: 1, investor: 1, spender: 1, balanced: 3, builder: 1 } },
    ],
  },
];

export const PERSONALITY_RESULTS: Record<PersonalityType, PersonalityResult> = {
  saver: {
    type: 'saver',
    title: 'The Saver',
    emoji: '🏦',
    description: 'You prioritize financial security above all else. Building a large safety net brings you peace of mind, and you\'re disciplined about spending.',
    strengths: [
      'Excellent at building emergency funds',
      'Highly disciplined with spending',
      'Low financial stress day-to-day',
      'Well-prepared for unexpected expenses',
    ],
    watchOuts: [
      'May miss investment growth opportunities',
      'Risk of keeping too much in low-yield accounts',
      'Could benefit from enjoying money more',
      'Inflation may erode cash savings over time',
    ],
    tips: [
      'Consider investing savings beyond 6 months expenses',
      'Look into high-yield savings accounts',
      'Set a small "fun money" budget guilt-free',
      'Explore index fund investing for long-term goals',
    ],
    recommendedTools: [
      { name: 'Marcus', description: 'High-yield savings account', url: 'https://www.marcus.com', category: 'savings' },
      { name: 'SoFi', description: 'High APY with direct deposit', url: 'https://www.sofi.com/banking', category: 'savings' },
      { name: 'YNAB', description: 'Budget tracking for savers', url: 'https://www.ynab.com', category: 'budgeting' },
    ],
    color: 'blue',
  },
  investor: {
    type: 'investor',
    title: 'The Investor',
    emoji: '📈',
    description: 'You see money as a tool for building wealth. You understand compound interest and prioritize long-term growth over short-term security.',
    strengths: [
      'Strong long-term wealth building mindset',
      'Understanding of compound growth',
      'Comfortable with calculated risks',
      'Likely to achieve financial independence',
    ],
    watchOuts: [
      'May neglect adequate emergency fund',
      'Risk of overexposure in downturns',
      'Could miss out on present enjoyment',
      'Might take on too much risk',
    ],
    tips: [
      'Maintain 3-6 months expenses in cash first',
      'Diversify across asset classes',
      'Consider tax-advantaged accounts (401k, IRA)',
      'Don\'t forget to enjoy some of your gains',
    ],
    recommendedTools: [
      { name: 'Fidelity', description: 'Full-service investing', url: 'https://www.fidelity.com', category: 'investing' },
      { name: 'Betterment', description: 'Automated investing', url: 'https://www.betterment.com', category: 'investing' },
      { name: 'Credit Karma', description: 'Track your credit', url: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202', category: 'credit' },
    ],
    color: 'emerald',
  },
  spender: {
    type: 'spender',
    title: 'The Spender',
    emoji: '🛍️',
    description: 'You believe money is meant to be enjoyed. You prioritize experiences and quality of life, living in the present rather than deferring happiness.',
    strengths: [
      'Enjoys life and creates memories',
      'Generous with friends and family',
      'Low anxiety about money',
      'Values experiences over accumulation',
    ],
    watchOuts: [
      'May lack emergency savings',
      'Risk of lifestyle inflation',
      'Could face financial stress unexpectedly',
      'Retirement planning might be neglected',
    ],
    tips: [
      'Set up automatic savings before you spend',
      'Build an emergency fund of 3 months expenses',
      'Use the 50/30/20 budget to balance spending',
      'Track spending to identify unnecessary expenses',
    ],
    recommendedTools: [
      { name: 'Credit Karma', description: 'Free credit monitoring', url: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202', category: 'credit' },
      { name: 'Acorns', description: 'Automatic round-up investing', url: 'https://www.acorns.com', category: 'investing' },
      { name: 'Mint', description: 'Track your spending', url: 'https://www.creditkarma.com', category: 'budgeting' },
    ],
    color: 'purple',
  },
  balanced: {
    type: 'balanced',
    title: 'The Balanced',
    emoji: '⚖️',
    description: 'You\'ve found equilibrium between saving for the future and enjoying the present. You budget thoughtfully and make intentional financial choices.',
    strengths: [
      'Sustainable financial approach',
      'Good at avoiding extremes',
      'Enjoys life while building wealth',
      'Rarely experiences financial guilt',
    ],
    watchOuts: [
      'May not maximize investment returns',
      'Could be too conservative in growth phase',
      'Might miss opportunities to optimize',
      'Could benefit from more aggressive saving early on',
    ],
    tips: [
      'Consider increasing investment allocation',
      'Review and optimize your budget quarterly',
      'Look for ways to increase income',
      'Consider automating more of your finances',
    ],
    recommendedTools: [
      { name: 'SoFi', description: 'All-in-one finances', url: 'https://www.sofi.com', category: 'banking' },
      { name: 'YNAB', description: 'Zero-based budgeting', url: 'https://www.ynab.com', category: 'budgeting' },
      { name: 'Betterment', description: 'Goal-based investing', url: 'https://www.betterment.com', category: 'investing' },
    ],
    color: 'yellow',
  },
  builder: {
    type: 'builder',
    title: 'The Builder',
    emoji: '🏗️',
    description: 'You\'re focused on creating financial freedom and building wealth systematically. You see money as a tool for creating the life you want.',
    strengths: [
      'Strong goal orientation',
      'Strategic financial thinking',
      'Comfortable with calculated risks',
      'High likelihood of financial success',
    ],
    watchOuts: [
      'May work too hard and burn out',
      'Could neglect present enjoyment',
      'Risk of overcomplicating finances',
      'Might take on too much leverage',
    ],
    tips: [
      'Schedule time to enjoy your progress',
      'Keep emergency fund separate from investments',
      'Diversify income streams',
      'Celebrate milestones along the way',
    ],
    recommendedTools: [
      { name: 'Robinhood', description: 'Commission-free trading', url: 'https://join.robinhood.com', category: 'investing' },
      { name: 'Credit Karma', description: 'Monitor your credit', url: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202', category: 'credit' },
      { name: 'LendingTree', description: 'Compare loan options', url: 'https://www.lendingtree.com', category: 'loans' },
    ],
    color: 'cyan',
  },
};

export function calculateResult(answers: Record<string, number>): PersonalityType {
  const scores: Record<PersonalityType, number> = {
    saver: 0,
    investor: 0,
    spender: 0,
    balanced: 0,
    builder: 0,
  };

  // Sum up scores from all answers
  QUIZ_QUESTIONS.forEach((question, index) => {
    const selectedOptionIndex = answers[question.id];
    if (selectedOptionIndex !== undefined) {
      const option = question.options[selectedOptionIndex];
      Object.entries(option.points).forEach(([type, points]) => {
        scores[type as PersonalityType] += points;
      });
    }
  });

  // Find the personality with highest score
  let maxScore = 0;
  let result: PersonalityType = 'balanced';

  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      result = type as PersonalityType;
    }
  });

  return result;
}
