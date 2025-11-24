// GET /api/community/notifications - Get user notifications
// PATCH /api/community/notifications - Mark notifications as read

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { communityService } from "@/lib/modules/community/application/community-services";
import { z } from "zod";

const notificationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const markReadSchema = z.object({
  notification_id: z.string().uuid().optional(),
  mark_all: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const validation = notificationQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { page, limit } = validation.data;

    const notifications = await communityService.getNotifications(
      session.id,
      page,
      limit
    );

    const unreadCount = await communityService.getUnreadNotificationCount(session.id);

    return NextResponse.json({
      data: notifications.data,
      pagination: notifications.pagination,
      unread_count: unreadCount,
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
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

    const validation = markReadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { notification_id, mark_all } = validation.data;

    let success = false;

    if (mark_all) {
      success = await communityService.markAllNotificationsAsRead(session.id);
    } else if (notification_id) {
      success = await communityService.markNotificationAsRead(notification_id, session.id);
    } else {
      return NextResponse.json(
        { error: "Must provide either notification_id or mark_all" },
        { status: 400 }
      );
    }

    if (!success) {
      return NextResponse.json(
        { error: "Failed to mark notification(s) as read" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
