// Google Analytics 4 event tracking + Server-side affiliate tracking
// Events are marked as "key events" in GA4 Admin > Events

type GtagCommand = "event" | "config" | "set" | "consent";

// Session ID for tracking
function getSessionId(): string {
  let sessionId = sessionStorage.getItem("autolytiq_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem("autolytiq_session_id", sessionId);
  }
  return sessionId;
}

// Track affiliate click to our server
async function trackAffiliateClickToServer(
  affiliateName: string,
  affiliateUrl: string,
  category: string,
  pageSource: string
): Promise<void> {
  try {
    await fetch("/api/affiliate/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliateName,
        affiliateUrl,
        category,
        pageSource,
        sessionId: getSessionId(),
      }),
    });
  } catch (error) {
    // Silent fail - don't block user interaction
    console.debug("Affiliate tracking failed:", error);
  }
}

// Track page view / session to our server
async function trackSessionToServer(page: string): Promise<void> {
  try {
    await fetch("/api/affiliate/track-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getSessionId(),
        page,
      }),
    });
  } catch (error) {
    console.debug("Session tracking failed:", error);
  }
}

declare global {
  interface Window {
    gtag?: (
      command: GtagCommand,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

// GA4 Measurement ID
const GA_MEASUREMENT_ID = "G-LHXY6T7KSK";

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// Track page view for SPA - sends to GA4 properly
export function trackPageView(pagePath: string, pageTitle: string): void {
  if (typeof window !== "undefined" && window.gtag) {
    // Update the page path and title for GA4
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.origin + pagePath,
    });
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

  affiliateClick: (affiliateName: string, category: string, affiliateUrl?: string, pageSource?: string) => {
    // Track to Google Analytics
    trackEvent("affiliate_click", {
      affiliate_name: affiliateName,
      category: category,
    });
    // Track to our server for detailed analytics
    if (affiliateUrl && pageSource) {
      trackAffiliateClickToServer(affiliateName, affiliateUrl, category, pageSource);
    }
  },

  newsletterSignup: (source: string) =>
    trackEvent("newsletter_signup", {
      source: source,
    }),

  // Page view tracking - uses gtag config for proper GA4 page view attribution
  pageView: (pagePath: string, pageTitle: string) => {
    trackPageView(pagePath, pageTitle);
    // Also track to our server for session analytics
    trackSessionToServer(pagePath);
  },

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
