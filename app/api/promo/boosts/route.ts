// API Route: /api/promo/boosts
// Manage promotional boosts

import { NextRequest, NextResponse } from "next/server";
import { leaderboardService } from "@/lib/modules/leaderboard/application/leaderboard-service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CreateBoostRequest } from "@/lib/modules/leaderboard/domain/types";

// GET - Get user's boost history or active boosts
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

        if (action === "active") {
            // Get all active boosts (public)
            const slotType = searchParams.get("slotType") as
                | "explore"
                | "community_feed"
                | "leaderboard_sidebar"
                | undefined;

            const boosts = await leaderboardService.getActiveBoosts(slotType);
            return NextResponse.json({ boosts });
        } else {
            // Get user's boost history
            const page = parseInt(searchParams.get("page") || "1");
            const limit = parseInt(searchParams.get("limit") || "20");

            const result = await leaderboardService.getUserBoosts(
                user.id,
                page,
                limit
            );

            return NextResponse.json(result);
        }
    } catch (error) {
        console.error("Error fetching boosts:", error);
        return NextResponse.json(
            { error: "Failed to fetch boosts" },
            { status: 500 }
        );
    }
}

// POST - Create a new boost
export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body: CreateBoostRequest = await request.json();

        // Validate request
        if (!body.book_id || !body.slot_type || !body.duration_hours) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate slot type
        if (
            !["explore", "community_feed", "leaderboard_sidebar"].includes(
                body.slot_type
            )
        ) {
            return NextResponse.json(
                { error: "Invalid slot type" },
                { status: 400 }
            );
        }

        // Validate duration
        if (body.duration_hours < 1 || body.duration_hours > 168) {
            // Max 7 days
            return NextResponse.json(
                { error: "Duration must be between 1 and 168 hours" },
                { status: 400 }
            );
        }

        // Create boost
        const result = await leaderboardService.createBoost(user.id, body);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error creating boost:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create boost" },
            { status: 400 }
        );
    }
}

// DELETE - Cancel a boost
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const boostId = searchParams.get("boostId");

        if (!boostId) {
            return NextResponse.json(
                { error: "Missing boost ID" },
                { status: 400 }
            );
        }

        const result = await leaderboardService.cancelBoost(boostId, user.id);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error cancelling boost:", error);
        return NextResponse.json(
            { error: error.message || "Failed to cancel boost" },
            { status: 400 }
        );
    }
}
