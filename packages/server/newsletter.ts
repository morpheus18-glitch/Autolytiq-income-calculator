import { Router } from "express";
import { Resend } from "resend";
import { leadsDb } from "./leads";

const router = Router();

// Configure Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const APP_URL = process.env.APP_URL || "https://autolytiqs.com";

// Newsletter content for 8+ weeks
// Each week builds on the previous, creating anticipation for the next
export const NEWSLETTER_CONTENT = [
  // Week 1: The Income Foundation
  {
    week: 1,
    subject: "The #1 Money Mistake 78% of Americans Make",
    preheader: "Plus: A simple fix that takes 5 minutes",
    headline: "Do You Actually Know Your Income?",
    intro: "Here's a shocking stat: 78% of Americans can't accurately state their annual income within $5,000. That's like not knowing if your car has 10 or 50 gallons of gas.",
    mainContent: `
      <p>Why does this matter? Because every financial decision you make - from rent to retirement - depends on this one number.</p>
      <p>The problem isn't math. It's that most people think in terms of their paycheck, not their annual picture. They know "$2,400 every two weeks" but not what that actually means for their budget.</p>
      <h3 style="color: #10b981; margin-top: 24px;">Your Action Item This Week</h3>
      <p>Calculate your <strong>true projected annual income</strong> using our calculator. Don't guess - use your actual paystub.</p>
      <p>Look for "YTD Gross" on your pay stub. This is your year-to-date total before taxes.</p>
    `,
    tip: "Your YTD (Year-to-Date) income is usually in the top-right or earnings section of your paystub. It's labeled 'YTD Gross' or 'YTD Earnings'.",
    ctaText: "Calculate Your Real Income",
    ctaUrl: `${APP_URL}`,
    nextWeekTeaser: "Next week: The 12% rule that could save you from car payment regret",
  },
  // Week 2: The 12% Rule
  {
    week: 2,
    subject: "The Car Payment Rule Banks Don't Want You to Know",
    preheader: "How to know if you can REALLY afford that car",
    headline: "The 12% Rule: Your Car Payment Ceiling",
    intro: "Last week, you calculated your income. This week, let's use that number to make one of life's biggest purchases smarter.",
    mainContent: `
      <p>Here's the rule financial advisors use but rarely share publicly:</p>
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="color: white; font-size: 18px; font-weight: bold; margin: 0; text-align: center;">
          Your car payment should be ≤12% of your gross monthly income
        </p>
      </div>
      <p><strong>Example:</strong> If you make $60,000/year ($5,000/month gross), your max car payment should be $600/month.</p>
      <p>Why 12%? Because when you add insurance ($150-300), gas ($150-250), and maintenance ($50-100), your total transportation cost hits 20% - the recommended ceiling.</p>
      <h3 style="color: #10b981; margin-top: 24px;">The Real Cost of Going Over</h3>
      <p>A $700/month payment instead of $500 doesn't just cost $200 more. Over 5 years, that's $12,000 that could have been invested. At 8% returns, that's $17,600 in lost wealth.</p>
    `,
    tip: "Before car shopping, get pre-approved for financing from your bank or credit union. Dealer financing often has higher rates hidden in the paperwork.",
    ctaText: "Check Your Max Car Payment",
    ctaUrl: `${APP_URL}`,
    nextWeekTeaser: "Next week: The credit score trick that can drop your rate by 2%",
  },
  // Week 3: Credit Score Strategy
  {
    week: 3,
    subject: "I Dropped My Auto Loan Rate 2.1% With This Trick",
    preheader: "The 30-day credit boost that actually works",
    headline: "Your Credit Score: The Hidden Tax on Everything",
    intro: "Your credit score isn't just a number - it's a tax you pay on every loan. A 700 vs 650 score can mean $4,000+ more on a car loan.",
    mainContent: `
      <p>Here's what each 50-point difference typically costs on a $30,000 car loan (60 months):</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #171717;">
          <td style="padding: 12px; border: 1px solid #333; color: #10b981; font-weight: bold;">Score Range</td>
          <td style="padding: 12px; border: 1px solid #333; color: #10b981; font-weight: bold;">Typical APR</td>
          <td style="padding: 12px; border: 1px solid #333; color: #10b981; font-weight: bold;">Total Interest Paid</td>
        </tr>
        <tr><td style="padding: 12px; border: 1px solid #333;">750+ (Excellent)</td><td style="padding: 12px; border: 1px solid #333;">5.99%</td><td style="padding: 12px; border: 1px solid #333;">$4,746</td></tr>
        <tr><td style="padding: 12px; border: 1px solid #333;">700-749 (Good)</td><td style="padding: 12px; border: 1px solid #333;">7.99%</td><td style="padding: 12px; border: 1px solid #333;">$6,398</td></tr>
        <tr><td style="padding: 12px; border: 1px solid #333;">650-699 (Fair)</td><td style="padding: 12px; border: 1px solid #333;">11.99%</td><td style="padding: 12px; border: 1px solid #333;">$9,849</td></tr>
        <tr><td style="padding: 12px; border: 1px solid #333;">Below 650</td><td style="padding: 12px; border: 1px solid #333;">17.99%</td><td style="padding: 12px; border: 1px solid #333;">$15,248</td></tr>
      </table>
      <p>That's a <strong>$10,000+ difference</strong> for the same car!</p>
      <h3 style="color: #10b981; margin-top: 24px;">The 30-Day Credit Boost</h3>
      <ol>
        <li><strong>Pay down credit cards below 30% utilization</strong> (ideally 10%)</li>
        <li><strong>Don't close old accounts</strong> - age matters</li>
        <li><strong>Dispute any errors</strong> on your free annual credit report</li>
        <li><strong>Become an authorized user</strong> on a family member's old, good-standing card</li>
      </ol>
    `,
    tip: "Credit utilization updates monthly. Pay your cards down 3-5 days BEFORE the statement closes (not the due date) to show the lower balance to bureaus.",
    ctaText: "See Your Rate by Credit Tier",
    ctaUrl: `${APP_URL}`,
    nextWeekTeaser: "Next week: The 50/30/20 budget - why most people do it wrong",
  },
  // Week 4: The 50/30/20 Budget
  {
    week: 4,
    subject: "The Budget Rule That Made Me Stop Stressing About Money",
    preheader: "Simple math that actually works in real life",
    headline: "50/30/20: The Only Budget Rule You Need",
    intro: "Budgets fail because they're complicated. The 50/30/20 rule is simple: Needs 50%, Wants 30%, Savings 20%. That's it.",
    mainContent: `
      <p>Here's what goes where:</p>
      <div style="background: #171717; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h4 style="color: #10b981; margin: 0 0 12px 0;">50% - NEEDS (Non-negotiable)</h4>
        <p style="margin: 0 0 20px 0; color: #a3a3a3;">Rent/mortgage, utilities, groceries, insurance, minimum debt payments, transportation to work</p>

        <h4 style="color: #3b82f6; margin: 0 0 12px 0;">30% - WANTS (Lifestyle)</h4>
        <p style="margin: 0 0 20px 0; color: #a3a3a3;">Dining out, entertainment, subscriptions, hobbies, vacations, upgrades</p>

        <h4 style="color: #f59e0b; margin: 0 0 12px 0;">20% - SAVINGS (Future you)</h4>
        <p style="margin: 0; color: #a3a3a3;">Emergency fund, retirement (401k/IRA), extra debt payments, investments</p>
      </div>
      <h3 style="color: #10b981; margin-top: 24px;">The Math Made Simple</h3>
      <p>If your monthly take-home is $4,000:</p>
      <ul>
        <li>Needs: $2,000 max</li>
        <li>Wants: $1,200 max</li>
        <li>Savings: $800 minimum</li>
      </ul>
      <p><strong>Pro tip:</strong> If your needs exceed 50%, focus on the big three: housing, transportation, food. These typically make up 70% of overspending.</p>
    `,
    tip: "Track spending for ONE week. Most people are shocked to find 'wants' disguised as 'needs' - like premium coffee or lunch out daily.",
    ctaText: "Try Our Budget Planner",
    ctaUrl: `${APP_URL}/smart-money`,
    nextWeekTeaser: "Next week: The emergency fund myth (and what to do instead)",
  },
  // Week 5: Emergency Fund Strategy
  {
    week: 5,
    subject: "Why 'Save 6 Months Expenses' Is Bad Advice",
    preheader: "A smarter approach to emergency funds",
    headline: "The Emergency Fund Myth",
    intro: "You've heard it: 'Save 6 months of expenses!' But for someone making $50k, that's $15,000+. No wonder people give up before starting.",
    mainContent: `
      <p>Here's the truth: <strong>A tiered emergency fund works better than a big scary goal.</strong></p>
      <div style="background: #171717; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h4 style="color: #ef4444; margin: 0 0 8px 0;">Tier 1: $1,000 (The Starter)</h4>
        <p style="margin: 0 0 16px 0; color: #a3a3a3;">Covers: Car repairs, medical copays, appliance fixes. This handles 70% of emergencies.</p>

        <h4 style="color: #f59e0b; margin: 0 0 8px 0;">Tier 2: 1 Month Expenses (The Buffer)</h4>
        <p style="margin: 0 0 16px 0; color: #a3a3a3;">Covers: Job loss transition, major repairs. Gives you breathing room to think, not panic.</p>

        <h4 style="color: #10b981; margin: 0 0 8px 0;">Tier 3: 3-6 Months (The Safety Net)</h4>
        <p style="margin: 0; color: #a3a3a3;">Covers: Extended job loss, major life changes. Build this AFTER high-interest debt is gone.</p>
      </div>
      <h3 style="color: #10b981; margin-top: 24px;">The Priority Order</h3>
      <ol>
        <li>$1,000 emergency fund</li>
        <li>Pay off high-interest debt (15%+ APR)</li>
        <li>Get employer 401k match</li>
        <li>Build to 3-6 months expenses</li>
        <li>Max out retirement accounts</li>
      </ol>
      <p>This order maximizes your money's growth while protecting against disasters.</p>
    `,
    tip: "Keep your emergency fund in a HIGH-YIELD savings account (4-5% APY currently). Same accessibility, but your money grows.",
    ctaText: "Calculate Your Monthly Expenses",
    ctaUrl: `${APP_URL}/smart-money`,
    nextWeekTeaser: "Next week: The side hustle math - when it's worth it (and when it's not)",
  },
  // Week 6: Side Hustle Economics
  {
    week: 6,
    subject: "Is Your Side Hustle Actually Losing You Money?",
    preheader: "The math most gig workers ignore",
    headline: "Side Hustle Economics: The Real Numbers",
    intro: "Not all extra income is created equal. Here's how to know if your side hustle is actually worth your time.",
    mainContent: `
      <p>The formula most people ignore:</p>
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="color: white; font-size: 16px; font-weight: bold; margin: 0; text-align: center;">
          True Hourly Rate = (Gross Income - Expenses) ÷ Total Hours
        </p>
      </div>
      <h3 style="color: #10b981; margin-top: 24px;">Real Example: Food Delivery</h3>
      <p>Let's say you make $200 in a weekend doing deliveries:</p>
      <ul>
        <li>Gross: $200</li>
        <li>Gas: -$40</li>
        <li>Car wear (IRS rate $0.67/mile × 100 miles): -$67</li>
        <li>Self-employment tax (15.3%): -$14</li>
        <li><strong>Actual earnings: $79</strong></li>
        <li>Hours worked (including wait time): 10 hours</li>
        <li><strong>True hourly rate: $7.90</strong></li>
      </ul>
      <p>Below minimum wage. But some side hustles ARE worth it:</p>
      <h3 style="color: #10b981; margin-top: 24px;">High-Value Side Hustles</h3>
      <ul>
        <li><strong>Freelancing your job skills:</strong> $50-150/hr (writing, design, coding)</li>
        <li><strong>Tutoring:</strong> $25-75/hr (especially test prep)</li>
        <li><strong>Consulting:</strong> $75-200/hr (industry expertise)</li>
        <li><strong>Creating digital products:</strong> Passive after creation (courses, templates)</li>
      </ul>
    `,
    tip: "Track EVERY expense and hour for your side hustle for one month. The true hourly rate often surprises people - positively or negatively.",
    ctaText: "See Your Income Potential",
    ctaUrl: `${APP_URL}`,
    nextWeekTeaser: "Next week: The housing decision - rent vs buy in 2024",
  },
  // Week 7: Rent vs Buy
  {
    week: 7,
    subject: "Rent vs Buy: The 2024 Reality Check",
    preheader: "When renting is actually the smarter move",
    headline: "The Rent vs Buy Decision (Updated for 2024)",
    intro: "With mortgage rates higher than we've seen in years, the rent vs buy math has changed. Here's how to think about it now.",
    mainContent: `
      <p>The old rule of 'buying is always better' is outdated. Here's the new framework:</p>
      <h3 style="color: #10b981; margin-top: 24px;">The Buy Checklist</h3>
      <p>You should consider buying if:</p>
      <ul>
        <li>✅ You'll stay 5+ years (to offset closing costs)</li>
        <li>✅ You have 10-20% down payment saved</li>
        <li>✅ Your total housing cost is &lt;28% of gross income</li>
        <li>✅ You have 3-6 months emergency fund AFTER down payment</li>
        <li>✅ Your total debt-to-income is &lt;36%</li>
      </ul>
      <h3 style="color: #3b82f6; margin-top: 24px;">The Rent Advantages</h3>
      <p>Renting makes sense when:</p>
      <ul>
        <li>📍 You might relocate within 5 years</li>
        <li>💰 Rent is significantly cheaper than mortgage + taxes + insurance + maintenance</li>
        <li>📈 You can invest the down payment difference for higher returns</li>
        <li>🔧 You don't want maintenance responsibility</li>
      </ul>
      <h3 style="color: #10b981; margin-top: 24px;">The Math</h3>
      <p>Use the <strong>Price-to-Rent Ratio</strong>: Home Price ÷ Annual Rent</p>
      <ul>
        <li>&lt;15: Buying likely better</li>
        <li>15-20: Close call, depends on your situation</li>
        <li>&gt;20: Renting likely better</li>
      </ul>
    `,
    tip: "Don't forget the hidden costs of ownership: maintenance (1-2% of home value/year), HOA fees, property taxes, and homeowners insurance. These add 30-50% to your mortgage payment.",
    ctaText: "Try Our Housing Calculator",
    ctaUrl: `${APP_URL}/housing`,
    nextWeekTeaser: "Next week: Tax strategies to keep more of what you earn",
  },
  // Week 8: Tax Optimization
  {
    week: 8,
    subject: "7 Legal Tax Tricks Your Employer Won't Tell You",
    preheader: "Keep more of your paycheck this year",
    headline: "Tax Optimization: The Legal Loopholes",
    intro: "The difference between the rich and everyone else? Tax strategy. Here are the legitimate ways to keep more money.",
    mainContent: `
      <h3 style="color: #10b981;">1. Max Your 401(k) Match First</h3>
      <p>If your employer matches 4%, that's a <strong>100% instant return</strong>. Nothing beats free money.</p>

      <h3 style="color: #10b981; margin-top: 20px;">2. Use an HSA as a Stealth IRA</h3>
      <p>Health Savings Accounts are triple tax-advantaged: tax-free contributions, growth, AND withdrawals for medical expenses. After 65, it works like a traditional IRA.</p>

      <h3 style="color: #10b981; margin-top: 20px;">3. Harvest Your Losses</h3>
      <p>Sell losing investments to offset gains. You can deduct up to $3,000 in net losses against regular income.</p>

      <h3 style="color: #10b981; margin-top: 20px;">4. Bunch Deductions</h3>
      <p>If you're close to the standard deduction, bunch two years of charitable giving into one year to itemize.</p>

      <h3 style="color: #10b981; margin-top: 20px;">5. Use FSA for Predictable Expenses</h3>
      <p>Flexible Spending Accounts reduce taxable income. $2,000 in an FSA saves $500+ in taxes.</p>

      <h3 style="color: #10b981; margin-top: 20px;">6. Check Your Withholding</h3>
      <p>Big refund? You gave the government an interest-free loan. Adjust your W-4 to get that money monthly instead.</p>

      <h3 style="color: #10b981; margin-top: 20px;">7. Don't Leave Education Credits on the Table</h3>
      <p>Taking classes? The Lifetime Learning Credit is worth up to $2,000/year, even for one course.</p>
    `,
    tip: "Open enrollment is your annual chance to optimize benefits. Review HSA, FSA, 401k, and insurance options. Most people set and forget, leaving thousands on the table.",
    ctaText: "Calculate Your Take-Home Pay",
    ctaUrl: `${APP_URL}/smart-money`,
    nextWeekTeaser: "You've completed the 8-week series! Stay tuned for advanced wealth-building strategies.",
  },
];

