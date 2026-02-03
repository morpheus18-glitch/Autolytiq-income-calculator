import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// CSRF token store (in production, use session/Redis)
const csrfTokens: Map<string, { token: string; expires: number }> = new Map();

const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  csrfTokens.forEach((value, key) => {
    if (value.expires < now) {
      csrfTokens.delete(key);
    }
  });
}, 60000);

/**
 * Generate a CSRF token for the user
 */
export function generateCsrfToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + TOKEN_EXPIRY,
  });
  return token;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored || stored.expires < Date.now()) {
    return false;
  }
  // Use timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(stored.token),
      Buffer.from(token)
    );
  } catch {
    return false;
  }
}

/**
 * CSRF protection middleware
 * Checks for CSRF token in header or body for state-changing requests
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for safe methods
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Get session identifier (use IP + user agent as simple session ID for stateless apps)
  const sessionId = `${req.ip || "unknown"}-${req.get("user-agent") || "unknown"}`;

  // Get CSRF token from header or body
  const csrfToken =
    req.headers["x-csrf-token"] as string ||
    req.body?._csrf;

  // For API calls without established session, skip CSRF but ensure proper origin
  if (!csrfToken) {
    // Check origin header for API requests
    const origin = req.get("origin");
    const allowedOrigins = [
      "https://autolytiqs.com",
      "https://www.autolytiqs.com",
    ];

    if (process.env.NODE_ENV !== "production") {
      allowedOrigins.push("http://localhost:5000", "http://localhost:3000");
    }

    // If no origin (same-site request) or origin is allowed, proceed
    if (!origin || allowedOrigins.includes(origin)) {
      return next();
    }

    return res.status(403).json({ error: "Invalid request origin" });
  }

  if (!validateCsrfToken(sessionId, csrfToken)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  next();
}

/**
 * Endpoint to get a new CSRF token
 */
export function getCsrfTokenHandler(req: Request, res: Response) {
  const sessionId = `${req.ip || "unknown"}-${req.get("user-agent") || "unknown"}`;
  const token = generateCsrfToken(sessionId);
  res.json({ csrfToken: token });
}
