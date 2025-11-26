import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { credits, price } = await request.json();

        if (!credits || !price) {
            return NextResponse.json(
                { error: "Missing credits or price" },
                { status: 400 }
            );
        }

        // Get user profile to link Whop customer
        const { data: profile } = await supabase
            .from("profiles")
            .select("id, email, whop_customer_id")
            .eq("id", user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // In a real implementation, you would:
        // 1. Create a Whop checkout session via their API
        // 2. Pass customer email and metadata
        // 3. Return the checkout URL

        // For now, we'll create a mock checkout URL
        // Replace this with actual Whop API call when you have the API key

        if (!env.WHOP_API_KEY) {
            return NextResponse.json(
                {
                    error: "Whop API key not configured",
                    message: "Please add WHOP_API_KEY to environment variables",
                },
                { status: 503 }
            );
        }

        // Mock checkout URL - replace with actual Whop API integration
        const checkoutUrl = `https://whop.com/checkout?credits=${credits}&price=${price}&email=${profile.email}&customer_id=${profile.whop_customer_id || ""}`;

        // Log the checkout creation
        console.log(`[Payments] Checkout created for user ${user.id}: ${credits} credits for $${price}`);

        return NextResponse.json({
            success: true,
            checkoutUrl,
            credits,
            price,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[Payments] Checkout creation error:", errorMessage);
        return NextResponse.json(
            { error: "Failed to create checkout", details: errorMessage },
            { status: 500 }
        );
    }
}
