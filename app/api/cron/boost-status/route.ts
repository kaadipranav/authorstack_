// Cron Job: Update Boost Statuses
// Runs every 5 minutes to activate scheduled boosts and complete expired ones

import { NextResponse } from "next/server";
import { leaderboardService } from "@/lib/modules/leaderboard/application/leaderboard-service";

export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Update boost statuses
        const updatedCount = await leaderboardService.updateBoostStatuses();

        // Expire old badges
        const expiredBadges = await leaderboardService.expireOldBadges();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            boosts_updated: updatedCount,
            badges_expired: expiredBadges,
        });
    } catch (error: any) {
        console.error("Cron job error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
