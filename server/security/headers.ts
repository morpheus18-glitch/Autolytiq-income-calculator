import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Security headers middleware
 * Implements OWASP recommended security headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Generate nonce for inline scripts (CSP)
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce;

  // Strict-Transport-Security: Force HTTPS
  // max-age=31536000 (1 year), includeSubDomains
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Content-Security-Policy: Prevent XSS and other injection attacks
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];
  res.setHeader("Content-Security-Policy", cspDirectives.join("; "));

  // X-Content-Type-Options: Prevent MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // X-Frame-Options: Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // X-XSS-Protection: Enable browser XSS filter (legacy, but still useful)
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy: Control referrer information
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy: Restrict browser features
  res.setHeader(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
  );

  // X-DNS-Prefetch-Control: Control DNS prefetching
  res.setHeader("X-DNS-Prefetch-Control", "off");

  // X-Download-Options: Prevent IE from executing downloads
  res.setHeader("X-Download-Options", "noopen");

  // X-Permitted-Cross-Domain-Policies: Restrict Adobe Flash/PDF
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

  // Cache-Control for API responses
  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
  }

  next();
}

/**
 * CORS configuration for security
 */
export function corsConfig(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    "https://autolytiqs.com",
    "https://www.autolytiqs.com",
  ];

  // Allow localhost in development
  if (process.env.NODE_ENV !== "production") {
    allowedOrigins.push("http://localhost:5000", "http://localhost:3000");
  }

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
}

/**
 * Sanitize request body to prevent XSS
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeString(item)
          : typeof item === "object" && item !== null
            ? sanitizeObject(item as Record<string, unknown>)
            : item
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function sanitizeString(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/\\/g, "&#x5C;")
    .replace(/`/g, "&#x60;");
}

/**
 * Block common attack patterns
 */
export function blockAttacks(req: Request, res: Response, next: NextFunction) {
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection
    /<script[^>]*>[\s\S]*?<\/script>/gi, // XSS script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /\.\.\//g, // Path traversal
    /union\s+select/gi, // SQL UNION attacks
    /exec\s*\(/gi, // Command execution
    /eval\s*\(/gi, // Eval execution
  ];

  const checkValue = (value: unknown): boolean => {
    if (typeof value === "string") {
      return suspiciousPatterns.some((pattern) => pattern.test(value));
    }
    if (Array.isArray(value)) {
      return value.some(checkValue);
    }
    if (typeof value === "object" && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  // Check URL
  if (suspiciousPatterns.some((pattern) => pattern.test(req.url))) {
    console.warn(`Blocked suspicious URL from ${req.ip}: ${req.url}`);
    return res.status(400).json({ error: "Invalid request" });
  }

  // Check body
  if (req.body && checkValue(req.body)) {
    console.warn(`Blocked suspicious request body from ${req.ip}`);
    return res.status(400).json({ error: "Invalid request" });
  }

  // Check query params
  if (req.query && checkValue(req.query)) {
    console.warn(`Blocked suspicious query params from ${req.ip}`);
    return res.status(400).json({ error: "Invalid request" });
  }

  next();
}