// Email template generator
function generateNewsletterEmail(
  content: typeof NEWSLETTER_CONTENT[0],
  recipientName: string | null,
  unsubscribeUrl: string
): string {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi there,";
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${content.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f0f;">

    <!-- Preheader (hidden preview text) -->
    <div style="display: none; max-height: 0; overflow: hidden;">
      ${content.preheader}
      &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 24px; text-align: center;">
      <div style="font-size: 12px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
        Autolytiq Weekly • Week ${content.week}
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; line-height: 1.3;">
        ${content.headline}
      </h1>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px 24px;">
      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        ${greeting}
      </p>
      <p style="color: #a3a3a3; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
        ${content.intro}
      </p>

      <div style="color: #d4d4d4; font-size: 15px; line-height: 1.7;">
        ${content.mainContent}
      </div>

      <!-- Tip Box -->
      <div style="background-color: #171717; border-left: 4px solid #10b981; padding: 16px 20px; margin: 28px 0; border-radius: 0 8px 8px 0;">
        <div style="color: #10b981; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
          💡 Quick Tip
        </div>
        <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0;">
          ${content.tip}
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${content.ctaUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
          ${content.ctaText} →
        </a>
      </div>

      <!-- Next Week Teaser -->
      <div style="background-color: #171717; border-radius: 12px; padding: 20px; margin-top: 32px; border: 1px solid #262626;">
        <div style="color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
          Coming Next Week
        </div>
        <p style="color: #e5e5e5; font-size: 15px; margin: 0; font-weight: 500;">
          ${content.nextWeekTeaser}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #0a0a0a; padding: 24px; text-align: center; border-top: 1px solid #1a1a1a;">
      <p style="color: #525252; font-size: 12px; margin: 0 0 12px 0;">
        © ${year} Autolytiq. Free income calculator and financial tools.
      </p>
      <p style="color: #404040; font-size: 11px; margin: 0 0 12px 0;">
        <a href="${APP_URL}" style="color: #10b981; text-decoration: none;">Visit Calculator</a> •
        <a href="${APP_URL}/blog" style="color: #10b981; text-decoration: none;">Read Blog</a> •
        <a href="${APP_URL}/privacy" style="color: #10b981; text-decoration: none;">Privacy</a>
      </p>
      <p style="color: #404040; font-size: 11px; margin: 0;">
        You received this because you subscribed at autolytiqs.com<br>
        <a href="${unsubscribeUrl}" style="color: #737373; text-decoration: underline;">Unsubscribe from this list</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate plain text version
function generatePlainTextEmail(
  content: typeof NEWSLETTER_CONTENT[0],
  recipientName: string | null,
  unsubscribeUrl: string
): string {
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi there,";
  // Strip HTML tags for plain text
  const plainContent = content.mainContent
    .replace(/<h3[^>]*>/g, '\n\n## ')
    .replace(/<\/h3>/g, '\n')
    .replace(/<h4[^>]*>/g, '\n### ')
    .replace(/<\/h4>/g, '\n')
    .replace(/<p[^>]*>/g, '')
    .replace(/<\/p>/g, '\n')
    .replace(/<strong>/g, '*')
    .replace(/<\/strong>/g, '*')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<ol>/g, '')
    .replace(/<\/ol>/g, '')
    .replace(/<li>/g, '• ')
    .replace(/<\/li>/g, '\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `
AUTOLYTIQ WEEKLY - Week ${content.week}
================================

${content.headline}

${greeting}

${content.intro}

${plainContent}

---
💡 QUICK TIP
${content.tip}

---
👉 ${content.ctaText}: ${content.ctaUrl}

---
COMING NEXT WEEK
${content.nextWeekTeaser}

---
© ${new Date().getFullYear()} Autolytiq
${APP_URL}

Unsubscribe: ${unsubscribeUrl}
  `.trim();
}

// Send newsletter to a specific subscriber
export async function sendNewsletterToSubscriber(
  email: string,
  name: string | null,
  unsubscribeToken: string,
  weekNumber: number
): Promise<boolean> {
  const content = NEWSLETTER_CONTENT.find(c => c.week === weekNumber);

  if (!content) {
    console.error(`Newsletter content not found for week ${weekNumber}`);
    return false;
  }

  const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${unsubscribeToken}`;
  const htmlContent = generateNewsletterEmail(content, name, unsubscribeUrl);
  const textContent = generatePlainTextEmail(content, name, unsubscribeUrl);

  try {
    if (!resend) {
      console.log(`[DEV] Would send Week ${weekNumber} newsletter to: ${email}`);
      console.log(`Subject: ${content.subject}`);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: content.subject,
      html: htmlContent,
      text: textContent,
    });

    console.log(`Newsletter Week ${weekNumber} sent to: ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send newsletter to ${email}:`, error);
    return false;
  }
}

// Batch send newsletters (called by cron)
router.post("/send-batch", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.CRON_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const subscribers = leadsDb.getSubscribedLeads();
    let sentCount = 0;
    const errors: string[] = [];
    const maxWeek = NEWSLETTER_CONTENT.length;

    for (const sub of subscribers) {
      // Determine which week to send (next one after last sent)
      const nextWeek = sub.last_email_sent + 1;

      // Skip if they've received all newsletters
      if (nextWeek > maxWeek) {
        continue;
      }

      try {
        const success = await sendNewsletterToSubscriber(
          sub.email,
          sub.name,
          sub.unsubscribe_token,
          nextWeek
        );

        if (success) {
          leadsDb.updateLastEmailSent(sub.id, nextWeek);
          sentCount++;
        }
      } catch (err) {
        errors.push(`${sub.email}: ${(err as Error).message}`);
      }

      // Rate limiting: wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.json({
      sent: sentCount,
      totalSubscribers: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Newsletter batch send error:", error);
    res.status(500).json({ error: "Failed to send newsletters" });
  }
});

// Send specific week to specific email (admin/test)
router.post("/send-test", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.CRON_API_KEY || process.env.ADMIN_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email, week } = req.body;

  if (!email || !week) {
    return res.status(400).json({ error: "Email and week number required" });
  }

  const weekNum = parseInt(week);
  if (isNaN(weekNum) || weekNum < 1 || weekNum > NEWSLETTER_CONTENT.length) {
    return res.status(400).json({ error: `Week must be between 1 and ${NEWSLETTER_CONTENT.length}` });
  }

  try {
    // Generate a test unsubscribe token
    const testToken = "test_" + Math.random().toString(36).substring(7);
    const success = await sendNewsletterToSubscriber(email, null, testToken, weekNum);

    if (success) {
      res.json({ success: true, message: `Week ${weekNum} newsletter sent to ${email}` });
    } else {
      res.status(500).json({ error: "Failed to send newsletter" });
    }
  } catch (error) {
    console.error("Test newsletter send error:", error);
    res.status(500).json({ error: "Failed to send test newsletter" });
  }
});

// Get newsletter content (for preview)
router.get("/preview/:week", (req, res) => {
  const weekNum = parseInt(req.params.week);
  const content = NEWSLETTER_CONTENT.find(c => c.week === weekNum);

  if (!content) {
    return res.status(404).json({ error: "Newsletter not found" });
  }

  res.json({
    week: content.week,
    subject: content.subject,
    preheader: content.preheader,
    headline: content.headline,
  });
});

// List all newsletters
router.get("/list", (req, res) => {
  const list = NEWSLETTER_CONTENT.map(c => ({
    week: c.week,
    subject: c.subject,
    preheader: c.preheader,
  }));
  res.json({ count: list.length, newsletters: list });
});

export default router;
