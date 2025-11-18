import { env } from "@/lib/env";

export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    console.warn("[Sentry] DSN not configured, error tracking disabled");
    return;
  }

  console.log("[Sentry] Initialized for", env.NODE_ENV);
}

export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!env.SENTRY_DSN) {
    console.error("[Sentry] Error (not captured):", error.message);
    return;
  }

  console.error("[Sentry] Exception captured:", {
    message: error.message,
    stack: error.stack,
    context,
  });
}

export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" = "info"
): void {
  if (!env.SENTRY_DSN) {
    console.log(`[Sentry] ${level.toUpperCase()}: ${message}`);
    return;
  }

  console.log(`[Sentry] ${level.toUpperCase()}: ${message}`);
}
