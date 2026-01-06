import { Resend } from "resend";
import { summaryDb, statsDb, type UserStats } from "./db";

// Configure Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const APP_URL = process.env.APP_URL || "https://autolytiqs.com";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  try {
    if (!resend) {
      console.log("Resend not configured. Reset link:", resetUrl);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset Your Password - Income Calculator",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}"
             style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 12px;">
            Or copy this link: ${resetUrl}
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  name?: string
): Promise<boolean> {
  try {
    if (!resend) {
      console.log("Resend not configured. Welcome email would be sent to:", email);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to Income Calculator!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Welcome${name ? `, ${name}` : ""}!</h2>
          <p>Thanks for signing up for Income Calculator.</p>
          <p>You can now:</p>
          <ul>
            <li>Calculate your projected annual income</li>
            <li>See payment-to-income estimates</li>
            <li>Explore loan options by credit score</li>
          </ul>
          <a href="${APP_URL}"
             style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Open Calculator
          </a>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}

export async function sendNewsletterWelcomeEmail(
  email: string,
  name?: string,
  incomeRange?: string
): Promise<boolean> {
  const greeting = name ? `Hi ${name},` : "Hi there,";

  const getTipFocus = (range?: string) => {
    if (!range) return "building wealth";
    if (range === "150k+" || range === "100k-150k") return "wealth optimization and tax strategies";
    if (range === "75k-100k" || range === "50k-75k") return "accelerating your savings and investments";
    return "building a strong financial foundation";
  };

  const tipFocus = getTipFocus(incomeRange);

  try {
    if (!resend) {
      console.log("Resend not configured. Newsletter welcome email would be sent to:", email);
      console.log("Name:", name, "Income Range:", incomeRange);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Your Free Guide: 10 Ways to Maximize Your Income",
      text: `
${greeting}

Thank you for subscribing to Autolytiq!

Here's your free guide: 10 Ways to Maximize Your Income

1. Know Your Numbers - Use our calculator regularly to track your income trajectory.
2. Negotiate Your Salary - 78% of employers expect negotiation.
3. Optimize Your Tax Withholdings - Review your W-4 yearly.
4. Max Out Employer 401(k) Match - This is free money.
5. Build Multiple Income Streams - Diversify beyond your paycheck.
6. Invest in Yourself - Skills increase your market value.
7. Review Your Benefits Package - Don't leave money on the table.
8. Monitor Your Credit Score - Good credit = lower interest rates.
9. Automate Your Savings - Pay yourself first.
10. Track Your Net Worth - What gets measured gets managed.

Calculate your income now: ${APP_URL}

You'll receive our weekly newsletter with exclusive tips on ${tipFocus}.

---
Autolytiq - Free Income Calculator
${APP_URL}
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f0f; border: 1px solid #1a1a1a;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        Welcome to Autolytiq!
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        Your journey to ${tipFocus} starts now
      </p>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        ${greeting}
      </p>
      <p style="color: #a3a3a3; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
        Thank you for subscribing! As promised, here's your exclusive guide to maximizing your income.
      </p>

      <!-- Guide Box -->
      <div style="background-color: #171717; border: 1px solid #262626; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
        <h2 style="color: #10b981; font-size: 20px; margin: 0 0 20px 0;">
          10 Ways to Maximize Your Income
        </h2>

        <div style="color: #d4d4d4; font-size: 14px; line-height: 1.8;">
          <p style="margin: 0 0 15px 0;"><strong style="color: #10b981;">1. Know Your Numbers</strong><br>
          Use our calculator regularly to track your income trajectory. Understanding your daily rate helps with negotiations.</p>

          <p style="margin: 0 0 15px 0;"><strong style="color: #10b981;">2. Negotiate Your Salary</strong><br>
          78% of employers expect negotiation. Armed with your projected annual income, you have leverage.</p>

          <p style="margin: 0 0 15px 0;"><strong style="color: #10b981;">3. Optimize Your Tax Withholdings</strong><br>
          Review your W-4 yearly. Over-withholding means giving the government an interest-free loan.</p>

          <p style="margin: 0 0 15px 0;"><strong style="color: #10b981;">4. Max Out Employer 401(k) Match</strong><br>
          This is free money. If your employer matches 4%, contribute at least 4%.</p>

          <p style="margin: 0 0 15px 0;"><strong style="color: #10b981;">5. Build Multiple Income Streams</strong><br>
          Side hustles, dividends, rental income - diversify beyond your paycheck.</p>

          <p style="margin: 0 0 15px 0;"><strong style="color: #10b981;">6. Invest in Yourself</strong><br>
          Skills that increase your market value: certifications, courses, networking.</p>

          <p style="margin: 0 0 15px 0;"><strong style="color: #10b981;">7. Review Your Benefits Package</strong><br>
          HSA, FSA, commuter benefits - unused benefits are money left on the table.</p>

          <p style="margin: 0 0 15px 0;"><strong style="color: #10b981;">8. Monitor Your Credit Score</strong><br>
          Good credit = lower interest rates = more money in your pocket.</p>

          <p style="margin: 0 0 15px 0;"><strong style="color: #10b981;">9. Automate Your Savings</strong><br>
          Pay yourself first. Set up automatic transfers to savings and investments.</p>

          <p style="margin: 0;"><strong style="color: #10b981;">10. Track Your Net Worth</strong><br>
          What gets measured gets managed. Review monthly to stay on track.</p>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}"
           style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Calculate Your Income Now
        </a>
      </div>

      <!-- What's Next -->
      <div style="background-color: #171717; border-left: 3px solid #10b981; padding: 20px; margin-top: 30px;">
        <h3 style="color: #e5e5e5; font-size: 16px; margin: 0 0 10px 0;">What's Next?</h3>
        <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0;">
          You'll receive our weekly newsletter with exclusive tips on ${tipFocus}.
          Each email is packed with actionable advice to help you grow your wealth.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #1a1a1a;">
      <p style="color: #525252; font-size: 12px; margin: 0 0 10px 0;">
        © ${new Date().getFullYear()} Autolytiq. All rights reserved.
      </p>
      <p style="color: #404040; font-size: 11px; margin: 0;">
        You're receiving this because you signed up at autolytiqs.com<br>
        <a href="${APP_URL}/privacy" style="color: #10b981; text-decoration: none;">Privacy Policy</a> |
        <a href="${APP_URL}/terms" style="color: #10b981; text-decoration: none;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("Newsletter welcome email sent to:", email);
    return true;
  } catch (error) {
    console.error("Failed to send newsletter welcome email:", error);
    return false;
  }
}

export interface WeeklySummaryData {
  userId: string;
  email: string;
  name?: string;
  startDate: string;
  endDate: string;
  totalSpent: number;
  needsTotal: number;
  wantsTotal: number;
  savingsTotal: number;
  transactionCount: number;
  topMerchants: Array<{ merchant: string; total: number; count: number }>;
  stats: UserStats | null;
  budgetGoal?: number;
}

export async function sendWeeklySummaryEmail(data: WeeklySummaryData): Promise<boolean> {
  const greeting = data.name ? `Hi ${data.name},` : "Hi there,";

  // Calculate percentages
  const total = data.totalSpent || 1;
  const needsPercent = Math.round((data.needsTotal / total) * 100);
  const wantsPercent = Math.round((data.wantsTotal / total) * 100);
  const savingsPercent = Math.round((data.savingsTotal / total) * 100);

  // Determine if under budget
  const isUnderBudget = data.budgetGoal ? data.totalSpent <= data.budgetGoal : false;
  const budgetStatus = data.budgetGoal
    ? isUnderBudget
      ? `Under budget by ${formatCurrency(data.budgetGoal - data.totalSpent)}`
      : `Over budget by ${formatCurrency(data.totalSpent - data.budgetGoal)}`
    : "";

  // Format top merchants
  const topMerchantsHtml = data.topMerchants
    .map(
      (m, i) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #262626; color: #a3a3a3;">${i + 1}. ${m.merchant}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #262626; color: #e5e5e5; text-align: right; font-family: monospace;">${formatCurrency(m.total)}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #262626; color: #737373; text-align: right;">${m.count}x</td>
      </tr>
    `
    )
    .join("");

  // Gamification section
  const streakEmoji = data.stats?.current_streak && data.stats.current_streak >= 7 ? "🔥" : "📊";
  const streakHtml = data.stats
    ? `
    <div style="background-color: #171717; border-radius: 8px; padding: 16px; margin-top: 20px;">
      <h3 style="color: #10b981; font-size: 14px; margin: 0 0 12px 0;">${streakEmoji} Your Stats</h3>
      <div style="display: flex; gap: 16px;">
        <div style="text-align: center;">
          <div style="color: #10b981; font-size: 24px; font-weight: bold;">${data.stats.current_streak}</div>
          <div style="color: #737373; font-size: 11px;">Day Streak</div>
        </div>
        <div style="text-align: center;">
          <div style="color: #3b82f6; font-size: 24px; font-weight: bold;">${data.stats.total_transactions_logged}</div>
          <div style="color: #737373; font-size: 11px;">Total Logged</div>
        </div>
        <div style="text-align: center;">
          <div style="color: #f59e0b; font-size: 24px; font-weight: bold;">${data.stats.weeks_under_budget}</div>
          <div style="color: #737373; font-size: 11px;">Weeks Under Budget</div>
        </div>
      </div>
    </div>
  `
    : "";

  try {
    if (!resend) {
      console.log("Resend not configured. Weekly summary would be sent to:", data.email);
      return true;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Your Week in Spending: ${formatCurrency(data.totalSpent)} spent`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f0f0f; border: 1px solid #1a1a1a;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
        Weekly Spending Summary
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">
        ${data.startDate} - ${data.endDate}
      </p>
    </div>

    <!-- Main Content -->
    <div style="padding: 30px;">
      <p style="color: #e5e5e5; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
        ${greeting}
      </p>

      <!-- Total Spent Hero -->
      <div style="background-color: #171717; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <div style="color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Total Spent This Week</div>
        <div style="color: #10b981; font-size: 42px; font-weight: bold; font-family: monospace; margin: 8px 0;">
          ${formatCurrency(data.totalSpent)}
        </div>
        <div style="color: #a3a3a3; font-size: 13px;">
          ${data.transactionCount} transactions logged
          ${budgetStatus ? `<br><span style="color: ${isUnderBudget ? "#10b981" : "#ef4444"};">${budgetStatus}</span>` : ""}
        </div>
      </div>

      <!-- 50/30/20 Breakdown -->
      <div style="background-color: #171717; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="color: #e5e5e5; font-size: 14px; margin: 0 0 16px 0;">Spending Breakdown</h3>

        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #10b981; font-size: 13px;">Needs (${needsPercent}%)</span>
            <span style="color: #e5e5e5; font-family: monospace;">${formatCurrency(data.needsTotal)}</span>
          </div>
          <div style="background-color: #262626; border-radius: 4px; height: 8px; overflow: hidden;">
            <div style="background-color: #10b981; height: 100%; width: ${Math.min(needsPercent, 100)}%;"></div>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #3b82f6; font-size: 13px;">Wants (${wantsPercent}%)</span>
            <span style="color: #e5e5e5; font-family: monospace;">${formatCurrency(data.wantsTotal)}</span>
          </div>
          <div style="background-color: #262626; border-radius: 4px; height: 8px; overflow: hidden;">
            <div style="background-color: #3b82f6; height: 100%; width: ${Math.min(wantsPercent, 100)}%;"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #f59e0b; font-size: 13px;">Savings (${savingsPercent}%)</span>
            <span style="color: #e5e5e5; font-family: monospace;">${formatCurrency(data.savingsTotal)}</span>
          </div>
          <div style="background-color: #262626; border-radius: 4px; height: 8px; overflow: hidden;">
            <div style="background-color: #f59e0b; height: 100%; width: ${Math.min(savingsPercent, 100)}%;"></div>
          </div>
        </div>
      </div>

      <!-- Top Merchants -->
      ${
        data.topMerchants.length > 0
          ? `
      <div style="background-color: #171717; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="color: #e5e5e5; font-size: 14px; margin: 0 0 12px 0;">Top Spending</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${topMerchantsHtml}
        </table>
      </div>
      `
          : ""
      }

      <!-- Gamification Stats -->
      ${streakHtml}

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/smart-money"
           style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          View Full Budget
        </a>
      </div>

      <!-- Tip of the Week -->
      <div style="background-color: #171717; border-left: 3px solid #10b981; padding: 16px; margin-top: 20px;">
        <h3 style="color: #e5e5e5; font-size: 13px; margin: 0 0 8px 0;">💡 Tip of the Week</h3>
        <p style="color: #a3a3a3; font-size: 13px; line-height: 1.5; margin: 0;">
          ${
            wantsPercent > 35
              ? "Your 'Wants' spending is above 30%. Try the 24-hour rule: wait a day before non-essential purchases over $50."
              : needsPercent > 55
                ? "Your 'Needs' are taking up more than 50%. Review subscriptions and utilities for potential savings."
                : "Great job keeping your spending balanced! Consider increasing your savings rate by even 1%."
          }
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #0a0a0a; padding: 24px; text-align: center; border-top: 1px solid #1a1a1a;">
      <p style="color: #525252; font-size: 11px; margin: 0 0 8px 0;">
        © ${new Date().getFullYear()} Autolytiq. Keep tracking, keep growing.
      </p>
      <p style="color: #404040; font-size: 10px; margin: 0;">
        <a href="${APP_URL}/settings" style="color: #10b981; text-decoration: none;">Manage email preferences</a> |
        <a href="${APP_URL}/privacy" style="color: #10b981; text-decoration: none;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("Weekly summary email sent to:", data.email);
    return true;
  } catch (error) {
    console.error("Failed to send weekly summary email:", error);
    return false;
  }
}

export function getWeeklyEmailData(
  userId: string,
  startDate: string,
  endDate: string
): { needsTotal: number; wantsTotal: number; savingsTotal: number; totalSpent: number; transactionCount: number } {
  try {
    const results = summaryDb.getWeeklySummary.all(userId, startDate, endDate) as Array<{
      category: string;
      transaction_count: number;
      total_spent: number;
    }>;

    let needsTotal = 0;
    let wantsTotal = 0;
    let savingsTotal = 0;
    let transactionCount = 0;

    for (const row of results) {
      transactionCount += row.transaction_count;
      if (row.category === "needs") needsTotal = row.total_spent || 0;
      if (row.category === "wants") wantsTotal = row.total_spent || 0;
      if (row.category === "savings") savingsTotal = row.total_spent || 0;
    }

    return {
      needsTotal,
      wantsTotal,
      savingsTotal,
      totalSpent: needsTotal + wantsTotal + savingsTotal,
      transactionCount,
    };
  } catch (error) {
    console.error("Failed to get weekly email data:", error);
    return { needsTotal: 0, wantsTotal: 0, savingsTotal: 0, totalSpent: 0, transactionCount: 0 };
  }
}
