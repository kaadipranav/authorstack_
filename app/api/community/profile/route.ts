// GET /api/community/profile - Get current user's profile
// PATCH /api/community/profile - Update current user's profile

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { communityService } from "@/lib/modules/community/application/community-services";
import { z } from "zod";

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  twitter_handle: z.string().max(50).optional(),
  instagram_handle: z.string().max(50).optional(),
  tiktok_handle: z.string().max(50).optional(),
  youtube_channel: z.string().max(100).optional(),
  visibility: z.enum(["public", "followers_only", "private"]).optional(),
  show_stats: z.boolean().optional(),
  show_books: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();

    const profile = await communityService.getAuthorProfile(session.id);

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

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const profile = await communityService.updateAuthorProfile(
      session.id,
      validation.data
    );

    if (!profile) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ data: profile });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
