import { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// In-memory store (use Redis in production for multi-instance)
const stores: Map<string, Map<string, RateLimitEntry>> = new Map();

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name)!;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  stores.forEach((store) => {
    store.forEach((entry, key) => {
      if (entry.resetTime < now) {
        store.delete(key);
      }
    });
  });
}, 60000); // Cleanup every minute

/**
 * Create a rate limiter middleware
 */
export function createRateLimiter(name: string, config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = "Too many requests, please try again later",
    keyGenerator = (req: Request) => req.ip || req.socket.remoteAddress || "unknown",
  } = config;

  const store = getStore(name);

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      store.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - entry.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetTime / 1000));

    if (entry.count > maxRequests) {
      res.setHeader("Retry-After", Math.ceil((entry.resetTime - now) / 1000));
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    }

    next();
  };
}

// Pre-configured rate limiters for common use cases

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export const authRateLimiter = createRateLimiter("auth", {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: "Too many login attempts. Please try again in 15 minutes.",
});

/**
 * Moderate rate limiter for password reset
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = createRateLimiter("password-reset", {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: "Too many password reset requests. Please try again later.",
});

/**
 * Standard API rate limiter
 * 100 requests per minute per IP
 */
export const apiRateLimiter = createRateLimiter("api", {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: "Rate limit exceeded. Please slow down.",
});

/**
 * Strict rate limiter for signup
 * 3 accounts per hour per IP
 */
export const signupRateLimiter = createRateLimiter("signup", {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: "Too many signup attempts. Please try again later.",
});

/**
 * Rate limiter for file uploads
 * 10 uploads per minute per user
 */
export const uploadRateLimiter = createRateLimiter("upload", {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: "Too many uploads. Please wait before uploading more files.",
});

/**
 * Brute force protection - tracks failed attempts
 */
const failedAttempts: Map<string, { count: number; lockUntil: number }> = new Map();

export function recordFailedAttempt(key: string): boolean {
  const now = Date.now();
  let entry = failedAttempts.get(key);

  if (!entry || entry.lockUntil < now) {
    entry = { count: 0, lockUntil: 0 };
    failedAttempts.set(key, entry);
  }

  entry.count++;

  // Lock after 5 failed attempts for 30 minutes
  if (entry.count >= 5) {
    entry.lockUntil = now + 30 * 60 * 1000;
    return true; // Account is now locked
  }

  return false;
}

export function isLocked(key: string): boolean {
  const entry = failedAttempts.get(key);
  if (!entry) return false;
  return entry.lockUntil > Date.now();
}

export function clearFailedAttempts(key: string): void {
  failedAttempts.delete(key);
}

export function getLockTimeRemaining(key: string): number {
  const entry = failedAttempts.get(key);
  if (!entry) return 0;
  const remaining = entry.lockUntil - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}
