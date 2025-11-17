export type PlatformProvider = "amazon_kdp" | "gumroad" | "whop" | "shopify";

export interface PlatformConnection {
  id: string;
  provider: PlatformProvider;
  status: "connected" | "pending" | "error";
  lastSyncedAt?: string;
}

