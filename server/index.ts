import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { securityHeaders, corsConfig, sanitizeInput, blockAttacks } from "./security/headers";
import { apiRateLimiter } from "./security/rate-limiter";

const app = express();
const httpServer = createServer(app);

// Track server state for graceful shutdown
let isShuttingDown = false;

// Trust proxy for accurate IP detection (required for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

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
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
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

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { status?: number }).status || 500;
    const message = err.message || "Internal Server Error";
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
    log(`Uncaught Exception: ${err.message}`, "error");
    console.error(err.stack);
    // Give time to log, then exit (PM2 will restart)
    setTimeout(() => process.exit(1), 1000);
  });

  process.on("unhandledRejection", (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, "error");
  });
})();
