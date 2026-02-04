import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { securityHeaders, corsConfig, sanitizeInput, blockAttacks } from "./security/headers";
import { apiRateLimiter } from "./security/rate-limiter";
import { initSentry, captureError, sentryRequestHandler, sentryErrorHandler } from "./lib/sentry";
import { logger, logRequest, logError } from "./lib/logger";
import { initializeDatabase } from "./db-postgres";

// Initialize Sentry early
initSentry();

// Initialize PostgreSQL
initializeDatabase().catch((err) => {
  logger.error({ err }, "Failed to initialize PostgreSQL");
});

const app = express();
const httpServer = createServer(app);

// Track server state for graceful shutdown
let isShuttingDown = false;

// Trust proxy for accurate IP detection (required for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Canonical URL redirect middleware (www → non-www, HTTP → HTTPS)
// Must be early in the chain to redirect before other processing
const CANONICAL_HOST = "autolytiqs.com";
const SEO_BYPASS_PATHS = ["/sitemap.xml", "/sitemap-index.xml", "/robots.txt"];
app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip in development
  if (process.env.NODE_ENV !== "production") {
    return next();
  }

  // Never redirect critical SEO files — bots must always get 200
  if (SEO_BYPASS_PATHS.includes(req.path)) {
    return next();
  }

  const host = req.hostname || req.headers.host?.split(":")[0] || "";
  const protocol = req.protocol || (req.headers["x-forwarded-proto"] as string) || "http";

  const isWww = host.startsWith("www.");
  const isHttp = protocol === "http";

  // Redirect if www or http
  if (isWww || isHttp) {
    const canonicalUrl = `https://${CANONICAL_HOST}${req.originalUrl}`;
    return res.redirect(301, canonicalUrl);
  }

  next();
});

// Security middleware - apply early in the chain
app.use(corsConfig);
app.use(securityHeaders);

app.use(express.json({ limit: "10kb" })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// Input sanitization and attack blocking
app.use(sanitizeInput);
app.use(blockAttacks);

// Apply general API rate limiting
app.use("/api", apiRateLimiter);

// Reject new requests during shutdown
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.status(503).json({ error: "Server is shutting down" });
    return;
  }
  next();
});

export function log(message: string, source = "express") {
  logger.info({ source }, message);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  // Sentry error handler (must be before other error handlers)
  app.use(sentryErrorHandler);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { status?: number }).status || 500;
    const message = err.message || "Internal Server Error";

    // Log and capture error
    logError(err, { status, url: _req.url, method: _req.method });
    if (status >= 500) {
      captureError(err, { url: _req.url, method: _req.method });
    }

    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
    // Signal PM2 that we're ready
    if (process.send) {
      process.send("ready");
    }
  });

  // Graceful shutdown handler
  const gracefulShutdown = (signal: string) => {
    log(`${signal} received, starting graceful shutdown...`);
    isShuttingDown = true;

    // Stop accepting new connections
    httpServer.close((err) => {
      if (err) {
        log(`Error during shutdown: ${err.message}`);
        process.exit(1);
      }
      log("All connections closed, exiting");
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      log("Forcing shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Uncaught exception handlers
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught Exception");
    captureError(err, { type: "uncaughtException" });
    // Give time to log and send to Sentry, then exit (PM2 will restart)
    setTimeout(() => process.exit(1), 1000);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error({ reason, promise }, "Unhandled Rejection");
    if (reason instanceof Error) {
      captureError(reason, { type: "unhandledRejection" });
    }
  });
})();
