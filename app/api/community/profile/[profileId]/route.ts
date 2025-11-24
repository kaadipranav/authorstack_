// GET /api/community/profile/[profileId] - Get author profile by ID or slug

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { communityService } from "@/lib/modules/community/application/community-services";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    await requireAuth();
    const { profileId } = await params;

    // Try to get by slug first, then by profile ID
    let profile = await communityService.getAuthorProfileBySlug(profileId);
    
    if (!profile) {
      profile = await communityService.getAuthorProfile(profileId);
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
