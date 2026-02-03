// Calculator variant data for programmatic SEO pages

export interface CalculatorVariant {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heading: string;
  subheading: string;
  description: string;
  features: string[];
  faqs: { question: string; answer: string }[];
  calculatorConfig: {
    defaultPayType?: 'hourly' | 'salary';
    defaultTaxType?: 'w2' | '1099';
    showField?: string;
    focusField?: string;
  };
  relatedPages: { title: string; url: string; description: string }[];
}

export const CALCULATOR_VARIANTS: Record<string, CalculatorVariant> = {
  'hourly': {
    slug: 'hourly',
    title: 'Hourly to Salary Calculator',
    metaTitle: 'Hourly to Salary Calculator 2026 | Convert Hourly Wage to Annual Salary',
    metaDescription: 'Free hourly to salary calculator. Convert your hourly wage to annual salary instantly. See your monthly, weekly, and yearly pay breakdown with tax estimates.',
    heading: 'Hourly to Salary Calculator',
    subheading: 'Convert your hourly wage to annual salary in seconds',
    description: 'Use our free hourly to salary calculator to convert your hourly pay rate to annual salary. See exactly what your hourly wage equals as a yearly, monthly, and weekly salary—plus estimated take-home pay after taxes.',
    features: [
      'Instant hourly to annual salary conversion',
      'Weekly, bi-weekly, and monthly breakdowns',
      'Federal and state tax estimates included',
      'Compare full-time vs part-time scenarios',
      'Account for overtime and extra hours',
    ],
    faqs: [
      {
        question: 'How do I convert hourly wage to salary?',
        answer: 'Multiply your hourly wage by the number of hours you work per week, then multiply by 52 weeks. For example, $20/hour × 40 hours × 52 weeks = $41,600 annual salary.',
      },
      {
        question: 'What is a good hourly wage?',
        answer: 'In 2026, a "good" hourly wage depends on your location and industry. Nationally, $25-35/hour ($52,000-$72,800 annually) is considered solid middle-class income. In high cost-of-living areas, $40+/hour may be needed.',
      },
      {
        question: 'How much is $20 an hour annually?',
        answer: '$20 per hour equals $41,600 per year for a full-time employee working 40 hours per week, 52 weeks per year. After taxes, expect roughly $33,000-$35,000 take-home pay.',
      },
      {
        question: 'Does this calculator include overtime?',
        answer: 'Yes! You can enter your regular hours and overtime hours separately. Overtime is typically calculated at 1.5x your regular hourly rate for hours over 40 per week.',
      },
    ],
    calculatorConfig: {
      defaultPayType: 'hourly',
      focusField: 'hourlyRate',
    },
    relatedPages: [
      { title: 'Salary to Hourly Calculator', url: '/income-calculator/salary-to-hourly', description: 'Convert annual salary to hourly wage' },
      { title: 'Overtime Calculator', url: '/income-calculator/overtime', description: 'Calculate overtime pay' },
      { title: 'Income Calculator', url: '/calculator', description: 'Full income breakdown with all deductions' },
    ],
  },

  'salary-to-hourly': {
    slug: 'salary-to-hourly',
    title: 'Salary to Hourly Calculator',
    metaTitle: 'Salary to Hourly Calculator 2026 | Convert Annual Salary to Hourly Wage',
    metaDescription: 'Free salary to hourly calculator. Convert your annual salary to hourly wage instantly. Find out what your salary equals per hour, day, week, and month.',
    heading: 'Salary to Hourly Calculator',
    subheading: 'Find out what your salary equals per hour',
    description: 'Convert your annual salary to an hourly wage with our free calculator. Perfect for comparing job offers, negotiating raises, or understanding your true hourly value.',
    features: [
      'Instant salary to hourly conversion',
      'Daily, weekly, and monthly equivalents',
      'Adjust for different work schedules',
      'Compare against hourly job offers',
      'See your "effective" hourly rate after taxes',
    ],
    faqs: [
      {
        question: 'How do I convert salary to hourly wage?',
        answer: 'Divide your annual salary by 2,080 (40 hours × 52 weeks). For example, $60,000 ÷ 2,080 = $28.85 per hour.',
      },
      {
        question: 'What is $50,000 a year in hourly wage?',
        answer: '$50,000 per year equals approximately $24.04 per hour for a standard 40-hour work week ($50,000 ÷ 2,080 hours).',
      },
      {
        question: 'What is $75,000 a year hourly?',
        answer: '$75,000 per year equals approximately $36.06 per hour for a standard 40-hour work week.',
      },
      {
        question: 'Should I take a salary or hourly job?',
        answer: 'It depends on your work style. Salary jobs offer predictable income and often better benefits. Hourly jobs can pay more if you work overtime, and clearly separate work from personal time.',
      },
    ],
    calculatorConfig: {
      defaultPayType: 'salary',
      focusField: 'annualSalary',
    },
    relatedPages: [
      { title: 'Hourly to Salary Calculator', url: '/income-calculator/hourly', description: 'Convert hourly wage to annual salary' },
      { title: 'Income Calculator', url: '/calculator', description: 'Full income breakdown with all deductions' },
      { title: 'Salary Negotiation Tips', url: '/blog/salary-negotiation-tips', description: 'How to negotiate a higher salary' },
    ],
  },

  '1099': {
    slug: '1099',
    title: '1099 Tax Calculator',
    metaTitle: '1099 Tax Calculator 2026 | Self-Employment Tax Calculator',
    metaDescription: 'Free 1099 tax calculator for freelancers and self-employed. Calculate self-employment tax, quarterly estimates, and take-home pay from 1099 income.',
    heading: '1099 Tax Calculator',
    subheading: 'Calculate your self-employment taxes and take-home pay',
    description: 'Calculate your 1099 self-employment taxes with our free calculator. See your federal income tax, self-employment tax (Social Security + Medicare), and estimated quarterly payments.',
    features: [
      '15.3% self-employment tax calculation',
      'Federal income tax estimates',
      'Quarterly payment schedule',
      'Business expense deductions',
      'Compare 1099 vs W-2 take-home pay',
    ],
    faqs: [
      {
        question: 'How much tax do I pay on 1099 income?',
        answer: '1099 workers pay 15.3% self-employment tax (12.4% Social Security + 2.9% Medicare) plus federal income tax. Total effective tax rate is typically 25-40% depending on income level.',
      },
      {
        question: 'What is the self-employment tax rate for 2026?',
        answer: 'The self-employment tax rate is 15.3% (12.4% for Social Security up to $168,600 and 2.9% for Medicare on all income). You can deduct half of this on your tax return.',
      },
      {
        question: 'Do I need to make quarterly tax payments?',
        answer: 'Yes, if you expect to owe $1,000 or more in taxes, the IRS requires quarterly estimated payments. Due dates are April 15, June 15, September 15, and January 15.',
      },
      {
        question: 'How much should I set aside for 1099 taxes?',
        answer: 'A safe rule is to set aside 25-30% of your 1099 income for taxes. If you earn over $100,000, consider 30-35%. Business expenses will reduce your taxable income.',
      },
    ],
    calculatorConfig: {
      defaultTaxType: '1099',
      showField: 'selfEmploymentTax',
    },
    relatedPages: [
      { title: 'Quarterly Tax Calculator', url: '/income-calculator/quarterly', description: 'Calculate quarterly estimated payments' },
      { title: 'Tax Deduction Checklist', url: '/blog/tax-deductions-you-might-be-missing', description: 'Deductions you might be missing' },
      { title: 'Side Hustle Income Ideas', url: '/blog/side-hustle-income-ideas', description: 'Ways to earn 1099 income' },
    ],
  },

  'overtime': {
    slug: 'overtime',
    title: 'Overtime Pay Calculator',
    metaTitle: 'Overtime Pay Calculator 2026 | Calculate Overtime Wages',
    metaDescription: 'Free overtime calculator. Calculate your overtime pay at 1.5x or 2x rates. See how extra hours affect your paycheck and annual earnings.',
    heading: 'Overtime Pay Calculator',
    subheading: 'Calculate your overtime pay and annual earnings with extra hours',
    description: 'Calculate how much you earn from overtime hours. Enter your regular hourly rate and overtime hours to see your weekly, monthly, and annual pay including overtime.',
    features: [
      'Time-and-a-half (1.5x) calculation',
      'Double-time (2x) for holidays',
      'Weekly and annual overtime totals',
      'Tax impact of overtime pay',
      'Compare regular vs overtime scenarios',
    ],
    faqs: [
      {
        question: 'How is overtime pay calculated?',
        answer: 'Federal law requires overtime pay of at least 1.5 times your regular rate for hours over 40 in a workweek. Some states and employers offer higher rates or different thresholds.',
      },
      {
        question: 'What is time and a half for $20 an hour?',
        answer: 'Time and a half for $20/hour is $30/hour. So if you work 10 overtime hours, you earn $300 for those hours instead of $200.',
      },
      {
        question: 'Is overtime taxed higher?',
        answer: 'Overtime income is taxed at the same rate as regular income, but the extra money may push you into a higher tax bracket for that portion of your income.',
      },
      {
        question: 'Do salaried employees get overtime?',
        answer: 'It depends. Salaried employees earning less than $58,656/year (2026 threshold) are generally entitled to overtime. Highly compensated and certain exempt positions may not qualify.',
      },
    ],
    calculatorConfig: {
      defaultPayType: 'hourly',
      showField: 'overtime',
    },
    relatedPages: [
      { title: 'Hourly to Salary Calculator', url: '/income-calculator/hourly', description: 'Convert hourly to annual salary' },
      { title: 'Income Calculator', url: '/calculator', description: 'Full income breakdown' },
      { title: 'Budget on Your Salary', url: '/afford', description: 'Budgeting guides by income level' },
    ],
  },

  'quarterly': {
    slug: 'quarterly',
    title: 'Quarterly Tax Calculator',
    metaTitle: 'Quarterly Tax Calculator 2026 | Estimated Tax Payment Calculator',
    metaDescription: 'Calculate your quarterly estimated tax payments for 2026. Free calculator for freelancers, contractors, and self-employed individuals.',
    heading: 'Quarterly Tax Calculator',
    subheading: 'Calculate your estimated quarterly tax payments',
    description: 'Calculate your quarterly estimated tax payments to avoid IRS penalties. Perfect for freelancers, contractors, and anyone with 1099 income.',
    features: [
      'Four quarterly payment amounts',
      'Due date reminders (4/15, 6/15, 9/15, 1/15)',
      'Safe harbor calculation',
      'Penalty avoidance guidance',
      'State quarterly estimates included',
    ],
    faqs: [
      {
        question: 'When are quarterly taxes due in 2026?',
        answer: 'Q1 (Jan-Mar): April 15, 2026. Q2 (Apr-May): June 16, 2026. Q3 (Jun-Aug): September 15, 2026. Q4 (Sep-Dec): January 15, 2027.',
      },
      {
        question: 'How much should my quarterly payment be?',
        answer: 'Divide your estimated annual tax liability by 4. Alternatively, pay 100% of last year\'s tax (110% if income over $150,000) to avoid penalties.',
      },
      {
        question: 'What happens if I miss a quarterly payment?',
        answer: 'The IRS charges an underpayment penalty, currently around 8% annually. The penalty is calculated on the amount underpaid for each quarter.',
      },
      {
        question: 'Do I need to pay quarterly taxes?',
        answer: 'Yes, if you expect to owe $1,000 or more in taxes when you file your return. This typically applies to self-employed individuals, freelancers, and those with significant investment income.',
      },
    ],
    calculatorConfig: {
      defaultTaxType: '1099',
      showField: 'quarterlyPayments',
    },
    relatedPages: [
      { title: '1099 Tax Calculator', url: '/income-calculator/1099', description: 'Full 1099 self-employment tax calculator' },
      { title: 'Tax Deduction Checklist', url: '/blog/tax-deductions-you-might-be-missing', description: 'Reduce your quarterly payments' },
      { title: 'Side Hustle Income Ideas', url: '/blog/side-hustle-income-ideas', description: 'Ways to earn extra income' },
    ],
  },

  'biweekly': {
    slug: 'biweekly',
    title: 'Biweekly Paycheck Calculator',
    metaTitle: 'Biweekly Paycheck Calculator 2026 | Calculate Take-Home Pay',
    metaDescription: 'Free biweekly paycheck calculator. Calculate your take-home pay from your biweekly gross salary after taxes, 401k, and other deductions.',
    heading: 'Biweekly Paycheck Calculator',
    subheading: 'Calculate your take-home pay for each biweekly paycheck',
    description: 'Calculate exactly how much you\'ll take home from each biweekly paycheck after federal taxes, state taxes, FICA, 401k contributions, and other deductions.',
    features: [
      'Accurate biweekly take-home calculation',
      'All federal and state taxes included',
      '401k and benefits deductions',
      '26 paychecks per year breakdown',
      'Year-to-date accumulator',
    ],
    faqs: [
      {
        question: 'How do I calculate my biweekly paycheck?',
        answer: 'Divide your annual salary by 26 to get your gross biweekly pay, then subtract taxes and deductions. Our calculator does this automatically with accurate tax withholding.',
      },
      {
        question: 'How many biweekly paychecks are in a year?',
        answer: 'There are 26 biweekly paychecks in a year (52 weeks ÷ 2). Some months you\'ll receive 3 paychecks instead of 2, which is a great budgeting opportunity.',
      },
      {
        question: 'Why is biweekly different from semi-monthly?',
        answer: 'Biweekly means every 2 weeks (26 paychecks/year). Semi-monthly means twice per month on specific dates (24 paychecks/year). Biweekly paychecks are slightly smaller but you get 2 extra per year.',
      },
      {
        question: 'What is a $50,000 salary biweekly?',
        answer: '$50,000 per year is $1,923.08 gross per biweekly paycheck. After taxes (assuming single, no state income tax), you\'d take home approximately $1,500-$1,600.',
      },
    ],
    calculatorConfig: {
      defaultPayType: 'salary',
      showField: 'biweeklyPay',
    },
    relatedPages: [
      { title: 'Salary to Hourly Calculator', url: '/income-calculator/salary-to-hourly', description: 'Convert salary to hourly rate' },
      { title: 'Understanding Your Paystub', url: '/blog/understanding-your-paystub', description: 'Learn what each deduction means' },
      { title: 'Budget Calculator', url: '/smart-money', description: 'Plan your biweekly budget' },
    ],
  },

  'take-home': {
    slug: 'take-home',
    title: 'Take Home Pay Calculator',
    metaTitle: 'Take Home Pay Calculator 2026 | Net Pay After Taxes',
    metaDescription: 'Free take home pay calculator. Calculate your net pay after federal taxes, state taxes, FICA, and deductions. See your actual paycheck amount.',
    heading: 'Take Home Pay Calculator',
    subheading: 'Calculate your actual paycheck after all deductions',
    description: 'Find out exactly how much money you\'ll actually receive in your paycheck. Our take-home pay calculator accounts for federal income tax, state tax, Social Security, Medicare, and common pre-tax deductions.',
    features: [
      'Accurate federal tax withholding',
      'All 50 states tax calculations',
      'FICA (Social Security + Medicare)',
      'Pre-tax deductions (401k, HSA, insurance)',
      'Compare gross vs net pay',
    ],
    faqs: [
      {
        question: 'What is take home pay?',
        answer: 'Take home pay (also called net pay) is the amount you actually receive after all taxes and deductions are subtracted from your gross pay. It\'s what gets deposited into your bank account.',
      },
      {
        question: 'How much of my salary do I actually take home?',
        answer: 'Most workers take home 65-80% of their gross salary. The exact percentage depends on your tax bracket, state taxes, and deductions like 401k contributions.',
      },
      {
        question: 'Why is my take home pay less than expected?',
        answer: 'Common reasons include: federal/state income tax withholding, Social Security (6.2%), Medicare (1.45%), health insurance premiums, 401k contributions, and other benefits.',
      },
      {
        question: 'How can I increase my take home pay?',
        answer: 'Increase 401k contributions to reduce taxable income, contribute to HSA/FSA accounts, claim all eligible tax credits, and ensure your W-4 withholding is optimized.',
      },
    ],
    calculatorConfig: {
      defaultPayType: 'salary',
      showField: 'takeHomePay',
    },
    relatedPages: [
      { title: 'Income Calculator', url: '/calculator', description: 'Full income breakdown tool' },
      { title: 'Maximize Your 401k', url: '/blog/maximize-your-401k', description: 'Optimize retirement savings' },
      { title: 'Understanding Your Paystub', url: '/blog/understanding-your-paystub', description: 'Decode your paycheck' },
    ],
  },

  'gross-to-net': {
    slug: 'gross-to-net',
    title: 'Gross to Net Calculator',
    metaTitle: 'Gross to Net Calculator 2026 | Convert Gross Salary to Net Pay',
    metaDescription: 'Free gross to net salary calculator. Convert your gross income to net take-home pay after taxes and deductions. See your real paycheck amount.',
    heading: 'Gross to Net Calculator',
    subheading: 'Convert gross income to net take-home pay',
    description: 'Instantly convert your gross salary to net pay. See exactly how much of your gross income you\'ll actually take home after federal and state taxes and deductions.',
    features: [
      'Instant gross to net conversion',
      '2026 tax bracket calculations',
      'State-specific tax rates',
      'Visual tax breakdown chart',
      'Compare different salary scenarios',
    ],
    faqs: [
      {
        question: 'What is the difference between gross and net pay?',
        answer: 'Gross pay is your total earnings before any deductions. Net pay (take-home pay) is what remains after taxes, insurance, retirement contributions, and other deductions.',
      },
      {
        question: 'What percentage of gross pay is net?',
        answer: 'On average, net pay is 70-80% of gross pay, but this varies widely based on income level, state taxes, and deductions. Higher earners may keep a lower percentage due to progressive tax brackets.',
      },
      {
        question: 'How do I calculate net from gross salary?',
        answer: 'Start with gross salary, subtract federal income tax (10-37%), state income tax (0-13%), Social Security (6.2% up to $168,600), Medicare (1.45%), and any pre-tax deductions.',
      },
      {
        question: 'What is $100,000 gross after taxes?',
        answer: 'A $100,000 gross salary typically results in $70,000-$80,000 net pay, depending on your state. In no-income-tax states like Texas, you\'d keep more. In high-tax states like California, expect closer to $70,000.',
      },
    ],
    calculatorConfig: {
      defaultPayType: 'salary',
      showField: 'taxBreakdown',
    },
    relatedPages: [
      { title: 'Take Home Pay Calculator', url: '/income-calculator/take-home', description: 'Detailed take-home calculation' },
      { title: 'Tax Deduction Tips', url: '/blog/tax-deductions-you-might-be-missing', description: 'Reduce your tax burden' },
      { title: 'Budget by Salary', url: '/afford', description: 'Budget guides for your income level' },
    ],
  },
};

export const ALL_VARIANT_SLUGS = Object.keys(CALCULATOR_VARIANTS);

export function getVariantData(slug: string): CalculatorVariant | null {
  return CALCULATOR_VARIANTS[slug] || null;
}
