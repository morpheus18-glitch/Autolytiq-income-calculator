import * as Sentry from "@sentry/node";

const SENTRY_DSN = process.env.SENTRY_DSN;

export function initSentry() {
  if (!SENTRY_DSN) {
    console.log("[Sentry] No DSN configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Release tracking
    release: process.env.npm_package_version || "1.0.0",

    // Filter out non-errors
    beforeSend(event, hint) {
      // Don't send 404s or rate limit errors
      const error = hint.originalException as Error;
      if (error?.message?.includes("Not Found") || error?.message?.includes("Rate limit")) {
        return null;
      }
      return event;
    },

    // Integrations
    integrations: [
      // Capture unhandled promise rejections
      Sentry.captureConsoleIntegration(),
    ],
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

// Capture message
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  if (!SENTRY_DSN) return;
  Sentry.captureMessage(message, level);
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

// Express error handler middleware
export const sentryErrorHandler = Sentry.Handlers?.errorHandler?.() || ((err: Error, _req: unknown, _res: unknown, next: (err?: Error) => void) => next(err));

// Express request handler middleware
export const sentryRequestHandler = Sentry.Handlers?.requestHandler?.() || ((_req: unknown, _res: unknown, next: () => void) => next());

export default Sentry;
