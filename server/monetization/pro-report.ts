/**
 * Pro Report Content Generator
 *
 * Generates enhanced report content for Pro tier users.
 * This is additive - it extends the base report without modifying it.
 */

import type { ReportTier } from './types';

interface IncomeResults {
  annualIncome: number;
  monthlyIncome: number;
  weeklyIncome: number;
  dailyIncome: number;
  daysWorked?: number;
}

interface ProReportSections {
  incomeStabilityScore: number;
  stabilityRating: string;
  stabilityExplanation: string;
  approvalReadiness: {
    overall: string;
    creditCards: string;
    personalLoans: string;
    autoLoans: string;
    mortgage: string;
  };
  leverageMoves: string[];
  thirtyDayPlan: {
    week1: string[];
    week2: string[];
    week3: string[];
    week4: string[];
  };
  expandedTips: {
    title: string;
    description: string;
    actionItems: string[];
  }[];
}

/**
 * Calculate income stability score based on various factors.
 * Score ranges from 0-100.
 */
function calculateStabilityScore(results: IncomeResults): number {
  const { annualIncome, daysWorked } = results;

  let score = 50; // Base score

  // Income level factor (higher = more stable typically)
  if (annualIncome >= 150000) score += 20;
  else if (annualIncome >= 100000) score += 15;
  else if (annualIncome >= 75000) score += 10;
  else if (annualIncome >= 50000) score += 5;
  else if (annualIncome < 30000) score -= 10;

  // Days worked factor (more days = more data = more confidence)
  if (daysWorked) {
    if (daysWorked >= 365) score += 15;
    else if (daysWorked >= 180) score += 10;
    else if (daysWorked >= 90) score += 5;
    else if (daysWorked < 30) score -= 10;
  }

  // Normalize to 0-100
  return Math.max(0, Math.min(100, score));
}

function getStabilityRating(score: number): { rating: string; explanation: string } {
  if (score >= 85) {
    return {
      rating: 'Excellent',
      explanation: 'Your income shows strong consistency and reliability. Lenders and landlords will view this favorably.',
    };
  }
  if (score >= 70) {
    return {
      rating: 'Good',
      explanation: 'Your income appears stable with good earning potential. You\'re in a solid position for most financial applications.',
    };
  }
  if (score >= 55) {
    return {
      rating: 'Moderate',
      explanation: 'Your income is in a reasonable range. Building a longer track record will improve your financial profile.',
    };
  }
  if (score >= 40) {
    return {
      rating: 'Developing',
      explanation: 'Your income is establishing a pattern. Consider ways to increase consistency or add supplementary income.',
    };
  }
  return {
    rating: 'Building',
    explanation: 'Your income is in the early stages of establishing a track record. Focus on consistency and growth opportunities.',
  };
}

/**
 * Generate approval readiness assessment.
 * Uses generic phrasing to avoid compliance issues.
 */
