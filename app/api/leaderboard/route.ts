// API Route: GET /api/leaderboard
// Get leaderboard rankings with filters

import { NextRequest, NextResponse } from "next/server";
import { leaderboardService } from "@/lib/modules/leaderboard/application/leaderboard-service";
import { leaderboardRepository } from "@/lib/modules/leaderboard/infrastructure/supabase-repository";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Get query parameters
        const slug = searchParams.get("slug") || "weekly-authors-overall";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(
            parseInt(searchParams.get("limit") || "50"),
            100
        ); // Max 100

        // Get leaderboard
        const result = await leaderboardService.getLeaderboard(slug, page, limit);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json(
            { error: "Failed to fetch leaderboard" },
            { status: 500 }
        );
    }
}

// GET /api/leaderboard/list - Get all available leaderboards
export async function OPTIONS() {
    try {
        const leaderboards = await leaderboardRepository.getActiveLeaderboards();

        return NextResponse.json({
            leaderboards: leaderboards.map((lb) => ({
                slug: lb.slug,
                name: lb.name,
                type: lb.type,
                category: lb.category,
                time_window: lb.time_window,
            })),
        });
    } catch (error) {
        console.error("Error fetching leaderboards:", error);
        return NextResponse.json(
            { error: "Failed to fetch leaderboards" },
            { status: 500 }
        );
    }
}
