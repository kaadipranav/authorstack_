import { env } from "@/lib/env";
import crypto from "crypto";

export interface WebhookSignatureVerificationResult {
  valid: boolean;
  reason?: string;
}

export async function verifyWhopWebhookSignature(
  payload: string,
  signature: string | null | undefined,
  timestamp: string | null | undefined
): Promise<WebhookSignatureVerificationResult> {
  if (!env.WHOP_WEBHOOK_SECRET) {
    console.warn("[Whop] WHOP_WEBHOOK_SECRET not configured, skipping signature verification");
    return {
      valid: true,
      reason: "Mock mode: signature verification disabled",
    };
  }

  if (!signature) {
    return {
      valid: false,
      reason: "Missing signature header",
    };
  }

  if (!timestamp) {
    return {
      valid: false,
      reason: "Missing timestamp header",
    };
  }

  const now = Math.floor(Date.now() / 1000);
  const webhookTimestamp = Math.floor(new Date(timestamp).getTime() / 1000);
  const timeDiff = Math.abs(now - webhookTimestamp);

  if (timeDiff > 300) {
    return {
      valid: false,
      reason: `Webhook timestamp too old: ${timeDiff}s difference`,
    };
  }

  const signedContent = `${timestamp}.${payload}`;

  const expectedSignature = crypto
    .createHmac("sha256", env.WHOP_WEBHOOK_SECRET)
    .update(signedContent)
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!isValid) {
    return {
      valid: false,
      reason: "Invalid signature",
    };
  }

  return {
    valid: true,
  };
}

export function extractWhopWebhookHeaders(request: Request): {
  signature: string | null;
  timestamp: string | null;
} {
  return {
    signature: request.headers.get("x-whop-signature") || request.headers.get("x-signature"),
    timestamp: request.headers.get("x-whop-timestamp") || request.headers.get("x-timestamp"),
  };
}

export async function logWebhookEvent(
  provider: string,
  eventType: string,
  profileId: string | null,
  signature: string | null,
  payload: Record<string, unknown>,
  status: "received" | "processed" | "failed",
  errorMessage?: string
): Promise<void> {
  const supabase = await import("@/lib/supabase/service").then((m) => m.createSupabaseServiceClient());

  await supabase.from("platform_webhook_events").insert({
    profile_id: profileId,
    provider,
    event_type: eventType,
    delivery_status: status,
    signature,
    payload,
    processed_at: status !== "received" ? new Date().toISOString() : null,
    error_message: errorMessage || null,
  });
}
