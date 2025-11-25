// API Route: /api/promo/credits
// Get credit balance and transaction history

import { NextRequest, NextResponse } from "next/server";
import { leaderboardService } from "@/lib/modules/leaderboard/application/leaderboard-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get("action");

        if (action === "history") {
            // Get transaction history
            const page = parseInt(searchParams.get("page") || "1");
            const limit = parseInt(searchParams.get("limit") || "20");

            const history = await leaderboardService.getTransactionHistory(
                user.id,
                page,
                limit
            );

            return NextResponse.json(history);
        } else {
            // Get current balance
            const balance = await leaderboardService.getCreditBalance(user.id);

            return NextResponse.json({ balance });
        }
    } catch (error) {
        console.error("Error fetching credits:", error);
        return NextResponse.json(
            { error: "Failed to fetch credits" },
            { status: 500 }
        );
    }
}

// Award daily login credits
export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const action = body.action;

        if (action === "daily_login") {
            const creditsAwarded = await leaderboardService.awardDailyLoginCredits(
                user.id
            );

            return NextResponse.json({
                success: true,
                credits_awarded: creditsAwarded,
                balance: await leaderboardService.getCreditBalance(user.id),
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error processing credits:", error);
        return NextResponse.json(
            { error: "Failed to process credits" },
            { status: 500 }
        );
    }
}
