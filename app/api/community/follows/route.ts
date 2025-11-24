// POST /api/community/follows - Follow a user
// DELETE /api/community/follows - Unfollow a user
// GET /api/community/follows - Get followers/following list

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { communityService } from "@/lib/modules/community/application/community-services";
import { z } from "zod";

const followSchema = z.object({
  following_id: z.string().uuid(),
});

const followQuerySchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum(["followers", "following"]),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const validation = followSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const success = await communityService.followUser(
      session.id,
      validation.data.following_id
    );

    if (!success) {
      return NextResponse.json({ error: "Failed to follow user" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const validation = followSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const success = await communityService.unfollowUser(
      session.id,
      validation.data.following_id
    );

    if (!success) {
      return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);

    const validation = followQuerySchema.safeParse({
      user_id: searchParams.get("user_id"),
      type: searchParams.get("type"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { user_id, type, page, limit } = validation.data;

    const result =
      type === "followers"
        ? await communityService.getFollowers(user_id, page, limit)
        : await communityService.getFollowing(user_id, page, limit);

    return NextResponse.json({ data: result.data, pagination: result.pagination });
  } catch (error: any) {
    console.error("Error fetching follows:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
