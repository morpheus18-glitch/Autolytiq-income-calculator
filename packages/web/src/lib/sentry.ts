import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.log("[Sentry] No DSN configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,

    // Performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Session replay (free tier: 50 sessions/month)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],

    // Filter out noise
    beforeSend(event) {
      // Ignore ResizeObserver errors (common browser noise)
      if (event.message?.includes("ResizeObserver")) {
        return null;
      }
      return event;
    },
  });

  console.log("[Sentry] Initialized successfully");
}

// Capture error with context
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

// Set user context
export function setUser(user: { id: string; email?: string }) {
  if (!SENTRY_DSN) return;
  Sentry.setUser(user);
}

// Clear user context
export function clearUser() {
  if (!SENTRY_DSN) return;
  Sentry.setUser(null);
}

export default Sentry;
