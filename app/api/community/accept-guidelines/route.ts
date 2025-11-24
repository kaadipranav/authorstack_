import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
    try {
        const session = await requireAuth();
        const supabase = await createClient();

        // Update author profile with guidelines acceptance timestamp
        const { error } = await supabase
            .from("author_profiles")
            .update({ guidelines_accepted_at: new Date().toISOString() })
            .eq("profile_id", session.id);

        if (error) {
            console.error("Error accepting guidelines:", error);
            return NextResponse.json(
                { error: "Failed to accept guidelines" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in accept-guidelines API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
