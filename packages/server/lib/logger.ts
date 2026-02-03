import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

// Create logger with appropriate configuration
export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
  base: {
    env: process.env.NODE_ENV || "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Request logging helper
export function logRequest(req: { method: string; url: string; ip?: string }, statusCode: number, duration: number) {
  logger.info({
    type: "request",
    method: req.method,
    url: req.url,
    statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
  });
}

// Error logging helper
export function logError(error: Error, context?: Record<string, unknown>) {
  logger.error({
    type: "error",
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

// Security event logging
export function logSecurityEvent(event: string, details: Record<string, unknown>) {
  logger.warn({
    type: "security",
    event,
    ...details,
  });
}

// Business event logging
export function logBusinessEvent(event: string, details: Record<string, unknown>) {
  logger.info({
    type: "business",
    event,
    ...details,
  });
}

export default logger;
