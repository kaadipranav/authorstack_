// API Route: GET /api/leaderboard/[slug]
// Get specific leaderboard by slug

import { NextRequest, NextResponse } from "next/server";
import { leaderboardService } from "@/lib/modules/leaderboard/application/leaderboard-service";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const searchParams = request.nextUrl.searchParams;

        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(
            parseInt(searchParams.get("limit") || "50"),
            100
        );

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