function generateApprovalReadiness(annualIncome: number): ProReportSections['approvalReadiness'] {
  const monthlyIncome = annualIncome / 12;

  // Generic assessments based on income ranges
  // Note: These are general guidelines, not financial advice
  const assessOverall = (): string => {
    if (annualIncome >= 100000) {
      return 'Your income level is generally viewed favorably by most lenders. Strong candidates typically see more competitive rates.';
    }
    if (annualIncome >= 60000) {
      return 'Your income is in a range that typically meets requirements for most standard financial products.';
    }
    if (annualIncome >= 40000) {
      return 'Your income can support many financial products. Building savings and credit history will strengthen applications.';
    }
    return 'Focus on building income stability and emergency savings. Consider secured credit options to build credit history.';
  };

  const assessCreditCards = (): string => {
    if (annualIncome >= 75000) {
      return 'Generally well-positioned for premium credit cards with travel rewards and higher limits.';
    }
    if (annualIncome >= 40000) {
      return 'Good fit for mid-tier rewards cards. Consider cards with no annual fee and cash back benefits.';
    }
    return 'Start with secured cards or student cards to build credit history. Graduate to rewards cards over time.';
  };

  const assessPersonalLoans = (): string => {
    if (monthlyIncome >= 5000) {
      return 'Income typically supports personal loans up to 2-3x monthly income, depending on existing debts.';
    }
    if (monthlyIncome >= 3000) {
      return 'Personal loans are accessible. Keep monthly payments under 10% of gross income for comfort.';
    }
    return 'Smaller personal loans may be available. Consider credit unions for better rates on smaller amounts.';
  };

  const assessAutoLoans = (): string => {
    const maxPayment = monthlyIncome * 0.12;
    if (monthlyIncome >= 4000) {
      return `Following the 12% rule, comfortable monthly auto payment is around $${Math.round(maxPayment)}. Include insurance and maintenance in your budget.`;
    }
    return `Budget-friendly options recommended. Keep total car costs under 15% of income including insurance.`;
  };

  const assessMortgage = (): string => {
    const maxHousing = monthlyIncome * 0.28;
    if (annualIncome >= 80000) {
      return `Following the 28% rule, max housing payment around $${Math.round(maxHousing)}/month. 20% down payment avoids PMI.`;
    }
    if (annualIncome >= 50000) {
      return `First-time buyer programs may help. Look into FHA loans with 3.5% down. Housing budget: ~$${Math.round(maxHousing)}/month.`;
    }
    return 'Building savings and credit history is the priority. Consider assistance programs when ready to buy.';
  };

  return {
    overall: assessOverall(),
    creditCards: assessCreditCards(),
    personalLoans: assessPersonalLoans(),
    autoLoans: assessAutoLoans(),
    mortgage: assessMortgage(),
  };
}

/**
 * Generate top leverage moves based on income level.
 */
function generateLeverageMoves(annualIncome: number): string[] {
  const moves: string[] = [];

  if (annualIncome < 50000) {
    moves.push(
      'Upskill with free certifications: Google Career Certificates, Coursera, and LinkedIn Learning can boost your earning potential by 20-40%',
      'Start a side income stream: Freelancing, tutoring, or gig work can add $500-2,000/month',
      'Negotiate your salary: 78% of employers expect negotiation. Research your market rate and ask for a meeting',
    );
  } else if (annualIncome < 100000) {
    moves.push(
      'Max out employer 401(k) match immediately: This is a 50-100% instant return on your contribution',
      'Open a Roth IRA and contribute $7,000/year: Tax-free growth compounds significantly over time',
      'Build emergency fund to 3-6 months expenses: This creates financial security and negotiation leverage',
    );
  } else {
    moves.push(
      'Max all tax-advantaged accounts: 401(k) ($23,000), IRA ($7,000), HSA ($4,150/$8,300) reduces taxable income',
      'Consider real estate investment: Rental income + depreciation provides cash flow and tax benefits',
      'Explore backdoor Roth conversions: Circumvent income limits to access tax-free growth',
    );
  }

  return moves;
}

/**
 * Generate 30-day action plan.
 */
