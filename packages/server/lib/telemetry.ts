/**
 * OpenTelemetry Instrumentation for Autolytiq Server
 *
 * Provides:
 * - Automatic instrumentation for Express, HTTP, PostgreSQL
 * - Custom spans for calculation endpoints
 * - Metrics collection
 * - Export to OTLP collector (Jaeger, etc.)
 *
 * Must be imported FIRST before any other imports.
 */

import { NodeSDK, metrics as otelMetrics } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { Resource } from "@opentelemetry/resources";

const { PeriodicExportingMetricReader } = otelMetrics;
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions";
import {
  trace,
  context,
  SpanStatusCode,
  SpanKind,
  Span,
  Tracer,
} from "@opentelemetry/api";

// Configuration from environment
const config = {
  serviceName: process.env.OTEL_SERVICE_NAME || "autolytiq-server",
  serviceVersion: process.env.npm_package_version || "1.0.0",
  environment: process.env.NODE_ENV || "development",
  otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318",
  enabled: process.env.OTEL_ENABLED !== "false",
  sampleRate: parseFloat(process.env.OTEL_SAMPLE_RATE || "1.0"),
};

let sdk: NodeSDK | null = null;
let tracer: Tracer | null = null;

/**
 * Initialize OpenTelemetry SDK
 * Call this at the very start of your application, before other imports
 */
export function initTelemetry(): void {
  if (!config.enabled) {
    console.log("[Telemetry] Disabled via OTEL_ENABLED=false");
    return;
  }

  try {
    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: config.serviceName,
      [SEMRESATTRS_SERVICE_VERSION]: config.serviceVersion,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.environment,
    });

    const traceExporter = new OTLPTraceExporter({
      url: `${config.otlpEndpoint}/v1/traces`,
    });

    const metricExporter = new OTLPMetricExporter({
      url: `${config.otlpEndpoint}/v1/metrics`,
    });

    sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 60000, // Export every minute
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Customize instrumentation
          "@opentelemetry/instrumentation-express": {
            enabled: true,
          },
          "@opentelemetry/instrumentation-http": {
            enabled: true,
            ignoreIncomingPaths: ["/health", "/ready"],
          },
          "@opentelemetry/instrumentation-pg": {
            enabled: true,
            enhancedDatabaseReporting: true,
          },
          "@opentelemetry/instrumentation-redis": {
            enabled: true,
          },
          "@opentelemetry/instrumentation-fs": {
            enabled: false, // Too noisy
          },
        }),
      ],
    });

    sdk.start();
    tracer = trace.getTracer(config.serviceName, config.serviceVersion);

    console.log(`[Telemetry] Initialized - exporting to ${config.otlpEndpoint}`);

    // Graceful shutdown
    process.on("SIGTERM", () => {
      shutdownTelemetry().catch(console.error);
    });
  } catch (error) {
    console.error("[Telemetry] Failed to initialize:", error);
  }
}

/**
 * Shutdown telemetry gracefully
 */
export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    try {
      await sdk.shutdown();
      console.log("[Telemetry] Shutdown complete");
    } catch (error) {
      console.error("[Telemetry] Shutdown error:", error);
    }
  }
}

/**
 * Get the tracer instance
 */
export function getTracer(): Tracer {
  if (!tracer) {
    tracer = trace.getTracer(config.serviceName);
  }
  return tracer;
}

/**
 * Create a span for tracking a calculation
 */
export function withCalculationSpan<T>(
  calculationType: "income" | "auto" | "housing" | "budget",
  operation: string,
  fn: (span: Span) => T | Promise<T>
): Promise<T> {
  const activeTracer = getTracer();

  return activeTracer.startActiveSpan(
    `calculation.${calculationType}.${operation}`,
    {
      kind: SpanKind.INTERNAL,
      attributes: {
        "calculation.type": calculationType,
        "calculation.operation": operation,
      },
    },
    async (span) => {
      try {
        const result = await fn(span);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        });
        span.recordException(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        span.end();
      }
    }
  );
}

/**
 * Add attributes to the current span
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

/**
 * Record an event on the current span
 */
export function recordSpanEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>
): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

/**
 * Express middleware for request tracing
 */
export function telemetryMiddleware() {
  return (
    req: { method: string; path: string; query: Record<string, unknown>; headers: Record<string, string> },
    res: { on: (event: string, callback: () => void) => void; statusCode: number },
    next: () => void
  ) => {
    const span = trace.getActiveSpan();
    if (span) {
      // Add request attributes
      span.setAttributes({
        "http.method": req.method,
        "http.target": req.path,
        "http.user_agent": req.headers["user-agent"] || "unknown",
      });

      // Add query params (sanitized)
      const queryKeys = Object.keys(req.query || {});
      if (queryKeys.length > 0) {
        span.setAttribute("http.query_params", queryKeys.join(","));
      }

      // Track response
      res.on("finish", () => {
        span.setAttribute("http.status_code", res.statusCode);
      });
    }

    next();
  };
}

/**
 * Decorator for tracing async functions
 */
export function traced(
  spanName: string,
  attributes?: Record<string, string | number | boolean>
) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return getTracer().startActiveSpan(
        spanName,
        { kind: SpanKind.INTERNAL, attributes },
        async (span) => {
          try {
            const result = await originalMethod.apply(this, args);
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
          } catch (error) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error instanceof Error ? error.message : "Unknown error",
            });
            span.recordException(error instanceof Error ? error : new Error(String(error)));
            throw error;
          } finally {
            span.end();
          }
        }
      );
    };

    return descriptor;
  };
}

/**
 * Create custom metrics
 */
export const metrics = {
  /**
   * Record a calculation duration
   */
  recordCalculationDuration(
    type: string,
    durationMs: number,
    success: boolean
  ): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttribute("calculation.duration_ms", durationMs);
      span.setAttribute("calculation.success", success);
    }
  },

  /**
   * Record a calculation error
   */
  recordCalculationError(type: string, errorType: string): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttribute("calculation.error_type", errorType);
      span.addEvent("calculation_error", { type, error_type: errorType });
    }
  },

  /**
   * Record API call
   */
  recordApiCall(endpoint: string, method: string, statusCode: number): void {
    recordSpanEvent("api_call", {
      endpoint,
      method,
      status_code: statusCode,
    });
  },
};

// Export context for advanced usage
export { context, trace, SpanStatusCode, SpanKind };
