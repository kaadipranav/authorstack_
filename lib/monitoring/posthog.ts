import { env } from "@/lib/env";

export function initPostHog(): void {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn("[PostHog] API key not configured, analytics disabled");
    return;
  }

  console.log("[PostHog] Initialized");
}

export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.log(`[PostHog] Event (not tracked): ${event}`, properties);
    return;
  }

  console.log(`[PostHog] Event tracked: ${event}`, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.log(`[PostHog] User identified (not tracked): ${userId}`);
    return;
  }

  console.log(`[PostHog] User identified: ${userId}`, properties);
}

export function resetUser(): void {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
    return;
  }

  console.log("[PostHog] User reset");
}

// Analytics events
export const analyticsEvents = {
  SIGNUP: "user_signup",
  LOGIN: "user_login",
  LOGOUT: "user_logout",
  CONNECT_PLATFORM: "platform_connected",
  DISCONNECT_PLATFORM: "platform_disconnected",
  CREATE_BOOK: "book_created",
  UPDATE_BOOK: "book_updated",
  DELETE_BOOK: "book_deleted",
  CREATE_LAUNCH: "launch_created",
  SYNC_SALES: "sales_synced",
  UPGRADE_SUBSCRIPTION: "subscription_upgraded",
  DOWNGRADE_SUBSCRIPTION: "subscription_downgraded",
  CANCEL_SUBSCRIPTION: "subscription_cancelled",
};
