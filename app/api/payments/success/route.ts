import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.redirect(
                new URL("/dashboard/promo-marketplace?error=missing_session", request.url)
            );
        }

        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL("/auth/signin", request.url));
        }

        // Log successful payment
        console.log(`[Payments] Payment successful for user ${user.id}, session: ${sessionId}`);

        // Redirect to promo marketplace with success message
        return NextResponse.redirect(
            new URL("/dashboard/promo-marketplace?payment=success", request.url)
        );
    } catch (error) {
        console.error("[Payments] Success callback error:", error);
        return NextResponse.redirect(
            new URL("/dashboard/promo-marketplace?error=callback_failed", request.url)
        );
    }
}
