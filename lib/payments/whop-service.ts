import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { sendSubscriptionUpdated } from "@/lib/email/resend";

export type WhopSubscriptionStatus = "active" | "inactive" | "cancelled" | "past_due";

export interface WhopSubscriptionData {
  id: string;
  customerId: string;
  membershipId: string;
  planName: string;
  status: WhopSubscriptionStatus;
  currentPeriodEnd: string;
  rawPayload: Record<string, unknown>;
}

export interface WhopWebhookEvent {
  id: string;
  event: string;
  data: {
    id?: string;
    customer_id?: string;
    membership_id?: string;
    plan?: {
      name?: string;
    };
    status?: string;
    current_period_end?: string;
    [key: string]: unknown;
  };
  timestamp?: string;
}

export async function upsertWhopSubscription(
  profileId: string,
  subscriptionData: WhopSubscriptionData
): Promise<void> {
  const supabase = await createSupabaseServiceClient();

  const { error } = await supabase.from("whop_subscriptions").upsert(
    {
      profile_id: profileId,
      whop_membership_id: subscriptionData.membershipId,
      plan_name: subscriptionData.planName,
      status: subscriptionData.status,
      current_period_end: subscriptionData.currentPeriodEnd,
      raw_payload: subscriptionData.rawPayload,
    },
    { onConflict: "whop_membership_id" }
  );

  if (error) {
    throw new Error(`Failed to upsert Whop subscription: ${error.message}`);
  }
}

export async function updateProfileSubscriptionTier(
  profileId: string,
  tier: "free" | "pro" | "enterprise",
  planName?: string
): Promise<void> {
  const supabase = await createSupabaseServiceClient();

  // Get user email before updating
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", profileId)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({ subscription_tier: tier })
    .eq("id", profileId);

  if (error) {
    throw new Error(`Failed to update profile subscription tier: ${error.message}`);
  }

  // Send email notification
  if (profile?.email) {
    try {
      await sendSubscriptionUpdated(
        profile.email,
        tier,
        planName || `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`
      );
      console.log(`[Email] Subscription update email sent to ${profile.email}`);
    } catch (emailError) {
      console.error("[Email] Failed to send subscription update email:", emailError);
      // Don't throw - email failure shouldn't break the subscription update
    }
  }
}

export async function getProfileByWhopCustomerId(customerId: string): Promise<string | null> {
  const supabase = await createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("whop_customer_id", customerId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data?.id || null;
}

export async function linkWhopCustomer(profileId: string, customerId: string): Promise<void> {
  const supabase = await createSupabaseServiceClient();

  const { error } = await supabase
    .from("profiles")
    .update({ whop_customer_id: customerId })
    .eq("id", profileId);

  if (error) {
    throw new Error(`Failed to link Whop customer: ${error.message}`);
  }
}

export async function getWhopSubscription(membershipId: string): Promise<WhopSubscriptionData | null> {
  const supabase = await createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("whop_subscriptions")
    .select("*")
    .eq("whop_membership_id", membershipId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch subscription: ${error.message}`);
  }

  return {
    id: data.id,
    customerId: data.profile_id,
    membershipId: data.whop_membership_id,
    planName: data.plan_name,
    status: data.status,
    currentPeriodEnd: data.current_period_end,
    rawPayload: data.raw_payload,
  };
}

export function mapWhopStatusToTier(status: WhopSubscriptionStatus, planName: string): "free" | "pro" | "enterprise" {
  if (status === "cancelled" || status === "inactive") {
    return "free";
  }

  if (planName.toLowerCase().includes("enterprise")) {
    return "enterprise";
  }

  if (planName.toLowerCase().includes("pro")) {
    return "pro";
  }

  return "free";
}

export async function processWhopSubscriptionEvent(event: WhopWebhookEvent): Promise<{
  success: boolean;
  message: string;
  profileId?: string;
  error?: string;
}> {
  try {
    const eventType = event.event;
    const eventData = event.data;

    console.log(`[Whop] Processing event: ${eventType}`);

    if (!eventData.customer_id) {
      return {
        success: false,
        message: "Missing customer_id in webhook payload",
        error: "MISSING_CUSTOMER_ID",
      };
    }

    let profileId = await getProfileByWhopCustomerId(eventData.customer_id);

    if (!profileId && eventData.id) {
      console.warn(`[Whop] Profile not found for customer ${eventData.customer_id}, skipping event`);
      return {
        success: false,
        message: "Profile not found for this Whop customer",
        error: "PROFILE_NOT_FOUND",
      };
    }

    if (!profileId) {
      return {
        success: false,
        message: "Unable to link Whop customer to profile",
        error: "PROFILE_NOT_FOUND",
      };
    }

    const membershipId = eventData.membership_id || eventData.id;
    if (!membershipId) {
      return {
        success: false,
        message: "Missing membership_id in webhook payload",
        error: "MISSING_MEMBERSHIP_ID",
      };
    }

    const planName = eventData.plan?.name || "Unknown Plan";
    const status = (eventData.status as WhopSubscriptionStatus) || "inactive";
    const currentPeriodEnd = eventData.current_period_end || new Date().toISOString();

    const subscriptionData: WhopSubscriptionData = {
      id: membershipId,
      customerId: eventData.customer_id,
      membershipId,
      planName,
      status,
      currentPeriodEnd,
      rawPayload: eventData,
    };

    await upsertWhopSubscription(profileId, subscriptionData);

    const tier = mapWhopStatusToTier(status, planName);
    await updateProfileSubscriptionTier(profileId, tier, planName);

    console.log(`[Whop] ✓ Updated subscription for profile ${profileId}: ${tier}`);

    return {
      success: true,
      message: `Subscription updated: ${tier}`,
      profileId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Whop] ✗ Error processing event:`, errorMessage);
    return {
      success: false,
      message: "Failed to process subscription event",
      error: errorMessage,
    };
  }
}
