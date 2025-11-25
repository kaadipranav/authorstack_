// API Route: /api/badges
// Get badges for a user or all active badges

import { NextRequest, NextResponse } from "next/server";
import { leaderboardService } from "@/lib/modules/leaderboard/application/leaderboard-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get("userId");

        if (userId) {
            // Get badges for specific user
            const badges = await leaderboardService.getAuthorBadges(userId);
            return NextResponse.json({ badges });
        } else {
            // Get all active badges
            const badges = await leaderboardService.getActiveBadges();
            return NextResponse.json({ badges });
        }
    } catch (error) {
        console.error("Error fetching badges:", error);
        return NextResponse.json(
            { error: "Failed to fetch badges" },
            { status: 500 }
        );
    }
}
