import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CommunityPageClient } from "./CommunityPageClient";

export default async function CommunityPage() {
  const session = await requireAuth();
  const supabase = await createClient();

  // Check if user has accepted guidelines
  const { data: profile } = await supabase
    .from("author_profiles")
    .select("guidelines_accepted_at")
    .eq("profile_id", session.id)
    .single();

  const hasAcceptedGuidelines = !!profile?.guidelines_accepted_at;

  return (
    <CommunityPageClient
      userId={session.id}
      hasAcceptedGuidelines={hasAcceptedGuidelines}
    />
  );
}