function generateThirtyDayPlan(annualIncome: number): ProReportSections['thirtyDayPlan'] {
  if (annualIncome < 50000) {
    return {
      week1: [
        'Audit all subscriptions - cancel anything unused weekly',
        'Set up automatic savings transfer of $50/paycheck (adjust based on your budget)',
        'List your top 3 marketable skills',
      ],
      week2: [
        'Apply for one free certification (Google, HubSpot, LinkedIn)',
        'Research salary benchmarks for your role on Glassdoor',
        'Calculate your true hourly rate including commute time',
      ],
      week3: [
        'Draft a salary negotiation script or job search plan',
        'Open a high-yield savings account (4-5% APY) if you don\'t have one',
        'Identify one potential side income that uses your existing skills',
      ],
      week4: [
        'Schedule a career conversation with your manager or apply to 3 jobs',
        'Set specific income goal for next quarter',
        'Review and optimize your budget using the 50/30/20 framework',
      ],
    };
  }

  if (annualIncome < 100000) {
    return {
      week1: [
        'Review your 401(k) contribution - ensure you\'re maxing employer match',
        'Check that beneficiaries are updated on all accounts',
        'Audit your insurance coverage (life, disability, umbrella)',
      ],
      week2: [
        'Open or fund Roth IRA - set up automatic monthly contributions',
        'Research HSA-eligible health plans for next enrollment',
        'Review your asset allocation - ensure age-appropriate diversification',
      ],
      week3: [
        'Calculate your net worth (assets minus liabilities)',
        'Review all investment fees - switch to low-cost index funds if needed',
        'Create or update your emergency fund goal (3-6 months expenses)',
      ],
      week4: [
        'Schedule annual compensation review conversation',
        'Set up automatic increases to retirement contributions with raises',
        'Create a 12-month financial roadmap with specific milestones',
      ],
    };
  }

  return {
    week1: [
      'Verify you\'re maxing all tax-advantaged accounts ($23k 401k + $7k IRA)',
      'Review mega backdoor Roth eligibility with your 401(k) plan',
      'Audit your portfolio for tax-loss harvesting opportunities',
    ],
    week2: [
      'Schedule meeting with a fee-only fiduciary financial advisor',
      'Research real estate syndications or REITs for diversification',
      'Review estate planning documents (will, trust, beneficiaries)',
    ],
    week3: [
      'Evaluate need for umbrella insurance given asset level',
      'Consider charitable giving strategy: donor-advised fund or appreciated stock',
      'Review corporate benefits for any unused perks (legal, financial planning)',
    ],
    week4: [
      'Set up quarterly net worth tracking',
      'Create or update legacy/estate plan',
      'Schedule annual tax planning meeting with CPA',
    ],
  };
}

/**
 * Generate expanded financial tips based on income level.
 */
function generateExpandedTips(annualIncome: number): ProReportSections['expandedTips'] {
  const tips: ProReportSections['expandedTips'] = [];

  // Add income-appropriate tips
  if (annualIncome < 50000) {
    tips.push({
      title: 'The Power of Compound Income',
      description: 'Focus on increasing income rather than just cutting expenses. A $5,000/year raise compounds throughout your career.',
      actionItems: [
        'Identify your highest-value skill and improve it',
        'Consider certifications that directly lead to higher pay',
        'Track your accomplishments for performance reviews',
      ],
    });
    tips.push({
      title: 'Emergency Fund Strategy',
      description: 'Even small emergency funds prevent debt spirals. Start with $1,000, then build to one month\'s expenses.',
      actionItems: [
        'Open a separate high-yield savings account',
        'Automate a small weekly transfer ($20-50)',
        'Use this fund ONLY for true emergencies',
      ],
    });
  } else if (annualIncome < 100000) {
    tips.push({
      title: 'Tax Efficiency Fundamentals',
      description: 'Every dollar saved in taxes is a dollar earned. Pre-tax contributions reduce your tax bracket.',
      actionItems: [
        'Max employer 401(k) match (typically 3-6%)',
        'Use FSA for medical/dependent care expenses',
        'Consider pre-tax commuter benefits if available',
      ],
    });
    tips.push({
      title: 'Investment Simplicity',
      description: 'Low-cost index funds beat 90% of actively managed funds over 20 years. Keep investing simple.',
      actionItems: [
        'Use target-date funds for hands-off investing',
        'Keep investment fees under 0.20%',
        'Avoid timing the market - contribute consistently',
      ],
    });
  } else {
    tips.push({
      title: 'Tax Planning vs Tax Preparation',
      description: 'At your income level, proactive tax planning saves more than reactive tax filing. Plan quarterly, not annually.',
      actionItems: [
        'Meet with CPA in Q4 to plan year-end moves',
        'Bunch deductions in alternating years if beneficial',
        'Consider Qualified Business Income deductions if applicable',
      ],
    });
    tips.push({
      title: 'Wealth Preservation',
      description: 'As wealth grows, protection becomes as important as growth. Diversification and insurance are key.',
      actionItems: [
        'Ensure umbrella insurance covers your net worth',
        'Diversify across asset classes and geographies',
        'Consider asset protection strategies (trusts, LLCs)',
      ],
    });
  }

  // Add universal tips
  tips.push({
    title: 'The Psychology of Money',
    description: 'Financial success is 20% knowledge and 80% behavior. Automate good decisions to remove willpower from the equation.',
    actionItems: [
      'Automate savings and investments on payday',
      'Use separate accounts for different goals',
      'Review spending monthly, not daily (avoid anxiety)',
    ],
  });

  return tips;
}

