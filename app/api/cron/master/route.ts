import { NextResponse } from "next/server";

/**
 * POST /api/cron/master
 * Master cron job that orchestrates all scheduled tasks
 * Runs once daily at midnight
 * 
 * This bypasses Vercel's 2 cron job limit on Hobby tier
 * Note: Hobby tier only allows daily crons, not frequent intervals
 */
export async function POST(request: Request) {
    const cronSecret = request.headers.get("authorization");
    const vercelCronSecret = request.headers.get("x-vercel-cron-secret");

    const isAuthorized =
        (cronSecret && cronSecret === process.env.CRON_SECRET) ||
        (vercelCronSecret && vercelCronSecret === process.env.CRON_SECRET);

    if (!isAuthorized) {
        console.warn("[Cron] Unauthorized master cron request");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const results: Record<string, any> = {};

    console.log(`[Cron] Master cron executing at ${now.toISOString()}`);

    try {
        // Run all jobs sequentially

        // 1. Ingestion - Process pending ingestion jobs
        console.log("[Cron] Running ingestion...");
        const ingestionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ingestion/cron`, {
            method: "POST",
            headers: {
                "authorization": process.env.CRON_SECRET || "",
            },
        });
        results.ingestion = await ingestionResponse.json();

        // 2. Analytics - Aggregate yesterday's sales data
        console.log("[Cron] Running analytics aggregation...");
        const analyticsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/analytics`, {
            method: "POST",
            headers: {
                "authorization": process.env.CRON_SECRET || "",
            },
        });
        results.analytics = await analyticsResponse.json();

        // 3. Leaderboard - Calculate weekly rankings
        console.log("[Cron] Running leaderboard calculation...");
        const leaderboardResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/leaderboard-weekly`, {
            method: "POST",
            headers: {
                "authorization": process.env.CRON_SECRET || "",
            },
        });
        results.leaderboard = await leaderboardResponse.json();

        // 4. Boost Status - Update expired boosts
        console.log("[Cron] Running boost status update...");
        const boostResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/boost-status`, {
            method: "POST",
            headers: {
                "authorization": process.env.CRON_SECRET || "",
            },
        });
        results.boostStatus = await boostResponse.json();

        console.log(`[Cron] ✓ Master cron completed successfully`);

        return NextResponse.json({
            status: "success",
            timestamp: now.toISOString(),
            executedJobs: Object.keys(results),
            results,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[Cron] Master cron error:", errorMessage);

        return NextResponse.json(
            {
                status: "error",
                message: "Master cron failed",
                error: errorMessage,
                timestamp: now.toISOString(),
                partialResults: results,
            },
            { status: 500 }
        );
    }
}
