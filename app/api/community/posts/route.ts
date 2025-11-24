// POST /api/community/posts - Create new post
// GET /api/community/posts - Get feed (global or following)

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { communityService } from "@/lib/modules/community/application/community-services";
import { z } from "zod";

const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  book_id: z.string().uuid().optional(),
  post_type: z.enum(["text", "milestone", "announcement", "book_launch"]).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const feedQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  feed_type: z.enum(["global", "following"]).optional().default("following"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await request.json();

    const validation = createPostSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const post = await communityService.createPost(session.id, validation.data);

    if (!post) {
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try to get session, but don't require it for public viewing
    let session;
    try {
      session = await requireAuth();
    } catch {
      // No session - allow public viewing of global feed only
      session = null;
    }

    const { searchParams } = new URL(request.url);

    const validation = feedQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      feed_type: searchParams.get("feed_type"),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.issues },
        { status: 400 }
      );
    }

    // If no session and trying to access following feed, force global
    const feedType = !session && validation.data.feed_type === "following"
      ? "global"
      : validation.data.feed_type;

    const feed = await communityService.getFeed(
      session?.id || null,
      { ...validation.data, feed_type: feedType }
    );

    return NextResponse.json({ data: feed.data, pagination: feed.pagination });
  } catch (error: any) {
    console.error("Error fetching feed:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
