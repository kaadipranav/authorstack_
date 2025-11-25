// Cron Job: Calculate Weekly Leaderboards
// Runs hourly to keep weekly leaderboards fresh

import { NextResponse } from "next/server";
import { leaderboardService } from "@/lib/modules/leaderboard/application/leaderboard-service";

export async function GET(request: Request) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const weeklyLeaderboards = [
            "weekly-authors-overall",
            "weekly-authors-fiction",
            "weekly-authors-nonfiction",
            "weekly-authors-romance",
            "weekly-authors-thriller",
            "weekly-authors-fantasy",
            "weekly-authors-selfhelp",
            "weekly-authors-business",
            "weekly-authors-ya",
            "weekly-authors-scifi",
            "weekly-authors-mystery",
            "weekly-authors-poetry",
            "weekly-authors-childrens",
        ];

        const results = [];

        for (const slug of weeklyLeaderboards) {
            try {
                await leaderboardService.calculateLeaderboard(slug);
                results.push({ slug, status: "success" });
            } catch (error: any) {
                console.error(`Failed to calculate ${slug}:`, error);
                results.push({ slug, status: "error", error: error.message });
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            results,
        });
    } catch (error: any) {
        console.error("Cron job error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
