// GET /api/community/posts/[postId]/comments - Get comments for post
// POST /api/community/posts/[postId]/comments - Create comment

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { communityService } from "@/lib/modules/community/application/community-services";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1).max(1000),
  parent_comment_id: z.string().uuid().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await requireAuth();
    const { postId } = await params;

    const comments = await communityService.getComments(postId);

    return NextResponse.json({ data: comments });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await requireAuth();
    const { postId } = await params;
    const body = await request.json();

    const validation = createCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const comment = await communityService.createComment(session.id, {
      post_id: postId,
      ...validation.data,
    });

    if (!comment) {
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
