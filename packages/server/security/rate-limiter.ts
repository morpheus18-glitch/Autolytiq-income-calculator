import { Request, Response, NextFunction } from "express";
import redis from "../lib/redis";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * Create a rate limiter middleware using Redis
 */
export function createRateLimiter(name: string, config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = "Too many requests, please try again later",
    keyGenerator = (req: Request) => req.ip || req.socket.remoteAddress || "unknown",
  } = config;

  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction) => {
    const clientKey = keyGenerator(req);
    const redisKey = `ratelimit:${name}:${clientKey}`;

    try {
      const current = await redis.incr(redisKey);

      // Set expiry on first request
      if (current === 1) {
        await redis.expire(redisKey, windowSeconds);
      }

      // Get TTL for headers
      const ttl = await redis.ttl(redisKey);
      const resetTime = Math.ceil(Date.now() / 1000) + ttl;

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - current));
      res.setHeader("X-RateLimit-Reset", resetTime);

      if (current > maxRequests) {
        res.setHeader("Retry-After", ttl);
        return res.status(429).json({
          error: message,
          retryAfter: ttl,
        });
      }

      next();
    } catch (err) {
      // If Redis fails, allow the request (fail open) but log it
      console.error("Rate limiter Redis error:", err);
      next();
    }
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
 * Brute force protection - tracks failed attempts using Redis
 */
const LOCKOUT_DURATION = 30 * 60; // 30 minutes in seconds
const MAX_FAILED_ATTEMPTS = 5;

export async function recordFailedAttempt(key: string): Promise<boolean> {
  const redisKey = `bruteforce:${key}`;

  try {
    const current = await redis.incr(redisKey);

    if (current === 1) {
      // First failure, set initial expiry
      await redis.expire(redisKey, LOCKOUT_DURATION);
    }

    if (current >= MAX_FAILED_ATTEMPTS) {
      // Lock the account - reset TTL to full lockout duration
      await redis.expire(redisKey, LOCKOUT_DURATION);
      return true; // Account is now locked
    }

    return false;
  } catch (err) {
    console.error("Brute force Redis error:", err);
    return false;
  }
}

export async function isLocked(key: string): Promise<boolean> {
  const redisKey = `bruteforce:${key}`;

  try {
    const count = await redis.get(redisKey);
    return count !== null && parseInt(count) >= MAX_FAILED_ATTEMPTS;
  } catch (err) {
    console.error("Brute force check Redis error:", err);
    return false;
  }
}

export async function clearFailedAttempts(key: string): Promise<void> {
  const redisKey = `bruteforce:${key}`;

  try {
    await redis.del(redisKey);
  } catch (err) {
    console.error("Clear failed attempts Redis error:", err);
  }
}

export async function getLockTimeRemaining(key: string): Promise<number> {
  const redisKey = `bruteforce:${key}`;

  try {
    const ttl = await redis.ttl(redisKey);
    return ttl > 0 ? ttl : 0;
  } catch (err) {
    console.error("Get lock time Redis error:", err);
    return 0;
  }
}