/**
 * Main function to generate all Pro report sections.
 */
export function generateProReportSections(results: IncomeResults): ProReportSections {
  const { annualIncome } = results;

  const stabilityScore = calculateStabilityScore(results);
  const { rating, explanation } = getStabilityRating(stabilityScore);

  return {
    incomeStabilityScore: stabilityScore,
    stabilityRating: rating,
    stabilityExplanation: explanation,
    approvalReadiness: generateApprovalReadiness(annualIncome),
    leverageMoves: generateLeverageMoves(annualIncome),
    thirtyDayPlan: generateThirtyDayPlan(annualIncome),
    expandedTips: generateExpandedTips(annualIncome),
  };
}

/**
 * Generate Pro report email HTML content.
 * This extends the base email with additional Pro sections.
 */
export function generateProReportEmailHtml(
  proSections: ProReportSections,
  baseHtml: string
): string {
  // Build Pro sections HTML
  const proHtml = `
    <!-- Pro Report: Income Stability Score -->
    <div style="background-color: #171717; border: 1px solid #262626; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="color: #10b981; font-size: 16px; margin: 0;">
          <span style="margin-right: 8px;">&#128202;</span> Income Stability Score
        </h3>
        <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          PRO
        </span>
      </div>
      <div style="text-align: center; padding: 20px 0;">
        <div style="color: #10b981; font-size: 48px; font-weight: bold; font-family: monospace;">
          ${proSections.incomeStabilityScore}
        </div>
        <div style="color: #a3a3a3; font-size: 14px; margin-top: 8px;">
          ${proSections.stabilityRating}
        </div>
      </div>
      <div style="background-color: #262626; border-radius: 8px; height: 12px; margin: 15px 0; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: ${proSections.incomeStabilityScore}%; border-radius: 8px;"></div>
      </div>
      <p style="color: #a3a3a3; font-size: 13px; margin: 15px 0 0 0; line-height: 1.5;">
        ${proSections.stabilityExplanation}
      </p>
    </div>

    <!-- Pro Report: Approval Readiness -->
    <div style="background-color: #171717; border: 1px solid #262626; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="color: #10b981; font-size: 16px; margin: 0;">
          <span style="margin-right: 8px;">&#128273;</span> Approval Readiness Analysis
        </h3>
        <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          PRO
        </span>
      </div>
      <p style="color: #d4d4d4; font-size: 13px; line-height: 1.6; margin: 0 0 15px 0;">
        ${proSections.approvalReadiness.overall}
      </p>
      <div style="border-top: 1px solid #262626; padding-top: 15px;">
        <div style="margin-bottom: 12px;">
          <strong style="color: #10b981; font-size: 12px;">Credit Cards:</strong>
          <p style="color: #a3a3a3; font-size: 13px; margin: 4px 0 0 0;">${proSections.approvalReadiness.creditCards}</p>
        </div>
        <div style="margin-bottom: 12px;">
          <strong style="color: #3b82f6; font-size: 12px;">Personal Loans:</strong>
          <p style="color: #a3a3a3; font-size: 13px; margin: 4px 0 0 0;">${proSections.approvalReadiness.personalLoans}</p>
        </div>
        <div style="margin-bottom: 12px;">
          <strong style="color: #f59e0b; font-size: 12px;">Auto Loans:</strong>
          <p style="color: #a3a3a3; font-size: 13px; margin: 4px 0 0 0;">${proSections.approvalReadiness.autoLoans}</p>
        </div>
        <div>
          <strong style="color: #8b5cf6; font-size: 12px;">Mortgage:</strong>
          <p style="color: #a3a3a3; font-size: 13px; margin: 4px 0 0 0;">${proSections.approvalReadiness.mortgage}</p>
        </div>
      </div>
    </div>

    <!-- Pro Report: Top 3 Leverage Moves -->
    <div style="background-color: #171717; border: 1px solid #262626; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="color: #10b981; font-size: 16px; margin: 0;">
          <span style="margin-right: 8px;">&#128640;</span> Your Top 3 Leverage Moves
        </h3>
        <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          PRO
        </span>
      </div>
      ${proSections.leverageMoves
        .map(
          (move, i) => `
        <div style="margin-bottom: 12px; padding-left: 20px; border-left: 3px solid ${i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : '#f59e0b'};">
          <p style="color: #d4d4d4; font-size: 13px; margin: 0; line-height: 1.6;">
            <strong style="color: #e5e5e5;">${i + 1}.</strong> ${move}
          </p>
        </div>
      `
        )
        .join('')}
    </div>

    <!-- Pro Report: 30-Day Plan -->
    <div style="background-color: #171717; border: 1px solid #262626; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="color: #10b981; font-size: 16px; margin: 0;">
          <span style="margin-right: 8px;">&#128197;</span> Your 30-Day Action Plan
        </h3>
        <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
          PRO
        </span>
      </div>

      ${['week1', 'week2', 'week3', 'week4']
        .map(
          (week, i) => `
        <div style="margin-bottom: 16px;">
          <h4 style="color: #e5e5e5; font-size: 13px; margin: 0 0 8px 0;">Week ${i + 1}</h4>
          <ul style="margin: 0; padding-left: 20px;">
            ${(proSections.thirtyDayPlan as any)[week]
              .map(
                (item: string) => `
              <li style="color: #a3a3a3; font-size: 12px; margin-bottom: 4px;">${item}</li>
            `
              )
              .join('')}
          </ul>
        </div>
      `
        )
        .join('')}
    </div>

    <!-- Pro Report: Expanded Tips -->
    ${proSections.expandedTips
      .map(
        (tip) => `
      <div style="background-color: #171717; border: 1px solid #262626; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="color: #10b981; font-size: 16px; margin: 0;">
            <span style="margin-right: 8px;">&#128161;</span> ${tip.title}
          </h3>
          <span style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
            PRO
          </span>
        </div>
        <p style="color: #d4d4d4; font-size: 13px; line-height: 1.6; margin: 0 0 15px 0;">
          ${tip.description}
        </p>
        <div style="background-color: #262626; border-radius: 8px; padding: 12px;">
          <strong style="color: #a3a3a3; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Action Items:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            ${tip.actionItems
              .map(
                (item) => `
              <li style="color: #d4d4d4; font-size: 12px; margin-bottom: 4px;">${item}</li>
            `
              )
              .join('')}
          </ul>
        </div>
      </div>
    `
      )
      .join('')}
  `;

  // Insert Pro sections before the CTA button in the base email
  // Look for the "Calculate Again" button section
  const ctaMarker = '<!-- CTA Button -->';
  const exploreMarker = '<!-- Explore More -->';

  // If markers exist, insert before them. Otherwise append before footer
  if (baseHtml.includes(exploreMarker)) {
    return baseHtml.replace(exploreMarker, proHtml + '\n' + exploreMarker);
  }

  // Fallback: insert before footer
  const footerMarker = '<!-- Footer -->';
  if (baseHtml.includes(footerMarker)) {
    return baseHtml.replace(footerMarker, proHtml + '\n' + footerMarker);
  }

  // Last resort: append to end of main content
  return baseHtml.replace('</body>', proHtml + '</body>');
}

export type { ProReportSections };
