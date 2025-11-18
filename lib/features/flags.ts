import { env } from "@/lib/env";

export interface FeatureFlags {
  leaderboard: boolean;
  mascot: boolean;
  community: boolean;
  distribution: boolean;
}

let cachedFlags: FeatureFlags | null = null;

export function getFeatureFlags(): FeatureFlags {
  if (cachedFlags) {
    return cachedFlags;
  }

  try {
    const flagsJson = env.NEXT_PUBLIC_FEATURES;
    const flags = JSON.parse(flagsJson) as FeatureFlags;
    cachedFlags = flags;
    return flags;
  } catch (error) {
    console.error("[Features] Failed to parse feature flags:", error);
    return {
      leaderboard: false,
      mascot: false,
      community: false,
      distribution: false,
    };
  }
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature] ?? false;
}

export function getEnabledFeatures(): (keyof FeatureFlags)[] {
  const flags = getFeatureFlags();
  return (Object.keys(flags) as (keyof FeatureFlags)[]).filter(
    (key) => flags[key]
  );
}

export function logFeatureFlags(): void {
  const flags = getFeatureFlags();
  const enabled = getEnabledFeatures();
  console.log("[Features] Enabled features:", enabled.length > 0 ? enabled : "none");
}
