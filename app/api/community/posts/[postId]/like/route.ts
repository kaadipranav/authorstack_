// POST /api/community/posts/[postId]/like - Toggle like on post
// DELETE /api/community/posts/[postId]/like - Unlike post

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { communityService } from "@/lib/modules/community/application/community-services";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await requireAuth();
    const { postId } = await params;

    const success = await communityService.likePost(postId, session.id);

    if (!success) {
      return NextResponse.json({ error: "Failed to like post" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error liking post:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await requireAuth();
    const { postId } = await params;

    const success = await communityService.unlikePost(postId, session.id);

    if (!success) {
      return NextResponse.json({ error: "Failed to unlike post" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error unliking post:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
