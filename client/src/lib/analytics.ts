// Google Analytics 4 event tracking
// Events are marked as "key events" in GA4 Admin > Events

type GtagCommand = "event" | "config" | "set" | "consent";

declare global {
  interface Window {
    gtag?: (
      command: GtagCommand,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// Key events for conversion tracking
export const analytics = {
  calculationComplete: (annualIncome: number) =>
    trackEvent("calculation_complete", {
      annual_income: annualIncome,
      currency: "USD",
    }),

  budgetComplete: (monthlyIncome: number, needs: number, wants: number, savings: number) =>
    trackEvent("budget_complete", {
      monthly_income: monthlyIncome,
      needs_percent: Math.round((needs / monthlyIncome) * 100),
      wants_percent: Math.round((wants / monthlyIncome) * 100),
      savings_percent: Math.round((savings / monthlyIncome) * 100),
    }),

  affiliateClick: (affiliateName: string, category: string) =>
    trackEvent("affiliate_click", {
      affiliate_name: affiliateName,
      category: category,
    }),

  newsletterSignup: (source: string) =>
    trackEvent("newsletter_signup", {
      source: source,
    }),

  // Page view tracking
  pageView: (pagePath: string, pageTitle: string) =>
    trackEvent("page_view", {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href,
    }),

  // Tool usage tracking
  toolUsage: (toolName: string, action: string) =>
    trackEvent("tool_usage", {
      tool_name: toolName,
      action: action,
    }),

  // Goal tracking
  goalCreated: (goalType: string, targetAmount: number) =>
    trackEvent("goal_created", {
      goal_type: goalType,
      target_amount: targetAmount,
    }),

  // Transaction tracking
  transactionAdded: (category: string, amount: number) =>
    trackEvent("transaction_added", {
      category: category,
      amount: amount,
    }),
};
